import { GoogleGenAI } from '@google/genai';

export type ProviderId = 'alibaba-grok' | 'gemini' | 'openrouter';
export type FallbackStrategy = 'auto' | 'sequential-rotation' | 'alibaba-grok-only' | 'gemini-only' | 'openrouter-only';

export interface ChatRequestBody {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  systemPrompt?: string;
  strategy?: FallbackStrategy;
}

function getKeysForProvider(provider: ProviderId): string[] {
  const pool: string[] = [];

  if (provider === 'alibaba-grok') {
    if (process.env.ALIBABA_GROK_API_KEY) pool.push(process.env.ALIBABA_GROK_API_KEY);
  } else if (provider === 'gemini') {
    if (process.env.GEMINI_API_KEY) pool.push(process.env.GEMINI_API_KEY);
  } else if (provider === 'openrouter') {
    if (process.env.OPENROUTER_API_KEY) pool.push(process.env.OPENROUTER_API_KEY);
  }
  return pool;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as ChatRequestBody;
  const { messages, systemPrompt = '', strategy = 'auto' } = body;
  const startTime = Date.now();
  const fallbackChain: ProviderId[] = [];

  // Default order: Gemini first (free tier), then Alibaba Grok, then OpenRouter
  let targetProviders: ProviderId[] = ['gemini', 'alibaba-grok', 'openrouter'];

  if (strategy === 'alibaba-grok-only') {
    targetProviders = ['alibaba-grok'];
  } else if (strategy === 'gemini-only') {
    targetProviders = ['gemini'];
  } else if (strategy === 'openrouter-only') {
    targetProviders = ['openrouter'];
  } else if (strategy === 'sequential-rotation') {
    const baseList: ProviderId[] = ['gemini', 'alibaba-grok', 'openrouter'];
    targetProviders = baseList;
  }

  for (let i = 0; i < targetProviders.length; i++) {
    const provider = targetProviders[i];
    fallbackChain.push(provider);
    const isFallback = i > 0;

    const availableKeys = getKeysForProvider(provider);

    if (availableKeys.length === 0) {
      continue;
    }

    for (let kIdx = 0; kIdx < availableKeys.length; kIdx++) {
      const activeKey = availableKeys[kIdx];

      try {
        if (provider === 'alibaba-grok') {
          const endpoint = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
          const formattedMessages = [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({ role: m.role, content: m.content }))
          ];

          const apiRes = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${activeKey}`,
              'X-DashScope-SSE': 'disable'
            },
            body: JSON.stringify({
              model: 'qwen-max',
              messages: formattedMessages,
              temperature: 0.7,
              max_tokens: 2500
            })
          });

          if (!apiRes.ok) {
            const errText = await apiRes.text();
            throw new Error(`Alibaba Grok HTTP ${apiRes.status}: ${errText}`);
          }

          const data: any = await apiRes.json();
          const replyText = data.choices?.[0]?.message?.content;
          if (!replyText) throw new Error('Empty response from Alibaba Grok');

          return res.status(200).json({
            text: replyText,
            providerUsed: 'alibaba-grok',
            providerName: 'Alibaba Grok (Qwen)',
            modelUsed: data.model || 'qwen-max',
            latencyMs: Date.now() - startTime,
            tokensUsed: data.usage?.total_tokens,
            fallbackTriggered: isFallback || kIdx > 0,
            fallbackChain
          });
        }

        if (provider === 'gemini') {
          const modelName = 'gemini-2.5-flash';
          const ai = new GoogleGenAI({ apiKey: activeKey });
          const contents = messages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          }));

          const response = await ai.models.generateContent({
            model: modelName,
            contents,
            config: {
              systemInstruction: systemPrompt,
              temperature: 0.7,
              maxOutputTokens: 2500
            }
          });

          const replyText = response.text;
          if (!replyText) throw new Error('Empty response from Gemini');

          return res.status(200).json({
            text: replyText,
            providerUsed: 'gemini',
            providerName: 'Google Gemini AI',
            modelUsed: modelName,
            latencyMs: Date.now() - startTime,
            tokensUsed: response.usageMetadata?.totalTokenCount,
            fallbackTriggered: isFallback || kIdx > 0,
            fallbackChain
          });
        }

        if (provider === 'openrouter') {
          const modelName = 'deepseek/deepseek-chat';
          const formattedMessages = [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({ role: m.role, content: m.content }))
          ];

          const apiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${activeKey}`,
              'HTTP-Referer': 'https://wise-house-of-wise.app',
              'X-Title': 'Wise AI Chat Backend'
            },
            body: JSON.stringify({
              model: modelName,
              messages: formattedMessages,
              temperature: 0.7,
              max_tokens: 2500
            })
          });

          if (!apiRes.ok) {
            const errText = await apiRes.text();
            throw new Error(`OpenRouter HTTP ${apiRes.status}: ${errText}`);
          }

          const data: any = await apiRes.json();
          const replyText = data.choices?.[0]?.message?.content;
          if (!replyText) throw new Error('Empty response from OpenRouter');

          return res.status(200).json({
            text: replyText,
            providerUsed: 'openrouter',
            providerName: 'OpenRouter AI',
            modelUsed: data.model || modelName,
            latencyMs: Date.now() - startTime,
            tokensUsed: data.usage?.total_tokens,
            fallbackTriggered: isFallback || kIdx > 0,
            fallbackChain
          });
        }
      } catch (err: any) {
        console.warn(`[Backend AI Handler] Provider ${provider} key #${kIdx + 1} failed:`, err.message || String(err));
      }
    }
  }

  // Sandbox fallback response if no keys worked
  const firstAttempted = targetProviders[0] || 'gemini';
  const lastUserMsg = messages.filter(m => m.role === 'user').pop()?.content || 'Hello';
  const sandboxText = `[Wise AI Backend Sandbox]\n\nReceived query: "${lastUserMsg}".\n\nNo live API keys were configured on the server. Please add environment variables (GEMINI_API_KEY, ALIBABA_GROK_API_KEY, or OPENROUTER_API_KEY) in your Vercel project settings.`;

  return res.status(200).json({
    text: sandboxText,
    providerUsed: firstAttempted,
    providerName: `${firstAttempted === 'alibaba-grok' ? 'Alibaba Grok' : firstAttempted === 'gemini' ? 'Gemini' : 'OpenRouter'} (Backend Sandbox)`,
    modelUsed: 'sandbox-mode',
    latencyMs: Date.now() - startTime,
    tokensUsed: 42,
    fallbackTriggered: targetProviders.length > 1,
    fallbackChain
  });
}
