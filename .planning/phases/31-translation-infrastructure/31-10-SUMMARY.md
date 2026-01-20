---
phase: 31-translation-infrastructure
plan: 10
subsystem: i18n
tags: [next-intl, questionnaire, onboarding, translation]

# Dependency graph
requires:
  - phase: 31-translation-infrastructure
    provides: onboarding namespace structure in en.json
provides:
  - Final 5 questionnaire step components translated
  - PropertySizeStep, LocationStep, TimelineStep, AdditionalPreferencesStep, ServicesStep use useTranslations
  - All 15 questionnaire steps now translated (combined with 31-08 and 31-09)
affects: [32-hebrew-translation, questionnaire-components]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - TIMELINE_KEY_MAP for DB value to translation key mapping
    - SERVICE_KEY_MAP for DB value to translation key mapping
    - tOptions namespace for shared onboarding options (bedrooms, area, minimum, maximum)
    - Dynamic city translation with t(`cities.${location}`) pattern

key-files:
  created: []
  modified:
    - messages/en.json
    - src/components/questionnaire/steps/PropertySizeStep.tsx
    - src/components/questionnaire/steps/LocationStep.tsx
    - src/components/questionnaire/steps/TimelineStep.tsx
    - src/components/questionnaire/steps/AdditionalPreferencesStep.tsx
    - src/components/questionnaire/steps/ServicesStep.tsx

key-decisions:
  - "Use onboarding.options namespace for shared labels (bedrooms, area, min, max)"
  - "Add placeholder sub-keys for PropertySizeStep input hints"
  - "Use KEY_MAP pattern for DB-to-translation-key conversion (TIMELINE_KEY_MAP, SERVICE_KEY_MAP)"
  - "Add cities translation object for LocationStep dynamic translation"

patterns-established:
  - "KEY_MAP pattern: map snake_case DB values to camelCase translation keys"
  - "Shared options namespace: tOptions('bedrooms') for reusable labels"

# Metrics
duration: 4min
completed: 2026-01-20
---

# Phase 31 Plan 10: Final Questionnaire Step Translations Summary

**Translated final 5 questionnaire step components (PropertySizeStep, LocationStep, TimelineStep, AdditionalPreferencesStep, ServicesStep) using onboarding.questions namespace with KEY_MAP patterns**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-20T06:53:13Z
- **Completed:** 2026-01-20T06:56:46Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments
- Added translation keys for property size placeholders, 15 Israeli cities, 4 timeline options, and 3 service options
- Translated PropertySizeStep using dual namespace pattern (propertySize + options)
- Translated LocationStep with dynamic city name translation
- Translated TimelineStep with TIMELINE_KEY_MAP pattern
- Translated AdditionalPreferencesStep using existing charCount ICU format
- Translated ServicesStep with SERVICE_KEY_MAP pattern
- All 15 questionnaire steps now translated (combined with 31-08 and 31-09)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add question option translations to en.json** - `4f61a2d` (feat)
2. **Task 2: Translate PropertySizeStep, LocationStep, TimelineStep** - `d817198` (feat)
3. **Task 3: Translate AdditionalPreferencesStep and ServicesStep** - `a747339` (feat)

## Files Created/Modified
- `messages/en.json` - Added placeholder, cities, timeline options, services options sub-keys
- `src/components/questionnaire/steps/PropertySizeStep.tsx` - useTranslations with dual namespace pattern
- `src/components/questionnaire/steps/LocationStep.tsx` - useTranslations with dynamic city translation
- `src/components/questionnaire/steps/TimelineStep.tsx` - useTranslations with TIMELINE_KEY_MAP
- `src/components/questionnaire/steps/AdditionalPreferencesStep.tsx` - useTranslations with ICU charCount format
- `src/components/questionnaire/steps/ServicesStep.tsx` - useTranslations with SERVICE_KEY_MAP

## Decisions Made
- Used onboarding.options namespace for shared labels (bedrooms, area, minimum, maximum) to avoid duplication
- Created KEY_MAP patterns (TIMELINE_KEY_MAP, SERVICE_KEY_MAP) for consistent DB-to-translation mapping
- Added cities object for LocationStep rather than individual city keys for easier maintenance
- Leveraged existing charCount ICU format in additional questions namespace

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All 15 questionnaire step components now translated
- Phase 31 (Translation Infrastructure) gap closure complete
- Ready for Phase 32 (Hebrew Translation) to add he.json translations

---
*Phase: 31-translation-infrastructure*
*Completed: 2026-01-20*
