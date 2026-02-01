---
phase: 62-context-awareness-help-guidance
plan: 02
subsystem: ui
tags: [react-hooks, context-detection, i18n, next-intl, suggested-prompts, ai-assistant]

# Dependency graph
requires:
  - phase: 62-01
    provides: "Backend pageContext parameter in sendMessage and buildPageContext query"
  - phase: 61-02
    provides: "AIAssistantPanel with Sheet/Drawer pattern and useAIAssistantChat hook"
  - phase: 61-03
    provides: "StreamingChatMessageList and AIChatInput components"
provides:
  - "usePageContext hook parsing URL into PageContext (pageType, entityType, entityId)"
  - "useSuggestedPrompts hook returning translated prompts by page type"
  - "SuggestedPrompts component rendering clickable prompt chips"
  - "Page context sent with every AI message automatically"
  - "30+ suggested prompts translated in English and Hebrew"
affects: [63-tool-execution-ui, 64-memory-search, 65-proactive-suggestions]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Ref pattern for fresh data in stable callbacks (pageContextRef)"
    - "Route-to-context mapping via regex matching with specificity ordering"
    - "Prompt key lookup tables mapping pageType to translation keys"

key-files:
  created:
    - src/components/ai/hooks/usePageContext.ts
    - src/components/ai/hooks/useSuggestedPrompts.ts
    - src/components/ai/SuggestedPrompts.tsx
  modified:
    - src/components/ai/hooks/useAIAssistantChat.ts
    - src/components/ai/AIAssistantPanel.tsx
    - messages/en.json
    - messages/he.json

key-decisions:
  - "Ref pattern for pageContext in useAIAssistantChat keeps sendMessage callback stable"
  - "useMemo on pathname+params in usePageContext avoids unnecessary recomputation"
  - "Specific sub-paths checked before generic startsWith to prevent false route matches"
  - "Dashboard prompts used as fallback for unknown page types"

patterns-established:
  - "Route-to-context pattern: URL parsed into structured PageContext for backend consumption"
  - "Prompt chip pattern: contextual suggestions shown only on empty conversations"

# Metrics
duration: 3min
completed: 2026-02-01
---

# Phase 62 Plan 02: Frontend Context Detection + Suggested Prompts Summary

**usePageContext hook detecting 20+ route patterns, useSuggestedPrompts with 30+ translated prompts, and SuggestedPrompts chips wired into AIAssistantPanel with stable pageContext ref**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-01T12:18:26Z
- **Completed:** 2026-02-01T12:21:26Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- usePageContext hook parses current URL into PageContext with pageType, entityType, and entityId for 20+ route patterns
- useAIAssistantChat now includes pageContext in every sendMessage call via a ref pattern that keeps the callback stable
- SuggestedPrompts component renders clickable prompt chips above the input when conversation is empty
- 30+ suggested prompt strings translated in both English and Hebrew across 10 page types (property_detail, deal_detail, dashboard, etc.)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create usePageContext and useSuggestedPrompts hooks** - `f7ca050` (feat)
2. **Task 2: Wire pageContext, SuggestedPrompts, panel update, i18n** - `27732fd` (feat)

## Files Created/Modified
- `src/components/ai/hooks/usePageContext.ts` - Hook parsing pathname/params into PageContext with all documented route patterns
- `src/components/ai/hooks/useSuggestedPrompts.ts` - Hook returning translated prompt strings by pageType with dashboard fallback
- `src/components/ai/SuggestedPrompts.tsx` - Clickable prompt chips component with RTL support
- `src/components/ai/hooks/useAIAssistantChat.ts` - Modified to accept PageContext and send with every message via ref
- `src/components/ai/AIAssistantPanel.tsx` - Wired usePageContext, useSuggestedPrompts, SuggestedPrompts into AssistantChatContent
- `messages/en.json` - Added aiAssistant.suggestions with 30+ English prompt strings
- `messages/he.json` - Added aiAssistant.suggestions with 30+ Hebrew prompt strings

## Decisions Made
- Used ref pattern (pageContextRef) for pageContext in useAIAssistantChat to avoid destabilizing the sendMessage callback on every navigation. The ref is updated via useEffect, and the callback reads from ref.current when invoked.
- Specific sub-paths checked before generic startsWith patterns (e.g., /properties/saved before /properties/[id]) to prevent "saved" being treated as an entity ID.
- Dashboard prompts used as fallback for unknown page types, ensuring users always see something helpful.
- useMemo wrapping the route matching logic, keyed on pathname and params, to avoid unnecessary recomputation.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Phase 62 complete: backend context resolution (62-01) + frontend context detection and suggested prompts (62-02)
- The AI assistant now detects what page the user is on and sends context with every message
- Suggested prompts appear contextually when conversations are empty
- Ready for Phase 63 (tool execution UI) which builds on the streaming and context foundation

---
*Phase: 62-context-awareness-help-guidance*
*Completed: 2026-02-01*
