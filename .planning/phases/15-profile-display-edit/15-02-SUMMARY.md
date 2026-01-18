---
phase: 15-profile-display-edit
plan: 02
subsystem: profile
tags: [react, questionnaire, profile, completeness]

# Dependency graph
requires:
  - phase: 15-profile-display-edit
    plan: 01
    provides: Provider-facing investor profile display
provides:
  - Questionnaire edit page for investors
  - Profile completeness calculation and display
  - Edit link from profile page
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - QuestionnaireWizard editMode prop for reusability

key-files:
  created:
    - src/app/(app)/profile/investor/questionnaire/page.tsx
    - src/components/profile/ProfileCompletenessCard.tsx
  modified:
    - src/components/questionnaire/QuestionnaireWizard.tsx
    - src/app/(app)/profile/investor/page.tsx

key-decisions:
  - "Edit mode uses local step state (starts at step 1, not questionnaire's last step)"
  - "Completeness based on 15 required fields, excludes optional ones like bedrooms/area/amenities"
  - "QuestionnaireWizard extended with editMode prop rather than separate component"

patterns-established:
  - "Reusable wizard via editMode flag (hides skip, changes completion text)"

issues-created: []

# Metrics
duration: 8min
completed: 2026-01-18
---

# Phase 15 Plan 02: Questionnaire Edit & Profile Completeness Summary

**Enable investors to edit their questionnaire answers after onboarding and see profile completeness indicator**

## Performance

- **Duration:** 8 min
- **Started:** 2026-01-18
- **Completed:** 2026-01-18
- **Tasks:** 3
- **Files created:** 2
- **Files modified:** 2

## Accomplishments
- Created questionnaire edit page at /profile/investor/questionnaire
- Added ProfileCompletenessCard component with progress visualization
- Updated investor profile page to show completeness and edit link
- Extended QuestionnaireWizard with editMode prop for reusability

## Task Commits

Each task was committed atomically:

1. **Task 1: Create questionnaire edit page** - `caaf8b0` (feat)
2. **Task 2: Add ProfileCompletenessCard component** - `ef01f31` (feat)
3. **Task 3: Update investor profile page** - `672b20e` (feat)

## Files Created/Modified
- `src/app/(app)/profile/investor/questionnaire/page.tsx` - Edit page reusing QuestionnaireWizard in edit mode
- `src/components/profile/ProfileCompletenessCard.tsx` - Shows completion %, missing fields, edit link
- `src/components/questionnaire/QuestionnaireWizard.tsx` - Added editMode prop (hides skip, shows "Save Changes")
- `src/app/(app)/profile/investor/page.tsx` - Added ProfileCompletenessCard above existing form

## Decisions Made
- Edit page tracks step state locally (always starts at step 1 for review flow)
- Completeness calculation uses 15 required fields, excludes optional fields like bedrooms, area, amenities
- QuestionnaireWizard extended with editMode rather than duplicating the component
- onSkip prop made optional to support edit mode without skip functionality

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## Phase 15 Completion

This completes Phase 15 (Profile Display & Edit) and the v1.1 milestone:
- 15-01: Provider-facing investor questionnaire display on deals
- 15-02: Investor-facing questionnaire edit and completeness indicator

Investors can now:
- View their profile completeness percentage
- See which fields are missing
- Edit their questionnaire answers anytime via /profile/investor/questionnaire

Providers can now:
- View investor questionnaire details on shared deals

---
*Phase: 15-profile-display-edit*
*Milestone: v1.1 complete*
*Completed: 2026-01-18*
