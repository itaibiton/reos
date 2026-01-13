# Phase 3 Plan 2: Investor Profile Schema Summary

**Created investor profile schema and form for collecting investment preferences.**

## Accomplishments

- Added investorProfiles table to Convex schema with all required fields
- Created getMyProfile query and upsertProfile mutation with validation
- Built investor profile form page with property types, locations, budget, risk tolerance, timeline, and notes

## Files Created/Modified

- `convex/schema.ts` - Added investorProfiles table with propertyTypes, targetLocations, budget range, risk tolerance, timeline fields
- `convex/investorProfiles.ts` - getMyProfile query and upsertProfile mutation with constants for UI options
- `src/app/(app)/profile/investor/page.tsx` - Complete profile form with checkboxes, radio groups, inputs, and validation

## Decisions Made

- Exported constants (PROPERTY_TYPES, ISRAELI_LOCATIONS, etc.) from Convex for UI reuse
- Used tag-style selection for locations (click to toggle) for better UX with many options
- Client-side validation before submission with error messages

## Issues Encountered

None

## Next Step

Ready for 03-03-PLAN.md: Service Provider Profile Schema
