import React from 'react';
import { Message } from '../types';
import { MessageSquare, Trash2, Plus } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ChatHistoryProps {
  messages: Message[];
  onClearHistory: () => void;
  onSelectConversation: (index: number) => void;
  onNewChat: () => void;
  currentConversationIndex: number;
}

export function ChatHistory({
  messages,
  onClearHistory,
  onSelectConversation,
  onNewChat,
  currentConversationIndex
}: ChatHistoryProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const conversations = messages.reduce((acc: { first: string; messages: Message[] }[], message, index) => {
    if (message.role === 'user') {
      if (index === 0 || messages[index - 1].role === 'assistant') {
        acc.push({ first: message.content, messages: [message] });
      } else {
        acc[acc.length - 1].messages.push(message);
      }
    } else {
      if (acc.length > 0) {
        acc[acc.length - 1].messages.push(message);
      }
    }
    return acc;
  }, []);

  return (
    <div className={`flex flex-col h-full ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
      <div className="flex items-center justify-between p-4">
        <h2 className="font-mono font-semibold">Chat History</h2>
        <div className="flex gap-2">
          <button
            onClick={onNewChat}
            className={`p-2 rounded-lg hover:bg-opacity-10 ${
              isDark
                ? 'hover:bg-[#00ff9520] text-[#00ff95]'
                : 'hover:bg-emerald-100 text-emerald-600'
            } transition-colors`}
            title="New Chat"
          >
            <Plus className="w-4 h-4" />
          </button>
          {conversations.length > 0 && (
            <button
              onClick={onClearHistory}
              className={`p-2 rounded-lg hover:bg-opacity-10 ${
                isDark ? 'hover:bg-red-500' : 'hover:bg-red-200'
              } transition-colors`}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-sm opacity-70">
            No conversations yet
          </div>
        ) : (
          conversations.map((conv, index) => (
            <button
              key={index}
              onClick={() => onSelectConversation(index)}
              className={`w-full p-3 flex items-start gap-3 hover:bg-opacity-10 ${
                isDark
                  ? `hover:bg-[#00ff9520] border-b border-[#00ff9520] ${
                      currentConversationIndex === index ? 'bg-[#00ff9510]' : ''
                    }`
                  : `hover:bg-emerald-50 border-b border-emerald-100 ${
                      currentConversationIndex === index ? 'bg-emerald-50' : ''
                    }`
              }`}
            >
              <MessageSquare className={`w-4 h-4 mt-1 ${isDark ? 'text-[#00ff95]' : 'text-emerald-600'}`} />
              <span className="text-sm text-left line-clamp-2 font-mono">
                {conv.first}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}