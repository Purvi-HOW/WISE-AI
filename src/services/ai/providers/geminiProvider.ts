import { GoogleGenAI } from '@google/genai';
import type { ApiKeys, Message } from '../../../types';

export class GeminiError extends Error {
  isRateLimit: boolean;
  constructor(message: string, isRateLimit: boolean = false) {
    super(message);
    this.name = 'GeminiError';
    this.isRateLimit = isRateLimit;
  }
}

export async function callGemini(
  messages: Message[],
  systemPrompt: string,
  keys: ApiKeys
): Promise<{ text: string; model: string; tokens?: number }> {
  const apiKey = keys.gemini || import.meta.env.VITE_GEMINI_API_KEY;
  const modelName = keys.geminiModel || 'gemini-2.5-flash';

  if (!apiKey) {
    throw new GeminiError('Gemini API Key is not configured in settings', false);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
        maxOutputTokens: 2500
      }
    });

    const text = response.text;

    if (!text) {
      throw new GeminiError('Empty content returned from Gemini API');
    }

    return {
      text: text,
      model: modelName,
      tokens: response.usageMetadata?.totalTokenCount || undefined
    };
  } catch (err: any) {
    const msg = err.message || String(err);
    const isLimit = msg.toLowerCase().includes('rate limit') || msg.includes('429') || msg.toLowerCase().includes('quota');
    throw new GeminiError(`Gemini API Error: ${msg}`, isLimit);
  }
}
