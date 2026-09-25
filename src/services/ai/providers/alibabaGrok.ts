import type { ApiKeys, Message } from '../../../types';

export class AlibabaGrokError extends Error {
  isRateLimit: boolean;
  constructor(message: string, isRateLimit: boolean = false) {
    super(message);
    this.name = 'AlibabaGrokError';
    this.isRateLimit = isRateLimit;
  }
}

export async function callAlibabaGrok(
  messages: Message[],
  systemPrompt: string,
  keys: ApiKeys
): Promise<{ text: string; model: string; tokens?: number }> {
  const apiKey = keys.alibabaGrok || import.meta.env.VITE_ALIBABA_GROK_API_KEY;
  const endpoint = keys.alibabaEndpoint || 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
  const model = 'qwen-max';

  if (!apiKey) {
    throw new AlibabaGrokError('Alibaba Grok API Key is not configured in settings', false);
  }

  const formattedMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map(m => ({
      role: m.role,
      content: m.content
    }))
  ];

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-DashScope-SSE': 'disable'
      },
      body: JSON.stringify({
        model,
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 2500
      })
    });

    if (response.status === 429) {
      throw new AlibabaGrokError('Alibaba Grok API rate limit reached (HTTP 429)', true);
    }

    if (!response.ok) {
      const errText = await response.text();
      throw new AlibabaGrokError(`Alibaba Grok API returned HTTP ${response.status}: ${errText}`, response.status === 429);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;
    
    if (!reply) {
      throw new AlibabaGrokError('Empty response from Alibaba Grok API');
    }

    return {
      text: reply,
      model: data.model || model,
      tokens: data.usage?.total_tokens || undefined
    };
  } catch (err: any) {
    if (err instanceof AlibabaGrokError) {
      throw err;
    }
    throw new AlibabaGrokError(`Alibaba Grok Connection Failed: ${err.message || String(err)}`);
  }
}
