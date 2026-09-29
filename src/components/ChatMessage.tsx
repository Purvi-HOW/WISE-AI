import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import {
  Copy,
  Check,
  Play,
  Download,
  RotateCw,
  FileCode2,
  AlertTriangle
} from 'lucide-react';
import type { Message, ProviderId } from '../types';
import { WiseMark } from './brand/WiseLogo';

interface ChatMessageProps {
  message: Message;
  onRegenerate?: () => void;
  onRunCode?: (code: string, language: string) => void;
  /** Routing and timing details stay hidden unless Advanced settings asks for them. */
  showTechnical?: boolean;
}

const PROVIDER_LABELS: Record<ProviderId, string> = {
  'alibaba-grok': 'Alibaba Grok',
  gemini: 'Google Gemini',
  openrouter: 'OpenRouter'
};

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onRegenerate,
  onRunCode,
  showTechnical = false
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedBlock, setCopiedBlock] = useState<string | null>(null);

  const isUser = message.role === 'user';

  const copyTextToClipboard = (text: string, blockKey?: string) => {
    navigator.clipboard.writeText(text);
    if (blockKey) {
      setCopiedBlock(blockKey);
      setTimeout(() => setCopiedBlock(null), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadSnippet = (code: string, lang: string) => {
    const ext = lang === 'python' ? 'py'
      : lang === 'javascript' || lang === 'js' ? 'js'
      : lang === 'typescript' || lang === 'ts' ? 'ts'
      : lang === 'sql' ? 'sql'
      : lang === 'cpp' || lang === 'c++' ? 'cpp'
      : 'txt';
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wise_snippet.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isUser) {
    return (
      <div className="px-5 md:px-8 py-5 wise-fade-in">
        <div className="max-w-3xl mx-auto flex justify-end">
          <div className="max-w-[85%] space-y-2.5">
            {message.attachments && message.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-end">
                {message.attachments.map(att => (
                  <div key={att.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.05] text-[12px] text-ink-soft">
                    <FileCode2 className="w-3.5 h-3.5 text-ink-faint" />
                    <span className="truncate max-w-[180px]">{att.name}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="wise-panel rounded-[20px] px-5 py-3.5 text-[15px] leading-relaxed text-ink whitespace-pre-wrap">
              {message.content}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 md:px-8 py-6 wise-fade-in">
      <div className="max-w-3xl mx-auto flex items-start gap-4">
        <div className="shrink-0 pt-1">
          {message.isError ? (
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-300">
              <AlertTriangle className="w-4 h-4" />
            </div>
          ) : (
            <span className="wise-mark-glow">
              <WiseMark className="h-8" />
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-3 pt-0.5">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-display text-[13px] font-semibold text-ink tracking-tight">
              Wise AI
            </span>

            {showTechnical && message.providerUsed && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.05] text-[10px] font-mono text-ink-muted">
                <span>{PROVIDER_LABELS[message.providerUsed]}</span>
                {message.modelUsed && <span className="text-ink-faint">{message.modelUsed}</span>}
                {message.keyUsedLabel && <span className="text-ink-faint">{message.keyUsedLabel}</span>}
                {message.fallbackTriggered && <span className="text-amber-300/90">fallback</span>}
              </span>
            )}

            {showTechnical && (message.latencyMs || message.tokensUsed) && (
              <span className="text-[10px] font-mono text-ink-faint">
                {message.latencyMs ? `${message.latencyMs}ms` : ''}
                {message.latencyMs && message.tokensUsed ? ' · ' : ''}
                {message.tokensUsed ? `${message.tokensUsed} tokens` : ''}
              </span>
            )}
          </div>

          <div className="wise-prose">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                code({ inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  const language = match ? match[1] : 'code';
                  const codeText = String(children).replace(/\n$/, '');

                  if (!inline && match) {
                    const blockKey = `${language}:${codeText.slice(0, 64)}`;
                    return (
                      <div className="my-5 rounded-2xl overflow-hidden wise-well">
                        <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.04]">
                          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                            {language}
                          </span>
                          <div className="flex items-center gap-1">
                            {onRunCode && (
                              <button
                                onClick={() => onRunCode(codeText, language)}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium text-ink-soft hover:text-ink hover:bg-white/[0.07] transition-colors"
                              >
                                <Play className="w-3 h-3" />
                                <span>Run</span>
                              </button>
                            )}

                            <button
                              onClick={() => downloadSnippet(codeText, language)}
                              className="p-1.5 text-ink-faint hover:text-ink rounded-lg hover:bg-white/[0.07] transition-colors"
                              title="Download"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => copyTextToClipboard(codeText, blockKey)}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium text-ink-soft hover:text-ink hover:bg-white/[0.07] transition-colors"
                            >
                              {copiedBlock === blockKey ? (
                                <>
                                  <Check className="w-3 h-3 text-accent-soft" />
                                  <span className="text-accent-soft">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        <pre className="p-4 overflow-x-auto text-[13px] font-mono leading-[1.7] text-ink-soft">
                          <code>{children}</code>
                        </pre>
                      </div>
                    );
                  }
                  return (
                    <code className="px-1.5 py-0.5 rounded-md bg-white/[0.07] text-ink text-[0.88em] font-mono" {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          <div className="flex items-center gap-1 pt-1">
            <button
              onClick={() => copyTextToClipboard(message.content)}
              className="flex items-center gap-1.5 text-[12px] text-ink-faint hover:text-ink px-2.5 py-1.5 rounded-lg hover:bg-white/[0.05] transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-accent-soft" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="flex items-center gap-1.5 text-[12px] text-ink-faint hover:text-ink px-2.5 py-1.5 rounded-lg hover:bg-white/[0.05] transition-colors"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Try again</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
