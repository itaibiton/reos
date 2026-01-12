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
- [ ] **Phase 3: Profiles** - Investor and service provider profile systems
- [ ] **Phase 4: Property Marketplace** - Listings, admin upload, detail pages, favorites
- [ ] **Phase 5: Smart Search** - Natural language search to structured filters
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
**Plans**: TBD

### Phase 4: Property Marketplace
**Goal**: Property listing display with metrics, admin upload interface, detail pages, save/favorite functionality
**Depends on**: Phase 3
**Research**: Unlikely (standard patterns)
**Plans**: TBD

### Phase 5: Smart Search
**Goal**: Natural language search input parsed to structured property filters
**Depends on**: Phase 4
**Research**: Likely (NLP integration)
**Research topics**: NLP library options for Next.js, structured filter generation from natural language
**Plans**: TBD

### Phase 6: Deal Flow
**Goal**: Deal stages tracking, service provider requests, file storage per deal, client handoffs between providers
**Depends on**: Phase 3
**Research**: Likely (file storage + state machine)
**Research topics**: Convex file storage patterns, deal state machines, multi-party access control
**Plans**: TBD

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
Phases execute in numeric order: 1 → 1.1 → 1.2 → 1.3 → 2 → 3 → 4 → 5 → 6 → 7 → 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 2/2 | Complete | 2026-01-12 |
| 1.1 Integrate Shadcn (INSERTED) | 1/1 | Complete | 2026-01-12 |
| 1.2 Add All Shadcn Components (INSERTED) | 1/1 | Complete | 2026-01-12 |
| 1.3 Create Design System Page (INSERTED) | 1/1 | Complete | 2026-01-12 |
| 2. Authentication | 3/3 | Complete | 2026-01-13 |
| 3. Profiles | 0/TBD | Not started | - |
| 4. Property Marketplace | 0/TBD | Not started | - |
| 5. Smart Search | 0/TBD | Not started | - |
| 6. Deal Flow | 0/TBD | Not started | - |
| 7. Dashboards | 0/TBD | Not started | - |
| 8. Real-time Features | 0/TBD | Not started | - |
