# Complete Project Folder Structure

## Content Creation Bot - Full Directory Tree

```
content_creation_bot/
│
├── 📁 .github/
│   └── 📁 workflows/
│       └── deploy.yml                    # GitHub Actions CI/CD pipeline
│
├── 📁 .cursor/                           # Cursor IDE configuration
│
├── 📁 .git/                              # Git repository
│
├── 📁 app/                               # Backend FastAPI Application
│   ├── __init__.py
│   ├── main.py                           # FastAPI app entry point
│   │
│   ├── 📁 core/                          # Core application logic
│   │   ├── __init__.py
│   │   ├── config.py                     # Environment configuration
│   │   ├── database.py                   # MongoDB & Redis connections
│   │   ├── dependencies.py               # FastAPI dependencies (auth, etc.)
│   │   └── security.py                   # JWT, password hashing, token generation
│   │
│   ├── 📁 models/                        # Database models (Beanie ODM)
│   │   ├── __init__.py
│   │   ├── user.py                       # User model
│   │   ├── session.py                    # Session model
│   │   ├── token.py                      # Password reset & email verification tokens
│   │   └── audit_log.py                  # Audit logging model
│   │
│   ├── 📁 routes/                        # API route handlers
│   │   ├── __init__.py
│   │   ├── auth.py                       # Authentication routes
│   │   ├── oauth.py                      # OAuth routes (Google, Microsoft)
│   │   ├── admin.py                      # Admin panel routes
│   │   └── users.py                      # User management routes
│   │
│   ├── 📁 schemas/                       # Pydantic request/response schemas
│   │   ├── __init__.py
│   │   ├── auth.py                       # Auth schemas
│   │   └── admin.py                      # Admin schemas
│   │
│   ├── 📁 services/                      # Business logic services
│   │   ├── __init__.py
│   │   ├── auth_service.py               # Authentication service
│   │   ├── oauth_service.py              # OAuth service (Google, Microsoft)
│   │   ├── email_service.py              # Email sending service
│   │   └── password_reset_service.py     # Password reset service
│   │
│   ├── 📁 middleware/                    # Custom middleware
│   │   ├── __init__.py
│   │   ├── csrf.py                       # CSRF protection
│   │   └── rate_limiter.py               # Rate limiting
│   │
│   ├── 📁 utils/                         # Utility functions
│   │   ├── __init__.py
│   │   └── file_extractor.py             # File extraction (PDF, etc.)
│   │
│   ├── chat_routes.py                    # Chat conversation routes
│   ├── clarifier_engine.py               # Question clarification logic
│   ├── conversation_engine.py            # Conversation flow engine
│   ├── intent_classifier.py              # User intent detection
│   ├── openai_clarifier.py               # OpenAI-based clarification
│   ├── router_agent.py                   # Request routing agent
│   ├── responses.py                      # Response templates
│   ├── session_store.py                  # Session storage
│   ├── summary_engine.py                 # Summary generation
│   └── video_plan_generator.py           # Video plan generation
│
├── 📁 frontend/                          # Next.js Frontend Application
│   ├── package.json
│   ├── package-lock.json
│   ├── next.config.js                    # Next.js configuration
│   ├── next-env.d.ts                     # Next.js TypeScript declarations
│   ├── postcss.config.js                 # PostCSS configuration
│   ├── tailwind.config.js                # Tailwind CSS configuration
│   ├── tsconfig.json                     # TypeScript configuration
│   ├── Dockerfile                        # Frontend Docker image
│   ├── .dockerignore                     # Docker ignore rules for frontend
│   │
│   ├── 📁 public/                        # Static assets
│   │   ├── manifest.json
│   │   └── robots.txt
│   │
│   ├── 📁 src/
│   │   ├── api.js                        # Chat API (legacy)
│   │   ├── middleware.ts                 # Next.js middleware (route protection)
│   │   │
│   │   ├── 📁 app/                       # Next.js App Router
│   │   │   ├── layout.jsx                # Root layout
│   │   │   ├── page.jsx                  # Home page
│   │   │   ├── globals.css               # Global styles
│   │   │   ├── loading.jsx               # Loading component
│   │   │   ├── error.jsx                 # Error boundary
│   │   │   ├── robots.ts                 # Robots.txt generation
│   │   │   ├── sitemap.ts                # Sitemap generation
│   │   │   │
│   │   │   ├── 📁 (auth)/                # Auth route group (no URL prefix)
│   │   │   │   ├── layout.tsx            # Auth layout
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx          # Login page
│   │   │   │   ├── signup/
│   │   │   │   │   └── page.tsx          # Signup page
│   │   │   │   ├── forgot-password/
│   │   │   │   │   └── page.tsx          # Forgot password page
│   │   │   │   ├── reset-password/
│   │   │   │   │   └── [token]/
│   │   │   │   │       └── page.tsx      # Reset password page
│   │   │   │   └── verify-email/
│   │   │   │       └── [token]/
│   │   │   │           └── page.tsx      # Email verification page
│   │   │   │
│   │   │   ├── 📁 admin/                 # Admin panel
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx          # Admin login page
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── page.tsx          # Admin dashboard
│   │   │   │   └── users/
│   │   │   │       └── page.tsx          # User management page
│   │   │   │
│   │   │   ├── 📁 auth/                  # OAuth callback
│   │   │   │   └── callback/
│   │   │   │       └── page.tsx          # OAuth callback handler
│   │   │   │
│   │   │   └── 📁 dashboard/             # User dashboard
│   │   │       └── page.tsx              # User dashboard page
│   │   │
│   │   ├── 📁 components/                # React components
│   │   │   ├── ChatBot.jsx               # Main chatbot component
│   │   │   └── ChatBot.css               # Chatbot styles
│   │   │
│   │   ├── 📁 contexts/                  # React contexts
│   │   │   └── AuthContext.tsx           # Authentication context
│   │   │
│   │   └── 📁 lib/                       # Utility libraries
│   │       ├── api.ts                    # API client (Axios)
│   │       ├── auth-api.ts               # Auth API functions
│   │       └── validations.ts            # Zod validation schemas
│   │
│   └── 📁 node_modules/                  # Node.js dependencies
│
├── 📁 node_modules/                      # Root level node_modules (if any)
│
├── 📄 Root Configuration Files
│   ├── .dockerignore                     # Docker ignore rules
│   ├── .gitignore                        # Git ignore rules
│   ├── .python-version                   # Python version specification
│   ├── .cursorrules                      # Cursor AI rules
│   ├── Dockerfile                        # Backend Docker image
│   ├── docker-compose.yml                # Docker Compose configuration
│   ├── requirements.txt                  # Python dependencies
│   ├── package.json                      # Root package.json (if any)
│   ├── package-lock.json                 # Root package-lock.json (if any)
│   └── create_admin_user.py              # Admin user creation script
│
├── 📄 Documentation Files
│   ├── README.md                         # Main project README
│   ├── QUICKSTART.md                     # Quick start guide
│   ├── START_BACKEND.md                  # Backend startup guide
│   ├── RESTART_INSTRUCTIONS.md           # Restart instructions
│   ├── DEPLOYMENT_GUIDE.md               # Deployment guide
│   ├── ENV_EXAMPLE.md                    # Environment variables template
│   ├── PROJECT_STRUCTURE.md              # This file
│   │
│   ├── AUTH_*.md                         # Auth system documentation
│   │   ├── AUTH_COMPLETE.md
│   │   ├── AUTH_FINAL_SUMMARY.md
│   │   ├── AUTH_IMPLEMENTATION_GUIDE.md
│   │   ├── AUTH_SETUP_COMPLETE.md
│   │   ├── AUTH_SYSTEM_PROGRESS.md
│   │   └── AUTH_SYSTEM_SUMMARY.md
│   │
│   ├── ENV_*.md                          # Environment setup guides
│   │   ├── ENV_REQUIRED_VARIABLES.md
│   │   ├── ENV_SETUP.md
│   │   └── ENV_VARIABLES_GUIDE.md
│   │
│   ├── BCRYPT_*.md                       # Bcrypt fixes documentation
│   │   ├── BCRYPT_FIX_COMPLETE.md
│   │   └── BCRYPT_FIX_SUMMARY.md
│   │
│   ├── NEXTJS_*.md                       # Next.js migration docs
│   │   ├── NEXTJS_MIGRATION.md
│   │   └── NEXTJS_OPTIMIZATIONS.md
│   │
│   ├── HEYGEN_*.md                       # HeyGen upgrade docs
│   │   ├── HEYGEN_UPGRADE_PLAN.md
│   │   └── HEYGEN_UPGRADE_STATUS.md
│   │
│   ├── UPLOAD_*.md                       # File upload docs
│   │   ├── UPLOAD_ERROR_FIX.md
│   │   └── UPLOAD_FIX_SUMMARY.md
│   │
│   ├── CURSOR_*.md                       # Cursor setup guides
│   │   ├── CURSOR_PROMPT.md
│   │   └── CURSOR_SETUP_GUIDE.md
│   │
│   ├── PDF_EXTRACTION_FIX.md             # PDF extraction fix docs
│   ├── PRODUCTION_READY_FIXES.md         # Production fixes
│   ├── UI_IMPROVEMENTS.md                # UI improvements
│   ├── FILE_UPLOAD_FEATURE.md            # File upload feature
│   ├── OPENAI_USAGE.md                   # OpenAI usage guide
│   ├── CONFIRMATION_FLOW.md              # Confirmation flow docs
│   └── FIXES_APPLIED.md                  # Applied fixes summary
│
└── 📄 .env (not in git)                  # Environment variables (local)
```

## Key Directories Explained

### Backend (`/app`)
- **core/**: Core application setup (config, database, security, dependencies)
- **models/**: Database models using Beanie ODM
- **routes/**: API endpoints organized by feature
- **services/**: Business logic and service layer
- **middleware/**: Custom FastAPI middleware
- **schemas/**: Pydantic validation schemas
- **utils/**: Utility functions

### Frontend (`/frontend`)
- **src/app/**: Next.js App Router pages and layouts
  - `(auth)/`: Authentication pages (route group)
  - `admin/`: Admin panel pages
  - `auth/`: OAuth callback handler
  - `dashboard/`: User dashboard
- **src/components/**: Reusable React components
- **src/contexts/**: React context providers
- **src/lib/**: Utility libraries and API clients
- **public/**: Static assets

### Configuration
- **Docker**: `Dockerfile`, `docker-compose.yml`, `.dockerignore`
- **CI/CD**: `.github/workflows/deploy.yml`
- **Build Tools**: `next.config.js`, `tailwind.config.js`, `tsconfig.json`

## Important Files

### Backend Entry Points
- `app/main.py` - FastAPI application entry point

### Frontend Entry Points
- `frontend/src/app/page.jsx` - Home page
- `frontend/src/app/layout.jsx` - Root layout
- `frontend/src/middleware.ts` - Next.js middleware for route protection

### Authentication Pages
- Login: `frontend/src/app/(auth)/login/page.tsx`
- Signup: `frontend/src/app/(auth)/signup/page.tsx`
- Admin Login: `frontend/src/app/admin/login/page.tsx`
- OAuth Callback: `frontend/src/app/auth/callback/page.tsx`

### Database Models
- User: `app/models/user.py`
- Session: `app/models/session.py`
- Token: `app/models/token.py`

### Core Services
- Auth Service: `app/services/auth_service.py`
- OAuth Service: `app/services/oauth_service.py`
- Email Service: `app/services/email_service.py`

### API Routes
- Auth: `app/routes/auth.py`
- OAuth: `app/routes/oauth.py`
- Admin: `app/routes/admin.py`
- Users: `app/routes/users.py`
- Chat: `app/chat_routes.py`

## File Count Summary

- **Python Files**: ~41 files
- **TypeScript/TSX Files**: ~12 files
- **JavaScript/JSX Files**: ~5 files
- **TypeScript Files**: ~4 files
- **Configuration Files**: Multiple (JSON, JS, TS, YAML)
- **Documentation Files**: ~30+ Markdown files

## Tech Stack Summary

**Backend:**
- FastAPI (Python 3.11+)
- MongoDB (via Beanie ODM)
- Redis (caching)
- JWT authentication
- OAuth 2.0 (Google, Microsoft)

**Frontend:**
- Next.js 13+ (App Router)
- React
- TypeScript
- Tailwind CSS
- Axios (API client)

**DevOps:**
- Docker & Docker Compose
- GitHub Actions (CI/CD)
- Nginx (if deployed)

