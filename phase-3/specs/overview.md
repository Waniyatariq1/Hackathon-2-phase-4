# Todo App - Hackathon Phase III Overview

**Project**: Todo Full-Stack Web Application with AI Chatbot  
**Current Phase**: Phase III - AI-Powered Conversational Interface  
**Created**: 2025-12-19  
**Status**: Active Development

## Project Purpose

A todo application that evolves from console app (Phase I) to full-stack web application (Phase II) to AI-powered conversational interface (Phase III). The application enables users to manage their tasks through both traditional GUI-based CRUD operations and natural language conversations with an AI agent.

## Current Phase: Phase III

### Phase Evolution

- **Phase I**: Console-based todo application (Completed)
- **Phase II**: Full-Stack Web Application with GUI-based CRUD, Authentication, and Persistent Storage (Completed)
- **Phase III**: AI-Powered Conversational Interface for Task Management (In Progress)

## Phase II Requirements (Maintained)

### ✅ Completed Features

#### GUI-Based Task Management *(mandatory)*
- **CR-001**: Users can create tasks via web form with title (required) and description (optional)
- **CR-002**: Users can view all their tasks in a responsive, scannable list interface
- **CR-003**: Users can update task title and description through inline editing
- **CR-004**: Users can toggle task completion status with checkbox UI
- **CR-005**: Users can delete tasks with confirmation dialog
- **CR-006**: Task list displays tasks sorted by creation date (newest first)
- **CR-007**: Empty state message when user has no tasks
- **CR-008**: Loading states (skeleton placeholders) during data fetching

#### User Authentication *(mandatory)*
- **AU-001**: User signup flow with email and password validation
- **AU-002**: User signin flow with credential verification
- **AU-003**: JWT-based stateless authentication using Better Auth
- **AU-004**: Automatic redirect to `/signin` for unauthenticated users
- **AU-005**: Sign-out functionality that clears session and redirects
- **AU-006**: Session expiration handling with automatic redirect

#### Data Persistence *(mandatory)*
- **DB-001**: All task data stored in Neon Serverless PostgreSQL database
- **DB-002**: User isolation enforced at database query level (all queries filter by `user_id`)
- **DB-003**: Task model includes: id, user_id, title, description, completed, created_at, updated_at
- **DB-004**: Database migrations managed via Alembic
- **DB-005**: Connection pooling for serverless database access

#### RESTful API *(mandatory)*
- **API-001**: GET `/api/{user_id}/tasks` - List all tasks for authenticated user
- **API-002**: POST `/api/{user_id}/tasks` - Create new task
- **API-003**: GET `/api/{user_id}/tasks/{id}` - Get single task details
- **API-004**: PUT `/api/{user_id}/tasks/{id}` - Update task title/description
- **API-005**: PATCH `/api/{user_id}/tasks/{id}` - Toggle completion status
- **API-006**: DELETE `/api/{user_id}/tasks/{id}` - Delete task
- **API-007**: All endpoints require JWT token in `Authorization: Bearer <token>` header
- **API-008**: All endpoints return 401 Unauthorized for missing/invalid tokens
- **API-009**: All endpoints return 403 Forbidden when path `user_id` doesn't match JWT `user_id`

## Phase III Requirements (New)

### Conversational Interface *(mandatory)*

#### Natural Language Task Management
- **CI-001**: Users can interact with AI chatbot through conversational interface
- **CI-002**: Chatbot understands natural language commands for task operations:
  - Task creation: "Add a task to buy groceries", "I need to remember to pay bills"
  - Task listing: "Show me all my tasks", "What's pending?", "What have I completed?"
  - Task completion: "Mark task 3 as complete", "Done with the meeting task"
  - Task deletion: "Delete the meeting task", "Remove task 2"
  - Task updates: "Change task 1 to 'Call mom tonight'", "Update task title"
- **CI-003**: Chatbot provides friendly confirmation messages after each action
- **CI-004**: Chatbot handles errors gracefully with helpful error messages
- **CI-005**: Chatbot maintains conversation context across multiple turns

#### Chat API Endpoint *(mandatory)*
- **CI-006**: POST `/api/{user_id}/chat` - Send message and receive AI response
- **CI-007**: Request includes: `conversation_id` (optional), `message` (required)
- **CI-008**: Response includes: `conversation_id`, `response` (AI message), `tool_calls` (MCP tools invoked)
- **CI-009**: Endpoint is stateless - conversation history fetched from database on each request
- **CI-010**: Endpoint requires JWT authentication (same as Phase II endpoints)

#### Conversation State Management *(mandatory)*
- **CI-011**: Conversation history stored in database (stateless server architecture)
- **CI-012**: Conversation model includes: id, user_id, created_at, updated_at
- **CI-013**: Message model includes: id, conversation_id, user_id, role (user/assistant), content, created_at
- **CI-014**: Server fetches conversation history from database before processing each chat request
- **CI-015**: Server stores user message and assistant response after processing
- **CI-016**: Conversations persist across server restarts (database-backed)

### MCP Server Integration *(mandatory)*

#### MCP Tools for Task Operations
- **MCP-001**: MCP server exposes `add_task` tool for creating tasks
  - Parameters: `user_id` (string, required), `title` (string, required), `description` (string, optional)
  - Returns: `task_id`, `status`, `title`
- **MCP-002**: MCP server exposes `list_tasks` tool for retrieving tasks
  - Parameters: `user_id` (string, required), `status` (string, optional: "all", "pending", "completed")
  - Returns: Array of task objects
- **MCP-003**: MCP server exposes `complete_task` tool for marking tasks complete
  - Parameters: `user_id` (string, required), `task_id` (integer, required)
  - Returns: `task_id`, `status`, `title`
- **MCP-004**: MCP server exposes `delete_task` tool for removing tasks
  - Parameters: `user_id` (string, required), `task_id` (integer, required)
  - Returns: `task_id`, `status`, `title`
- **MCP-005**: MCP server exposes `update_task` tool for modifying tasks
  - Parameters: `user_id` (string, required), `task_id` (integer, required), `title` (string, optional), `description` (string, optional)
  - Returns: `task_id`, `status`, `title`
- **MCP-006**: All MCP tools are stateless and store state in database
- **MCP-007**: All MCP tools enforce user isolation (filter by `user_id`)

### AI Agent Integration *(mandatory)*

#### OpenAI Agents SDK
- **AI-001**: AI agent uses OpenAI Agents SDK (Agent + Runner pattern)
- **AI-002**: Agent receives conversation history + new user message
- **AI-003**: Agent invokes appropriate MCP tools based on user intent
- **AI-004**: Agent can chain multiple tools in a single turn if needed
- **AI-005**: Agent provides natural language responses after tool execution
- **AI-006**: Agent handles tool errors gracefully and informs user

### Frontend Chat Interface *(mandatory)*

#### OpenAI ChatKit Integration
- **UI-001**: Frontend uses OpenAI ChatKit for conversational UI
- **UI-002**: Chat interface displays conversation history with user and assistant messages
- **UI-003**: Chat interface allows users to type and send messages
- **UI-004**: Chat interface shows loading state while waiting for AI response
- **UI-005**: Chat interface displays tool calls and their results (optional, for transparency)
- **UI-006**: Chat interface is responsive and accessible (WCAG 2.1 Level AA)
- **UI-007**: Domain allowlist configured in OpenAI platform for hosted ChatKit

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Frontend (Next.js 16+)                         │
│  ┌──────────────────────┐         ┌──────────────────────────────────┐  │
│  │   GUI Task Manager   │         │    OpenAI ChatKit UI             │  │
│  │   (Phase II)         │         │    (Phase III)                    │  │
│  │                      │         │                                   │  │
│  │  - Task List         │         │  - Chat Interface                 │  │
│  │  - Task Form         │         │  - Message History                │  │
│  │  - Task Actions      │         │  - Natural Language Input         │  │
│  └──────────┬───────────┘         └──────────────┬───────────────────┘  │
│             │                                     │                       │
│             │ Better Auth + JWT                   │                       │
│             │                                     │                       │
└─────────────┼─────────────────────────────────────┼───────────────────────┘
              │                                     │
              │  HTTP + JWT                         │  HTTP + JWT
              │                                     │
┌─────────────┼─────────────────────────────────────┼───────────────────────┐
│             │                                     │                       │
│             ▼                                     ▼                       │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │              FastAPI Backend Server                               │   │
│  │                                                                   │   │
│  │  ┌────────────────────────────────────────────────────────────┐  │   │
│  │  │         REST API Endpoints (Phase II)                      │  │   │
│  │  │  GET/POST/PUT/PATCH/DELETE /api/{user_id}/tasks            │  │   │
│  │  └───────────────────────┬────────────────────────────────────┘  │   │
│  │                          │                                        │   │
│  │  ┌───────────────────────▼────────────────────────────────────┐  │   │
│  │  │         Chat Endpoint (Phase III)                          │  │   │
│  │  │  POST /api/{user_id}/chat                                   │  │   │
│  │  │                                                             │  │   │
│  │  │  1. Receive user message + conversation_id                  │  │   │
│  │  │  2. Fetch conversation history from database               │  │   │
│  │  │  3. Build message array (history + new message)            │  │   │
│  │  │  4. Store user message in database                         │  │   │
│  │  │  5. Run OpenAI Agent with MCP tools                         │  │   │
│  │  │  6. Store assistant response in database                   │  │   │
│  │  │  7. Return response to client                              │  │   │
│  │  └───────────────────────┬────────────────────────────────────┘  │   │
│  │                          │                                        │   │
│  │                          ▼                                        │   │
│  │  ┌────────────────────────────────────────────────────────────┐  │   │
│  │  │         OpenAI Agents SDK                                   │  │   │
│  │  │  (Agent + Runner)                                           │  │   │
│  │  │                                                             │  │   │
│  │  │  - Processes conversation history                          │  │   │
│  │  │  - Determines user intent                                   │  │   │
│  │  │  - Invokes MCP tools                                        │  │   │
│  │  │  - Generates natural language response                      │  │   │
│  │  └───────────────────────┬────────────────────────────────────┘  │   │
│  │                          │                                        │   │
│  │                          ▼                                        │   │
│  │  ┌────────────────────────────────────────────────────────────┐  │   │
│  │  │         MCP Server (Official MCP SDK)                      │  │   │
│  │  │                                                             │  │   │
│  │  │  Tools:                                                    │  │   │
│  │  │  - add_task(user_id, title, description?)                 │  │   │
│  │  │  - list_tasks(user_id, status?)                           │  │   │
│  │  │  - complete_task(user_id, task_id)                        │  │   │
│  │  │  - delete_task(user_id, task_id)                          │  │   │
│  │  │  - update_task(user_id, task_id, title?, description?)    │  │   │
│  │  │                                                             │  │   │
│  │  │  All tools are stateless and query database directly       │  │   │
│  │  └───────────────────────┬────────────────────────────────────┘  │   │
│  │                          │                                        │   │
│  └──────────────────────────┼────────────────────────────────────────┘   │
│                             │                                            │
│                             ▼                                            │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │         Neon Serverless PostgreSQL Database                       │   │
│  │                                                                    │   │
│  │  Tables:                                                           │   │
│  │  - tasks (Phase II): id, user_id, title, description,             │   │
│  │                     completed, created_at, updated_at             │   │
│  │  - conversations (Phase III): id, user_id, created_at,           │   │
│  │                              updated_at                           │   │
│  │  - messages (Phase III): id, conversation_id, user_id,           │   │
│  │                         role, content, created_at                 │   │
│  │                                                                    │   │
│  │  All queries filtered by user_id for data isolation               │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
```

### Key Architecture Principles

1. **Stateless Server**: Backend holds no in-memory state. All state persisted in database.
2. **User Isolation**: All database queries filter by `user_id` extracted from JWT.
3. **MCP Tool Standardization**: Task operations exposed as standardized MCP tools.
4. **Single Chat Endpoint**: AI routing handled by agent, not multiple endpoints.
5. **Database-Backed Conversations**: Conversation history stored in database for persistence.

## Technology Stack

### Frontend *(mandatory)*

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | Next.js | 16+ | React framework with App Router |
| Language | TypeScript | Latest | Type-safe JavaScript |
| Styling | Tailwind CSS | Latest | Utility-first CSS framework |
| Icons | Lucide React | Latest | Icon library |
| Authentication | Better Auth | Latest | JWT-based authentication |
| Chat UI | OpenAI ChatKit | Latest | Conversational interface (Phase III) |
| Build Tool | Next.js Built-in | - | Bundling and optimization |

### Backend *(mandatory)*

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | FastAPI | Latest | Python web framework |
| Language | Python | 3.13+ | Backend programming language |
| ORM | SQLModel | Latest | Database ORM (SQLAlchemy + Pydantic) |
| Database | Neon Serverless PostgreSQL | Latest | Serverless PostgreSQL database |
| Migrations | Alembic | Latest | Database schema versioning |
| AI Framework | OpenAI Agents SDK | Latest | AI agent logic (Phase III) |
| MCP Server | Official MCP SDK | Latest | MCP tools for task operations (Phase III) |
| JWT Library | python-jose | Latest | JWT token verification |
| Package Manager | UV | Latest | Python dependency management |

### Database *(mandatory)*

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Database | Neon Serverless PostgreSQL | Persistent storage for tasks, conversations, messages |
| Connection | Serverless Driver | Connection pooling for serverless environment |

### Authentication *(mandatory)*

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Frontend Auth | Better Auth | User signup, signin, JWT generation |
| Backend Auth | JWT Verification | Token validation using shared secret |
| Secret Management | Environment Variables | `BETTER_AUTH_SECRET` shared between frontend and backend |

## Feature Status

### Phase II Features (Completed)

- ✅ GUI-based task CRUD operations
- ✅ User authentication (signup, signin, signout)
- ✅ JWT-based stateless authentication
- ✅ RESTful API endpoints with user isolation
- ✅ Responsive web interface (mobile-first)
- ✅ Database persistence (Neon PostgreSQL)
- ✅ User data isolation (all queries filter by `user_id`)

### Phase III Features (In Progress)

- 🔄 Conversational interface for task management
- 🔄 OpenAI ChatKit frontend integration
- 🔄 Chat API endpoint (`POST /api/{user_id}/chat`)
- 🔄 MCP server with task operation tools
- 🔄 OpenAI Agents SDK integration
- 🔄 Conversation and message database models
- 🔄 Stateless conversation state management

## Development Workflow

### Spec-Driven Development (SDD)

All development follows the Spec-Kit Plus workflow:

1. **Specify** (`/sp.specify`): Define what to build and why
2. **Plan** (`/sp.plan`): Design how to implement
3. **Tasks** (`/sp.tasks`): Break into atomic, testable tasks
4. **Implement** (`/sp.implement`): Execute tasks with tests

### Project Structure

```
phase-3/
├── frontend/              # Next.js application
│   ├── src/
│   │   ├── app/          # App Router pages
│   │   ├── components/   # React components
│   │   │   ├── tasks/    # Phase II: Task management UI
│   │   │   └── chat/     # Phase III: Chat interface
│   │   ├── lib/          # Utilities and API clients
│   │   └── types/        # TypeScript definitions
│   └── CLAUDE.md         # Frontend-specific guidelines
│
├── backend/              # FastAPI application
│   ├── src/
│   │   ├── models/       # SQLModel schemas
│   │   ├── services/     # Business logic
│   │   ├── api/          # FastAPI routes
│   │   │   ├── routes/
│   │   │   │   ├── tasks.py      # Phase II: Task CRUD endpoints
│   │   │   │   └── chat.py       # Phase III: Chat endpoint
│   │   ├── mcp/          # Phase III: MCP server and tools
│   │   └── agents/       # Phase III: OpenAI Agents SDK
│   └── CLAUDE.md         # Backend-specific guidelines
│
├── specs/                # Specifications
│   ├── overview.md       # This file
│   ├── 001-backend-auth-tasks/  # Phase II: Backend spec
│   ├── 002-frontend-web-app/    # Phase II: Frontend spec
│   └── 003-ai-chatbot/          # Phase III: AI chatbot spec (TBD)
│
├── .specify/             # Spec-Kit configuration
│   ├── memory/
│   │   └── constitution.md  # Project constitution
│   └── templates/        # Spec templates
│
├── history/              # Development history
│   ├── prompts/         # Prompt History Records (PHR)
│   └── adr/             # Architecture Decision Records
│
├── docker-compose.yml    # Local development orchestration
├── CLAUDE.md            # Root-level AI instructions
└── README.md            # Project documentation
```

## Security Requirements

### Authentication & Authorization *(mandatory)*

- **SEC-001**: All API endpoints require valid JWT token
- **SEC-002**: JWT tokens verified using `BETTER_AUTH_SECRET` environment variable
- **SEC-003**: User ID in URL path must match user ID in JWT claims
- **SEC-004**: Missing or invalid tokens return 401 Unauthorized
- **SEC-005**: Path/user_id mismatch returns 403 Forbidden

### Data Isolation *(mandatory)*

- **SEC-006**: All database queries filter by `user_id` from JWT
- **SEC-007**: Users can only access their own tasks, conversations, and messages
- **SEC-008**: Cross-user access attempts return 404 (not 403) to prevent enumeration
- **SEC-009**: MCP tools enforce user isolation (all tools require `user_id` parameter)

### Input Validation *(mandatory)*

- **SEC-010**: All API inputs validated using Pydantic models (backend)
- **SEC-011**: All form inputs validated using TypeScript/Zod (frontend)
- **SEC-012**: SQL injection prevented via SQLModel ORM (parameterized queries)
- **SEC-013**: XSS prevention via React's built-in escaping

## Non-Functional Requirements

### Performance *(optional)*

- **NFR-001**: API response time < 500ms at p95 for all endpoints
- **NFR-002**: Chat response time < 3 seconds for typical queries
- **NFR-003**: Support 1000 concurrent authenticated users
- **NFR-004**: Database queries optimized with indexes on `user_id` and `id` columns

### Reliability *(optional)*

- **NFR-005**: 99.9% uptime for API endpoints
- **NFR-006**: Graceful error handling for database connection failures
- **NFR-007**: Automatic retry logic for transient database errors

### Scalability *(optional)*

- **NFR-008**: Stateless backend enables horizontal scaling
- **NFR-009**: Database connection pooling via Neon's serverless driver
- **NFR-010**: Conversation history retrieval optimized for large message counts

### Accessibility *(mandatory)*

- **NFR-011**: Frontend meets WCAG 2.1 Level AA standards
- **NFR-012**: Keyboard navigation supported for all interactive elements
- **NFR-013**: Screen reader compatible (ARIA labels)
- **NFR-014**: Color contrast ratios ≥ 4.5:1 for normal text

## Environment Variables

### Frontend *(mandatory)*

```bash
# Authentication
BETTER_AUTH_SECRET=<shared-secret-with-backend>
BETTER_AUTH_URL=http://localhost:3000

# API
NEXT_PUBLIC_API_URL=http://localhost:8000

# OpenAI ChatKit (Phase III)
NEXT_PUBLIC_OPENAI_DOMAIN_KEY=<domain-key-from-openai-platform>
```

### Backend *(mandatory)*

```bash
# Authentication
BETTER_AUTH_SECRET=<shared-secret-with-frontend>

# Database
DATABASE_URL=<neon-postgresql-connection-string>

# OpenAI (Phase III)
OPENAI_API_KEY=<openai-api-key>
```

## API Endpoints Summary

### Phase II Endpoints (Task Management)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/{user_id}/tasks` | List all tasks | ✅ JWT |
| POST | `/api/{user_id}/tasks` | Create task | ✅ JWT |
| GET | `/api/{user_id}/tasks/{id}` | Get task details | ✅ JWT |
| PUT | `/api/{user_id}/tasks/{id}` | Update task | ✅ JWT |
| PATCH | `/api/{user_id}/tasks/{id}` | Toggle completion | ✅ JWT |
| DELETE | `/api/{user_id}/tasks/{id}` | Delete task | ✅ JWT |

### Phase III Endpoints (Chat)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/{user_id}/chat` | Send message & get AI response | ✅ JWT |

## MCP Tools Summary

| Tool | Purpose | Parameters | Returns |
|------|---------|------------|---------|
| `add_task` | Create new task | `user_id`, `title`, `description?` | `task_id`, `status`, `title` |
| `list_tasks` | Retrieve tasks | `user_id`, `status?` | Array of tasks |
| `complete_task` | Mark task complete | `user_id`, `task_id` | `task_id`, `status`, `title` |
| `delete_task` | Remove task | `user_id`, `task_id` | `task_id`, `status`, `title` |
| `update_task` | Modify task | `user_id`, `task_id`, `title?`, `description?` | `task_id`, `status`, `title` |

## Success Criteria

### Phase II Success Criteria (Achieved)

- ✅ Users can create, view, update, and delete tasks via web interface
- ✅ 100% of database queries include user_id filtering (zero data leakage)
- ✅ All API endpoints respond within 500ms at p95
- ✅ Invalid JWT tokens rejected with appropriate error codes (401/403)
- ✅ Application passes WCAG 2.1 Level AA accessibility audit

### Phase III Success Criteria (Target)

- 🎯 Users can manage tasks through natural language conversations
- 🎯 Chat responses generated within 3 seconds for typical queries
- 🎯 Conversation history persists across server restarts
- 🎯 MCP tools correctly enforce user isolation (100% of tool calls filter by `user_id`)
- 🎯 AI agent correctly interprets user intent and invokes appropriate tools
- 🎯 Chat interface is responsive and accessible (WCAG 2.1 Level AA)

## Out of Scope

### Phase II Out of Scope (Still Out of Scope)

- Task sharing or collaboration between users
- Task categories, tags, or labels
- Task due dates or reminders
- Task attachments or file uploads
- Task search or advanced filtering
- Pagination for task lists
- Real-time updates (WebSockets/SSE)
- Offline functionality

### Phase III Out of Scope

- Voice input/output for chat
- Multi-language support for chatbot
- Custom AI model fine-tuning
- Chat export functionality
- Conversation search within chat history
- Chat templates or saved prompts
- Multi-turn task planning (e.g., "create 5 tasks for my project")

## Dependencies

### External Services *(mandatory)*

- **Better Auth**: User authentication and JWT generation
- **Neon PostgreSQL**: Database for tasks, conversations, messages
- **OpenAI API**: AI agent capabilities and ChatKit (Phase III)

### Internal Dependencies

- **Phase III depends on Phase II**: Chat functionality requires existing task CRUD API
- **MCP tools depend on database**: All tools query the same database as REST API
- **Chat endpoint depends on MCP server**: Agent invokes MCP tools for task operations

## Risk Analysis

### High Priority Risks

1. **OpenAI API Costs**: High chat volume could result in significant API costs
   - **Mitigation**: Implement rate limiting and usage monitoring

2. **Conversation History Growth**: Large conversation histories could slow chat responses
   - **Mitigation**: Implement conversation summarization or pagination for history retrieval

3. **MCP Tool Errors**: Tool failures could break chat experience
   - **Mitigation**: Comprehensive error handling in MCP tools and agent

### Medium Priority Risks

4. **User Intent Misinterpretation**: AI agent might misunderstand user commands
   - **Mitigation**: Provide clear error messages and allow users to clarify

5. **Token Expiration During Chat**: JWT might expire mid-conversation
   - **Mitigation**: Frontend handles token refresh and retries request

## Next Steps

1. **Create Phase III Specification**: Generate detailed spec for AI chatbot feature (`specs/003-ai-chatbot/spec.md`)
2. **Implement Database Models**: Add `Conversation` and `Message` models to database
3. **Build MCP Server**: Implement MCP server with task operation tools
4. **Integrate OpenAI Agents SDK**: Set up agent and runner for chat endpoint
5. **Implement Chat Endpoint**: Create `POST /api/{user_id}/chat` endpoint
6. **Integrate ChatKit**: Add OpenAI ChatKit to frontend
7. **Test End-to-End**: Verify complete conversational task management flow

## References

- **Phase II Backend Spec**: `specs/001-backend-auth-tasks/spec.md`
- **Phase II Frontend Spec**: `specs/002-frontend-web-app/spec.md`
- **Project Constitution**: `.specify/memory/constitution.md`
- **Root CLAUDE.md**: `CLAUDE.md`
- **Spec-Kit Plus**: https://github.com/panaversity/spec-kit-plus

---

**Last Updated**: 2025-12-19  
**Maintained By**: AI Development Team  
**Status**: Active Development - Phase III

