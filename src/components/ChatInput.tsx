import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  X, 
  Code, 
  StopCircle, 
  Terminal, 
  Cpu,
  Sparkles
} from 'lucide-react';
import type { Attachment } from '../types';

interface ChatInputProps {
  onSendMessage: (text: string, attachments?: Attachment[]) => void;
  isGenerating: boolean;
  onStopGeneration?: () => void;
}

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
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
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
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4 pt-2">
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 scrollbar-none text-[11px] text-zinc-400">
        <button
          onClick={() => quickAction('Debug code and explain errors:')}
          className="shrink-0 flex items-center space-x-1 px-2.5 py-1 rounded-md bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 text-zinc-300 transition-colors"
        >
          <Code className="w-3 h-3 text-zinc-400" />
          <span>Debug Code</span>
        </button>
        <button
          onClick={() => quickAction('Explain algorithm step-by-step with time complexity:')}
          className="shrink-0 flex items-center space-x-1 px-2.5 py-1 rounded-md bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 text-zinc-300 transition-colors"
        >
          <Sparkles className="w-3 h-3 text-zinc-400" />
          <span>Explain Algorithm</span>
        </button>
        <button
          onClick={() => quickAction('Optimize SQL query for performance:')}
          className="shrink-0 flex items-center space-x-1 px-2.5 py-1 rounded-md bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 text-zinc-300 transition-colors"
        >
          <Terminal className="w-3 h-3 text-zinc-400" />
          <span>Optimize SQL</span>
        </button>
        <button
          onClick={() => quickAction('Write unit tests with edge cases for:')}
          className="shrink-0 flex items-center space-x-1 px-2.5 py-1 rounded-md bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 text-zinc-300 transition-colors"
        >
          <Cpu className="w-3 h-3 text-zinc-400" />
          <span>Unit Tests</span>
        </button>
      </div>

      <div className="relative rounded-xl bg-[#121215] border border-zinc-800/80 focus-within:border-zinc-600 transition-all">
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-1.5 p-2.5 border-b border-zinc-800/60">
            {attachments.map(att => (
              <div key={att.id} className="flex items-center space-x-1.5 px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-300">
                <Code className="w-3 h-3 text-zinc-400" />
                <span className="truncate max-w-[140px]">{att.name}</span>
                <button onClick={() => removeAttachment(att.id)} className="text-zinc-500 hover:text-zinc-300 ml-1">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-end p-2">
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
            className="p-2 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-800/60 transition-colors shrink-0"
            title="Attach file"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Send a message..."
            rows={1}
            className="flex-1 max-h-[180px] bg-transparent border-none text-zinc-100 text-sm px-2 py-1.5 focus:outline-none resize-none placeholder-zinc-500 font-sans leading-relaxed"
          />

          <div className="flex items-center space-x-1 shrink-0">
            {isGenerating ? (
              <button
                type="button"
                onClick={onStopGeneration}
                className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-lg bg-zinc-800 transition-all"
                title="Stop generation"
              >
                <StopCircle className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!text.trim() && attachments.length === 0}
                className={`p-1.5 rounded-lg transition-all ${
                  text.trim() || attachments.length > 0
                    ? 'bg-zinc-100 text-zinc-950 hover:bg-white cursor-pointer'
                    : 'bg-zinc-800/60 text-zinc-600 cursor-not-allowed'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </form>
      </div>

      <p className="text-[10px] text-center text-zinc-500 mt-2">
        Wise AI • Multi-LLM interface for Computer Science
      </p>
    </div>
  );
};
