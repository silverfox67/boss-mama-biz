export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { email, name, product } = await request.json();

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // BREVO_API_KEY must be set in Cloudflare Pages environment variables
    const brevoApiKey = env.BREVO_API_KEY;
    // BREVO_LIST_ID is the contact list ID in Brevo
    const brevoListId = parseInt(env.BREVO_LIST_ID || '2'); // Default fallback list ID

    if (!brevoApiKey) {
      console.error('Missing BREVO_API_KEY environment variable');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Call Brevo Contacts API
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': brevoApiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        listIds: [brevoListId],
        updateEnabled: true,
        attributes: {
          FIRSTNAME: name || '',
          LAST_PRODUCT_INTEREST: product || ''
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
