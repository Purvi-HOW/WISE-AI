import type { ProviderId } from '../../types';

export interface KeyTestResult {
  provider: ProviderId;
  providerName: string;
  status: 'success' | 'error' | 'no-key';
  latencyMs: number;
  message: string;
  modelInfo?: string;
}

/**
 * Call the backend server API endpoint /api/test-key to test server-side API key validity.
 * Keys are stored on the server only (Vercel env vars), not sent from frontend.
 */
export async function testApiKey(
  provider: ProviderId
): Promise<KeyTestResult> {
  const startTime = Date.now();

  try {
    const res = await fetch('/api/test-key', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ provider })
    });

    const data = await res.json();

    if (data.status === 'no-key') {
      return {
        provider: data.provider || provider,
        providerName: data.providerName || getProviderName(provider),
        status: 'no-key',
        latencyMs: 0,
        message: data.message || 'No API key configured on server.'
      };
    }

    if (res.ok && data.status === 'success') {
      return {
        provider: data.provider || provider,
        providerName: data.providerName || getProviderName(provider),
        status: 'success',
        latencyMs: data.latencyMs || (Date.now() - startTime),
        message: data.message || `Server key test passed (${data.latencyMs}ms)`,
        modelInfo: data.modelInfo
      };
    } else {
      return {
        provider,
        providerName: getProviderName(provider),
        status: 'error',
        latencyMs: data.latencyMs || (Date.now() - startTime),
        message: data.message || `Server key test failed (HTTP ${res.status})`
      };
    }
  } catch (err: any) {
    return {
      provider,
      providerName: getProviderName(provider),
      status: 'error',
      latencyMs: Date.now() - startTime,
      message: `Backend Connection Failed: ${err.message || String(err)}`
    };
  }
}

function getProviderName(provider: ProviderId): string {
  switch (provider) {
    case 'alibaba-grok': return 'Alibaba Grok (Qwen)';
    case 'gemini': return 'Google Gemini AI';
    case 'openrouter': return 'OpenRouter AI';
    default: return provider;
  }
}
