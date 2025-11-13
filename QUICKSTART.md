# 🚀 Quick Start Guide

Get your AI Content Creation Chatbot up and running in minutes!

## Prerequisites

- Python 3.11+
- Node.js 18+
- OpenAI API key (optional, for enhanced summaries)

## Setup Steps

### 1. Backend Setup

```bash
# Install Python dependencies
pip install -r requirements.txt

# Create .env file (copy from .env.example)
cp .env.example .env

# Edit .env and add your OpenAI API key (optional but recommended)
# OPENAI_API_KEY=your_key_here
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

### 3. Run the Application

**Terminal 1 - Backend:**
```bash
# From project root
cd app
uvicorn main:app --reload
```

Backend will run on `http://localhost:8000`

**Terminal 2 - Frontend:**
```bash
# From frontend directory
npm run dev
```

Frontend will run on `http://localhost:5173`

### 4. Test the Chatbot

1. Open `http://localhost:5173` in your browser
2. The chatbot will greet you automatically
3. Try saying:
   - "I want to create a video"
   - "Hi" (for small talk)
   - "I want to make an image about nature"

## API Documentation

Once the backend is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Troubleshooting

### Backend won't start
- Make sure Python 3.11+ is installed
- Check that all dependencies are installed: `pip install -r requirements.txt`
- Verify port 8000 is not in use

### Frontend won't start
- Make sure Node.js 18+ is installed
- Run `npm install` in the frontend directory
- Check that port 5173 is not in use

### OpenAI errors
- The chatbot works without OpenAI, but summaries will be simpler
- Make sure your `.env` file has the correct `OPENAI_API_KEY`
- Check your OpenAI API key is valid and has credits

### CORS errors
- Make sure backend is running on port 8000
- Check `app/main.py` has correct CORS origins configured

## Next Steps

- Customize the conversation flow in `app/clarifier_engine.py`
- Add more content types in `app/intent_classifier.py`
- Enhance the UI in `frontend/src/components/ChatBot.jsx`
- Add persistence with Redis or SQLite (see `app/session_store.py`)

## Project Structure

```
chatbot/
├── app/                    # Backend (FastAPI)
│   ├── main.py            # FastAPI app entry
│   ├── chat_routes.py     # API endpoints
│   ├── intent_classifier.py
│   ├── clarifier_engine.py
│   └── ...
├── frontend/              # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   └── ChatBot.jsx
│   │   └── api.js
│   └── ...
├── requirements.txt       # Python dependencies
└── .env                   # Environment variables
```

Happy coding! 🎉

