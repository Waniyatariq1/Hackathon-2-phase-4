# API Contract: Chat Endpoint

**Feature**: 001-chatkit-integration
**Date**: 2026-01-04
**Version**: 1.0
**Purpose**: Define HTTP API contract for chat endpoint between frontend and backend

## Overview

This document defines the RESTful API contract for the chat endpoint used by the OpenAI ChatKit integration. The chat endpoint enables users to send messages to an AI assistant and receive responses, with support for tool execution (task management operations).

The endpoint follows Phase II/III API design standards:
- JWT-based authentication
- User isolation via `/api/{user_id}/` routing
- Standardized error responses
- Stateless architecture (no server-side session)

---

## Base URL

```
Development: http://localhost:8000/api/{user_id}/chat
Production:  https://api.example.com/api/{user_id}/chat
```

---

## Endpoints

### POST /api/{user_id}/chat

Send a message to the AI assistant and receive a response.

#### Request

**Method**: `POST`

**Path Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| user_id | string | Yes | Authenticated user ID (must match JWT claim) |

**Headers**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | JWT bearer token: `Bearer <token>` |
| Content-Type | string | Yes | `application/json` |

**Request Body**:
```json
{
  "message": "Create a task to buy groceries",
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000"  // Optional
}
```

**Schema**:
```typescript
interface ChatRequest {
  message: string;              // Required: Non-empty message text (1-50000 chars)
  conversation_id?: string;     // Optional: Conversation ID for context (UUID v4)
}
```

**Validation Rules**:
- `message`: Required, min 1 character, max 50,000 characters, trimmed
- `conversation_id`: Optional, must be valid UUID v4 if provided
- `user_id` in path must match JWT claim `sub` or `user_id`

#### Response

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "role": "assistant",
    "content": "I've created a task 'Buy groceries' for you. Is there anything else you need?",
    "timestamp": 1735934400000
  },
  "tool_calls": [
    {
      "id": "tc-1234567890",
      "name": "create_task",
      "arguments": {
        "title": "Buy groceries",
        "description": "Milk, eggs, bread, butter"
      },
      "result": {
        "success": true,
        "data": {
          "task_id": "task-123",
          "title": "Buy groceries"
        }
      },
      "status": "success",
      "timestamp": 1735934401000
    }
  ],
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "usage": {
    "prompt_tokens": 42,
    "completion_tokens": 38,
    "total_tokens": 80
  },
  "task_context": {
    "referenced_tasks": ["task-123"],
    "action_taken": "Created 1 task"
  }
}
```

**Schema**:
```typescript
interface ChatResponse {
  success: boolean;
  message: ChatMessage;
  tool_calls?: ToolCall[];
  conversation_id: string;
  usage?: TokenUsage;
  task_context?: TaskContext;
}

interface ChatMessage {
  id: string;
  role: 'assistant';
  content: string;
  timestamp: number;
}

interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: ToolCallResult;
  status: 'success' | 'failed' | 'pending';
  timestamp: number;
}

interface ToolCallResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

interface TaskContext {
  referenced_tasks: string[];
  action_taken: string;
}
```

#### Error Responses

**400 Bad Request** - Invalid input:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Message cannot be empty",
    "details": {
      "field": "message",
      "constraint": "min_length: 1"
    }
  }
}
```

**401 Unauthorized** - Invalid or expired JWT:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired authentication token",
    "details": null
  }
}
```

**403 Forbidden** - User ID mismatch:
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "User ID in request does not match authenticated user",
    "details": {
      "requested_user_id": "user-123",
      "authenticated_user_id": "user-456"
    }
  }
}
```

**429 Too Many Requests** - Rate limit exceeded:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "retry_after": 60,  // Seconds to wait before retry
      "limit": 100,       // Requests per minute
      "current": 120      // Current request count
    }
  }
}
```

**500 Internal Server Error** - Backend error:
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred. Please try again.",
    "details": {
      "request_id": "req-1234567890"  // For support/debugging
    }
  }
}
```

**503 Service Unavailable** - AI service unavailable:
```json
{
  "success": false,
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "AI service is temporarily unavailable. Please try again later.",
    "details": null
  }
}
```

---

## Endpoint: GET /api/{user_id}/chat/history

Retrieve conversation history for a user.

#### Request

**Method**: `GET`

**Path Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| user_id | string | Yes | Authenticated user ID |

**Query Parameters**:
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| conversation_id | string | No | - | Conversation ID (optional) |
| limit | integer | No | 100 | Max messages to return (1-200) |
| before | integer | No | - | Timestamp to paginate before |

**Headers**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | JWT bearer token |

#### Response

**Success Response (200 OK)**:
```json
{
  "success": true,
  "messages": [
    {
      "id": "msg-001",
      "role": "user",
      "content": "Create a task to buy groceries",
      "timestamp": 1735934400000
    },
    {
      "id": "msg-002",
      "role": "assistant",
      "content": "I've created a task 'Buy groceries' for you.",
      "timestamp": 1735934401000,
      "tool_calls": [...]
    }
  ],
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "has_more": false,
  "next_cursor": null
}
```

**Schema**:
```typescript
interface HistoryResponse {
  success: boolean;
  messages: ChatMessage[];
  conversation_id: string;
  has_more: boolean;
  next_cursor?: number;
}
```

**Error Responses**: Same as POST /api/{user_id}/chat

---

## Authentication

### JWT Token Format

All requests must include a valid JWT in the `Authorization` header.

**Token Header**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**JWT Claims**:
```json
{
  "sub": "user-123",           // User ID (subject)
  "user_id": "user-123",       // User ID (custom claim)
  "email": "user@example.com", // User email
  "exp": 1736020800,           // Expiration timestamp
  "iat": 1735934400            // Issued at timestamp
}
```

**Token Validation**:
- Backend validates signature using `BETTER_AUTH_SECRET`
- Backend checks token expiration (`exp` claim)
- Backend extracts `user_id` from `sub` or `user_id` claim
- Backend validates `user_id` in path matches JWT claim

---

## Rate Limiting

### Limits

| Tier | Requests per Minute | Requests per Hour |
|------|---------------------|-------------------|
| Free | 100 | 1,000 |
| Pro | 1,000 | 10,000 |
| Enterprise | 10,000 | 100,000 |

### Headers (Response)

When rate limited, the following headers are included:

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Rate limit for current tier |
| `X-RateLimit-Remaining` | Remaining requests in window |
| `X-RateLimit-Reset` | Unix timestamp when limit resets |
| `Retry-After` | Seconds to wait before retry (for 429 response) |

### Backoff Strategy

**Exponential Backoff**:
- First retry: 1 second
- Second retry: 2 seconds
- Third retry: 4 seconds
- Fourth retry: 8 seconds
- Max retries: 5

**Jitter**: Add random 0-500ms jitter to avoid thundering herd

---

## CORS Configuration

### Allowed Origins

```json
{
  "allowed_origins": [
    "http://localhost:3000",
    "https://app.example.com"
  ]
}
```

### Allowed Headers

```
Authorization, Content-Type, X-Requested-With
```

### Allowed Methods

```
GET, POST, OPTIONS
```

### Max Age

```
86400  // 24 hours
```

---

## Security Headers

All responses include these security headers:

| Header | Value | Purpose |
|--------|-------|---------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | HTTPS enforcement |
| `X-Content-Type-Options` | `nosniff` | MIME type sniffing prevention |
| `X-Frame-Options` | `DENY` | Clickjacking prevention |
| `X-XSS-Protection` | `1; mode=block` | XSS protection |
| `Content-Security-Policy` | `default-src 'self'` | Content policy |

---

## Error Codes Reference

| Code | HTTP Status | Description | Retryable |
|------|-------------|-------------|-----------|
| `INVALID_INPUT` | 400 | Request validation failed | No |
| `UNAUTHORIZED` | 401 | Invalid or expired JWT | No |
| `FORBIDDEN` | 403 | User ID mismatch | No |
| `NOT_FOUND` | 404 | Conversation not found | No |
| `RATE_LIMIT_EXCEEDED` | 429 | Rate limit exceeded | Yes |
| `INTERNAL_ERROR` | 500 | Server error | Yes |
| `SERVICE_UNAVAILABLE` | 503 | AI service unavailable | Yes |

---

## OpenAPI Specification

```yaml
openapi: 3.0.3
info:
  title: Chat API
  version: 1.0.0
  description: Chat endpoint for AI assistant integration

servers:
  - url: http://localhost:8000
    description: Development server
  - url: https://api.example.com
    description: Production server

paths:
  /api/{user_id}/chat:
    post:
      summary: Send message to AI assistant
      operationId: sendMessage
      security:
        - bearerAuth: []
      parameters:
        - name: user_id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ChatRequest'
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ChatResponse'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          $ref: '#/components/responses/Forbidden'
        '429':
          $ref: '#/components/responses/RateLimited'
        '500':
          $ref: '#/components/responses/InternalServerError'

    get:
      summary: Get conversation history
      operationId: getHistory
      security:
        - bearerAuth: []
      parameters:
        - name: user_id
          in: path
          required: true
          schema:
            type: string
        - name: conversation_id
          in: query
          schema:
            type: string
        - name: limit
          in: query
          schema:
            type: integer
            minimum: 1
            maximum: 200
            default: 100
        - name: before
          in: query
          schema:
            type: integer
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/HistoryResponse'
        '401':
          $ref: '#/components/responses/Unauthorized'

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    ChatRequest:
      type: object
      required:
        - message
      properties:
        message:
          type: string
          minLength: 1
          maxLength: 50000
        conversation_id:
          type: string
          format: uuid

    ChatResponse:
      type: object
      required:
        - success
        - message
        - conversation_id
      properties:
        success:
          type: boolean
        message:
          $ref: '#/components/schemas/ChatMessage'
        tool_calls:
          type: array
          items:
            $ref: '#/components/schemas/ToolCall'
        conversation_id:
          type: string
          format: uuid
        usage:
          $ref: '#/components/schemas/TokenUsage'
        task_context:
          $ref: '#/components/schemas/TaskContext'

    ChatMessage:
      type: object
      required:
        - id
        - role
        - content
        - timestamp
      properties:
        id:
          type: string
          format: uuid
        role:
          type: string
          enum: ['user', 'assistant']
        content:
          type: string
        timestamp:
          type: integer

    ToolCall:
      type: object
      required:
        - id
        - name
        - arguments
        - status
        - timestamp
      properties:
        id:
          type: string
        name:
          type: string
        arguments:
          type: object
          additionalProperties: true
        result:
          $ref: '#/components/schemas/ToolCallResult'
        status:
          type: string
          enum: ['success', 'failed', 'pending']
        timestamp:
          type: integer

    ToolCallResult:
      type: object
      properties:
        success:
          type: boolean
        data:
          type: object
          additionalProperties: true
        error:
          type: string

    TokenUsage:
      type: object
      required:
        - prompt_tokens
        - completion_tokens
        - total_tokens
      properties:
        prompt_tokens:
          type: integer
        completion_tokens:
          type: integer
        total_tokens:
          type: integer

    TaskContext:
      type: object
      required:
        - referenced_tasks
        - action_taken
      properties:
        referenced_tasks:
          type: array
          items:
            type: string
        action_taken:
          type: string

    HistoryResponse:
      type: object
      required:
        - success
        - messages
        - conversation_id
        - has_more
      properties:
        success:
          type: boolean
        messages:
          type: array
          items:
            $ref: '#/components/schemas/ChatMessage'
        conversation_id:
          type: string
          format: uuid
        has_more:
          type: boolean
        next_cursor:
          type: integer

    Error:
      type: object
      required:
        - success
        - error
      properties:
        success:
          type: boolean
        error:
          type: object
          required:
            - code
            - message
          properties:
            code:
              type: string
            message:
              type: string
            details:
              type: object
              additionalProperties: true

  responses:
    BadRequest:
      description: Bad Request
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    Unauthorized:
      description: Unauthorized
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    Forbidden:
      description: Forbidden
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    RateLimited:
      description: Rate Limited
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    InternalServerError:
      description: Internal Server Error
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
```

---

## Testing

### Example cURL Requests

**Send message**:
```bash
curl -X POST http://localhost:8000/api/user-123/chat \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Create a task to buy groceries"
  }'
```

**Get history**:
```bash
curl -X GET "http://localhost:8000/api/user-123/chat/history?limit=50" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Test Scenarios

1. **Happy Path**: Send message, receive response with tool calls
2. **Empty Message**: Send empty message, receive 400 error
3. **Invalid JWT**: Send request with invalid token, receive 401 error
4. **User ID Mismatch**: Send request with different user_id in path, receive 403 error
5. **Rate Limit**: Send 101 requests in 1 minute, receive 429 error
6. **Pagination**: Get history with `limit=20` and `before` cursor
7. **Network Error**: Simulate network failure, test retry logic

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-04 | Initial release |

---

## Next Steps

1. Implement backend endpoint in `backend/src/api/routes/chat.py`
2. Implement frontend API client in `frontend/src/lib/chat-api.ts`
3. Write API tests for all endpoints and error cases
4. Update OpenAPI documentation with actual implementation
