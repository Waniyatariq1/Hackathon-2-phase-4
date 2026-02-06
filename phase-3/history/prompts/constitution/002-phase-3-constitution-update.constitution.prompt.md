---
id: 002
title: Phase III Constitution Update - AI Chatbot Integration
stage: constitution
date: 2025-12-19
surface: agent
model: claude-sonnet-4-5-20250929
feature: phase-3-ai-chatbot
branch: main
user: user
command: /sp.constitution
labels: ["constitution", "phase-3", "ai-chatbot", "mcp", "openai-agents-sdk", "chatkit", "stateless-chat"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md (updated)
  - specs/overview.md (created)
tests:
  - N/A (constitution document, no tests)
---

## Prompt

"Update the project constitution from Phase II to Phase III by adding AI-powered conversational interface requirements.

1. PHASE III TECHNOLOGY ADDITIONS:
- Backend: Add OpenAI Agents SDK for AI agent logic and natural language processing
- Backend: Add Official MCP SDK for MCP server implementation exposing task operations as tools
- Frontend: Add OpenAI ChatKit for conversational UI interface

2. NEW ARCHITECTURE PRINCIPLE (Principle XI):
- Stateless Chat Architecture: Chat endpoint (POST /api/{user_id}/chat) must be stateless - conversation history fetched from database on each request, no in-memory state
- MCP Tools Standardization: All task operations must be exposed as MCP tools (add_task, list_tasks, complete_task, delete_task, update_task) using Official MCP SDK
- Database-Backed Conversations: Conversation and message state must persist in database (Conversation and Message SQLModel models) - not in-memory
- AI Agent Integration: AI agent must use OpenAI Agents SDK to process natural language, determine user intent, and invoke appropriate MCP tools
- User Isolation in MCP Tools: All MCP tools must enforce user isolation by filtering queries by user_id from JWT claims
- Chat Endpoint Authentication: Chat endpoint must require JWT authentication (same as Phase II REST endpoints)

3. NEW API ENDPOINT:
- POST /api/{user_id}/chat - Stateless chat endpoint that processes user messages, invokes MCP tools via AI agent, and returns responses

4. UPDATED DIRECTORY STRUCTURE:
- Add /backend/src/mcp/ for MCP server and tools
- Add /backend/src/agents/ for OpenAI Agents SDK integration
- Add /frontend/src/components/chat/ for ChatKit UI components

5. ENVIRONMENT VARIABLES:
- Backend: Add OPENAI_API_KEY for OpenAI Agents SDK
- Frontend: Add NEXT_PUBLIC_OPENAI_DOMAIN_KEY for OpenAI ChatKit domain allowlist

6. CONSTITUTION UPDATE REQUIREMENTS:
- Maintain all Phase II principles and requirements (GUI-based CRUD, Authentication, Neon DB)
- Update title from 'Phase II' to 'Phase III: Full-Stack Web Evolution with AI Chatbot'
- Update version from 1.0.0 to 1.1.0 (MINOR bump - new principle added)
- Update last amended date to 2025-12-19
- Add new Principle XI: AI-Powered Conversational Interface (NON-NEGOTIABLE for Phase III)
- Update Technology Standards section to include Phase III technologies
- Update API Design Standards to include POST /api/{user_id}/chat endpoint
- Update Repository Structure to show Phase III additions (mcp/, agents/, chat/ directories)

Key Points:
- Phase III builds on Phase II - all existing requirements remain mandatory
- MCP tools must enforce user isolation (filter by user_id)
- Chat endpoint must be stateless (ready for horizontal scaling)
- Conversation history must persist in database (not in-memory)"

## Response snapshot

Updated comprehensive Phase III constitution (v1.1.0) by adding AI-powered conversational interface requirements:

**Title Updated**: "Phase II" → "Phase III: Full-Stack Web Evolution with AI Chatbot"

**New Principle XI: AI-Powered Conversational Interface (NON-NEGOTIABLE for Phase III)**:
- Stateless Chat Architecture: Chat endpoint must be stateless - conversation history fetched from database on each request, no in-memory state
- MCP Tools Standardization: All task operations exposed as MCP tools (add_task, list_tasks, complete_task, delete_task, update_task) using Official MCP SDK
- Database-Backed Conversations: Conversation and message state persist in database (Conversation and Message SQLModel models)
- AI Agent Integration: AI agent uses OpenAI Agents SDK to process natural language and invoke MCP tools
- User Isolation in MCP Tools: All MCP tools enforce user isolation by filtering queries by user_id from JWT claims
- Chat Endpoint Authentication: Chat endpoint requires JWT authentication (same as Phase II REST endpoints)

**Technology Stack Updates**:
- Backend: Added OpenAI Agents SDK and Official MCP SDK
- Frontend: Added OpenAI ChatKit
- Environment Variables: Added OPENAI_API_KEY (backend) and NEXT_PUBLIC_OPENAI_DOMAIN_KEY (frontend)

**API Design Standards Updated**:
- Added POST /api/{user_id}/chat endpoint to API Design Standards
- Chat endpoint must be stateless, fetch conversation history from database, invoke MCP tools via AI agent, store messages in database

**Repository Structure Updated**:
- Added /backend/src/mcp/ for MCP server and tools
- Added /backend/src/agents/ for OpenAI Agents SDK integration
- Added /frontend/src/components/chat/ for ChatKit UI components

**Version**: 1.0.0 → 1.1.0 (MINOR bump - new principle added)
**Last Amended**: 2025-12-19

All Phase II principles and requirements maintained (GUI-based CRUD, Authentication, Neon DB, JWT isolation, etc.)

## Outcome

- ✅ Impact: Updated constitution to Phase III (v1.1.0) adding AI-powered conversational interface with stateless chat architecture, MCP tools standardization, and database-backed conversations while maintaining all Phase II requirements
- 🧪 Tests: N/A (constitution document)
- 📁 Files: Updated constitution.md, created specs/overview.md for Phase III integration overview
- 🔁 Next prompts: /sp.specify for Phase III AI chatbot feature specification (specs/003-ai-chatbot/spec.md), /sp.plan for implementation plan
- 🧠 Reflection: Constitution now governs both Phase II (GUI-based CRUD) and Phase III (AI chatbot) requirements. Stateless chat architecture enables horizontal scaling. MCP tools provide standardized interface for AI to interact with application. Database-backed conversations ensure persistence across server restarts. All Phase II security and isolation requirements maintained.

## Evaluation notes (flywheel)

- Failure modes observed: None - constitution update successful
- Graders run and results (PASS/FAIL): Manual validation of Phase III requirements integration (PASS)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Create Phase III feature specification (/sp.specify for 003-ai-chatbot) following updated constitution
