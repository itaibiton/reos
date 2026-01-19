---
phase: 29-css-logical-properties-migration
plan: 01
subsystem: ui
tags: [css-logical-properties, rtl, tailwind, shadcn, sidebar, sheet, dropdown, menu]

# Dependency graph
requires:
  - phase: 28-i18n-infrastructure
    provides: RTL direction context and locale routing
provides:
  - RTL-compatible sidebar positioning with start-0/end-0
  - RTL-compatible sheet overlays with logical borders
  - RTL-compatible menu components with logical spacing
affects: [29-02-additional-ui-components, 30-rtl-component-patches]

# Tech tracking
tech-stack:
  added: []
  patterns: [css-logical-properties-for-rtl]

key-files:
  modified:
    - src/components/ui/sidebar.tsx
    - src/components/ui/sheet.tsx
    - src/components/ui/dropdown-menu.tsx
    - src/components/ui/context-menu.tsx
    - src/components/ui/menubar.tsx

key-decisions:
  - "Keep animation classes (slide-in-from-*) physical - deferred to RTL-05 scope"
  - "Convert text-left to text-start for menu button text alignment"

patterns-established:
  - "CSS logical property mapping: left-0 -> start-0, right-0 -> end-0"
  - "Border direction mapping: border-l -> border-s, border-r -> border-e"
  - "Margin/padding mapping: ml- -> ms-, mr- -> me-, pl- -> ps-, pr- -> pe-"
  - "Animation classes kept physical until RTL animation handling (RTL-05)"

# Metrics
duration: 4min
completed: 2026-01-19
---

# Phase 29 Plan 01: High-Priority Shadcn UI Components Summary

**CSS logical properties migration for sidebar, sheet, and menu components enabling automatic RTL layout flipping**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-19T21:57:36Z
- **Completed:** 2026-01-19T22:01:25Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Migrated sidebar.tsx with 14+ directional classes to logical properties
- Migrated sheet.tsx positioning and close button to logical properties
- Migrated dropdown-menu.tsx, context-menu.tsx, and menubar.tsx with 11 directional classes each
- All layout-critical Shadcn components now RTL-ready

## Task Commits

Each task was committed atomically:

1. **Task 1: Migrate Sidebar and Sheet components** - `6fcf748` (feat)
2. **Task 2: Migrate Dropdown, Context, and Menubar components** - `1fd6cfc` (feat)

## Files Created/Modified
- `src/components/ui/sidebar.tsx` - RTL-compatible sidebar positioning (start-0/end-0), borders (border-s/border-e), margins (ms-/me-)
- `src/components/ui/sheet.tsx` - RTL-compatible sheet positioning and close button
- `src/components/ui/dropdown-menu.tsx` - RTL-compatible menu item spacing (ps-/pe-), indicator positioning (start-2), shortcuts (ms-auto)
- `src/components/ui/context-menu.tsx` - Same logical property patterns as dropdown-menu
- `src/components/ui/menubar.tsx` - Same logical property patterns as dropdown-menu

## Decisions Made
- Keep animation classes (slide-in-from-left, slide-in-from-right) as physical properties - these are handled separately in RTL-05 scope (icon/animation flipping)
- Convert text-left to text-start in sidebar menu button for proper RTL text alignment

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Existing build error in src/components/landing/Hero/Hero.tsx (framer-motion type error) - unrelated to this migration, pre-existing in codebase

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- High-priority Shadcn components migrated to CSS logical properties
- Ready for 29-02: Additional UI component migration (dialog, popover, tooltip, etc.)
- Animation classes remain physical - will be addressed in RTL-05 (icon/animation flipping)

---
*Phase: 29-css-logical-properties-migration*
*Completed: 2026-01-19*
