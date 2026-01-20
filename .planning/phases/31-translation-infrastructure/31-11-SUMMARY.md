---
phase: 31-translation-infrastructure
plan: 11
subsystem: i18n
tags: [next-intl, translations, gap-closure]

# Dependency graph
requires:
  - phase: 31-01 to 31-07
    provides: Translation infrastructure and namespace patterns
provides:
  - Translated saved properties page
  - Translated edit questionnaire page
  - Gap closure for secondary translation issues
affects: [32-hebrew-translation]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - properties.saved namespace for saved properties UI
    - onboarding.editProfile namespace for edit profile flow

key-files:
  created: []
  modified:
    - messages/en.json
    - src/app/[locale]/(app)/properties/saved/page.tsx
    - src/app/[locale]/(app)/profile/investor/questionnaire/page.tsx

key-decisions:
  - "properties.saved namespace added alongside existing properties.save namespace"
  - "onboarding.editProfile nested under existing onboarding namespace"

patterns-established:
  - "ICU plural syntax for count formatting in saved properties"
  - "Locale-aware Link and useRouter from i18n/navigation"

# Metrics
duration: 5min
completed: 2026-01-20
---

# Phase 31 Plan 11: Gap Closure Page Translations Summary

**Translated 2 pages (saved properties, edit questionnaire) identified as missing translations in verification report**

## Performance

- **Duration:** 5 min
- **Started:** 2026-01-20T11:00:00Z
- **Completed:** 2026-01-20T11:05:00Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Added properties.saved namespace with title, count (ICU plural), and empty state translations
- Added onboarding.editProfile namespace with header and error state translations
- Translated saved properties page with empty state and count messages
- Translated edit questionnaire page with header, no-questionnaire state, and toast messages

## Task Commits

Each task was committed atomically:

1. **Task 1: Add missing translations to en.json** - `bb256ea` (feat)
2. **Task 2: Translate properties/saved/page.tsx** - `66be143` (feat)
3. **Task 3: Translate profile/investor/questionnaire/page.tsx** - `cd718f2` (feat)

## Files Created/Modified

- `messages/en.json` - Added properties.saved and onboarding.editProfile namespaces
- `src/app/[locale]/(app)/properties/saved/page.tsx` - Added translations for empty state and count
- `src/app/[locale]/(app)/profile/investor/questionnaire/page.tsx` - Added translations for header and error states

## Decisions Made

- **properties.saved namespace placement:** Added alongside existing properties.save namespace for organizational clarity
- **onboarding.editProfile nesting:** Nested under existing onboarding namespace since it's part of the onboarding flow
- **ICU plural syntax:** Used `{count, plural, =1 {property} other {properties}}` for grammatically correct count display

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All phase 31 plans complete (7 original + 4 gap closure = 11 total)
- Ready for Phase 32: Hebrew Translation
- Translation keys established for all user-facing strings

---
*Phase: 31-translation-infrastructure*
*Completed: 2026-01-20*
