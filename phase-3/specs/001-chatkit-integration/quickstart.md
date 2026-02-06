# Quickstart Guide: OpenAI ChatKit Integration

**Feature**: 001-chatkit-integration
**Date**: 2026-01-04
**Purpose**: Get started with the ChatKit integration quickly

## Overview

This guide provides step-by-step instructions to get the ChatKit integration up and running in your development environment.

## Prerequisites

- Node.js 18+ and pnpm installed
- Python 3.13+ and UV installed
- Docker and Docker Compose installed
- OpenAI account with ChatKit access
- OpenAI Domain Key from [OpenAI Platform](https://platform.openai.com/)

---

## Setup Steps

### 1. Configure Environment Variables

**Frontend (.env.local)**:
```bash
# Better Auth (Phase II)
BETTER_AUTH_SECRET=your-secret-here
BETTER_AUTH_URL=http://localhost:3000

# Backend API (Phase II)
NEXT_PUBLIC_API_URL=http://localhost:8000

# OpenAI ChatKit (Phase III)
NEXT_PUBLIC_OPENAI_DOMAIN_KEY=pk-domain-xxx-xxx-xxx
```

**Backend (.env)**:
```bash
# Database (Phase II)
DATABASE_URL=postgresql://postgres:password@localhost:5432/taskvault

# Better Auth (Phase II)
BETTER_AUTH_SECRET=your-secret-here

# OpenAI API (Phase III)
OPENAI_API_KEY=sk-xxx-xxx-xxx
```

**Generate secrets**:
```bash
# Generate Better Auth secret
openssl rand -base64 32

# Get OpenAI Domain Key from:
# https://platform.openai.com/ -> Settings -> Domains -> Add Domain
```

---

### 2. Install Dependencies

**Frontend**:
```bash
cd frontend
pnpm install

# Install ChatKit dependencies
pnpm add @openai/chatkit-react
pnpm add -D @types/react @types/react-dom
```

**Backend** (if not already set up):
```bash
cd backend
uv sync

# Install Phase III dependencies
uv add openai openai-agents-sdk mcp
```

---

### 3. Start Local Development Environment

```bash
# From project root
docker-compose up -d

# This starts:
# - PostgreSQL database on port 5432
# - FastAPI backend on port 8000 (with hot reload)
# - Next.js frontend on port 8000 (with hot reload)
```

**Verify services are running**:
```bash
# Check database
docker ps | grep postgres

# Check backend
curl http://localhost:8000/health

# Check frontend
curl http://localhost:3000
```

---

### 4. Configure OpenAI ChatKit Domain

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Navigate to **Settings** → **Domains**
3. Click **Add Domain**
4. Enter your frontend URL:
   - Development: `http://localhost:3000`
   - Production: `https://your-app.example.com`
5. Copy the generated Domain Key
6. Add to `frontend/.env.local`:
   ```bash
   NEXT_PUBLIC_OPENAI_DOMAIN_KEY=pk-domain-xxx-xxx-xxx
   ```

---

### 5. Create ChatKit Component

**File**: `frontend/src/components/chat/ChatKit.tsx`

```typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import { OpenAIChatKit } from '@openai/chatkit-react';
import { useAuth } from '@/lib/auth';

export default function ChatKit() {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<ChatError | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!token) {
      setError({
        code: 'UNAUTHORIZED',
        message: 'Please log in to send messages',
        retryable: false,
        timestamp: Date.now(),
      });
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/${user.id}/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: content }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setMessages((prev) => [...prev, data.message]);
    } catch (err) {
      setError({
        code: 'NETWORK_ERROR',
        message: 'Failed to send message. Please try again.',
        retryable: true,
        timestamp: Date.now(),
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Task List (existing GUI) */}
      <div className="flex-1 p-6">
        {/* Existing task management UI */}
        <h1 className="text-2xl font-bold mb-6">Tasks</h1>
        {/* ... task list components ... */}
      </div>

      {/* Chat Sidebar */}
      <div className="w-96 border-l bg-white">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold">Chat</h2>
          <button className="text-sm text-gray-500 hover:text-gray-700">
            Clear
          </button>
        </div>

        {/* Messages */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-12">
              <p>Start a conversation to manage tasks with AI</p>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
              <div
                className={`inline-block p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p>{message.content}</p>
              </div>
            </div>
          ))}

          {isSending && (
            <div className="text-center text-gray-500">
              <span className="inline-block animate-pulse">Assistant is thinking...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4">
              <p>{error.message}</p>
              {error.retryable && (
                <button
                  className="mt-2 text-sm underline"
                  onClick={() => handleSendMessage(messages[messages.length - 1].content)}
                >
                  Retry
                </button>
              )}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const input = e.target.elements.message;
              if (input.value.trim()) {
                handleSendMessage(input.value.trim());
                input.value = '';
              }
            }}
            className="flex gap-2"
          >
            <input
              name="message"
              type="text"
              placeholder="Ask about your tasks..."
              className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={isSending}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

---

### 6. Integrate with Task Management Page

**File**: `frontend/src/app/tasks/page.tsx`

```typescript
import ChatKit from '@/components/chat/ChatKit';

export default function TasksPage() {
  return <ChatKit />;
}
```

---

### 7. Test the Integration

**Manual Testing**:

1. **Open the app**: `http://localhost:3000/tasks`
2. **Log in** with your test account
3. **Send a message**: "Create a task to review project requirements"
4. **Verify**:
   - Message appears in chat
   - Loading indicator shows
   - AI response appears
   - Task is created in the task list

**Test Scenarios**:

| Scenario | Expected Behavior |
|----------|-------------------|
| Send empty message | Validation error, no API call |
| Network error | Retry button appears |
| JWT expired | Redirect to login page |
| Long conversation | Auto-scroll to latest message |
| Toggle sidebar | Sidebar collapses/expands smoothly |

---

### 8. Development Tips

**Hot Reload**:
- Frontend: Changes in `frontend/src/` auto-reload (Next.js)
- Backend: Changes in `backend/src/` auto-reload (FastAPI with --reload)

**Debugging**:
- Frontend: Open DevTools (F12), check Console and Network tabs
- Backend: Check terminal logs, look for HTTP requests
- Database: Connect with psql or TablePlus

**Clearing State**:
```bash
# Clear browser localStorage
# DevTools → Application → Local Storage → right-click → Clear

# Reset database
docker-compose exec db psql -U postgres -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
cd backend && uv run alembic upgrade head
```

---

## Common Issues and Solutions

### Issue: "Domain key invalid"

**Solution**:
1. Verify `NEXT_PUBLIC_OPENAI_DOMAIN_KEY` in `.env.local`
2. Ensure domain is whitelisted in OpenAI Platform
3. Restart frontend: `cd frontend && pnpm dev`

### Issue: "401 Unauthorized"

**Solution**:
1. Check JWT token is valid: `localStorage.getItem('better-auth.jwt_token')`
2. Verify `BETTER_AUTH_SECRET` matches between frontend and backend
3. Check token expiration: Decode JWT and verify `exp` claim

### Issue: "Chat not responding"

**Solution**:
1. Check backend is running: `curl http://localhost:8000/health`
2. Check `OPENAI_API_KEY` is valid in backend `.env`
3. Check network tab in DevTools for request/response

### Issue: "Tasks not updating after chat action"

**Solution**:
1. Verify backend MCP tools are correctly implemented
2. Check backend logs for tool execution errors
3. Verify JWT `user_id` matches in chat request

---

## Next Steps

After getting the basic integration working:

1. **Add tool call display**: Show AI actions to users
2. **Implement conversation history**: Persist conversations in database
3. **Add keyboard shortcuts**: Toggle chat with Cmd/Ctrl + K
4. **Optimize performance**: Implement virtual scrolling for long conversations
5. **Write tests**: Component tests, integration tests, E2E tests
6. **Deploy to production**: Configure environment variables, set up monitoring

---

## Resources

- [OpenAI ChatKit Documentation](https://platform.openai.com/docs/chatkit)
- [Next.js 16 App Router Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Better Auth Documentation](https://better-auth.com)
- [Phase II Backend Documentation](../../002-backend-todo-app/spec.md)
- [Phase II Frontend Documentation](../../002-frontend-web-app/spec.md)

---

## Support

- **Issues**: Create GitHub issue
- **Questions**: Ask in team Slack channel
- **Documentation**: Check `docs/` directory
- **Templates**: See `.specify/templates/` directory
