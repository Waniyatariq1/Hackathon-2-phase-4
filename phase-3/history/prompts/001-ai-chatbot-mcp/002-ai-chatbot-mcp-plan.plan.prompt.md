---
id: 002
title: ai-chatbot-mcp-plan
stage: plan
date: 2026-01-04T00:00:00Z
surface: Phase II Full-Stack Web Evolution
model: claude-sonnet-4-5-20250929
feature: 001-ai-chatbot-mcp
branch: 001-ai-chatbot-mcp
user: user
command: /sp.plan
labels: [backend-core, ai-chatbot, mcp-server, openai-agents, implementation-plan]
links:
  spec: ../../specs/001-ai-chatbot-mcp/spec.md
  plan: ../../specs/001-ai-chatbot-mcp/plan.md
  ticket: null
  adr: null
  pr: null
files:
  - path: specs/001-ai-chatbot-mcp/plan.md
    action: created
    description: Implementation plan with Constitution compliance check
  - path: specs/001-ai-chatbot-mcp/research.md
    action: created
    description: Phase 0 research findings and technical decisions
  - path: specs/001-ai-chatbot-mcp/data-model.md
    action: created
    description: Phase 1 data model with Conversation and Message entities
  - path: specs/001-ai-chatbot-mcp/quickstart.md
    action: created
    description: Phase 1 developer quickstart guide
  - path: specs/001-ai-chatbot-mcp/contracts/chat-endpoint.yaml
    action: created
    description: Phase 1 OpenAPI specification for chat endpoint
  - path: specs/001-ai-chatbot-mcp/contracts/mcp-tools.yaml
    action: created
    description: Phase 1 MCP tools specification
tests: []
---

## Prompt

Backend implementation uses OpenAI Agents SDK for AI agent logic, Official MCP SDK for MCP server, FastAPI for chat endpoint, SQLModel for database models. Add Conversation model (id, user_id, created_at, updated_at) and Message model (id, conversation_id, user_id, role, content, created_at) to database. MCP server exposes 5 tools: add_task (user_id, title, description?), list_tasks (user_id, status?), complete_task (user_id, task_id), delete_task (user_id, task_id), update_task (user_id, task_id, title?, description?). Chat endpoint POST /api/{user_id}/chat: receives message + conversation_id, fetches conversation history, builds message array, stores user message, runs OpenAI agent with MCP tools, stores assistant response, returns response. All tools filter by user_id from JWT. Use Alembic migration 003_add_conversations_and_messages_tables.py.

## Response snapshot

Created comprehensive implementation plan for AI Chatbot with MCP Server feature. Constitution check passed all 11 principles including Principle XI (stateless chat architecture). Phase 0 research resolved all technical decisions: OpenAI Agents SDK for AI, Official MCP SDK for tools, stateless architecture with database-backed conversations. Phase 1 design completed: data-model.md with Conversation/Message entities and proper indexes, contracts/ with OpenAPI spec for chat endpoint and MCP tools specification, quickstart.md developer guide. Plan is ready for task breakdown phase.

## Outcome

- ✅ Impact: Complete implementation plan with Constitution compliance, technical decisions, API contracts, and data model
- 🧪 Tests: Not applicable (planning phase)
- 📁 Files: specs/001-ai-chatbot-mcp/plan.md, specs/001-ai-chatbot-mcp/research.md, specs/001-ai-chatbot-mcp/data-model.md, specs/001-ai-chatbot-mcp/quickstart.md, specs/001-ai-chatbot-mcp/contracts/chat-endpoint.yaml, specs/001-ai-chatbot-mcp/contracts/mcp-tools.yaml (all created)
- 🔁 Next prompts: /sp.tasks to break down plan into atomic implementation tasks
- 🧠 Reflection: Planning successfully defined stateless architecture with database-backed conversations, MCP tools standardization, and strict user isolation. All Constitution principles satisfied.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): None - planning complete, ready for task breakdown
