/**
 * API communication layer for chatbot.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Start a new chat session.
 * @param {string} message - Optional initial message
 * @returns {Promise<Object>} Response with session_id and message
 */
export async function startChat(message = null) {
  try {
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(`${API_BASE_URL}/chat/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response:', data); // Debug log
    return data;
  } catch (error) {
    console.error('Error starting chat:', error);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. The server is taking too long to respond.');
    }
    throw error;
  }
}

/**
 * Send an answer during clarification phase.
 * @param {string} sessionId - Current session ID
 * @param {string} message - User's answer
 * @returns {Promise<Object>} Response with message and state
 */
export async function sendAnswer(sessionId, message) {
  try {
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(`${API_BASE_URL}/chat/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId,
        message: message,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response:', data); // Debug log
    return data;
  } catch (error) {
    console.error('Error sending answer:', error);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. The server is taking too long to respond.');
    }
    throw error;
  }
}

/**
 * Confirm content generation.
 * @param {string} sessionId - Current session ID
 * @param {boolean} confirmed - Whether user confirmed
 * @returns {Promise<Object>} Response with message and state
 */
export async function confirmAction(sessionId, confirmed = true) {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId,
        confirmed: confirmed,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error confirming:', error);
    throw error;
  }
}

/**
 * Upload a file to the chat session.
 * @param {string} sessionId - Current session ID (optional, will be created if not provided)
 * @param {File} file - File to upload
 * @returns {Promise<Object>} Response with upload status and summary
 */
export async function uploadFile(sessionId, file) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    // Only append session_id if it exists (backend will create one if not provided)
    if (sessionId) {
      formData.append('session_id', sessionId);
    }

    const response = await fetch(`${API_BASE_URL}/chat/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}, ${errorText}`);
    }

    const data = await response.json();
    console.log('Upload response:', data);
    return data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

/**
 * Update the extracted text context for a session.
 * @param {string} sessionId - Current session ID
 * @param {string} content - Updated content text
 * @returns {Promise<Object>} Response with update status
 */
export async function updateContext(sessionId, content) {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/update_context`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId,
        content: content,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating context:', error);
    throw error;
  }
}

