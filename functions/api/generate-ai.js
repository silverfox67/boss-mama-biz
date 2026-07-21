/* ============================================
   TRIDENT FLOW AI — OPENAI SERVERLESS ENDPOINT
   functions/api/generate-ai.js
   ============================================ */

export async function onRequestPost(context) {
    const { request, env } = context;

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    try {
        const body = await request.json();
        const apiKey = env.OPENAI_API_KEY || process?.env?.OPENAI_API_KEY;

        if (!apiKey || apiKey.includes('your_openai_api_key_here')) {
            return new Response(JSON.stringify({ 
                error: "Missing OpenAI API Key",
                fallback: true,
                message: "OpenAI API key not configured in Cloudflare environment. Falling back to local structured generator."
            }), { status: 200, headers: corsHeaders });
        }

        const systemPrompt = body.system || "You are an elite digital product strategist and copywriter for Trident Flow AI. Return strictly valid JSON.";
        const userPrompt = body.prompt || JSON.stringify(body);

        const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey.trim()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.7,
                response_format: { type: "json_object" }
            })
        });

        const data = await openAiResponse.json();

        if (data.error) {
            console.error("OpenAI API Error:", data.error);
            return new Response(JSON.stringify({ error: data.error.message, fallback: true }), { status: 200, headers: corsHeaders });
        }

        const contentStr = data.choices[0].message.content;
        let parsedContent;
        try {
            parsedContent = JSON.parse(contentStr);
        } catch(e) {
            parsedContent = { text: contentStr };
        }

        return new Response(JSON.stringify({
            success: true,
            data: parsedContent,
            usage: data.usage
        }), { status: 200, headers: corsHeaders });

    } catch (err) {
        console.error("Generate AI Endpoint Error:", err);
        return new Response(JSON.stringify({ error: err.message, fallback: true }), { status: 200, headers: corsHeaders });
    }
}

export async function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}
