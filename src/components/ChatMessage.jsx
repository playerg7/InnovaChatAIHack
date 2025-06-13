import React, { useState, useEffect, useRef } from 'react';
import { Terminal, User, Copy, Check, Image as ImageIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useTheme } from '../context/ThemeContext';

export function ChatMessage({ message, isLatest }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isUser = message.role === 'user';
  const [copiedSegments, setCopiedSegments] = useState({});
  const [displayedContent, setDisplayedContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingRef = useRef(null);

  const handleCopy = async (text, index) => {
    await navigator.clipboard.writeText(text);
    setCopiedSegments(prev => ({ ...prev, [index]: true }));
    setTimeout(() => {
      setCopiedSegments(prev => ({ ...prev, [index]: false }));
    }, 2000);
  };

  useEffect(() => {
    if (!isUser && isLatest && message.content !== displayedContent) {
      setIsTyping(true);
      let currentIndex = 0;
      const content = message.content;
      
      const typeCharacter = () => {
        if (currentIndex <= content.length) {
          setDisplayedContent(content.slice(0, currentIndex));
          currentIndex++;
          
          // Vary the typing speed for more natural effect
          const baseDelay = 10; // Base delay in milliseconds
          const variableDelay = Math.random() * 15; // Random delay between 0-15ms
          const punctuationDelay = ['.', '!', '?', '\n'].includes(content[currentIndex - 1]) ? 300 : 0;
          
          typingRef.current = setTimeout(typeCharacter, baseDelay + variableDelay + punctuationDelay);
        } else {
          setIsTyping(false);
        }
      };

      typeCharacter();

      return () => {
        if (typingRef.current) {
          clearTimeout(typingRef.current);
        }
      };
    }
  }, [isUser, isLatest, message.content, displayedContent]);

  const renderContent = () => {
    const contentToRender = (!isUser && isLatest) ? displayedContent : message.content;

    return (
      <div className={`prose max-w-none relative group ${isDark ? 'prose-invert' : 'prose-emerald'}`}>
        <div className={`${isTyping ? 'border-r-2 border-[#00ff95] animate-pulse' : ''}`}>
          <ReactMarkdown>{contentToRender}</ReactMarkdown>
        </div>
        {message.type === 'image' && message.imageUrl && (
          <div className="mt-4">
            <img 
              src={message.imageUrl} 
              alt="Generated content"
              className="rounded-lg shadow-lg max-w-full h-auto"
            />
          </div>
        )}
        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => handleCopy(message.content, -1)}
            className={`p-2 rounded-lg ${
              isDark
                ? 'hover:bg-[#00ff9520] text-[#00ff95]'
                : 'hover:bg-emerald-100 text-emerald-600'
            }`}
            title="Copy message"
          >
            {copiedSegments[-1] ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    );
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
              message.type === 'image' ? (
                <ImageIcon className={`w-4 md:w-5 h-4 md:h-5 ${
                  isDark ? 'text-[#00ff95]' : 'text-emerald-600'
                }`} />
              ) : (
                <Terminal className={`w-4 md:w-5 h-4 md:h-5 ${
                  isDark ? 'text-[#00ff95]' : 'text-emerald-600'
                }`} />
              )
            )}
          </div>
        </div>
        <div className="flex-1 space-y-2 overflow-x-auto">
          <div className={`font-mono text-sm md:text-base ${
            isDark ? 'text-[#00ff95]' : 'text-emerald-600'
          }`}>
            {isUser ? '> User' : '> System'}
          </div>
          <div className={`font-mono text-sm md:text-base ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}