---
phase: 06-deal-flow
plan: 02
subsystem: backend
tags: [convex, service-requests, provider-matching, crud]

# Dependency graph
requires:
  - phase: 06-01
    provides: deals table with stages and provider assignment fields
provides:
  - serviceRequests table for tracking provider requests
  - Request workflow (create, respond, cancel)
  - Provider recommendation based on property city
  - Provider search queries (listByType, getWithUser)
affects: [06-deal-flow, ui-providers, notifications]

# Tech tracking
tech-stack:
  added: []
  patterns: [request-response-workflow, city-based-matching]

key-files:
  created:
    - convex/serviceRequests.ts
  modified:
    - convex/schema.ts
    - convex/serviceProviderProfiles.ts

key-decisions:
  - "Request status as union type (pending, accepted, declined, cancelled)"
  - "Automatic stage advancement when broker accepts (interest -> broker_assigned)"
  - "City-based provider matching using serviceAreas array"

patterns-established:
  - "Request workflow: create -> respond (accept/decline) or cancel"
  - "Provider assignment via service request acceptance"

issues-created: []

# Metrics
duration: ~5min
completed: 2026-01-15
---

# Phase 6 Plan 02: Service Provider Request Flow Summary

**Implemented investor-to-provider request workflow with automatic deal assignment and stage advancement on acceptance.**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-01-15T06:07:38Z
- **Completed:** 2026-01-15T06:12:00Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- Created serviceRequests table with status tracking and provider type
- Built complete request workflow: investors request, providers respond, optional cancel
- Provider acceptance automatically assigns provider to deal and advances stage
- Added provider search queries for "Find a Provider" UI with city filtering

## Task Commits

Each task was committed atomically:

1. **Task 1: Add serviceRequests table to schema** - `9113d65` (feat)
2. **Task 2: Create serviceRequests CRUD with request workflow** - `c529879` (feat)
3. **Task 3: Add provider search queries** - `44e7457` (feat)

## Files Created/Modified
- `convex/schema.ts` - Added requestStatus union type and serviceRequests table
- `convex/serviceRequests.ts` - New file with queries (listForProvider, listForDeal, getRecommendedProviders) and mutations (create, respond, cancel)
- `convex/serviceProviderProfiles.ts` - Added listByType and getWithUser queries

## Decisions Made
- Request status uses 4-state union: pending, accepted, declined, cancelled
- Provider acceptance auto-assigns to deal (brokerId/mortgageAdvisorId/lawyerId field)
- Broker acceptance advances deal from "interest" to "broker_assigned" stage
- Provider recommendations match property city to provider serviceAreas
- listByType uses case-insensitive city matching

## Deviations from Plan

None - plan executed exactly as written

## Issues Encountered
None

## Next Phase Readiness
- Service request workflow complete, ready for UI integration
- Ready for 06-03-PLAN.md (File storage per deal)

---
*Phase: 06-deal-flow*
*Completed: 2026-01-15*
