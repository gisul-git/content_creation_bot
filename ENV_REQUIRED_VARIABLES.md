# Environment Variables - What to Add to Your .env File

## 🎯 Quick Answer

Based on your authentication system, here's what you **MUST** add to your `.env` file:

## 🔴 CRITICAL (Required - System Won't Work Without These)

```bash
# Database - MongoDB
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=content_creation_bot

# Database - Redis (for sessions)
REDIS_URL=redis://localhost:6379

# JWT Secret Key (CRITICAL - Generate a strong one!)
# Generate with: python -c "import secrets; print(secrets.token_urlsafe(32))"
SECRET_KEY=your-generated-secret-key-minimum-32-characters-long

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

## 🟡 IMPORTANT (Required for Email Features)

```bash
# AWS SES - For sending verification and password reset emails
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
SES_SENDER_EMAIL=noreply@yourdomain.com
SES_SENDER_NAME=Content Creation Bot
```

**Note**: Without AWS SES, the system will work but emails won't send. You'll see warnings in logs.

## 🟢 OPTIONAL (For OAuth Social Login)

```bash
# Google OAuth (optional - email/password still works without this)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/v1/auth/google/callback

# Microsoft OAuth (optional - email/password still works without this)
MICROSOFT_CLIENT_ID=your-microsoft-application-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_TENANT_ID=common
MICROSOFT_REDIRECT_URI=http://localhost:8000/api/v1/auth/microsoft/callback
```

## 📋 Complete .env File Template

Here's your complete `.env` file with all variables:

```bash
# ============================================
# REQUIRED - Database Connections
# ============================================
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=content_creation_bot
REDIS_URL=redis://localhost:6379

# ============================================
# REQUIRED - Security (CRITICAL!)
# ============================================
# Generate a strong secret key:
# python -c "import secrets; print(secrets.token_urlsafe(32))"
SECRET_KEY=CHANGE-THIS-GENERATE-A-STRONG-RANDOM-KEY-MIN-32-CHARS

# ============================================
# REQUIRED - Frontend
# ============================================
FRONTEND_URL=http://localhost:3000

# ============================================
# IMPORTANT - AWS SES (for emails)
# ============================================
# Get from: https://console.aws.amazon.com/ses/
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
SES_SENDER_EMAIL=noreply@yourdomain.com
SES_SENDER_NAME=Content Creation Bot

# ============================================
# OPTIONAL - Google OAuth
# ============================================
# Get from: https://console.cloud.google.com/
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/v1/auth/google/callback

# ============================================
# OPTIONAL - Microsoft OAuth
# ============================================
# Get from: https://portal.azure.com/
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_TENANT_ID=common
MICROSOFT_REDIRECT_URI=http://localhost:8000/api/v1/auth/microsoft/callback

# ============================================
# EXISTING - OpenAI (if you have this)
# ============================================
OPENAI_API_KEY=your-openai-api-key-here
```

## 🚀 Quick Setup Steps

### Step 1: Generate SECRET_KEY
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```
Copy the output and use it as your `SECRET_KEY`.

### Step 2: Add Minimum Required Variables
Add these to your `.env`:
```bash
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=content_creation_bot
REDIS_URL=redis://localhost:6379
SECRET_KEY=<paste-generated-key-here>
FRONTEND_URL=http://localhost:3000
```

### Step 3: (Optional) Add AWS SES for Emails
If you want emails to work, add AWS credentials.

### Step 4: (Optional) Add OAuth Credentials
If you want Google/Microsoft login, add OAuth credentials.

## ⚠️ Important Notes

1. **SECRET_KEY is CRITICAL** - Never use the default value in production!
2. **MongoDB & Redis** - Must be running for the system to work
3. **AWS SES** - Optional but recommended for email features
4. **OAuth** - Completely optional, email/password works fine without it

## 🔍 What You Already Have

If you already have a `.env` file, check if you have:
- `OPENAI_API_KEY` (for existing chatbot features)
- `FRONTEND_URL` (might need to update to port 3000 for Next.js)

## 📝 Summary

**Minimum to add:**
- `MONGODB_URL`
- `MONGODB_DB_NAME`
- `REDIS_URL`
- `SECRET_KEY` (generate a new one!)
- `FRONTEND_URL`

**For full functionality, also add:**
- AWS SES credentials (for emails)
- OAuth credentials (for social login)

See `.env.example` file for the complete template!

