# KitabKosh - Reading Companion & Book Tracker

A full-stack web application for managing your reading journey, built with Next.js, FastAPI, and AI-powered conversational interface.

## 🚀 Project Overview

KitabKosh is a modern reading companion that helps you organize your book collection, track reading progress, and manage your library through both traditional GUI and natural language conversations with an AI assistant.

## 📋 Project Phases

### Phase I: Console Todo Application ✅
- Command-line todo application with in-memory storage
- Basic CRUD operations (Add, Delete, Update, View, Mark Complete)
- Python 3.13+ with UV package manager

### Phase II: Full-Stack Web Application ✅
- RESTful API with FastAPI backend
- Next.js 16+ frontend with responsive UI
- User authentication with Better Auth + JWT
- Persistent storage with Neon Serverless PostgreSQL
- User data isolation and security

### Phase III: AI-Powered Conversational Interface ✅
- AI chatbot for natural language book management
- OpenAI Agents SDK integration
- MCP (Model Context Protocol) server with standardized tools
- Stateless chat architecture with database-backed conversations
- OpenAI ChatKit frontend integration

## 🛠 Technology Stack

### Frontend
- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript 5.0+
- **Styling**: Tailwind CSS 3.4+
- **Authentication**: Better Auth with JWT plugin
- **Chat UI**: OpenAI ChatKit (Phase III)
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI (latest stable)
- **Language**: Python 3.13+
- **ORM**: SQLModel (with Pydantic v2)
- **Database**: Neon Serverless PostgreSQL
- **Migrations**: Alembic
- **AI Framework**: OpenAI Agents SDK (Phase III)
- **MCP Server**: Official MCP SDK (Phase III)
- **Authentication**: JWT verification with python-jose

### DevOps
- **Containerization**: Docker + docker-compose
- **Package Managers**: pnpm (frontend), UV (backend)
- **Code Quality**: ESLint, Prettier (frontend), Ruff, mypy (backend)

## 📁 Project Structure

```
phase-3/
├── frontend/              # Next.js application
│   ├── src/
│   │   ├── app/          # App Router pages
│   │   ├── components/   # React components
│   │   │   ├── tasks/    # Book management UI
│   │   │   └── chat/     # AI chatbot interface
│   │   ├── lib/          # Utilities and API clients
│   │   └── types/        # TypeScript definitions
│   └── README.md
│
├── backend/              # FastAPI application
│   ├── src/
│   │   ├── models/       # SQLModel schemas
│   │   ├── services/     # Business logic
│   │   ├── api/routes/   # FastAPI routes
│   │   ├── mcp/          # MCP server and tools
│   │   ├── agents/       # OpenAI Agents SDK
│   │   └── middleware/   # JWT verification
│   └── README.md
│
├── specs/                # Specifications (Spec-Kit Plus)
│   ├── overview.md
│   ├── 001-backend-auth-tasks/
│   ├── 001-ai-chatbot-mcp/
│   ├── 001-chatkit-integration/
│   └── 002-frontend-web-app/
│
├── .specify/             # Spec-Kit configuration
│   └── memory/
│       └── constitution.md
│
├── CLAUDE.md            # Root-level AI instructions
├── docker-compose.yml   # Local development orchestration
└── README.md           # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ and pnpm 8+
- Python 3.13+ and UV
- Docker (for local PostgreSQL)
- Neon PostgreSQL account (for production)
- OpenAI API key (for Phase III chatbot)

### Environment Setup

#### Frontend
Create `frontend/.env.local`:
```env
BETTER_AUTH_SECRET=your-shared-secret
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_OPENAI_DOMAIN_KEY=your-domain-key
```

#### Backend
Create `backend/.env`:
```env
BETTER_AUTH_SECRET=your-shared-secret
DATABASE_URL=postgresql://user:pass@localhost:5432/kitabkosh
OPENAI_API_KEY=sk-proj-your-key
CORS_ORIGINS=http://localhost:3000
```

### Running Locally

#### Option 1: Docker Compose (Recommended)
```bash
docker-compose up
```
This starts:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- PostgreSQL: localhost:5432

#### Option 2: Manual Setup

**Backend:**
```bash
cd backend
uv sync
uvicorn src.main:app --reload
```

**Frontend:**
```bash
cd frontend
pnpm install
pnpm dev
```

## 📚 Features

### Phase II Features ✅
- ✅ User authentication (signup, signin, signout)
- ✅ Book CRUD operations via web interface
- ✅ Responsive dashboard with statistics
- ✅ Reading calendar and progress tracking
- ✅ User profile management
- ✅ JWT-based stateless authentication
- ✅ User data isolation (100% secure)

### Phase III Features ✅
- ✅ AI-powered conversational interface
- ✅ Natural language book management
- ✅ MCP tools for standardized operations
- ✅ Stateless chat architecture
- ✅ Conversation history persistence
- ✅ Priority-based book addition
- ✅ Interactive welcome popup

## 🔐 Security

- **JWT Authentication**: Stateless token-based auth
- **User Isolation**: All queries filter by `user_id`
- **Path Validation**: User ID in path must match JWT
- **Input Validation**: Pydantic models (backend), TypeScript (frontend)
- **SQL Injection Protection**: SQLModel uses parameterized queries

## 📡 API Endpoints

### Task Management (Phase II)
- `GET /api/{user_id}/tasks` - List all books
- `POST /api/{user_id}/tasks` - Create book
- `GET /api/{user_id}/tasks/{id}` - Get book details
- `PUT /api/{user_id}/tasks/{id}` - Update book
- `PATCH /api/{user_id}/tasks/{id}` - Toggle completion
- `DELETE /api/{user_id}/tasks/{id}` - Delete book

### Chat (Phase III)
- `POST /api/{user_id}/chat` - Send message & get AI response

## 🤖 MCP Tools

The MCP server exposes these tools for AI agent:
- `add_book` - Create new book
- `list_books` - Retrieve books
- `complete_book` - Mark book as read
- `delete_book` - Remove book
- `update_book` - Modify book details

## 📖 Documentation

- **Constitution**: `.specify/memory/constitution.md` - Project governance
- **Specifications**: `specs/` - Feature specifications
- **Frontend Guide**: `frontend/README.md`
- **Backend Guide**: `backend/README.md`

## 🧪 Testing

### Backend
```bash
cd backend
pytest
```

### Frontend
```bash
cd frontend
pnpm test
pnpm test:e2e
```

## 📝 Development Workflow

This project follows **Spec-Driven Development (SDD)**:
1. **Specify** (`/sp.specify`) - Define what to build
2. **Plan** (`/sp.plan`) - Design how to implement
3. **Tasks** (`/sp.tasks`) - Break into atomic tasks
4. **Implement** (`/sp.implement`) - Execute with tests

## 🎯 Project Status

- ✅ Phase I: Console App - **COMPLETE**
- ✅ Phase II: Full-Stack Web App - **COMPLETE**
- ✅ Phase III: AI Chatbot - **COMPLETE**

All mandatory requirements from Phase I, II, and III have been implemented.

## 📄 License

This project is part of a hackathon submission.

## 🙏 Acknowledgments

Built with:
- Next.js
- FastAPI
- OpenAI Agents SDK
- Better Auth
- Neon PostgreSQL

