---
phase: 15-profile-display-edit
plan: 01
subsystem: deals
tags: [convex, query, react, card, access-control]

# Dependency graph
requires:
  - phase: 14-ai-preferences-service-selection
    provides: 17-step questionnaire with all investor preferences
provides:
  - getByInvestorId query for providers to view investor questionnaires
  - InvestorQuestionnaireCard display component
  - Provider-only investor profile view on deal detail page
affects: [15-02-profile-edit]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Provider access control via shared deal check

key-files:
  created:
    - src/components/deals/InvestorQuestionnaireCard.tsx
  modified:
    - convex/investorQuestionnaires.ts
    - src/app/(app)/deals/[id]/page.tsx

key-decisions:
  - "Access control: self-access OR provider assigned to shared deal"
  - "Card shows to providers only, not to investor viewing own deal"
  - "Label mappings inline in component for simplicity"

patterns-established:
  - "Provider access check pattern: filter deals by investorId AND (brokerId OR mortgageAdvisorId OR lawyerId)"

issues-created: []

# Metrics
duration: 5min
completed: 2026-01-18
---

# Phase 15 Plan 01: Profile Display & Edit Summary

**Provider-facing investor profile display with secure questionnaire access control and readable card layout**

## Performance

- **Duration:** 5 min
- **Started:** 2026-01-18T11:30:09Z
- **Completed:** 2026-01-18T11:35:15Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- Added getByInvestorId query with dual access paths (self OR provider via shared deal)
- Created InvestorQuestionnaireCard with 4 sections covering all 17 questionnaire fields
- Integrated card into deal detail Overview tab (provider-only visibility)
- Human-readable label mappings for all enum values

## Task Commits

Each task was committed atomically:

1. **Task 1: Add getByInvestorId query with provider access control** - `a26ffa8` (feat)
2. **Task 2: Create InvestorQuestionnaireCard component** - `9a27a50` (feat)
3. **Task 3: Integrate card into deal detail page** - `02df4be` (feat)

## Files Created/Modified
- `convex/investorQuestionnaires.ts` - Added getByInvestorId query with access control
- `src/components/deals/InvestorQuestionnaireCard.tsx` - Display card with sections for Background, Investment Preferences, Property Preferences, Timeline & Services
- `src/app/(app)/deals/[id]/page.tsx` - Added InvestorQuestionnaireCard to Overview tab for providers

## Decisions Made
- Access control checks current user against deal assignments (brokerId, mortgageAdvisorId, lawyerId)
- Card hidden from investors viewing their own deal (they already know their preferences)
- Label mappings kept inline in component rather than separate constants file

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## Next Phase Readiness
- Profile display complete for providers
- Ready for 15-02 (Edit functionality) to allow investors to update their questionnaire
- All questionnaire data viewable in readable format

---
*Phase: 15-profile-display-edit*
*Completed: 2026-01-18*
