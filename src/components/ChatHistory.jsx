import React from 'react';
import { MessageSquare, Trash2, Plus, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function ChatHistory({
  messages,
  chatHistories,
  onClearHistory,
  onSelectConversation,
  onNewChat,
  currentConversationIndex,
  onCloseSidebar,
  isMobile
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`flex flex-col h-full ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
      <div className="flex items-center justify-between p-4 border-b border-opacity-20">
        <h2 className={`font-mono font-semibold ${isDark ? 'text-[#00ff95]' : 'text-emerald-600'}`}>
          Chat History
        </h2>
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
          {chatHistories.length > 0 && (
            <button
              onClick={onClearHistory}
              className={`p-2 rounded-lg hover:bg-opacity-10 ${
                isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-100 text-red-500'
              } transition-colors`}
              title="Clear History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          {isMobile && (
            <button
              onClick={onCloseSidebar}
              className={`md:hidden p-2 rounded-lg hover:bg-opacity-10 ${
                isDark
                  ? 'hover:bg-[#00ff9520] text-[#00ff95]'
                  : 'hover:bg-emerald-100 text-emerald-600'
              } transition-colors`}
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {chatHistories.length === 0 ? (
          <div className={`p-4 text-center text-sm ${
            isDark ? 'text-[#00ff95]/60' : 'text-emerald-600/60'
          }`}>
            No conversations yet
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {chatHistories.map((chat, index) => (
              <button
                key={chat.id}
                onClick={() => onSelectConversation(index)}
                className={`w-full p-3 flex items-start gap-3 rounded-lg transition-colors ${
                  isDark
                    ? `hover:bg-[#00ff9520] ${
                        currentConversationIndex === index 
                          ? 'bg-[#00ff9515] border border-[#00ff9530]' 
                          : 'border border-transparent'
                      }`
                    : `hover:bg-emerald-50 ${
                        currentConversationIndex === index 
                          ? 'bg-emerald-50/70 border border-emerald-200' 
                          : 'border border-transparent'
                      }`
                }`}
              >
                <MessageSquare 
                  className={`w-4 h-4 mt-1 flex-shrink-0 ${
                    isDark ? 'text-[#00ff95]' : 'text-emerald-600'
                  }`} 
                />
                <span className={`text-sm text-left line-clamp-2 font-mono ${
                  isDark 
                    ? currentConversationIndex === index 
                      ? 'text-[#00ff95]' 
                      : 'text-[#00ff95]/80'
                    : currentConversationIndex === index
                      ? 'text-emerald-700'
                      : 'text-emerald-600/80'
                }`}>
                  {chat.title}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}