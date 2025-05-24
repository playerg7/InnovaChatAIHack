import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Message, ChatState, ChatHistory } from './types';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { ChatHistory as ChatHistoryComponent } from './components/ChatHistory';
import { BrainCircuit, Terminal, Shield, Sun, Moon, Menu, LogIn, User } from 'lucide-react';
import { useTheme } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import { supabase } from './lib/supabase';

// Initialize the Google Generative AI with your API key
const API_KEY = 'AIzaSyCLEkO0V1hXwduYtf0DRs4G6_lioQmb4GI';
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

function App() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === 'dark';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentConversationIndex, setCurrentConversationIndex] = useState(0);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.profile-menu') && !target.closest('.profile-button')) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Memoized function to load chat histories
  const loadChatHistories = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      if (data) {
        // Ensure we're only setting histories for the current user
        const filteredHistories = data
          .filter(history => history.user_id === user.id)
          .map(history => ({
            ...history,
            messages: Array.isArray(history.messages) ? history.messages : JSON.parse(history.messages)
          }));
        
        setChatHistories(filteredHistories);
        
        // Only load the most recent chat on initial load
        if (isInitialLoad && filteredHistories.length > 0) {
          setChatState(prev => ({
            ...prev,
            messages: filteredHistories[0].messages || [],
          }));
          setIsInitialLoad(false);
        }
      }
    } catch (error) {
      console.error('Error loading chat histories:', error);
    }
  }, [user, isInitialLoad]);

  // Load chat histories when user logs in
  useEffect(() => {
    if (user) {
      loadChatHistories();
    } else {
      setChatHistories([]);
      if (isInitialLoad) {
        setChatState({ messages: [], isLoading: false, error: null });
      }
    }
  }, [user, loadChatHistories, isInitialLoad]);

  // Memoized function to save chat history
  const saveChatHistory = useCallback(async () => {
    if (!user || chatState.messages.length === 0) return;

    try {
      const title = chatState.messages[0]?.content.substring(0, 40) + '...' || 'New Chat';
      
      const existingHistory = chatHistories[currentConversationIndex];
      
      const { error } = await supabase
        .from('chat_history')
        .upsert({
          id: existingHistory?.id,
          user_id: user.id,
          title,
          messages: JSON.stringify(chatState.messages), // Properly stringify messages
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Refresh chat histories
      loadChatHistories();
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }, [user, chatState.messages, chatHistories, currentConversationIndex, loadChatHistories]);

  // Save chat history when messages change
  useEffect(() => {
    if (user && chatState.messages.length > 0) {
      const debounceTimer = setTimeout(() => {
        saveChatHistory();
      }, 1000);

      return () => clearTimeout(debounceTimer);
    }
  }, [user, chatState.messages, saveChatHistory]);

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      await supabase.auth.signOut();
      setShowProfileMenu(false);
      setChatHistories([]); // Clear chat histories on sign out
      setChatState({ messages: [], isLoading: false, error: null }); // Reset current chat
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = { role: 'user', content, type: 'text' };
    
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }));

    try {
      // Check if it's an image request
      const isImageRequest = content.toLowerCase().includes('generate image') || 
                         content.toLowerCase().includes('create image') ||
                         content.toLowerCase().includes('make an image');

      let assistantMessage: Message;

      if (isImageRequest) {
        assistantMessage = {
          role: 'assistant',
          content: "Here's the image you requested.",
          type: 'image',
          imageUrl: 'https://images.unsplash.com/photo-1682687982501-1e58ab814714'
        };
      } else {
        try {
          const prompt = content;
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const text = response.text();

          if (!text) {
            throw new Error('Empty response from AI');
          }

          assistantMessage = {
            role: 'assistant',
            content: text,
            type: 'text'
          };
        } catch (aiError) {
          console.error('AI Error:', aiError);
          
          assistantMessage = {
            role: 'assistant',
            content: "I apologize, but I'm having trouble generating a response right now. Could you try rephrasing your question?",
            type: 'text'
          };
        }
      }

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false,
      }));

      // Save the chat immediately after adding the assistant's response
      if (user) {
        await saveChatHistory();
      }

    } catch (error) {
      console.error('Error:', error);
      setChatState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to get response from AI. Please try again.',
      }));
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all chat history?')) return;

    if (user) {
      try {
        const { error } = await supabase
          .from('chat_history')
          .delete()
          .eq('user_id', user.id);

        if (error) throw error;
        
        setChatHistories([]);
      } catch (error) {
        console.error('Error clearing chat history:', error);
      }
    }
    
    setChatState({ messages: [], isLoading: false, error: null });
    setCurrentConversationIndex(0);
  };

  const handleNewChat = () => {
    setChatState({ messages: [], isLoading: false, error: null });
    setCurrentConversationIndex(chatHistories.length);
    setIsSidebarOpen(false);
  };

  const handleSelectConversation = (index: number) => {
    if (chatHistories[index]) {
      setChatState(prev => ({
        ...prev,
        messages: chatHistories[index].messages || [],
      }));
      setCurrentConversationIndex(index);
    }
    setIsSidebarOpen(false);
  };

  const renderProfileMenu = () => {
    if (!user) return null;

    return (
      <div 
        className={`profile-menu absolute right-0 top-full mt-2 w-64 rounded-lg shadow-lg ${
          isDark ? 'bg-[#0f1318] border border-[#00ff9540]' : 'bg-white border border-emerald-100'
        } p-3 z-[100]`}
        style={{ 
          right: '0',
          transform: 'none',
          maxWidth: 'min(calc(100vw - 2rem), 14.25rem)'
        }}
      >
        <div className="px-4 py-2">
          <div className={`text-sm font-medium ${isDark ? 'text-[#00ff95]' : 'text-emerald-600'}`}>
            Signed in as
          </div>
          <div className={`text-sm truncate ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {user.email}
          </div>
        </div>
        <div className="border-t my-2 border-opacity-20 border-current"></div>
        <button
          onClick={handleSignOut}
          className={`w-full text-left px-4 py-2 text-sm rounded-md ${
            isDark
              ? 'text-red-400 hover:bg-red-500/10'
              : 'text-red-600 hover:bg-red-50'
          }`}
        >
          Sign out
        </button>
      </div>
    );
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
        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className={`profile-button p-2 rounded-lg ${
                  isDark
                    ? 'hover:bg-[#00ff9520] text-[#00ff95]'
                    : 'hover:bg-emerald-100 text-emerald-600'
                }`}
              >
                <User className="w-5 h-5" />
              </button>
              {showProfileMenu && (
                <div 
                  className={`profile-menu fixed top-14 right-4 w-64 rounded-lg shadow-lg ${
                    isDark ? 'bg-[#0f1318] border border-[#00ff9540]' : 'bg-white border-emerald-100'
                  } p-3 z-[100]`}
                  style={{ 
                    maxWidth: 'calc(100vw - 2rem)'
                  }}
                >
                  <div className="px-4 py-2">
                    <div className={`text-sm font-medium ${isDark ? 'text-[#00ff95]' : 'text-emerald-600'}`}>
                      Signed in as
                    </div>
                    <div className={`text-sm truncate ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {user.email}
                    </div>
                  </div>
                  <div className="border-t my-2 border-opacity-20 border-current"></div>
                  <button
                    onClick={handleSignOut}
                    className={`w-full text-left px-4 py-2 text-sm rounded-md ${
                      isDark
                        ? 'text-red-400 hover:bg-red-500/10'
                        : 'text-red-600 hover:bg-red-50'
                    }`}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className={`p-2 rounded-lg ${
                isDark
                  ? 'hover:bg-[#00ff9520] text-[#00ff95]'
                  : 'hover:bg-emerald-100 text-emerald-600'
              }`}
            >
              <LogIn className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg ${
              isDark
                ? 'hover:bg-[#00ff9520] text-[#00ff95]'
                : 'hover:bg-emerald-100 text-emerald-600'
            }`}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
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
          <div className="ml-auto flex items-center gap-2">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className={`profile-button p-2 rounded-lg ${
                    isDark
                      ? 'hover:bg-[#00ff9520] text-[#00ff95]'
                      : 'hover:bg-emerald-100 text-emerald-600'
                  }`}
                >
                  <User className="w-5 h-5" />
                </button>
                {showProfileMenu && renderProfileMenu()}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className={`p-2 rounded-lg ${
                  isDark
                    ? 'hover:bg-[#00ff9520] text-[#00ff95]'
                    : 'hover:bg-emerald-100 text-emerald-600'
                }`}
              >
                <LogIn className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${
                isDark
                  ? 'hover:bg-[#00ff9520] text-[#00ff95]'
                  : 'hover:bg-emerald-100 text-emerald-600'
              }`}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <div className="h-full md:h-[calc(100vh-3.5rem)] overflow-y-auto">
          <ChatHistoryComponent
            messages={chatState.messages}
            onClearHistory={handleClearHistory}
            onSelectConversation={handleSelectConversation}
            onNewChat={handleNewChat}
            currentConversationIndex={currentConversationIndex}
            chatHistories={chatHistories}
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
                  {user ? 'Secure AI Terminal' : 'Welcome to InnovaChat AI'}
                </h2>
                <p className={isDark ? 'text-[#4a9e80]' : 'text-emerald-600/70'}>
                  {user ? 'Awaiting your command...' : 'Start chatting or sign in to save your conversations'}
                </p>
                {!user && (
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className={`mt-6 px-6 py-2 rounded-lg font-medium ${
                      isDark
                        ? 'bg-[#00ff95] hover:bg-[#00ff95]/90 text-black'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    } transition-colors`}
                  >
                    Sign In
                  </button>
                )}
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
        <ChatInput 
          onSend={handleSendMessage} 
          disabled={chatState.isLoading}
          showAuthPrompt={!user && chatState.messages.length > 0}
          onAuthClick={() => setIsAuthModalOpen(true)}
        />
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}

export default App;