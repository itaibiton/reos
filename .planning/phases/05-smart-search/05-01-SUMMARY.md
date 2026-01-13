---
phase: 05-smart-search
plan: 01
subsystem: api
tags: anthropic, claude, ai, search, nlp, convex-action

# Dependency graph
requires:
  - phase: 04-property-marketplace/04-02
    provides: Property schema, properties.list query with basic filters
provides:
  - parseSearchQuery Convex action for NL→filter parsing
  - PropertyFilters type for frontend consumption
  - Claude AI integration for "AI-powered" search feel
affects: [05-02 enhanced query, 05-03 search UI]

# Tech tracking
tech-stack:
  added:
    - "@anthropic-ai/sdk@0.71.2"
  patterns:
    - Convex action for external API calls (not query/mutation)
    - Graceful error handling with empty filter fallback

key-files:
  created:
    - convex/search.ts
  modified:
    - package.json

key-decisions:
  - "Claude 3 Haiku for search parsing (speed/cost efficiency)"
  - "Return empty filters on error (graceful fallback to show all)"
  - "Validate parsed values against known valid options"

patterns-established:
  - "Convex action pattern: external API calls in actions, not queries"
  - "AI parsing: system prompt with valid values, JSON response"

issues-created: []

# Metrics
duration: 12 min
completed: 2026-01-13
---

# Phase 5 Plan 1: AI Parser Setup Summary

**Claude AI integration with parseSearchQuery action for natural language to structured property filter conversion**

## Performance

- **Duration:** 12 min
- **Started:** 2026-01-13T18:57:22Z
- **Completed:** 2026-01-13T19:09:03Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Installed Anthropic SDK (`@anthropic-ai/sdk`) for Claude API access
- Created `parseSearchQuery` Convex action that parses natural language to PropertyFilters
- Configured environment for API key (convex/.env.local)
- Defined PropertyFilters type matching properties.list query args

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Anthropic SDK** - `1a0a35e` (chore)
2. **Task 2: Create parseSearchQuery action** - `a1b56eb` (feat)
3. **Task 3: Configure API key** - (user action, no commit needed)

## Files Created/Modified

- `convex/search.ts` - parseSearchQuery action with Claude AI integration
- `package.json` - Added @anthropic-ai/sdk dependency
- `convex/.env.local` - API key configuration (gitignored)

## Decisions Made

- Used Claude 3 Haiku model for parsing (faster, cheaper for simple task)
- Graceful error handling returns empty filters (allows fallback to all properties)
- Validate parsed city/propertyType against known valid values
- Use Convex action (not query) since external HTTP calls are needed

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - tasks completed as specified.

## Next Phase Readiness

- parseSearchQuery action ready for use
- PropertyFilters type exported for frontend consumption
- Ready for 05-02-PLAN.md: Enhanced Property Query (extend properties.list with full filter support)

---
*Phase: 05-smart-search*
*Completed: 2026-01-13*
