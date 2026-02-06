# Research: OpenAI ChatKit Integration

**Feature**: 001-chatkit-integration
**Date**: 2026-01-04
**Purpose**: Resolve unknowns and identify best practices for ChatKit integration

## Research Questions and Decisions

### 1. OpenAI ChatKit Integration Pattern

**Question**: What is the recommended pattern for integrating OpenAI ChatKit into a Next.js 16+ App Router application?

**Decision**: Use ChatKit as a client-side React component with server-side API integration

**Rationale**:
- ChatKit is designed as a frontend component that makes API calls to OpenAI services
- ChatKit requires a domain key for authentication, which is configured in OpenAI platform
- Server-side rendering not required for ChatKit as it's an interactive component
- Best practice: Initialize ChatKit client component with configuration, connect to backend proxy endpoint

**Alternatives Considered**:
1. Server Component initialization: Rejected - ChatKit requires browser context and event handlers
2. Client-only route approach: Rejected - Limits integration with existing task management page

**Best Practices**:
- Wrap ChatKit in a Client Component (use "use client" directive)
- Pass domain key via environment variable (NEXT_PUBLIC_OPENAI_DOMAIN_KEY)
- Use Next.js proxy.ts pattern if required by ChatKit for CORS or header injection

---

### 2. Chat Interface Layout Pattern

**Question**: Should the chat interface be a sidebar, modal, or toggle view alongside the task management GUI?

**Decision**: Sidebar layout with collapsible toggle on desktop, full-screen overlay on mobile

**Rationale**:
- Sidebar allows simultaneous viewing of tasks and chat context
- Collapsible sidebar provides space for task list when not using chat
- Full-screen overlay on mobile ensures usability on small screens
- Matches industry standards (ChatGPT, Claude, Cursor use similar patterns)

**Alternatives Considered**:
1. Modal/Dialog: Rejected - Poor UX for extended conversations, blocks task view
2. Separate route/page: Rejected - Breaks context, prevents seeing tasks while chatting
3. Bottom drawer: Rejected - Limited vertical space, poor for long conversations

**Best Practices**:
- Use CSS grid or flexbox for responsive layout
- Implement smooth animations for toggle transitions
- Persist collapsed/expanded state in localStorage
- Provide keyboard shortcut (e.g., Cmd/Ctrl + K) to toggle

---

### 3. Conversation History Storage Strategy

**Question**: Where should conversation history be stored - client-side (localStorage) or server-side (backend database)?

**Decision**: Client-side localStorage for session history, with backend endpoint for persistent history

**Rationale**:
- Client-side storage: Fast, no backend dependency for simple use cases
- Backend persistence: Required for cross-device sync and long-term retention
- Dual approach: localStorage as cache, backend as source of truth
- Aligns with Phase III constitution requirement for database-backed conversations

**Alternatives Considered**:
1. Client-side only: Rejected - Lost on browser clear, no cross-device sync
2. Backend only: Rejected - Network latency, poor offline experience

**Best Practices**:
- Store conversation as array of messages with metadata (timestamps, IDs)
- Implement optimistic UI updates (show message immediately, then persist)
- Add error handling for localStorage quota exceeded
- Sync with backend on reconnection after network loss

---

### 4. Tool Call Display Pattern

**Question**: How should AI tool calls be displayed to users for transparency?

**Decision**: Collapsible inline display with tool name, parameters (redacted), and status

**Rationale**:
- Transparency helps users understand AI actions
- Collapsible reduces visual clutter for non-technical users
- Inline placement keeps context with relevant message
- Redact sensitive data (API keys, user IDs) for security

**Alternatives Considered**:
1. Always expanded: Rejected - Too verbose, overwhelms conversation
2. Separate panel: Rejected - Breaks association with message
3. Hidden/Debug only: Rejected - Violates transparency principle

**Best Practices**:
- Use expandable details/summary element
- Show tool name and status (success/failure) when collapsed
- Display formatted JSON when expanded (with syntax highlighting)
- Provide "Hide all tool calls" preference setting

---

### 5. JWT Authentication Pattern for Chat Endpoint

**Question**: How should JWT be passed to the backend chat endpoint from the ChatKit component?

**Decision**: Include JWT in Authorization header: `Authorization: Bearer <token>` for all chat API requests

**Rationale**:
- Follows Phase II established pattern for all backend requests
- Standardized JWT authentication approach across application
- Backend can verify JWT and extract user_id for isolation
- Aligns with Principle IV (Security-First) of constitution

**Alternatives Considered**:
1. URL parameter: Rejected - Security risk (token in URL, logs, history)
2. Cookie: Rejected - Requires additional backend configuration
3. Custom header: Rejected - Non-standard, harder to maintain

**Best Practices**:
- Use centralized API client utility (lib/chat-api.ts)
- Handle token expiration with refresh logic
- Store JWT securely (httpOnly cookie or secure storage)
- Clear error messages for 401/403 responses

---

### 6. Responsive Design Breakpoints

**Question**: What screen sizes should the chat interface support and how should layout adapt?

**Decision**: Mobile-first design with breakpoints at 640px (sm), 768px (md), 1024px (lg), 1280px (xl)

**Rationale**:
- Tailwind CSS default breakpoints align with industry standards
- Mobile-first ensures smallest screens are primary design target
- Progressive enhancement from small to large screens
- WCAG 2.1 Level AA requires zoom support (up to 200%)

**Breakpoint Strategy**:
- Mobile (<640px): Full-screen chat overlay, hamburger menu toggle
- Tablet (640px-1024px): 50% width sidebar slide-over
- Desktop (≥1024px): Fixed-width sidebar (400px) on right side
- Extra-wide (≥1280px): Expandable sidebar (400-600px)

**Best Practices**:
- Test on actual devices (iPhone SE, iPad, MacBook, 4K monitor)
- Use relative units (rem, %, fr) not fixed pixels
- Implement touch targets minimum 44x44px (WCAG requirement)
- Ensure keyboard navigation works at all sizes

---

### 7. Accessibility (WCAG 2.1 Level AA) Requirements

**Question**: What specific accessibility features must be implemented for the chat interface?

**Decision**: Full WCAG 2.1 Level AA compliance including ARIA roles, keyboard navigation, screen reader support

**Rationale**:
- Constitutional requirement (Principle VIII)
- Legal requirement in many jurisdictions
- Enables users with disabilities to use chat interface
- Industry standard for modern web applications

**Required Features**:
1. **Keyboard Navigation**:
   - Tab key to navigate all interactive elements
   - Enter/Space to activate buttons, send messages
   - Escape to close modal/side panel
   - Focus management (trap focus in modal, return focus after close)

2. **Screen Reader Support**:
   - ARIA roles: `role="log"` for chat history, `role="textbox"` for input
   - ARIA live regions: `aria-live="polite"` for new messages
   - Proper labeling: `aria-label`, `aria-labelledby`
   - Announce sender: "User message: [content]", "Assistant message: [content]"

3. **Visual Accessibility**:
   - Color contrast ratio ≥4.5:1 for text
   - Focus indicators visible on all interactive elements
   - No reliance on color alone (icons + text)
   - Resizable text (avoid fixed font sizes)

4. **Semantic HTML**:
   - Use `<button>`, `<input>`, `<textarea>` not `<div>` for interactive elements
   - Proper heading hierarchy (single `<h1>`, logical `<h2>`/`<h3>` structure)
   - Alt text for images, captions for video

**Best Practices**:
- Test with NVDA, JAWS, VoiceOver screen readers
- Use automated tools (axe-core, WAVE) for initial validation
- Manual testing with keyboard only (no mouse)
- Test with zoom levels up to 200%

---

### 8. Error Handling Strategy

**Question**: How should errors be handled in the chat interface (network errors, API errors, rate limits)?

**Decision**: Graceful degradation with user-friendly error messages and retry options

**Rationale**:
- Network failures are common in web apps
- Users should never see raw error messages or stack traces
- Retry mechanism improves success rate
- Aligns with spec requirement FR-015, FR-016

**Error Types**:

1. **Network Errors** (offline, DNS failure):
   - Display "Unable to connect. Check your internet connection."
   - Show offline indicator
   - Auto-retry with exponential backoff

2. **API Errors** (500, 502, 503):
   - Display "Server error occurred. Please try again."
   - Show retry button
   - Log error details for debugging

3. **Authentication Errors** (401, 403):
   - Display "Session expired. Please log in again."
   - Redirect to login page
   - Clear invalid token

4. **Rate Limiting** (429):
   - Display "Too many requests. Please wait a moment."
   - Show countdown timer
   - Queue messages for automatic retry

5. **Validation Errors** (400):
   - Display inline error message
   - Highlight problematic input
   - Prevent submission until valid

**Best Practices**:
- Use toast notifications for non-critical errors
- Use error boundaries for React component crashes
- Log errors to monitoring service (Sentry, etc.)
- Provide "Report a problem" link for user feedback

---

### 9. Loading State UX Pattern

**Question**: How should loading states be displayed while waiting for AI responses?

**Decision**: Subtle typing indicator with animated dots and status text

**Rationale**:
- Clear feedback that system is working
- Not distracting (avoids overwhelming animations)
- Industry standard (ChatGPT, Claude use similar indicators)
- Aligns with spec requirement FR-005

**Loading States**:

1. **Sending Message**:
   - Disable send button
   - Show loading spinner in send button icon
   - Change button text to "Sending..."
   - Display message immediately (optimistic UI)

2. **Waiting for AI Response**:
   - Show typing indicator: "Assistant is thinking..." with animated dots
   - Pulse animation on chat input
   - Maintain scroll position

3. **Network Request in Progress**:
   - Show progress bar at top of chat
   - Indeterminate spinner for unknown duration
   - Time-based fallback: "Taking longer than usual..." after 10 seconds

4. **Success State**:
   - Fade out loading indicator
   - Flash effect on new message
   - Auto-scroll to new message
   - Re-enable send button

**Best Practices**:
- Use skeleton screens for complex content (images, tables)
- Provide cancel button for long-running requests
- Implement timeout with error after 30 seconds
- Use CSS animations, not JavaScript (better performance)

---

### 10. Design System Integration

**Question**: How should the chat interface match the existing task management UI design system?

**Decision**: Extend existing Tailwind CSS configuration with chat-specific tokens

**Rationale**:
- Consistent user experience across application
- Reuse existing colors, typography, spacing
- Avoid duplicate design tokens
- Easier maintenance and updates

**Design Tokens to Reuse**:

1. **Colors**:
   - Primary: Existing brand color
   - Secondary: Gray scale for neutral elements
   - Success: Green for sent messages
   - Error: Red for errors
   - Background: Surface colors for user/assistant messages

2. **Typography**:
   - Font family: Application font (Inter, system-ui, etc.)
   - Headings: Application heading scale
   - Body: Application body text size

3. **Spacing**:
   - Base unit: 4px grid system
   - Component padding: Consistent with other components
   - Gaps: Match application spacing scale

4. **Borders & Shadows**:
   - Border radius: Match application (e.g., rounded-md)
   - Shadows: Consistent elevation scale
   - Border width: 1px for most elements

**Chat-Specific Tokens**:
```css
/* Chat-specific overrides */
.chat-bubble-user { background: primary-color; }
.chat-bubble-assistant { background: surface-100; }
.chat-input-border { border-color: neutral-200; }
.chat-typing-indicator { color: neutral-500; }
```

**Best Practices**:
- Document new tokens in tailwind.config.js
- Create storybook examples for chat components
- Test with dark mode theme
- Ensure high contrast in both light and dark modes

---

## Summary of Decisions

| Question | Decision | Key Justification |
|----------|----------|-------------------|
| ChatKit integration | Client-side React component | ChatKit requires browser context |
| Layout pattern | Sidebar (desktop), full-screen (mobile) | Industry standard, UX best practice |
| Conversation storage | localStorage + backend dual approach | Fast + persistent |
| Tool call display | Collapsible inline with redaction | Transparency without clutter |
| JWT authentication | Authorization: Bearer header | Phase II standard pattern |
| Responsive breakpoints | Mobile-first, Tailwind defaults | Industry standard |
| Accessibility | Full WCAG 2.1 Level AA | Constitutional requirement |
| Error handling | Graceful degradation + retry | User experience focus |
| Loading state | Typing indicator + status text | Clear feedback, not distracting |
| Design system | Extend existing Tailwind config | Consistency, maintainability |

## Open Questions

None. All unknowns resolved through research.

## Next Steps

1. Phase 1: Create data model (data-model.md)
2. Phase 1: Generate API contracts (contracts/chat-api.md)
3. Phase 1: Create quickstart guide (quickstart.md)
4. Phase 1: Update agent context with ChatKit knowledge
