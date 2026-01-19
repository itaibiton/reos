---
phase: 27-global-discovery
plan: 02
subsystem: api
tags: [convex, trending, recommendations, time-decay, hacker-news-algorithm]

# Dependency graph
requires:
  - phase: 21
    provides: Posts table with engagement counters (likeCount, commentCount, saveCount)
  - phase: 25
    provides: userFollows table for friends-of-friends scoring
provides:
  - Trending posts query with time-decay scoring
  - Trending properties query with favorites/deals scoring
  - Suggested users (people to follow) recommendations
  - Suggested posts recommendations based on role
affects: [27-03, discovery-ui, global-feed]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Hacker News time-decay formula for trending scores
    - Friends-of-friends scoring pattern for recommendations
    - Role-based content filtering

key-files:
  created:
    - convex/trending.ts
    - convex/recommendations.ts
  modified: []

key-decisions:
  - "Time-decay formula: (P-1) / (T+2)^G with gravity 1.8"
  - "Trending windows: today (24h) and week (7d)"
  - "Properties scored: favorites + (deals * 2)"
  - "User recommendations: friends-of-friends (+2) and same-role (+1)"
  - "Post recommendations filtered to same-role users"

patterns-established:
  - "calculateTrendingScore helper for Hacker News-style time decay"
  - "Over-fetch then score/sort pattern for trending queries"
  - "Score map pattern for aggregating recommendation scores"

# Metrics
duration: 2min
completed: 2026-01-19
---

# Phase 27 Plan 02: Trending & Recommendations Backend Summary

**Hacker News time-decay trending algorithm for posts/properties, plus friends-of-friends and role-based user/post recommendations**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-19T16:00:41Z
- **Completed:** 2026-01-19T16:02:21Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Trending posts query using engagement velocity with time decay
- Trending properties scored by favorites and deal activity
- People to follow suggestions with friends-of-friends scoring
- Suggested posts filtered by same-role relevance

## Task Commits

Each task was committed atomically:

1. **Task 1: Create trending content queries** - `c6b47bf` (feat)
2. **Task 2: Create personalized recommendations queries** - `dff372e` (feat)

## Files Created/Modified
- `convex/trending.ts` - getTrendingPosts and getTrendingProperties with time-decay scoring
- `convex/recommendations.ts` - suggestedUsers and suggestedPosts with role-based filtering

## Decisions Made
- Used Hacker News formula (P-1)/(T+2)^G with gravity 1.8 for trending scores
- Properties weighted: deals count x2 vs favorites count x1
- User suggestions: friends-of-friends gets +2, same role gets +1
- Posts suggestions filtered to same-role users for relevance

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Backend queries ready for UI components in 27-03
- All four query types implemented and deployed
- Requires posts and follows data for meaningful results

---
*Phase: 27-global-discovery*
*Completed: 2026-01-19*
