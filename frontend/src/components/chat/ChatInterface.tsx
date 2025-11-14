'use client'

import React, { useEffect, useRef } from 'react';
import { useChat } from '@/contexts/ChatContext';
import ChatSidebar from './ChatSidebar';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import EmptyState from './EmptyState';
import TopNav from './TopNav';
import { Loader2 } from 'lucide-react';

export default function ChatInterface() {
  const { currentChat, sendMessage, uploadFile, isLoading, error, createNewChat, clearError } = useChat();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat?.messages]);

  // Close sidebar on mobile after selecting chat
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const handlePromptClick = async (prompt: string) => {
    // sendMessage will create a new chat if none exists
    await sendMessage(prompt);
    // Close sidebar on mobile after sending message
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <ChatSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        currentChatId={currentChat?.id || null}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <TopNav onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="mx-auto max-w-4xl px-4 py-3">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center justify-between">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                <button
                  onClick={clearError}
                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {!currentChat || currentChat.messages.filter(m => m.role === 'user').length === 0 ? (
            <EmptyState onPromptClick={handlePromptClick} />
          ) : (
            <div className="max-w-4xl mx-auto px-4 py-6">
              {currentChat.messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              
              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex justify-start mb-6">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <ChatInput onSend={sendMessage} onFileUpload={uploadFile} isLoading={isLoading} />
      </div>
    </div>
  );
}

