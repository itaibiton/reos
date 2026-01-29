# Plan 57-02 Summary: Vendor Onboarding Questionnaire UI

**Status:** ✓ Complete
**Completed:** 2026-01-29

## What Was Built

A 4-step multi-step onboarding wizard for service providers to complete their profile with all required registration fields and profile photo upload.

## Changes Made

### 1. Wizard Container (src/components/vendor/VendorOnboardingWizard.tsx)

- 4-step wizard with progress indicator
- Step navigation with validation gates
- Draft persistence to localStorage (auto-save every 500ms)
- Profile pre-loading for rejected vendors (resubmission flow)
- Submit triggers `submitForApproval` mutation

### 2. Step 1: Basic Info (src/components/vendor/steps/BasicInfoStep.tsx)

- Full name, email, phone fields
- Provider type selection (dropdown)
- Profile photo upload via ProfilePhotoUpload component

### 3. Step 2: Professional Details (src/components/vendor/steps/ProfessionalDetailsStep.tsx)

- Company name, license number
- Years of experience
- Specializations multi-select

### 4. Step 3: Service Area & Bio (src/components/vendor/steps/ServiceAreaStep.tsx)

- Geographic service areas
- Working languages
- Bio/description textarea
- Website URL
- External recommendations

### 5. Step 4: Review & Submit (src/components/vendor/steps/ReviewSubmitStep.tsx)

- Read-only summary of all fields
- Edit navigation (click section to jump to step)
- Submit button with confirmation

### 6. Profile Photo Upload (src/components/shared/ProfilePhotoUpload.tsx)

- Drag-and-drop upload zone
- Convex storage integration
- Preview with delete option
- File type/size validation

### 7. Form Validation (src/lib/validations/vendor-onboarding.ts)

- Zod schemas for each step
- i18n error message keys

### 8. Route (src/app/[locale]/(app)/onboarding/vendor-profile/page.tsx)

- Server component wrapping the wizard
- Auth-gated for service provider roles

### 9. Onboarding Redirect (src/app/[locale]/(app)/onboarding/page.tsx)

- Service providers redirected to vendor-profile onboarding

### 10. i18n

- +147 lines EN translations (vendorOnboarding namespace)
- +147 lines HE translations

## Files Created

- `src/components/vendor/VendorOnboardingWizard.tsx` (369 lines)
- `src/components/vendor/steps/BasicInfoStep.tsx` (169 lines)
- `src/components/vendor/steps/ProfessionalDetailsStep.tsx` (184 lines)
- `src/components/vendor/steps/ServiceAreaStep.tsx` (236 lines)
- `src/components/vendor/steps/ReviewSubmitStep.tsx` (179 lines)
- `src/components/shared/ProfilePhotoUpload.tsx` (172 lines)
- `src/lib/validations/vendor-onboarding.ts` (56 lines)
- `src/app/[locale]/(app)/onboarding/vendor-profile/page.tsx` (51 lines)

## Files Modified

- `src/app/[locale]/(app)/onboarding/page.tsx` — redirect for service providers
- `messages/en.json` — +147 lines vendorOnboarding namespace
- `messages/he.json` — +147 lines vendorOnboarding namespace

## Key Design Decisions

1. **Draft persistence:** localStorage auto-save prevents data loss on accidental navigation
2. **Resubmission:** Rejected vendors see their existing profile data pre-populated
3. **Shared component:** ProfilePhotoUpload is in shared/ for reuse across the app
4. **Validation per step:** Each step validates independently before allowing progression
