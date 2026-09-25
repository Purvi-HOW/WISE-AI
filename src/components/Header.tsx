import React from 'react';
import { 
  Settings, 
  BookOpen, 
  Menu, 
  Plus, 
  Key,
  ChevronDown
} from 'lucide-react';
import type { FallbackStrategy, ApiKeys } from '../types';

interface HeaderProps {
  fallbackStrategy: FallbackStrategy;
  setFallbackStrategy: (s: FallbackStrategy) => void;
  openSettings: () => void;
  openQuickKeys: () => void;
  openToolkit: () => void;
  onNewChat: () => void;
  toggleSidebar: () => void;
  apiKeys: ApiKeys;
  isGenerating: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  fallbackStrategy,
  setFallbackStrategy,
  openSettings,
  openQuickKeys,
  openToolkit,
  onNewChat,
  toggleSidebar,
  apiKeys
}) => {
  const keysCount = [
    apiKeys.alibabaGrok,
    apiKeys.gemini,
    apiKeys.openrouter,
    ...(apiKeys.grokKeysPool || []),
    ...(apiKeys.geminiKeysPool || []),
    ...(apiKeys.openrouterKeysPool || [])
  ].filter(k => k && k.trim()).length;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-2.5 bg-[#09090b]/90 backdrop-blur-md border-b border-zinc-800/60 text-zinc-100">
      <div className="flex items-center space-x-3">
        <button 
          onClick={toggleSidebar}
          className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-md hover:bg-zinc-800/60 transition-colors md:hidden"
          title="Toggle Sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-semibold text-sm tracking-tight text-zinc-100">
            Wise AI
          </span>
          <span className="text-[10px] text-zinc-500 font-mono">v2.5</span>
        </div>
      </div>

      <div className="hidden lg:flex items-center space-x-2 bg-zinc-900/60 border border-zinc-800/80 rounded-lg px-2.5 py-1 text-xs">
        <span className="text-zinc-500 font-medium">Flow:</span>
        <div className="relative flex items-center">
          <select
            value={fallbackStrategy}
            onChange={(e) => setFallbackStrategy(e.target.value as FallbackStrategy)}
            className="bg-transparent text-zinc-300 font-medium appearance-none pr-4 focus:outline-none cursor-pointer hover:text-zinc-100 text-xs"
          >
            <option value="auto" className="bg-zinc-900 text-zinc-200">3-Tier Fallback (Auto)</option>
            <option value="sequential-rotation" className="bg-zinc-900 text-zinc-200">Sequential Round-Robin Rotation</option>
            <option value="alibaba-grok-only" className="bg-zinc-900 text-zinc-200">Alibaba Grok (Qwen)</option>
            <option value="gemini-only" className="bg-zinc-900 text-zinc-200">Google Gemini AI</option>
            <option value="openrouter-only" className="bg-zinc-900 text-zinc-200">OpenRouter AI</option>
          </select>
          <ChevronDown className="w-3 h-3 text-zinc-500 pointer-events-none absolute right-0" />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={openQuickKeys}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 transition-all"
          title="Direct Frontend API Key Manager & Live Test"
        >
          <Key className="w-3.5 h-3.5 text-zinc-400" />
          <span>API Keys</span>
          {keysCount > 0 && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-0.5" />
          )}
        </button>

        <button
          onClick={openToolkit}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-900/80 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-all"
          title="CS Toolkit & Cheat Sheets"
        >
          <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden sm:inline">Toolkit</span>
        </button>

        <button
          onClick={onNewChat}
          className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-zinc-950 bg-zinc-100 hover:bg-white rounded-lg transition-all shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Chat</span>
        </button>

        <button
          onClick={openSettings}
          className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800/80 transition-colors"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
