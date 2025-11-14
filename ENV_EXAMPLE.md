# Environment Variables Template
# Copy to .env on your VM and fill in the values

```bash
# ======================
# Database Configuration
# ======================
MONGO_PASSWORD=your-secure-mongodb-password
REDIS_PASSWORD=your-secure-redis-password

# ======================
# Application Security
# ======================
SECRET_KEY=your-very-long-random-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here

# ======================
# Email Configuration (SMTP)
# ======================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
SMTP_FROM_EMAIL=noreply@yourdomain.com

# ======================
# OAuth Configuration
# ======================
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Microsoft OAuth
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret

# ======================
# OpenAI Configuration
# ======================
OPENAI_API_KEY=your-openai-api-key

# ======================
# Optional: HeyGen (if used)
# ======================
HEYGEN_API_KEY=your-heygen-api-key
```

