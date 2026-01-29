# Plan 57-03 Summary: Admin Approval Interface and Vendor Visibility Gating

**Status:** ✓ Complete
**Completed:** 2026-01-29

## What Was Built

Admin interface for reviewing and approving/rejecting vendor applications, plus vendor-facing status banners showing approval state.

## Changes Made

### 1. Admin Pending Vendors Page (src/app/[locale]/(app)/admin/vendors/pending/page.tsx)

- Admin-only route at `/admin/vendors/pending`
- Auth-gated for admin role
- Real-time list of pending vendor applications

### 2. Pending Vendors Table (src/components/admin/PendingVendorsTable.tsx)

- Desktop: table layout with columns (name, type, email, submitted date, actions)
- Mobile: card layout with same data
- Real-time updates via Convex subscriptions
- Search/filter capabilities

### 3. Vendor Approval Modal (src/components/admin/VendorApprovalModal.tsx)

- Full profile review in modal/dialog
- Profile photo display
- All registration fields visible
- Approve button — sets status to approved
- Reject button — with optional reason textarea
- State guards prevent double-actions

### 4. Vendor Approval Banner (src/components/vendor/VendorApprovalBanner.tsx)

- Displayed on vendor dashboard
- Status-dependent styling:
  - **Draft** (yellow): "Complete Your Profile" with CTA to onboarding
  - **Pending** (blue): "Profile Under Review" — informational
  - **Rejected** (red): "Profile Not Approved" with rejection reason + "Revise & Resubmit" CTA
  - **Approved**: No banner shown

### 5. Dashboard Integration (src/app/[locale]/(app)/dashboard/page.tsx)

- VendorApprovalBanner imported and rendered for service provider roles

### 6. i18n

- +67 lines EN translations (adminVendors namespace)
- +67 lines HE translations (adminVendors namespace)

## Files Created

- `src/app/[locale]/(app)/admin/vendors/pending/page.tsx` (73 lines)
- `src/components/admin/PendingVendorsTable.tsx` (200 lines)
- `src/components/admin/VendorApprovalModal.tsx` (389 lines)
- `src/components/vendor/VendorApprovalBanner.tsx` (116 lines)

## Files Modified

- `src/app/[locale]/(app)/dashboard/page.tsx` — added VendorApprovalBanner
- `messages/en.json` — +67 lines adminVendors namespace
- `messages/he.json` — +67 lines adminVendors namespace

## Complete Vendor Flow

1. Vendor selects service provider role → redirected to `/onboarding/vendor-profile`
2. Completes 4-step wizard with photo upload → submits for approval
3. Admin reviews at `/admin/vendors/pending` → approves or rejects with reason
4. Vendor sees status banner on dashboard
5. Approved vendors appear in provider directory
6. Rejected vendors can revise and resubmit
