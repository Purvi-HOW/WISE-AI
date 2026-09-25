import type { FallbackStrategy, Message, ProviderId } from '../../types';

export interface AiResponseResult {
  text: string;
  providerUsed: ProviderId;
  providerName: string;
  modelUsed: string;
  latencyMs: number;
  tokensUsed?: number;
  fallbackTriggered: boolean;
  fallbackChain: ProviderId[];
  keyUsedLabel?: string;
}

/**
 * Sends chat message request to backend server API endpoint /api/chat.
 * API keys are stored server-side only (Vercel env vars) and never sent from frontend.
 */
export async function sendChatMessage(
  messages: Message[],
  systemPrompt: string,
  strategy: FallbackStrategy = 'auto'
): Promise<AiResponseResult> {
  const startTime = Date.now();

  const payload = {
    messages: messages.map(m => ({ role: m.role, content: m.content })),
    systemPrompt,
    strategy
  };

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Backend API Server returned HTTP ${res.status}: ${errText}`);
    }

    const data: AiResponseResult = await res.json();
    return data;
  } catch (err: any) {
    console.warn('[Wise AI Client] Backend call failed, returning fallback message:', err.message || String(err));
    return {
      text: `Backend Error: ${err.message || String(err)}\n\nPlease ensure your Vercel backend API endpoints are deployed and environment variables (GEMINI_API_KEY) are configured.`,
      providerUsed: 'gemini',
      providerName: 'Backend Error',
      modelUsed: 'none',
      latencyMs: Date.now() - startTime,
      fallbackTriggered: false,
      fallbackChain: ['gemini']
    };
  }
}
