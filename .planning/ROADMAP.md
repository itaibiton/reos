# Roadmap: REOS

## Overview

Building an end-to-end real estate investment platform connecting US investors with Israeli properties. The journey starts with foundational setup and authentication, moves through profile and marketplace systems, adds intelligent search, then implements the core deal flow orchestration, and culminates with dashboards and real-time communication features.

## Domain Expertise

None

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Foundation** - Project setup, Convex integration, basic layout
- [x] **Phase 1.1: Integrate Shadcn** (INSERTED) - Urgent Shadcn integration work
- [x] **Phase 1.2: Add All Shadcn Components** (INSERTED) - Install complete Shadcn component library
- [x] **Phase 1.3: Create Design System Page** (INSERTED) - Design system documentation page
- [x] **Phase 2: Authentication** - Clerk integration, role-based access
- [x] **Phase 3: Profiles** - Investor and service provider profile systems
- [x] **Phase 4: Property Marketplace** - Listings, admin upload, detail pages, favorites
- [x] **Phase 4.1: Edit Property** (INSERTED) - Edit existing property listings
- [x] **Phase 5: Smart Search** - Natural language search to structured filters
- [x] **Phase 5.1: Add Also Regular Filter** (INSERTED) - Add traditional filter UI alongside smart search
- [x] **Phase 5.2: Mock Data & Super User** (INSERTED) - Mock data, super user role switching, Israeli properties
- [x] **Phase 5.3: Property Page Carousel and Interactive Map** (INSERTED) - Image carousel and map for property detail page
- [x] **Phase 5.4: Yad2-Style Property Page** (INSERTED) - Full property detail page redesign with Yad2-inspired features
- [ ] **Phase 6: Deal Flow** - Deal stages, service provider requests, file storage
- [ ] **Phase 7: Dashboards** - Investor and service provider dashboards
- [ ] **Phase 8: Real-time Features** - Chat and live updates

## Phase Details

### Phase 1: Foundation
**Goal**: Project scaffolding with Next.js, Convex backend connected, Shadcn/ui components, and base layout structure
**Depends on**: Nothing (first phase)
**Research**: Unlikely (established patterns)
**Plans**: 2 plans

Plans:
- [x] 01-01: Project scaffolding (Next.js + Convex + Shadcn)
- [x] 01-02: Base layout (header, sidebar, main content)

### Phase 1.1: Integrate Shadcn (INSERTED)
**Goal**: [Urgent work - to be planned]
**Depends on**: Phase 1
**Research**: Unlikely
**Plans**: 0 plans

Plans:
- [ ] TBD (run /gsd:plan-phase 1.1 to break down)

**Details:**
[To be added during planning]

### Phase 1.2: Add All Shadcn Components (INSERTED)
**Goal**: [Urgent work - to be planned]
**Depends on**: Phase 1.1
**Research**: Unlikely
**Plans**: 0 plans

Plans:
- [ ] TBD (run /gsd:plan-phase 1.2 to break down)

**Details:**
[To be added during planning]

### Phase 1.3: Create Design System Page (INSERTED)
**Goal**: Design system documentation page showcasing all 53 Shadcn/ui components
**Depends on**: Phase 1.2
**Research**: Unlikely
**Plans**: 1 plan

Plans:
- [x] 01.3-01: Design system page with component showcases

**Details:**
Created /design-system route with 5 category tabs (Buttons & Inputs, Layout, Feedback, Overlays, Data Display), interactive examples for 25+ components, and fixed Radix scroll-lock issue.

### Phase 2: Authentication
**Goal**: Clerk authentication with investor and service provider roles, protected routes, and Convex user sync
**Depends on**: Phase 1.3
**Research**: Likely (new integration)
**Research topics**: Clerk-Convex integration patterns, multi-role setup, JWT handling with Convex
**Plans**: 3 plans

Plans:
- [x] 02-01: Clerk installation + Convex integration
- [x] 02-02: User schema + sync functions
- [x] 02-03: Protected routes + auth UI

**Details:**
Uses ConvexProviderWithClerk for auth integration. Users table stores role (investor, broker, mortgage_advisor, lawyer). Auto-sync from Clerk on first sign-in. Route groups: (main) public landing, (auth) sign-in/sign-up, (app) protected pages with AppShell.

### Phase 3: Profiles
**Goal**: Investor profile builder (preferences, budget, criteria) and service provider registration (broker, mortgage, lawyer)
**Depends on**: Phase 2
**Research**: Unlikely (CRUD using established auth)
**Plans**: 4 plans

Plans:
- [x] 03-01: Onboarding flow (role selection, redirect incomplete users)
- [x] 03-02: Investor profile schema + form
- [x] 03-03: Service provider profile schema + form
- [x] 03-04: Settings page with role-based routing

**Details:**
Onboarding captures user role at /onboarding. Investor profiles store investment preferences (property types, budget, risk tolerance, timeline). Service provider profiles store business info (company, license, specializations, service areas, languages). Settings page at /settings shows role-appropriate profile form in two-column layout. Shared constants in src/lib/constants.ts.

### Phase 4: Property Marketplace
**Goal**: Property listing display with metrics, admin upload interface, detail pages, save/favorite functionality
**Depends on**: Phase 3
**Research**: Unlikely (standard patterns)
**Plans**: 4 plans

Plans:
- [x] 04-01: Property schema + admin upload form
- [x] 04-02: Property listings page (marketplace)
- [x] 04-03: Property detail page + favorites
- [x] 04-04: Navigation integration + verification

### Phase 4.1: Edit Property (INSERTED)
**Goal**: Edit existing property listings
**Depends on**: Phase 4
**Research**: Unlikely
**Plans**: 1 plan

Plans:
- [x] 04.1-01: PropertyForm edit mode + edit page

**Details:**
Extended PropertyForm with mode prop (create/edit) and initialData prop for pre-populating fields. Created edit page at /properties/[id]/edit that fetches property and passes to form. Handles loading and not-found states.

### Phase 5: Smart Search
**Goal**: Natural language search input parsed to structured property filters
**Depends on**: Phase 4
**Research**: Likely (NLP integration)
**Research topics**: NLP library options for Next.js, structured filter generation from natural language
**Plans**: 3 plans

Plans:
- [x] 05-01: AI Parser Setup (Anthropic SDK + parseSearchQuery action)
- [x] 05-02: Enhanced Query (extend properties.list with full filters)
- [x] 05-03: Search UI (SearchInput, FilterChips, marketplace integration)

**Details:**
Uses Claude AI (Anthropic SDK) to parse natural language queries into structured PropertyFilters. parseSearchQuery Convex action handles the NL→filter conversion.

### Phase 5.1: Add Also Regular Filter (INSERTED)
**Goal**: Add traditional filter dropdowns/inputs alongside smart search for users who prefer explicit controls
**Depends on**: Phase 5
**Research**: Unlikely
**Plans**: 1 plan

Plans:
- [x] 05.1-01: PropertyFiltersPanel component with popover UI

**Details:**
Created PropertyFiltersPanel with Popover dropdown containing filter controls (City, Property Type, Bedrooms, Bathrooms, Price Range, Size Range). Uses draft state pattern - changes only apply on "Apply Filters" button click. FilterChips displayed inline with Filters button. Uses `__any__` sentinel value for Radix Select empty state.

### Phase 5.2: Mock Data & Super User (INSERTED)
**Goal**: Add mock data system, super user with role-switching dropdown, and variety of Israeli property listings
**Depends on**: Phase 5.1
**Research**: Unlikely
**Plans**: 1 plan

Plans:
- [x] 05.2-01: Admin role, seed data, role-switching UI

**Details:**
Added "admin" as 5th user role with viewingAsRole field for impersonation. Created 15 mock Israeli properties across 9 cities. Built role-switching dropdown (admin-only) that changes sidebar navigation and settings based on effective role.

### Phase 5.3: Property Page Carousel and Interactive Map (INSERTED)
**Goal**: Replace static image display with interactive carousel and add property location map
**Depends on**: Phase 5.2
**Research**: Unlikely
**Plans**: 2 plans

Plans:
- [x] 05.3-01: Schema coordinates + seed data + PropertyImageCarousel component
- [x] 05.3-02: PropertyMap component + property detail page integration

**Details:**
Adds latitude/longitude to property schema and seed data. Creates PropertyImageCarousel using Shadcn/embla-carousel. Creates PropertyMap using react-leaflet with OpenStreetMap tiles. Integrates both into property detail page.

### Phase 5.4: Yad2-Style Property Page (INSERTED)
**Goal**: Redesign property detail page with Yad2-inspired layout and features: property amenities, neighborhood info, mortgage calculator, property value history, and sold properties in area
**Depends on**: Phase 5.3
**Research**: Unlikely (UI components with Shadcn charts/tables)
**Plans**: 3 plans

Plans:
- [x] 05.4-01: Schema extension (amenities, neighborhoods, price history)
- [x] 05.4-02: Property amenities display + mortgage calculator
- [x] 05.4-03: Neighborhood info + value history + sold properties + page redesign

**Details:**
Yad2-inspired features to implement:
- **מה יש בנכס** (Property Amenities): Grid/list of property features (AC, elevator, parking, storage, etc.)
- **מידע על השכונה** (Neighborhood Info): Area statistics, nearby amenities, demographics
- **מחשבון משכנתא** (Mortgage Calculator): Interactive calculator with principal, interest, term inputs
- **היסטוריית שווי** (Value History): Property/area price trends over time using Shadcn charts
- **נכסים שנמכרו באזור** (Sold in Area): Table of recent sales with property details, prices, dates

Database extensions needed:
- Property amenities enum/flags
- Neighborhood data table (city/area statistics)
- Historical price data table
- Sold properties table (or status field on existing properties)

Uses Shadcn components: Charts (Recharts), Tables, Cards, Tabs for section organization.

### Phase 6: Deal Flow
**Goal**: Deal stages tracking, service provider requests, file storage per deal, client handoffs between providers
**Depends on**: Phase 3
**Research**: Level 1 (Convex file storage is documented)
**Plans**: 5 plans

Plans:
- [x] 06-01: Deals schema + basic CRUD
- [ ] 06-02: Service provider request flow
- [ ] 06-03: File storage per deal (Convex storage)
- [ ] 06-04: Deal transitions + handoffs
- [ ] 06-05: Deals UI (list + detail pages)

**Details:**
Deal flow is the core value of the platform. Implements:
- 7-stage deal progression (interest → broker_assigned → mortgage → legal → closing → completed, + cancelled)
- Service requests between investors and providers
- Convex file storage for deal documents
- Activity logging for audit trail
- Provider handoff workflow

### Phase 7: Dashboards
**Goal**: Investor dashboard (overview, saved properties, recommendations) and service provider dashboard (clients, leads)
**Depends on**: Phase 4, Phase 6
**Research**: Unlikely (internal UI patterns)
**Plans**: TBD

### Phase 8: Real-time Features
**Goal**: Real-time chat between investors and service providers, live deal updates
**Depends on**: Phase 6, Phase 7
**Research**: Likely (real-time architecture)
**Research topics**: Convex subscriptions for chat, real-time presence, message threading patterns
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 1.1 → 1.2 → 1.3 → 2 → 3 → 4 → 4.1 → 5 → 5.1 → 5.2 → 5.3 → 5.4 → 6 → 7 → 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 2/2 | Complete | 2026-01-12 |
| 1.1 Integrate Shadcn (INSERTED) | 1/1 | Complete | 2026-01-12 |
| 1.2 Add All Shadcn Components (INSERTED) | 1/1 | Complete | 2026-01-12 |
| 1.3 Create Design System Page (INSERTED) | 1/1 | Complete | 2026-01-12 |
| 2. Authentication | 3/3 | Complete | 2026-01-13 |
| 3. Profiles | 4/4 | Complete | 2026-01-13 |
| 4. Property Marketplace | 4/4 | Complete | 2026-01-13 |
| 4.1 Edit Property (INSERTED) | 1/1 | Complete | 2026-01-13 |
| 5. Smart Search | 3/3 | Complete | 2026-01-13 |
| 5.1 Add Also Regular Filter (INSERTED) | 1/1 | Complete | 2026-01-13 |
| 5.2 Mock Data & Super User (INSERTED) | 1/1 | Complete | 2026-01-14 |
| 5.3 Property Page Carousel and Interactive Map (INSERTED) | 2/2 | Complete | 2026-01-14 |
| 5.4 Yad2-Style Property Page (INSERTED) | 3/3 | Complete | 2026-01-15 |
| 6. Deal Flow | 1/5 | In progress | - |
| 7. Dashboards | 0/TBD | Not started | - |
| 8. Real-time Features | 0/TBD | Not started | - |
