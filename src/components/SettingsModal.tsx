import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  Sliders, 
  ShieldCheck, 
  RefreshCw, 
  AlertCircle
} from 'lucide-react';
import type { ApiKeys, FallbackStrategy, ProviderId } from '../types';
import { SYSTEM_PROMPT_DEFAULT } from '../constants/presets';
import { testApiKey, type KeyTestResult } from '../services/ai/keyTesterService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeys: ApiKeys;
  onSaveKeys: (keys: ApiKeys) => void;
  fallbackStrategy: FallbackStrategy;
  onSaveStrategy: (s: FallbackStrategy) => void;
  systemPrompt: string;
  onSaveSystemPrompt: (prompt: string) => void;
  onOpenQuickKeyModal?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKeys,
  onSaveKeys,
  fallbackStrategy,
  onSaveStrategy,
  systemPrompt,
  onSaveSystemPrompt,
  onOpenQuickKeyModal
}) => {
  const [keys, setKeys] = useState<ApiKeys>(apiKeys);
  const [strategy, setStrategy] = useState<FallbackStrategy>(fallbackStrategy);
  const [prompt, setPrompt] = useState<string>(systemPrompt);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<KeyTestResult | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveKeys(keys);
    onSaveStrategy(strategy);
    onSaveSystemPrompt(prompt);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleLiveTest = async (provider: ProviderId) => {
    setTestingProvider(provider);
    setTestResult(null);

    const res = await testApiKey(provider);
    setTestResult(res);
    setTestingProvider(null);

    if (res.status === 'success') {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-xl max-h-[88vh] flex flex-col bg-[#09090b] border border-zinc-800 rounded-xl shadow-xl text-zinc-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800/80 bg-zinc-950/60">
          <div className="flex items-center space-x-2.5">
            <Sliders className="w-4 h-4 text-zinc-400" />
            <h2 className="text-sm font-semibold text-zinc-100">Settings</h2>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-100 rounded-md hover:bg-zinc-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {testResult && (
            <div className={`p-2.5 rounded-md border flex items-center space-x-2 ${
              testResult.status === 'success' ? 'bg-zinc-900 text-emerald-400 border-zinc-800' : 'bg-zinc-900 text-rose-400 border-zinc-800'
            }`}>
              {testResult.status === 'success' ? <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <label className="font-medium">Execution Strategy</label>
              {onOpenQuickKeyModal && (
                <button
                  type="button"
                  onClick={() => { onClose(); onOpenQuickKeyModal(); }}
                  className="text-zinc-300 hover:text-white underline text-[11px]"
                >
                  Manage API Keys ↗
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <label className={`flex items-start space-x-2 p-2.5 rounded-md border cursor-pointer ${strategy === 'auto' ? 'bg-zinc-900 border-zinc-700 text-zinc-100' : 'bg-zinc-950 border-zinc-800 text-zinc-400'}`}>
                <input type="radio" name="strategy" value="auto" checked={strategy === 'auto'} onChange={() => setStrategy('auto')} className="mt-0.5" />
                <div>
                  <span className="font-medium">3-Tier Fallback</span>
                </div>
              </label>

              <label className={`flex items-start space-x-2 p-2.5 rounded-md border cursor-pointer ${strategy === 'sequential-rotation' ? 'bg-zinc-900 border-zinc-700 text-zinc-100' : 'bg-zinc-950 border-zinc-800 text-zinc-400'}`}>
                <input type="radio" name="strategy" value="sequential-rotation" checked={strategy === 'sequential-rotation'} onChange={() => setStrategy('sequential-rotation')} className="mt-0.5" />
                <div>
                  <span className="font-medium">Round-Robin</span>
                </div>
              </label>

              <label className={`flex items-start space-x-2 p-2.5 rounded-md border cursor-pointer ${strategy === 'gemini-only' ? 'bg-zinc-900 border-zinc-700 text-zinc-100' : 'bg-zinc-950 border-zinc-800 text-zinc-400'}`}>
                <input type="radio" name="strategy" value="gemini-only" checked={strategy === 'gemini-only'} onChange={() => setStrategy('gemini-only')} className="mt-0.5" />
                <div>
                  <span className="font-medium">Gemini Only</span>
                </div>
              </label>
            </div>
          </div>

          <hr className="border-zinc-800/80" />

          <div className="space-y-3">
            <span className="font-medium text-zinc-400 block">Credentials</span>

            {/* Alibaba Grok */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-zinc-300">
                <span>Alibaba Grok</span>
                <button
                  type="button"
                  onClick={() => handleLiveTest('alibaba-grok')}
                  disabled={testingProvider === 'alibaba-grok'}
                  className="text-zinc-400 hover:text-zinc-200 disabled:opacity-40"
                >
                  {testingProvider === 'alibaba-grok' ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Test'}
                </button>
              </div>
              <input
                type="password"
                placeholder="sk-..."
                value={keys.alibabaGrok}
                onChange={(e) => setKeys({ ...keys, alibabaGrok: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs rounded-md px-3 py-2 focus:outline-none focus:border-zinc-600 font-mono"
              />
            </div>

            {/* Google Gemini */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-zinc-300">
                <span>Google Gemini</span>
                <button
                  type="button"
                  onClick={() => handleLiveTest('gemini')}
                  disabled={testingProvider === 'gemini'}
                  className="text-zinc-400 hover:text-zinc-200 disabled:opacity-40"
                >
                  {testingProvider === 'gemini' ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Test'}
                </button>
              </div>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={keys.gemini}
                onChange={(e) => setKeys({ ...keys, gemini: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs rounded-md px-3 py-2 focus:outline-none focus:border-zinc-600 font-mono"
              />
            </div>

            {/* OpenRouter */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-zinc-300">
                <span>OpenRouter</span>
                <button
                  type="button"
                  onClick={() => handleLiveTest('openrouter')}
                  disabled={testingProvider === 'openrouter'}
                  className="text-zinc-400 hover:text-zinc-200 disabled:opacity-40"
                >
                  {testingProvider === 'openrouter' ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Test'}
                </button>
              </div>
              <input
                type="password"
                placeholder="sk-or-v1-..."
                value={keys.openrouter}
                onChange={(e) => setKeys({ ...keys, openrouter: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs rounded-md px-3 py-2 focus:outline-none focus:border-zinc-600 font-mono"
              />
            </div>
          </div>

          <hr className="border-zinc-800/80" />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-zinc-400">
              <label className="font-medium">System Instructions</label>
              <button
                type="button"
                onClick={() => setPrompt(SYSTEM_PROMPT_DEFAULT)}
                className="text-[11px] hover:text-zinc-200 underline"
              >
                Reset
              </button>
            </div>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs rounded-md p-2.5 focus:outline-none focus:border-zinc-600 font-mono leading-relaxed"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-zinc-400 hover:text-zinc-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-zinc-950 bg-zinc-100 hover:bg-white rounded-md font-medium transition-all"
            >
              {savedSuccess ? 'Saved' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
