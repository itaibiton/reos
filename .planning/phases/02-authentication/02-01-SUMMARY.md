---
phase: 02-authentication
plan: 01
subsystem: auth
tags: [clerk, convex, authentication, jwt]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Next.js, Convex, layout structure
provides:
  - Clerk authentication installed
  - ConvexProviderWithClerk integration
  - JWT auth config synced to Convex
affects: [02-02, 02-03, all-protected-routes]

# Tech tracking
tech-stack:
  added: ["@clerk/nextjs"]
  patterns: [clerk-convex-integration, jwt-auth-config]

key-files:
  created:
    - middleware.ts
    - convex/auth.config.ts
  modified:
    - src/app/ConvexClientProvider.tsx
    - src/app/layout.tsx

key-decisions:
  - "ConvexProviderWithClerk replaces basic ConvexProvider"
  - "JWT template named 'convex' in Clerk Dashboard"
  - "CLERK_JWT_ISSUER_DOMAIN stored in Convex env vars"

patterns-established:
  - "ClerkProvider wraps ConvexClientProvider in layout"
  - "Use useConvexAuth() for auth state (not Clerk's useAuth)"

issues-created: []

# Metrics
duration: 8min
completed: 2026-01-13
---

# Phase 2 Plan 1: Clerk + Convex Integration Summary

**Installed Clerk authentication and integrated with Convex using ConvexProviderWithClerk for seamless JWT auth.**

## Accomplishments

- Installed @clerk/nextjs package
- Created Clerk middleware for route protection
- Created convex/auth.config.ts with Clerk JWT provider
- Updated ConvexClientProvider to use ConvexProviderWithClerk
- Wrapped root layout with ClerkProvider
- Synced auth config to Convex backend

## Files Created/Modified

- `middleware.ts` - Clerk middleware for auth route matching
- `convex/auth.config.ts` - JWT provider config pointing to Clerk issuer domain
- `src/app/ConvexClientProvider.tsx` - Now uses ConvexProviderWithClerk with useAuth
- `src/app/layout.tsx` - Wrapped with ClerkProvider

## Decisions Made

- Used ConvexProviderWithClerk pattern (recommended by Convex docs)
- JWT template must be named "convex" in Clerk Dashboard
- CLERK_JWT_ISSUER_DOMAIN stored in Convex environment variables (not just local)

## Issues Encountered

- Convex requires CLERK_JWT_ISSUER_DOMAIN in its dashboard environment variables, not just local .env.local
- Resolution: Added env var to Convex dashboard at settings/environment-variables

## Next Step

Ready for 02-02-PLAN.md: User schema and sync functions
