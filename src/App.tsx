import { useState, useEffect } from 'react';
import './App.css';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { SettingsModal } from './components/SettingsModal';
import { QuickKeyModal } from './components/QuickKeyModal';
import { CodeRunnerModal } from './components/CodeRunnerModal';
import { StudentToolkitModal } from './components/StudentToolkitModal';
import { WiseMark, WiseWordmark } from './components/brand/WiseLogo';
import type { ChatSession, Message, ApiKeys, FallbackStrategy, StudentPreset, Attachment } from './types';
import { sendChatMessage } from './services/ai/aiService';
import { SYSTEM_PROMPT_DEFAULT, STUDENT_PRESETS } from './constants/presets';
import { getModelMode } from './constants/models';
import { Sparkles } from 'lucide-react';

const LOCAL_KEY_STORAGE = 'wise_ai_keys_v2';
const LOCAL_SESSIONS_STORAGE = 'wise_ai_sessions_v2';
const LOCAL_STRATEGY_STORAGE = 'wise_ai_strategy_v2';
const LOCAL_PROMPT_STORAGE = 'wise_ai_prompt_v2';
const LOCAL_ADVANCED_STORAGE = 'wise_ai_advanced_v1';

const WELCOME_SESSION_ID = 'welcome-session';
const WELCOME_MESSAGE_ID = 'msg-welcome';

const WELCOME_TEXT = `Welcome to **Wise AI**, the study assistant from House of Wise.

Ask about algorithms and data structures, walk through a proof, get a second opinion on a schema, or paste code you want torn apart. Answers come with runnable snippets, complexity analysis, and proper maths notation.

The right model is picked for you on every message. What are you working on?`;

/** Older saved sessions carry a welcome note full of routing jargon. Quietly refresh it. */
function migrateWelcome(sessions: ChatSession[]): ChatSession[] {
  return sessions.map(s => {
    if (s.id !== WELCOME_SESSION_ID || s.messages.length !== 1) return s;
    const only = s.messages[0];
    if (only.id !== WELCOME_MESSAGE_ID) return s;
    return { ...s, messages: [{ ...only, content: WELCOME_TEXT, providerUsed: undefined, providerName: undefined }] };
  });
}

export function App() {
  const [apiKeys, setApiKeys] = useState<ApiKeys>(() => {
    const saved = localStorage.getItem(LOCAL_KEY_STORAGE);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {
      alibabaGrok: import.meta.env.VITE_ALIBABA_GROK_API_KEY || '',
      gemini: import.meta.env.VITE_GEMINI_API_KEY || '',
      openrouter: import.meta.env.VITE_OPENROUTER_API_KEY || '',
      grokKeysPool: [],
      geminiKeysPool: [],
      openrouterKeysPool: [],
      rotationIndex: 0
    };
  });

  const [fallbackStrategy, setFallbackStrategy] = useState<FallbackStrategy>(() => {
    return (localStorage.getItem(LOCAL_STRATEGY_STORAGE) as FallbackStrategy) || 'auto';
  });

  const [systemPrompt, setSystemPrompt] = useState<string>(() => {
    return localStorage.getItem(LOCAL_PROMPT_STORAGE) || SYSTEM_PROMPT_DEFAULT;
  });

  /** Reveals provider, key and timing details throughout the app. Off by default. */
  const [advancedMode, setAdvancedMode] = useState<boolean>(() => {
    return localStorage.getItem(LOCAL_ADVANCED_STORAGE) === 'true';
  });

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem(LOCAL_SESSIONS_STORAGE);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return migrateWelcome(parsed);
      } catch (e) { /* ignore */ }
    }
    return [{
      id: WELCOME_SESSION_ID,
      title: 'Welcome',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [{
        id: WELCOME_MESSAGE_ID,
        role: 'assistant',
        content: WELCOME_TEXT,
        timestamp: new Date().toISOString()
      }]
    }];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    return sessions[0]?.id || WELCOME_SESSION_ID;
  });

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isQuickKeysOpen, setIsQuickKeysOpen] = useState<boolean>(false);
  const [isToolkitOpen, setIsToolkitOpen] = useState<boolean>(false);
  const [codeRunnerState, setCodeRunnerState] = useState<{ isOpen: boolean; code: string; language: string }>({
    isOpen: false,
    code: '',
    language: 'javascript'
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_KEY_STORAGE, JSON.stringify(apiKeys));
  }, [apiKeys]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STRATEGY_STORAGE, fallbackStrategy);
  }, [fallbackStrategy]);

  useEffect(() => {
    localStorage.setItem(LOCAL_PROMPT_STORAGE, systemPrompt);
  }, [systemPrompt]);

  useEffect(() => {
    localStorage.setItem(LOCAL_ADVANCED_STORAGE, String(advancedMode));
  }, [advancedMode]);

  useEffect(() => {
    localStorage.setItem(LOCAL_SESSIONS_STORAGE, JSON.stringify(sessions));
  }, [sessions]);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const mode = getModelMode(fallbackStrategy);

  const handleNewChat = () => {
    const newId = Math.random().toString(36).substring(7);
    const newSession: ChatSession = {
      id: newId,
      title: 'New chat',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: []
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    setSidebarOpen(false);
  };

  const handleDeleteSession = (id: string) => {
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== id);
      if (filtered.length === 0) {
        const freshId = Math.random().toString(36).substring(7);
        const fresh: ChatSession = {
          id: freshId,
          title: 'New chat',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: []
        };
        setActiveSessionId(freshId);
        return [fresh];
      }
      if (activeSessionId === id) {
        setActiveSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  const handleRenameSession = (id: string, newTitle: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, title: newTitle } : s));
  };

  const handlePinSession = (id: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, isPinned: !s.isPinned } : s));
  };

  const handleSelectPreset = (preset: StudentPreset) => {
    handleSendMessage(preset.prompt);
    setSidebarOpen(false);
  };

  const handleSendMessage = async (text: string, attachments?: Attachment[]) => {
    if (!text && (!attachments || attachments.length === 0)) return;

    const userMsgId = Math.random().toString(36).substring(7);
    const userMsg: Message = {
      id: userMsgId,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      attachments
    };

    let currentSession = activeSession;
    const isFirstMessage = currentSession.messages.length === 0;

    const updatedMessages = [...currentSession.messages, userMsg];
    const updatedTitle = isFirstMessage ? (text.slice(0, 40) || 'Query') : currentSession.title;

    setSessions(prev => prev.map(s => {
      if (s.id === currentSession.id) {
        return {
          ...s,
          title: updatedTitle,
          updatedAt: new Date().toISOString(),
          messages: updatedMessages
        };
      }
      return s;
    }));

    setIsGenerating(true);

    try {
      const aiResult = await sendChatMessage(
        updatedMessages,
        systemPrompt,
        fallbackStrategy
      );

      const assistantMsgId = Math.random().toString(36).substring(7);
      const assistantMsg: Message = {
        id: assistantMsgId,
        role: 'assistant',
        content: aiResult.text,
        timestamp: new Date().toISOString(),
        providerUsed: aiResult.providerUsed,
        providerName: aiResult.providerName,
        modelUsed: aiResult.modelUsed,
        latencyMs: aiResult.latencyMs,
        tokensUsed: aiResult.tokensUsed,
        fallbackTriggered: aiResult.fallbackTriggered,
        fallbackChain: aiResult.fallbackChain,
        keyUsedLabel: aiResult.keyUsedLabel
      };

      setSessions(prev => prev.map(s => {
        if (s.id === currentSession.id) {
          return {
            ...s,
            updatedAt: new Date().toISOString(),
            messages: [...updatedMessages, assistantMsg]
          };
        }
        return s;
      }));
    } catch (err: any) {
      const errorMsg: Message = {
        id: Math.random().toString(36).substring(7),
        role: 'assistant',
        content: `Something went wrong: ${err.message || String(err)}`,
        timestamp: new Date().toISOString(),
        isError: true
      };
      setSessions(prev => prev.map(s => {
        if (s.id === currentSession.id) {
          return {
            ...s,
            messages: [...updatedMessages, errorMsg]
          };
        }
        return s;
      }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = () => {
    if (!activeSession || activeSession.messages.length === 0) return;
    const lastUserIdx = activeSession.messages.findLastIndex(m => m.role === 'user');
    if (lastUserIdx === -1) return;

    const truncatedMessages = activeSession.messages.slice(0, lastUserIdx + 1);
    const lastUserMsg = truncatedMessages[truncatedMessages.length - 1];

    setSessions(prev => prev.map(s => s.id === activeSession.id ? { ...s, messages: truncatedMessages } : s));
    handleSendMessage(lastUserMsg.content, lastUserMsg.attachments);
  };

  const handleRunCode = (code: string, language: string) => {
    setCodeRunnerState({
      isOpen: true,
      code,
      language
    });
  };

  return (
    <div className="flex h-screen w-full bg-canvas font-sans text-ink overflow-hidden">
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => { setActiveSessionId(id); setSidebarOpen(false); }}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onPinSession={handlePinSession}
        onSelectPreset={handleSelectPreset}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full">
        <Header
          fallbackStrategy={fallbackStrategy}
          openSettings={() => setIsSettingsOpen(true)}
          openToolkit={() => setIsToolkitOpen(true)}
          onNewChat={handleNewChat}
          toggleSidebar={() => setSidebarOpen(prev => !prev)}
          isGenerating={isGenerating}
        />

        <div className="flex-1 min-h-0 overflow-y-auto">
          {activeSession.messages.length === 0 ? (
            <div className="relative wise-aura h-full flex flex-col items-center justify-center px-6 py-12">
              <div className="relative z-10 w-full max-w-2xl flex flex-col items-center text-center">
                <span className="wise-mark-glow-lg">
                  <WiseMark className="h-28" title="House of Wise" />
                </span>

                <WiseWordmark className="h-[13px] mt-6 opacity-50" title="House of Wise" />

                <h1 className="mt-7 font-display text-[40px] md:text-[52px] font-semibold tracking-[-0.03em] leading-[1.05] text-ink">
                  What are we solving?
                </h1>

                <p className="mt-5 text-[15px] md:text-base leading-relaxed text-ink-muted max-w-md">
                  Algorithms, proofs, system design, and the code in between.
                </p>

                <div className="mt-6 inline-flex items-center gap-2 px-3.5 py-2 rounded-full wise-panel-flat">
                  <Sparkles className="w-3.5 h-3.5 text-accent-soft" />
                  <span className="text-[12px] text-ink-soft font-medium">{mode.label}</span>
                  <span className="text-[12px] text-ink-faint">· {mode.hint}</span>
                </div>

                <div className="mt-12 w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {STUDENT_PRESETS.slice(0, 4).map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className="wise-panel-flat rounded-2xl p-5 text-left"
                    >
                      <p className="text-[14px] font-medium text-ink leading-snug">
                        {preset.title}
                      </p>
                      <p className="mt-2 text-[12px] leading-relaxed text-ink-faint line-clamp-2">
                        {preset.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="pb-10 pt-2">
              {activeSession.messages.map((msg, idx) => (
                <ChatMessage
                  key={msg.id || idx}
                  message={msg}
                  onRegenerate={idx === activeSession.messages.length - 1 && msg.role === 'assistant' ? handleRegenerate : undefined}
                  onRunCode={handleRunCode}
                  showTechnical={advancedMode}
                />
              ))}
              {isGenerating && (
                <div className="px-5 md:px-8 py-6">
                  <div className="max-w-3xl mx-auto flex items-center gap-4">
                    <span className="wise-mark-glow shrink-0">
                      <WiseMark className="h-8" />
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full wise-thinking-dot" />
                        <span className="w-1.5 h-1.5 rounded-full wise-thinking-dot" />
                        <span className="w-1.5 h-1.5 rounded-full wise-thinking-dot" />
                      </span>
                      <span className="text-[13px] wise-shimmer font-medium">Thinking</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <ChatInput
          onSendMessage={handleSendMessage}
          isGenerating={isGenerating}
        />
      </div>

      <QuickKeyModal
        isOpen={isQuickKeysOpen}
        onClose={() => setIsQuickKeysOpen(false)}
        apiKeys={apiKeys}
        onSaveKeys={setApiKeys}
        fallbackStrategy={fallbackStrategy}
        onSaveStrategy={setFallbackStrategy}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKeys={apiKeys}
        onSaveKeys={setApiKeys}
        fallbackStrategy={fallbackStrategy}
        onSaveStrategy={setFallbackStrategy}
        systemPrompt={systemPrompt}
        onSaveSystemPrompt={setSystemPrompt}
        advancedMode={advancedMode}
        onSaveAdvancedMode={setAdvancedMode}
        onOpenQuickKeyModal={() => setIsQuickKeysOpen(true)}
      />

      <CodeRunnerModal
        isOpen={codeRunnerState.isOpen}
        onClose={() => setCodeRunnerState(prev => ({ ...prev, isOpen: false }))}
        code={codeRunnerState.code}
        language={codeRunnerState.language}
      />

      <StudentToolkitModal
        isOpen={isToolkitOpen}
        onClose={() => setIsToolkitOpen(false)}
        onInsertPrompt={(promptText) => handleSendMessage(promptText)}
      />
    </div>
  );
}

export default App;
