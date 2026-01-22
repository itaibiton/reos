---
phase: 44-investor-summary-page
plan: 02
subsystem: ui
tags: [react, ai-chat, quick-replies, user-experience]

# Dependency graph
requires:
  - phase: 41-conversational-ai-core
    provides: AIChatPanel and useAIChat hook
provides:
  - QuickReplyButtons component for context-aware AI prompt suggestions
  - Extensible quick reply injection pattern via renderQuickReplies prop
affects: [44-03-investor-summary-page, future-ai-features]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Render prop pattern for injecting components with access to parent callbacks"
    - "Collapse-to-expand UI pattern for progressive disclosure"

key-files:
  created:
    - src/components/profile/QuickReplyButtons.tsx
  modified:
    - src/components/ai/AIChatPanel.tsx
    - src/components/profile/index.ts

key-decisions:
  - "Render prop pattern for renderQuickReplies instead of lifting useAIChat to parent"
  - "Collapse after first use to keep chat clean"
  - "Context-aware 'Complete profile' prompt when profile incomplete"

patterns-established:
  - "Render props for component extensibility when child needs parent callback access"
  - "Quick reply buttons collapse to minimal 'Show suggestions' button after use"

# Metrics
duration: 2min
completed: 2026-01-23
---

# Phase 44 Plan 02: Quick Reply Buttons Summary

**Quick reply chip buttons with collapse behavior and render prop injection pattern for AI chat extensibility**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-23T04:47:20Z
- **Completed:** 2026-01-23T04:49:09Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- QuickReplyButtons component with BASE_PROMPTS ("Show properties", "Build my team", "Explain options")
- Context-aware "Complete profile" prompt appears when profileComplete={false}
- Collapse-to-expand behavior (collapses after first button click, shows "Show suggestions" button)
- AIChatPanel extensibility via renderQuickReplies render prop

## Task Commits

Each task was committed atomically:

1. **Task 1: Create QuickReplyButtons component** - `f0bc61b` (feat)
2. **Task 2: Update AIChatPanel to accept renderQuickReplies prop** - `e63eb1e` (feat)
3. **Task 3: Update barrel export** - `9d16660` (feat)

## Files Created/Modified
- `src/components/profile/QuickReplyButtons.tsx` - Chip buttons for common AI prompts with collapse behavior
- `src/components/ai/AIChatPanel.tsx` - Added optional renderQuickReplies prop (render prop pattern)
- `src/components/profile/index.ts` - Exported QuickReplyButtons from barrel

## Decisions Made

**1. Render prop pattern for renderQuickReplies**
- **Rationale:** AIChatPanel already uses useAIChat internally. Rather than lift the hook to parent (breaking change), use render prop to give parent access to sendMessage callback.
- **Alternative considered:** Lift useAIChat to parent (rejected - would require changes to existing code)
- **Outcome:** `renderQuickReplies?: (sendMessage: (text: string) => void) => ReactNode`

**2. Collapse after first use**
- **Rationale:** Quick replies are helpful for starting conversation, but become visual clutter once chat is underway
- **Pattern:** After any button click, collapse to minimal "Show suggestions" button with MessageQuestionIcon

**3. Context-aware "Complete profile" prompt**
- **Rationale:** Guide investors to complete their profile if incomplete, making AI recommendations more accurate
- **Pattern:** Added to prompts array when `profileComplete === false`

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- QuickReplyButtons ready for integration in Plan 03 (Investor Summary Page)
- Usage pattern:
  ```tsx
  <AIChatPanel
    renderQuickReplies={(sendMessage) => (
      <QuickReplyButtons
        onPromptSelect={sendMessage}
        profileComplete={completeness === 100}
      />
    )}
  />
  ```
- AIChatPanel remains backward compatible (renderQuickReplies optional)

---
*Phase: 44-investor-summary-page*
*Completed: 2026-01-23*
