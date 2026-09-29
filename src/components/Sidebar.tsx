import React, { useState } from 'react';
import {
  PenSquare,
  MessageSquare,
  Pin,
  Trash2,
  Pencil,
  Search,
  ChevronLeft,
  Check,
  Code2,
  Brain,
  Bug,
  Server,
  Sigma,
  Database
} from 'lucide-react';
import type { ChatSession, StudentPreset } from '../types';
import { STUDENT_PRESETS } from '../constants/presets';
import { WiseMark } from './brand/WiseLogo';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onPinSession: (id: string) => void;
  onSelectPreset: (preset: StudentPreset) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  onPinSession,
  onSelectPreset,
  isOpen,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredSessions = sessions.filter(s =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pinnedSessions = filteredSessions.filter(s => s.isPinned);
  const unpinnedSessions = filteredSessions.filter(s => !s.isPinned);

  const startRename = (s: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(s.id);
    setEditTitle(s.title);
  };

  const saveRename = (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const getPresetIcon = (iconName: string) => {
    const cls = 'w-4 h-4 shrink-0 text-ink-muted group-hover:text-accent-soft transition-colors';
    switch (iconName) {
      case 'Brain': return <Brain className={cls} />;
      case 'Bug': return <Bug className={cls} />;
      case 'Server': return <Server className={cls} />;
      case 'Calculator': return <Sigma className={cls} />;
      case 'Database': return <Database className={cls} />;
      default: return <Code2 className={cls} />;
    }
  };

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/55 backdrop-blur-md md:hidden"
        />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-[280px] shrink-0 wise-rail flex flex-col
        transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="px-5 pt-5 pb-4 space-y-4">
          <div className="flex items-center gap-2">
            <button
              onClick={onNewChat}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-[13px] font-medium text-ink wise-panel-flat"
            >
              <PenSquare className="w-4 h-4 text-ink-muted" />
              <span>New chat</span>
            </button>
            <button
              onClick={onClose}
              className="md:hidden p-2.5 text-ink-muted hover:text-ink rounded-xl hover:bg-white/[0.05]"
              aria-label="Close sidebar"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none" />
            <input
              type="text"
              placeholder="Search conversations"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/[0.03] text-ink text-[13px] rounded-xl pl-10 pr-3 py-2.5 border-0 focus:outline-none focus:bg-white/[0.06] placeholder-ink-faint transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-4 space-y-7">
          <section className="space-y-2">
            <h2 className="px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
              Starting points
            </h2>
            <div className="space-y-0.5">
              {STUDENT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => onSelectPreset(preset)}
                  title={preset.description}
                  className="group w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl hover:bg-white/[0.04] text-left transition-colors"
                >
                  {getPresetIcon(preset.icon)}
                  <span className="text-[13px] text-ink-soft group-hover:text-ink truncate">
                    {preset.title}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
              Conversations
            </h2>

            {pinnedSessions.length > 0 && (
              <div className="space-y-0.5 pb-2">
                {pinnedSessions.map(s => renderSessionItem(s))}
              </div>
            )}

            <div className="space-y-0.5">
              {unpinnedSessions.length === 0 && pinnedSessions.length === 0 ? (
                <p className="text-[13px] text-ink-faint px-2.5 py-3">
                  Nothing here yet.
                </p>
              ) : (
                unpinnedSessions.map(s => renderSessionItem(s))
              )}
            </div>
          </section>
        </div>

        <div className="px-5 py-5 flex items-center gap-2.5 text-ink-faint">
          <WiseMark className="h-5 opacity-80" />
          <span className="font-display text-[10px] uppercase tracking-[0.18em]">
            House of Wise
          </span>
        </div>
      </aside>
    </>
  );

  function renderSessionItem(s: ChatSession) {
    const isActive = s.id === activeSessionId;
    const isEditing = editingId === s.id;

    return (
      <div
        key={s.id}
        onClick={() => onSelectSession(s.id)}
        className={`
          group relative flex items-center justify-between gap-1 px-2.5 py-2.5 rounded-xl text-[13px] cursor-pointer transition-colors
          ${isActive
            ? 'bg-white/[0.07] text-ink'
            : 'text-ink-soft hover:bg-white/[0.035] hover:text-ink'}
        `}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {s.isPinned ? (
            <Pin className="w-4 h-4 shrink-0 text-accent-soft" />
          ) : (
            <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? 'text-accent-soft' : 'text-ink-faint'}`} />
          )}
          {isEditing ? (
            <form onSubmit={(e) => saveRename(s.id, e)} className="flex-1 flex items-center gap-1" onClick={e => e.stopPropagation()}>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                autoFocus
                className="w-full bg-white/[0.06] text-ink text-[13px] px-2 py-1 rounded-lg border-0 focus:outline-none"
              />
              <button type="submit" className="text-accent-soft p-1" aria-label="Save title">
                <Check className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <span className="truncate">{s.title || 'Untitled'}</span>
          )}
        </div>

        {!isEditing && (
          <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); onPinSession(s.id); }}
              className="p-1.5 text-ink-faint hover:text-ink rounded-lg hover:bg-white/[0.06]"
              title={s.isPinned ? 'Unpin' : 'Pin'}
            >
              <Pin className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => startRename(s, e)}
              className="p-1.5 text-ink-faint hover:text-ink rounded-lg hover:bg-white/[0.06]"
              title="Rename"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteSession(s.id); }}
              className="p-1.5 text-ink-faint hover:text-rose-300 rounded-lg hover:bg-white/[0.06]"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  }
};
