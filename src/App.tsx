import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { SettingsModal } from './components/SettingsModal';
import { QuickKeyModal } from './components/QuickKeyModal';
import { CodeRunnerModal } from './components/CodeRunnerModal';
import { StudentToolkitModal } from './components/StudentToolkitModal';
import type { ChatSession, Message, ApiKeys, FallbackStrategy, StudentPreset, Attachment } from './types';
import { sendChatMessage } from './services/ai/aiService';
import { SYSTEM_PROMPT_DEFAULT } from './constants/presets';
import { Key } from 'lucide-react';

const LOCAL_KEY_STORAGE = 'wise_ai_keys_v2';
const LOCAL_SESSIONS_STORAGE = 'wise_ai_sessions_v2';
const LOCAL_STRATEGY_STORAGE = 'wise_ai_strategy_v2';
const LOCAL_PROMPT_STORAGE = 'wise_ai_prompt_v2';

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

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem(LOCAL_SESSIONS_STORAGE);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { /* ignore */ }
    }
    const defaultSessionId = 'welcome-session';
    return [{
      id: defaultSessionId,
      title: 'Welcome',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [{
        id: 'msg-welcome',
        role: 'assistant',
        content: `**Wise AI** – Minimal Multi-LLM interface for Computer Science & Tech Students.

**Capabilities:**
- **3-Tier Intelligent Fallback:** Alibaba Grok (Qwen-Max) → Google Gemini → OpenRouter.
- **Sequential Key Rotation:** Rotate your API key pools prompt-by-prompt.
- **Live Key Testing:** Ping API keys directly in the frontend.

How can I assist you with your code or algorithms today?`,
        timestamp: new Date().toISOString(),
        providerUsed: 'alibaba-grok',
        providerName: 'Alibaba Grok'
      }]
    }];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    return sessions[0]?.id || 'welcome-session';
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
    localStorage.setItem(LOCAL_SESSIONS_STORAGE, JSON.stringify(sessions));
  }, [sessions]);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  const handleNewChat = () => {
    const newId = Math.random().toString(36).substring(7);
    const newSession: ChatSession = {
      id: newId,
      title: 'New Chat',
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
          title: 'New Chat',
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
    const updatedTitle = isFirstMessage ? (text.slice(0, 24) || 'Query') : currentSession.title;

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
        content: `Error: ${err.message || String(err)}\n\nPlease check your API keys.`,
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
    <div className="flex h-screen w-full bg-[#09090b] font-sans antialiased text-zinc-100 overflow-hidden">
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

      <div className="flex-1 flex flex-col min-w-0 h-full bg-[#09090b]">
        <Header
          fallbackStrategy={fallbackStrategy}
          setFallbackStrategy={setFallbackStrategy}
          openSettings={() => setIsSettingsOpen(true)}
          openQuickKeys={() => setIsQuickKeysOpen(true)}
          openToolkit={() => setIsToolkitOpen(true)}
          onNewChat={handleNewChat}
          toggleSidebar={() => setSidebarOpen(prev => !prev)}
          apiKeys={apiKeys}
          isGenerating={isGenerating}
        />

        <div className="flex-1 overflow-y-auto">
          {activeSession.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto space-y-4">
              <h1 className="text-xl font-semibold text-zinc-100">
                Wise AI
              </h1>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Minimal Multi-LLM Interface for Computer Science & Tech Students
              </p>

              <button
                onClick={() => setIsQuickKeysOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 transition-all"
              >
                <Key className="w-3.5 h-3.5 text-zinc-400" />
                <span>Configure API Keys & Live Test</span>
              </button>
            </div>
          ) : (
            <div className="pb-6">
              {activeSession.messages.map((msg, idx) => (
                <ChatMessage
                  key={msg.id || idx}
                  message={msg}
                  onRegenerate={idx === activeSession.messages.length - 1 && msg.role === 'assistant' ? handleRegenerate : undefined}
                  onRunCode={handleRunCode}
                />
              ))}
              {isGenerating && (
                <div className="py-4 px-4 md:px-6 bg-[#111114] border-b border-zinc-800/40">
                  <div className="max-w-3xl mx-auto flex items-center space-x-2 text-xs text-zinc-400">
                    <div className="w-2 h-2 rounded-full bg-zinc-400 animate-ping" />
                    <span>Wise AI is thinking...</span>
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
