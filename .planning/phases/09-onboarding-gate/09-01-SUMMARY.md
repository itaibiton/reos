---
phase: 09-onboarding-gate
plan: 01
subsystem: auth
tags: [convex, onboarding, questionnaire, routing, investor]

# Dependency graph
requires:
  - phase: 08-realtime-features
    provides: notifications system, authenticated user flow
provides:
  - onboardingStep field on users table for progress tracking
  - investorQuestionnaires table with draft/complete status
  - Role-aware setUserRole mutation (investor vs service provider paths)
  - completeOnboarding and getOnboardingStatus queries/mutations
  - Role-aware gate logic in app layout
  - Placeholder questionnaire page with skip functionality
affects: [10-questionnaire-ui, 11-questionnaire-content, investor-onboarding]

# Tech tracking
tech-stack:
  added: []
  patterns: [role-aware-onboarding, questionnaire-draft-storage]

key-files:
  created:
    - convex/investorQuestionnaires.ts
    - src/app/(app)/onboarding/questionnaire/page.tsx
  modified:
    - convex/schema.ts
    - convex/users.ts
    - src/app/(app)/layout.tsx
    - src/app/(app)/onboarding/page.tsx

key-decisions:
  - "Investors get onboardingStep=1 after role selection, questionnaire pending"
  - "Service providers (broker, mortgage_advisor, lawyer) complete onboarding immediately"
  - "Questionnaire table stores draft answers with status field (draft/complete)"
  - "Skip for now button allows dev bypass, calls completeOnboarding"

patterns-established:
  - "Role-aware onboarding: setUserRole differentiates investor vs service provider paths"
  - "Questionnaire draft: investorQuestionnaires table with currentStep for progress"
  - "Gate logic: layout.tsx checks role + onboardingComplete for redirect decisions"

issues-created: []

# Metrics
duration: 5min
completed: 2026-01-18
---

# Phase 9: Onboarding Gate & State Summary

**Role-aware onboarding gate with investor questionnaire infrastructure and draft storage**

## Performance

- **Duration:** 5 min
- **Started:** 2026-01-18T11:25:00Z
- **Completed:** 2026-01-18T11:30:00Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments
- Added onboardingStep field to users table for tracking investor progress through questionnaire
- Created investorQuestionnaires table with draft/complete status and initial answer fields
- Modified setUserRole to differentiate investor (questionnaire required) vs service provider (immediate completion) paths
- Implemented role-aware gate logic that routes investors to /onboarding/questionnaire
- Created placeholder questionnaire page with "Skip for now" functionality for development

## Task Commits

Each task was committed atomically:

1. **Task 1: Schema - Add onboarding progress and questionnaire draft table** - `f5f69a4` (feat)
2. **Task 2: Backend - Create onboarding progress mutations and update setUserRole** - `bfe19d0` (feat)
3. **Task 3: Gate - Update layout with role-aware onboarding enforcement** - `5049650` (feat)

**Plan metadata:** Pending (docs: complete plan)

## Files Created/Modified
- `convex/schema.ts` - Added onboardingStep to users, created investorQuestionnaires table
- `convex/users.ts` - Modified setUserRole, added completeOnboarding and getOnboardingStatus
- `convex/investorQuestionnaires.ts` - New file with getByUser, initializeDraft, updateStep, markComplete
- `src/app/(app)/layout.tsx` - Role-aware gate logic for onboarding redirection
- `src/app/(app)/onboarding/page.tsx` - Updated to route investors to questionnaire
- `src/app/(app)/onboarding/questionnaire/page.tsx` - Placeholder with skip functionality

## Decisions Made
- Investors get `onboardingStep = 1` after role selection (questionnaire pending)
- Service providers (broker, mortgage_advisor, lawyer) and admin complete onboarding immediately after role selection
- Questionnaire table uses status field ("draft" | "complete") for tracking completion
- "Skip for now" button is temporary for development, calls completeOnboarding mutation
- Gate logic in layout.tsx checks both role and onboardingComplete to determine redirect destination

## Deviations from Plan

None - plan executed exactly as written

## Issues Encountered
None

## Next Phase Readiness
- Questionnaire infrastructure ready for Phase 10 UI framework implementation
- investorQuestionnaires table ready to store additional fields in Phases 11-14
- Gate logic will route investors to questionnaire until they complete or skip
- "Skip for now" available for testing other platform features during development

---
*Phase: 09-onboarding-gate*
*Completed: 2026-01-18*
