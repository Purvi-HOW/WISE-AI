import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Check,
  RefreshCw,
  AlertCircle,
  Plus,
  Trash2,
  Play,
  ShieldCheck
} from 'lucide-react';
import type { ApiKeys, FallbackStrategy, ProviderId } from '../types';
import { testApiKey, type KeyTestResult } from '../services/ai/keyTesterService';
import { WiseMark } from './brand/WiseLogo';

interface QuickKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeys: ApiKeys;
  onSaveKeys: (keys: ApiKeys) => void;
  fallbackStrategy: FallbackStrategy;
  onSaveStrategy: (strategy: FallbackStrategy) => void;
}

interface ProviderTab {
  id: ProviderId;
  label: string;
  primaryField: keyof ApiKeys;
  poolField: 'grokKeysPool' | 'geminiKeysPool' | 'openrouterKeysPool';
  placeholder: string;
}

const PROVIDER_TABS: ProviderTab[] = [
  { id: 'gemini', label: 'Google Gemini', primaryField: 'gemini', poolField: 'geminiKeysPool', placeholder: 'AIzaSy…' },
  { id: 'alibaba-grok', label: 'Alibaba Grok', primaryField: 'alibabaGrok', poolField: 'grokKeysPool', placeholder: 'sk-…' },
  { id: 'openrouter', label: 'OpenRouter', primaryField: 'openrouter', poolField: 'openrouterKeysPool', placeholder: 'sk-or-v1-…' }
];

const BRAND_CONFETTI = ['#F7B88C', '#E88AA6', '#C56BC4', '#8B7BD8'];

export const QuickKeyModal: React.FC<QuickKeyModalProps> = ({
  isOpen,
  onClose,
  apiKeys,
  onSaveKeys,
  fallbackStrategy,
  onSaveStrategy
}) => {
  const [keys, setKeys] = useState<ApiKeys>(apiKeys);
  const [strategy, setStrategy] = useState<FallbackStrategy>(fallbackStrategy);
  const [activeTab, setActiveTab] = useState<ProviderId>('gemini');

  const [testingKeyId, setTestingKeyId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, KeyTestResult>>({});
  const [isBatchTesting, setIsBatchTesting] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);

  if (!isOpen) return null;

  const tab = PROVIDER_TABS.find(t => t.id === activeTab)!;
  const pool = keys[tab.poolField] || [];

  const handleTestKey = async (provider: ProviderId, keyId: string) => {
    setTestingKeyId(keyId);
    const result = await testApiKey(provider);

    setTestResults(prev => ({ ...prev, [keyId]: result }));
    setTestingKeyId(null);

    if (result.status === 'success') {
      confetti({ particleCount: 40, spread: 55, origin: { y: 0.6 }, colors: BRAND_CONFETTI });
    }
  };

  const handleBatchTestAll = async () => {
    setIsBatchTesting(true);
    const resultsMap: Record<string, KeyTestResult> = {};
    let successCount = 0;

    for (const item of PROVIDER_TABS) {
      const keyId = `${item.id}-main`;
      setTestingKeyId(keyId);
      const res = await testApiKey(item.id);
      resultsMap[keyId] = res;
      if (res.status === 'success') successCount++;
    }

    setTestResults(prev => ({ ...prev, ...resultsMap }));
    setTestingKeyId(null);
    setIsBatchTesting(false);

    if (successCount > 0) {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 }, colors: BRAND_CONFETTI });
    }
  };

  const handleSave = () => {
    onSaveKeys(keys);
    onSaveStrategy(strategy);
    setSavedBanner(true);
    setTimeout(() => {
      setSavedBanner(false);
      onClose();
    }, 700);
  };

  const updatePoolKey = (index: number, value: string) => {
    const next = [...pool];
    next[index] = value;
    setKeys({ ...keys, [tab.poolField]: next });
  };

  const addPoolKey = () => {
    setKeys({ ...keys, [tab.poolField]: [...pool, ''] });
  };

  const removePoolKey = (index: number) => {
    setKeys({ ...keys, [tab.poolField]: pool.filter((_, i) => i !== index) });
  };

  const renderResult = (keyId: string) => {
    const result = testResults[keyId];
    if (!result) return null;
    return (
      <p className={`flex items-center gap-2 text-[12px] px-1 ${
        result.status === 'success' ? 'text-emerald-300' : 'text-rose-300'
      }`}>
        {result.status === 'success'
          ? <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
        <span>{result.message}</span>
      </p>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-lg">
      <div className="wise-dialog relative w-full max-w-xl max-h-[86vh] flex flex-col rounded-[26px] overflow-hidden wise-fade-in">

        <div className="flex items-center justify-between gap-4 px-7 pt-6 pb-5">
          <div className="flex items-center gap-3 min-w-0">
            <WiseMark className="h-6" />
            <div className="min-w-0">
              <h2 className="font-display text-[17px] font-semibold tracking-tight text-ink">
                Key pools and rotation
              </h2>
              <p className="text-[12px] text-ink-muted mt-0.5">
                Backup keys let Wise AI spread usage and survive rate limits
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-ink-muted hover:text-ink rounded-xl hover:bg-white/[0.06] transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="w-[18px] h-[18px]" />
          </button>
        </div>

        <div className="flex items-center gap-1 px-7 pb-4">
          {PROVIDER_TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3.5 py-2 rounded-xl text-[13px] font-medium transition-colors ${
                activeTab === t.id
                  ? 'bg-white/[0.08] text-ink'
                  : 'text-ink-muted hover:text-ink hover:bg-white/[0.04]'
              }`}
            >
              {t.label}
            </button>
          ))}

          <button
            onClick={handleBatchTestAll}
            disabled={isBatchTesting}
            className="ml-auto flex items-center gap-2 px-3.5 py-2 rounded-xl text-[12px] font-medium text-ink-muted hover:text-ink wise-panel-flat disabled:opacity-50"
          >
            {isBatchTesting
              ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              : <Play className="w-3.5 h-3.5" />}
            <span>{isBatchTesting ? 'Testing' : 'Test all'}</span>
          </button>
        </div>

        <div className="min-h-0 overflow-y-auto px-7 pb-4 space-y-7">
          {savedBanner && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-accent/[0.12] wise-accent-ring text-[13px] text-ink">
              <Check className="w-4 h-4 text-accent-soft" />
              <span>Keys saved.</span>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[13px] font-medium text-ink-soft">Primary key</span>
              <button
                type="button"
                onClick={() => handleTestKey(tab.id, `${tab.id}-main`)}
                disabled={testingKeyId === `${tab.id}-main`}
                className="flex items-center gap-1.5 text-[12px] text-ink-muted hover:text-ink disabled:opacity-40 transition-colors"
              >
                {testingKeyId === `${tab.id}-main`
                  ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  : <ShieldCheck className="w-3.5 h-3.5" />}
                <span>Test</span>
              </button>
            </div>
            <input
              type="password"
              placeholder={tab.placeholder}
              value={(keys[tab.primaryField] as string) || ''}
              onChange={(e) => setKeys({ ...keys, [tab.primaryField]: e.target.value })}
              className="w-full bg-white/[0.035] text-ink text-[13px] rounded-xl px-4 py-3 border-0 focus:outline-none focus:bg-white/[0.06] font-mono placeholder-ink-faint transition-colors"
            />
            {renderResult(`${tab.id}-main`)}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[13px] font-medium text-ink-soft">Backup keys</span>
              <button
                type="button"
                onClick={addPoolKey}
                className="flex items-center gap-1.5 text-[12px] text-ink-muted hover:text-ink transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add key</span>
              </button>
            </div>

            {pool.length === 0 && (
              <p className="text-[12px] text-ink-faint px-1">
                No backup keys for {tab.label} yet.
              </p>
            )}

            {pool.map((poolKey, idx) => {
              const keyId = `${tab.id}-pool-${idx}`;
              return (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[12px] text-ink-muted">Backup {idx + 1}</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleTestKey(tab.id, keyId)}
                        disabled={testingKeyId === keyId || !poolKey}
                        className="text-[12px] text-ink-muted hover:text-ink disabled:opacity-40 transition-colors"
                      >
                        Test
                      </button>
                      <button
                        type="button"
                        onClick={() => removePoolKey(idx)}
                        className="text-ink-faint hover:text-rose-300 transition-colors"
                        aria-label={`Remove backup key ${idx + 1}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <input
                    type="password"
                    placeholder={tab.placeholder}
                    value={poolKey}
                    onChange={(e) => updatePoolKey(idx, e.target.value)}
                    className="w-full bg-white/[0.035] text-ink text-[13px] rounded-xl px-4 py-3 border-0 focus:outline-none focus:bg-white/[0.06] font-mono placeholder-ink-faint transition-colors"
                  />
                  {renderResult(keyId)}
                </div>
              );
            })}
          </div>

          <div className="space-y-2">
            <span className="block text-[13px] font-medium text-ink-soft px-1">Rotation</span>

            <label className={`flex items-start gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-colors ${
              strategy === 'sequential-rotation' ? 'bg-accent/[0.12] wise-accent-ring' : 'hover:bg-white/[0.04]'
            }`}>
              <input
                type="radio"
                name="rotationMode"
                checked={strategy === 'sequential-rotation'}
                onChange={() => setStrategy('sequential-rotation')}
                className="mt-1 accent-[#B86AD9]"
              />
              <span>
                <span className="block text-[13px] font-medium text-ink">Round-robin</span>
                <span className="block text-[12px] text-ink-muted mt-0.5">
                  Step to the next key in the pool on every prompt
                </span>
              </span>
            </label>

            <label className={`flex items-start gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-colors ${
              strategy === 'auto' ? 'bg-accent/[0.12] wise-accent-ring' : 'hover:bg-white/[0.04]'
            }`}>
              <input
                type="radio"
                name="rotationMode"
                checked={strategy === 'auto'}
                onChange={() => setStrategy('auto')}
                className="mt-1 accent-[#B86AD9]"
              />
              <span>
                <span className="block text-[13px] font-medium text-ink">Auto</span>
                <span className="block text-[12px] text-ink-muted mt-0.5">
                  Stay on the primary key, fall through only on failure
                </span>
              </span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-7 py-5">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-[13px] text-ink-muted hover:text-ink rounded-xl hover:bg-white/[0.05] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl text-[13px] font-medium wise-send"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
