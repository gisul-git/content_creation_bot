# 🤖 AI-Powered Content Creation Chatbot

An intelligent conversational assistant that helps users create different types of digital content (videos, images, text, SCORM courses) through an interactive chat interface.

## 🎯 Project Overview

This chatbot intelligently:
- Greets users and detects their intent
- Clarifies missing details (duration, tone, resolution, etc.)
- Confirms all information before generation
- Generates natural language summaries
- Supports natural small talk
- Uses backend API for structured session logic

## 🧱 Tech Stack

### Frontend
- **React + Vite** - Modern frontend framework
- **CSS** - Custom minimal styling
- Responsive Chat UI with smooth animations

### Backend
- **FastAPI** (Python 3.11+) - High-performance API framework
- **OpenAI API** - For summarization and tone polishing
- In-memory session storage (extensible to Redis/SQLite)

## 📁 Project Structure

```
project-root/
├── app/
│   ├── main.py                 # FastAPI application entry
│   ├── chat_routes.py          # Main chat flow handlers
│   ├── intent_classifier.py    # Intent detection
│   ├── clarifier_engine.py     # Field extraction & questions
│   ├── router_agent.py         # Request routing
│   ├── responses.py            # Base greetings & prompts
│   ├── summary_engine.py       # OpenAI-powered summaries
│   ├── session_store.py        # Session management
│   └── __init__.py
├── frontend/
│   ├── src/
│   │   ├── api.js              # API communication
│   │   ├── components/
│   │   │   ├── ChatBot.jsx     # Main chat component
│   │   │   └── ChatBot.css     # Chat styles
│   │   └── main.jsx            # React entry point
│   ├── index.html
│   └── vite.config.js
├── .env                        # Environment variables
├── requirements.txt            # Python dependencies
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- OpenAI API key

### Backend Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create `.env` file:
```
OPENAI_API_KEY=your_api_key_here
```

3. Run the backend:
```bash
cd app
uvicorn main:app --reload
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Run the frontend:
```bash
npm run dev
```

## 💬 Conversation Flow

1. **Greeting Phase**: Bot greets user and asks about content type
2. **Clarification Phase**: Bot asks for missing information dynamically
3. **Confirmation Phase**: Bot generates summary and asks for confirmation
4. **Generation Phase**: Bot starts content generation on confirmation

## ✨ Features

### Current Features
- ✅ Core conversation flow
- ✅ Small talk handling (hi, hello, thanks, bye)
- ✅ Typing simulation
- ✅ Session restart functionality
- ✅ Error handling
- ✅ Auto-scroll to latest message

### Planned Enhancements
- 🎨 UI/UX improvements (typing animation, avatars, timestamps, themes)
- 🧠 Context awareness (session persistence, user name memory)
- 🎤 Voice support (STT/TTS integration)
- 🔧 Backend extensions (generation endpoint, persistent storage)
- 📝 Code quality (TypeScript, Docker, better error handling)

## 🔌 API Endpoints

- `POST /chat/start` - Initialize a new chat session
- `POST /chat/answer` - Process user answer during clarification
- `POST /chat/confirm` - Handle confirmation before generation

## 🛠️ Development

### Code Standards
- Clean, readable, production-grade code
- Modular and scalable architecture
- Proper error handling
- Type hints in Python
- Environment variables for sensitive data

### Contributing
1. Maintain existing conversation flow logic
2. Don't break backend integration
3. Keep code modular and testable
4. Follow the project structure

## 📝 License

MIT License

"# content_creation_bot" 
