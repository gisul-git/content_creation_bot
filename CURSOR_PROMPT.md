# 🧠 Master Prompt for Cursor AI - Content Creation Chatbot

## Copy this entire prompt into Cursor AI when starting a new session

---

You are assisting in enhancing and optimizing an **AI-based content creation chatbot system**.

### Project Context

**Tech Stack:**
- **Backend**: FastAPI (Python 3.11+), OpenAI API
- **Frontend**: React + Vite, CSS

**Project Goal:**
The chatbot helps users create **videos, images, text, or SCORM courses** through an interactive conversation flow that:
1. Greets users and detects intent
2. Clarifies missing details (duration, tone, resolution, etc.)
3. Confirms information with a natural summary
4. Starts content generation

### Current Working State

✅ **Backend Endpoints:**
- `POST /chat/start` - Initialize chat session
- `POST /chat/answer` - Process user answers during clarification
- `POST /chat/confirm` - Handle confirmation before generation

✅ **Backend Modules:**
- `chat_routes.py` - Main chat flow handlers
- `intent_classifier.py` - Detects intent (video, image, text, SCORM, greeting)
- `clarifier_engine.py` - Field extraction and missing questions
- `responses.py` - Base greetings and prompts
- `summary_engine.py` - OpenAI-powered natural summaries
- `session_store.py` - In-memory session management

✅ **Frontend Features:**
- Small talk handling (hi, hello, thanks, bye) - handled locally
- Typing simulation ("💭 Thinking...")
- Session restart via "new" or "restart" keywords
- Error handling for backend unavailability
- Auto-scroll to latest message

### Your Tasks (Priority Order)

#### 1️⃣ UI/UX Improvements (High Priority)
- [ ] Add **typing animation** (character-by-character message reveal)
- [ ] Add **bot avatar** (circular AI face icon beside bot messages)
- [ ] Add **message timestamps** (e.g., "10:32 AM")
- [ ] Add **smooth fade-in transitions** for message bubbles
- [ ] Implement **dark/light theme toggle**
- [ ] Make chat **fully responsive** for mobile

#### 2️⃣ Context Awareness (High Priority)
- [ ] Add **session persistence** using `localStorage`
- [ ] Remember **user name** across sessions (e.g., "I'm Rahul")
- [ ] Support **"What's my last project?"** queries
- [ ] Maintain conversation history across refreshes

#### 3️⃣ Backend Enhancements (Medium Priority)
- [ ] Make code **modular and consistent** (no duplicate greetings)
- [ ] Add `/generate` endpoint for actual content generation
- [ ] Store sessions in **Redis or SQLite** (replace in-memory)
- [ ] Add **logging & metrics** (start_time, total_messages, content_type)
- [ ] Improve error handling and validation

#### 4️⃣ Code Quality (Medium Priority)
- [ ] Add **TypeScript support** for frontend (gradual migration)
- [ ] Use **environment variables** properly (`.env` for OpenAI keys)
- [ ] Add `docker-compose.yml` for full stack deployment
- [ ] Configure **CORS** properly
- [ ] Add comprehensive error handling

#### 5️⃣ Optional Future Features (Low Priority)
- [ ] Integrate **Speech-to-Text** (Web Speech API)
- [ ] Integrate **Text-to-Speech** for bot replies
- [ ] Add "🎤 Voice Mode" toggle in UI

### ⚠️ Critical Constraints

1. **DO NOT break existing flow** - Conversation logic and backend integration must remain intact
2. **Maintain API contracts** - All existing endpoints must continue working
3. **Preserve functionality** - All current features must continue working
4. **Keep it modular** - Code should be organized and maintainable

### 🎨 Design Principles

- Use emoji and friendly phrasing for bot personality
- Maintain smooth, natural conversation flow
- Ensure responsive design works on all screen sizes
- Keep UI clean and modern
- Use consistent color schemes and typography

### 📁 Key Files

**Backend:**
- `app/chat_routes.py` - Main chat flow
- `app/intent_classifier.py` - Intent detection
- `app/clarifier_engine.py` - Question generation
- `app/session_store.py` - Session management

**Frontend:**
- `frontend/src/components/ChatBot.jsx` - Main chat component
- `frontend/src/api.js` - API communication

### 🚀 Implementation Guidelines

1. **Read existing code first** - Understand current implementation
2. **Test incrementally** - Make small changes and verify
3. **Maintain consistency** - Follow existing patterns
4. **Document changes** - Add comments for complex logic
5. **Handle errors gracefully** - Never break user experience

**Focus on writing clean, readable, production-grade code that is modular and scalable.**

---

## Quick Reference Commands

When working on this project:
- Start backend: `cd app && uvicorn main:app --reload`
- Start frontend: `cd frontend && npm run dev`
- Check API: `http://localhost:8000/docs` (FastAPI auto-docs)

