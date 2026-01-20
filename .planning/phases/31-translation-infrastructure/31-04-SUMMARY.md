---
phase: 31-translation-infrastructure
plan: 04
subsystem: i18n
tags: [next-intl, react, deals, translations]

# Dependency graph
requires:
  - phase: 31-translation-infrastructure
    provides: Translation foundation (31-01), common namespace (31-02)
provides:
  - deals namespace with 50+ translation keys
  - Translated deals listing page
  - Translated deal detail page
  - Translated FileUpload component
  - Translated InvestorQuestionnaireCard component
affects: [future deal features, Hebrew translations]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Deal stage translations via key mapping"
    - "Provider type translations via common.roles namespace"
    - "File category translations with key mapping"
    - "Questionnaire field translations with nested namespace"

key-files:
  created: []
  modified:
    - messages/en.json
    - src/app/[locale]/(app)/deals/page.tsx
    - src/app/[locale]/(app)/deals/[id]/page.tsx
    - src/components/deals/FileUpload.tsx
    - src/components/deals/InvestorQuestionnaireCard.tsx

key-decisions:
  - "Used deals namespace for all deal-related translations"
  - "Nested questionnaire translations under deals.questionnaire"
  - "Used key mapping objects to convert snake_case DB values to camelCase translation keys"
  - "Shared provider labels via common.roles namespace"

patterns-established:
  - "Stage key mapping: broker_assigned -> brokerAssigned"
  - "Plural ICU syntax: {count, plural, =1 {# file} other {# files}}"
  - "Value interpolation: {name}, {count}, {progress}"

# Metrics
duration: 12min
completed: 2026-01-20
---

# Phase 31 Plan 04: Deals Namespace Translation Summary

**Comprehensive deals namespace with stage labels, provider types, file categories, questionnaire fields, and activity log translations**

## Performance

- **Duration:** 12 min
- **Started:** 2026-01-20T05:46:00Z
- **Completed:** 2026-01-20T05:58:37Z
- **Tasks:** 3/3
- **Files modified:** 5

## Accomplishments
- Added deals namespace to en.json with 50+ translation keys
- Translated deals listing page (filters, empty states, stage labels)
- Translated deal detail page (tabs, providers, files, activity sections)
- Translated FileUpload component (upload UI, categories, visibility)
- Translated InvestorQuestionnaireCard (all fields, sections, value labels)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add deals namespace to en.json** - `1509a09` (feat)
2. **Task 2: Translate deal pages** - `0f62a0c` (feat)
3. **Task 3: Translate deal components** - `9815489` (feat)

## Files Created/Modified
- `messages/en.json` - Added deals namespace with stages, card, detail, providers, files, activity, empty, filters, questionnaire sections
- `src/app/[locale]/(app)/deals/page.tsx` - Added useTranslations, translated filters, stages, empty states
- `src/app/[locale]/(app)/deals/[id]/page.tsx` - Added useTranslations, translated all tabs and sections
- `src/components/deals/FileUpload.tsx` - Added useTranslations, translated upload UI
- `src/components/deals/InvestorQuestionnaireCard.tsx` - Added useTranslations, translated all questionnaire fields

## Decisions Made
- Used nested namespace `deals.questionnaire` for investor profile translations to group ~50 questionnaire-related keys
- Created key mapping objects (STAGE_KEY_MAP, FILE_CATEGORY_KEY_MAP, VALUE_KEY_MAPPINGS) to convert snake_case database values to camelCase translation keys
- Used ICU plural syntax for file counts and provider counts
- Leveraged common.roles namespace for provider type labels instead of duplicating

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - straightforward implementation following established patterns from prior plans.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Deals namespace complete with all English translations
- Ready for Hebrew translations (31-05 or future)
- Pattern established for future deal feature translations

---
*Phase: 31-translation-infrastructure*
*Completed: 2026-01-20*
