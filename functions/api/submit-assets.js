// ============================================
// BOSS MAMA BIZ — Asset Submission Worker
// functions/api/submit-assets.js
// Sends submitted asset links to kristan@bossmamabiz.com via Brevo transactional email
// ============================================

export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const data = await request.json();

        const brevoApiKey = env.BREVO_API_KEY;

        if (!brevoApiKey) {
            return new Response(JSON.stringify({ error: 'Missing BREVO_API_KEY' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Build HTML email body from submitted data
        const fields = [
            { label: '🆓 Free Roadmap PDF Link',        key: 'roadmap-link' },
            { label: '📝 Free Roadmap Notes',            key: 'roadmap-notes' },
            { label: '💵 $27 Guide Link',                key: 'guide-link' },
            { label: '💵 $27 Stripe Payment Link',       key: 'guide-stripe' },
            { label: '📝 $27 Guide Notes',               key: 'guide-notes' },
            { label: '🎓 $197 Academy Access Link',      key: 'academy-link' },
            { label: '🎓 $197 Stripe Payment Link',      key: 'academy-stripe' },
            { label: '📝 $197 Academy Notes',            key: 'academy-notes' },
            { label: '👑 $597 Boss Suite Link',          key: 'suite-link' },
            { label: '👑 $597 Stripe Payment Link',      key: 'suite-stripe' },
            { label: '📝 $597 Boss Suite Notes',         key: 'suite-notes' },
            { label: '💼 Affiliate Commission Details',  key: 'suite-affiliate' },
            { label: '📸 Headshot Photo Link',           key: 'headshot-link' },
            { label: '💳 Stripe Account Email',          key: 'stripe-email' },
            { label: '📋 Extra Notes',                   key: 'extra-notes' },
        ];

        const rows = fields
            .filter(f => data[f.key] && data[f.key].trim())
            .map(f => `
                <tr>
                    <td style="padding: 10px 16px; border-bottom: 1px solid #2a2520; color: #dfc493; font-weight: bold; font-size: 13px; white-space: nowrap; width: 220px;">${f.label}</td>
                    <td style="padding: 10px 16px; border-bottom: 1px solid #2a2520; color: #f0e8d5; font-size: 13px; word-break: break-all;">${data[f.key]}</td>
                </tr>
            `).join('');

        const htmlBody = `
        <!DOCTYPE html>
        <html>
        <body style="margin:0; padding:0; background:#0d0b0a; font-family: Arial, sans-serif;">
            <div style="max-width: 680px; margin: 0 auto; padding: 40px 20px;">
                <div style="text-align: center; margin-bottom: 32px;">
                    <h1 style="font-size: 22px; letter-spacing: 4px; color: #dfc493; text-transform: uppercase; margin: 0;">BOSS MAMA BIZ</h1>
                    <p style="color: rgba(240,232,213,0.5); font-size: 12px; letter-spacing: 3px; text-transform: uppercase; margin: 6px 0 0;">New Asset Submission</p>
                </div>
                <div style="background: rgba(255,248,232,0.04); border: 1px solid rgba(223,196,147,0.12); border-radius: 16px; overflow: hidden;">
                    <div style="background: rgba(223,196,147,0.08); padding: 16px 20px; border-bottom: 1px solid rgba(223,196,147,0.12);">
                        <p style="margin: 0; color: #dfc493; font-size: 15px; font-weight: bold;">✅ Kristan submitted her product assets!</p>
                        <p style="margin: 4px 0 0; color: rgba(240,232,213,0.5); font-size: 12px;">Received: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} EST</p>
                    </div>
                    <table style="width: 100%; border-collapse: collapse;">
                        ${rows || '<tr><td colspan="2" style="padding:16px; color: rgba(240,232,213,0.5); text-align:center;">No fields were filled in.</td></tr>'}
                    </table>
                </div>
                <p style="text-align:center; color:rgba(240,232,213,0.3); font-size:11px; margin-top:24px;">Boss Mama Biz Dashboard · bossmamabiz.com</p>
            </div>
        </body>
        </html>`;

        // Send via Brevo transactional email
        const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': brevoApiKey,
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                sender: { name: 'Boss Mama Biz Dashboard', email: 'kristan@bossmamabiz.com' },
                to: [{ email: 'kristan@bossmamabiz.com', name: 'Kristan O\'Connor' }],
                subject: '✅ New Asset Submission — Boss Mama Biz Dashboard',
                htmlContent: htmlBody,
            }),
        });

        if (!brevoResponse.ok) {
            const err = await brevoResponse.json();
            console.error('Brevo transactional error:', err);
            return new Response(JSON.stringify({ error: 'Failed to send email', details: err }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ success: true, message: 'Assets submitted and emailed successfully.' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (err) {
        console.error('submit-assets worker error:', err);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
