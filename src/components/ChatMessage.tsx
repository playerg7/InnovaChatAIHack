import React from 'react';
import { Terminal, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';
import { useTheme } from '../context/ThemeContext';
import { TypeAnimation } from 'react-type-animation';

interface ChatMessageProps {
  message: Message;
  isLatest: boolean;
}

export function ChatMessage({ message, isLatest }: ChatMessageProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isUser = message.role === 'user';

  // Function to process content and preserve code blocks
  const processContent = (content: string) => {
    const codeBlockRegex = /```[\s\S]*?```/g;
    const parts = content.split(codeBlockRegex);
    const codeBlocks = content.match(codeBlockRegex) || [];
    
    let result = [];
    for (let i = 0; i < parts.length; i++) {
      if (parts[i]) result.push(parts[i]);
      if (codeBlocks[i]) result.push(codeBlocks[i]);
    }
    
    return result;
  };

  return (
    <div className={`${
      isDark
        ? isUser ? 'bg-[#0a0c10]' : 'bg-[#0f1318]'
        : isUser ? 'bg-white' : 'bg-emerald-50'
    } border-b ${isDark ? 'border-[#00ff9520]' : 'border-emerald-100'}`}>
      <div className="max-w-3xl mx-auto flex gap-3 md:gap-6 p-4 md:p-6">
        <div className="flex-shrink-0">
          <div className={`w-7 md:w-8 h-7 md:h-8 rounded-sm flex items-center justify-center ${
            isDark
              ? 'bg-[#00ff9520] border-[#00ff9540]'
              : 'bg-emerald-100 border-emerald-200'
          } border`}>
            {isUser ? (
              <User className={`w-4 md:w-5 h-4 md:h-5 ${
                isDark ? 'text-[#00ff95]' : 'text-emerald-600'
              }`} />
            ) : (
              <Terminal className={`w-4 md:w-5 h-4 md:h-5 ${
                isDark ? 'text-[#00ff95]' : 'text-emerald-600'
              }`} />
            )}
          </div>
        </div>
        <div className="flex-1 space-y-2 overflow-x-auto">
          <div className={`font-mono text-sm md:text-base ${
            isDark ? 'text-[#00ff95]' : 'text-emerald-600'
          }`}>
            {isUser ? '> User' : '> System'}
          </div>
          <div className={`prose ${isDark ? 'prose-invert' : ''} prose-pre:bg-[#0a0c10] prose-pre:text-[#00ff95] max-w-none font-mono text-sm md:text-base`}>
            {!isUser && isLatest ? (
              <div>
                {processContent(message.content).map((part, index) => (
                  <TypeAnimation
                    key={index}
                    sequence={[part]}
                    wrapper="div"
                    speed={75}
                    cursor={false}
                    className={part.startsWith('```') ? 'whitespace-pre-wrap' : ''}
                  />
                ))}
              </div>
            ) : (
              <ReactMarkdown>{message.content}</ReactMarkdown>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}