/**
 * Chat-related TypeScript types and interfaces.
 */

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  sessionId?: string;
}

export interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  currentChatId: string | null;
  isLoading: boolean;
  isSidebarOpen: boolean;
  error: string | null;
}


