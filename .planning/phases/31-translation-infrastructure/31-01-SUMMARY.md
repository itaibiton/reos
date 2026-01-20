---
phase: 31-translation-infrastructure
plan: 01
subsystem: i18n
tags: [next-intl, translation, constants, labelKey]

# Dependency graph
requires:
  - phase: 28
    provides: next-intl configuration and locale routing
provides:
  - common translation namespace with shared strings
  - labelKey pattern for constants
  - specializations translations for all provider types
affects: [32-component-translation, 33-page-translation, 34-hebrew-translation]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - labelKey pattern for translatable constants
    - Nested translation namespace organization

key-files:
  created: []
  modified:
    - messages/en.json
    - src/lib/constants.ts

key-decisions:
  - "16 categories in common namespace (actions, status, labels, etc.)"
  - "labelKey pattern replaces hardcoded labels in constants"
  - "descriptionKey for options with descriptions (riskTolerance, timeline)"

patterns-established:
  - "common.* namespace for shared UI strings"
  - "constants use labelKey instead of label for i18n"

# Metrics
duration: 3min
completed: 2026-01-20
---

# Phase 31 Plan 01: Common Namespace & Constants Translation Keys

**Common translation namespace with 16 categories (actions, status, roles, amenities, etc.) and labelKey pattern in constants.ts**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-20T05:45:25Z
- **Completed:** 2026-01-20T05:48:18Z
- **Tasks:** 3
- **Files modified:** 2

## Accomplishments

- Created common namespace with 16 categories of shared translations
- Updated all constants arrays to use labelKey pattern (54 entries)
- Added specializations translations for broker, mortgageAdvisor, lawyer
- Zero hardcoded labels remain in constants.ts

## Task Commits

Each task was committed atomically:

1. **Task 1: Add common namespace to en.json** - `5b11520` (feat)
2. **Task 2: Update constants.ts with labelKey pattern** - `1f2f020` (feat)
3. **Task 3: Add specializations to common namespace** - `adf604a` (feat)

## Files Created/Modified

- `messages/en.json` - Added common namespace with actions, status, labels, empty, errors, confirm, propertyTypes, propertyStatus, roles, amenities, riskTolerance, investmentTimeline, languages, contactPreferences, units, specializations
- `src/lib/constants.ts` - Replaced all hardcoded labels with labelKey references pointing to common.* translation keys

## Decisions Made

- 16 categories in common namespace to cover all shared UI strings
- labelKey pattern for simple labels, descriptionKey for options with descriptions
- Nested structure for risk tolerance and investment timeline (label + description)
- Specializations grouped by provider type (broker, mortgageAdvisor, lawyer)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Common namespace ready for component translations
- Ready for 31-02-PLAN.md (page-specific namespaces)

---
*Phase: 31-translation-infrastructure*
*Completed: 2026-01-20*
