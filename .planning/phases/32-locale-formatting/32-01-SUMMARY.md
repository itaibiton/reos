---
phase: 32-locale-formatting
plan: 01
subsystem: i18n
tags: [next-intl, useFormatter, currency, locale, formatting]

# Dependency graph
requires:
  - phase: 28-i18n-setup
    provides: next-intl configuration and routing
provides:
  - Format presets configuration in i18n/request.ts
  - PropertyCard locale-aware currency formatting
  - MortgageCalculator locale-aware currency formatting
  - PortfolioSection locale-aware currency formatting
affects: [32-02, 32-03, 32-04, all-currency-formatting-components]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useFormatter() hook for locale-aware formatting"
    - "format.number() with currency style for USD/ILS display"

key-files:
  created: []
  modified:
    - src/i18n/request.ts
    - src/components/properties/PropertyCard.tsx
    - src/components/properties/MortgageCalculator.tsx
    - src/components/profile/PortfolioSection.tsx

key-decisions:
  - "Format presets include dateTime (6 formats) and number (4 formats) for reuse"
  - "Keep formatPercent helper for now (percentages don't need locale-specific formatting for MVP)"

patterns-established:
  - "format.number(amount, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }) for USD"
  - "format.number(amount, { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }) for ILS"

# Metrics
duration: 6min
completed: 2026-01-20
---

# Phase 32 Plan 01: Locale Formatting Infrastructure Summary

**Format presets configuration with useFormatter migration for PropertyCard, MortgageCalculator, and PortfolioSection**

## Performance

- **Duration:** 6 min
- **Started:** 2026-01-20T09:15:00Z
- **Completed:** 2026-01-20T09:21:00Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- Added format presets to i18n/request.ts (6 dateTime + 4 number formats)
- Migrated PropertyCard from hardcoded formatUSD/formatILS to useFormatter
- Migrated MortgageCalculator from hardcoded formatUSD/formatNumber to useFormatter
- Migrated PortfolioSection from hardcoded formatUSD to useFormatter

## Task Commits

Each task was committed atomically:

1. **Task 1: Add format configuration to i18n/request.ts** - `1e1d918` (feat)
2. **Task 2: Migrate PropertyCard to useFormatter** - `dcf6c11` (feat)
3. **Task 3: Migrate MortgageCalculator and PortfolioSection** - `7d46148` (feat)

## Files Created/Modified

- `src/i18n/request.ts` - Added formats configuration with dateTime and number presets
- `src/components/properties/PropertyCard.tsx` - Replaced formatUSD/formatILS with format.number()
- `src/components/properties/MortgageCalculator.tsx` - Replaced formatUSD/formatNumber with format.number()
- `src/components/profile/PortfolioSection.tsx` - Replaced formatUSD with format.number()

## Decisions Made

- **Format presets structure:** Added 6 dateTime formats (short, medium, monthDay, full, dateTime, time) and 4 number formats (integer, decimal, compact, percent) for reuse across the app
- **Keep formatPercent helper:** Percentages don't need locale-specific formatting for MVP (simple string interpolation works)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Format infrastructure established for remaining migration
- Pattern established: replace hardcoded Intl.NumberFormat with format.number()
- Ready for 32-02 (deal and feed components) migration

---
*Phase: 32-locale-formatting*
*Completed: 2026-01-20*
