---
phase: 02-authentication
plan: 02
subsystem: auth
tags: [convex, schema, users, roles, sync]

# Dependency graph
requires:
  - phase: 02-01
    provides: Clerk + Convex integration, auth.config.ts
provides:
  - Users table in Convex with role support
  - User sync functions (getOrCreateUser, getCurrentUser, setUserRole)
  - useCurrentUser React hook
affects: [02-03, all-authenticated-features]

# Tech tracking
tech-stack:
  added: []
  patterns: [convex-user-sync, auto-create-on-signin, role-based-access]

key-files:
  created:
    - convex/users.ts
    - src/hooks/useCurrentUser.ts
  modified:
    - convex/schema.ts

key-decisions:
  - "Role is optional until onboarding complete"
  - "Auto-sync user from Clerk on first authenticated access"
  - "Use useConvexAuth (not Clerk's useAuth) in hooks"

patterns-established:
  - "User sync happens via useCurrentUser hook effect"
  - "Convex functions check ctx.auth.getUserIdentity() for auth"
  - "Role enum: investor, broker, mortgage_advisor, lawyer"

issues-created: []

# Metrics
duration: 5min
completed: 2026-01-13
---

# Phase 2 Plan 2: User Schema + Sync Summary

**Created users table in Convex with role support and auto-sync from Clerk on first sign-in.**

## Accomplishments

- Created users table schema with clerkId, email, name, imageUrl, role, onboardingComplete
- Added indexes for efficient lookups: by_clerk_id, by_email, by_role
- Implemented getOrCreateUser mutation for Clerk → Convex sync
- Implemented getCurrentUser query for fetching authenticated user
- Implemented setUserRole mutation for onboarding flow
- Created useCurrentUser React hook with auto-sync behavior

## Files Created/Modified

- `convex/schema.ts` - Added users table with role enum and indexes
- `convex/users.ts` - User sync functions (getOrCreateUser, getCurrentUser, setUserRole)
- `src/hooks/useCurrentUser.ts` - React hook for user state with auto-sync

## Decisions Made

- Role is optional (undefined) until user completes onboarding and selects role
- User auto-created in Convex on first authenticated access via useCurrentUser hook
- Four roles defined: investor, broker, mortgage_advisor, lawyer

## Issues Encountered

None - plan executed as specified.

## Next Step

Ready for 02-03-PLAN.md: Protected routes and auth UI
