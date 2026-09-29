import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  Sparkles,
  KeyRound,
  Check
} from 'lucide-react';
import type { ApiKeys, FallbackStrategy, ProviderId } from '../types';
import { SYSTEM_PROMPT_DEFAULT } from '../constants/presets';
import { MODEL_MODES, getModelMode } from '../constants/models';
import { testApiKey, type KeyTestResult } from '../services/ai/keyTesterService';
import { WiseMark } from './brand/WiseLogo';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeys: ApiKeys;
  onSaveKeys: (keys: ApiKeys) => void;
  fallbackStrategy: FallbackStrategy;
  onSaveStrategy: (s: FallbackStrategy) => void;
  systemPrompt: string;
  onSaveSystemPrompt: (prompt: string) => void;
  advancedMode: boolean;
  onSaveAdvancedMode: (on: boolean) => void;
  onOpenQuickKeyModal?: () => void;
}

const CREDENTIALS: { provider: ProviderId; label: string; field: keyof ApiKeys; placeholder: string }[] = [
  { provider: 'gemini', label: 'Google Gemini', field: 'gemini', placeholder: 'AIzaSy…' },
  { provider: 'alibaba-grok', label: 'Alibaba Grok', field: 'alibabaGrok', placeholder: 'sk-…' },
  { provider: 'openrouter', label: 'OpenRouter', field: 'openrouter', placeholder: 'sk-or-v1-…' }
];

const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string }> = ({
  checked,
  onChange,
  label
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={`relative w-10 h-6 rounded-full shrink-0 transition-colors ${
      checked ? 'bg-accent' : 'bg-white/[0.1]'
    }`}
  >
    <span
      className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-ink transition-transform ${
        checked ? 'translate-x-4' : 'translate-x-0'
      }`}
    />
  </button>
);

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKeys,
  onSaveKeys,
  fallbackStrategy,
  onSaveStrategy,
  systemPrompt,
  onSaveSystemPrompt,
  advancedMode,
  onSaveAdvancedMode,
  onOpenQuickKeyModal
}) => {
  const [keys, setKeys] = useState<ApiKeys>(apiKeys);
  const [strategy, setStrategy] = useState<FallbackStrategy>(fallbackStrategy);
  const [prompt, setPrompt] = useState<string>(systemPrompt);
  const [showDetails, setShowDetails] = useState<boolean>(advancedMode);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, KeyTestResult>>({});

  if (!isOpen) return null;

  const activeMode = getModelMode(strategy);

  const handleSave = (e: React.SyntheticEvent) => {
    e.preventDefault();
    onSaveKeys(keys);
    onSaveStrategy(strategy);
    onSaveSystemPrompt(prompt);
    onSaveAdvancedMode(showDetails);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 700);
  };

  const handleLiveTest = async (provider: ProviderId) => {
    setTestingProvider(provider);
    const res = await testApiKey(provider);
    setTestResults(prev => ({ ...prev, [provider]: res }));
    setTestingProvider(null);

    if (res.status === 'success') {
      confetti({
        particleCount: 40,
        spread: 55,
        origin: { y: 0.6 },
        colors: ['#F7B88C', '#E88AA6', '#C56BC4', '#8B7BD8']
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-lg">
      <div className="wise-dialog relative w-full max-w-lg max-h-[86vh] flex flex-col rounded-[26px] overflow-hidden wise-fade-in">
        <div className="flex items-center justify-between px-7 pt-6 pb-5">
          <div className="flex items-center gap-3">
            <WiseMark className="h-6" />
            <h2 className="font-display text-[17px] font-semibold tracking-tight text-ink">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-ink-muted hover:text-ink rounded-xl hover:bg-white/[0.06] transition-colors"
            aria-label="Close settings"
          >
            <X className="w-[18px] h-[18px]" />
          </button>
        </div>

        <form onSubmit={handleSave} className="min-h-0 overflow-y-auto px-7 pb-2 space-y-8">
          {/* ---- Model: one line, no jargon ---- */}
          <section className="space-y-3">
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
              Model
            </h3>
            <div className="flex items-center gap-3.5 rounded-2xl px-4 py-4 wise-panel-flat">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-accent/[0.14] wise-accent-ring shrink-0">
                <Sparkles className="w-4 h-4 text-accent-soft" />
              </span>
              <div className="min-w-0">
                <p className="text-[14px] font-medium text-ink">{activeMode.label}</p>
                <p className="text-[12px] text-ink-muted mt-0.5">{activeMode.hint}</p>
              </div>
            </div>
            <p className="text-[12px] leading-relaxed text-ink-faint px-1">
              Wise AI picks the strongest model available for each message. Change this under Advanced settings.
            </p>
          </section>

          {/* ---- System instructions ---- */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
                Instructions
              </h3>
              <button
                type="button"
                onClick={() => setPrompt(SYSTEM_PROMPT_DEFAULT)}
                className="text-[12px] text-ink-muted hover:text-ink transition-colors"
              >
                Reset to default
              </button>
            </div>
            <textarea
              rows={5}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-white/[0.035] text-ink-soft text-[13px] rounded-2xl p-4 border-0 focus:outline-none focus:bg-white/[0.06] font-mono leading-relaxed transition-colors resize-none"
            />
            <p className="text-[12px] text-ink-faint px-1">
              How Wise AI should answer you. Persists across every conversation.
            </p>
          </section>

          {/* ---- Everything technical lives behind this door ---- */}
          <section className="space-y-4 pb-2">
            <button
              type="button"
              onClick={() => setAdvancedOpen(o => !o)}
              className="w-full flex items-center justify-between py-2 group"
            >
              <span className="flex flex-col items-start">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-faint group-hover:text-ink-muted transition-colors">
                  Advanced settings
                </span>
                <span className="text-[12px] text-ink-faint mt-1.5">
                  Model routing, fallback order, keys, and rotation
                </span>
              </span>
              <ChevronDown
                className={`w-4 h-4 text-ink-muted transition-transform ${advancedOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {advancedOpen && (
              <div className="space-y-7 pt-1 wise-fade-in">
                {/* Routing mode */}
                <div className="space-y-2">
                  <p className="text-[12px] font-medium text-ink-soft px-1">Routing</p>
                  <div className="space-y-1.5">
                    {MODEL_MODES.map(m => (
                      <label
                        key={m.value}
                        className={`flex items-start gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-colors ${
                          strategy === m.value ? 'bg-accent/[0.12] wise-accent-ring' : 'hover:bg-white/[0.04]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="strategy"
                          value={m.value}
                          checked={strategy === m.value}
                          onChange={() => setStrategy(m.value)}
                          className="mt-1 accent-[#B86AD9]"
                        />
                        <span className="min-w-0">
                          <span className="block text-[13px] font-medium text-ink">{m.label}</span>
                          <span className="block text-[12px] text-ink-muted mt-0.5">{m.hint}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                  <p className="text-[12px] text-ink-faint px-1 pt-1">
                    Auto tries Alibaba Grok, then Google Gemini, then OpenRouter, moving on whenever one is rate limited or errors.
                  </p>
                </div>

                {/* Technical details toggle */}
                <div className="flex items-center justify-between gap-4 px-4 py-3.5 rounded-2xl wise-panel-flat">
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-ink">Show technical details</p>
                    <p className="text-[12px] text-ink-muted mt-0.5">
                      Reveal provider, model, key and latency on each reply
                    </p>
                  </div>
                  <Toggle checked={showDetails} onChange={setShowDetails} label="Show technical details" />
                </div>

                {/* Credentials */}
                <div className="space-y-3">
                  <p className="text-[12px] font-medium text-ink-soft px-1">API keys</p>

                  {CREDENTIALS.map(({ provider, label, field, placeholder }) => {
                    const result = testResults[provider];
                    return (
                      <div key={provider} className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[13px] text-ink-soft">{label}</span>
                          <button
                            type="button"
                            onClick={() => handleLiveTest(provider)}
                            disabled={testingProvider === provider}
                            className="flex items-center gap-1.5 text-[12px] text-ink-muted hover:text-ink disabled:opacity-40 transition-colors"
                          >
                            {testingProvider === provider
                              ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              : <ShieldCheck className="w-3.5 h-3.5" />}
                            <span>Test</span>
                          </button>
                        </div>
                        <input
                          type="password"
                          placeholder={placeholder}
                          value={(keys[field] as string) || ''}
                          onChange={(e) => setKeys({ ...keys, [field]: e.target.value })}
                          className="w-full bg-white/[0.035] text-ink text-[13px] rounded-xl px-4 py-3 border-0 focus:outline-none focus:bg-white/[0.06] font-mono placeholder-ink-faint transition-colors"
                        />
                        {result && (
                          <p className={`flex items-center gap-2 text-[12px] px-1 ${
                            result.status === 'success' ? 'text-emerald-300' : 'text-rose-300'
                          }`}>
                            {result.status === 'success'
                              ? <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                              : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                            <span>{result.message}</span>
                          </p>
                        )}
                      </div>
                    );
                  })}

                  {onOpenQuickKeyModal && (
                    <button
                      type="button"
                      onClick={() => { onClose(); onOpenQuickKeyModal(); }}
                      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl wise-panel-flat text-left"
                    >
                      <KeyRound className="w-4 h-4 text-ink-muted shrink-0" />
                      <span className="flex-1 min-w-0">
                        <span className="block text-[13px] font-medium text-ink">Key pools and rotation</span>
                        <span className="block text-[12px] text-ink-muted mt-0.5">
                          Add backup keys and test them in bulk
                        </span>
                      </span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>
        </form>

        <div className="flex items-center justify-between gap-3 px-7 py-5 mt-auto">
          <span className="font-display text-[10px] uppercase tracking-[0.18em] text-ink-faint">
            House of Wise
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-[13px] text-ink-muted hover:text-ink rounded-xl hover:bg-white/[0.05] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-medium wise-send"
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : null}
              <span>{savedSuccess ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
