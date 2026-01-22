---
phase: 41-conversational-ai-core
plan: 01
subsystem: ai
tags: [convex, react-hooks, markdown, react-markdown, react-syntax-highlighter]

# Dependency graph
requires:
  - phase: 40-ai-infrastructure-foundation
    provides: AI agent, thread management, context building, and streaming infrastructure
provides:
  - Public action for listing AI conversation messages
  - React hook for AI chat state management with refetch pattern
  - React hook for smart auto-scroll behavior
  - Markdown rendering dependencies for AI responses
affects: [42-property-rag, 43-provider-rag, 44-ai-ui-implementation]

# Tech tracking
tech-stack:
  added: [react-markdown@10.1.0, react-syntax-highlighter@16.1.0, @types/react-syntax-highlighter]
  patterns: [action-based message fetching, optimistic UI updates, Intersection Observer scroll detection]

key-files:
  created:
    - convex/ai/messages.ts
    - src/components/ai/hooks/useAIChat.ts
    - src/components/ai/hooks/useSmartScroll.ts
  modified:
    - package.json

key-decisions:
  - "Messages fetched via action (not query) because agent stores in internal tables"
  - "Refetch-after-send pattern since actions don't support real-time subscriptions"
  - "Optimistic UI updates for user messages during send"
  - "Intersection Observer for smart auto-scroll (only when user is near bottom)"

patterns-established:
  - "Action-based data fetching: Use actions when agent API requires action context"
  - "Refetch pattern: Manual refetch after mutations when real-time subscriptions unavailable"
  - "Optimistic updates: Add user message immediately, refetch for real data"
  - "Smart scroll: Only auto-scroll if user hasn't scrolled up to read history"

# Metrics
duration: 3min
completed: 2026-01-22
---

# Phase 41 Plan 01: AI Chat Foundation Summary

**Markdown rendering, message fetching action, and React state management hooks with refetch-after-send pattern for AI conversations**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-22T12:46:49Z
- **Completed:** 2026-01-22T12:50:07Z
- **Tasks:** 3
- **Files modified:** 5 (package.json, package-lock.json, 3 new files)

## Accomplishments
- Installed markdown rendering with syntax highlighting (react-markdown 10.x, react-syntax-highlighter 16.x)
- Created public action for retrieving AI conversation messages from agent internal tables
- Built useAIChat hook with action-based refetch pattern and optimistic updates
- Built useSmartScroll hook with Intersection Observer for context-aware auto-scroll

## Task Commits

Each task was committed atomically:

1. **Task 1: Install markdown rendering dependencies** - `9b6e5df` (chore)
2. **Task 2: Create public action for listing AI messages** - `c2ff41c` (feat)
3. **Task 3: Create useAIChat hook and useSmartScroll hook** - `2ae38ce` (feat)

## Files Created/Modified
- `package.json` - Added react-markdown, react-syntax-highlighter, and TypeScript types
- `convex/ai/messages.ts` - Public action that wraps investorAssistant.listMessages for frontend access
- `src/components/ai/hooks/useAIChat.ts` - React hook managing chat state with action-based refetch pattern
- `src/components/ai/hooks/useSmartScroll.ts` - React hook for smart auto-scroll using Intersection Observer

## Decisions Made

**1. Action-based message fetching (not query-based)**
- Rationale: The @convex-dev/agent stores messages in internal tables that cannot be queried directly from frontend. The investorAssistant.listMessages API requires action context.
- Impact: No real-time message updates. Must use refetch pattern after sends.

**2. Refetch-after-send pattern**
- Rationale: Actions don't support real-time subscriptions like queries do. Need manual refetch to see new messages.
- Implementation: useAIChat calls fetchMessages() after sendMessage completes.

**3. Optimistic UI updates**
- Rationale: Improve perceived performance by showing user's message immediately.
- Implementation: Add temporary message to state, replace with real data after refetch.

**4. Intersection Observer for scroll detection**
- Rationale: Only auto-scroll if user is actively at bottom (not reading history).
- Implementation: Track bottom visibility with 50px root margin, only scroll when intersecting.

**5. Removed `order` parameter**
- Issue: investorAssistant.listMessages API doesn't support order parameter (TypeScript error).
- Resolution: Messages come in natural order from API. Frontend can reverse if needed.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed TypeScript import path for Convex API**
- **Found during:** Task 3 (useAIChat hook creation)
- **Issue:** Used `@/convex/_generated/api` alias but tsconfig only defines `@/*` for `src/*`. Import failed.
- **Fix:** Changed to relative path `../../../../convex/_generated/api`
- **Files modified:** src/components/ai/hooks/useAIChat.ts
- **Verification:** `npx tsc --noEmit` passes
- **Committed in:** 2ae38ce (Task 3 commit)

**2. [Rule 3 - Blocking] Removed unsupported `order` parameter**
- **Found during:** Task 2 (Convex type checking)
- **Issue:** TypeScript error - `order` property doesn't exist on listMessages options
- **Fix:** Removed `order: "asc"` parameter, updated documentation
- **Files modified:** convex/ai/messages.ts
- **Verification:** `npx convex dev --once` passes
- **Committed in:** c2ff41c (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 blocking issues)
**Impact on plan:** Both fixes necessary to unblock task completion. No functional scope changes.

## Issues Encountered
None - all tasks completed as planned after resolving blocking TypeScript issues.

## User Setup Required
None - no external service configuration required. All dependencies are npm packages.

## Next Phase Readiness

**Ready for UI implementation:**
- ✅ Markdown rendering dependencies installed
- ✅ Message fetching action available
- ✅ Chat state management hook ready
- ✅ Smart scroll hook ready
- ✅ All TypeScript types pass

**Next steps:**
- Build AI chat UI components (message list, input, etc.)
- Integrate useAIChat and useSmartScroll hooks
- Render messages with react-markdown and syntax highlighting

**No blockers.** Foundation complete for conversational UI implementation.

---
*Phase: 41-conversational-ai-core*
*Completed: 2026-01-22*
