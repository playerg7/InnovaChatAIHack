import React, { useState } from 'react';
import { Terminal, User, Copy, Check } from 'lucide-react';
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
  const [copiedSegments, setCopiedSegments] = useState<{[key: number]: boolean}>({});
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedSegments(prev => ({ ...prev, [index]: true }));
    setTimeout(() => {
      setCopiedSegments(prev => ({ ...prev, [index]: false }));
    }, 2000);
  };

  const processContent = (content: string) => {
    const segments = [];
    let currentPos = 0;
    const codeBlockRegex = /```(?:\w+)?\n?([^`]+)```/g;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > currentPos) {
        segments.push({
          type: 'text',
          content: content.slice(currentPos, match.index).trim()
        });
      }
      segments.push({
        type: 'code',
        content: match[1].trim()
      });
      currentPos = match.index + match[0].length;
    }

    if (currentPos < content.length) {
      segments.push({
        type: 'text',
        content: content.slice(currentPos).trim()
      });
    }

    return segments.length > 0 ? segments : [{ type: 'text', content }];
  };

  const renderTypingContent = () => {
    const segments = processContent(message.content);
    return (
      <div className="space-y-4">
        {segments.map((segment, index) => (
          <div key={index}>
            {segment.type === 'code' ? (
              <div className="relative group">
                <pre className="bg-[#0a0c10] text-[#00ff95] p-4 rounded-lg border border-[#00ff9550] overflow-x-auto">
                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopy(segment.content, index)}
                      className={`p-2 rounded-lg ${
                        isDark
                          ? 'hover:bg-[#00ff9520] text-[#00ff95]'
                          : 'hover:bg-emerald-100 text-emerald-600'
                      }`}
                      title="Copy code"
                    >
                      {copiedSegments[index] ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <TypeAnimation
                    sequence={[
                      segment.content,
                      () => {
                        if (index === segments.length - 1) {
                          setIsTypingComplete(true);
                        }
                      }
                    ]}
                    wrapper="code"
                    speed={75}
                    cursor={false}
                    className="block whitespace-pre"
                  />
                </pre>
              </div>
            ) : (
              <div className="relative group">
                <TypeAnimation
                  sequence={[
                    segment.content,
                    () => {
                      if (index === segments.length - 1) {
                        setIsTypingComplete(true);
                      }
                    }
                  ]}
                  wrapper="div"
                  speed={75}
                  cursor={index === segments.length - 1 && !isTypingComplete}
                  className={`prose max-w-none ${isDark ? 'prose-invert' : 'prose-emerald'}`}
                />
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleCopy(segment.content, index)}
                    className={`p-2 rounded-lg ${
                      isDark
                        ? 'hover:bg-[#00ff9520] text-[#00ff95]'
                        : 'hover:bg-emerald-100 text-emerald-600'
                    }`}
                    title="Copy text"
                  >
                    {copiedSegments[index] ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
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
          <div className={`font-mono text-sm md:text-base ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {!isUser && isLatest ? (
              renderTypingContent()
            ) : (
              <div className={`prose ${isDark ? 'prose-invert' : 'prose-emerald'} max-w-none relative group`}>
                <ReactMarkdown>{message.content}</ReactMarkdown>
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}