'use client'

import { useState, useEffect, useRef } from 'react';
import { startChat, sendAnswer, uploadFile, updateContext } from '@/api';
import './ChatBot.css';

/**
 * Format timestamp for messages
 */
function formatTime(date = new Date()) {
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}

export default function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [typingMessage, setTypingMessage] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingContent, setEditingContent] = useState('');
  const [editingFileIndex, setEditingFileIndex] = useState(-1);
  const messagesEndRef = useRef(null);
  const typingIntervalRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingMessage]);

  // Check backend connection
  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, []);

  // Initialize chat on mount
  useEffect(() => {
    if (messages.length === 0) {
      initializeChat();
    }
  }, []);

  // Cleanup typing animation
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  /**
   * Check backend connection status
   */
  async function checkConnection() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch('http://localhost:8000/health', { 
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      setIsConnected(response.ok);
    } catch (error) {
      setIsConnected(false);
    }
  }

  /**
   * Initialize chat session
   */
  async function initializeChat() {
    try {
      setIsTyping(true);
      const response = await startChat();
      
      if (response && response.session_id) {
        setSessionId(response.session_id);
        setIsConnected(true);
        
        const greeting = response.message || "Hey there! 👋 I'm your AI content creation assistant. I can help you create videos, images, text, or SCORM courses. What would you like to make today?";
        
        // Type greeting character by character
        typeMessage(greeting, (finalText) => {
          setMessages([{ 
            role: 'assistant', 
            content: finalText,
            timestamp: formatTime()
          }]);
          setIsTyping(false);
        });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      const fallbackMessage = "Hey there! 👋 I'm your AI content creation assistant. I can help you create videos, images, text, or SCORM courses. What would you like to make today?";
      
      typeMessage(fallbackMessage, (finalText) => {
        setMessages([{
          role: 'assistant',
          content: finalText,
          timestamp: formatTime()
        }]);
        setIsConnected(false);
        setIsTyping(false);
      });
    }
  }

  /**
   * Type message character by character
   */
  function typeMessage(text, onComplete) {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }
    
    setTypingMessage('');
    let displayText = '';
    let charIndex = 0;
    
    typingIntervalRef.current = setInterval(() => {
      if (charIndex < text.length) {
        displayText += text[charIndex];
        setTypingMessage(displayText);
        charIndex++;
      } else {
        clearInterval(typingIntervalRef.current);
        setTypingMessage('');
        if (onComplete) {
          onComplete(text);
        }
      }
    }, 20);
  }

  /**
   * Handle user message submission
   */
  async function handleSubmit(e) {
    e.preventDefault();
    const userMessage = input.trim();
    
    if (!userMessage) return;

    // Clear input immediately
    setInput('');

    // Add user message to chat IMMEDIATELY
    const userMsg = { 
      role: 'user', 
      content: userMessage,
      timestamp: formatTime()
    };
    
    setMessages(prev => [...prev, userMsg]);

    // Check for restart keywords
    if (userMessage.toLowerCase() === 'new' || userMessage.toLowerCase() === 'restart') {
      setSessionId(null);
      setMessages([]);
      initializeChat();
      return;
    }

    // Send to backend
    try {
      setIsTyping(true);

      let response;
      if (!sessionId) {
        // Start new session
        response = await startChat(userMessage);
        if (response && response.session_id) {
          setSessionId(response.session_id);
        }
      } else {
        // Continue conversation
        response = await sendAnswer(sessionId, userMessage);
      }

      if (response && response.message) {
        setIsConnected(true);
        
        // Type bot response character by character
        typeMessage(response.message, (finalText) => {
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: finalText,
            timestamp: formatTime()
          }]);
          setIsTyping(false);
        });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      setTypingMessage('');
      
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
      
      // Show user-friendly error message
      let errorMessage = "I'm having trouble connecting to the server right now. 😅";
      if (error.message.includes('timeout')) {
        errorMessage = "The server is taking too long to respond. This might be because OpenAI is processing your request. Please try again in a moment! ⏳";
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = "I can't reach the backend server. Please make sure it's running on http://localhost:8000";
      }
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMessage,
        timestamp: formatTime()
      }]);
      setIsConnected(false);
    }
  }

  /**
   * Handle file upload
   */
  async function handleFileUpload(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Ensure we have a session - create one if needed
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      try {
        const startResponse = await startChat();
        currentSessionId = startResponse.session_id;
        setSessionId(currentSessionId);
      } catch (error) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `❌ Error initializing chat session: ${error.message}`,
          timestamp: formatTime()
        }]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
    }

    // Process each file
    for (const file of files) {
      try {
        setIsTyping(true);
        
        const response = await uploadFile(currentSessionId, file);
        
        // Update session ID if returned from backend
        if (response.session_id && response.session_id !== currentSessionId) {
          currentSessionId = response.session_id;
          setSessionId(currentSessionId);
        }
        
        if (response.success) {
          // Add file to uploaded files list
          const fileIndex = uploadedFiles.length;
          setUploadedFiles(prev => [...prev, {
            name: response.file_name,
            summary: response.summary,
            content: response.content || ''
          }]);

          // Show upload success message with edit button
          const uploadMsg = {
            role: 'assistant',
            content: response.message,
            timestamp: formatTime(),
            hasFile: true,
            fileIndex: fileIndex
          };
          setMessages(prev => [...prev, uploadMsg]);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `❌ Error uploading ${file.name}: ${error.message}`,
          timestamp: formatTime()
        }]);
      } finally {
        setIsTyping(false);
      }
    }
    
    // Reset file input after all files processed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  /**
   * Handle opening edit modal
   */
  function handleViewEdit(fileIndex) {
    if (fileIndex >= 0 && fileIndex < uploadedFiles.length) {
      setEditingContent(uploadedFiles[fileIndex].content);
      setEditingFileIndex(fileIndex);
      setShowEditModal(true);
    } else {
      // Try to get from session context if not in local state
      setEditingContent('Loading content...');
      setEditingFileIndex(fileIndex);
      setShowEditModal(true);
    }
  }

  /**
   * Handle saving edited content
   */
  async function handleSaveEdit() {
    if (!sessionId || editingFileIndex < 0) return;

    try {
      setIsTyping(true);
      await updateContext(sessionId, editingContent);
      
      // Update local state if file exists
      if (editingFileIndex < uploadedFiles.length) {
        const updatedFiles = [...uploadedFiles];
        updatedFiles[editingFileIndex].content = editingContent;
        setUploadedFiles(updatedFiles);
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '✅ Context updated successfully! The bot will now use the edited content.',
        timestamp: formatTime()
      }]);

      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating context:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ Error updating context: ${error.message}`,
        timestamp: formatTime()
      }]);
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="header-content">
          <div className="header-left">
            <div className="bot-avatar">🤖</div>
            <div>
              <h1>AI Content Creation Assistant</h1>
              <p>Create videos, images, text, or SCORM courses through conversation</p>
            </div>
          </div>
          <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            <span className="status-dot"></span>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </div>

      <div className="chatbot-messages" ref={messagesEndRef}>
        {messages.map((msg, idx) => (
          <div key={`msg-${idx}-${msg.timestamp}`} className={`message ${msg.role}`}>
            {msg.role === 'assistant' && (
              <div className="message-avatar">🤖</div>
            )}
            <div className="message-wrapper">
              <div className="message-content" style={{ whiteSpace: 'pre-line' }}>
                {msg.content}
                {msg.hasFile && (
                  <button
                    className="edit-text-button"
                    onClick={() => handleViewEdit(msg.fileIndex)}
                  >
                    ✏️ View/Edit Extracted Text
                  </button>
                )}
              </div>
              {msg.timestamp && (
                <div className="message-timestamp">{msg.timestamp}</div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="message-avatar user-avatar">👤</div>
            )}
          </div>
        ))}

        {/* Typing animation */}
        {typingMessage && (
          <div className="message assistant">
            <div className="message-avatar">🤖</div>
            <div className="message-wrapper">
              <div className="message-content typing-message">
                {typingMessage}
                <span className="typing-cursor">|</span>
              </div>
            </div>
          </div>
        )}

        {/* Typing indicator */}
        {isTyping && !typingMessage && (
          <div className="message assistant">
            <div className="message-avatar">🤖</div>
            <div className="message-wrapper">
              <div className="message-content typing-indicator">
                <span className="typing-dots">
                  <span></span><span></span><span></span>
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form className="chatbot-input-form" onSubmit={handleSubmit}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".pdf,.docx,.pptx,.txt,.jpg,.jpeg,.png"
          style={{ display: 'none' }}
          multiple
        />
        <button
          type="button"
          className="chatbot-upload-button"
          onClick={() => fileInputRef.current?.click()}
          title="Upload file (PDF, DOCX, PPTX, TXT, JPG, PNG)"
          disabled={isTyping}
        >
          📎
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="chatbot-input"
          disabled={isTyping}
          autoFocus
        />
        <button 
          type="submit" 
          className="chatbot-send-button" 
          disabled={isTyping || !input.trim()}
        >
          {isTyping ? '...' : 'Send'}
        </button>
      </form>

      {/* Edit Text Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✏️ Edit Extracted Text</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <textarea
              className="modal-textarea"
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
              placeholder="Edit the extracted text here..."
            />
            <div className="modal-actions">
              <button
                className="modal-button modal-button-primary"
                onClick={handleSaveEdit}
              >
                Save Changes
              </button>
              <button
                className="modal-button"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
