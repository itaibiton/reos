---
phase: 28-i18n-infrastructure
plan: 01
subsystem: i18n
tags: [next-intl, radix-direction, rtl, middleware, clerk]

# Dependency graph
requires:
  - phase: 27-discovery-recommendations
    provides: Complete social feed with search and discovery
provides:
  - next-intl v4 routing configuration (en/he locales)
  - Locale-aware navigation APIs (Link, redirect, useRouter, usePathname)
  - Composed Clerk + next-intl middleware for auth + i18n
  - @radix-ui/react-direction for RTL context support
affects: [28-02 route restructure, 29 RTL layout, 31 translations]

# Tech tracking
tech-stack:
  added: [next-intl@4.7.0, @radix-ui/react-direction@1.1.1]
  patterns: [Clerk middleware composition, localePrefix always]

key-files:
  created:
    - src/i18n/routing.ts
    - src/i18n/navigation.ts
    - src/i18n/request.ts
  modified:
    - next.config.ts
    - middleware.ts
    - package.json

key-decisions:
  - "localePrefix: 'always' for URLs always including /en/ or /he/ prefix"
  - "Clerk middleware wraps outer, returns intlMiddleware from handler"
  - "Protected route patterns include :locale prefix for all (app) routes"

patterns-established:
  - "Pattern: Middleware composition - clerkMiddleware wraps and returns intlMiddleware"
  - "Pattern: Route patterns with :locale prefix for protected routes"
  - "Pattern: i18n config files in src/i18n/ directory"

# Metrics
duration: 4min
completed: 2026-01-19
---

# Phase 28 Plan 01: i18n Infrastructure Summary

**next-intl v4 with Clerk middleware composition for en/he locale routing and @radix-ui/react-direction for RTL context**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-19T23:23:00Z
- **Completed:** 2026-01-19T23:27:00Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments

- Installed next-intl v4.7.0 and @radix-ui/react-direction v1.1.1
- Created i18n configuration with en/he locales and 'always' prefix
- Composed Clerk authentication middleware with next-intl locale handling
- Configured protected route patterns with locale prefix support

## Task Commits

Each task was committed atomically:

1. **Task 1: Install i18n dependencies** - `b033260` (chore)
2. **Task 2: Create i18n configuration files** - `921978e` (feat)
3. **Task 3: Update next.config.ts and compose middleware** - `01bb8c3` (feat)

## Files Created/Modified

- `src/i18n/routing.ts` - Central routing config with locales and prefix settings
- `src/i18n/navigation.ts` - Locale-aware Link, redirect, usePathname, useRouter, getPathname
- `src/i18n/request.ts` - Server-side request locale configuration
- `next.config.ts` - Added createNextIntlPlugin wrapper
- `middleware.ts` - Composed Clerk with next-intl middleware
- `package.json` - Added next-intl and @radix-ui/react-direction dependencies

## Decisions Made

1. **localePrefix: 'always'** - URLs always include /en/ or /he/ prefix. Cleaner implementation, avoids Link hydration edge cases that occur with 'as-needed'.
2. **Clerk outer, intl inner** - clerkMiddleware wraps and returns intlMiddleware result. This is the documented Clerk composition pattern.
3. **Protected routes with :locale** - All (app) route patterns include `:locale` prefix to match locale-aware URLs.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Plan 02:** Route structure migration to [locale] segment
- i18n middleware configured and routing set up
- Navigation APIs exported and ready for use
- Messages loading deferred to Phase 31 (Translation Infrastructure)

**Note:** App won't run correctly yet - Plan 02 restructures the app directory to use [locale] segment with DirectionProvider.

---
*Phase: 28-i18n-infrastructure*
*Completed: 2026-01-19*
