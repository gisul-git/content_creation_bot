'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Message, Chat } from '@/types/chat';
import { startChat, sendMessage as sendChatMessage, uploadFile as uploadChatFile } from '@/lib/chat-api';

interface ChatContextType {
  chats: Chat[];
  currentChat: Chat | null;
  isLoading: boolean;
  error: string | null;
  createNewChat: () => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  uploadFile: (file: File) => Promise<void>;
  selectChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  clearError: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load chats from localStorage on mount
  React.useEffect(() => {
    const savedChats = localStorage.getItem('chat_history');
    if (savedChats) {
      try {
        const parsed = JSON.parse(savedChats);
        const chatsWithDates = parsed.map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          updatedAt: new Date(chat.updatedAt),
          messages: chat.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }));
        setChats(chatsWithDates);
      } catch (e) {
        console.error('Error loading chat history:', e);
      }
    }
  }, []);

  // Save chats to localStorage whenever they change
  React.useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem('chat_history', JSON.stringify(chats));
    }
  }, [chats]);

  const saveChats = useCallback((updatedChats: Chat[]) => {
    setChats(updatedChats);
  }, []);

  const createNewChat = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await startChat();
      const newChat: Chat = {
        id: response.session_id,
        title: 'New Chat',
        messages: [
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: response.message,
            timestamp: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        sessionId: response.session_id,
      };

      const updatedChats = [newChat, ...chats];
      saveChats(updatedChats);
      setCurrentChat(newChat);
    } catch (err: any) {
      setError(err.message || 'Failed to create new chat');
      console.error('Error creating new chat:', err);
    } finally {
      setIsLoading(false);
    }
  }, [chats, saveChats]);

  const sendMessage = useCallback(
    async (content: string) => {
      let chatToUse = currentChat;
      let sessionId: string;

      try {
        setIsLoading(true);
        setError(null);

        // Add user message immediately (optimistic update)
        const userMessage: Message = {
          id: Date.now().toString(),
          role: 'user',
          content,
          timestamp: new Date(),
        };

        if (!chatToUse) {
          // Create new chat and send message
          const response = await startChat(content);
          sessionId = response.session_id;
          
          const newChat: Chat = {
            id: sessionId,
            title: content.substring(0, 50),
            messages: [userMessage],
            createdAt: new Date(),
            updatedAt: new Date(),
            sessionId,
          };

          // Update state
          setCurrentChat(newChat);
          const updatedChats = [newChat, ...chats];
          saveChats(updatedChats);
          chatToUse = newChat;
          
          // Add assistant response
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: response.message,
            timestamp: new Date(),
          };

          const finalChat = {
            ...newChat,
            messages: [userMessage, assistantMessage],
            updatedAt: new Date(),
          };

          setCurrentChat(finalChat);
          const finalChats = [finalChat, ...chats.filter(c => c.id !== newChat.id)];
          saveChats(finalChats);
        } else {
          // Use existing chat
          sessionId = chatToUse.sessionId!;
          
          const updatedMessages = [...(chatToUse.messages || []), userMessage];
          const updatedChat = {
            ...chatToUse,
            messages: updatedMessages,
            title: chatToUse.title === 'New Chat' ? content.substring(0, 50) : chatToUse.title,
            updatedAt: new Date(),
          };

          // Update current chat
          setCurrentChat(updatedChat);

          // Update in chats array
          const updatedChats = chats.map((c) => (c.id === chatToUse!.id ? updatedChat : c));
          saveChats(updatedChats);

          // Send to backend
          const response = await sendChatMessage(sessionId, content);

          // Add assistant response
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: response.message,
            timestamp: new Date(),
          };

          const finalMessages = [...updatedMessages, assistantMessage];
          const finalChat = {
            ...updatedChat,
            messages: finalMessages,
            updatedAt: new Date(),
          };

          setCurrentChat(finalChat);
          const finalChats = chats.map((c) => (c.id === chatToUse!.id ? finalChat : c));
          saveChats(finalChats);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to send message');
        console.error('Error sending message:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [currentChat, chats, createNewChat, saveChats]
  );

  const uploadFile = useCallback(
    async (file: File) => {
      if (!currentChat) {
        await createNewChat();
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const chatToUse = currentChat || chats[0];
      if (!chatToUse?.sessionId) {
        setError('No active chat session');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await uploadChatFile(file, chatToUse.sessionId);

        // Add assistant message about file upload
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: response.message,
          timestamp: new Date(),
        };

        const updatedMessages = [...(chatToUse.messages || []), assistantMessage];
        const updatedChat = {
          ...chatToUse,
          messages: updatedMessages,
          updatedAt: new Date(),
        };

        setCurrentChat(updatedChat);
        const updatedChats = chats.map((c) => (c.id === chatToUse.id ? updatedChat : c));
        saveChats(updatedChats);
      } catch (err: any) {
        setError(err.message || 'Failed to upload file');
        console.error('Error uploading file:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [currentChat, chats, createNewChat, saveChats]
  );

  const selectChat = useCallback((chatId: string) => {
    const chat = chats.find((c) => c.id === chatId);
    if (chat) {
      setCurrentChat(chat);
    }
  }, [chats]);

  const deleteChat = useCallback(
    (chatId: string) => {
      const updatedChats = chats.filter((c) => c.id !== chatId);
      saveChats(updatedChats);

      if (currentChat?.id === chatId) {
        setCurrentChat(updatedChats[0] || null);
      }
    },
    [chats, currentChat, saveChats]
  );

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

