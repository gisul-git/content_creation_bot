'use client'

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, ThumbsUp, Heart, Smile, Plus, RotateCw } from 'lucide-react';
import { Message } from '@/types/chat';
import { useChat } from '@/contexts/ChatContext';
import { logger } from '@/utils/logger';

interface ChatMessageProps {
  message: Message;
}

interface MessageActionsProps {
  message: Message;
}

function MessageActions({ message }: MessageActionsProps) {
  const { currentChat, loadChatHistory, selectChat } = useChat();
  const [showReactions, setShowReactions] = useState(false);
  const reactions = ['👍', '👎', '❤️', '🎉', '🤔'];
  
  // Get message index in chat
  const messageIndex = currentChat?.messages.findIndex(m => m.id === message.id) ?? -1;
  
  const handleToggleReaction = async (reaction: string) => {
    if (!currentChat || messageIndex === -1) return;
    
    try {
      const { toggleReaction } = await import('@/lib/chat-api');
      await toggleReaction(currentChat.id, messageIndex, reaction);
      
      // Reload chat to get updated reactions
      await loadChatHistory();
      // Refresh current chat view
      if (currentChat.id) {
        await selectChat(currentChat.id);
      }
    } catch (error) {
      logger.error('Failed to toggle reaction:', error);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-2 px-1">
      {/* Existing reactions */}
      {message.reactions && message.reactions.length > 0 && (
        <div className="flex items-center gap-1">
          {message.reactions.map((reaction, idx) => (
            <button
              key={idx}
              onClick={() => handleToggleReaction(reaction)}
              className="text-sm hover:scale-125 transition-transform"
              title={`Remove ${reaction}`}
            >
              {reaction}
            </button>
          ))}
        </div>
      )}
      
      {/* Add reaction button */}
      <button
        onClick={() => setShowReactions(!showReactions)}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title="Add reaction"
      >
        <Plus className="w-3 h-3" />
      </button>
      
      {/* Reaction picker */}
      {showReactions && (
        <div className="flex gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1 shadow-lg">
          {reactions.map(r => (
            <button
              key={r}
              onClick={() => {
                handleToggleReaction(r);
                setShowReactions(false);
              }}
              className="text-lg hover:scale-125 transition-transform p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              title={`React with ${r}`}
            >
              {r}
            </button>
          ))}
        </div>
      )}
      
      {/* Regenerate button */}
      {messageIndex > 0 && (
        <button
          onClick={async () => {
            if (!currentChat || messageIndex === -1) return;
            
            try {
              const { regenerateMessage } = await import('@/lib/chat-api');
              await regenerateMessage(currentChat.id, messageIndex);
              
              // Reload chat history and refresh current chat view
              await loadChatHistory();
              
              // Select the chat again to update UI with regenerated message
              if (currentChat.id) {
                await selectChat(currentChat.id);
              }
            } catch (error) {
              logger.error('Failed to regenerate:', error);
              alert('Failed to regenerate response');
            }
          }}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs ml-auto flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Regenerate response"
        >
          <RotateCw className="w-3 h-3" />
          <span>Regenerate</span>
        </button>
      )}
    </div>
  );
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = async (code: string, language: string, index: number) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(`${language}-${index}`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 px-4 animate-fade-in`}>
      <div className={`max-w-[85%] md:max-w-[70%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <div className="markdown-content max-w-none">
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeString = String(children).replace(/\n$/, '');
                    const language = match ? match[1] : '';
                    const codeIndex = (node?.position?.start?.line || 0).toString();

                    return !inline && match ? (
                      <div className="relative my-2">
                        <div className="flex items-center justify-between bg-gray-900 px-4 py-2 rounded-t-lg">
                          <span className="text-xs text-gray-400">{language}</span>
                          <button
                            onClick={() => handleCopyCode(codeString, language, codeIndex)}
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
                          >
                            {copiedCode === `${language}-${codeIndex}` ? (
                              <>
                                <Check className="w-3 h-3" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={language}
                          PreTag="div"
                          className="rounded-b-lg"
                          {...props}
                        >
                          {codeString}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code
                        className={`${className} bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm`}
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  p: ({ children }: any) => <p className="mb-2 last:mb-0">{children}</p>,
                  ul: ({ children }: any) => <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>,
                  ol: ({ children }: any) => <ol className="list-decimal ml-4 mb-2 space-y-1">{children}</ol>,
                  li: ({ children }: any) => <li className="mb-1">{children}</li>,
                  h1: ({ children }: any) => <h1 className="text-2xl font-bold mt-4 mb-2">{children}</h1>,
                  h2: ({ children }: any) => <h2 className="text-xl font-bold mt-4 mb-2">{children}</h2>,
                  h3: ({ children }: any) => <h3 className="text-lg font-bold mt-4 mb-2">{children}</h3>,
                  a: ({ href, children }: any) => <a href={href} className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                  strong: ({ children }: any) => <strong className="font-semibold">{children}</strong>,
                  em: ({ children }: any) => <em className="italic">{children}</em>,
                  blockquote: ({ children }: any) => (
                    <blockquote className="border-l-4 border-blue-500 pl-4 italic my-2">{children}</blockquote>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
              {/* Streaming cursor */}
              {message.isStreaming && (
                <span className="inline-block w-1 h-4 ml-1 bg-blue-500 animate-pulse" />
              )}
            </div>
          )}
        </div>
        {/* Reactions and actions for AI messages */}
        {!isUser && (
          <MessageActions message={message} />
        )}
        <span
          className={`text-xs text-gray-500 dark:text-gray-400 mt-1 block ${isUser ? 'text-right' : 'text-left'}`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}

