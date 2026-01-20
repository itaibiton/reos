---
phase: 31-translation-infrastructure
plan: 08
subsystem: i18n
tags: [next-intl, questionnaire, translations, onboarding]

requires:
  - phase: 31-01
    provides: i18n infrastructure and base namespace structure
  - phase: 31-07
    provides: onboarding namespace with questions section (titles and descriptions)

provides:
  - Translated questionnaire step components (citizenship, residency, experience, ownership, investmentType)
  - OPTION_KEY_MAP pattern for snake_case DB values to camelCase translation keys

affects:
  - Phase 31-09 and beyond (remaining questionnaire step translations)
  - Phase 32 (Hebrew translations for onboarding.questions namespace)

tech-stack:
  added: []
  patterns:
    - OPTION_KEY_MAP pattern for DB value to translation key mapping
    - t("options.{key}") for simple options
    - t("options.{key}.label") and t("options.{key}.description") for rich options

key-files:
  created: []
  modified:
    - src/components/questionnaire/steps/CitizenshipStep.tsx
    - src/components/questionnaire/steps/ResidencyStep.tsx
    - src/components/questionnaire/steps/ExperienceStep.tsx
    - src/components/questionnaire/steps/OwnershipStep.tsx
    - src/components/questionnaire/steps/InvestmentTypeStep.tsx

key-decisions:
  - "Use OPTION_KEY_MAP for snake_case to camelCase translation key mapping"
  - "Simple options (citizenship, ownership) use t('options.key') directly"
  - "Rich options (residency, experience, investmentType) use t('options.key.label') and t('options.key.description')"

patterns-established:
  - "OPTION_KEY_MAP: Map DB snake_case values to camelCase translation keys"
  - "QuestionBubble props: question={t('title')} description={t('description')}"

duration: 8min
completed: 2026-01-20
---

# Phase 31 Plan 08: Questionnaire Step Translations Batch 1 Summary

**Translated 5 questionnaire step components (citizenship, residency, experience, ownership, investmentType) using onboarding.questions namespace with OPTION_KEY_MAP pattern for DB value mapping**

## Performance

- **Duration:** 8 min
- **Started:** 2026-01-20T00:00:00Z
- **Completed:** 2026-01-20T00:08:00Z
- **Tasks:** 3 (Task 1 was already completed by prior work)
- **Files modified:** 5

## Accomplishments
- Translated CitizenshipStep with simple yes/no options using OPTION_KEY_MAP
- Translated ResidencyStep with 4 rich options (label + description)
- Translated ExperienceStep with 3 rich options (label + description)
- Translated OwnershipStep with simple yes/no options
- Translated InvestmentTypeStep with 2 rich options (label + description)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add question option translations** - Already completed by prior plan (31-09)
2. **Task 2: Translate CitizenshipStep, ResidencyStep, ExperienceStep** - `d03e0e5` (feat)
3. **Task 3: Translate OwnershipStep and InvestmentTypeStep** - `c734b8b` (feat)

## Files Created/Modified
- `src/components/questionnaire/steps/CitizenshipStep.tsx` - Added useTranslations, OPTION_KEY_MAP for snake_case to camelCase mapping
- `src/components/questionnaire/steps/ResidencyStep.tsx` - Added useTranslations, OPTION_KEY_MAP for 4 residency options
- `src/components/questionnaire/steps/ExperienceStep.tsx` - Added useTranslations for 3 experience levels
- `src/components/questionnaire/steps/OwnershipStep.tsx` - Added useTranslations for yes/no options
- `src/components/questionnaire/steps/InvestmentTypeStep.tsx` - Added useTranslations for residential/investment options

## Decisions Made
- **OPTION_KEY_MAP pattern:** Used Record<string, string> map to convert snake_case DB values (like "non_israeli", "returning_resident") to camelCase translation keys (like "nonIsraeli", "returningResident")
- **Simple vs Rich options:** Citizenship and Ownership use simple string options; Residency, Experience, and InvestmentType use nested label/description objects

## Deviations from Plan

None - plan executed exactly as written. Note: Task 1 (adding translation keys to en.json) was already completed by a prior plan execution (31-09), so only Tasks 2-3 required execution.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- 5 questionnaire steps fully translated and ready for Hebrew translations
- Pattern established for remaining questionnaire step translations
- No blockers for continuing with remaining step translations

---
*Phase: 31-translation-infrastructure*
*Completed: 2026-01-20*
