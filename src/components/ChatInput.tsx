import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUp,
  Paperclip,
  X,
  Square,
  FileCode2,
  Bug,
  Braces,
  Database,
  FlaskConical
} from 'lucide-react';
import type { Attachment } from '../types';

interface ChatInputProps {
  onSendMessage: (text: string, attachments?: Attachment[]) => void;
  isGenerating: boolean;
  onStopGeneration?: () => void;
}

const QUICK_ACTIONS = [
  { icon: Bug, label: 'Debug code', snippet: 'Debug this code and explain the errors:' },
  { icon: Braces, label: 'Explain algorithm', snippet: 'Explain this algorithm step by step, with time and space complexity:' },
  { icon: Database, label: 'Optimise SQL', snippet: 'Optimise this SQL query for performance:' },
  { icon: FlaskConical, label: 'Write tests', snippet: 'Write unit tests covering the edge cases for:' }
];

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isGenerating,
  onStopGeneration
}) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 220)}px`;
    }
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((text.trim() || attachments.length > 0) && !isGenerating) {
      onSendMessage(text.trim(), attachments);
      setText('');
      setAttachments([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string || '';
        const newAtt: Attachment = {
          id: Math.random().toString(36).substring(7),
          name: file.name,
          type: file.name.match(/\.(png|jpg|jpeg|svg)$/i) ? 'image' : 'code',
          content: content,
          size: file.size
        };
        setAttachments(prev => [...prev, newAtt]);
      };
      reader.readAsText(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const quickAction = (snippet: string) => {
    setText(prev => prev ? `${prev}\n\n${snippet}` : snippet);
    textareaRef.current?.focus();
  };

  const canSend = text.trim().length > 0 || attachments.length > 0;

  return (
    <div className="w-full px-5 md:px-8 pb-6 pt-2">
      <div className="max-w-3xl mx-auto space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {QUICK_ACTIONS.map(({ icon: Icon, label, snippet }) => (
            <button
              key={label}
              onClick={() => quickAction(snippet)}
              className="shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-full text-[12px] font-medium text-ink-muted hover:text-ink wise-panel-flat"
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="wise-composer rounded-[22px]">
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 px-4 pt-4">
              {attachments.map(att => (
                <div key={att.id} className="flex items-center gap-2 pl-2.5 pr-2 py-1.5 rounded-lg bg-white/[0.05] text-[12px] text-ink-soft">
                  <FileCode2 className="w-3.5 h-3.5 text-ink-faint" />
                  <span className="truncate max-w-[160px]">{att.name}</span>
                  <button
                    onClick={() => removeAttachment(att.id)}
                    className="text-ink-faint hover:text-ink p-0.5 rounded"
                    aria-label={`Remove ${att.name}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-end gap-2 p-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 text-ink-muted hover:text-ink rounded-xl hover:bg-white/[0.06] transition-colors shrink-0"
              title="Attach a file"
            >
              <Paperclip className="w-[18px] h-[18px]" />
            </button>

            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your code, proofs, or systems…"
              rows={1}
              className="flex-1 max-h-[220px] bg-transparent border-none text-ink text-[15px] px-1 py-2.5 focus:outline-none resize-none placeholder-ink-faint leading-relaxed"
            />

            <div className="shrink-0 pb-0.5">
              {isGenerating ? (
                <button
                  type="button"
                  onClick={onStopGeneration}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-white/[0.08] text-ink hover:bg-white/[0.14] transition-colors"
                  title="Stop generating"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!canSend}
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    canSend ? 'wise-send' : 'wise-send-idle cursor-not-allowed'
                  }`}
                  title="Send"
                >
                  <ArrowUp className="w-[18px] h-[18px]" strokeWidth={2.5} />
                </button>
              )}
            </div>
          </form>
        </div>

        <p className="text-[11px] text-center text-ink-faint">
          Wise AI can make mistakes. Check anything that matters.
        </p>
      </div>
    </div>
  );
};
