import { GoogleGenAI } from '@google/genai';

export interface KeyTestRequestBody {
  provider: 'alibaba-grok' | 'gemini' | 'openrouter';
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { provider } = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as KeyTestRequestBody;

  // Read keys from server-side environment variables only
  let cleanKey = '';
  if (provider === 'gemini') {
    cleanKey = process.env.GEMINI_API_KEY || '';
  } else if (provider === 'alibaba-grok') {
    cleanKey = process.env.ALIBABA_GROK_API_KEY || '';
  } else if (provider === 'openrouter') {
    cleanKey = process.env.OPENROUTER_API_KEY || '';
  }

  if (!cleanKey) {
    return res.status(200).json({
      provider,
      status: 'no-key',
      latencyMs: 0,
      message: `No API key configured. Add ${provider === 'gemini' ? 'GEMINI_API_KEY' : provider === 'alibaba-grok' ? 'ALIBABA_GROK_API_KEY' : 'OPENROUTER_API_KEY'} to your Vercel environment variables.`
    });
  }

  const startTime = Date.now();

  try {
    if (provider === 'gemini') {
      const ai = new GoogleGenAI({ apiKey: cleanKey });
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: 'hi' }] }],
        config: { maxOutputTokens: 1 }
      });

      const latencyMs = Date.now() - startTime;
      if (result && (result.text || result.usageMetadata)) {
        return res.status(200).json({
          provider: 'gemini',
          providerName: 'Google Gemini AI',
          status: 'success',
          latencyMs,
          message: `Server key OK (${latencyMs}ms)`,
          modelInfo: 'gemini-2.5-flash'
        });
      }
      throw new Error('No content returned from Gemini test.');
    }

    if (provider === 'alibaba-grok') {
      const endpoint = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
      const apiRes = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cleanKey}`,
          'X-DashScope-SSE': 'disable'
        },
        body: JSON.stringify({
          model: 'qwen-max',
          messages: [{ role: 'user', content: 'hi' }],
          max_tokens: 1
        })
      });

      const latencyMs = Date.now() - startTime;

      if (apiRes.status === 401 || apiRes.status === 403) {
        return res.status(200).json({
          provider: 'alibaba-grok',
          providerName: 'Alibaba Grok (Qwen)',
          status: 'error',
          latencyMs,
          message: `Authentication Failed (HTTP ${apiRes.status}): Invalid API Key.`
        });
      }

      if (!apiRes.ok) {
        const errText = await apiRes.text();
        return res.status(200).json({
          provider: 'alibaba-grok',
          providerName: 'Alibaba Grok (Qwen)',
          status: 'error',
          latencyMs,
          message: `Server Error (HTTP ${apiRes.status}): ${errText.slice(0, 100)}`
        });
      }

      return res.status(200).json({
        provider: 'alibaba-grok',
        providerName: 'Alibaba Grok (Qwen)',
        status: 'success',
        latencyMs,
        message: `Server key OK (${latencyMs}ms)`,
        modelInfo: 'qwen-max'
      });
    }

    if (provider === 'openrouter') {
      const apiRes = await fetch('https://openrouter.ai/api/v1/auth/key', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${cleanKey}`,
          'HTTP-Referer': 'https://wise-house-of-wise.app',
          'X-Title': 'Wise AI Chat Backend'
        }
      });

      const latencyMs = Date.now() - startTime;

      if (apiRes.ok) {
        const data: any = await apiRes.json();
        const label = data.data?.label || 'OpenRouter Key';
        return res.status(200).json({
          provider: 'openrouter',
          providerName: 'OpenRouter AI',
          status: 'success',
          latencyMs,
          message: `Server key OK: ${label} (${latencyMs}ms)`,
          modelInfo: 'deepseek/deepseek-chat'
        });
      }

      return res.status(200).json({
        provider: 'openrouter',
        providerName: 'OpenRouter AI',
        status: 'error',
        latencyMs,
        message: `Authentication Failed (HTTP ${apiRes.status}): Invalid Key.`
      });
    }

    return res.status(400).json({
      provider,
      status: 'error',
      latencyMs: Date.now() - startTime,
      message: 'Unknown provider.'
    });
  } catch (err: any) {
    return res.status(500).json({
      provider,
      status: 'error',
      latencyMs: Date.now() - startTime,
      message: `Backend Error: ${err.message || String(err)}`
    });
  }
}
