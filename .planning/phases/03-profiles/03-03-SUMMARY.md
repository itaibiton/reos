# Phase 3 Plan 3: Service Provider Profile Schema Summary

**Created service provider profile schema and form for broker, mortgage advisor, and lawyer registration.**

## Accomplishments

- Added serviceProviderProfiles table to Convex schema with business information fields
- Created getMyProfile, upsertProfile, and getProvidersByType functions
- Built provider profile form with role-specific specializations

## Files Created/Modified

- `convex/schema.ts` - Added serviceProviderProfiles table with providerType, companyName, licenseNumber, specializations, serviceAreas, languages, bio, contact fields
- `convex/serviceProviderProfiles.ts` - Queries and mutations with specialization constants per provider type
- `src/app/(app)/profile/provider/page.tsx` - Complete profile form with dynamic specializations based on user role

## Decisions Made

- Role-specific specializations: Different checkbox options for broker, mortgage advisor, lawyer
- Reused SERVICE_AREAS constant (same Israeli locations as investor profiles)
- Provider type automatically set from user's role during upsert

## Issues Encountered

None

## Next Step

Ready for 03-04-PLAN.md: Profile Settings Page
