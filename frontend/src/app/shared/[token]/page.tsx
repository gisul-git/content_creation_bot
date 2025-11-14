'use client'

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ChatMessage from '@/components/chat/ChatMessage';
import { Chat } from '@/types/chat';
import { getSharedChat } from '@/lib/chat-api';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function SharedChatPage() {
  const params = useParams();
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSharedChat = async () => {
      try {
        setLoading(true);
        const token = params.token as string;
        // Public endpoint - no auth required, use fetch directly
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${API_URL}/api/chats/shared/${token}`);
        if (!response.ok) {
          throw new Error('Shared chat not found');
        }
        const chatData = await response.json();
        
        // Convert ChatData to Chat
        const sharedChat: Chat = {
          id: chatData.id,
          title: chatData.title,
          messages: chatData.messages.map((msg, idx) => ({
            id: `${chatData.id}-${idx}`,
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
          is_shared: chatData.is_shared,
          share_token: chatData.share_token,
          shared_at: chatData.shared_at ? new Date(chatData.shared_at) : undefined,
        };
        
        setChat(sharedChat);
      } catch (err: any) {
        setError(err.message || 'Failed to load shared chat');
        console.error('Error loading shared chat:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.token) {
      loadSharedChat();
    }
  }, [params.token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading shared chat...</p>
        </div>
      </div>
    );
  }

  if (error || !chat) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Chat Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'The shared chat you\'re looking for doesn\'t exist or has been removed.'}
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {chat.title}
          </h1>
          {chat.shared_at && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Shared on {new Date(chat.shared_at).toLocaleString()}
            </p>
          )}
        </div>

        {/* Messages */}
        <div className="space-y-4">
          {chat.messages.map((msg, idx) => (
            <ChatMessage key={msg.id || `msg-${idx}`} message={msg} />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This is a shared chat from Content Creation AI Bot
          </p>
          <Link
            href="/login"
            className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Create Your Own Chat
          </Link>
        </div>
      </div>
    </div>
  );
}

