# Phase 41 Context: Conversational AI Core

**Captured:** 2026-01-22
**Method:** /gsd:discuss-phase adaptive questioning

## Phase Goal

Users can chat with AI assistant and see streaming responses.

## Requirements Covered

- CHAT-01: Investor can send messages to AI assistant
- CHAT-02: AI responds with streaming text (token-by-token display)
- CHAT-03: Typing indicator shows while AI is generating response
- CHAT-04: Chat history displays previous messages in conversation

## Implementation Decisions

### Message Layout

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Message style | Chat bubbles | iMessage/WhatsApp pattern, familiar UX |
| Avatar display | Both user and AI | Visual distinction between participants |
| Message info | Timestamp + name | Context without clutter |
| Text formatting | Full markdown | Support code blocks, lists, formatting |

**Implementation notes:**
- User messages: Right-aligned bubbles with user avatar
- AI messages: Left-aligned bubbles with REOS/AI avatar
- Timestamps: Relative format (e.g., "2 min ago") with full time on hover
- Markdown: Use react-markdown or similar for rendering

### Streaming Display

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Token granularity | Word by word | Balance between smoothness and readability |
| Streaming cursor | Blinking cursor | Clear indicator of active generation |
| Waiting indicator | Typing indicator dots | Familiar pattern for "AI is thinking" |
| Auto-scroll | Smart scroll | Only auto-scroll if user is at bottom |

**Implementation notes:**
- Use `saveStreamDeltas: { chunking: "word" }` from Phase 40 infrastructure
- Cursor: Animated blinking bar at end of streaming text
- Dots: Three animated dots in AI message area before first token
- Smart scroll: Track scroll position, only auto-scroll if within ~50px of bottom

### Input Experience

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Input position | Fixed at bottom | Standard chat pattern, always accessible |
| Send method | Both Enter and button | Accessibility and preference flexibility |
| Text field | Auto-grow textarea | Accommodate multi-line messages |
| During response | Disable input | Prevent confusion, one message at a time |

**Implementation notes:**
- Fixed footer with input area (similar to WhatsApp/Telegram)
- Enter sends, Shift+Enter for newline
- Textarea grows up to ~4 lines, then scrolls internally
- Input disabled + visual indication while AI is responding
- Stop button appears during streaming (uses Phase 40 stopGeneration)

### Chat History

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Initial view | Fresh start | Clean UI, AI remembers context internally |
| History loading | Paginated batches | Predictable loading, "Load more" button |
| History access | History button | Explicit UI to view past conversations |
| Clear option | Yes, with confirm | User control with protection against accidents |

**Implementation notes:**
- When user returns: Empty chat UI with welcome message
- AI has full context from Phase 40 memory system (user unaware)
- History button in chat header reveals past messages
- "Load more" button at top loads previous batch (e.g., 20 messages)
- Clear button in settings/header with "Are you sure?" confirmation
- Clear calls `clearMemory` from Phase 40 threads.ts

## Technical Integration

### Phase 40 Infrastructure Used

| Phase 40 Export | Phase 41 Usage |
|-----------------|----------------|
| `api.ai.chat.sendMessage` | Send user message, receive streaming response |
| `api.ai.chat.stopGeneration` | Stop button functionality |
| `api.ai.chat.getStreamingStatus` | Typing indicator state |
| `api.ai.threads.getThreadForUser` | Load conversation history |
| `api.ai.threads.clearMemory` | Clear history functionality |

### Component Structure (Proposed)

```
src/components/ai/
├── AIChatPanel.tsx        # Main container
├── ChatMessages.tsx       # Message list with virtualization
├── ChatMessage.tsx        # Individual message bubble
├── ChatInput.tsx          # Fixed input footer
├── TypingIndicator.tsx    # Animated dots
├── StreamingCursor.tsx    # Blinking cursor
└── ChatHistoryModal.tsx   # History viewer overlay
```

### State Management

- **Streaming state**: Track via `getStreamingStatus` or local state from action response
- **Messages**: Convex subscription to thread messages (real-time updates)
- **Input state**: Local React state (message text, disabled flag)
- **Scroll position**: Ref-based tracking for smart auto-scroll

## Open Questions Resolved

1. ~~Message styling~~ → Chat bubbles with avatars
2. ~~Streaming visualization~~ → Word-by-word with blinking cursor
3. ~~Input behavior~~ → Fixed footer, auto-grow, disabled during response
4. ~~History display~~ → Fresh start UI, paginated history access

## Out of Scope for Phase 41

- Quick reply buttons (Phase 44)
- Property/provider questions (Phase 42/43)
- Mobile-specific adaptations (Phase 45)
- Profile integration (Phase 44)

---
*Context captured: 2026-01-22*
*Ready for: /gsd:plan-phase 41*
