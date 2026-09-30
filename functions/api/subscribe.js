export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { email, name, product, listId } = await request.json();

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // BREVO_API_KEY must be set in Cloudflare Pages environment variables
    const brevoApiKey = env.BREVO_API_KEY;
    // Default master list ID (List 10: Boss Mama Biz Leads)
    const masterListId = parseInt(env.BREVO_LIST_ID || '10');

    if (!brevoApiKey) {
      console.error('Missing BREVO_API_KEY environment variable');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Determine target lists: Master list + offer-specific list
    const targetListIds = [masterListId];
    if (listId) {
      targetListIds.push(parseInt(listId));
    } else if (product) {
      const p = product.toLowerCase();
      if (p.includes('stacked')) targetListIds.push(11);
      else if (p.includes('boss')) targetListIds.push(12);
      else if (p.includes('facebook') || p.includes('fes')) targetListIds.push(13);
      else if (p.includes('vault') || p.includes('creative')) targetListIds.push(14);
    }
    const finalLists = [...new Set(targetListIds)];

    // Call Brevo Contacts API
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': brevoApiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        listIds: finalLists,
        updateEnabled: true,
        attributes: {
          FIRSTNAME: (name || '').trim(),
          LAST_PRODUCT_INTEREST: (product || '').trim()
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Brevo API Error:', errorData);
      return new Response(JSON.stringify({ error: 'Failed to subscribe to email list' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, message: 'Subscribed successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Subscription worker error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
