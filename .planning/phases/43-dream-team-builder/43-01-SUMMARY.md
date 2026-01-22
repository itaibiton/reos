---
phase: 43-dream-team-builder
plan: 01
subsystem: ai
tags: [convex, ai-agent, provider-search, rag, zod, createTool]

# Dependency graph
requires:
  - phase: 42-property-recommendations
    provides: Property search tool pattern, agent infrastructure
provides:
  - Provider search query with multi-criteria filtering
  - Provider search tool for AI agent
  - Agent instructions for provider recommendations
  - Proactive team building prompts (TEAM-06)
affects: [43-02, 43-03, provider-ui, team-management]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Provider search follows property search pattern (query + tool)"
    - "Grouped results by role (providersByRole structure)"
    - "Proactive prompts after property recommendations"

key-files:
  created:
    - convex/ai/tools/providerQueries.ts
    - convex/ai/tools/providerSearch.ts
  modified:
    - convex/ai/agent.ts

key-decisions:
  - "Use userId as provider identifier (for team management integration)"
  - "Cap maxPerRole at 5 providers to avoid overwhelming chat"
  - "Return searchCriteria in tool results for UI match badge computation"
  - "Proactive team prompt after EVERY property recommendation (TEAM-06)"

patterns-established:
  - "Multi-role search: loop through roles, call query for each, group results"
  - "Provider enrichment: user info + ratings + deal counts in single query"
  - "Example-driven instructions: concrete match explanation templates"

# Metrics
duration: 4min
completed: 2026-01-22
---

# Phase 43 Plan 01: Provider Search Tool Summary

**Provider search query with multi-criteria filtering and AI tool with proactive team building prompts**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-22T19:48:00Z
- **Completed:** 2026-01-22T19:52:00Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- Created provider search query with role/areas/languages filtering and profile enrichment
- Created AI tool definition with Zod schema and providersByRole grouped structure
- Registered tool in agent with comprehensive provider recommendation instructions
- Added proactive team building prompts (TEAM-06) after property recommendations

## Task Commits

Each task was committed atomically:

1. **Task 1: Create provider search query** - `b4784a8` (feat)
2. **Task 2: Create provider search tool** - `38c561f` (feat)
3. **Task 3: Register tool and update agent instructions** - `b64f51a` (feat)

## Files Created/Modified
- `convex/ai/tools/providerQueries.ts` - Multi-criteria provider search with profile enrichment
- `convex/ai/tools/providerSearch.ts` - AI tool definition with Zod schema
- `convex/ai/agent.ts` - Tool registration and provider recommendation instructions

## Decisions Made
- Used userId as provider identifier (not profile._id) for team management integration
- Capped maxPerRole at 5 providers to keep chat responses manageable
- Included searchCriteria in tool results for future UI match badge computation
- Added explicit example match explanations in agent instructions (same pattern as properties)

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Provider search tool ready for UI integration (43-02)
- Agent can search and recommend providers with match explanations
- Proactive team building prompts will appear after property recommendations

---
*Phase: 43-dream-team-builder*
*Completed: 2026-01-22*
