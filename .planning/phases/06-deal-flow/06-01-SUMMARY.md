---
phase: 06-deal-flow
plan: 01
subsystem: backend
tags: [convex, schema, deals, crud]
---

# Phase 6 Plan 01: Deals Schema & CRUD Summary

**Established the core deal flow data model with 7-stage pipeline and role-based CRUD operations.**

## Duration
Start: 2026-01-15T06:00:53Z
End: 2026-01-15T08:05:00Z
Total: ~2 hours

## Task Commits
| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | `0208f47` | Add deals table schema with stages and indexes |
| Task 2 | `67d57a0` | Create deals CRUD queries and mutations |
| Task 3 | `0594f0e` | Add sample deals seed data |

## Accomplishments
- Created deals table with 7-stage pipeline: interest, broker_assigned, mortgage, legal, closing, completed, cancelled
- Implemented 6 indexes for efficient role-based queries
- Built role-aware CRUD operations (list, get, getByProperty, create, updateStage, cancel)
- Added stage transition validation with defined valid transitions
- Implemented stage history tracking for audit trail
- Created seed data with 5 sample deals across various stages
- Added seedDeals/clearDeals mutations for testing

## Files Created/Modified
- `convex/schema.ts` - Added deals table and dealStage export
- `convex/deals.ts` - New file with queries and mutations
- `convex/seedData.ts` - Added SEED_DEALS array
- `convex/seed.ts` - Added seedDeals, clearDeals, updated seedAll

## Technical Decisions
1. **Stage transitions as code** - Valid transitions defined in VALID_TRANSITIONS constant rather than database-level constraints for flexibility
2. **Role-based list queries** - Each role sees only their relevant deals using dedicated indexes
3. **viewingAsRole support** - Admin role-switching works for deal queries
4. **Duplicate deal prevention** - Investors cannot create multiple active deals on same property
5. **Stage history as array** - Embedded in document for simplicity (denormalized)

## Verification Results
- `npx convex dev` - Passes (schema valid, functions compile)
- `npm run build` - Passes (no TypeScript errors)

## Next Step
Ready for 06-02-PLAN.md (Service provider request flow)
