import React from 'react';
import { Settings2, BookOpen, Menu, PenSquare, Sparkles } from 'lucide-react';
import type { FallbackStrategy } from '../types';
import { getModelMode } from '../constants/models';
import { WiseLockup } from './brand/WiseLogo';

interface HeaderProps {
  fallbackStrategy: FallbackStrategy;
  openSettings: () => void;
  openToolkit: () => void;
  onNewChat: () => void;
  toggleSidebar: () => void;
  isGenerating: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  fallbackStrategy,
  openSettings,
  openToolkit,
  onNewChat,
  toggleSidebar,
  isGenerating
}) => {
  const mode = getModelMode(fallbackStrategy);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 md:px-8 py-4 bg-canvas/70 backdrop-blur-xl">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggleSidebar}
          className="p-2 -ml-1 text-ink-muted hover:text-ink rounded-xl hover:bg-white/[0.05] transition-colors md:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <WiseLockup size="sm" />
      </div>

      {/* The only thing the main UI says about routing: it is handled. */}
      <button
        onClick={openSettings}
        title="Model selection — change in Advanced settings"
        className="hidden sm:flex items-center gap-2.5 rounded-full pl-3 pr-4 py-2 wise-panel-flat text-left"
      >
        <span className="relative flex items-center justify-center w-5 h-5">
          {isGenerating && (
            <span className="absolute inset-0 rounded-full bg-accent/25 animate-ping" />
          )}
          <Sparkles className="relative w-3.5 h-3.5 text-accent-soft" />
        </span>
        <span className="flex flex-col leading-none">
          <span className="text-[13px] font-medium text-ink">{mode.label}</span>
          <span className="text-[11px] text-ink-muted mt-1">{mode.hint}</span>
        </span>
      </button>

      <div className="flex items-center gap-2">
        <button
          onClick={openToolkit}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-[13px] font-medium text-ink-soft hover:text-ink wise-panel-flat"
          title="Study toolkit and reference sheets"
        >
          <BookOpen className="w-4 h-4" />
          <span className="hidden lg:inline">Toolkit</span>
        </button>

        <button
          onClick={onNewChat}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-[13px] font-medium text-ink-soft hover:text-ink wise-panel-flat"
        >
          <PenSquare className="w-4 h-4" />
          <span className="hidden lg:inline">New chat</span>
        </button>

        <button
          onClick={openSettings}
          className="p-2.5 rounded-xl text-ink-muted hover:text-ink hover:bg-white/[0.05] transition-colors"
          title="Settings"
        >
          <Settings2 className="w-[18px] h-[18px]" />
        </button>
      </div>
    </header>
  );
};
