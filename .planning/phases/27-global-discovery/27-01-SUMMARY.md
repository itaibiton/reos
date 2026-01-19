---
phase: 27-global-discovery
plan: 01
subsystem: database, api
tags: [convex, search, full-text-search, autocomplete, search-history]

# Dependency graph
requires:
  - phase: 21-social-feed
    provides: posts table with content field
  - phase: 26-user-profiles
    provides: users table with name field, profiles for enrichment
provides:
  - Search indexes on posts, users, and properties tables
  - Unified globalSearch query for cross-table search
  - Search history storage with deduplication
affects: [27-02-search-ui, future search features]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Convex search indexes with filterFields
    - Parallel Promise.all for multi-table search
    - Upsert pattern for search history deduplication
    - Auto-prune pattern for limiting history entries

key-files:
  created:
    - convex/globalSearch.ts
    - convex/searchHistory.ts
  modified:
    - convex/schema.ts

key-decisions:
  - "Search indexes use single searchField per Convex constraint (title for properties, content for posts, name for users)"
  - "Autocomplete returns 5 results per category, full search returns 20"
  - "Search history limited to 20 entries per user with auto-pruning"
  - "Query deduplication uses case-insensitive comparison"

patterns-established:
  - "withSearchIndex pattern: q.search('field', query).eq('filter', value)"
  - "Search result enrichment: parallel fetch author/property details"
  - "History upsert: update timestamp if query exists, insert if new"

# Metrics
duration: 3min
completed: 2026-01-19
---

# Phase 27 Plan 01: Global Discovery Search Backend Summary

**Full-text search indexes on posts/users/properties with unified search query and server-side search history**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-19T18:00:50Z
- **Completed:** 2026-01-19T18:03:00Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- Added search indexes to posts (content), users (name), and properties (title) tables
- Created unified globalSearch.ts with autocomplete and full results queries
- Implemented search history with deduplication and 20-entry limit per user
- All queries authenticated and return empty for unauthenticated users

## Task Commits

Each task was committed atomically:

1. **Task 1: Add search indexes and searchHistory table to schema** - `224e820` (feat)
2. **Task 2: Create unified global search queries** - `de4cac2` (feat)
3. **Task 3: Create search history mutations and queries** - `21bb23e` (feat)

## Files Created/Modified
- `convex/schema.ts` - Added search indexes on posts, users, properties; added searchHistory table
- `convex/globalSearch.ts` - Unified search query (autocomplete) and searchFull query (results page)
- `convex/searchHistory.ts` - saveSearch, getRecentSearches, deleteSearch, clearSearchHistory mutations/queries

## Decisions Made
- Used single searchField per index (Convex constraint) - title for properties is most searchable
- Autocomplete limit of 5 per category provides fast dropdown without overwhelming
- Search history deduplication uses case-insensitive comparison to avoid "Tel Aviv" and "tel aviv" duplicates
- History auto-prunes to 20 entries to prevent unbounded growth

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Search backend ready for UI implementation in 27-02
- globalSearch.search returns grouped results for autocomplete dropdown
- globalSearch.searchFull returns enriched results for search results page
- searchHistory provides recent searches for autocomplete suggestions

---
*Phase: 27-global-discovery*
*Completed: 2026-01-19*
