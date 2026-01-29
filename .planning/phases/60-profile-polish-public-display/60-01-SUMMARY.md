# Summary 60-01: Public Profile Enhancement with All Vendor Fields and i18n

## Status: ✅ COMPLETE

## What Was Built

### Backend (convex/serviceProviderProfiles.ts)
- Added `resolveProfilePhotoUrl()` helper — prefers custom uploaded photo over Clerk photo
- Updated 5 queries to use custom photos: `getProvidersByType`, `searchProviders`, `getWithUser`, `getPublicProfile`, `getPendingVendors`
- Added `websiteUrl` and `externalRecommendations` to `getPublicProfile` return

### Public Profile Page (src/app/[locale]/(app)/providers/[id]/page.tsx)
- **External Recommendations** section — rendered in About card with quote icon, styled block
- **Website URL** — added to Contact Info card with external link icon, auto-strips protocol for display
- **Custom Photo** — all avatar displays now use resolved custom photo URL

### Provider Directory & Search
- All provider cards and search results now show custom uploaded photos (when available)
- Pending vendors in admin view also show custom photos

### i18n
- Added `recommendations` and `website` keys in EN + HE

### Files Changed
- `convex/serviceProviderProfiles.ts` (enhanced — 5 queries updated + helper function)
- `src/app/[locale]/(app)/providers/[id]/page.tsx` (enhanced — recommendations + website + photo)
- `messages/en.json`, `messages/he.json` (added 2 keys each)

## Verification
- [x] `npx tsc --noEmit` passes
- [x] Public profile shows recommendations and website
- [x] Custom profile photo used across all provider displays
- [x] i18n complete for EN and HE
- [x] RTL layout correct (Badge + Globe pattern reused)

## Commit
`pending`
