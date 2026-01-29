# Plan 57-01 Summary: Schema Extension and Approval Backend

**Status:** ✓ Complete
**Completed:** 2026-01-29

## What Was Built

Extended the Convex schema and backend to support vendor approval workflow and profile photo uploads. This provides the foundation for all subsequent vendor registration features.

## Changes Made

### 1. Schema Extensions (convex/schema.ts)

- Added `approvalStatus` union type: draft, pending, approved, rejected
- Extended `serviceProviderProfiles` table with:
  - `approvalStatus` (optional for grandfathering)
  - `submittedAt` - submission timestamp
  - `reviewedAt` - review timestamp
  - `reviewedBy` - admin who reviewed
  - `rejectionReason` - reason for rejection
  - `websiteUrl` - vendor website link
  - `externalRecommendations` - free-text recommendations
- Added `by_approval_status` index to `serviceProviderProfiles`
- Extended `users` table with:
  - `customImageStorageId` - Convex-uploaded profile photo
- Extended `notificationType` union with:
  - `vendor_submitted`
  - `vendor_approved`
  - `vendor_rejected`

### 2. Notification Type Updates (convex/notifications.ts)

- Updated `notificationTypeValidator` with 3 new vendor notification types
- Updated `NotificationType` TypeScript type

### 3. Approval Workflow (convex/serviceProviderProfiles.ts)

**New Mutations:**
- `submitForApproval` - Vendors submit profile for admin review
- `approveVendor` - Admins approve pending vendors (admin-only)
- `rejectVendor` - Admins reject pending vendors with optional reason (admin-only)

**New Queries:**
- `listPendingVendors` - List all pending vendors for admin review (admin-only)
- `getMyApprovalStatus` - Vendors check their approval status

**Modified Queries:**
- `getMyProfile` - Now returns full profile with userName and userEmail for wizard pre-population
- `listByType` - Filters out unapproved vendors (grandfathers undefined as approved)
- `getProvidersByType` - Filters out unapproved vendors
- `getPublicProfile` - Hides unapproved profiles from non-owners and non-admins

**Modified Mutations:**
- `upsertProfile` - Sets `approvalStatus: "draft"` on new profiles

### 4. Profile Photo Upload (convex/users.ts)

**New Mutations:**
- `generateProfilePhotoUploadUrl` - Generate Convex upload URL
- `saveProfilePhoto` - Save uploaded photo, delete old one

**New Queries:**
- `getProfilePhotoUrl` - Get profile photo URL (custom or Clerk fallback)

**Modified Mutations:**
- `setUserRole` - Service providers now get `onboardingComplete: false` (forces onboarding)

## Verification

- ✓ TypeScript compilation succeeds
- ✓ All 5 new mutations compile: submitForApproval, approveVendor, rejectVendor, generateProfilePhotoUploadUrl, saveProfilePhoto
- ✓ All 4 new queries compile: listPendingVendors, getMyApprovalStatus, getProfilePhotoUrl, getMyProfile (updated)
- ✓ Existing queries filter by approval status
- ✓ Service providers forced through onboarding
- ✓ Grandfathering works (undefined = approved)
- ✓ State machine guards prevent invalid transitions

## Key Design Decisions

1. **Grandfathering:** All `approvalStatus` fields are optional. Existing providers without this field are treated as approved
2. **State Machine:** Only pending profiles can be approved/rejected (server-side guards)
3. **Profile Photo:** Delete old photo before saving new one to prevent orphaned files
4. **Visibility:** Unapproved profiles hidden from directory but visible to owner and admins
5. **Notifications:** Admins notified on submission, vendors notified on approval/rejection

## Next Steps

This plan enables:
- Plan 57-02: Vendor onboarding questionnaire UI
- Plan 57-03: Admin approval interface

## Files Modified

- `convex/schema.ts` - Schema extensions
- `convex/notifications.ts` - Notification types
- `convex/serviceProviderProfiles.ts` - Approval workflow
- `convex/users.ts` - Profile photo upload
