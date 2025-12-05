import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';

interface InputAreaProps {
  onSendMessage: (text: string) => void;
  disabled: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, disabled }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (text.trim() && !disabled) {
      onSendMessage(text);
      setText('');
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

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [text]);

  return (
    <div className="w-full bg-white/80 backdrop-blur-md border-t border-gray-200 p-4 pb-6 md:pb-4">
      <div className="max-w-3xl mx-auto relative">
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-gray-50 border border-gray-300 rounded-3xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-zentro-500 focus-within:border-transparent transition-all">
          
          <div className="text-zentro-500 pb-2 hidden sm:block">
             <Sparkles size={20} />
          </div>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Ask Zentro anything..."
            className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-[150px] py-2 text-gray-800 placeholder-gray-400 leading-relaxed disabled:opacity-50"
            rows={1}
            style={{ minHeight: '44px' }}
          />
          
          <button
            type="submit"
            disabled={!text.trim() || disabled}
            className={`
              p-2 rounded-full mb-1 transition-all duration-200
              ${text.trim() && !disabled 
                ? 'bg-zentro-600 text-white shadow-md hover:bg-zentro-700 hover:scale-105' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            <Send size={18} />
          </button>
        </form>
        <div className="text-center mt-2">
            <p className="text-[10px] text-gray-400">
                Zentro AI can make mistakes. Consider checking important information.
            </p>
        </div>
      </div>
    </div>
  );
};
