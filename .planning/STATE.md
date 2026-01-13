# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-12)

**Core value:** Deal flow tracking from interest to close.
**Current focus:** Phase 5.1 — Add Also Regular Filter

## Current Position

Phase: 5.1 of 8 (Add Also Regular Filter)
Plan: 1 of 1 in current phase
Status: Phase 5.1 complete
Last activity: 2026-01-13 — Completed 05.1-01-PLAN.md (Traditional Filters)

Progress: █████████░ 90%

## Performance Metrics

**Velocity:**
- Total plans completed: 20
- Average duration: 7 min
- Total execution time: 2.5 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 | 2/2 | 10 min | 5 min |
| 1.1 | 1/1 | 8 min | 8 min |
| 1.2 | 1/1 | 12 min | 12 min |
| 1.3 | 1/1 | 15 min | 15 min |
| 2 | 3/3 | 25 min | 8 min |
| 3 | 4/4 | 30 min | 7.5 min |
| 4 | 4/4 | 20 min | 5 min |
| 4.1 | 1/1 | 3 min | 3 min |
| 5 | 3/3 | 21 min | 7 min |
| 5.1 | 1/1 | 12 min | 12 min |

**Recent Trend:**
- Last 5 plans: 3 min, 12 min, 1 min, 8 min, 12 min
- Trend: Fast execution

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Phase 1: Used Tailwind v4 (Shadcn auto-detected)
- Phase 1: Convex project created as "reos"
- Phase 1: Sidebar overlay pattern for mobile
- Phase 1.1: Hugeicons for custom components, lucide-react for Shadcn internals
- Phase 1.1: Inter font, small radius (0.25rem) for compact design
- Phase 1.2: Installed all 53 Shadcn components upfront
- Phase 1.3: CSS override for Radix scroll-lock (body[data-scroll-locked] with overflow: visible)
- Phase 2: ConvexProviderWithClerk for auth integration
- Phase 2: Route groups: (main) public, (auth) auth pages, (app) protected
- Phase 2: User roles: investor, broker, mortgage_advisor, lawyer
- Phase 3: Two-column layout for profile forms (lg:grid-cols-2)
- Phase 3: Shared constants in src/lib/constants.ts for profile options
- Phase 3: MultiSelectPopover uses native CSS scrolling
- Phase 4: USD/ILS rate as constant (3.7) for MVP, not live API
- Phase 4: All authenticated users can create properties (no admin restriction for MVP)
- Phase 4: Page layout uses `<div className="p-6">` — content starts at top, no centering/max-width
- Phase 4.1: PropertyForm uses props (mode, propertyId, initialData) for create/edit behavior
- Phase 4.1: Edit pages at /resource/[id]/edit route pattern
- Phase 4: PropertyCard component pattern with investment metrics display
- Phase 4: Currency formatting with Intl.NumberFormat for USD/ILS
- Phase 4: Skeleton loaders matching card structure for smooth loading
- Phase 4: SaveButton variants: "default" (full-width) and "overlay" (compact circle)
- Phase 4: Compound index by_user_and_property for fast favorite lookups
- Phase 4: Detail page two-column layout with sticky right sidebar
- Phase 5: Claude 3 Haiku for search parsing (speed/cost efficiency)
- Phase 5: Convex action for external API calls (not query/mutation)
- Phase 5: Graceful error handling returns empty filters (fallback to all properties)
- Phase 5: In-memory filtering after by_status index (Convex single-index constraint)
- Phase 5: Properties with undefined values excluded when filters active
- Phase 5.1: Popover for filter panel (not Collapsible)
- Phase 5.1: Filters require Apply button (draft state pattern)
- Phase 5.1: Sentinel value `__any__` for Radix Select empty state

### Deferred Issues

None yet.

### Blockers/Concerns

None yet.

### Roadmap Evolution

- Phase 1.1 inserted after Phase 1: Integrate Shadcn (COMPLETE)
- Phase 1.2 inserted after Phase 1.1: Add All Shadcn Components (COMPLETE)
- Phase 1.3 inserted after Phase 1.2: Create Design System Page (COMPLETE)
- Phase 4.1 inserted after Phase 4: Edit Property (COMPLETE)
- Phase 5.1 inserted after Phase 5: Add Also Regular Filter (URGENT)

## Session Continuity

Last session: 2026-01-13
Stopped at: Completed 05.1-01-PLAN.md (Traditional Filters) — Phase 5.1 complete
Resume file: None
