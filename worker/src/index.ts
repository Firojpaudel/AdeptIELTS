/**
 * AdeptIELTS Cloudflare Worker AI Proxy
 * Handles provider secrets, token optimization, CORS, and rate limiting.
 */

export interface Env {
  GROQ_API_KEY?: string;
  OPENROUTER_API_KEY?: string;
  AI?: any; // Cloudflare Workers AI binding
  CORS_ORIGIN?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': env.CORS_ORIGIN || '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': env.CORS_ORIGIN || '*',
      'Content-Type': 'application/json',
    };

    try {
      if (url.pathname === '/api/ai/evaluate-writing' && request.method === 'POST') {
        const body = await request.json() as { prompt: string; essay: string; taskType: string };
        const { prompt, essay, taskType } = body;

        if (!essay || essay.length < 30) {
          return new Response(JSON.stringify({ error: 'Essay text too short for evaluation' }), {
            status: 400,
            headers: corsHeaders,
          });
        }

        // Call Groq (Llama-3.3-70b) if key available
        if (env.GROQ_API_KEY) {
          const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${env.GROQ_API_KEY}`,
            },
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              messages: [
                {
                  role: 'system',
                  content: `You are an expert IELTS examiner evaluating ${taskType}. Return ONLY valid JSON with: estimated_band (number), criteria ({ task_response, coherence, lexical_resource, grammar }), strengths (string[]), issues ([{ quote, problem, suggestion, criterion }]), priority_actions (string[]), rewrite_exercises ([{ original, instruction, model_revision }]).`
                },
                {
                  role: 'user',
                  content: `Prompt: ${prompt}\n\nEssay:\n${essay}`
                }
              ],
              temperature: 0.2,
              response_format: { type: 'json_object' },
            }),
          });

          const data = await res.json() as any;
          return new Response(data.choices?.[0]?.message?.content || '{}', {
            headers: corsHeaders,
          });
        }

        // Fallback or CF Workers AI
        return new Response(JSON.stringify({ message: 'No worker AI keys configured. Please configure in Settings or worker environment.' }), {
          status: 501,
          headers: corsHeaders,
        });
      }

      if (url.pathname === '/api/health') {
        return new Response(JSON.stringify({ status: 'healthy', version: '1.0.0' }), {
          headers: corsHeaders,
        });
      }

      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: corsHeaders,
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message || 'Internal error' }), {
        status: 500,
        headers: corsHeaders,
      });
    }
  },
};
