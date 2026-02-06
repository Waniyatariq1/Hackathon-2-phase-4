# Quickstart: AI Chatbot with MCP Server

**Feature**: AI Chatbot with MCP Server (001-ai-chatbot-mcp)
**Date**: 2026-01-04
**Purpose**: Developer quickstart guide for implementing the chat endpoint and MCP server

## Prerequisites

### Required Software

1. **Python 3.13+**: Backend runtime
2. **UV**: Python package manager (`pip install uv`)
3. **Docker & Docker Compose**: Local database setup
4. **Git**: Version control

### Required API Keys

1. **OpenAI API Key**: For OpenAI Agents SDK
   - Get from: https://platform.openai.com/api-keys
   - Set as environment variable: `OPENAI_API_KEY=sk-...`

2. **Better Auth Secret**: Shared with frontend (from Phase II)
   - Set as environment variable: `BETTER_AUTH_SECRET=...`

3. **Database URL**: Neon PostgreSQL connection string (from Phase II)
   - Local: `postgresql://user:password@localhost:5432/taskvault`
   - Production: Neon connection string
   - Set as environment variable: `DATABASE_URL=...`

---

## Local Development Setup

### 1. Start Database

```bash
# Start PostgreSQL container
docker-compose up -d postgres

# Verify database is running
docker-compose ps postgres
```

### 2. Create Virtual Environment

```bash
cd backend
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

### 3. Install Dependencies

```bash
uv pip install -r requirements.txt
```

Required dependencies (add to `requirements.txt` if not present):
```
fastapi>=0.104.0
sqlmodel>=0.0.14
pydantic>=2.5.0
alembic>=1.13.0
python-jose[cryptography]>=3.3.0
openai-agents>=0.1.0  # Check latest version
@modelcontextprotocol/sdk-python>=0.1.0  # Check latest version
httpx>=0.25.0
pytest>=7.4.0
pytest-asyncio>=0.21.0
```

### 4. Configure Environment Variables

Create `.env` file in backend directory:

```bash
# Database
DATABASE_URL=postgresql://taskvault:taskvault@localhost:5432/taskvault

# Authentication (shared with frontend)
BETTER_AUTH_SECRET=your-secret-key-here

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key-here

# Application
APP_ENV=development
LOG_LEVEL=debug
```

### 5. Run Database Migrations

```bash
# Apply all pending migrations
alembic upgrade head

# Verify new tables exist
alembic current
# Should show: 003_add_conversations_and_messages_tables
```

### 6. Start Development Server

```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

Server should start at: `http://localhost:8000`

---

## Testing the Chat Endpoint

### 1. Get JWT Token

You'll need a valid JWT token. If you have Phase II authentication working:

```bash
# Login endpoint (assuming exists from Phase II)
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'
```

Copy the `access_token` from the response.

### 2. Test Chat Endpoint

```bash
# Start a new conversation
curl -X POST http://localhost:8000/api/123/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "Create a task to buy groceries"
  }'

# Continue existing conversation
curl -X POST http://localhost:8000/api/123/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
    "message": "Show me my tasks"
  }'
```

### 3. Expected Response

```json
{
  "response": "I've created a new task for you: 'buy groceries'. Is there anything else you'd like to add?",
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## Running Tests

### Run All Tests

```bash
# From backend directory
pytest
```

### Run Specific Test Categories

```bash
# Unit tests only
pytest tests/unit/

# Integration tests only
pytest tests/integration/

# API tests only
pytest tests/api/

# With coverage
pytest --cov=src --cov-report=html
```

### Run Tests for Specific File

```bash
pytest tests/unit/test_chat_service.py -v
```

---

## Project Structure Overview

### Backend Files to Create/Modify

```
backend/
├── src/
│   ├── models/
│   │   ├── conversation.py    # NEW: Conversation model
│   │   └── message.py         # NEW: Message model
│   ├── services/
│   │   ├── task_service.py    # EXISTING: Update if needed
│   │   └── chat_service.py    # NEW: Chat orchestration
│   ├── api/
│   │   └── routes/
│   │       └── chat.py        # NEW: Chat endpoint
│   ├── mcp/
│   │   ├── server.py          # NEW: MCP server
│   │   └── tools/
│   │       ├── add_task.py
│   │       ├── list_tasks.py
│   │       ├── complete_task.py
│   │       ├── delete_task.py
│   │       └── update_task.py
│   ├── agents/
│   │   └── task_agent.py      # NEW: OpenAI agent
│   └── auth/
│       └── jwt.py             # EXISTING: JWT verification
├── tests/
│   ├── unit/
│   ├── integration/
│   └── api/
└── alembic/
    └── versions/
        └── 003_add_conversations_and_messages_tables.py  # NEW
```

---

## Implementation Checklist

### Phase 1: Database Layer

- [ ] Create `Conversation` SQLModel model
- [ ] Create `Message` SQLModel model
- [ ] Write Alembic migration `003_add_conversations_and_messages_tables.py`
- [ ] Apply migration and verify tables
- [ ] Add database indexes for performance

### Phase 2: MCP Tools

- [ ] Create MCP server scaffold (`src/mcp/server.py`)
- [ ] Implement `add_task` tool
- [ ] Implement `list_tasks` tool
- [ ] Implement `complete_task` tool
- [ ] Implement `delete_task` tool
- [ ] Implement `update_task` tool
- [ ] Add user_id validation to all tools
- [ ] Test MCP tools independently

### Phase 3: OpenAI Agent

- [ ] Create `TaskAgent` class (`src/agents/task_agent.py`)
- [ ] Configure agent with MCP tools
- [ ] Implement conversation history building
- [ ] Handle tool execution results
- [ ] Add error handling for AI failures

### Phase 4: Chat Service

- [ ] Create `ChatService` class (`src/services/chat_service.py`)
- [ ] Implement conversation creation logic
- [ ] Implement conversation history retrieval
- [ ] Integrate with OpenAI Agent
- [ ] Store messages in database
- [ ] Handle edge cases (empty history, etc.)

### Phase 5: API Endpoint

- [ ] Create chat route (`src/api/routes/chat.py`)
- [ ] Add JWT authentication middleware
- [ ] Implement request/response schemas
- [ ] Add comprehensive error handling
- [ ] Update `main.py` to register route
- [ ] Test with manual API calls

### Phase 6: Testing

- [ ] Write unit tests for models
- [ ] Write unit tests for MCP tools
- [ ] Write integration tests for database operations
- [ ] Write API tests for chat endpoint
- [ ] Achieve >90% test coverage

---

## Common Issues and Solutions

### Issue: "User not found" error

**Cause**: User ID in JWT doesn't exist in database or doesn't match path parameter.

**Solution**: Ensure JWT token contains valid `user_id` claim and matches `user_id` in URL path.

### Issue: "Conversation not found" error

**Cause**: Provided `conversation_id` doesn't exist or belongs to different user.

**Solution**: Verify conversation ID is correct and user owns the conversation. For new conversations, omit `conversation_id` or set to `null`.

### Issue: OpenAI API timeout

**Cause**: Network issues or OpenAI service degraded.

**Solution**: Implement retry logic with exponential backoff. Check status at https://status.openai.com.

### Issue: Database connection error

**Cause**: PostgreSQL container not running or connection string incorrect.

**Solution**: Verify `docker-compose ps postgres` shows container as "Up". Check `DATABASE_URL` in `.env`.

### Issue: Migration fails

**Cause**: Database schema conflict or missing dependencies.

**Solution**: Check current migration status with `alembic current`. Review migration file for errors.

---

## Development Tips

1. **Use FastAPI Auto-Docs**: Visit `http://localhost:8000/docs` for interactive API documentation
2. **Enable SQL Logging**: Set `LOG_LEVEL=debug` to see SQL queries in logs
3. **Use SQLite for Testing**: Override `DATABASE_URL` with `sqlite:///test.db` for faster test runs
4. **Hot Reload**: UVicorn with `--reload` flag automatically restarts on code changes
5. **Validate OpenAI Integration**: Test with simple "echo" prompt before full tool integration

---

## Next Steps

After completing implementation:

1. **Frontend Integration**: Add ChatKit UI components to frontend (Phase III, separate feature)
2. **Performance Testing**: Load test with 1000+ concurrent requests
3. **Error Monitoring**: Add logging and error tracking (e.g., Sentry)
4. **Rate Limiting**: Implement per-user rate limiting to control costs
5. **Analytics**: Track conversation metrics and user engagement

---

## Additional Resources

- **OpenAI Agents SDK Docs**: https://platform.openai.com/docs/guides/agents
- **MCP Protocol Docs**: https://modelcontextprotocol.io/
- **FastAPI Tutorial**: https://fastapi.tiangolo.com/tutorial/
- **SQLModel Docs**: https://sqlmodel.tiangolo.com/
- **Constitution**: See `.specify/memory/constitution.md` for architecture principles

---

## Support

For questions or issues:
1. Check the feature spec: `specs/001-ai-chatbot-mcp/spec.md`
2. Review implementation plan: `specs/001-ai-chatbot-mcp/plan.md`
3. Consult backend CLAUDE.md: `backend/CLAUDE.md`
4. Review constitution principles: `.specify/memory/constitution.md`
