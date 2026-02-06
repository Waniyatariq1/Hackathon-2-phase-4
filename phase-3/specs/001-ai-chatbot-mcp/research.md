# Research: AI Chatbot with MCP Server

**Feature**: AI Chatbot with MCP Server (001-ai-chatbot-mcp)
**Date**: 2026-01-04
**Purpose**: Resolve technical decisions and research integration patterns for stateless chat architecture

## Research Topics

### 1. OpenAI Agents SDK Integration

**Decision**: Use OpenAI Agents SDK (`openai-agents`) for natural language processing and intent determination

**Rationale**:
- Official OpenAI library with first-class support for function calling
- Built-in support for tool execution and context management
- Well-documented API with active development
- Simplifies integration with OpenAI's GPT models

**Implementation Approach**:
- Create an Agent instance configured with task management MCP tools
- Use streaming responses for better user experience
- Pass conversation history as context to each request
- Handle tool execution errors gracefully

**Alternatives Considered**:
- LangChain: More flexible but higher complexity for this use case
- Direct API calls: Would require manual tool orchestration
- Microsoft Semantic Kernel: Less mature, steeper learning curve

---

### 2. Official MCP SDK Integration

**Decision**: Use Official MCP Python SDK (`@modelcontextprotocol/sdk-python`)

**Rationale**:
- Standard protocol for exposing tools to AI agents
- Official support from Anthropic and growing ecosystem
- Well-defined tool schema and execution model
- Enables future extensibility beyond task management

**Implementation Approach**:
- Create MCP server instance using Official MCP SDK
- Define 5 tools: add_task, list_tasks, complete_task, delete_task, update_task
- Each tool validates user_id from JWT and enforces data isolation
- Tools are stateless - all operations go through database

**Alternatives Considered**:
- Custom HTTP API: Would break MCP standard and limit interoperability
- LangChain tools: Tied to LangChain ecosystem, less flexible
- Direct function calls: No standardization, harder to maintain

---

### 3. Stateless Chat Architecture

**Decision**: Fully stateless chat endpoint with database-backed conversation history

**Rationale**:
- Enables horizontal scaling without sticky sessions
- Resilience to server failures and restarts
- Simplifies deployment and load balancing
- Aligns with Constitution Principle XI requirement

**Implementation Approach**:
- On each request: fetch conversation history by conversation_id from database
- Build message array from database records (user and assistant messages)
- Store user message in database before processing
- Run OpenAI agent with MCP tools
- Store assistant response in database
- Return response to user
- No in-memory state between requests

**Performance Considerations**:
- Add database indexes on (conversation_id, created_at) for efficient history retrieval
- Consider pagination for conversations with >100 messages
- Cache frequently accessed conversations using Redis (optional optimization)

**Alternatives Considered**:
- In-memory conversation state: Violates statelessness requirement, not scalable
- Session storage in Redis: Adds complexity, violates "database-backed" requirement

---

### 4. Database Schema Design

**Decision**: Add Conversation and Message SQLModel models with proper indexes

**Rationale**:
- Conversation model: Links messages to user session
- Message model: Stores individual messages with role and content
- Foreign key relationships ensure referential integrity
- Indexes optimize query performance

**Schema Design**:

```python
# Conversation Model
class Conversation(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"onupdate": datetime.utcnow})

# Message Model
class Message(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversation.id", index=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    role: str = Field(max_length=20)  # "user" or "assistant"
    content: str = Field(max_length=10000)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
```

**Indexes**:
- (conversation_id, created_at) DESC: Efficient conversation history retrieval
- user_id: Quick user conversations list
- created_at: Time-based queries

**Alternatives Considered**:
- Single conversation per user: Would lose conversation isolation for different topics
- Store messages as JSON in Conversation field: No queryability, harder to maintain

---

### 5. MCP Tool Design

**Decision**: 5 stateless MCP tools that enforce user isolation

**Rationale**:
- Covers all task CRUD operations needed for natural language management
- Each tool validates user_id to prevent cross-user data access
- Simple, focused tools aligned with MCP philosophy

**Tool Specifications**:

1. **add_task**: Create new task
   - Input: user_id (int), title (str), description (str | None)
   - Output: Task object with generated id
   - Validation: Required fields, user ownership

2. **list_tasks**: List user's tasks with optional filter
   - Input: user_id (int), status (str | None)
   - Output: List of Task objects
   - Validation: User isolation enforced

3. **complete_task**: Mark task as complete
   - Input: user_id (int), task_id (int)
   - Output: Updated Task object
   - Validation: Task exists and belongs to user

4. **delete_task**: Delete task
   - Input: user_id (int), task_id (int)
   - Output: Success confirmation
   - Validation: Task exists and belongs to user

5. **update_task**: Update task details
   - Input: user_id (int), task_id (int), title (str | None), description (str | None)
   - Output: Updated Task object
   - Validation: At least one field to update, task exists and belongs to user

**Alternatives Considered**:
- Single tool with operation type: More complex, harder to document
- Batch operations: Not required for current scope, adds complexity

---

### 6. Chat Endpoint API Design

**Decision**: POST /api/{user_id}/chat with conversation_id parameter

**Rationale**:
- RESTful design with user-scoped routing (Constitution Principle IV)
- Simple request/response model
- Supports both new and existing conversations

**Request Schema**:

```json
{
  "conversation_id": "optional - UUID or null for new conversation",
  "message": "user's natural language message"
}
```

**Response Schema**:

```json
{
  "response": "assistant's natural language response",
  "conversation_id": "UUID for tracking the conversation"
}
```

**Authentication**: JWT required via Authorization: Bearer <token> header

**Alternatives Considered**:
- WebSocket: Unnecessary for request/response model, adds complexity
- Separate create_conversation endpoint: Redundant with null conversation_id handling

---

### 7. Error Handling Strategy

**Decision**: Comprehensive error handling with user-friendly messages

**Rationale**:
- Users should understand what went wrong
- System should fail gracefully without exposing internal details
- Logging should capture all errors for debugging

**Error Types**:

1. **Authentication Errors** (401):
   - Missing or invalid JWT
   - User not found

2. **Authorization Errors** (403):
   - Attempting to access another user's data
   - Invalid user_id in token

3. **Not Found Errors** (404):
   - Conversation not found
   - Task not found

4. **Validation Errors** (400):
   - Empty message
   - Invalid conversation_id format
   - Missing required fields

5. **Service Errors** (502/503):
   - OpenAI API unavailable
   - Database connection failure

**Implementation**:
- Use FastAPI's HTTPException for error responses
- Structured error responses with error_code and message
- Log all errors with context (user_id, conversation_id, request_id)

---

### 8. Performance Optimization

**Decision**: Database indexes and efficient query patterns

**Rationale**:
- Meet <3 second response time requirement (SC-002)
- Support 1000 sequential requests without degradation (SC-006)
- Efficient conversation history retrieval

**Optimizations**:

1. **Database Indexes**:
   - (conversation_id, created_at) DESC: Fast history queries
   - user_id: Quick user conversations lookup
   - Task.user_id: Enforce user isolation at database level

2. **Query Patterns**:
   - Use pagination for large conversations (>100 messages)
   - Limit conversation history to last 50 messages for context (configurable)
   - Use SELECT with specific columns instead of SELECT *

3. **Connection Pooling**:
   - Leverage Neon's built-in connection pooling
   - Configure pool size based on expected load

4. **Caching (Future Optimization)**:
   - Redis for frequently accessed conversations
   - Cache TTL of 5-10 minutes for conversation history

---

### 9. Testing Strategy

**Decision**: Multi-layer testing with focus on isolation and statelessness

**Rationale**:
- Ensure user isolation is never compromised
- Validate stateless architecture
- Test all MCP tools independently
- Verify chat endpoint with various scenarios

**Test Layers**:

1. **Unit Tests**:
   - Conversation and Message model validation
   - MCP tool logic (input validation, user isolation)
   - Chat service orchestration

2. **Integration Tests**:
   - Database operations (CRUD for Conversations and Messages)
   - MCP tool execution with real database
   - Conversation history retrieval and building

3. **API Tests**:
   - Chat endpoint request/response contracts
   - Authentication and authorization
   - Error handling for all error types
   - Multi-turn conversation scenarios

4. **E2E Tests (Future)**:
   - Complete user journeys with frontend
   - Concurrent user scenarios
   - Long conversation history handling

**Test Coverage Target**: >90% for all new code

---

### 10. Security Considerations

**Decision**: Defense in depth approach to security

**Rationale**:
- Protect user data from unauthorized access
- Prevent injection attacks
- Ensure proper authentication and authorization

**Security Measures**:

1. **Authentication**:
   - JWT verification on all chat endpoint requests
   - Validate JWT signature with shared secret
   - Check token expiration

2. **Authorization**:
   - Every database query filters by user_id from JWT
   - MCP tools validate user_id before operations
   - Prevent IDOR (Insecure Direct Object Reference) attacks

3. **Input Validation**:
   - Pydantic schemas for all API inputs
   - SQLModel validation for database models
   - Limit message content length (10,000 characters)

4. **SQL Injection Prevention**:
   - Use SQLModel/SQLAlchemy parameterized queries
   - Never concatenate strings into SQL queries

5. **Rate Limiting** (Future):
   - Implement per-user rate limiting on chat endpoint
   - Prevent abuse and manage costs

---

## Open Questions Resolved

All technical decisions have been resolved through research. No open questions remain for Phase 1 design.

## Dependencies

1. **OpenAI API**: Service dependency for AI processing
   - Mitigation: Implement graceful degradation and retry logic

2. **Neon PostgreSQL**: Database service for conversation persistence
   - Mitigation: Connection pooling, retry on transient failures

3. **Better Auth**: Frontend authentication for JWT token generation
   - Assumption: Already implemented from Phase II

## Next Steps

Phase 1: Design & Contracts
1. Create detailed data model documentation (data-model.md)
2. Define API contracts (contracts/chat-endpoint.yaml, contracts/mcp-tools.yaml)
3. Write quickstart guide for developers (quickstart.md)
4. Update agent context with new technologies
