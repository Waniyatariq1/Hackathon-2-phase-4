# Data Model: OpenAI ChatKit Integration

**Feature**: 001-chatkit-integration
**Date**: 2026-01-04
**Purpose**: Define TypeScript interfaces and data structures for chat functionality

## Overview

This document defines the data structures used for the chat interface, including message types, conversation state, tool calls, and API request/response contracts. All interfaces follow TypeScript strict mode and align with backend Pydantic schemas from Phase II/III.

## Core Types

### Message

Represents a single message in the conversation.

```typescript
interface Message {
  id: string;                    // Unique message identifier (UUID)
  role: 'user' | 'assistant';    // Message sender
  content: string;               // Message text content
  timestamp: number;             // Unix timestamp (milliseconds)
  toolCalls?: ToolCall[];        // Optional tool calls made by assistant
  status?: MessageStatus;        // Message delivery status (for user messages)
}

type MessageStatus = 'sending' | 'sent' | 'failed' | 'retrying';
```

**Validation Rules**:
- `id`: Must be valid UUID v4
- `role`: Only 'user' or 'assistant' allowed
- `content`: Non-empty string, max 50,000 characters
- `timestamp`: Non-negative integer
- `toolCalls`: Only allowed when `role === 'assistant'`

---

### ToolCall

Represents a tool/action executed by the AI assistant.

```typescript
interface ToolCall {
  id: string;                    // Unique tool call identifier
  name: string;                  // Tool/function name (e.g., 'get_task', 'create_task')
  arguments: Record<string, unknown>;  // Parameters passed to tool
  result?: ToolCallResult;       // Execution result
  status: 'pending' | 'success' | 'failed';
  timestamp: number;             // Unix timestamp
}

interface ToolCallResult {
  success: boolean;              // Whether tool execution succeeded
  data?: unknown;                // Return data from tool (optional, may be redacted)
  error?: string;                // Error message if failed
}
```

**Validation Rules**:
- `id`: Must be valid UUID v4
- `name`: Non-empty string, alphanumeric + underscores
- `arguments`: JSON-serializable object
- `result`: Present when status is 'success' or 'failed'
- `data`: Redact sensitive fields (API keys, passwords, user IDs) before display

---

### Conversation

Represents a complete conversation session for a user.

```typescript
interface Conversation {
  id: string;                    // Conversation identifier (may be user_id or UUID)
  userId: string;                // Authenticated user ID from JWT
  messages: Message[];           // All messages in chronological order
  createdAt: number;             // Conversation creation timestamp
  updatedAt: number;             // Last message timestamp
  title?: string;                // Optional auto-generated title (first N chars of first user message)
  preferences: ConversationPreferences;
}

interface ConversationPreferences {
  showToolCalls: boolean;        // Whether to display tool calls
  sidebarCollapsed: boolean;     // Sidebar collapsed state
  autoScroll: boolean;           // Auto-scroll to latest message
  notifications: boolean;        // Desktop notifications for responses
}
```

**Validation Rules**:
- `id`: Valid UUID v4
- `userId`: Must match authenticated user from JWT
- `messages`: Array, sorted by timestamp ascending
- `createdAt`, `updatedAt`: Non-negative integers, `updatedAt >= createdAt`
- `title`: Max 100 characters, auto-generated from first user message if not set

---

### ChatSessionState

React component state for chat interface.

```typescript
interface ChatSessionState {
  conversation: Conversation;
  isSending: boolean;            // Is user message being sent?
  isWaitingForResponse: boolean; // Is waiting for AI response?
  currentInput: string;          // Current text in input field
  error: ChatError | null;       // Current error state
  isSidebarOpen: boolean;        // Sidebar visibility state
}

interface ChatError {
  code: string;                  // Error code (e.g., 'NETWORK_ERROR', 'AUTH_ERROR')
  message: string;               // User-friendly error message
  retryable: boolean;            // Whether the operation can be retried
  timestamp: number;             // Error timestamp
}
```

---

## API Request/Response Types

### Chat Request

```typescript
interface ChatRequest {
  message: string;               // User message to send
  conversationId: string;        // Conversation ID (optional, for context)
  userId: string;                // User ID from JWT (for backend validation)
}

// Headers required:
// Authorization: Bearer <JWT_TOKEN>
// Content-Type: application/json
```

**Validation Rules**:
- `message`: Non-empty string, max 50,000 characters
- `conversationId`: Valid UUID if provided
- `userId`: Must match JWT claim

---

### Chat Response

```typescript
interface ChatResponse {
  success: boolean;
  message: Message;              // AI assistant message
  toolCalls?: ToolCall[];        // Tool calls made by AI (optional)
  conversationId: string;        // Updated conversation ID
  usage?: TokenUsage;            // Token usage statistics (optional)

  // Optional backend-provided context
  taskContext?: {
    referencedTasks: string[];   // Task IDs mentioned/modified
    actionTaken: string;         // Description of action (e.g., "Created 2 tasks")
  };
}

interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}
```

**HTTP Status Codes**:
- `200 OK`: Successful response with message
- `400 Bad Request`: Invalid input (empty message, malformed request)
- `401 Unauthorized`: Invalid or expired JWT
- `403 Forbidden`: User ID mismatch
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Backend error
- `503 Service Unavailable`: AI service unavailable

---

### History Request

```typescript
interface HistoryRequest {
  conversationId: string;
  userId: string;
  limit?: number;                // Max messages to return (default: 100)
  before?: number;               // Return messages before this timestamp (pagination)
}
```

**Response**:
```typescript
interface HistoryResponse {
  success: boolean;
  messages: Message[];
  conversationId: string;
  hasMore: boolean;              // Whether more messages exist
  nextCursor?: number;           // Timestamp for next page (pagination)
}
```

---

## Storage Types

### LocalStorage Schema

Conversation stored in browser localStorage:

```typescript
interface LocalStorageSchema {
  'chat_conversation': Conversation;
  'chat_preferences': ConversationPreferences;
  'chat_last_active': number;    // Timestamp of last activity
}
```

**Storage Limits**:
- localStorage max: ~5-10MB (varies by browser)
- Conversation max size: ~200 messages (auto-truncate older messages)
- Encrypt sensitive data before storage if required

---

### IndexedDB Schema (Optional)

For larger conversations, use IndexedDB:

```typescript
interface IndexedDBSchema {
  conversations: {
    key: string;                 // conversation ID
    value: Conversation;
    indexes: {
      userId: string;            // User ID
      updatedAt: number;         // Last updated timestamp
    };
  };
  messages: {
    key: string;                 // message ID
    value: Message;
    indexes: {
      conversationId: string;    // Parent conversation ID
      timestamp: number;         // Message timestamp
    };
  };
}
```

---

## State Transitions

### Message Lifecycle

```
[PENDING] -> [SENDING] -> [SENT] -> [AI_PROCESSING] -> [COMPLETE]
             |             |
             v             v
          [FAILED] -> [RETRYING] -> [SENT]
```

**Transition Rules**:
1. User types message: status = `sending`
2. API call initiated: status = `sending`
3. API returns 200: status = `sent`, create assistant message with status = `processing`
4. Assistant response received: status = `complete`
5. API returns error: status = `failed`, show retry button
6. User clicks retry: status = `retrying` -> `sending`

### Tool Call Lifecycle

```
[PENDING] -> [EXECUTING] -> [SUCCESS] or [FAILED]
```

**Transition Rules**:
1. Assistant message includes tool calls: status = `pending`
2. Backend executes tool: status = `executing`
3. Tool succeeds: status = `success`, populate `result.data`
4. Tool fails: status = `failed`, populate `result.error`

---

## Relationships

```
User (from JWT)
  └─ 1:N → Conversation
           └─ 1:N → Message
                   └─ 0:N → ToolCall (assistant messages only)

Message (assistant)
  └─ 0:N → ToolCall
           └─ 1:1 → ToolCallResult
```

**Foreign Keys**:
- `Conversation.userId` → User ID (from JWT claim)
- `Message.conversationId` → `Conversation.id`
- `ToolCall.messageId` → `Message.id`

---

## Backend Alignment

This frontend data model must align with backend Pydantic schemas from Phase II/III:

### Backend Schemas (Expected)

```python
# backend/src/models/chat.py (Phase III)
class ChatMessage(SQLModel):
    id: str
    role: Literal["user", "assistant"]
    content: str
    timestamp: int
    user_id: str  # Foreign key to User

class ToolCall(SQLModel):
    id: str
    name: str
    arguments: dict
    result: dict | None = None
    status: Literal["pending", "success", "failed"]
    timestamp: int

class Conversation(SQLModel):
    id: str
    user_id: str
    title: str | None = None
    created_at: int
    updated_at: int
```

### Backend API Schemas (Expected)

```python
# backend/src/api/schemas/chat.py
class ChatRequest(BaseModel):
    message: str
    conversation_id: str | None = None

class ChatResponse(BaseModel):
    success: bool
    message: ChatMessage
    tool_calls: list[ToolCall] = []
    conversation_id: str
```

---

## Type Guards and Utilities

```typescript
// Type guards
function isUserMessage(message: Message): message is Message & { role: 'user' } {
  return message.role === 'user';
}

function isAssistantMessage(message: Message): message is Message & { role: 'assistant' } {
  return message.role === 'assistant';
}

function hasToolCalls(message: Message): message is Message & { toolCalls: ToolCall[] } {
  return message.role === 'assistant' && !!message.toolCalls && message.toolCalls.length > 0;
}

// Utility functions
function generateMessageId(): string {
  return crypto.randomUUID();
}

function getCurrentTimestamp(): number {
  return Date.now();
}

function redactSensitiveData(data: Record<string, unknown>): Record<string, unknown> {
  const REDACTED_FIELDS = ['password', 'apiKey', 'token', 'secret', 'userId'];
  const redacted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    redacted[key] = REDACTED_FIELDS.includes(key) ? '[REDACTED]' : value;
  }
  return redacted;
}
```

---

## Security Considerations

1. **JWT Validation**: Always validate JWT on backend, extract `user_id` from claims
2. **XSS Prevention**: Sanitize message content before rendering (use React's built-in escaping)
3. **CSRF Protection**: Use CSRF tokens for POST requests (Better Auth handles this)
4. **Data Redaction**: Redact sensitive data (API keys, passwords) from tool calls before display
5. **Rate Limiting**: Enforce rate limiting on backend to prevent abuse
6. **Input Validation**: Validate message length, content type on both client and server

---

## Performance Considerations

1. **Message Limiting**: Display max 200 messages in UI, store more in backend
2. **Virtual Scrolling**: Use virtual scroll for large conversation lists (react-window/react-virtual)
3. **Lazy Loading**: Load messages in pages (pagination) for long conversations
4. **Debouncing**: Debounce typing indicator (show after 500ms of processing)
5. **Optimistic UI**: Update UI immediately, then sync with backend
6. **Memoization**: Memoize message components to prevent unnecessary re-renders

---

## Testing Considerations

### Test Data Factories

```typescript
function createMockMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: generateMessageId(),
    role: 'user',
    content: 'Test message',
    timestamp: getCurrentTimestamp(),
    ...overrides,
  };
}

function createMockToolCall(overrides: Partial<ToolCall> = {}): ToolCall {
  return {
    id: generateMessageId(),
    name: 'test_tool',
    arguments: { param1: 'value1' },
    status: 'success',
    timestamp: getCurrentTimestamp(),
    ...overrides,
  };
}

function createMockConversation(overrides: Partial<Conversation> = {}): Conversation {
  return {
    id: generateMessageId(),
    userId: 'test-user-123',
    messages: [],
    createdAt: getCurrentTimestamp(),
    updatedAt: getCurrentTimestamp(),
    preferences: {
      showToolCalls: true,
      sidebarCollapsed: false,
      autoScroll: true,
      notifications: true,
    },
    ...overrides,
  };
}
```

### Edge Cases to Test

- Empty conversation
- Single message
- Maximum message length (50,000 chars)
- Special characters, emojis, Unicode
- Malformed tool calls
- Network errors during send
- JWT expiration
- Concurrent message sending
- rapid message sending (throttling)
- Browser storage quota exceeded

---

## Next Steps

1. Implement TypeScript interfaces in `frontend/src/types/chat.ts`
2. Create API client utilities in `frontend/src/lib/chat-api.ts`
3. Create storage utilities in `frontend/src/lib/chat-storage.ts`
4. Build React components with TypeScript types
5. Write unit tests for type guards and utilities
