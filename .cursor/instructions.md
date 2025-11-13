# Cursor AI Instructions - Content Creation Chatbot

## 🎯 Your Role
You are assisting in enhancing and optimizing an AI-based content creation chatbot system. The project uses **FastAPI (backend)** and **React + Vite (frontend)**. The chatbot allows users to create **videos, images, text, or SCORM courses** through an interactive conversation flow.

## 🧩 Core Tasks

### 1. Improve Frontend Interactivity
- Add typing animation (character-by-character message reveal)
- Add bot avatar (circular AI face icon beside bot messages)
- Introduce message timestamps (e.g., "10:32 AM")
- Add smooth fade-in transitions for each message bubble
- Implement dark/light theme toggle
- Make chat fully responsive for mobile devices

### 2. Add Context Persistence
- Implement session persistence using `localStorage`
- Remember user name (e.g., if user says "I'm Rahul", greet them personally next time)
- Support "What's my last project?" queries
- Maintain conversation history across page refreshes

### 3. Enhance Backend
- Make backend code modular and consistent (no duplicate greetings)
- Add `/generate` endpoint to connect with actual content generation pipeline
- Store `chat_sessions` into Redis or SQLite for persistence
- Enable logging & metrics (start_time, total_messages, content_type)
- Improve error handling and validation

### 4. Code Quality Improvements
- Add TypeScript support for frontend (gradual migration)
- Use environment variables properly (OpenAI keys via `.env`)
- Add `docker-compose.yml` for full stack deployment
- Include proper `CORS` configuration
- Add comprehensive error handling

### 5. Optional Future Enhancements
- Integrate Speech-to-Text API for user voice input (Web Speech API)
- Integrate Text-to-Speech (TTS) for bot voice replies
- Add "🎤 Voice Mode" toggle in UI

## ⚠️ Critical Constraints

1. **Don't break existing flow** - The conversation logic and backend integration must remain intact
2. **Maintain API contracts** - All existing endpoints must continue to work
3. **Preserve functionality** - All current features must continue working
4. **Keep it modular** - Code should be organized and maintainable

## 🎨 Design Principles

- Use emoji and friendly phrasing for bot personality
- Maintain smooth, natural conversation flow
- Ensure responsive design works on all screen sizes
- Keep UI clean and modern
- Use consistent color schemes and typography

## 🔍 When Making Changes

1. **Read existing code first** - Understand the current implementation
2. **Test incrementally** - Make small changes and verify they work
3. **Maintain consistency** - Follow existing code patterns and style
4. **Document changes** - Add comments for complex logic
5. **Handle errors gracefully** - Never break the user experience

## 📚 Key Files to Understand

### Backend
- `app/chat_routes.py` - Main chat flow logic
- `app/intent_classifier.py` - Intent detection
- `app/clarifier_engine.py` - Question generation
- `app/session_store.py` - Session management

### Frontend
- `frontend/src/components/ChatBot.jsx` - Main chat component
- `frontend/src/api.js` - API communication

## 🚀 Implementation Priority

1. **High Priority**: UI/UX improvements, context persistence
2. **Medium Priority**: Backend extensions, code quality
3. **Low Priority**: Voice support, advanced features

Focus on writing **clean, readable, production-grade code** that is modular and scalable.

