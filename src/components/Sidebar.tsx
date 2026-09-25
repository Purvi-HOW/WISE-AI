import React, { useState } from 'react';
import { 
  Plus, 
  MessageSquare, 
  Pin, 
  Trash2, 
  Edit2, 
  Search, 
  ChevronLeft, 
  Check, 
  Code, 
  Brain, 
  Bug, 
  Server, 
  Calculator, 
  Database
} from 'lucide-react';
import type { ChatSession, StudentPreset } from '../types';
import { STUDENT_PRESETS } from '../constants/presets';

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
    switch (iconName) {
      case 'Brain': return <Brain className="w-3.5 h-3.5 text-zinc-400" />;
      case 'Bug': return <Bug className="w-3.5 h-3.5 text-zinc-400" />;
      case 'Server': return <Server className="w-3.5 h-3.5 text-zinc-400" />;
      case 'Calculator': return <Calculator className="w-3.5 h-3.5 text-zinc-400" />;
      case 'Database': return <Database className="w-3.5 h-3.5 text-zinc-400" />;
      default: return <Code className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  return (
    <>
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-[#09090b] border-r border-zinc-800/60 flex flex-col justify-between
        transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-3 border-b border-zinc-800/60 space-y-2.5">
          <div className="flex items-center justify-between">
            <button
              onClick={onNewChat}
              className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-medium rounded-lg transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-zinc-400" />
              <span>New Chat</span>
            </button>
            <button
              onClick={onClose}
              className="md:hidden ml-2 p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900/60 border border-zinc-800/80 text-zinc-200 text-xs rounded-md pl-8 pr-2.5 py-1.5 focus:outline-none focus:border-zinc-700 placeholder-zinc-600"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2.5 space-y-4 text-xs">
          <div>
            <div className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Shortcuts
            </div>
            <div className="grid grid-cols-1 gap-1">
              {STUDENT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => onSelectPreset(preset)}
                  className="flex items-center space-x-2 p-1.5 rounded-md hover:bg-zinc-900 border border-transparent hover:border-zinc-800/80 text-left transition-all group"
                >
                  {getPresetIcon(preset.icon)}
                  <span className="text-xs text-zinc-300 group-hover:text-zinc-100 truncate font-medium">
                    {preset.title}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <hr className="border-zinc-800/60" />

          <div>
            <div className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Chats ({sessions.length})
            </div>

            {pinnedSessions.length > 0 && (
              <div className="mb-2 space-y-0.5">
                <span className="text-[10px] font-medium text-zinc-400 px-2 flex items-center space-x-1">
                  <Pin className="w-2.5 h-2.5 text-zinc-400" />
                  <span>Pinned</span>
                </span>
                {pinnedSessions.map(s => renderSessionItem(s))}
              </div>
            )}

            <div className="space-y-0.5">
              {unpinnedSessions.length === 0 && pinnedSessions.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-4">
                  No conversations
                </p>
              ) : (
                unpinnedSessions.map(s => renderSessionItem(s))
              )}
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-zinc-800/60 bg-zinc-950/40 text-xs text-zinc-500 flex items-center justify-between">
          <span>House of Wise</span>
          <span className="text-[10px] font-mono text-zinc-600">v2.5</span>
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
          group relative flex items-center justify-between px-2 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all
          ${isActive 
            ? 'bg-zinc-800 text-zinc-100' 
            : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200'}
        `}
      >
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-zinc-200' : 'text-zinc-500'}`} />
          {isEditing ? (
            <form onSubmit={(e) => saveRename(s.id, e)} className="flex-1 flex items-center space-x-1" onClick={e => e.stopPropagation()}>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                autoFocus
                className="w-full bg-zinc-950 text-white text-xs px-1.5 py-0.5 rounded border border-zinc-600 focus:outline-none"
              />
              <button type="submit" className="text-emerald-400 p-0.5">
                <Check className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <span className="truncate">{s.title || 'Untitled Conversation'}</span>
          )}
        </div>

        {!isEditing && (
          <div className="hidden group-hover:flex items-center space-x-1 shrink-0 ml-1">
            <button
              onClick={(e) => { e.stopPropagation(); onPinSession(s.id); }}
              className="p-1 text-zinc-500 hover:text-zinc-300"
              title={s.isPinned ? 'Unpin' : 'Pin'}
            >
              <Pin className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => startRename(s, e)}
              className="p-1 text-zinc-500 hover:text-zinc-300"
              title="Rename"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteSession(s.id); }}
              className="p-1 text-zinc-500 hover:text-rose-400"
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  }
};
