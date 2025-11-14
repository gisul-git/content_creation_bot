# Environment Variables Guide

## 📋 Complete .env File Template

Based on your authentication system, here's what you need in your `.env` file:

## 🔴 CRITICAL (Required for Auth System)

### 1. Database Connections
```bash
# MongoDB - Required
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=content_creation_bot

# Redis - Required for sessions
REDIS_URL=redis://localhost:6379
```

### 2. JWT Secret Key
```bash
# CRITICAL: Generate a strong secret key!
# Run this to generate: python -c "import secrets; print(secrets.token_urlsafe(32))"
SECRET_KEY=your-generated-secret-key-min-32-chars
```

### 3. Frontend URL
```bash
FRONTEND_URL=http://localhost:3000
```

## 🟡 IMPORTANT (Required for Email Features)

### AWS SES Configuration
```bash
# Required for sending verification and password reset emails
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
SES_SENDER_EMAIL=noreply@yourdomain.com
SES_SENDER_NAME=Content Creation Bot
```

**Note**: Without AWS SES, emails won't send. The system will log warnings but continue to work.

## 🟢 OPTIONAL (For OAuth Features)

### Google OAuth
```bash
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/v1/auth/google/callback
```

### Microsoft OAuth
```bash
MICROSOFT_CLIENT_ID=your-microsoft-application-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_TENANT_ID=common
MICROSOFT_REDIRECT_URI=http://localhost:8000/api/v1/auth/microsoft/callback
```

**Note**: OAuth will be disabled if credentials are not provided. Email/password auth will still work.

## 📝 Complete .env Template

Copy this to your `.env` file:

```bash
# ============================================
# REQUIRED - Database
# ============================================
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=content_creation_bot
REDIS_URL=redis://localhost:6379

# ============================================
# REQUIRED - Security
# ============================================
# Generate with: python -c "import secrets; print(secrets.token_urlsafe(32))"
SECRET_KEY=CHANGE-THIS-TO-A-STRONG-RANDOM-KEY-MIN-32-CHARS

# ============================================
# REQUIRED - Frontend
# ============================================
FRONTEND_URL=http://localhost:3000

# ============================================
# IMPORTANT - AWS SES (for emails)
# ============================================
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
SES_SENDER_EMAIL=noreply@yourdomain.com
SES_SENDER_NAME=Content Creation Bot

# ============================================
# OPTIONAL - Google OAuth
# ============================================
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/v1/auth/google/callback

# ============================================
# OPTIONAL - Microsoft OAuth
# ============================================
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_TENANT_ID=common
MICROSOFT_REDIRECT_URI=http://localhost:8000/api/v1/auth/microsoft/callback

# ============================================
# OPTIONAL - OpenAI (for existing features)
# ============================================
OPENAI_API_KEY=your-openai-api-key
```

## 🎯 Minimum Required Variables

For the auth system to work, you need at minimum:

```bash
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=content_creation_bot
REDIS_URL=redis://localhost:6379
SECRET_KEY=<generate-strong-key>
FRONTEND_URL=http://localhost:3000
```

## 🔧 How to Generate SECRET_KEY

**Option 1: Python**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Option 2: Online**
- Use a secure random string generator
- Minimum 32 characters
- Use URL-safe characters

## 📍 Where to Get Credentials

### AWS SES
1. Go to https://console.aws.amazon.com/ses/
2. Verify your email address
3. Create IAM user with SES permissions
4. Get Access Key ID and Secret Access Key

### Google OAuth
1. Go to https://console.cloud.google.com/
2. Create a project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add redirect URI: `http://localhost:8000/api/v1/auth/google/callback`

### Microsoft OAuth
1. Go to https://portal.azure.com/
2. Register an application
3. Create client secret
4. Add redirect URI: `http://localhost:8000/api/v1/auth/microsoft/callback`

## ⚠️ Security Notes

1. **Never commit `.env` to git** - It's already in `.gitignore`
2. **Use strong SECRET_KEY** - Generate a random 32+ character string
3. **Rotate secrets regularly** - Especially in production
4. **Use different keys for dev/prod** - Never use production keys in development

## 🚀 Quick Setup

1. Copy `.env.example` to `.env`
2. Generate SECRET_KEY
3. Set MongoDB and Redis URLs
4. (Optional) Add AWS SES credentials for emails
5. (Optional) Add OAuth credentials for social login

That's it! The system will work with just the minimum required variables.

