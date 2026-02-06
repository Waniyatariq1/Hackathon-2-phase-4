# Implementation Plan: AI Chatbot with MCP Server

**Branch**: `001-ai-chatbot-mcp` | **Date**: 2026-01-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-ai-chatbot-mcp/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a stateless chat endpoint that enables users to manage todo tasks through natural language. The system uses OpenAI Agents SDK for AI-powered intent recognition, Official MCP SDK to expose task operations as standardized tools, FastAPI for the chat API endpoint, and SQLModel for database persistence of conversations and messages. All operations enforce user isolation via JWT-based authentication and stateless architecture per Constitution Principle XI.

## Technical Context

**Language/Version**: Python 3.13+
**Primary Dependencies**: FastAPI, OpenAI Agents SDK, Official MCP SDK, SQLModel (Pydantic v2), Alembic
**Storage**: Neon Serverless PostgreSQL (production), PostgreSQL 16+ (local Docker)
**Testing**: pytest with pytest-asyncio, httpx for API tests
**Target Platform**: Linux server (containerized)
**Project Type**: web - backend API
**Performance Goals**: <3 second response time for typical multi-turn conversations, support 1000 sequential requests without degradation
**Constraints**: Stateless architecture (no in-memory conversation state), JWT authentication required, user isolation enforced at database query level
**Scale/Scope**: Supports multiple concurrent users, maintains conversation history across at least 100 messages per conversation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

This feature must comply with all principles in `.specify/memory/constitution.md`:

- [x] **I. Spec-Driven Development**: This plan was created via `/sp.plan` after `/sp.specify`
- [x] **II. Monorepo Architecture**: Changes respect `/frontend` and `/backend` boundaries - this feature is backend-only
- [x] **III. Type Safety**: All data contracts use Pydantic (backend) and TypeScript (frontend)
- [x] **IV. Security-First**: User isolation via JWT `user_id` filtering in all queries; `/api/{user_id}/` routes
- [x] **V. Test-First Development**: Testing strategy includes unit, integration, and API/E2E tests
- [x] **VI. Production-Grade Persistence**: Uses SQLModel with Neon PostgreSQL (or local Docker)
- [x] **VII. API Design Standards**: RESTful CRUD + PATCH + Chat endpoints with standardized responses
- [x] **VIII. Responsive and Accessible UI**: Frontend meets mobile-first and WCAG 2.1 Level AA standards
- [x] **IX. Dockerized Environment**: Local development uses `docker-compose.yml`
- [x] **X. AI Sub-Agents**: Any agents used follow spec-driven workflow and narrow roles
- [x] **XI. AI-Powered Conversational Interface**: Stateless chat architecture, MCP tools, database-backed conversations, OpenAI Agents SDK integration

**Violations Requiring Justification**: None

## Project Structure

### Documentation (this feature)

```text
specs/001-ai-chatbot-mcp/
├── plan.md              # This file (/sp.plan command output)
├── spec.md              # Feature specification (/sp.specify command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
│   ├── chat-endpoint.yaml
│   └── mcp-tools.yaml
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (Phase III Backend)

```text
backend/
├── src/
│   ├── models/          # SQLModel schemas (database + Pydantic)
│   │   ├── task.py      # Existing Task model
│   │   ├── conversation.py  # NEW: Conversation model
│   │   └── message.py   # NEW: Message model
│   ├── services/        # Business logic layer
│   │   ├── task_service.py  # Existing task operations
│   │   └── chat_service.py  # NEW: Chat orchestration service
│   ├── api/             # FastAPI routes (routers)
│   │   └── routes/
│   │       └── chat.py  # NEW: Chat endpoint
│   ├── mcp/             # NEW: MCP server and tools
│   │   ├── server.py    # MCP server implementation
│   │   └── tools/       # MCP tool implementations
│   │       ├── add_task.py
│   │       ├── list_tasks.py
│   │       ├── complete_task.py
│   │       ├── delete_task.py
│   │       └── update_task.py
│   ├── agents/          # NEW: OpenAI Agents SDK integration
│   │   └── task_agent.py  # AI agent for task management
│   ├── auth/            # JWT verification middleware
│   │   └── jwt.py       # Existing JWT middleware
│   └── main.py          # FastAPI app entry point
├── tests/
│   ├── unit/            # Service and model tests
│   │   ├── test_models.py
│   │   ├── test_chat_service.py
│   │   └── test_mcp_tools.py
│   ├── integration/     # Database operation tests
│   │   ├── test_conversation_repository.py
│   │   └── test_mcp_tool_integration.py
│   └── api/             # API endpoint contract tests
│       └── test_chat_endpoint.py
├── alembic/             # Database migrations
│   └── versions/
│       └── 003_add_conversations_and_messages_tables.py  # NEW: Migration
├── pyproject.toml       # Python dependencies (UV)
└── CLAUDE.md            # Backend-specific AI instructions

frontend/
├── src/
│   ├── app/             # Next.js App Router pages
│   │   └── chat/        # NEW: Chat UI pages
│   ├── components/      # React components
│   │   └── chat/        # NEW: ChatKit UI components
│   ├── lib/             # API clients, utilities
│   │   └── api.ts       # Updated with chat endpoint client
│   └── types/           # TypeScript type definitions
│       └── chat.ts      # NEW: Chat-related types
├── tests/
│   ├── components/      # Component tests (React Testing Library)
│   │   └── chat/
│   └── e2e/             # End-to-end tests (Playwright)
│       └── chat.spec.ts
├── package.json         # Frontend dependencies (pnpm)
└── CLAUDE.md            # Frontend-specific AI instructions

specs/
├── features/            # Feature specifications
├── api/                 # API contract documentation
├── database/            # Schema design docs
└── ui/                  # UI/UX specifications
```

**Structure Decision**: Phase III extends Phase II with backend chat endpoint and MCP server integration. Backend uses FastAPI + SQLModel + OpenAI Agents SDK + MCP SDK; Frontend adds OpenAI ChatKit for conversational UI (future phase).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations requiring justification.

## Phase 0: Research

Research findings documented in `research.md`.

## Phase 1: Design & Contracts

### Data Model

Database schema and entity relationships documented in `data-model.md`.

### API Contracts

API specifications for chat endpoint and MCP tools in `contracts/` directory.

### Quickstart

Developer quickstart guide in `quickstart.md`.

## Phase 2: Implementation

To be generated by `/sp.tasks` command.
