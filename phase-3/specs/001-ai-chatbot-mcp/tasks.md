# Tasks: AI Chatbot with MCP Server

**Input**: Design documents from `/specs/001-ai-chatbot-mcp/`
**Prerequisites**: plan.md (complete), spec.md (complete), research.md (complete), data-model.md (complete), contracts/ (complete)

**Tests**: Test tasks are included per constitution principle V (Test-First Development). Tests MUST be written FIRST and FAIL before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions (Phase III Backend)

- **Backend**: `backend/src/` (models, services, api, mcp, agents), `backend/tests/` (unit, integration, api)
- All task file paths use these exact conventions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependencies

- [ ] T001 Add OpenAI Agents SDK and Official MCP SDK dependencies to backend/pyproject.toml (openai-agents, mcp)
- [ ] T002 [P] Update backend/.env.example with OPENAI_API_KEY environment variable
- [ ] T003 [P] Verify existing database connection in backend/src/db.py supports new models

**Validation**: Run `uv sync` in backend/ to verify new dependencies install successfully

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Foundation

- [ ] T004 Create Conversation SQLModel in backend/src/models/conversation.py (id, user_id indexed, created_at, updated_at per data-model.md)
- [ ] T005 Create Message SQLModel in backend/src/models/message.py (id, conversation_id FK indexed, user_id indexed, role enum, content, created_at per data-model.md)
- [ ] T006 Generate Alembic migration in backend/alembic/versions/003_add_conversations_and_messages_tables.py (create conversations and messages tables with indexes)
- [ ] T007 Apply Alembic migration to create new tables (alembic upgrade head)

**Validation**: Run `alembic current` to verify migration applied successfully, verify tables exist in database

### MCP Server Foundation

- [ ] T008 Create MCP server structure in backend/src/mcp/server.py (initialize MCP server using Official MCP SDK)
- [ ] T009 [P] Create MCP tools directory structure in backend/src/mcp/tools/__init__.py
- [ ] T010 [P] Create base MCP tool interface/helper in backend/src/mcp/tools/base.py (common user_id extraction from JWT, error handling)

**Validation**: Verify MCP server can be imported and initialized without errors

### OpenAI Agents SDK Foundation

- [ ] T011 Create OpenAI Agents SDK integration in backend/src/agents/task_agent.py (initialize agent with OpenAI API key, configure for task management)
- [ ] T012 [P] Create agent configuration in backend/src/agents/config.py (model selection, temperature, max tokens)

**Validation**: Verify OpenAI Agents SDK can be imported and agent initialized (with mock API key)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Chat-Based Task Management (Priority: P1) 🎯 MVP

**Goal**: Users can manage tasks through natural language chat commands

**Independent Test**: Send natural language commands like "create a task to buy groceries" and verify tasks are created/modified accordingly

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T013 [P] [US1] Contract test for chat endpoint in backend/tests/api/test_chat_endpoint.py (POST /api/{user_id}/chat with natural language, verify response format)
- [ ] T014 [P] [US1] Integration test for task creation via chat in backend/tests/integration/test_chat_task_creation.py (send "create task X", verify task created in database)

### Implementation for User Story 1

**MCP Tools:**

- [ ] T015 [US1] Implement add_task MCP tool in backend/src/mcp/tools/add_task.py (user_id, title, description?, returns task_id, status, title, enforces user isolation)
- [ ] T016 [US1] Implement list_tasks MCP tool in backend/src/mcp/tools/list_tasks.py (user_id, status?, returns array of tasks, filters by user_id)
- [ ] T017 [US1] Implement complete_task MCP tool in backend/src/mcp/tools/complete_task.py (user_id, task_id, returns task_id, status, title, enforces user isolation)
- [ ] T018 [US1] Implement delete_task MCP tool in backend/src/mcp/tools/delete_task.py (user_id, task_id, returns task_id, status, title, enforces user isolation)
- [ ] T019 [US1] Implement update_task MCP tool in backend/src/mcp/tools/update_task.py (user_id, task_id, title?, description?, returns task_id, status, title, enforces user isolation)

**MCP Server Registration:**

- [ ] T020 [US1] Register all 5 MCP tools with MCP server in backend/src/mcp/server.py (expose tools to AI agent)

**Chat Service:**

- [ ] T021 [US1] Create chat service in backend/src/services/chat_service.py (process_message method: fetch conversation history, build message array, invoke OpenAI agent with MCP tools, store messages)

**Chat Endpoint:**

- [ ] T022 [US1] Create chat endpoint in backend/src/api/routes/chat.py (POST /api/{user_id}/chat, accepts message + conversation_id?, returns conversation_id, response, tool_calls, requires JWT auth)
- [ ] T023 [US1] Add chat router to FastAPI app in backend/src/main.py (include chat router with prefix /api)

**Schemas:**

- [ ] T024 [P] [US1] Create chat request schema in backend/src/schemas/requests.py (ChatRequest with message, conversation_id?)
- [ ] T025 [P] [US1] Create chat response schema in backend/src/schemas/responses.py (ChatResponse with conversation_id, response, tool_calls)

**Validation**: Send POST request to /api/{user_id}/chat with "create a task to buy milk", verify task created and response received

---

## Phase 4: User Story 2 - Conversation History Persistence (Priority: P2)

**Goal**: System maintains conversation context across multiple messages

**Independent Test**: Send multiple related messages and verify system maintains context

### Tests for User Story 2

- [ ] T026 [P] [US2] Integration test for conversation history in backend/tests/integration/test_conversation_history.py (create conversation, add messages, verify history retrieval)

### Implementation for User Story 2

**Conversation Repository:**

- [ ] T027 [US2] Create conversation repository in backend/src/services/conversation_repository.py (get_or_create_conversation, get_conversation_history methods, filter by user_id)

**Message Repository:**

- [ ] T028 [US2] Create message repository in backend/src/services/message_repository.py (create_message, get_messages_by_conversation methods, filter by user_id)

**Chat Service Enhancement:**

- [ ] T029 [US2] Update chat service in backend/src/services/chat_service.py (fetch conversation history from database before processing, store user message and assistant response after processing)

**Validation**: Send multiple messages in sequence, verify conversation history is maintained and context is preserved

---

## Phase 5: User Story 3 - User Data Isolation (Priority: P3)

**Goal**: Each user only sees and manages their own tasks and conversations

**Independent Test**: Authenticate as two different users, verify data isolation

### Tests for User Story 3

- [ ] T030 [P] [US3] Integration test for user isolation in backend/tests/integration/test_user_isolation.py (User A creates tasks, User B cannot see User A's tasks or conversations)

### Implementation for User Story 3

**User Isolation Enforcement:**

- [ ] T031 [US3] Verify all MCP tools filter by user_id from JWT (review add_task, list_tasks, complete_task, delete_task, update_task)
- [ ] T032 [US3] Verify conversation repository filters by user_id (review get_or_create_conversation, get_conversation_history)
- [ ] T033 [US3] Verify message repository filters by user_id (review create_message, get_messages_by_conversation)
- [ ] T034 [US3] Add user_id validation in chat endpoint (verify path user_id matches JWT user_id, return 403 if mismatch)

**Validation**: Test with multiple users, verify no cross-user data leakage

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Error handling, logging, documentation

- [ ] T035 Add error handling in chat service for OpenAI API failures (graceful error messages, retry logic)
- [ ] T036 Add error handling in MCP tools for database failures (transaction rollback, error responses)
- [ ] T037 [P] Add structured logging for chat requests (user_id, conversation_id, message length, response time)
- [ ] T038 [P] Update backend/README.md with chat endpoint documentation
- [ ] T039 [P] Add OpenAPI documentation for chat endpoint (auto-generated from FastAPI)

**Validation**: Test error scenarios (invalid API key, database connection failure, malformed requests)

---

## Dependencies

### User Story Completion Order

1. **US1 (P1)** - Chat-Based Task Management: Must complete first (core functionality)
2. **US2 (P2)** - Conversation History: Depends on US1 (needs chat endpoint working)
3. **US3 (P3)** - User Data Isolation: Can be implemented in parallel with US2 (security hardening)

### Task Dependencies

- T004-T007 (Database models) → T027-T028 (Repositories) → T029 (Chat service history)
- T008-T010 (MCP server) → T015-T019 (MCP tools) → T020 (Tool registration) → T021 (Chat service)
- T011-T012 (OpenAI Agents SDK) → T021 (Chat service)
- T021 (Chat service) → T022 (Chat endpoint)
- T022 (Chat endpoint) → T013-T014 (Tests)

---

## Parallel Execution Opportunities

Tasks marked with **[P]** can run in parallel:
- T002, T003 (Environment setup)
- T009, T010 (MCP tools structure)
- T012 (Agent config)
- T024, T025 (Schemas)
- T026 (US2 tests)
- T030 (US3 tests)
- T037, T038, T039 (Documentation)

---

## Implementation Strategy

**MVP First**: Implement US1 (Chat-Based Task Management) to deliver core value
**Incremental Delivery**: Add US2 (Conversation History) for enhanced UX, then US3 (User Isolation) for security
**Test-Driven**: Write tests before implementation, ensure tests fail, then implement to make tests pass

---

## Checkpoints

- **After Phase 2**: Foundation ready - MCP server, database models, OpenAI Agents SDK initialized
- **After Phase 3 (US1)**: MVP complete - users can manage tasks via chat
- **After Phase 4 (US2)**: Enhanced UX - conversation history working
- **After Phase 5 (US3)**: Security complete - user isolation enforced
- **After Phase 6**: Production-ready - error handling, logging, documentation complete

