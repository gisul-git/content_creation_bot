'use client'

import React from 'react';
import { Plus, MessageSquare, Trash2, X, Search, FileText, File } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useChat } from '@/contexts/ChatContext';
import { exportUtils } from '@/lib/export-utils';
import { shareChat } from '@/lib/chat-api';

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentChatId: string | null;
}

export default function ChatSidebar({ isOpen, onToggle, currentChatId }: ChatSidebarProps) {
  const { chats, createNewChat, selectChat, deleteChat, searchChats, loadChatHistory } = useChat();
  const [hoveredChatId, setHoveredChatId] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);

  const handleDelete = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this chat?')) {
      deleteChat(chatId);
    }
  };

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length >= 2) {
      setIsSearching(true);
      await searchChats(query);
      setIsSearching(false);
    } else if (query.length === 0) {
      // Reload all chats when search is cleared
      await loadChatHistory();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 md:w-16'
        } overflow-hidden`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className={`font-semibold text-gray-900 dark:text-gray-100 ${!isOpen ? 'hidden' : ''}`}>
              Chats
            </h2>
            <button
              onClick={onToggle}
              className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New Chat Button */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={createNewChat}
              className="w-full flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium"
            >
              <Plus className="w-5 h-5" />
              {isOpen && <span>New Chat</span>}
            </button>
          </div>

          {/* Search Bar */}
          {isOpen && (
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>
          )}

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-2">
            {!isOpen ? (
              <div className="flex flex-col items-center gap-2">
                {chats.slice(0, 5).map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => {
                      selectChat(chat.id);
                      // Close sidebar on mobile after selection
                      if (typeof window !== 'undefined' && window.innerWidth < 768) {
                        onToggle();
                      }
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      currentChatId === chat.id
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                    title={chat.title}
                  >
                    <MessageSquare className="w-5 h-5" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {chats.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8 px-4">
                    No chat history. Start a new chat!
                  </p>
                ) : (
                  chats.map((chat) => (
                    <div
                      key={chat.id}
                      className={`group relative p-2 rounded-lg cursor-pointer transition-colors ${
                        currentChatId === chat.id
                          ? 'bg-blue-100 dark:bg-blue-900/30'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                       onClick={() => {
                         selectChat(chat.id);
                         // Close sidebar on mobile after selection
                         if (typeof window !== 'undefined' && window.innerWidth < 768) {
                           onToggle();
                         }
                       }}
                       onMouseEnter={() => setHoveredChatId(chat.id)}
                       onMouseLeave={() => setHoveredChatId(null)}
                     >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium truncate ${
                              currentChatId === chat.id
                                ? 'text-blue-900 dark:text-blue-100'
                                : 'text-gray-900 dark:text-gray-100'
                            }`}
                          >
                            {chat.title || 'New Chat'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true })}
                          </p>
                        </div>
                        {hoveredChatId === chat.id && (
                          <div className="flex items-center gap-1">
                            {/* Export as TXT */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                exportUtils.exportAsTxt(chat);
                              }}
                              className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors opacity-0 group-hover:opacity-100"
                              aria-label="Export as TXT"
                              title="Export as TXT"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                            {/* Export as PDF */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                exportUtils.exportAsPdf(chat);
                              }}
                              className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                              aria-label="Export as PDF"
                              title="Export as PDF"
                            >
                              <File className="w-4 h-4" />
                            </button>
                            {/* Share */}
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  const result = await shareChat(chat.id);
                                  await navigator.clipboard.writeText(result.share_url);
                                  alert('Share link copied to clipboard!');
                                } catch (error) {
                                  console.error('Failed to share chat:', error);
                                  alert('Failed to share chat');
                                }
                              }}
                              className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100"
                              aria-label="Share chat"
                              title="Share chat"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                              </svg>
                            </button>
                            {/* Delete */}
                            <button
                              onClick={(e) => handleDelete(e, chat.id)}
                              className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                              aria-label="Delete chat"
                              title="Delete chat"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

