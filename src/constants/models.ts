import type { FallbackStrategy } from '../types';

export interface ModelMode {
  value: FallbackStrategy;
  /** What the main UI shows. */
  label: string;
  /** One line of plain language, no vendor or routing jargon. */
  hint: string;
  /**
   * Advanced modes pin the request to one backend or change how keys are used.
   * They are only ever offered inside Advanced settings.
   */
  advanced: boolean;
}

export const MODEL_MODES: ModelMode[] = [
  {
    value: 'auto',
    label: 'Auto',
    hint: 'Best model selected',
    advanced: false
  },
  {
    value: 'sequential-rotation',
    label: 'Round-robin',
    hint: 'Cycle through every configured key, one per prompt',
    advanced: true
  },
  {
    value: 'alibaba-grok-only',
    label: 'Alibaba Grok',
    hint: 'Pin every request to Qwen-Max via Alibaba',
    advanced: true
  },
  {
    value: 'gemini-only',
    label: 'Google Gemini',
    hint: 'Pin every request to Gemini',
    advanced: true
  },
  {
    value: 'openrouter-only',
    label: 'OpenRouter',
    hint: 'Pin every request to the OpenRouter pool',
    advanced: true
  }
];

export const AUTO_MODE = MODEL_MODES[0];

export function getModelMode(strategy: FallbackStrategy): ModelMode {
  return MODEL_MODES.find(m => m.value === strategy) || AUTO_MODE;
}
