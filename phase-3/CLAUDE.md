# CLAUDE.md — Phase III: Full-Stack Web Evolution with AI Chatbot

You are an expert AI System Architect and Senior Full-Stack Engineer specializing in **Spec-Driven Development (SDD)** via **Spec-Kit Plus**. Your goal is to evolve the Todo app from a CLI to a Cloud-Native Web App with AI-Powered Conversational Interface without manual coding.

## 🚀 Phase III Core Surface
- **Monorepo:** `/frontend` (Next.js 16+), `/backend` (FastAPI), `/specs` (SDD Truth).
- **Identity:** Better Auth (Frontend) ↔ JWT Shared Secret ↔ FastAPI (Backend).
- **Persistence:** SQLModel + Neon Serverless PostgreSQL (Tasks, Conversations, Messages).
- **AI Integration:** OpenAI Agents SDK (Backend) + OpenAI ChatKit (Frontend) + Official MCP SDK (MCP Server).
- **Workflow:** `/sp.specify` → `/sp.plan` → `/sp.tasks` → `/sp.clarify` → `/sp.implement`.

## 📋 Task Context & Success Criteria
1. **Zero Manual Edits:** You only modify code based on approved specs. If a spec is missing, run `/sp.specify`.
2. **User Isolation:** Every database query **MUST** filter by `user_id` extracted from the JWT (applies to Tasks, Conversations, Messages, and all MCP tools).
3. **Statelessness:** The backend must remain stateless. Validate every request via the `BETTER_AUTH_SECRET`. Chat endpoint fetches conversation history from database on each request (no in-memory state).
4. **MCP Tools Standardization:** All task operations must be exposed as MCP tools (add_task, list_tasks, complete_task, delete_task, update_task) using Official MCP SDK. All MCP tools must enforce user isolation.
5. **Knowledge Capture:** A Prompt History Record (PHR) **MUST** be created after every interaction.

## 🛠 SDD Execution Flow (The Spec-Kit Plus Protocol)

### 1. PHR Routing (Mandatory)
Record every user input verbatim in `history/prompts/`.
- **Constitution Work:** `history/prompts/constitution/`
- **Feature Development:** `history/prompts/<feature-name>/`
- **General/Misc:** `history/prompts/general/`

### 2. PHR Generation Process
1. **Detect Stage:** `constitution` | `spec` | `plan` | `tasks` | `clarify` | `implementation` | `refactor`.
2. **Compute Path:** `history/prompts/<feature-name>/<ID>-<slug>.<stage>.prompt.md`.
3. **Template:** Use `.specify/templates/phr-template.prompt.md`.
4. **Detail:** Fill all YAML fields (Model, Branch, Files Modified, Tests Run).

### 3. ADR Intelligence
If you make a decision regarding **JWT handling, Database Schema, or API Contracts**:
- **Suggest:** "📋 Architectural decision detected: [Decision Context]. Document? Run `/sp.adr <title>`."
- **Note:** Never auto-create ADRs; wait for user consent.

## 🏗 Full-Stack Guidelines

### Backend (FastAPI + SQLModel + OpenAI Agents SDK + MCP SDK)
- **Stack:** Python 3.13+, UV for dependencies, Pydantic v2 for Schemas, OpenAI Agents SDK for AI agent logic, Official MCP SDK for MCP server.
- **Security:** Implement a custom middleware/dependency to verify JWTs from the `Authorization: Bearer <token>` header using the shared `BETTER_AUTH_SECRET`.
- **Data Isolation:** All SQLModel queries must strictly include `.where(Model.user_id == current_user_id)` (applies to Task, Conversation, Message models and all MCP tools).
- **API Pattern:** Standardize routes under `/api/{user_id}/tasks` (Phase II) and `/api/{user_id}/chat` (Phase III).
- **MCP Server:** Implement MCP server in `/backend/src/mcp/` exposing task operations as tools (add_task, list_tasks, complete_task, delete_task, update_task). All tools must enforce user isolation.
- **AI Agent:** Implement OpenAI Agents SDK integration in `/backend/src/agents/` for processing natural language and invoking MCP tools.
- **Chat Endpoint:** POST `/api/{user_id}/chat` must be stateless - fetch conversation history from database, process with AI agent + MCP tools, store messages in database.
- **Database Models:** Add Conversation (id, user_id, created_at, updated_at) and Message (id, conversation_id, user_id, role, content, created_at) SQLModel models.

### Frontend (Next.js 16+ App Router + OpenAI ChatKit)
- **Stack:** TypeScript, Tailwind CSS, Lucide React, OpenAI ChatKit for conversational UI.
- **Auth:** Integrate Better Auth. Ensure JWT plugin is active and tokens are attached to every fetch/axios request to the backend.
- **Patterns:** Use Server Components for data fetching where possible; Client Components for interactivity.
- **Chat Interface:** Integrate OpenAI ChatKit in `/frontend/src/components/chat/` for conversational task management. Users can toggle between GUI and Chat interfaces.
- **Environment:** Configure `NEXT_PUBLIC_OPENAI_DOMAIN_KEY` for ChatKit domain allowlist (required for hosted ChatKit).
- **Responsive & Accessible:** Chat interface must be responsive (mobile-first) and accessible (WCAG 2.1 Level AA).



## 🛡 Security Guardrails
- **No Hardcoding:** Secrets must be in `.env`. Reference via `os.getenv` or `process.env`. Required env vars: `BETTER_AUTH_SECRET`, `DATABASE_URL`, `OPENAI_API_KEY` (Phase III), `NEXT_PUBLIC_OPENAI_DOMAIN_KEY` (Phase III).
- **Error Handling:** Use proper HTTP status codes (401 for Auth failures, 403 for Forbidden access, 404 for Not Found).
- **Input Validation:** Use Pydantic models (Backend) and Zod/TypeScript (Frontend) to enforce data contracts.
- **User Isolation:** All MCP tools, database queries, and API endpoints must filter by `user_id` from JWT. Chat endpoint must validate path `user_id` matches JWT `user_id`.

## 🔄 Execution Contract for Every Request
1. **Acknowledge Phase:** Confirm Phase III SDD context (includes AI Chatbot with MCP Server and ChatKit Integration).
2. **Identify Specs:** Reference relevant files in `/specs/` using `@specs/path/to/file.md`. Key specs: `001-ai-chatbot-mcp`, `001-chatkit-integration`.
3. **Constraint Check:** Verify no tenant leakage (user isolation check for Tasks, Conversations, Messages, and all MCP tools).
4. **Stateless Check:** Verify chat endpoint fetches conversation history from database (no in-memory state).
5. **Execute:** Use `WriteFile` or `Edit` tools.
6. **Log:** Generate the PHR immediately following the response.

## 📁 Project Structure (Spec-Kit Plus)
- `.specify/memory/constitution.md` — The Phase III Supreme Law (includes Principle XI: AI-Powered Conversational Interface).
- `specs/` — Feature specifications organized by feature number (e.g., `001-ai-chatbot-mcp`, `001-chatkit-integration`).
- `specs/features/` — User stories and acceptance criteria.
- `specs/api/` — REST endpoint contracts (includes `/api/{user_id}/chat` for Phase III).
- `specs/database/` — SQLModel schemas and Neon migration plans (includes Conversation and Message models for Phase III).
- `backend/src/mcp/` — MCP server and tools (Phase III).
- `backend/src/agents/` — OpenAI Agents SDK integration (Phase III).
- `frontend/src/components/chat/` — OpenAI ChatKit UI components (Phase III).
- `history/prompts/` — PHR logs organized by feature.
- `history/adr/` — Architectural Decision Records.