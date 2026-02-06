---
title: Book Management Backend API
emoji: 📚
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
license: mit
---

# Book Management Backend API

FastAPI backend for Phase 3 of the Hackathon project - AI-powered book management system with conversational interface.

## Features

- ✅ RESTful API endpoints for book CRUD operations
- ✅ JWT-based authentication with Better Auth
- ✅ AI-powered chatbot endpoint using OpenAI
- ✅ MCP (Model Context Protocol) tools for book management
- ✅ PostgreSQL database with SQLModel ORM
- ✅ Stateless architecture for scalability

## API Endpoints

### Health Check
- `GET /health` - Health check endpoint

### Authentication
- `POST /api/auth/verify` - Verify JWT token

### Books (Tasks)
- `GET /api/{user_id}/tasks` - List all books
- `POST /api/{user_id}/tasks` - Create a new book
- `GET /api/{user_id}/tasks/{id}` - Get book details
- `PUT /api/{user_id}/tasks/{id}` - Update book
- `PATCH /api/{user_id}/tasks/{id}/complete` - Toggle completion
- `DELETE /api/{user_id}/tasks/{id}` - Delete book

### Chat
- `POST /api/{user_id}/chat` - Send message to AI chatbot

## Environment Variables

Set these secrets in your Hugging Face Space settings:

- `DATABASE_URL` - PostgreSQL connection string (required)
- `BETTER_AUTH_SECRET` - Secret key for JWT signing (required)
- `OPENAI_API_KEY` - OpenAI API key for chatbot (required)
- `CORS_ORIGINS` - Comma-separated list of allowed origins (optional, default: http://localhost:3000)

## Setup

1. Clone this repository
2. Set environment variables/secrets in Hugging Face Space settings
3. Push to Hugging Face Space
4. The Docker container will automatically:
   - Install dependencies
   - Run database migrations
   - Start the FastAPI server on port 7860

## API Documentation

Once deployed, visit:
- Swagger UI: `https://your-space.hf.space/docs`
- ReDoc: `https://your-space.hf.space/redoc`

## Architecture

```
Frontend (Next.js) → Backend (FastAPI) → PostgreSQL
                          ↓
                    OpenAI API (Chat)
                          ↓
                    MCP Tools (Book Management)
```

## License

MIT
