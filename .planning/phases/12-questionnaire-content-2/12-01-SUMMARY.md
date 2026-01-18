---
phase: 12-questionnaire-content-2
plan: 01
subsystem: ui
tags: [react, convex, forms, onboarding, questionnaire, checkbox, input]

# Dependency graph
requires:
  - phase: 11-questionnaire-content-1
    provides: Step component pattern, QuestionBubble + AnswerArea structure, draft persistence pattern
provides:
  - 5 questionnaire step components (BudgetStep, HorizonStep, GoalsStep, YieldStep, FinancingStep)
  - 6 new schema fields for financial context
  - 10-step questionnaire wizard with full persistence
affects: [13-questionnaire-content, 14-questionnaire-content, 15-profile-display]

# Tech tracking
tech-stack:
  added: []
  patterns: [multi-input-step, checkbox-multi-select]

key-files:
  created:
    - src/components/questionnaire/steps/BudgetStep.tsx
    - src/components/questionnaire/steps/HorizonStep.tsx
    - src/components/questionnaire/steps/GoalsStep.tsx
    - src/components/questionnaire/steps/YieldStep.tsx
    - src/components/questionnaire/steps/FinancingStep.tsx
  modified:
    - convex/schema.ts
    - convex/investorQuestionnaires.ts
    - src/components/questionnaire/steps/index.ts
    - src/app/(app)/onboarding/questionnaire/page.tsx

key-decisions:
  - "BudgetStep uses separate min/max props with individual onChange handlers"
  - "GoalsStep uses checkbox multi-select with array state"
  - "All new steps follow established QuestionBubble + AnswerArea pattern"

patterns-established:
  - "Multi-input step pattern: BudgetStep with two related fields"
  - "Checkbox multi-select pattern: GoalsStep with array state and toggle handler"

issues-created: []

# Metrics
duration: 4min
completed: 2026-01-18
---

# Phase 12 Plan 01: Questionnaire Content Part 2 Summary

**5 financial context questionnaire steps with budget inputs, multi-select goals, and single-select preferences**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-18T09:59:13Z
- **Completed:** 2026-01-18T10:03:13Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments

- Added 6 new schema fields for investor financial context
- Created 5 step components following established patterns
- Implemented BudgetStep with min/max USD inputs and currency formatting
- Implemented GoalsStep with checkbox multi-select pattern
- Wired up 10-step questionnaire wizard with full draft persistence

## Task Commits

Each task was committed atomically:

1. **Task 1: Add schema fields and create 5 step components** - `efc086a` (feat)
2. **Task 2: Wire up questionnaire page with new steps** - `97225b2` (feat)

## Files Created/Modified

- `convex/schema.ts` - Added 6 new fields: budgetMin, budgetMax, investmentHorizon, investmentGoals, yieldPreference, financingApproach
- `convex/investorQuestionnaires.ts` - Updated saveAnswers mutation with new field handling
- `src/components/questionnaire/steps/BudgetStep.tsx` - Min/max USD budget inputs with formatting
- `src/components/questionnaire/steps/HorizonStep.tsx` - Short/medium/long-term timeline selection
- `src/components/questionnaire/steps/GoalsStep.tsx` - Multi-select investment goals checkboxes
- `src/components/questionnaire/steps/YieldStep.tsx` - Rental yield vs appreciation preference
- `src/components/questionnaire/steps/FinancingStep.tsx` - Cash vs mortgage vs exploring options
- `src/components/questionnaire/steps/index.ts` - Added exports for 5 new components
- `src/app/(app)/onboarding/questionnaire/page.tsx` - Integrated all 10 steps with state and persistence

## Decisions Made

- Used separate props for budgetMin/budgetMax with individual onChange handlers (cleaner than object)
- GoalsStep defaults to empty array and uses toggle pattern for checkbox changes
- Currency formatting uses toLocaleString for display, strips non-digits for parsing

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## Next Phase Readiness

- Phase 12 complete with 10 working questions
- Ready for Phase 13 to add more questions if needed
- Checkbox multi-select pattern established for future multi-select steps
- Budget input pattern available for future numeric inputs

---
*Phase: 12-questionnaire-content-2*
*Completed: 2026-01-18*
