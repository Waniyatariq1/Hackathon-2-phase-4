# Tasks: OpenAI ChatKit Integration

**Input**: Design documents from `/specs/001-chatkit-integration/`
**Prerequisites**: plan.md (complete), spec.md (complete), research.md (complete), data-model.md (complete), contracts/ (complete)

**Tests**: Test tasks are included per constitution principle V (Test-First Development). Tests MUST be written FIRST and FAIL before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions (Phase III Frontend)

- **Frontend**: `frontend/src/` (app, components, lib, types), `frontend/tests/` (components, e2e)
- All task file paths use these exact conventions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependencies

- [ ] T001 Add OpenAI ChatKit dependency to frontend/package.json (@openai/chatkit or equivalent package)
- [ ] T002 [P] Update frontend/.env.local.example with NEXT_PUBLIC_OPENAI_DOMAIN_KEY environment variable
- [ ] T003 [P] Verify existing API client in frontend/src/lib/api-client.ts supports chat endpoint

**Validation**: Run `pnpm install` in frontend/ to verify ChatKit dependency installs successfully

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### API Client Foundation

- [ ] T004 Create chat API client in frontend/src/lib/chat-api.ts (sendMessage function that calls POST /api/{user_id}/chat, includes JWT token, handles errors)
- [ ] T005 [P] Create TypeScript types for chat in frontend/src/types/chat.ts (ChatMessage, Conversation, ChatRequest, ChatResponse, ToolCall interfaces)

### Chat Storage Foundation

- [ ] T006 Create chat storage utility in frontend/src/lib/chat-storage.ts (localStorage/sessionStorage for conversation history, getConversationHistory, saveMessage methods)

**Validation**: Verify chat API client can be imported and types are available

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Switch Between GUI and Chat Interface (Priority: P1) 🎯 MVP

**Goal**: Users can toggle between traditional GUI and conversational interface

**Independent Test**: User can switch between GUI and Chat interfaces, data persists across switches

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T007 [P] [US1] Component test for interface toggle in frontend/tests/components/chat/test-interface-toggle.tsx (click toggle button, verify interface switches)
- [ ] T008 [P] [US1] E2E test for interface switching in frontend/tests/e2e/chat-interface-switch.spec.ts (switch between GUI and Chat, verify state preserved)

### Implementation for User Story 1

**UI Components:**

- [ ] T009 [US1] Create ChatHeader component in frontend/src/components/chat/ChatHeader.tsx (toggle button to switch between GUI and Chat views)
- [ ] T010 [US1] Update tasks page in frontend/src/app/tasks/page.tsx (add toggle UI, conditionally render GUI or Chat interface based on state)
- [ ] T011 [US1] Create state management for interface toggle in frontend/src/contexts/ChatContext.tsx (useState for currentView: 'gui' | 'chat', toggleView function)

**Validation**: Click toggle button, verify interface switches between GUI and Chat views

---

## Phase 4: User Story 2 - Send Messages and Receive AI Responses (Priority: P1) 🎯 MVP

**Goal**: Users can type messages, send them, and receive AI responses with loading states

**Independent Test**: User can type message, send it, see loading indicator, receive response

### Tests for User Story 2

- [ ] T012 [P] [US2] Component test for message sending in frontend/tests/components/chat/test-message-sending.tsx (type message, click send, verify message appears)
- [ ] T013 [P] [US2] Component test for loading state in frontend/tests/components/chat/test-loading-state.tsx (send message, verify loading indicator shows)
- [ ] T014 [P] [US2] Integration test for API call in frontend/tests/components/chat/test-chat-api-integration.tsx (mock API call, verify request/response handling)

### Implementation for User Story 2

**Chat Components:**

- [ ] T015 [US2] Create ChatKit main component in frontend/src/components/chat/ChatKit.tsx (main chat interface container, integrates OpenAI ChatKit)
- [ ] T016 [US2] Create ChatInput component in frontend/src/components/chat/ChatInput.tsx (message input field, send button, Enter key support, disabled when empty)
- [ ] T017 [US2] Create ChatMessage component in frontend/src/components/chat/ChatMessage.tsx (display individual message with role styling: user vs assistant)
- [ ] T018 [US2] Add loading state UI in frontend/src/components/chat/ChatKit.tsx (spinner or dots animation while waiting for AI response)

**Chat Service Integration:**

- [ ] T019 [US2] Integrate chat API client in ChatKit component (call sendMessage on user input, handle response, update conversation state)
- [ ] T020 [US2] Add error handling in ChatKit component (display error messages for API failures, network errors)

**Validation**: Type message, send it, verify loading indicator appears, then response displays

---

## Phase 5: User Story 3 - View Conversation History (Priority: P2)

**Goal**: Users can see full conversation history, scroll through previous messages

**Independent Test**: User can scroll through conversation history, see all previous messages

### Tests for User Story 3

- [ ] T021 [P] [US3] Component test for conversation history in frontend/tests/components/chat/test-conversation-history.tsx (display multiple messages, verify scrolling works)
- [ ] T022 [P] [US3] Integration test for history persistence in frontend/tests/components/chat/test-history-persistence.tsx (send messages, refresh page, verify history loads)

### Implementation for User Story 3

**History Display:**

- [ ] T023 [US3] Create conversation history display in frontend/src/components/chat/ChatKit.tsx (scrollable message list, auto-scroll to bottom on new message)
- [ ] T024 [US3] Integrate chat storage in ChatKit component (load conversation history on mount, save messages to storage)
- [ ] T025 [US3] Add message styling differentiation in ChatMessage.tsx (user messages vs assistant messages with different colors/alignment)

**Validation**: Send multiple messages, verify all messages visible, scroll works, history persists on page refresh

---

## Phase 6: User Story 4 - Responsive and Accessible Chat Interface (Priority: P2)

**Goal**: Chat interface works on all screen sizes and meets WCAG 2.1 AA standards

**Independent Test**: Chat interface usable on desktop, tablet, mobile, with keyboard navigation and screen readers

### Tests for User Story 4

- [ ] T026 [P] [US4] Responsive design test in frontend/tests/components/chat/test-responsive-design.tsx (test at 375px, 768px, 1920px viewports)
- [ ] T027 [P] [US4] Accessibility test in frontend/tests/components/chat/test-accessibility.tsx (keyboard navigation, ARIA labels, screen reader compatibility)

### Implementation for User Story 4

**Responsive Design:**

- [ ] T028 [US4] Add responsive Tailwind classes to ChatKit.tsx (mobile-first: flex-col on mobile, flex-row on desktop)
- [ ] T029 [US4] Add responsive styles to ChatInput.tsx (full width on mobile, fixed width on desktop)
- [ ] T030 [US4] Add responsive styles to ChatMessage.tsx (message bubbles adapt to screen size)

**Accessibility:**

- [ ] T031 [US4] Add ARIA labels to ChatKit.tsx (role="log" for message list, aria-live for new messages)
- [ ] T032 [US4] Add ARIA labels to ChatInput.tsx (aria-label for input, aria-describedby for error messages)
- [ ] T033 [US4] Add keyboard navigation support (Tab to navigate, Enter to send, Escape to cancel)
- [ ] T034 [US4] Ensure color contrast ratios ≥ 4.5:1 for all text (verify with Tailwind color palette)

**Validation**: Test on multiple viewports, verify keyboard navigation, run accessibility audit (Lighthouse/axe)

---

## Phase 7: User Story 5 - View Tool Calls and Results (Optional Feature) (Priority: P3)

**Goal**: Users can optionally see AI tool calls and results for transparency

**Independent Test**: User can see tool calls in chat, optionally hide/show them

### Tests for User Story 5

- [ ] T035 [P] [US5] Component test for tool call display in frontend/tests/components/chat/test-tool-call-display.tsx (display tool call, verify collapsible works)

### Implementation for User Story 5

**Tool Call Display:**

- [ ] T036 [US5] Create ToolCallDisplay component in frontend/src/components/chat/ToolCallDisplay.tsx (display tool name, parameters, result, collapsible section)
- [ ] T037 [US5] Integrate ToolCallDisplay in ChatMessage.tsx (show tool calls for assistant messages when available)
- [ ] T038 [US5] Add toggle to show/hide tool calls in ChatHeader.tsx (user preference to show/hide all tool calls)

**Validation**: Send message that triggers tool call, verify tool call displays, verify collapsible works, verify toggle works

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Error handling, loading states, documentation

- [ ] T039 Add error boundary for ChatKit component (catch and display errors gracefully)
- [ ] T040 [P] Add empty state for chat (when no messages, show welcome message)
- [ ] T041 [P] Add connection status indicator (show when API is unreachable)
- [ ] T042 [P] Update frontend/README.md with ChatKit integration documentation
- [ ] T043 [P] Add ChatKit configuration to frontend/.env.local.example (NEXT_PUBLIC_OPENAI_DOMAIN_KEY)

**Validation**: Test error scenarios (network failure, API error, invalid response), verify error messages display

---

## Dependencies

### User Story Completion Order

1. **US1 (P1)** - Interface Toggle: Must complete first (enables Chat interface)
2. **US2 (P1)** - Send/Receive Messages: Depends on US1 (needs Chat interface visible)
3. **US3 (P2)** - Conversation History: Depends on US2 (needs messages to display)
4. **US4 (P2)** - Responsive/Accessible: Can be implemented in parallel with US3 (polish)
5. **US5 (P3)** - Tool Calls: Depends on US2 (needs messages working)

### Task Dependencies

- T004-T006 (Foundation) → T015-T020 (Chat components) → T019 (API integration)
- T009-T011 (Interface toggle) → T015 (ChatKit component)
- T015-T020 (Chat components) → T023-T025 (History display)
- T015-T020 (Chat components) → T028-T034 (Responsive/Accessible)
- T015-T020 (Chat components) → T036-T038 (Tool calls)

---

## Parallel Execution Opportunities

Tasks marked with **[P]** can run in parallel:
- T002, T003 (Environment setup)
- T005 (Types)
- T007, T008 (US1 tests)
- T012, T013, T014 (US2 tests)
- T021, T022 (US3 tests)
- T026, T027 (US4 tests)
- T035 (US5 tests)
- T040, T041, T042, T043 (Documentation)

---

## Implementation Strategy

**MVP First**: Implement US1 (Interface Toggle) and US2 (Send/Receive) to deliver core chat functionality
**Incremental Delivery**: Add US3 (History) for enhanced UX, US4 (Responsive/Accessible) for polish, US5 (Tool Calls) for transparency
**Test-Driven**: Write tests before implementation, ensure tests fail, then implement to make tests pass

---

## Checkpoints

- **After Phase 2**: Foundation ready - API client, types, storage utilities initialized
- **After Phase 3 (US1)**: Interface toggle working - users can switch between GUI and Chat
- **After Phase 4 (US2)**: Core chat working - users can send messages and receive responses
- **After Phase 5 (US3)**: History working - conversation history displays and persists
- **After Phase 6 (US4)**: Responsive/Accessible - works on all devices, meets WCAG 2.1 AA
- **After Phase 7 (US5)**: Tool calls visible - optional transparency feature complete
- **After Phase 8**: Production-ready - error handling, documentation complete

