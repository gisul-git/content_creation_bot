# 🚀 How to Start the Backend Server

## Quick Start

Open a **NEW terminal window** and run:

```bash
cd E:\GISUL\chatbot\app
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## What You Should See

When the backend starts successfully, you'll see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

## Verify It's Working

1. Open your browser
2. Go to: `http://localhost:8000/docs`
3. You should see the API documentation (Swagger UI)

## Then Test the Chatbot

1. Make sure frontend is running: `http://localhost:5173`
2. Refresh the browser
3. Try: "python video" or "I want to create a video"
4. It should work now! 🎉

## Troubleshooting

If you see errors:
- Make sure Python 3.11+ is installed
- Make sure all dependencies are installed: `pip install -r requirements.txt`
- Check that port 8000 is not in use by another application

