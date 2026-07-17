// ============================================
// BOSS MAMA BIZ — Get Leads API Worker
// functions/api/get-leads.js
// Fetches contact list from Brevo list 10 dynamically
// ============================================

export async function onRequestGet(context) {
    try {
        const { env } = context;
        const brevoApiKey = env.BREVO_API_KEY;
        const brevoListId = parseInt(env.BREVO_LIST_ID || '10');

        if (!brevoApiKey) {
            return new Response(JSON.stringify({ error: 'Missing BREVO_API_KEY' }), {
                status: 500,
                headers: { 
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-store'
                },
            });
        }

        // Call Brevo List Contacts API (limit to 50 contacts)
        const response = await fetch(`https://api.brevo.com/v3/contacts/lists/${brevoListId}/contacts?limit=50&offset=0`, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'api-key': brevoApiKey,
            },
        });

        if (!response.ok) {
            const err = await response.json();
            console.error('Brevo API error fetching list:', err);
            return new Response(JSON.stringify({ error: 'Failed to fetch from Brevo', details: err }), {
                status: response.status,
                headers: { 
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-store'
                },
            });
        }

        const data = await response.json();

        // Map contacts to a simple clean payload
        const leads = (data.contacts || []).map(contact => {
            const signupDate = contact.modifiedAt || contact.createdAt;
            return {
                email: contact.email || '',
                name: contact.attributes?.FIRSTNAME || '',
                product: contact.attributes?.LAST_PRODUCT_INTEREST || 'The Creative Content Vault',
                date: signupDate ? new Date(signupDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                }) : '—'
            };
        });

        return new Response(JSON.stringify({ leads, count: data.count || leads.length }), {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store'
            },
        });

    } catch (err) {
        console.error('get-leads worker crash:', err);
        return new Response(JSON.stringify({ error: 'Internal server error', details: err.message }), {
            status: 500,
            headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store'
            },
        });
    }
}
