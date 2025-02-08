import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Send, Terminal } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = '56px';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`border-t p-3 md:p-4 ${
      isDark
        ? 'border-[#00ff9520] bg-[#0a0c10]'
        : 'border-emerald-100 bg-white'
    }`}>
      <div className="max-w-3xl mx-auto relative">
        <div className="relative">
          <Terminal className={`absolute left-3 md:left-4 top-4 w-4 md:w-5 h-4 md:h-5 ${
            isDark ? 'text-[#00ff95]' : 'text-emerald-600'
          }`} />
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your command..."
            disabled={disabled}
            className={`w-full resize-none rounded-lg p-3 md:p-4 pl-10 md:pl-12 pr-10 md:pr-12 text-sm md:text-base ${
              isDark
                ? 'bg-[#0f1318] border-[#00ff9540] text-[#00ff95] placeholder-[#00ff9580]'
                : 'bg-white border-emerald-200 text-gray-800 placeholder-emerald-600/50'
            } border focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 disabled:opacity-50 font-mono`}
            style={{ minHeight: '56px', maxHeight: '200px' }}
          />
          <button
            onClick={handleSend}
            disabled={disabled || !input.trim()}
            className={`absolute right-2 md:right-3 bottom-2 md:bottom-3 rounded-lg p-2 ${
              isDark
                ? 'text-[#00ff95] hover:text-white'
                : 'text-emerald-600 hover:text-emerald-700'
            } disabled:opacity-50 disabled:hover:text-[#00ff95] transition-colors duration-200`}
          >
            <Send className="w-4 md:w-5 h-4 md:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}