---
phase: 42
plan: 03
subsystem: ai-integration
type: integration
tags: [ai, chat, tool-calling, property-cards, ui-wiring, loading-state]
requires:
  - phase: 42
    plan: 01
    reason: "Property search tool provides toolCalls data"
  - phase: 42
    plan: 02
    reason: "PropertyRecommendationCard and SaveAllButton components"
  - phase: 41
    plan: 03
    reason: "AI chat panel base components (ChatMessage, ChatMessageList, useAIChat)"
provides:
  - Tool result extraction from assistant messages
  - PropertyCardRenderer component with loading indicator
  - End-to-end property recommendations in chat
affects:
  - phase: 43
    plan: all
    reason: "Established pattern for rendering tool results in chat"
  - phase: 44
    plan: all
    reason: "Property recommendation feature ready for enhanced interactions"
tech-stack:
  added: []
  patterns:
    - "Tool call extraction via toolCallId pairing"
    - "PropertyCardRenderer for separation of concerns"
    - "Loading state during tool execution"
    - "Tool result rendering inline in chat messages"
key-files:
  created:
    - src/components/ai/PropertyCardRenderer.tsx
  modified:
    - convex/ai/messages.ts
    - src/components/ai/hooks/useAIChat.ts
    - src/components/ai/ChatMessage.tsx
    - src/components/ai/ChatMessageList.tsx
    - src/components/ai/index.ts
decisions:
  - decision: "Extract tool calls from assistant message content array"
    rationale: "Tool-call and tool-result parts are embedded in assistant messages, paired via toolCallId. No need for separate 'tool' role messages."
    date: 2026-01-22
  - decision: "Create PropertyCardRenderer as separate component"
    rationale: "Keeps ChatMessage clean and focused. Renderer handles extraction logic, loading state, and property card composition."
    date: 2026-01-22
  - decision: "Pass isStreaming as isExecuting to PropertyCardRenderer"
    rationale: "Enables loading indicator during tool execution before results arrive"
    date: 2026-01-22
metrics:
  duration: 2
  completed: 2026-01-22
---

# Phase 42 Plan 03: Chat Integration & Wiring Summary

**Tool result extraction, property card rendering with loading indicators, and end-to-end chat integration for AI property recommendations**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-22T15:00:35Z
- **Completed:** 2026-01-22T15:02:24Z
- **Tasks:** 5 (4 code + 1 checkpoint)
- **Files modified:** 6

## Accomplishments

- Tool call data flows from backend (messages.ts) through frontend (useAIChat) to UI (ChatMessage)
- PropertyCardRenderer component extracts searchProperties results and renders property cards inline
- Loading indicator ("Searching properties...") appears during tool execution before results arrive
- Property recommendations feature complete end-to-end (REC-01 through REC-07, CHAT-07 verified)

## Task Commits

Each task was committed atomically:

1. **Task 1: Update messages.ts to return tool call data** - `adb07e4` (feat)
2. **Task 2: Create PropertyCardRenderer component** - `43d92ad` (feat)
3. **Task 3: Update useAIChat hook and ChatMessage** - `ff92d42` (feat)
4. **Task 4: Update barrel exports** - `395a699` (feat)
5. **Task 5: Human verification checkpoint** - APPROVED

## Files Created/Modified

### Created (1 file)
- `src/components/ai/PropertyCardRenderer.tsx` - Extracts tool results, shows loading indicator, renders property cards with SaveAllButton

### Modified (5 files)
- `convex/ai/messages.ts` - Added toolCalls extraction from assistant message content array, pairs tool-call with tool-result via toolCallId
- `src/components/ai/hooks/useAIChat.ts` - Extended Message interface with toolCalls array
- `src/components/ai/ChatMessage.tsx` - Added PropertyCardRenderer rendering for assistant messages with isStreaming as isExecuting
- `src/components/ai/ChatMessageList.tsx` - Pass toolCalls prop through to ChatMessage
- `src/components/ai/index.ts` - Export PropertyCardRenderer

## Implementation Details

### Tool Call Extraction Pattern

**Key insight:** Tool data is embedded in assistant message content arrays, not separate "tool" role messages.

Assistant message structure (from @convex-dev/agent):
```typescript
{
  role: "assistant",
  content: [
    { type: "text", text: "Here are some properties..." },
    { type: "tool-call", toolCallId: "abc123", toolName: "searchProperties", args: {...} },
    { type: "tool-result", toolCallId: "abc123", result: {...} }
  ]
}
```

**Extraction logic:**
1. Filter assistant messages with array content
2. Extract tool-call parts (invocations)
3. Extract tool-result parts (responses)
4. Pair via toolCallId matching
5. Return simplified format for frontend

**Benefits:**
- No need for excludeToolMessages: false (avoid separate "tool" messages)
- Single source of truth (assistant message contains both call and result)
- Type-safe pairing via toolCallId

### PropertyCardRenderer Component

**Responsibilities:**
- Find searchProperties tool call in toolCalls array
- Show loading indicator if isExecuting && !result
- Type-guard result structure for safety
- Render PropertyRecommendationCard for each property
- Show SaveAllButton if 2+ properties

**Loading state logic:**
```typescript
if (isExecuting && searchToolCall && !searchToolCall.result) {
  return <LoadingIndicator />; // "Searching properties..."
}
```

**Why separate component:**
- ChatMessage stays focused on message rendering
- Tool extraction logic isolated and testable
- Easy to add support for other tool types in future

### Integration Flow

1. User sends: "Show me properties in Tel Aviv under $500k"
2. AI agent calls searchProperties tool
3. convex/ai/messages.ts extracts tool-call and tool-result from assistant message
4. useAIChat returns message with toolCalls array
5. ChatMessage passes toolCalls to PropertyCardRenderer
6. PropertyCardRenderer shows loading → then property cards → then SaveAllButton

## Verification Results

All success criteria met:

### Property Recommendations (REC-01 through REC-07)
- ✅ **REC-01:** AI recommends properties based on investor criteria
- ✅ **REC-02:** Each recommendation shows 2-3 match reasons in AI text
- ✅ **REC-03:** Match badges appear on cards (Budget, Location, Property Type)
- ✅ **REC-04:** "Save All X Properties" button saves all with toast feedback
- ✅ **REC-05:** Property cards link to detail modal on click
- ✅ **REC-06:** Loading indicator shows during property search ("Searching properties...")
- ✅ **REC-07:** No hallucinations - all properties from database with IDs

### Chat Integration (CHAT-07)
- ✅ **CHAT-07:** AI answers follow-up questions about properties
- ✅ Property context retained across conversation
- ✅ Cards appear inline in chat messages
- ✅ Interactive elements (save, modal) work from chat

**Human verification:** User approved after testing complete flow:
- Loading state appears during search
- Property cards render with photos, prices, match badges
- AI provides specific match reasons
- Modal opens on card click
- Save All button works with toast feedback
- Follow-up questions reference recommended properties

## Decisions Made

### 1. Tool Call Extraction Strategy
**Context:** Need to access tool results for rendering property cards

**Decision:** Extract tool-call and tool-result parts from assistant message content array, pair via toolCallId

**Alternatives considered:**
- Use separate "tool" role messages (excluded by agent)
- Parse from AI text response (unreliable)
- Store tool results separately (duplicates data)

**Rationale:**
- @convex-dev/agent embeds tool data in assistant message content
- toolCallId provides type-safe pairing mechanism
- Single source of truth (no separate tool messages needed)
- Frontend gets structured data for type-safe rendering

**Impact:** Clean data flow from backend to UI, no parsing required

### 2. PropertyCardRenderer Component Pattern
**Context:** ChatMessage needs to render property cards from tool results

**Decision:** Create separate PropertyCardRenderer component instead of inline logic

**Alternatives considered:**
- Inline extraction and rendering in ChatMessage (too complex)
- Generic ToolResultRenderer (premature abstraction)
- Parse from AI text (unreliable and fragile)

**Rationale:**
- Separation of concerns (ChatMessage renders messages, PropertyCardRenderer renders tool results)
- Tool extraction logic isolated and testable
- Loading state logic centralized
- Easy to extend for other tools in future

**Impact:** ChatMessage stays clean (~70 lines), PropertyCardRenderer handles complexity (~100 lines)

### 3. Loading State Implementation
**Context:** REC-06 requires loading indicator during property search

**Decision:** Pass isStreaming from ChatMessage as isExecuting to PropertyCardRenderer

**Logic:**
```typescript
// In ChatMessage
<PropertyCardRenderer
  toolCalls={toolCalls}
  isExecuting={isStreaming}
/>

// In PropertyCardRenderer
if (isExecuting && searchToolCall && !searchToolCall.result) {
  return <LoadingIndicator />;
}
```

**Rationale:**
- isStreaming already tracks when AI is processing
- Tool execution happens during streaming phase
- Once result arrives, isStreaming may still be true but result exists (show cards)
- No additional state management needed

**Impact:** REC-06 satisfied, smooth UX transition from loading to results

## Deviations from Plan

None - plan executed exactly as written.

All tasks completed as specified:
- Task 1: Tool call extraction from assistant messages
- Task 2: PropertyCardRenderer component
- Task 3: useAIChat and ChatMessage updates
- Task 4: Barrel exports
- Task 5: Human verification checkpoint

## Issues Encountered

None. Execution was straightforward:
- @convex-dev/agent message format well-documented
- toolCallId pairing pattern clear from types
- PropertyCardRenderer responsibilities well-defined in plan
- All TypeScript types aligned correctly

## Next Phase Readiness

**Phase 42 Complete** - Property recommendations feature fully functional:
- ✅ Tool infrastructure (42-01)
- ✅ UI components (42-02)
- ✅ Chat integration (42-03)

**Ready for Phase 43** (Provider Search and Recommendations):
- Tool calling pattern established
- PropertyCardRenderer pattern can be adapted for providers
- Loading state pattern reusable
- Toast notifications ready
- Modal pattern available

**Phase 44** (Enhanced Interactions) prerequisites:
- ✅ Property recommendations working end-to-end
- ✅ Tool results rendering inline
- ✅ Follow-up questions supported
- ✅ Context retention across conversation

**No blockers or concerns.**

## Pattern Established for Future Tool Integration

This plan establishes the standard pattern for integrating AI tools with chat UI:

### Backend (Convex)
1. Define tool with createTool from @convex-dev/agent
2. Register tool in agent.ts
3. Extract tool-call and tool-result from assistant message content
4. Return paired toolCalls array to frontend

### Frontend (React)
1. Extend Message interface with toolCalls
2. Pass toolCalls through component hierarchy
3. Create {ToolName}Renderer component for each tool type
4. Show loading indicator during tool execution
5. Render results inline in chat message

### Key Principles
- Tool data flows through standard message structure
- Renderers are separate components (separation of concerns)
- Loading states provide feedback during execution
- Type safety maintained end-to-end

**Future tools** (provider search, property comparison, etc.) should follow this pattern.

## Success Criteria

All criteria from plan verified and approved:

- ✅ AI recommends 3 properties based on investor criteria (REC-01)
- ✅ Each recommendation shows 2-3 match reasons in AI text (REC-02)
- ✅ Match badges appear on cards (REC-03)
- ✅ "Quick save all" saves all properties with toast (REC-04)
- ✅ Property cards link to detail modal (REC-05)
- ✅ Loading indicator shows during property search (REC-06)
- ✅ All properties exist in database - no hallucinations (REC-07)
- ✅ AI answers questions about properties (CHAT-07)

---
*Phase: 42-property-recommendations*
*Completed: 2026-01-22*
