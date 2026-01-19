---
phase: 21-feed-infrastructure
plan: 02
subsystem: database
tags: [convex, social-interactions, likes, saves, follows, mutations]

# Dependency graph
requires:
  - phase: 21-feed-infrastructure/01
    provides: "posts table with likeCount/saveCount counters, postLikes/postSaves/userFollows tables"
provides:
  - likePost/unlikePost mutations with atomic counter updates
  - savePost/unsavePost mutations with atomic counter updates
  - isLikedByUser/isSavedByUser status queries
  - getSavedPosts paginated query
  - followUser/unfollowUser mutations
  - isFollowing/getFollowers/getFollowing queries
  - getFollowCounts query for profile stats
affects: [22-feed-display, 23-interactions, 24-user-profiles]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Idempotent mutations (calling twice has same effect as once)"
    - "Atomic counter updates with Math.max(0, ...) to prevent negatives"
    - "Compound index lookups for fast status checks"

key-files:
  created:
    - convex/userFollows.ts
  modified:
    - convex/posts.ts

key-decisions:
  - "Idempotent mutations return early if already in target state"
  - "Math.max(0, count - 1) prevents negative counters"
  - "All status checks return boolean for simple UI binding"
  - "getFollowers/getFollowing return enriched user info (name, imageUrl, role)"

patterns-established:
  - "Idempotent social action pattern: check existing, return early or perform action"
  - "Atomic counter update pattern: get current value, patch with increment/decrement"
  - "Status check query pattern: return false for unauthenticated, boolean for result"

# Metrics
duration: 4min
completed: 2026-01-19
---

# Phase 21 Plan 02: Social Interactions Summary

**Idempotent like/save/follow mutations with atomic counter updates and status check queries for post engagement and user following**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-19T13:17:00Z
- **Completed:** 2026-01-19T13:19:00Z
- **Tasks:** 3
- **Files modified:** 2

## Accomplishments

- Added likePost/unlikePost mutations with atomic likeCount updates
- Added savePost/unsavePost mutations with atomic saveCount updates
- Created userFollows.ts with follow/unfollow mutations and queries
- Implemented getSavedPosts paginated query for saved post retrieval
- Added status check queries: isLikedByUser, isSavedByUser, isFollowing
- Added getFollowCounts for profile follower/following display

## Task Commits

Each task was committed atomically:

1. **Task 1: Add like/unlike mutations with atomic counter updates** - `111d34b` (feat)
2. **Task 2: Add save/unsave mutations with atomic counter updates** - `a508458` (feat)
3. **Task 3: Create userFollows.ts with follow/unfollow mutations** - `06ea7af` (feat)

## Files Created/Modified

- `convex/posts.ts` - Added likePost, unlikePost, isLikedByUser, savePost, unsavePost, isSavedByUser, getSavedPosts
- `convex/userFollows.ts` - New file with followUser, unfollowUser, isFollowing, getFollowers, getFollowing, getFollowCounts

## Decisions Made

1. **Idempotent mutations** - All social actions return early if already in target state, enabling safe UI double-clicks
2. **Math.max(0, ...) for decrements** - Prevents counter from going negative if data becomes inconsistent
3. **Boolean status queries** - Simple true/false returns for easy UI binding (e.g., filled vs outline heart icon)
4. **Enriched follower/following lists** - Include name, imageUrl, role for direct UI rendering without additional queries

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All social interaction mutations complete and deployed
- Status queries ready for UI integration in feed cards
- getSavedPosts enables "Saved" tab in user profile
- Follow system ready for user profile pages and following feed
- Ready for Phase 22 (Post Creation UI) to build forms using these mutations

---
*Phase: 21-feed-infrastructure*
*Completed: 2026-01-19*
