# Data Model: AI Chatbot with MCP Server

**Feature**: AI Chatbot with MCP Server (001-ai-chatbot-mcp)
**Date**: 2026-01-04
**Purpose**: Define database schema for Conversation and Message entities

## Entity Overview

This feature adds two new entities to the existing database schema:
1. **Conversation**: Represents a chat session between a user and the system
2. **Message**: Represents individual messages exchanged in a conversation

These entities work alongside the existing **Task** entity to enable conversational task management.

## Conversation Entity

### Purpose
Represent a chat session containing a sequence of messages exchanged between a user and the AI assistant.

### Attributes

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | int | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for the conversation |
| user_id | int | FOREIGN KEY → user.id, NOT NULL, INDEX | User who owns this conversation |
| created_at | datetime | NOT NULL, DEFAULT=NOW() | Timestamp when conversation was created |
| updated_at | datetime | NOT NULL, DEFAULT=NOW(), ON UPDATE=NOW() | Timestamp when conversation was last modified |

### Relationships

- **user_id** → References User table (assumes existing User model from Phase II)
- **messages** → One-to-many relationship with Message entity

### Validation Rules

1. user_id must reference an existing user
2. created_at is automatically set to current time
3. updated_at is automatically updated on any modification

### Indexes

- PRIMARY KEY on `id`
- INDEX on `user_id` for efficient user conversation lookups

---

## Message Entity

### Purpose
Represent individual messages exchanged in a conversation, maintaining full conversation history.

### Attributes

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | int | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for the message |
| conversation_id | int | FOREIGN KEY → conversation.id, NOT NULL, INDEX | Conversation this message belongs to |
| user_id | int | FOREIGN KEY → user.id, NOT NULL, INDEX | User who sent the message |
| role | varchar(20) | NOT NULL, ENUM('user', 'assistant') | Who sent the message |
| content | varchar(10000) | NOT NULL | Message text content |
| created_at | datetime | NOT NULL, DEFAULT=NOW(), INDEX | Timestamp when message was created |

### Relationships

- **conversation_id** → References Conversation table
- **user_id** → References User table (ensures user isolation)

### Validation Rules

1. conversation_id must reference an existing conversation
2. user_id must reference an existing user
3. role must be either 'user' or 'assistant'
4. content must be non-empty and ≤ 10,000 characters
5. created_at is automatically set to current time

### Indexes

- PRIMARY KEY on `id`
- INDEX on `(conversation_id, created_at DESC)` for efficient conversation history retrieval
- INDEX on `user_id` for user data isolation enforcement
- INDEX on `created_at` for time-based queries

---

## Entity Relationships

```mermaid
erDiagram
    USER ||--o{ CONVERSATION : owns
    USER ||--o{ TASK : manages
    USER ||--o{ MESSAGE : sends
    CONVERSATION ||--o{ MESSAGE : contains
    CONVERSATION }o--|| USER : belongs to
    MESSAGE }o--|| CONVERSATION : part of
    MESSAGE }o--|| USER : sent by
```

### Relationship Details

1. **User → Conversation**: One-to-many
   - A user can have multiple conversations
   - Each conversation belongs to exactly one user

2. **User → Message**: One-to-many (via Conversation)
   - Messages are associated with users for isolation
   - Enables querying all messages for a specific user

3. **Conversation → Message**: One-to-many
   - A conversation contains multiple messages
   - Each message belongs to exactly one conversation

4. **User → Task**: One-to-many (existing)
   - A user can have multiple tasks
   - Each task belongs to exactly one user

---

## State Transitions

### Conversation Lifecycle

1. **Created**: First message starts a new conversation
   - Trigger: User sends first message with no conversation_id
   - Action: Create new Conversation with user_id
   - Next state: Active

2. **Active**: Conversation is receiving messages
   - Trigger: User sends message with existing conversation_id
   - Action: Fetch conversation, add new message, update conversation.updated_at
   - Next state: Active

3. **Archived** (Future): Conversation marked as read-only
   - Not in current scope

### Message Lifecycle

1. **Created**: Message is stored in database
   - Trigger: User sends message or AI generates response
   - Action: Create new Message with role, content, timestamps
   - Final state (immutable)

### Task Lifecycle (Existing)

Tasks managed through MCP tools have the following states:
1. **pending**: Default state for new tasks
2. **completed**: Task marked as done
3. **deleted**: Task removed from database

---

## User Isolation Enforcement

### Query Patterns

All queries MUST include user_id filtering to ensure strict data isolation:

1. **Fetch Conversation**:
   ```sql
   SELECT * FROM conversation WHERE id = ? AND user_id = ?
   ```

2. **Fetch Conversation History**:
   ```sql
   SELECT * FROM message
   WHERE conversation_id = ? AND user_id = ?
   ORDER BY created_at ASC
   ```

3. **List User Conversations**:
   ```sql
   SELECT * FROM conversation WHERE user_id = ?
   ORDER BY updated_at DESC
   ```

4. **Delete Conversation**:
   ```sql
   DELETE FROM conversation WHERE id = ? AND user_id = ?
   ```

### Security Implications

1. user_id in both Conversation and Message entities provides redundant security
2. Database-level filtering prevents accidental data leaks
3. Even if application logic fails, database constraints protect user data
4. Indexes on user_id ensure queries remain performant with isolation filters

---

## Data Retention Policy

### Default Retention

- Conversations: Indefinite retention (no automatic deletion)
- Messages: Indefinite retention tied to conversation lifecycle

### Optional Future Features

1. **Conversation Expiration**: Automatically delete conversations older than X days
2. **Message Pruning**: Keep only last N messages for context window optimization
3. **User Data Export**: Provide user data download for GDPR compliance

---

## Migration Strategy

### Alembic Migration

**Filename**: `003_add_conversations_and_messages_tables.py`

**Operations**:

1. Create `conversation` table:
   ```sql
   CREATE TABLE conversation (
       id SERIAL PRIMARY KEY,
       user_id INTEGER NOT NULL REFERENCES user(id),
       created_at TIMESTAMP NOT NULL DEFAULT NOW(),
       updated_at TIMESTAMP NOT NULL DEFAULT NOW()
   );
   CREATE INDEX idx_conversation_user_id ON conversation(user_id);
   ```

2. Create `message` table:
   ```sql
   CREATE TABLE message (
       id SERIAL PRIMARY KEY,
       conversation_id INTEGER NOT NULL REFERENCES conversation(id),
       user_id INTEGER NOT NULL REFERENCES user(id),
       role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
       content VARCHAR(10000) NOT NULL,
       created_at TIMESTAMP NOT NULL DEFAULT NOW()
   );
   CREATE INDEX idx_message_conversation_id_created_at ON message(conversation_id, created_at DESC);
   CREATE INDEX idx_message_user_id ON message(user_id);
   CREATE INDEX idx_message_created_at ON message(created_at);
   ```

### Rollback Strategy

To revert migration:
1. DROP TABLE message (CASCADE)
2. DROP TABLE conversation

### Data Migration

No existing data to migrate. This is a new feature addition.

---

## Performance Considerations

### Query Optimization

1. **Conversation History Retrieval**:
   - Use `(conversation_id, created_at DESC)` composite index
   - Consider LIMIT clause for very long conversations (>100 messages)

2. **User Conversation List**:
   - Use `user_id` index with `ORDER BY updated_at DESC`
   - Add pagination for users with many conversations

3. **Message Insertion**:
   - No special indexes needed
   - Consider batch inserts for bulk operations (not needed for chat)

### Storage Estimation

Assumptions:
- Average message length: 100 characters
- Average messages per conversation: 20

Storage per user (100 conversations):
- 100 conversations × ~50 bytes = ~5 KB
- 100 conversations × 20 messages × ~150 bytes = ~300 KB
- Total: ~305 KB per 100 conversations

---

## Summary

This data model provides:
- Full conversation history persistence
- Strict user isolation through redundant user_id fields
- Efficient query patterns with appropriate indexes
- Clear entity relationships with referential integrity
- Foundation for future features (concurrency, export, analytics)

The design aligns with Constitution Principle XI (stateless chat architecture) and Constitution Principle IV (security-first user isolation).
