import type { ApiKeys, Message } from '../../../types';

export class OpenRouterError extends Error {
  isRateLimit: boolean;
  constructor(message: string, isRateLimit: boolean = false) {
    super(message);
    this.name = 'OpenRouterError';
    this.isRateLimit = isRateLimit;
  }
}

export async function callOpenRouter(
  messages: Message[],
  systemPrompt: string,
  keys: ApiKeys
): Promise<{ text: string; model: string; tokens?: number }> {
  const apiKey = keys.openrouter || import.meta.env.VITE_OPENROUTER_API_KEY;
  const model = keys.openrouterModel || 'deepseek/deepseek-chat';

  if (!apiKey) {
    throw new OpenRouterError('OpenRouter API Key is not configured in settings', false);
  }

  const formattedMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map(m => ({
      role: m.role,
      content: m.content
    }))
  ];

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://wise-house-of-wise.app',
        'X-Title': 'Wise AI Chat'
      },
      body: JSON.stringify({
        model,
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 2500
      })
    });

    if (response.status === 429) {
      throw new OpenRouterError('OpenRouter API rate limit reached (HTTP 429)', true);
    }

    if (!response.ok) {
      const errText = await response.text();
      throw new OpenRouterError(`OpenRouter API returned HTTP ${response.status}: ${errText}`, response.status === 429);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      throw new OpenRouterError('Empty response from OpenRouter API');
    }

    return {
      text: reply,
      model: data.model || model,
      tokens: data.usage?.total_tokens || undefined
    };
  } catch (err: any) {
    if (err instanceof OpenRouterError) {
      throw err;
    }
    throw new OpenRouterError(`OpenRouter Connection Failed: ${err.message || String(err)}`);
  }
}
