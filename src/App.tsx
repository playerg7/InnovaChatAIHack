import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Message, ChatState } from './types';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { ChatHistory } from './components/ChatHistory';
import { BrainCircuit, Terminal, Shield, Sun, Moon, Menu } from 'lucide-react';
import { useTheme } from './context/ThemeContext';

const genAI = new GoogleGenerativeAI('AIzaSyDOlKpEHmzkCvCc3ZprZfDijez7WMfk8Yo');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

const STORAGE_KEY = 'innovachat-history';

function App() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentConversationIndex, setCurrentConversationIndex] = useState(0);

  const [chatState, setChatState] = useState<ChatState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved
      ? JSON.parse(saved)
      : {
          messages: [],
          isLoading: false,
          error: null,
        };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chatState));
  }, [chatState.messages]);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = { role: 'user', content };
    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }));

    try {
      const result = await model.generateContent(content);
      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new Error('Empty response from AI');
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: text,
      };

      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error:', error);
      setChatState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Failed to get response from AI. Please try again.',
      }));
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all chat history?')) {
      setChatState({ messages: [], isLoading: false, error: null });
      setCurrentConversationIndex(0);
    }
  };

  const handleNewChat = () => {
    setChatState({ messages: [], isLoading: false, error: null });
    setCurrentConversationIndex(0);
    setIsSidebarOpen(false);
  };

  const handleSelectConversation = (index: number) => {
    setCurrentConversationIndex(index);
    setIsSidebarOpen(false);
  };

  return (
    <div className={`flex flex-col md:flex-row h-screen ${
      isDark ? 'bg-[#0a0c10]' : 'bg-gray-50'
    }`}>
      {/* Mobile Header */}
      <div className={`md:hidden flex h-14 items-center px-4 border-b ${
        isDark ? 'bg-[#0a0c10] border-[#00ff9520]' : 'bg-emerald-50 border-emerald-100'
      }`}>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`p-2 rounded-lg ${
            isDark ? 'text-[#00ff95]' : 'text-emerald-600'
          }`}
        >
          <Menu className="w-5 h-5" />
        </button>
        <Terminal className={`ml-2 ${isDark ? 'text-[#00ff95]' : 'text-emerald-600'} w-5 h-5`} />
        <span className={`ml-2 font-mono font-semibold ${
          isDark ? 'text-[#00ff95]' : 'text-emerald-600'
        }`}>InnovaChat AI</span>
        <button
          onClick={toggleTheme}
          className={`ml-auto p-2 rounded-lg ${
            isDark
              ? 'hover:bg-[#00ff9520] text-[#00ff95]'
              : 'hover:bg-emerald-100 text-emerald-600'
          }`}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`${
        isSidebarOpen ? 'block' : 'hidden'
      } md:block w-full md:w-[260px] fixed md:relative z-50 h-[calc(100vh-3.5rem)] md:h-screen ${
        isDark ? 'bg-[#0f1318] border-[#00ff9520]' : 'bg-white border-emerald-100'
      } md:border-r`}>
        <div className={`hidden md:flex h-14 items-center px-4 border-b ${
          isDark ? 'bg-[#0a0c10] border-[#00ff9520]' : 'bg-emerald-50 border-emerald-100'
        }`}>
          <Terminal className={isDark ? 'w-6 h-6 text-[#00ff95]' : 'w-6 h-6 text-emerald-600'} />
          <span className={`ml-2 font-mono font-semibold ${
            isDark ? 'text-[#00ff95]' : 'text-emerald-600'
          }`}>InnovaChat AI</span>
          <button
            onClick={toggleTheme}
            className={`ml-auto p-2 rounded-lg ${
              isDark
                ? 'hover:bg-[#00ff9520] text-[#00ff95]'
                : 'hover:bg-emerald-100 text-emerald-600'
            }`}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
        <div className="h-full md:h-[calc(100vh-3.5rem)] overflow-y-auto">
          <ChatHistory
            messages={chatState.messages}
            onClearHistory={handleClearHistory}
            onSelectConversation={handleSelectConversation}
            onNewChat={handleNewChat}
            currentConversationIndex={currentConversationIndex}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] md:h-screen">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 md:px-6">
            {chatState.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4 md:p-8">
                <div className="relative">
                  <Shield className={`w-16 md:w-20 h-16 md:h-20 ${
                    isDark ? 'text-[#00ff95]' : 'text-emerald-600'
                  } animate-ping`} />
                  <BrainCircuit className={`w-8 md:w-10 h-8 md:h-10 ${
                    isDark ? 'text-[#00ff95]' : 'text-emerald-600'
                  } absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`} />
                </div>
                <h2 className={`text-xl md:text-2xl font-mono font-semibold mb-2 ${
                  isDark ? 'text-[#00ff95]' : 'text-emerald-600'
                } mt-4`}>
                  Secure AI Terminal
                </h2>
                <p className={isDark ? 'text-[#4a9e80]' : 'text-emerald-600/70'}>
                  Awaiting your command...
                </p>
              </div>
            ) : (
              chatState.messages.map((message, index) => (
                <ChatMessage
                  key={index}
                  message={message}
                  isLatest={index === chatState.messages.length - 1 && message.role === 'assistant'}
                />
              ))
            )}
            {chatState.isLoading && (
              <div className={`p-4 md:p-6 text-center ${isDark ? 'text-[#00ff95]' : 'text-emerald-600'}`}>
                <div className="animate-pulse flex items-center justify-center gap-2">
                  <div className={`w-2 h-2 ${
                    isDark ? 'bg-[#00ff95]' : 'bg-emerald-600'
                  } rounded-full animate-bounce`}></div>
                  <div className={`w-2 h-2 ${
                    isDark ? 'bg-[#00ff95]' : 'bg-emerald-600'
                  } rounded-full animate-bounce [animation-delay:0.2s]`}></div>
                  <div className={`w-2 h-2 ${
                    isDark ? 'bg-[#00ff95]' : 'bg-emerald-600'
                  } rounded-full animate-bounce [animation-delay:0.4s]`}></div>
                </div>
              </div>
            )}
            {chatState.error && (
              <div className="p-4 mx-2 md:mx-6 mb-4 bg-red-900/20 border border-red-800 rounded-lg flex items-center gap-2 text-red-400 font-mono">
                <Shield className="w-5 h-5" />
                <span>{chatState.error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Chat Input */}
        <ChatInput onSend={handleSendMessage} disabled={chatState.isLoading} />
      </div>
    </div>
  );
}

export default App;