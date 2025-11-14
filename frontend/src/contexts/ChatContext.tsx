'use client'

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Message, Chat } from '@/types/chat';
import { logger } from '@/utils/logger';
import { 
  startChat, 
  sendMessage as sendChatMessage, 
  uploadFile as uploadChatFile,
  getChats,
  getChat,
  createChat as createChatAPI,
  addMessage as addMessageAPI,
  deleteChat as deleteChatAPI,
  searchChats as searchChatsAPI,
  streamMessage as streamMessageAPI,
  ChatData
} from '@/lib/chat-api';

interface ChatContextType {
  chats: Chat[];
  currentChat: Chat | null;
  isLoading: boolean;
  error: string | null;
  createNewChat: () => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  uploadFile: (file: File) => Promise<void>;
  selectChat: (chatId: string) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  clearError: () => void;
  searchChats: (query: string) => Promise<void>;
  loadChatHistory: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Helper function to convert ChatData to Chat
const convertChatDataToChat = (chatData: ChatData): Chat => {
  // Handle both 'id' and '_id' fields (Beanie might return _id)
  const chatId = chatData.id || (chatData as any)._id;
  
  if (!chatId) {
    logger.error('ChatData missing ID:', chatData);
    throw new Error('Chat data is missing an ID field');
  }
  
  const idString = String(chatId);
  
  return {
    id: idString,
    title: chatData.title,
    messages: chatData.messages.map((msg, idx) => ({
      id: `${idString}-${idx}`,
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
      file_url: msg.file_url,
      reactions: msg.reactions,
      is_regenerated: msg.is_regenerated,
    })),
    createdAt: new Date(chatData.created_at),
    updatedAt: new Date(chatData.updated_at),
    sessionId: chatData.session_id,
    user_id: chatData.user_id,
    is_deleted: chatData.is_deleted,
    is_shared: chatData.is_shared,
    share_token: chatData.share_token,
    shared_at: chatData.shared_at ? new Date(chatData.shared_at) : undefined,
  };
};

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load chats from backend on mount
  const loadChatHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const chatDataList = await getChats(0, 50);
      const convertedChats = chatDataList.map(convertChatDataToChat);
      setChats(convertedChats);
    } catch (err: any) {
      logger.error('Error loading chat history:', err);
      // Don't set error here - allow fallback to empty state
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChatHistory();
  }, [loadChatHistory]);

  const createNewChat = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Start chat session
      const sessionResponse = await startChat();
      
      // Create chat in database
      const chatData = await createChatAPI(sessionResponse.session_id, 'New Chat');
      
      // Convert to Chat format
      const newChat = convertChatDataToChat(chatData);
      
      // Add greeting message if available
      if (sessionResponse.message) {
        newChat.messages.push({
          id: `${newChat.id}-0`,
          role: 'assistant',
          content: sessionResponse.message,
          timestamp: new Date(),
        });
      }

      setChats(prev => [newChat, ...prev]);
      setCurrentChat(newChat);
    } catch (err: any) {
      setError(err.message || 'Failed to create new chat');
      logger.error('Error creating new chat:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectChat = useCallback(async (chatId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if chat is already loaded
      let chat = chats.find(c => c.id === chatId);
      
      if (!chat) {
        // Load chat from backend
        const chatData = await getChat(chatId);
        chat = convertChatDataToChat(chatData);
        // Add to chats list if not present
        setChats(prev => {
          const exists = prev.find(c => c.id === chatId);
          if (!exists) {
            return [chat!, ...prev];
          }
          return prev;
        });
      }

      setCurrentChat(chat);
    } catch (err: any) {
      setError(err.message || 'Failed to load chat');
      logger.error('Error selecting chat:', err);
    } finally {
      setIsLoading(false);
    }
  }, [chats]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      try {
        setIsLoading(true);
        setError(null);

        let chatToUse = currentChat;
        let sessionId: string;

        // Step 1: Ensure we have a valid chat with ID
        if (!chatToUse) {
          const sessionResponse = await startChat();
          sessionId = sessionResponse.session_id;
          
          const chatData = await createChatAPI(sessionId, content.substring(0, 50));
          chatToUse = convertChatDataToChat(chatData);
          
          // Validate chat was created successfully
          if (!chatToUse.id) {
            throw new Error('Failed to create chat: No ID returned');
          }
          
          // Add greeting if available
          if (sessionResponse.message) {
            chatToUse.messages.push({
              id: `${chatToUse.id}-0`,
              role: 'assistant',
              content: sessionResponse.message,
              timestamp: new Date(),
            });
          }

          setChats(prev => [chatToUse!, ...prev]);
          setCurrentChat(chatToUse);
        } else {
          sessionId = chatToUse.sessionId || chatToUse.session_id || '';
        }

        // Step 2: Validate before proceeding (single validation point)
        if (!sessionId) {
          throw new Error('No session ID available');
        }
        
        if (!chatToUse?.id) {
          throw new Error('Invalid chat state: missing chat ID');
        }

        // Store chat ID once to avoid repeated checks
        const chatId = chatToUse.id;

        // Step 3: Create and save user message
        const userMessage: Message = {
          id: `${chatId}-${Date.now()}`,
          role: 'user',
          content,
          timestamp: new Date(),
        };

        // Update UI immediately (optimistic update)
        const updatedMessages = [...(chatToUse.messages || []), userMessage];
        const updatedChat = {
          ...chatToUse,
          messages: updatedMessages,
          updatedAt: new Date(),
        };

        setCurrentChat(updatedChat);
        setChats(prev => prev.map(c => c.id === chatId ? updatedChat : c));

        // Save user message to backend
        await addMessageAPI(chatId, {
          role: 'user',
          content,
        });

        // Step 4: Create placeholder for AI message
        const aiMessageId = `${chatId}-${Date.now() + 1}`;
        const aiMessage: Message = {
          id: aiMessageId,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
          isStreaming: true,
        };

        const messagesWithPlaceholder = [...updatedMessages, aiMessage];
        const chatWithPlaceholder = {
          ...updatedChat,
          messages: messagesWithPlaceholder,
          updatedAt: new Date(),
        };

        setCurrentChat(chatWithPlaceholder);
        setChats(prev => prev.map(c => c.id === chatId ? chatWithPlaceholder : c));

        // Step 5: Stream AI response
        try {
          await streamMessageAPI(
            chatId,
            content,
            // On chunk received
            (chunk: string) => {
              setCurrentChat(prev => {
                if (!prev || prev.id !== chatId) return prev;
                return {
                  ...prev,
                  messages: prev.messages.map(msg =>
                    msg.id === aiMessageId
                      ? { ...msg, content: msg.content + chunk }
                      : msg
                  ),
                };
              });
              
              setChats(prev => prev.map(c =>
                c.id === chatId
                  ? {
                      ...c,
                      messages: c.messages.map(msg =>
                        msg.id === aiMessageId
                          ? { ...msg, content: msg.content + chunk }
                          : msg
                      ),
                    }
                  : c
              ));
            },
            // On complete - Backend already saved the message during streaming
            (fullResponse: string) => {
              // Update message to remove streaming flag (NO duplicate save)
              setCurrentChat(prev => {
                if (!prev || prev.id !== chatId) return prev;
                return {
                  ...prev,
                  messages: prev.messages.map(msg =>
                    msg.id === aiMessageId
                      ? { ...msg, content: fullResponse, isStreaming: false }
                      : msg
                  ),
                  updatedAt: new Date(),
                };
              });
              
              setChats(prev => prev.map(c =>
                c.id === chatId
                  ? {
                      ...c,
                      messages: c.messages.map(msg =>
                        msg.id === aiMessageId
                          ? { ...msg, content: fullResponse, isStreaming: false }
                          : msg
                      ),
                      updatedAt: new Date(),
                    }
                  : c
              ));
              // NOTE: Backend already saved the AI message during streaming, so no need to save again
            },
            // On error
            (error: string) => {
              setError(error);
              // Remove streaming message on error
              setCurrentChat(prev => {
                if (!prev || prev.id !== chatId) return prev;
                return {
                  ...prev,
                  messages: prev.messages.filter(msg => msg.id !== aiMessageId),
                };
              });
              
              setChats(prev => prev.map(c =>
                c.id === chatId
                  ? {
                      ...c,
                      messages: c.messages.filter(msg => msg.id !== aiMessageId),
                    }
                  : c
              ));
            }
          );
        } catch (streamError: any) {
          // Fallback to non-streaming if streaming fails
          logger.warn('Streaming failed, falling back to regular request:', streamError);
          
          // Remove streaming placeholder
          setCurrentChat(prev => {
            if (!prev || prev.id !== chatId) return prev;
            return {
              ...prev,
              messages: prev.messages.filter(msg => msg.id !== aiMessageId),
            };
          });
          
          const response = await sendChatMessage(sessionId, content);

          // Update with full response
          const finalMessages = [...updatedMessages, {
            id: aiMessageId,
            role: 'assistant' as const,
            content: response.message,
            timestamp: new Date(),
            isStreaming: false,
          }];
          
          const finalChat = {
            ...updatedChat,
            messages: finalMessages,
            updatedAt: new Date(),
          };

          setCurrentChat(finalChat);
          setChats(prev => prev.map(c => c.id === chatId ? finalChat : c));

          // Save AI message to backend (fallback path)
          await addMessageAPI(chatId, {
            role: 'assistant',
            content: response.message,
          });
        }

        // Refresh chat list to update timestamps
        await loadChatHistory();
        
        // Reload current chat to get updated messages from backend
        try {
          const { getChat } = await import('@/lib/chat-api');
          const updatedChatData = await getChat(chatId);
          const updatedChat = convertChatDataToChat(updatedChatData);
          setCurrentChat(updatedChat);
          } catch (e) {
            logger.error('Failed to reload chat:', e);
            // Non-critical error, continue
          }
      } catch (err: any) {
        setError(err.message || 'Failed to send message');
        logger.error('Error sending message:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [currentChat, isLoading, loadChatHistory]
  );

  const uploadFile = useCallback(
    async (file: File) => {
      let chatToUse = currentChat;

      try {
        setIsLoading(true);
        setError(null);

        // Create chat if none exists
        if (!chatToUse) {
          const sessionResponse = await startChat();
          const chatData = await createChatAPI(sessionResponse.session_id, 'New Chat');
          chatToUse = convertChatDataToChat(chatData);
          
          // Verify chat was created with valid ID
          if (!chatToUse.id) {
            throw new Error('Failed to create chat: No ID returned');
          }
          
          if (sessionResponse.message) {
            chatToUse.messages.push({
              id: `${chatToUse.id}-0`,
              role: 'assistant',
              content: sessionResponse.message,
              timestamp: new Date(),
            });
          }

          setChats(prev => [chatToUse!, ...prev]);
          setCurrentChat(chatToUse);
        }

        const sessionId = chatToUse!.sessionId || chatToUse!.session_id;
        if (!sessionId) {
          setError('No active chat session');
          return;
        }

        // Verify chat has valid ID
        if (!chatToUse.id) {
          setError('Chat ID is missing');
          return;
        }

        const response = await uploadChatFile(file, sessionId);

        // Add assistant message about file upload
        const assistantMessage: Message = {
          id: `${chatToUse.id}-${Date.now()}`,
          role: 'assistant',
          content: response.message || `File ${response.file_name} uploaded successfully.`,
          timestamp: new Date(),
          file_url: response.file_name,
        };

        const updatedMessages = [...(chatToUse.messages || []), assistantMessage];
        const updatedChat = {
          ...chatToUse,
          messages: updatedMessages,
          updatedAt: new Date(),
        };

        setCurrentChat(updatedChat);
        setChats(prev => prev.map(c => c.id === updatedChat.id ? updatedChat : c));

        // Save message to backend - only if chat has valid ID
        if (chatToUse.id) {
          await addMessageAPI(chatToUse.id, {
            role: 'assistant',
            content: assistantMessage.content,
            file_url: assistantMessage.file_url,
          });
        }

        // Refresh chat list
        await loadChatHistory();
      } catch (err: any) {
        setError(err.message || 'Failed to upload file');
        logger.error('Error uploading file:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [currentChat, chats, loadChatHistory]
  );

  const deleteChat = useCallback(
    async (chatId: string) => {
      try {
        setIsLoading(true);
        setError(null);

        // Delete from backend
        await deleteChatAPI(chatId);

        // Update local state
        setChats(prev => prev.filter(c => c.id !== chatId));
        
        // Clear current chat if it was deleted
        if (currentChat?.id === chatId) {
          setCurrentChat(null);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to delete chat');
        logger.error('Error deleting chat:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [currentChat]
  );

  const searchChatsHandler = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      await loadChatHistory();
      return;
    }

    try {
      setIsLoading(true);
      const results = await searchChatsAPI(query);
      const convertedChats = results.map(convertChatDataToChat);
      setChats(convertedChats);
    } catch (err: any) {
      logger.error('Search failed:', err);
      // Fall back to loading all chats
      await loadChatHistory();
    } finally {
      setIsLoading(false);
    }
  }, [loadChatHistory]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChat,
        isLoading,
        error,
        createNewChat,
        sendMessage,
        uploadFile,
        selectChat,
        deleteChat,
        clearError,
        searchChats: searchChatsHandler,
        loadChatHistory,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
