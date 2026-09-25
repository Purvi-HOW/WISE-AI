import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  Key, 
  Check, 
  RefreshCw, 
  AlertCircle, 
  Plus, 
  Trash2,
  Play,
  RotateCw,
  ShieldCheck
} from 'lucide-react';
import type { ApiKeys, FallbackStrategy, ProviderId } from '../types';
import { testApiKey, type KeyTestResult } from '../services/ai/keyTesterService';

interface QuickKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeys: ApiKeys;
  onSaveKeys: (keys: ApiKeys) => void;
  fallbackStrategy: FallbackStrategy;
  onSaveStrategy: (strategy: FallbackStrategy) => void;
}

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
  const [activeTab, setActiveTab] = useState<ProviderId | 'rotation'>('gemini');
  
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, KeyTestResult>>({});
  const [isBatchTesting, setIsBatchTesting] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);

  if (!isOpen) return null;

  const triggerConfetti = () => {
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.6 }
    });
  };

  const handleTestKey = async (provider: ProviderId, keyId: string) => {
    setTestingProvider(keyId);
    const result = await testApiKey(provider);
    
    setTestResults(prev => ({ ...prev, [keyId]: result }));
    setTestingProvider(null);

    if (result.status === 'success') {
      triggerConfetti();
    }
  };

  const handleBatchTestAll = async () => {
    setIsBatchTesting(true);
    const resultsMap: Record<string, KeyTestResult> = {};
    const providers: { provider: ProviderId; id: string }[] = [
      { provider: 'gemini', id: 'gemini-main' },
      { provider: 'alibaba-grok', id: 'grok-main' },
      { provider: 'openrouter', id: 'openrouter-main' }
    ];

    let successCount = 0;
    for (const item of providers) {
      setTestingProvider(item.id);
      const res = await testApiKey(item.provider);
      resultsMap[item.id] = res;
      if (res.status === 'success') successCount++;
    }

    setTestResults(resultsMap);
    setTestingProvider(null);
    setIsBatchTesting(false);

    if (successCount > 0) {
      triggerConfetti();
    }
  };

  const handleSave = () => {
    onSaveKeys(keys);
    onSaveStrategy(strategy);
    setSavedBanner(true);
    setTimeout(() => {
      setSavedBanner(false);
      onClose();
    }, 800);
  };

  const updatePoolKey = (provider: ProviderId, index: number, value: string) => {
    const keyField = provider === 'alibaba-grok' ? 'grokKeysPool' : provider === 'gemini' ? 'geminiKeysPool' : 'openrouterKeysPool';
    const currentPool = [...(keys[keyField] || [])];
    currentPool[index] = value;
    setKeys({ ...keys, [keyField]: currentPool });
  };

  const addPoolKey = (provider: ProviderId) => {
    const keyField = provider === 'alibaba-grok' ? 'grokKeysPool' : provider === 'gemini' ? 'geminiKeysPool' : 'openrouterKeysPool';
    const currentPool = [...(keys[keyField] || [])];
    currentPool.push('');
    setKeys({ ...keys, [keyField]: currentPool });
  };

  const removePoolKey = (provider: ProviderId, index: number) => {
    const keyField = provider === 'alibaba-grok' ? 'grokKeysPool' : provider === 'gemini' ? 'geminiKeysPool' : 'openrouterKeysPool';
    const currentPool = (keys[keyField] || []).filter((_, i) => i !== index);
    setKeys({ ...keys, [keyField]: currentPool });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[88vh] flex flex-col bg-[#09090b] border border-zinc-800 rounded-xl shadow-xl text-zinc-100 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800/80 bg-zinc-950/60">
          <div className="flex items-center space-x-2.5">
            <Key className="w-4 h-4 text-zinc-400" />
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">API Keys & Live Testing</h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleBatchTestAll}
              disabled={isBatchTesting}
              className="flex items-center space-x-1.5 px-2.5 py-1 text-xs font-medium text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-md hover:bg-zinc-800 transition-all disabled:opacity-50"
            >
              {isBatchTesting ? (
                <RefreshCw className="w-3 h-3 animate-spin text-zinc-400" />
              ) : (
                <Play className="w-3 h-3 text-zinc-400" />
              )}
              <span>{isBatchTesting ? 'Testing...' : 'Test All Keys'}</span>
            </button>

            <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-100 rounded-md hover:bg-zinc-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center px-5 border-b border-zinc-800/80 bg-zinc-950/40 text-xs gap-1">
          <button
            onClick={() => setActiveTab('gemini')}
            className={`px-3 py-2 font-medium border-b-2 transition-all ${
              activeTab === 'gemini' ? 'border-zinc-100 text-zinc-100' : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Google Gemini
          </button>
          <button
            onClick={() => setActiveTab('alibaba-grok')}
            className={`px-3 py-2 font-medium border-b-2 transition-all ${
              activeTab === 'alibaba-grok' ? 'border-zinc-100 text-zinc-100' : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Alibaba Grok
          </button>
          <button
            onClick={() => setActiveTab('openrouter')}
            className={`px-3 py-2 font-medium border-b-2 transition-all ${
              activeTab === 'openrouter' ? 'border-zinc-100 text-zinc-100' : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            OpenRouter
          </button>
          <button
            onClick={() => setActiveTab('rotation')}
            className={`px-3 py-2 font-medium border-b-2 transition-all ml-auto ${
              activeTab === 'rotation' ? 'border-zinc-100 text-zinc-100' : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Key Rotation
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {savedBanner && (
            <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 flex items-center space-x-2">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Keys saved successfully.</span>
            </div>
          )}

          {activeTab === 'gemini' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-zinc-300">
                  <span className="font-medium">Primary Gemini Key</span>
                  <button
                    type="button"
                    onClick={() => handleTestKey('gemini', 'gemini-main')}
                    disabled={testingProvider === 'gemini-main'}
                    className="text-zinc-400 hover:text-zinc-200 flex items-center space-x-1 disabled:opacity-40"
                  >
                    {testingProvider === 'gemini-main' ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                    <span>Test</span>
                  </button>
                </div>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={keys.gemini}
                  onChange={(e) => setKeys({ ...keys, gemini: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs rounded-md px-3 py-2 focus:outline-none focus:border-zinc-600 font-mono"
                />

                {testResults['gemini-main'] && (
                  <div className={`p-2 rounded border text-[11px] flex items-center space-x-2 ${
                    testResults['gemini-main'].status === 'success' ? 'bg-zinc-900 text-emerald-400 border-zinc-800' : 'bg-zinc-900 text-rose-400 border-zinc-800'
                  }`}>
                    {testResults['gemini-main'].status === 'success' ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                    <span>{testResults['gemini-main'].message}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-2 border-t border-zinc-800/60">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-medium">Backup Keys (Rotation Pool)</span>
                  <button
                    type="button"
                    onClick={() => addPoolKey('gemini')}
                    className="text-zinc-300 hover:text-white flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Backup Key</span>
                  </button>
                </div>

                {(keys.geminiKeysPool || []).map((poolKey, idx) => {
                  const poolId = `gemini-pool-${idx}`;
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-zinc-400">
                        <span>Backup Key #{idx + 1}</span>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handleTestKey('gemini', poolId)}
                            disabled={testingProvider === poolId || !poolKey}
                            className="text-zinc-400 hover:text-zinc-200"
                          >
                            Test
                          </button>
                          <button
                            type="button"
                            onClick={() => removePoolKey('gemini', idx)}
                            className="text-zinc-500 hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <input
                        type="password"
                        placeholder="Backup Gemini Key..."
                        value={poolKey}
                        onChange={(e) => updatePoolKey('gemini', idx, e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs rounded-md px-3 py-2 focus:outline-none focus:border-zinc-600 font-mono"
                      />
                      {testResults[poolId] && (
                        <p className="text-[11px] text-zinc-400">{testResults[poolId].message}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'alibaba-grok' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-zinc-300">
                  <span className="font-medium">Primary Alibaba Grok Key</span>
                  <button
                    type="button"
                    onClick={() => handleTestKey('alibaba-grok', 'grok-main')}
                    disabled={testingProvider === 'grok-main'}
                    className="text-zinc-400 hover:text-zinc-200 flex items-center space-x-1 disabled:opacity-40"
                  >
                    {testingProvider === 'grok-main' ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                    <span>Test</span>
                  </button>
                </div>
                <input
                  type="password"
                  placeholder="sk-..."
                  value={keys.alibabaGrok}
                  onChange={(e) => setKeys({ ...keys, alibabaGrok: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs rounded-md px-3 py-2 focus:outline-none focus:border-zinc-600 font-mono"
                />

                {testResults['grok-main'] && (
                  <div className={`p-2 rounded border text-[11px] flex items-center space-x-2 ${
                    testResults['grok-main'].status === 'success' ? 'bg-zinc-900 text-emerald-400 border-zinc-800' : 'bg-zinc-900 text-rose-400 border-zinc-800'
                  }`}>
                    <span>{testResults['grok-main'].message}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-2 border-t border-zinc-800/60">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-medium">Backup Keys (Rotation Pool)</span>
                  <button
                    type="button"
                    onClick={() => addPoolKey('alibaba-grok')}
                    className="text-zinc-300 hover:text-white flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Backup Key</span>
                  </button>
                </div>

                {(keys.grokKeysPool || []).map((poolKey, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-zinc-400">
                      <span>Backup Key #{idx + 1}</span>
                      <button type="button" onClick={() => removePoolKey('alibaba-grok', idx)} className="text-zinc-500 hover:text-rose-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input
                      type="password"
                      placeholder="Backup Grok Key..."
                      value={poolKey}
                      onChange={(e) => updatePoolKey('alibaba-grok', idx, e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs rounded-md px-3 py-2 focus:outline-none focus:border-zinc-600 font-mono"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'openrouter' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-zinc-300">
                  <span className="font-medium">Primary OpenRouter Key</span>
                  <button
                    type="button"
                    onClick={() => handleTestKey('openrouter', 'openrouter-main')}
                    disabled={testingProvider === 'openrouter-main'}
                    className="text-zinc-400 hover:text-zinc-200 flex items-center space-x-1 disabled:opacity-40"
                  >
                    {testingProvider === 'openrouter-main' ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                    <span>Test</span>
                  </button>
                </div>
                <input
                  type="password"
                  placeholder="sk-or-v1-..."
                  value={keys.openrouter}
                  onChange={(e) => setKeys({ ...keys, openrouter: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs rounded-md px-3 py-2 focus:outline-none focus:border-zinc-600 font-mono"
                />

                {testResults['openrouter-main'] && (
                  <div className={`p-2 rounded border text-[11px] flex items-center space-x-2 ${
                    testResults['openrouter-main'].status === 'success' ? 'bg-zinc-900 text-emerald-400 border-zinc-800' : 'bg-zinc-900 text-rose-400 border-zinc-800'
                  }`}>
                    <span>{testResults['openrouter-main'].message}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-2 border-t border-zinc-800/60">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-medium">Backup Keys (Rotation Pool)</span>
                  <button
                    type="button"
                    onClick={() => addPoolKey('openrouter')}
                    className="text-zinc-300 hover:text-white flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Backup Key</span>
                  </button>
                </div>

                {(keys.openrouterKeysPool || []).map((poolKey, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-zinc-400">
                      <span>Backup Key #{idx + 1}</span>
                      <button type="button" onClick={() => removePoolKey('openrouter', idx)} className="text-zinc-500 hover:text-rose-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input
                      type="password"
                      placeholder="Backup OpenRouter Key..."
                      value={poolKey}
                      onChange={(e) => updatePoolKey('openrouter', idx, e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs rounded-md px-3 py-2 focus:outline-none focus:border-zinc-600 font-mono"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'rotation' && (
            <div className="space-y-4">
              <div className="space-y-1 text-zinc-400">
                <h3 className="text-xs font-semibold text-zinc-200 flex items-center space-x-1.5">
                  <RotateCw className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Sequential Round-Robin Key Rotation</span>
                </h3>
                <p className="text-[11px] leading-relaxed">
                  Automatically cycles through active API keys one after another for every prompt to distribute usage evenly.
                </p>
              </div>

              <div className="space-y-2">
                <label className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  strategy === 'sequential-rotation' ? 'bg-zinc-900 border-zinc-700 text-zinc-100' : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                }`}>
                  <input
                    type="radio"
                    name="strategyMode"
                    value="sequential-rotation"
                    checked={strategy === 'sequential-rotation'}
                    onChange={() => setStrategy('sequential-rotation')}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="font-semibold text-xs">Sequential Rotation (Round-Robin)</span>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Rotates through key pool sequentially per prompt.</p>
                  </div>
                </label>

                <label className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  strategy === 'auto' ? 'bg-zinc-900 border-zinc-700 text-zinc-100' : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                }`}>
                  <input
                    type="radio"
                    name="strategyMode"
                    value="auto"
                    checked={strategy === 'auto'}
                    onChange={() => setStrategy('auto')}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="font-semibold text-xs">Priority Cascade (Alibaba Grok → Gemini → OpenRouter)</span>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Always uses Priority 1 first; fails over on rate limit.</p>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-5 py-3 border-t border-zinc-800/80 bg-zinc-950/60 space-x-2 text-xs">
          <button
            onClick={onClose}
            className="px-3 py-1.5 font-medium text-zinc-400 hover:text-zinc-200 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 font-medium text-zinc-950 bg-zinc-100 hover:bg-white rounded-md transition-all shadow-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
