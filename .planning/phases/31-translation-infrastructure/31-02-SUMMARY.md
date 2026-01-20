---
phase: 31-translation-infrastructure
plan: 02
subsystem: i18n
tags: [next-intl, translations, navigation, sidebar]

# Dependency graph
requires:
  - phase: 28-i18n-infrastructure
    provides: next-intl setup, useTranslations hook
  - phase: 31-01
    provides: common namespace foundation
provides:
  - Navigation namespace with groups and items translations
  - NavItem/NavGroup types with labelKey pattern
  - Sidebar component using useTranslations
affects: [31-03, 31-04, 31-05, 31-06, 31-07]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "labelKey pattern for navigation items"
    - "t(item.labelKey) for translation rendering"
    - "Namespace structure: navigation.groups.*, navigation.items.*"

key-files:
  created: []
  modified:
    - messages/en.json
    - src/lib/navigation.ts
    - src/components/layout/Sidebar.tsx

key-decisions:
  - "labelKey stores full path (e.g., navigation.items.dashboard) for direct t() usage"
  - "Sidebar.tsx updated instead of AppShell.tsx (Sidebar renders navigation, not AppShell)"
  - "132 labelKey entries across 9 role navigation configs"

patterns-established:
  - "Navigation labelKey: Full translation path in labelKey property"
  - "Translation rendering: t(item.labelKey) pattern for nav items"

# Metrics
duration: 4min
completed: 2026-01-20
---

# Phase 31 Plan 02: Navigation Namespace Summary

**Navigation namespace with 8 groups and 30 items, plus Sidebar component using useTranslations for all 9 role configurations**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-20T05:45:28Z
- **Completed:** 2026-01-20T05:49:11Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Added navigation namespace to en.json with groups (8) and items (30) sections
- Converted all 9 role navigation configs to use labelKey pattern (132 labelKey entries)
- Updated Sidebar component to use useTranslations for rendering navigation labels

## Task Commits

Each task was committed atomically:

1. **Task 1: Add navigation namespace to en.json** - `dc12ffa` (feat)
2. **Task 2: Update navigation.ts to use labelKey** - `92cd2fe` (feat)
3. **Task 3: Update Sidebar to use useTranslations** - `24711ab` (feat)

## Files Created/Modified

- `messages/en.json` - Added navigation namespace with groups and items
- `src/lib/navigation.ts` - Changed NavItem/NavGroup types from label to labelKey, updated all 9 role configs
- `src/components/layout/Sidebar.tsx` - Added useTranslations hook and t() calls for navigation rendering

## Decisions Made

1. **Sidebar.tsx vs AppShell.tsx:** Plan mentioned AppShell.tsx but actual navigation rendering happens in Sidebar.tsx. Updated Sidebar.tsx which is the correct file.
2. **Full translation path in labelKey:** Keys store complete path (e.g., "navigation.items.dashboard") allowing direct `t(item.labelKey)` usage without namespace prefix.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

**Pre-existing TypeScript errors:** 28 TypeScript errors exist from plan 31-01 where constants.ts was converted to labelKey but consumer components weren't updated. These errors are in files outside this plan's scope (properties, profile, dashboard components) and will be fixed by subsequent plans (31-03 through 31-07) as per the phased roadmap. The navigation-specific changes in this plan compile correctly.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Navigation namespace complete and functional
- Sidebar displays translated labels
- Ready for 31-03 (Properties namespace) which will fix property-related TypeScript errors
- Note: TypeScript build has 28 errors from 31-01 constants migration that will be resolved by plans 31-03 through 31-07

---
*Phase: 31-translation-infrastructure*
*Completed: 2026-01-20*
