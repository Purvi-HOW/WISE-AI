import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { 
  User, 
  Sparkles, 
  Copy, 
  Check, 
  Play, 
  Download, 
  RotateCw, 
  Clock, 
  FileCode
} from 'lucide-react';
import type { Message, ProviderId } from '../types';

interface ChatMessageProps {
  message: Message;
  onRegenerate?: () => void;
  onRunCode?: (code: string, language: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onRegenerate,
  onRunCode
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedBlockIndex, setCopiedBlockIndex] = useState<number | null>(null);

  const isUser = message.role === 'user';

  const copyTextToClipboard = (text: string, index?: number) => {
    navigator.clipboard.writeText(text);
    if (index !== undefined) {
      setCopiedBlockIndex(index);
      setTimeout(() => setCopiedBlockIndex(null), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadSnippet = (code: string, lang: string) => {
    const ext = lang === 'python' ? 'py' : lang === 'javascript' || lang === 'js' ? 'js' : lang === 'typescript' || lang === 'ts' ? 'ts' : lang === 'sql' ? 'sql' : lang === 'cpp' || lang === 'c++' ? 'cpp' : 'txt';
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wise_snippet.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getProviderBadge = (provider?: ProviderId, isFallback?: boolean, keyLabel?: string) => {
    if (!provider) return null;

    let name = 'Alibaba Grok';
    if (provider === 'gemini') name = 'Google Gemini';
    if (provider === 'openrouter') name = 'OpenRouter';

    return (
      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono text-zinc-400 border border-zinc-800 bg-zinc-900/60">
        <span>{name}</span>
        {keyLabel && <span>• {keyLabel}</span>}
        {isFallback && <span className="text-amber-400/90">(Fallback)</span>}
      </span>
    );
  };

  return (
    <div className={`py-4 px-4 md:px-6 transition-colors ${isUser ? 'bg-[#09090b]' : 'bg-[#111114] border-y border-zinc-800/40'}`}>
      <div className="max-w-3xl mx-auto flex items-start space-x-3.5">
        <div className="shrink-0 pt-0.5">
          {isUser ? (
            <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300">
              <User className="w-3.5 h-3.5" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-zinc-200">
                {isUser ? 'You' : 'Wise AI'}
              </span>
              {!isUser && getProviderBadge(message.providerUsed, message.fallbackTriggered, message.keyUsedLabel)}
            </div>

            {!isUser && (message.latencyMs || message.tokensUsed) && (
              <div className="flex items-center space-x-2 text-[10px] font-mono text-zinc-500">
                {message.latencyMs && (
                  <span className="flex items-center space-x-0.5">
                    <Clock className="w-3 h-3 text-zinc-600" />
                    <span>{message.latencyMs}ms</span>
                  </span>
                )}
                {message.tokensUsed && (
                  <span>• {message.tokensUsed} tokens</span>
                )}
              </div>
            )}
          </div>

          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-1.5 py-1">
              {message.attachments.map(att => (
                <div key={att.id} className="flex items-center space-x-1.5 px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-300">
                  <FileCode className="w-3 h-3 text-zinc-400" />
                  <span className="truncate max-w-[150px]">{att.name}</span>
                </div>
              ))}
            </div>
          )}

          <div className="prose prose-invert prose-zinc max-w-none text-xs leading-relaxed text-zinc-200 font-sans">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                code({ inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  const language = match ? match[1] : 'code';
                  const codeText = String(children).replace(/\n$/, '');

                  if (!inline && match) {
                    const blockId = Math.random();
                    return (
                      <div className="my-2.5 rounded-lg overflow-hidden border border-zinc-800 bg-[#070709]">
                        <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900/80 border-b border-zinc-800 text-[11px]">
                          <span className="font-mono text-zinc-400 uppercase tracking-wider text-[10px]">
                            {language}
                          </span>
                          <div className="flex items-center space-x-1.5">
                            {onRunCode && (
                              <button
                                onClick={() => onRunCode(codeText, language)}
                                className="flex items-center space-x-1 px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-medium transition-colors"
                              >
                                <Play className="w-2.5 h-2.5 fill-zinc-200" />
                                <span>Run</span>
                              </button>
                            )}

                            <button
                              onClick={() => downloadSnippet(codeText, language)}
                              className="p-1 text-zinc-400 hover:text-zinc-200 rounded hover:bg-zinc-800"
                              title="Download"
                            >
                              <Download className="w-3 h-3" />
                            </button>

                            <button
                              onClick={() => copyTextToClipboard(codeText, blockId)}
                              className="flex items-center space-x-1 px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] text-zinc-300 transition-colors"
                            >
                              {copiedBlockIndex === blockId ? (
                                <>
                                  <Check className="w-2.5 h-2.5 text-emerald-400" />
                                  <span className="text-emerald-400">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-2.5 h-2.5 text-zinc-400" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        <pre className="p-3 overflow-x-auto text-[11px] font-mono leading-relaxed bg-[#070709] text-zinc-200">
                          <code>{children}</code>
                        </pre>
                      </div>
                    );
                  }
                  return (
                    <code className="px-1 py-0.5 rounded bg-zinc-800/80 text-zinc-200 text-[12px] font-mono" {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          {!isUser && (
            <div className="flex items-center space-x-2 pt-1 border-t border-zinc-800/30 text-[11px]">
              <button
                onClick={() => copyTextToClipboard(message.content)}
                className="flex items-center space-x-1 text-zinc-400 hover:text-zinc-200 px-2 py-0.5 rounded hover:bg-zinc-800/60 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="flex items-center space-x-1 text-zinc-400 hover:text-zinc-200 px-2 py-0.5 rounded hover:bg-zinc-800/60 transition-colors"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>Regenerate</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
