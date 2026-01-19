---
phase: 21-feed-infrastructure
plan: 01
subsystem: database
tags: [convex, social-feed, posts, pagination, discriminated-union]

# Dependency graph
requires:
  - phase: 20-settings-availability
    provides: "User and service provider tables for author references"
provides:
  - posts table with discriminated union for post types
  - postLikes, postSaves, userFollows supporting tables
  - Post creation mutations (property, service request, discussion)
  - Paginated feed queries (global, user, following)
  - Visibility enforcement helper (canViewPost)
affects: [22-feed-display, 23-interactions, 24-user-profiles]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Discriminated union schema with postType field"
    - "Denormalized counters (likeCount, commentCount, etc.)"
    - "In-memory filtering after pagination"
    - "canViewPost visibility helper pattern"

key-files:
  created:
    - convex/posts.ts
  modified:
    - convex/schema.ts

key-decisions:
  - "Single posts table with postType discriminator (not separate tables per type)"
  - "Denormalized engagement counters for fast display"
  - "In-memory filtering after pagination acceptable (Convex single-index constraint)"
  - "Visibility helper uses switch pattern for extensibility"

patterns-established:
  - "Post type discriminated union: property_listing | service_request | discussion"
  - "Post visibility union: public | followers_only | deal_participants"
  - "enrichPost helper for consistent post enrichment"
  - "canViewPost visibility check pattern"

# Metrics
duration: 3min
completed: 2026-01-19
---

# Phase 21 Plan 01: Feed Infrastructure Schema Summary

**Discriminated union posts schema with 4 tables (posts, postLikes, postSaves, userFollows), creation mutations for 3 post types, and paginated feed queries with visibility enforcement**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-19T11:12:42Z
- **Completed:** 2026-01-19T11:15:10Z
- **Tasks:** 3
- **Files modified:** 2

## Accomplishments

- Created posts table with discriminated union schema (property_listing, service_request, discussion)
- Added supporting tables: postLikes, postSaves, userFollows with proper indexes
- Implemented 3 post creation mutations with validation
- Built 4 feed queries: globalFeed, userFeed, followingFeed, getPost
- Created canViewPost visibility helper enforcing access rules

## Task Commits

Each task was committed atomically:

1. **Task 1: Add feed infrastructure tables to schema** - `6ac4cd1` (feat)
2. **Task 2: Create posts.ts with creation mutations and feed queries** - `5b7a5e6` (feat)
3. **Task 3: Add followingFeed query with visibility helper** - `fa3721a` (feat)

## Files Created/Modified

- `convex/schema.ts` - Added postType, postVisibility, serviceTypeForPost unions; posts, postLikes, postSaves, userFollows tables
- `convex/posts.ts` - New file with enrichPost helper, canViewPost helper, 3 mutations, 4 queries

## Decisions Made

1. **Single posts table with discriminator** - Simpler than separate tables, enables unified feed queries, matches existing REOS union patterns
2. **Denormalized counters on posts** - likeCount, commentCount, shareCount, saveCount stored on post document to avoid expensive aggregation queries
3. **In-memory filtering for following feed** - Acceptable per Convex single-index constraint; query public posts then filter by followed users
4. **Switch pattern for visibility helper** - Extensible pattern allows easy addition of new visibility types

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Schema foundation complete with 4 tables deployed
- Post creation mutations ready for UI integration
- Feed queries support pagination via usePaginatedQuery
- Ready for Plan 02 to add interaction mutations (like, save, follow)

---
*Phase: 21-feed-infrastructure*
*Completed: 2026-01-19*
