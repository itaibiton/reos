---
phase: 33
plan: 03
subsystem: i18n
tags: [hebrew, translation, properties, real-estate, rtl]

dependency-graph:
  requires: [33-RESEARCH, he.json]
  provides: [properties-he-translations]
  affects: [33-04, 33-05]

tech-stack:
  patterns: [next-intl, ICU-message-format]

key-files:
  modified: [messages/he.json]

decisions:
  - Used Israeli real-estate terminology (e.g., "שיעור היוון" for cap rate)
  - Used ICU plural syntax for Hebrew grammar variations
  - Maintained domain-specific vocabulary consistency with existing translations

metrics:
  duration: 5m
  completed: 2026-01-20
---

# Phase 33 Plan 03: Properties Namespace Translation Summary

Full Hebrew translation of 118 properties namespace keys covering property browsing, listings, details, forms, and neighborhood information.

## Completed Tasks

| Task | Name | Commit | Files Modified |
|------|------|--------|----------------|
| 1 | Translate properties core and card sections | 4e0fc38 | messages/he.json |
| 2 | Translate properties details, form, and remaining sections | 384e943 | messages/he.json |

## What Was Done

### Task 1: Core and Card Translations (17 keys)
Translated the foundational properties namespace keys:
- Page titles: `title`, `browseTitle`, `savedTitle`, `listingsTitle`, `newTitle`, `editTitle`
- Page descriptions: `newDescription`, `editDescription`
- Count strings with ICU plurals: `count`, `listingsCount`
- Card metrics: `bedrooms`, `bathrooms`, `size`, `roi`, `cap`, `rent`, `perMonth`

### Task 2: Details, Form, and Remaining Sections (101 keys)
Completed all remaining properties sub-namespaces:

**details (22 keys):** Property detail page labels including investment metrics, deal actions, and city information.

**form (33 keys):** Property creation/edit form with labels, placeholders, validation messages, and feedback toasts.

**empty (12 keys):** Empty state messages for property listings, saved properties, and not-found scenarios.

**save (4 keys):** Property save/unsave actions and authentication prompts.

**saved (5 keys):** Saved properties page title, count with ICU plural, and nested empty state object.

**neighborhood (14 keys):** City/neighborhood information section with population data and nearby amenities.

**amenities (1 key):** No amenities fallback message.

## Technical Notes

### ICU Plural Syntax
Hebrew requires special plural handling. Examples:
```json
"count": "{count, plural, =0 {לא נמצאו נכסים} =1 {נכס אחד} other {# נכסים}} נמצאו"
"listingsCount": "{count, plural, =0 {0 מודעות} =1 {מודעה אחת} other {# מודעות}}"
```

### Real Estate Terminology
Used standard Israeli real-estate terms:
- `תשואה` (ROI/return)
- `שיעור היוון` (cap rate)
- `תשואה על הון עצמי` (cash-on-cash return)
- `מ"ר` (square meters abbreviation)
- `ממ"ד` (safe room - Israeli term)

## Verification Results

- JSON validity: PASS
- Key count: 118/118 keys translated
- All properties sub-sections present: details, form, empty, save, saved, neighborhood, amenities

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

The properties namespace is now fully translated. Ready to proceed with:
- 33-04: Deals namespace translation
- 33-05: Auth namespace translation
