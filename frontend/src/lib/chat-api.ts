/**
 * Chat API functions for communicating with the backend chatbot.
 */
import api from './api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ChatStartResponse {
  session_id: string;
  message: string;
  state: string;
}

export interface ChatAnswerResponse {
  session_id: string;
  message: string;
  state: string;
}

export interface ChatConfirmResponse {
  session_id: string;
  message: string;
  state: string;
}

export interface UploadFileResponse {
  success: boolean;
  message: string;
  file_name: string;
  summary: string;
  content_length: number;
  content: string;
  session_id: string;
  chat_id: string;
}

/**
 * Start a new chat session.
 */
export async function startChat(message?: string): Promise<ChatStartResponse> {
  try {
    const response = await api.post<ChatStartResponse>('/chat/start', {
      message: message || null,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error starting chat:', error);
    throw new Error(error.response?.data?.detail || 'Failed to start chat');
  }
}

/**
 * Send a message in an existing chat session.
 */
export async function sendMessage(
  sessionId: string,
  message: string
): Promise<ChatAnswerResponse> {
  try {
    const response = await api.post<ChatAnswerResponse>('/chat/answer', {
      session_id: sessionId,
      message,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error sending message:', error);
    throw new Error(error.response?.data?.detail || 'Failed to send message');
  }
}

/**
 * Confirm content generation.
 */
export async function confirmGeneration(
  sessionId: string,
  confirmed: boolean = true
): Promise<ChatConfirmResponse> {
  try {
    const response = await api.post<ChatConfirmResponse>('/chat/confirm', {
      session_id: sessionId,
      confirmed,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error confirming generation:', error);
    throw new Error(error.response?.data?.detail || 'Failed to confirm');
  }
}

/**
 * Upload a file for chat context.
 */
export async function uploadFile(
  file: File,
  sessionId?: string
): Promise<UploadFileResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (sessionId) {
      formData.append('session_id', sessionId);
    }

    const response = await api.post<UploadFileResponse>('/chat/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error uploading file:', error);
    throw new Error(error.response?.data?.detail || 'Failed to upload file');
  }
}

/**
 * Alias for uploadFile to match usage in ChatContext
 */
export const uploadChatFile = uploadFile;

/**
 * Get session data.
 */
export async function getSession(sessionId: string) {
  try {
    const response = await api.get(`/chat/session/${sessionId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error getting session:', error);
    throw new Error(error.response?.data?.detail || 'Failed to get session');
  }
}

/**
 * Chat persistence API functions.
 */
export interface ChatMessage {
  role: string;
  content: string;
  timestamp?: Date;
  file_url?: string;
  reactions?: string[];
  is_regenerated?: boolean;
}

export interface ChatData {
  id: string;
  user_id: string;
  title: string;
  session_id: string;
  messages: ChatMessage[];
  created_at: Date;
  updated_at: Date;
  is_deleted?: boolean;
  is_shared?: boolean;
  share_token?: string;
  shared_at?: Date;
}

export interface CreateChatRequest {
  session_id: string;
  title?: string;
}

export interface AddMessageRequest {
  role: string;
  content: string;
  file_url?: string;
}

/**
 * Get all chats for current user.
 */
export async function getChats(skip = 0, limit = 50): Promise<ChatData[]> {
  try {
    const response = await api.get<ChatData[]>('/api/chats/', {
      params: { skip, limit }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error getting chats:', error);
    throw new Error(error.response?.data?.detail || 'Failed to get chats');
  }
}

/**
 * Get specific chat by ID.
 */
export async function getChat(chatId: string): Promise<ChatData> {
  try {
    const response = await api.get<ChatData>(`/api/chats/${chatId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error getting chat:', error);
    throw new Error(error.response?.data?.detail || 'Failed to get chat');
  }
}

/**
 * Create new chat.
 */
export async function createChat(sessionId: string, title = 'New Chat'): Promise<ChatData> {
  try {
    const response = await api.post<ChatData>('/api/chats/', {
      session_id: sessionId,
      title
    });
    return response.data;
  } catch (error: any) {
    console.error('Error creating chat:', error);
    throw new Error(error.response?.data?.detail || 'Failed to create chat');
  }
}

/**
 * Add message to chat.
 */
export async function addMessage(
  chatId: string,
  message: AddMessageRequest
): Promise<{ success: boolean; message: ChatMessage }> {
  try {
    const response = await api.put(`/api/chats/${chatId}/messages`, message);
    return response.data;
  } catch (error: any) {
    console.error('Error adding message:', error);
    throw new Error(error.response?.data?.detail || 'Failed to add message');
  }
}

/**
 * Delete chat.
 */
export async function deleteChat(chatId: string): Promise<{ success: boolean }> {
  try {
    const response = await api.delete(`/api/chats/${chatId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting chat:', error);
    throw new Error(error.response?.data?.detail || 'Failed to delete chat');
  }
}

/**
 * Search chats by content.
 */
export async function searchChats(query: string, limit = 20): Promise<ChatData[]> {
  try {
    const response = await api.get<ChatData[]>('/api/chats/search/', {
      params: { query, limit }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error searching chats:', error);
    throw new Error(error.response?.data?.detail || 'Failed to search chats');
  }
}

/**
 * Share chat and get shareable link.
 */
export async function shareChat(chatId: string): Promise<{ share_url: string; token: string }> {
  try {
    const response = await api.post(`/api/chats/${chatId}/share`);
    return response.data;
  } catch (error: any) {
    console.error('Error sharing chat:', error);
    throw new Error(error.response?.data?.detail || 'Failed to share chat');
  }
}

/**
 * Get shared chat by token (public, no auth required).
 */
export async function getSharedChat(token: string): Promise<ChatData> {
  try {
    const response = await api.get<ChatData>(`/api/chats/shared/${token}`);
    return response.data;
  } catch (error: any) {
    console.error('Error getting shared chat:', error);
    throw new Error(error.response?.data?.detail || 'Failed to get shared chat');
  }
}

/**
 * Unshare chat.
 */
export async function unshareChat(chatId: string): Promise<{ success: boolean }> {
  try {
    const response = await api.delete(`/api/chats/${chatId}/share`);
    return response.data;
  } catch (error: any) {
    console.error('Error unsharing chat:', error);
    throw new Error(error.response?.data?.detail || 'Failed to unshare chat');
  }
}

/**
 * Toggle reaction on message.
 */
export async function toggleReaction(
  chatId: string,
  messageIndex: number,
  reaction: string
): Promise<{ success: boolean; reactions: string[] }> {
  try {
    const response = await api.post(`/api/chats/${chatId}/messages/${messageIndex}/reaction`, null, {
      params: { reaction }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error toggling reaction:', error);
    throw new Error(error.response?.data?.detail || 'Failed to toggle reaction');
  }
}

/**
 * Get paginated messages from chat.
 */
export async function getChatMessages(
  chatId: string,
  skip = 0,
  limit = 50
): Promise<{ messages: ChatMessage[]; total: number; skip: number; limit: number }> {
  try {
    const response = await api.get(`/api/chats/${chatId}/messages`, {
      params: { skip, limit }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error getting messages:', error);
    throw new Error(error.response?.data?.detail || 'Failed to get messages');
  }
}

/**
 * Regenerate AI response for a message.
 */
export async function regenerateMessage(
  chatId: string,
  messageIndex: number
): Promise<{ success: boolean; new_content: string; message: ChatMessage }> {
  try {
    const response = await api.post(`/api/chats/${chatId}/regenerate/${messageIndex}`);
    return response.data;
  } catch (error: any) {
    console.error('Error regenerating message:', error);
    throw new Error(error.response?.data?.detail || 'Failed to regenerate message');
  }
}

/**
 * Stream message and get real-time response.
 */
export async function streamMessage(
  chatId: string,
  message: string,
  onChunk: (chunk: string) => void,
  onComplete: (fullResponse: string) => void,
  onError?: (error: string) => void
): Promise<void> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    const response = await fetch(`${API_URL}/api/chats/${chatId}/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No reader available');
    }

    let fullResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(Boolean);

      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          
          if (data.error) {
            if (onError) {
              onError(data.error);
            }
            return;
          }
          
          if (data.done) {
            onComplete(data.full_response || fullResponse);
            return;
          } else if (data.chunk) {
            fullResponse += data.chunk;
            onChunk(data.chunk);
          }
        } catch (e) {
          console.error('Failed to parse chunk:', e, line);
        }
      }
    }
  } catch (error: any) {
    console.error('Error streaming message:', error);
    if (onError) {
      onError(error.message || 'Failed to stream message');
    }
    throw error;
  }
}


