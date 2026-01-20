---
phase: 32-locale-formatting
plan: 04
subsystem: i18n
tags: [next-intl, useFormatter, useLocale, questionnaire, calendar, settings, chart]

# Dependency graph
requires:
  - phase: 32-locale-formatting
    plan: 01
    provides: Format presets and useFormatter pattern established
provides:
  - Locale-aware questionnaire step formatting
  - Locale-aware calendar month names
  - Locale-aware availability settings date display
  - Locale-aware chart axis labels
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useLocale() hook for Calendar month formatting"
    - "format.number(value) for simple number display in inputs"
    - "format.dateTime(date, options) for inline date formatting"

key-files:
  created: []
  modified:
    - src/components/questionnaire/steps/BudgetStep.tsx
    - src/components/questionnaire/steps/PropertySizeStep.tsx
    - src/components/settings/AvailabilitySettings.tsx
    - src/components/properties/ValueHistoryChart.tsx
    - src/components/ui/calendar.tsx

key-decisions:
  - "Calendar uses useLocale() + toLocaleString(locale, options) for month dropdown"
  - "GlobalSearchBar kept as-is - formatCompactPrice uses toLocaleString() without locale which defaults to browser locale"

patterns-established:
  - "Move formatDate/formatPrice helpers inside component when they need format hook"
  - "useLocale() for components that need locale string directly (like react-day-picker)"

# Metrics
duration: 5min
completed: 2026-01-20
---

# Phase 32 Plan 04: Remaining Components Summary

**Questionnaire, calendar, settings, and chart components migrated to locale-aware formatting with useFormatter and useLocale**

## Performance

- **Duration:** 5 min
- **Started:** 2026-01-20T10:00:00Z
- **Completed:** 2026-01-20T10:05:00Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments

- Migrated BudgetStep and PropertySizeStep to use format.number() for input display
- Migrated AvailabilitySettings to use format.dateTime() for blocked dates
- Migrated ValueHistoryChart to use format.dateTime() and format.number() for chart axes/tooltips
- Made Calendar component use useLocale() for month name formatting

## Task Commits

Each task was committed atomically:

1. **Task 1: Migrate questionnaire steps** - `55945c9` (feat)
2. **Task 2: Migrate settings and chart components** - `4981ef6` (feat)
3. **Task 3: Make Calendar locale-aware** - `6ea1acf` (feat)

## Files Created/Modified

- `src/components/questionnaire/steps/BudgetStep.tsx` - useFormatter for budget input display
- `src/components/questionnaire/steps/PropertySizeStep.tsx` - useFormatter for area input display
- `src/components/settings/AvailabilitySettings.tsx` - format.dateTime() for blocked date list
- `src/components/properties/ValueHistoryChart.tsx` - format.dateTime() and format.number() for chart
- `src/components/ui/calendar.tsx` - useLocale() for month dropdown formatting

## Decisions Made

- **Calendar locale handling:** Used useLocale() + toLocaleString(locale, options) since react-day-picker's formatMonthDropdown expects a string, not the format hook
- **GlobalSearchBar unchanged:** The formatCompactPrice function uses toLocaleString() without a specific locale, which naturally uses the browser's default locale - acceptable for MVP

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 32 locale formatting migration complete
- All major components now use locale-aware formatting
- Calendar displays month names in user's locale (en/he)
- Questionnaire inputs display numbers in locale-aware format

---
*Phase: 32-locale-formatting*
*Completed: 2026-01-20*
