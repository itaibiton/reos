---
phase: 31-translation-infrastructure
plan: 09
subsystem: ui
tags: [next-intl, questionnaire, translations, onboarding]

# Dependency graph
requires:
  - phase: 31-08
    provides: First batch questionnaire step translations (citizenship, residency, experience, ownsProperty, investmentType)
provides:
  - Translated BudgetStep component using onboarding.questions.budget namespace
  - Translated HorizonStep component using onboarding.questions.horizon namespace
  - Translated GoalsStep component using onboarding.questions.goals namespace
  - Translated YieldStep component using onboarding.questions.yield namespace
  - Translated FinancingStep component using onboarding.questions.financing namespace
  - Translation keys with options sub-keys for all 5 steps
affects: [31-10, phase-32-hebrew]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "snake_case to camelCase key mapping for DB values to translation keys"
    - "useTranslations('onboarding.questions.{step}') pattern"
    - "OPTION_IDS array with map() for rendering translated options"

key-files:
  created: []
  modified:
    - src/components/questionnaire/steps/BudgetStep.tsx
    - src/components/questionnaire/steps/HorizonStep.tsx
    - src/components/questionnaire/steps/GoalsStep.tsx
    - src/components/questionnaire/steps/YieldStep.tsx
    - src/components/questionnaire/steps/FinancingStep.tsx
    - messages/en.json

key-decisions:
  - "Use horizonKeyMap pattern to map snake_case DB values (short_term) to camelCase translation keys (shortTerm)"
  - "Use goalKeyMap pattern for goals with snake_case values (rental_income -> rentalIncome)"
  - "FinancingStep uses direct keys (no mapping) since DB values already match translation keys"
  - "BudgetStep uses options.minimum/maximum for input labels, options.placeholder.min/max for placeholders"

patterns-established:
  - "Pattern: {step}KeyMap for snake_case to camelCase conversion in questionnaire steps"
  - "Pattern: OPTION_IDS array with .map() for rendering translated radio/checkbox options"

# Metrics
duration: 3.5min
completed: 2026-01-20
---

# Phase 31 Plan 09: Second Batch Questionnaire Steps Translation Summary

**Translated 5 questionnaire step components (BudgetStep, HorizonStep, GoalsStep, YieldStep, FinancingStep) with i18n support**

## Performance

- **Duration:** 3.5 min
- **Started:** 2026-01-20T06:53:12Z
- **Completed:** 2026-01-20T06:56:46Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments

- Added options translation keys for budget, horizon, goals, yield, and financing questions
- Translated BudgetStep with input labels and placeholders
- Translated HorizonStep, GoalsStep, YieldStep, FinancingStep with option label/description keys
- Established snake_case to camelCase key mapping pattern for DB value translation

## Task Commits

Each task was committed atomically:

1. **Task 1: Add question option translations to en.json** - `0c59f44` (feat)
2. **Task 2: Translate BudgetStep, HorizonStep, GoalsStep** - `af322a7` (feat)
3. **Task 3: Translate YieldStep and FinancingStep** - `55c6ffc` (feat)

## Files Created/Modified

- `messages/en.json` - Added options sub-keys for budget, horizon, goals, yield, financing questions
- `src/components/questionnaire/steps/BudgetStep.tsx` - Uses useTranslations for title, description, labels, placeholders
- `src/components/questionnaire/steps/HorizonStep.tsx` - Uses horizonKeyMap for snake_case to camelCase mapping
- `src/components/questionnaire/steps/GoalsStep.tsx` - Uses goalKeyMap for checkbox option translation
- `src/components/questionnaire/steps/YieldStep.tsx` - Uses yieldKeyMap for radio option translation
- `src/components/questionnaire/steps/FinancingStep.tsx` - Uses direct keys (no mapping needed)

## Decisions Made

- **Key mapping pattern:** Use `{step}KeyMap` objects to convert snake_case DB values to camelCase translation keys
- **Budget step structure:** Separate options.minimum/maximum for labels, options.placeholder.min/max for input placeholders
- **Financing step simplification:** No key mapping needed since DB values (cash, mortgage, exploring) match translation keys

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 5 questionnaire step components from this batch now use useTranslations
- Ready for remaining questionnaire steps in plan 10 (propertyTypes, locations, propertySize, amenities)
- Ready for Hebrew translation in Phase 32

---
*Phase: 31-translation-infrastructure*
*Completed: 2026-01-20*
