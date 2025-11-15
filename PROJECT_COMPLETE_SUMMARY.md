# 📋 Content Creation Bot - Complete Project Summary

## 🎯 Project Overview

**Content Creation Bot** is an AI-powered conversational assistant that helps users create different types of digital content (videos, images, text, SCORM courses) through an interactive chat interface. The application uses OpenAI for intelligent conversation handling, clarification questions, and natural language processing.

### Key Features
- 🤖 **AI-Powered Conversations**: Uses OpenAI GPT for natural, contextual responses
- 💬 **Interactive Chat Interface**: Real-time chat with typing animations and smooth UX
- 📝 **Content Type Support**: Videos, Images, Text, SCORM courses
- 🔐 **Full Authentication System**: JWT-based auth with OAuth (Google, Microsoft)
- 💾 **Persistent Chat History**: MongoDB storage for conversation history
- 📁 **File Upload Support**: PDF, DOCX, PPTX extraction for context
- 👥 **User Management**: Registration, login, email verification, password reset
- 🛡️ **Security**: Rate limiting, CSRF protection, secure password hashing
- 🚀 **Production Ready**: Docker deployment, CI/CD with GitHub Actions

---

## 🏗️ Architecture Overview

### Tech Stack

**Backend:**
- **FastAPI** (Python 3.11+) - High-performance async API framework
- **MongoDB** (via Beanie ODM) - Document database for chats, users, sessions
- **Redis** - Caching and session storage
- **OpenAI API** - GPT-3.5 for intelligent responses
- **JWT** - Token-based authentication
- **OAuth 2.0** - Google & Microsoft authentication

**Frontend:**
- **Next.js 14** (App Router) - React framework with SSR/SSG
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React Context API** - State management
- **Axios** - HTTP client

**DevOps:**
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **GitHub Actions** - CI/CD pipeline

---

## 📁 Complete File Structure & Descriptions

### 🔧 Root Configuration Files

#### `docker-compose.yml`
**Purpose**: Docker Compose orchestration for multi-container deployment  
**Description**: Defines services (backend, frontend, MongoDB, Redis), networks, volumes, and environment variables. Supports standalone deployment or shared resources with external services.

#### `Dockerfile`
**Purpose**: Backend Docker image build configuration  
**Description**: Multi-stage build for FastAPI application. Installs Python dependencies, copies application code, sets up health checks, and exposes port 8000.

#### `requirements.txt`
**Purpose**: Python dependency management  
**Description**: Lists all Python packages including FastAPI, MongoDB drivers (motor, beanie, pymongo), Redis, authentication libraries (python-jose, bcrypt), OpenAI, file processing libraries (PyPDF2, pdfplumber), and AWS SDK (boto3).

#### `.gitignore`
**Purpose**: Git ignore rules  
**Description**: Excludes sensitive files (.env), Python cache (__pycache__), node_modules, build artifacts, and IDE-specific files.

#### `.dockerignore`
**Purpose**: Docker build context exclusions  
**Description**: Prevents unnecessary files from being copied into Docker images (reduces build time and image size).

#### `.cursorrules`
**Purpose**: Cursor AI IDE configuration  
**Description**: Project-specific rules for AI code completion, including architecture patterns, coding standards, and file structure conventions.

#### `.python-version`
**Purpose**: Python version specification  
**Description**: Specifies Python 3.11+ for the project.

#### `create_admin_user.py`
**Purpose**: Admin user creation script  
**Description**: Utility script to create admin users in the database. Used for initial setup and user management.

---

### 🐍 Backend Application (`/app`)

#### **Core Application Files**

##### `app/main.py`
**Purpose**: FastAPI application entry point  
**Description**: 
- Initializes FastAPI app with CORS, rate limiting, and error handlers
- Registers all API routers (auth, chat, oauth, admin, users)
- Sets up database connections (MongoDB, Redis) on startup/shutdown
- Defines Azure AD OAuth callback route (registered before routers to prevent conflicts)
- Health check endpoint (`/health`)
- Root endpoint with API info

**Key Routes:**
- `GET /` - API information
- `GET /health` - Health check
- `GET /api/auth/callback/azure-ad` - Azure AD OAuth callback

##### `app/chat_routes.py`
**Purpose**: Chat conversation flow API endpoints  
**Description**: Main chat API handlers for conversation flow:
- `POST /chat/start` - Initialize new chat session, generate AI greeting
- `POST /chat/answer` - Process user answers during clarification phase
- `POST /chat/confirm` - Handle confirmation before content generation
- `POST /chat/upload` - Handle file uploads (PDF, DOCX, PPTX) for context extraction
- `POST /chat/update-context` - Update chat context from extracted file content

**Features:**
- Session management via `session_store`
- File extraction using `file_extractor` utility
- OpenAI-powered greetings and responses via `conversation_engine`
- Video plan generation via `video_plan_generator`
- Restart/session reset functionality

##### `app/conversation_engine.py`
**Purpose**: AI-powered conversation response generation  
**Description**: Uses OpenAI GPT-3.5 to generate natural, contextual responses. Replaces hardcoded responses with intelligent, state-aware conversations.

**Key Methods:**
- `generate_response()` - Main method to generate AI responses based on conversation history and session state
- `_build_system_prompt()` - Constructs system prompts based on session state (greeting, clarification, confirmation)
- Handles different content types (video, image, text, scorm)
- Supports file context (uploaded documents) in responses

##### `app/intent_classifier.py`
**Purpose**: User intent detection from messages  
**Description**: Rule-based intent classification system that detects:
- **Content Types**: `video`, `image`, `text`, `scorm`
- **Interactions**: `greeting`, `small_talk`, `unknown`

**Methods:**
- `classify_intent()` - Main classification function using keyword matching and regex patterns
- `extract_content_type()` - Extracts explicit content type mentions from user messages

##### `app/clarifier_engine.py`
**Purpose**: Field extraction and clarification question generation  
**Description**: Determines required fields for each content type and extracts information from user messages. Uses OpenAI for intelligent extraction if available, falls back to pattern matching.

**Content Type Schemas:**
- **Video**: topic, duration, style, tone, language, resolution, aspect_ratio
- **Image**: topic, style, tone, resolution, aspect_ratio, color_scheme
- **Text**: topic, length, style, tone, language, target_audience
- **SCORM**: topic, duration, difficulty, language, interactive_elements, assessment_type

**Methods:**
- `extract_fields_from_message()` - Extracts field values from user input
- `get_missing_fields()` - Identifies required fields that haven't been filled
- `generate_next_question()` - Generates the next clarification question

##### `app/openai_clarifier.py`
**Purpose**: OpenAI-powered intelligent field extraction  
**Description**: Uses OpenAI GPT to extract structured data from natural language. More accurate than pattern matching.

##### `app/router_agent.py`
**Purpose**: Request routing and conversation state management  
**Description**: Central routing logic that orchestrates the conversation flow:
- Routes user messages based on intent
- Manages conversation state transitions (greeting → clarification → confirmation → generation)
- Coordinates with `intent_classifier`, `clarifier_engine`, and `conversation_engine`

##### `app/responses.py`
**Purpose**: Static response templates and prompts  
**Description**: Fallback response templates used when OpenAI is unavailable:
- Greeting messages
- Content type prompts
- Small talk responses
- Error messages
- Restart prompts

##### `app/session_store.py`
**Purpose**: In-memory session storage (can be extended to Redis/DB)  
**Description**: Manages temporary chat sessions during conversations:
- Session creation and management
- Message history storage
- Session state tracking (fields, content_type, conversation state)

##### `app/summary_engine.py`
**Purpose**: AI-powered summary generation for confirmation phase  
**Description**: Uses OpenAI to generate natural language summaries of collected information before content generation.

##### `app/video_plan_generator.py`
**Purpose**: Video content plan generation  
**Description**: Generates structured video plans from collected fields (storyboard, scenes, script, etc.).

##### `app/router_agent.py`
**Purpose**: Request routing orchestration  
**Description**: Main routing logic that:
- Detects user intent
- Manages conversation state
- Routes to appropriate handlers (clarifier, summary, confirmation)

---

#### **Core Module (`/app/core`)**

##### `app/core/config.py`
**Purpose**: Application configuration from environment variables  
**Description**: Pydantic Settings class that loads all environment variables:
- Database URLs (MongoDB, Redis)
- JWT secrets and expiration times
- OAuth credentials (Google, Microsoft)
- AWS SES email configuration
- Rate limiting rules
- Frontend/Backend URLs
- OpenAI API key

**Key Settings:**
- `MONGODB_URL`, `REDIS_URL`
- `SECRET_KEY`, `ACCESS_TOKEN_EXPIRE_MINUTES`
- `GOOGLE_CLIENT_ID`, `MICROSOFT_CLIENT_ID`
- `OPENAI_API_KEY`
- `FRONTEND_URL`, `BACKEND_URL`

##### `app/core/database.py`
**Purpose**: Database connection management  
**Description**: Handles MongoDB and Redis connections:
- `connect_to_mongo()` - Initializes Beanie ODM and MongoDB connection
- `connect_to_redis()` - Establishes Redis connection for caching/sessions
- `close_mongo_connection()`, `close_redis_connection()` - Cleanup functions
- Auto-detects MongoDB Atlas (requires SSL) vs local MongoDB (no SSL)

##### `app/core/dependencies.py`
**Purpose**: FastAPI dependency injection  
**Description**: Provides reusable dependencies:
- `get_current_user()` - Extracts and validates JWT token, returns current User
- `get_admin_user()` - Ensures user has admin role
- Used by route handlers for authentication/authorization

##### `app/core/security.py`
**Purpose**: Security utilities  
**Description**: Cryptographic functions:
- `verify_password()` - Bcrypt password verification
- `get_password_hash()` - Bcrypt password hashing
- `create_access_token()`, `create_refresh_token()` - JWT token generation
- `verify_token()` - JWT token validation

---

#### **Database Models (`/app/models`)**

##### `app/models/user.py`
**Purpose**: User database model  
**Description**: Beanie Document model for users:
- Email, password hash, names, phone
- Role (user, admin)
- Email verification status
- Account lockout fields (login attempts, lockout until)
- Active sessions tracking
- Timestamps (created_at, updated_at)

##### `app/models/chat.py`
**Purpose**: Chat and message models  
**Description**: Persistent chat storage:
- **Chat Document**: user_id, title, session_id, messages array, timestamps
- **Message Model**: role, content, timestamp, file_url, reactions, is_regenerated
- Supports chat sharing via `share_token`
- Soft delete via `is_deleted` flag
- Indexed for efficient queries (user_id, session_id, share_token)

##### `app/models/session.py`
**Purpose**: User session tracking  
**Description**: Tracks active user sessions:
- User reference, device info, IP address
- Token refresh tracking
- Session expiration

##### `app/models/token.py`
**Purpose**: Token storage for email verification and password reset  
**Description**: Stores verification tokens:
- Token type (email_verification, password_reset)
- User reference
- Expiration timestamps
- Used status

##### `app/models/audit_log.py`
**Purpose**: Audit logging model  
**Description**: Logs security events (login attempts, password changes, etc.)

---

#### **API Routes (`/app/routes`)**

##### `app/routes/auth.py`
**Purpose**: Authentication endpoints  
**Description**: User authentication API:
- `POST /api/v1/auth/register` - User registration with email verification
- `POST /api/v1/auth/login` - Login with JWT tokens
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/verify-email` - Email verification
- `POST /api/v1/auth/resend-verification` - Resend verification email
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password with token
- `POST /api/v1/auth/change-password` - Change password (authenticated)
- `POST /api/v1/auth/logout` - Logout (invalidate session)

**Features:**
- Rate limiting (5 login attempts per 15 minutes)
- Account lockout after failed attempts
- HttpOnly cookie support for tokens
- Password strength validation

##### `app/routes/oauth.py`
**Purpose**: OAuth authentication endpoints  
**Description**: Social login integration:
- `GET /api/v1/auth/google/login` - Google OAuth initiation
- `GET /api/v1/auth/google/callback` - Google OAuth callback
- `GET /api/v1/auth/microsoft/login` - Microsoft OAuth initiation
- `GET /api/v1/auth/microsoft/callback` - Microsoft OAuth callback

**Features:**
- Automatic user creation on first OAuth login
- Token generation and session creation
- Redirect to frontend with tokens

##### `app/routes/chats.py`
**Purpose**: Chat persistence API  
**Description**: CRUD operations for chats:
- `GET /api/chats/` - List user's chats (pagination)
- `GET /api/chats/{chat_id}` - Get specific chat
- `POST /api/chats/` - Create new chat
- `POST /api/chats/{chat_id}/messages` - Add message to chat
- `DELETE /api/chats/{chat_id}` - Delete chat (soft delete)
- `GET /api/chats/{chat_id}/share` - Share chat (generate share token)
- `GET /api/chats/shared/{token}` - Get shared chat (public)
- `POST /api/chats/{chat_id}/stream` - Stream AI response (SSE)
- `GET /api/chats/search` - Search chats

**Features:**
- User-scoped queries (users only see their chats)
- Soft delete support
- Chat sharing via secure tokens
- Streaming responses for real-time AI output
- Search functionality

##### `app/routes/users.py`
**Purpose**: User management endpoints  
**Description**: User profile operations:
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile
- `DELETE /api/users/me` - Delete user account

##### `app/routes/admin.py`
**Purpose**: Admin panel API  
**Description**: Administrative endpoints (admin-only):
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/{user_id}` - Get user details
- `PUT /api/admin/users/{user_id}` - Update user
- `DELETE /api/admin/users/{user_id}` - Delete user
- `GET /api/admin/stats` - System statistics

##### `app/routes/preferences.py`
**Purpose**: User preferences API  
**Description**: Stores user preferences and settings

---

#### **Business Logic Services (`/app/services`)**

##### `app/services/auth_service.py`
**Purpose**: Authentication business logic  
**Description**: Core authentication operations:
- `register_user()` - User registration with password hashing, email verification
- `login_user()` - Password verification, token generation, session creation
- `verify_email()` - Email verification token validation
- `reset_password()` - Password reset token validation and password update
- Account lockout management
- Session management

##### `app/services/oauth_service.py`
**Purpose**: OAuth integration logic  
**Description**: Social login handling:
- `handle_google_callback()` - Google OAuth token exchange and user creation
- `handle_microsoft_callback()` - Microsoft/Azure AD OAuth token exchange
- User linking (associates OAuth account with existing user)

##### `app/services/email_service.py`
**Purpose**: Email sending via AWS SES  
**Description**: Email notifications:
- Email verification emails
- Password reset emails
- Welcome emails
- Uses AWS SES (boto3) for sending

##### `app/services/password_reset_service.py`
**Purpose**: Password reset workflow  
**Description**: Token generation, validation, and password update

---

#### **Pydantic Schemas (`/app/schemas`)**

##### `app/schemas/auth.py`
**Purpose**: Authentication request/response models  
**Description**: Pydantic models for:
- `RegisterRequest` - Registration input validation
- `LoginRequest` - Login input validation
- `LoginResponse` - Login response with tokens and user info
- `VerifyEmailRequest`, `ForgotPasswordRequest`, etc.

##### `app/schemas/admin.py`
**Purpose**: Admin API schemas  
**Description**: Admin request/response models

---

#### **Middleware (`/app/middleware`)**

##### `app/middleware/rate_limiter.py`
**Purpose**: Rate limiting middleware  
**Description**: Uses `slowapi` to enforce rate limits:
- Login: 5 requests per 15 minutes
- Registration: 3 requests per hour
- Password reset: 3 requests per hour
- Custom limits per endpoint

##### `app/middleware/csrf.py`
**Purpose**: CSRF protection  
**Description**: Cross-site request forgery protection middleware

---

#### **Utilities (`/app/utils`)**

##### `app/utils/file_extractor.py`
**Purpose**: File content extraction  
**Description**: Extracts text from uploaded files:
- **PDF**: PyPDF2 and pdfplumber
- **DOCX**: python-docx
- **PPTX**: python-pptx
- **Images**: OCR with pytesseract (future)

Used to extract context from uploaded files for AI-powered conversations.

---

### 🎨 Frontend Application (`/frontend`)

#### **Root Configuration**

##### `frontend/package.json`
**Purpose**: Node.js dependencies and scripts  
**Description**: Lists frontend dependencies:
- Next.js 14, React 18, TypeScript
- Tailwind CSS, Axios
- Form validation (react-hook-form, zod)
- UI libraries (lucide-react, react-markdown, react-syntax-highlighter)
- Export utilities (html2canvas, jspdf)

##### `frontend/next.config.js`
**Purpose**: Next.js configuration  
**Description**: Configures:
- Standalone output for Docker
- Image domains (localhost, production IP)
- Environment variables (NEXT_PUBLIC_API_URL)

##### `frontend/tsconfig.json`
**Purpose**: TypeScript configuration  
**Description**: TypeScript compiler options, paths, and module resolution

##### `frontend/tailwind.config.js`
**Purpose**: Tailwind CSS configuration  
**Description**: Theme customization, content paths, plugins

##### `frontend/Dockerfile`
**Purpose**: Frontend Docker image build  
**Description**: Multi-stage build:
1. **deps** - Install dependencies
2. **builder** - Build Next.js application
3. **runner** - Production server with standalone output

---

#### **Application Pages (`/frontend/src/app`)**

##### `frontend/src/app/page.jsx`
**Purpose**: Home page  
**Description**: Main entry point. Dynamically imports `ChatBot` component with code splitting and SSR disabled (client-side only).

##### `frontend/src/app/layout.jsx`
**Purpose**: Root layout  
**Description**: Wraps all pages with:
- AuthContext provider
- ChatContext provider
- Global styles
- Metadata and SEO tags
- Error boundaries

##### `frontend/src/app/globals.css`
**Purpose**: Global CSS styles  
**Description**: Tailwind imports and custom styles

##### `frontend/src/app/loading.jsx`
**Purpose**: Loading UI component  
**Description**: Shows loading spinner during page transitions

##### `frontend/src/app/error.jsx`
**Purpose**: Error boundary component  
**Description**: Catches and displays errors gracefully

##### `frontend/src/app/robots.ts` & `frontend/src/app/sitemap.ts`
**Purpose**: SEO files  
**Description**: Generates robots.txt and sitemap.xml dynamically

---

#### **Authentication Pages (`/frontend/src/app/(auth)`)**

##### `frontend/src/app/(auth)/login/page.tsx`
**Purpose**: User login page  
**Description**: Login form with:
- Email/password input
- "Remember me" option
- Google/Microsoft OAuth buttons
- Forgot password link
- Client-side validation (zod)
- Error handling

##### `frontend/src/app/(auth)/signup/page.tsx`
**Purpose**: User registration page  
**Description**: Registration form with:
- Name, email, password, phone fields
- Password strength indicator
- Terms acceptance
- Email verification notice

##### `frontend/src/app/(auth)/forgot-password/page.tsx`
**Purpose**: Password reset request page  
**Description**: Form to request password reset email

##### `frontend/src/app/(auth)/reset-password/[token]/page.tsx`
**Purpose**: Password reset page  
**Description**: Form to set new password using reset token from email

##### `frontend/src/app/(auth)/verify-email/[token]/page.tsx`
**Purpose**: Email verification page  
**Description**: Handles email verification link clicks

##### `frontend/src/app/(auth)/layout.tsx`
**Purpose**: Auth pages layout  
**Description**: Wraps auth pages with consistent styling and navigation

---

#### **Admin Pages (`/frontend/src/app/admin`)**

##### `frontend/src/app/admin/login/page.tsx`
**Purpose**: Admin login page  
**Description**: Separate login for admin users

##### `frontend/src/app/admin/dashboard/page.tsx`
**Purpose**: Admin dashboard  
**Description**: Admin panel with:
- User management
- System statistics
- Chat moderation

##### `frontend/src/app/admin/users/page.tsx`
**Purpose**: User management page  
**Description**: List, edit, delete users (admin-only)

---

#### **OAuth Callback (`/frontend/src/app/auth`)**

##### `frontend/src/app/auth/callback/page.tsx`
**Purpose**: OAuth callback handler  
**Description**: Receives OAuth tokens from backend redirect, stores tokens, redirects to dashboard

---

#### **User Dashboard (`/frontend/src/app/dashboard`)**

##### `frontend/src/app/dashboard/page.tsx`
**Purpose**: User dashboard  
**Description**: Main dashboard after login:
- Chat history sidebar
- New chat creation
- User profile link
- Settings

##### `frontend/src/app/settings/page.tsx`
**Purpose**: User settings page  
**Description**: User preferences, profile editing

##### `frontend/src/app/shared/[token]/page.tsx`
**Purpose**: Shared chat view  
**Description**: Public view of shared chats (no auth required)

---

#### **React Components (`/frontend/src/components`)**

##### `frontend/src/components/ChatBot.jsx`
**Purpose**: Main chatbot component (legacy)  
**Description**: Original chatbot UI with:
- Message display and input
- File upload support
- Typing animations
- Session management
- Auto-scroll

**Note**: Being replaced by modular chat components

##### `frontend/src/components/ChatBot.css`
**Purpose**: ChatBot styles  
**Description**: Custom CSS for chatbot UI

##### `frontend/src/components/chat/ChatInterface.tsx`
**Purpose**: Modern chat interface  
**Description**: Main chat UI component with:
- Message list
- Input area
- File upload
- Sidebar integration

##### `frontend/src/components/chat/ChatMessage.tsx`
**Purpose**: Individual message component  
**Description**: Renders single message:
- User/assistant styling
- Timestamps
- File attachments
- Reactions
- Markdown rendering

##### `frontend/src/components/chat/ChatInput.tsx`
**Purpose**: Message input component  
**Description**: Input field with:
- Send button
- File upload button
- Character counter
- Enter key handling

##### `frontend/src/components/chat/ChatSidebar.tsx`
**Purpose**: Chat history sidebar  
**Description**: Lists user's chats:
- Chat titles and previews
- New chat button
- Search functionality
- Delete chat option

##### `frontend/src/components/chat/TopNav.tsx`
**Purpose**: Top navigation bar  
**Description**: Header with:
- User menu
- Settings link
- Logout button

##### `frontend/src/components/chat/EmptyState.tsx`
**Purpose**: Empty state component  
**Description**: Shows when no chats exist

##### `frontend/src/components/ErrorBoundary.tsx`
**Purpose**: Error boundary component  
**Description**: Catches React errors and displays fallback UI

##### `frontend/src/components/ClientErrorBoundary.tsx`
**Purpose**: Client-side error boundary  
**Description**: Client-only error catching (uses 'use client')

---

#### **React Contexts (`/frontend/src/contexts`)**

##### `frontend/src/contexts/AuthContext.tsx`
**Purpose**: Authentication state management  
**Description**: Provides authentication state and methods:
- `user` - Current user object
- `isAuthenticated` - Auth status
- `login()`, `logout()`, `register()` - Auth methods
- Token management (stored in localStorage/cookies)
- Auto-refresh tokens

**Usage**: Wraps entire app, provides auth state to all components

##### `frontend/src/contexts/ChatContext.tsx`
**Purpose**: Chat state management  
**Description**: Manages chat-related state:
- `chats` - List of user's chats
- `currentChat` - Currently selected chat
- `createNewChat()` - Create new conversation
- `sendMessage()` - Send message to current chat
- `selectChat()` - Load chat history
- `deleteChat()` - Delete chat
- `loadChatHistory()` - Fetch all chats from backend

**Usage**: Provides chat state to chat components

---

#### **API Libraries (`/frontend/src/lib`)**

##### `frontend/src/lib/api.ts`
**Purpose**: Base API client  
**Description**: Axios instance with:
- Base URL configuration
- Request/response interceptors
- Token attachment (from cookies/localStorage)
- Error handling

##### `frontend/src/lib/auth-api.ts`
**Purpose**: Authentication API functions  
**Description**: API calls for auth:
- `login()`, `register()`, `logout()`
- `forgotPassword()`, `resetPassword()`
- `verifyEmail()`, `refreshToken()`
- OAuth callback handling

##### `frontend/src/lib/chat-api.ts`
**Purpose**: Chat API functions  
**Description**: API calls for chats:
- `getChats()`, `getChat()`, `createChat()`
- `addMessage()`, `deleteChat()`
- `searchChats()`, `shareChat()`
- `streamMessage()` - Server-sent events for streaming AI responses

##### `frontend/src/lib/validations.ts`
**Purpose**: Zod validation schemas  
**Description**: Reusable validation schemas:
- Login, register, password reset forms
- Email, password format validation

##### `frontend/src/lib/export-utils.ts`
**Purpose**: Chat export utilities  
**Description**: Functions to export chats:
- PDF export (jspdf)
- Image export (html2canvas)

---

#### **Utilities (`/frontend/src/utils`)**

##### `frontend/src/utils/logger.ts`
**Purpose**: Centralized logging utility  
**Description**: Logging functions:
- `logger.info()`, `logger.error()`, `logger.warn()`
- Filters logs in production
- Consistent log format

---

#### **Type Definitions (`/frontend/src/types`)**

##### `frontend/src/types/chat.ts`
**Purpose**: TypeScript type definitions  
**Description**: Defines types:
- `Message` - Individual message structure
- `Chat` - Chat document structure
- `ChatData` - API response format

---

#### **Legacy Files**

##### `frontend/src/api.js`
**Purpose**: Legacy API client (JavaScript)  
**Description**: Original API functions for chat. Being migrated to TypeScript modules in `/lib`.

##### `frontend/src/middleware.ts`
**Purpose**: Next.js middleware  
**Description**: Runs on every request:
- Route protection (redirects unauthenticated users)
- Token validation
- Admin route protection

---

## 🔄 Data Flow

### Chat Flow
1. **User opens app** → `ChatContext` loads chat history from `/api/chats`
2. **User creates new chat** → `POST /api/chats` creates chat document
3. **User sends message** → `POST /chat/answer` processes via `router_agent`
4. **Intent detected** → `intent_classifier` determines content type
5. **Clarification** → `clarifier_engine` extracts fields, asks missing questions
6. **Confirmation** → `summary_engine` generates summary, user confirms
7. **Generation** → Content generation begins (future: actual content creation)
8. **Persistence** → Messages saved to MongoDB via `/api/chats/{id}/messages`

### Authentication Flow
1. **User registers** → `POST /api/v1/auth/register` → Email verification sent
2. **User verifies email** → `POST /api/v1/auth/verify-email` → Account activated
3. **User logs in** → `POST /api/v1/auth/login` → JWT tokens returned
4. **Tokens stored** → Frontend stores in httpOnly cookies/localStorage
5. **API requests** → Axios interceptors attach tokens to requests
6. **Token refresh** → `AuthContext` automatically refreshes expired tokens

### OAuth Flow
1. **User clicks "Login with Google"** → Redirects to Google OAuth
2. **User authorizes** → Google redirects to `/api/v1/auth/google/callback`
3. **Backend exchanges code** → Gets user info, creates/links account
4. **Tokens generated** → Redirects to frontend with tokens
5. **Frontend stores tokens** → User logged in

---

## 🔐 Security Features

1. **JWT Authentication** - Secure token-based auth
2. **Password Hashing** - Bcrypt with 12 rounds
3. **Rate Limiting** - Prevents brute force attacks
4. **Account Lockout** - Locks after failed login attempts
5. **CSRF Protection** - Prevents cross-site request forgery
6. **Input Validation** - Pydantic schemas validate all inputs
7. **SQL Injection Prevention** - Beanie ODM prevents injection
8. **CORS Configuration** - Restricts allowed origins
9. **HttpOnly Cookies** - Prevents XSS token theft
10. **Email Verification** - Requires verified email for registration

---

## 🚀 Deployment

### Docker Compose
The project uses Docker Compose for easy deployment:
- **Backend**: FastAPI on port 8001
- **Frontend**: Next.js on port 3000
- **MongoDB**: Port 27018 (standalone) or shared with external service
- **Redis**: Port 6380 (standalone) or shared with external service

### CI/CD
GitHub Actions workflow:
- Builds Docker images
- Pushes to DockerHub
- Deploys to server via SSH
- Runs health checks

---

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, indexed),
  password_hash: String,
  first_name: String,
  last_name: String,
  role: Enum("user", "admin"),
  is_email_verified: Boolean,
  failed_login_attempts: Number,
  lockout_until: DateTime,
  active_sessions: Array[Session],
  created_at: DateTime,
  updated_at: DateTime
}
```

### Chats Collection
```javascript
{
  _id: ObjectId,
  user_id: String (indexed),
  session_id: String (indexed),
  title: String,
  messages: Array[Message],
  is_deleted: Boolean,
  is_shared: Boolean,
  share_token: String (indexed, optional),
  shared_at: DateTime (optional),
  created_at: DateTime (indexed),
  updated_at: DateTime
}
```

### Messages (embedded in Chat)
```javascript
{
  role: String ("user" | "assistant"),
  content: String,
  timestamp: DateTime,
  file_url: String (optional),
  reactions: Array[String],
  is_regenerated: Boolean
}
```

---

## 🎯 Key Features Summary

✅ **AI-Powered Conversations** - OpenAI GPT for natural responses  
✅ **Multi-Content Support** - Videos, Images, Text, SCORM  
✅ **File Upload & Extraction** - PDF, DOCX, PPTX context  
✅ **Persistent Chat History** - MongoDB storage  
✅ **Full Authentication** - JWT + OAuth (Google, Microsoft)  
✅ **User Management** - Registration, profiles, admin panel  
✅ **Security** - Rate limiting, CSRF, password hashing  
✅ **Production Ready** - Docker, CI/CD, health checks  
✅ **Modern UI** - Next.js, TypeScript, Tailwind CSS  
✅ **Real-time Features** - Typing animations, auto-scroll  

---

## 📝 Notes

- The project has migrated from Vite + React to Next.js 14 (App Router)
- Chat persistence is separate from session-based chat flow
- OpenAI integration is optional (has fallbacks)
- File extraction supports multiple formats for context-aware conversations
- Admin panel for user management and moderation
- Shared chat functionality via secure tokens

---

**Last Updated**: 2024  
**Project Status**: Production Ready  
**Version**: 1.0.0

