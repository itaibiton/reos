---
phase: 28-i18n-infrastructure
plan: 02
subsystem: i18n
tags: [next-intl, rtl, radix-direction, heebo-font, locale-routing]

# Dependency graph
requires:
  - phase: 28-01
    provides: i18n configuration files (routing.ts, navigation.ts, request.ts)
provides:
  - Locale-aware app structure under [locale] segment
  - DirectionProvider for RTL context in Radix components
  - Heebo font for Hebrew text rendering
  - Locale-prefixed ClerkProvider URLs
affects: [28-03-rtl-css, 28-04-translation, 31-translation-infrastructure]

# Tech tracking
tech-stack:
  added: [heebo-font]
  patterns: [locale-segment-routing, direction-provider-wrapping]

key-files:
  created:
    - src/app/[locale]/layout.tsx
  modified:
    - src/app/[locale]/(app)/layout.tsx
    - src/app/globals.css
    - 20 page files (convex import paths)

key-decisions:
  - "DirectionProvider wraps children inside ConvexClientProvider"
  - "ClerkProvider URLs include locale prefix for auth flows"
  - "Heebo font added as fallback in --font-sans for Hebrew text"
  - "Locale-aware navigation used in (app) layout for automatic prefix handling"

patterns-established:
  - "Pattern: locale-aware root layout with generateStaticParams for static rendering"
  - "Pattern: direction derived from locale (he=rtl, default=ltr)"
  - "Pattern: import useRouter/usePathname from @/i18n/navigation for locale-aware routing"

# Metrics
duration: 4min
completed: 2026-01-19
---

# Phase 28 Plan 02: Route Structure Migration Summary

**Locale-aware app structure with [locale] segment, DirectionProvider for RTL context, and Heebo font for Hebrew rendering**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-19T21:25:39Z
- **Completed:** 2026-01-19T21:29:00Z
- **Tasks:** 3
- **Files modified:** 24

## Accomplishments
- Migrated all route groups (app), (auth), (main) under [locale] dynamic segment
- Created locale-aware root layout with DirectionProvider wrapping
- Added Heebo font for Hebrew-Latin text support
- Updated (app) layout to use locale-aware navigation hooks

## Task Commits

Each task was committed atomically:

1. **Task 1: Create [locale] directory structure and move route groups** - `51c989c` (chore)
2. **Task 2: Create locale-aware root layout with DirectionProvider** - `beb2cc2` (feat)
3. **Task 3: Update (app) layout for locale-aware navigation** - `6876aca` (feat)

## Files Created/Modified
- `src/app/[locale]/layout.tsx` - New locale-aware root layout with DirectionProvider
- `src/app/[locale]/ConvexClientProvider.tsx` - Moved from src/app/
- `src/app/[locale]/(app)/layout.tsx` - Updated with locale-aware navigation
- `src/app/globals.css` - Added Heebo to font stack
- `src/app/(app)/`, `src/app/(auth)/`, `src/app/(main)/` - Moved under [locale]
- 20 page files - Fixed convex import paths

## Decisions Made
- **DirectionProvider position:** Wraps children inside ConvexClientProvider, outside NextIntlClientProvider
- **Heebo font fallback:** Added to --font-sans as fallback after Inter for Hebrew text
- **ClerkProvider locale URLs:** All auth URLs include `/${locale}/` prefix
- **generateStaticParams:** Pre-renders all locale paths for static optimization

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed convex/_generated import paths after directory move**
- **Found during:** Task 2 (TypeScript compilation check)
- **Issue:** Moving route groups under [locale] added one directory level, breaking relative imports to convex/_generated
- **Fix:** Added one additional `../` to import paths in 21 files (layout + 20 page files)
- **Files modified:** All files under src/app/[locale]/(app)/ with convex imports
- **Verification:** TypeScript compilation passes
- **Committed in:** 6876aca (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential for TypeScript compilation. No scope creep.

## Issues Encountered
None - plan executed as specified.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Locale routing infrastructure complete
- Routes accessible at /en/... and /he/...
- RTL direction context available via DirectionProvider
- Ready for Phase 28-03: RTL CSS migration

---
*Phase: 28-i18n-infrastructure*
*Completed: 2026-01-19*
