/**
 * Chat-related TypeScript types and interfaces.
 */

export interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date | string;
  file_url?: string;
  reactions?: string[];
  is_regenerated?: boolean;
  isStreaming?: boolean;
  isLoading?: boolean;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date | string;
  updatedAt: Date | string;
  sessionId?: string;
  user_id?: string;
  session_id?: string;
  is_deleted?: boolean;
  is_shared?: boolean;
  share_token?: string;
  shared_at?: Date | string;
}

export interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  currentChatId: string | null;
  isLoading: boolean;
  isSidebarOpen: boolean;
  error: string | null;
}


