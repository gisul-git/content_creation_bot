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


