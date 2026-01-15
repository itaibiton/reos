# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-12)

**Core value:** Deal flow tracking from interest to close.
**Current focus:** Phase 6 — Deal Flow (core feature)

## Current Position

Phase: 6 of 8 (Deal Flow)
Plan: 5 of 5 in current phase
Status: Phase complete
Last activity: 2026-01-15 — Completed 06-05-PLAN.md

Progress: █████████░ 100% (Phase 6 complete)

## Performance Metrics

**Velocity:**
- Total plans completed: 30
- Average duration: 9 min
- Total execution time: 4.4 hours

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
| 5.2 | 1/1 | 18 min | 18 min |
| 5.3 | 2/2 | 48 min | 24 min |
| 5.4 | 3/3 | 26 min | 8.7 min |
| 6 | 5/5 | 27 min | 5.4 min |

**Recent Trend:**
- Last 5 plans: 5 min, 3 min, 3 min, 11 min
- Trend: UI plans slightly longer due to human verification

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
- Phase 5.2: viewingAsRole field separate from role for admin impersonation
- Phase 5.2: effectiveRole = viewingAsRole ?? role pattern for role-aware UI
- Phase 5.2: Role-based Sidebar navigation (different items per role)
- Phase 5.2: Property card image height h-48 (192px)
- Phase 5.3: OpenStreetMap tiles (free, no API key required)
- Phase 5.3: Dynamic import with ssr:false for Leaflet SSR compatibility
- Phase 5.3: Marker icons from unpkg CDN (avoids bundler issues)
- Phase 5.3: Thumbnail row for carousel navigation (better UX than dots)
- Phase 5.3: Map at 320px width on marketplace, at top on detail page
- Phase 5.4: Tabbed interface for property detail (Overview, Amenities, Investment, Area)
- Phase 5.4: InvestorSearchBar uses full-width search input (no expand/collapse)
- Phase 5.4: Mobile filters use Sheet component as bottom drawer
- Phase 5.4: AppShell investor layout uses h-screen flex flex-col for proper stacking
- Phase 6: Request status uses 4-state union (pending, accepted, declined, cancelled)
- Phase 6: Provider acceptance auto-assigns to deal field (brokerId/mortgageAdvisorId/lawyerId)
- Phase 6: Broker acceptance advances deal stage from "interest" to "broker_assigned"
- Phase 6: Provider recommendations match property city to provider serviceAreas
- Phase 6: File categories: contract, id_document, financial, legal, other
- Phase 6: File visibility: "all" (all participants) or "providers_only" (service providers only)
- Phase 6: Convex storage pattern: generateUploadUrl → POST file → saveFile with storageId
- Phase 6: Activity log captures all deal events (stage_change, file_uploaded, handoffs)
- Phase 6: Handoffs use existing serviceRequests for consistency
- Phase 6: Stage-to-provider mapping: broker_assigned→broker, mortgage→mortgage_advisor, legal→lawyer
- Phase 6: Stage progress as horizontal step indicator with completed/current/upcoming states
- Phase 6: Deal cards show property image, title, city, price, stage badge, provider count
- Phase 6: Four tabs on deal detail page: Overview, Providers, Files, Activity
- Phase 6: "Start Deal" button on property pages for investors (creates deal + redirects)

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
- Phase 5.2 inserted after Phase 5.1: Mock Data & Super User (COMPLETE)
- Phase 5.3 inserted after Phase 5.2: Property Page Carousel and Interactive Map (COMPLETE)
- Phase 5.4 inserted after Phase 5.3: Yad2-Style Property Page (URGENT)

## Session Continuity

Last session: 2026-01-15
Stopped at: Completed 06-05-PLAN.md (Phase 6 complete)
Resume file: None
Next: Plan Phase 7 (run /gsd:plan-phase 7)
