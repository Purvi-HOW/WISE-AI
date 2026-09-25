export type ProviderId = 'alibaba-grok' | 'gemini' | 'openrouter';

export type FallbackStrategy = 
  | 'auto' 
  | 'sequential-rotation'
  | 'alibaba-grok-only' 
  | 'gemini-only' 
  | 'openrouter-only';

export interface KeyTestStatus {
  status: 'untested' | 'testing' | 'valid' | 'invalid';
  latencyMs?: number;
  lastTested?: string;
  message?: string;
}

export interface ApiKeys {
  alibabaGrok: string;
  gemini: string;
  openrouter: string;
  alibabaEndpoint?: string;
  openrouterModel?: string;
  geminiModel?: string;
  // Multi-key lists for sequential round-robin / key rotation
  grokKeysPool?: string[];
  geminiKeysPool?: string[];
  openrouterKeysPool?: string[];
  // Active rotation tracker index
  rotationIndex?: number;
  // Test statuses per key
  testStatuses?: Record<string, KeyTestStatus>;
}

export interface ProviderStatusInfo {
  id: ProviderId;
  name: string;
  status: 'available' | 'rate-limited' | 'error' | 'no-key';
  latencyMs?: number;
  lastUsed?: string;
  icon: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: 'code' | 'text' | 'image';
  content: string;
  size: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  providerUsed?: ProviderId;
  providerName?: string;
  modelUsed?: string;
  latencyMs?: number;
  tokensUsed?: number;
  fallbackTriggered?: boolean;
  fallbackChain?: ProviderId[];
  isError?: boolean;
  thinking?: string;
  attachments?: Attachment[];
  keyUsedLabel?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  systemPromptPreset?: string;
  tags?: string[];
  isPinned?: boolean;
}

export interface StudentPreset {
  id: string;
  title: string;
  category: 'Coding' | 'Algorithms' | 'Debugging' | 'Math & Logic' | 'System Design';
  prompt: string;
  icon: string;
  description: string;
}
