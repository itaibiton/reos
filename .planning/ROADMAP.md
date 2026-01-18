# Roadmap: REOS

## Overview

Building an end-to-end real estate investment platform connecting US investors with Israeli properties. The journey starts with foundational setup and authentication, moves through profile and marketplace systems, adds intelligent search, then implements the core deal flow orchestration, and culminates with dashboards and real-time communication features.

## Milestones

- ✅ [v1.0 MVP](milestones/v1.0-ROADMAP.md) (Phases 1-8) — SHIPPED 2026-01-17
- ✅ [v1.1 Investor Onboarding](milestones/v1.1-ROADMAP.md) (Phases 9-15) — SHIPPED 2026-01-18
- 🚧 **v1.2 Provider Experience** — Phases 16-20 (in progress)

## Completed Milestones

<details>
<summary>v1.0 MVP (Phases 1-8) — SHIPPED 2026-01-17</summary>

**17 phases, 40 plans, ~25,855 LOC TypeScript**

- [x] Phase 1: Foundation (2/2 plans) — completed 2026-01-12
- [x] Phase 1.1: Integrate Shadcn (1/1 plan) — completed 2026-01-12
- [x] Phase 1.2: Add All Shadcn Components (1/1 plan) — completed 2026-01-12
- [x] Phase 1.3: Create Design System Page (1/1 plan) — completed 2026-01-12
- [x] Phase 2: Authentication (3/3 plans) — completed 2026-01-13
- [x] Phase 3: Profiles (4/4 plans) — completed 2026-01-13
- [x] Phase 4: Property Marketplace (4/4 plans) — completed 2026-01-13
- [x] Phase 4.1: Edit Property (1/1 plan) — completed 2026-01-13
- [x] Phase 5: Smart Search (3/3 plans) — completed 2026-01-13
- [x] Phase 5.1: Add Also Regular Filter (1/1 plan) — completed 2026-01-13
- [x] Phase 5.2: Mock Data & Super User (1/1 plan) — completed 2026-01-14
- [x] Phase 5.3: Property Page Carousel and Map (2/2 plans) — completed 2026-01-14
- [x] Phase 5.4: Yad2-Style Property Page (3/3 plans) — completed 2026-01-15
- [x] Phase 6: Deal Flow (5/5 plans) — completed 2026-01-15
- [x] Phase 6.1: Multi-layout Chat (3/3 plans) — completed 2026-01-15
- [x] Phase 7: Dashboards (3/3 plans) — completed 2026-01-17
- [x] Phase 8: Real-time Features (2/2 plans) — completed 2026-01-17

[Full details →](milestones/v1.0-ROADMAP.md)

</details>

<details>
<summary>v1.1 Investor Onboarding (Phases 9-15) — SHIPPED 2026-01-18</summary>

**7 phases, 8 plans**

- [x] Phase 9: Onboarding Gate & State (1/1 plan) — completed 2026-01-18
- [x] Phase 10: Questionnaire UI Framework (1/1 plan) — completed 2026-01-18
- [x] Phase 11: Questionnaire Content - Part 1 (1/1 plan) — completed 2026-01-18
- [x] Phase 12: Questionnaire Content - Part 2 (1/1 plan) — completed 2026-01-18
- [x] Phase 13: Property Preferences & Location (1/1 plan) — completed 2026-01-18
- [x] Phase 14: AI Preferences & Service Selection (1/1 plan) — completed 2026-01-18
- [x] Phase 15: Profile Display & Edit (2/2 plans) — completed 2026-01-18

[Full details →](milestones/v1.1-ROADMAP.md)

</details>

## 🚧 v1.2 Provider Experience (In Progress)

**Milestone Goal:** Enhance the service provider experience with improved dashboards, client management, public profiles, analytics, and settings.

### Phase 16: Provider Dashboard Enhancement

**Goal**: Enhanced dashboard with client overview, pending requests, active deals summary
**Depends on**: v1.1 complete
**Research**: Unlikely (internal patterns)
**Plans**: 1/1 complete
**Status**: Complete
**Completed**: 2026-01-18

Plans:
- [x] 16-01: Active deals section, full-width layout, investor redirect

### Phase 16.1: Layout & Navigation Improvements (INSERTED)

**Goal**: Improve investor and provider navigation, favorites in filter bar, full-height provider sidebar
**Depends on**: Phase 16
**Research**: None (UI refinements)
**Plans**: 1/1 complete
**Status**: Complete
**Completed**: 2026-01-18

Plans:
- [x] 16.1-01: Investor sidebar cleanup, favorites toggle, provider layout restructure

**Changes:**
- Removed Dashboard from investor sidebar (investors redirect to /properties)
- Removed Saved Properties page, added favorites toggle to filter bar with heart icon
- Provider layout: sidebar spans full height with logo, header inline in main content

### Phase 16.3: Shadcn Sidebar Layout (INSERTED)

**Goal**: Complete layout overhaul using Shadcn sidebar component with role-based navigation for all user types (Investor, Broker, Mortgage Advisor, Lawyer, Accountant, Notary, Tax Consultant, Appraiser)
**Depends on**: Phase 16.1
**Research**: None (Shadcn docs reference)
**Plans**: 2/2 complete
**Status**: Complete
**Completed**: 2026-01-18

Plans:
- [x] 16.3-01: Core Sidebar Component - Navigation config, Shadcn sidebar, AppShell integration
- [x] 16.3-02: Placeholder Pages - ComingSoon component, 21 new route pages

**Details:**
- Replace current custom sidebar with Shadcn Sidebar component
- Implement role-based navigation per sidebar-routes.md specification
- Add relevant icons for all menu items (lucide-react)
- Create placeholder pages for non-existent routes with "Coming Soon" messages
- Support collapsible groups (Marketplace, Property Management, etc.)

### Phase 17: Client Management

**Goal**: Client list, client details, deal history per client
**Depends on**: Phase 16
**Research**: Unlikely (internal patterns)
**Plans**: 1/2 complete
**Status**: In progress

Plans:
- [x] 17-01: Backend queries (getClients, getClientDetails)
- [ ] 17-02: Client management UI

### Phase 18: Service Provider Profiles

**Goal**: Public-facing profiles, reviews/ratings, portfolio showcase
**Depends on**: Phase 17
**Research**: Unlikely (internal patterns)
**Plans**: TBD

Plans:
- [ ] 18-01: TBD

### Phase 19: Provider Analytics

**Goal**: Earnings tracking, conversion metrics, performance insights
**Depends on**: Phase 18
**Research**: Unlikely (internal patterns)
**Plans**: TBD

Plans:
- [ ] 19-01: TBD

### Phase 20: Provider Settings & Availability

**Goal**: Availability calendar, service area management, notification preferences
**Depends on**: Phase 19
**Research**: Unlikely (internal patterns)
**Plans**: TBD

Plans:
- [ ] 20-01: TBD

## Progress

| Milestone | Phases | Plans | Status | Shipped |
|-----------|--------|-------|--------|---------|
| v1.0 MVP | 17 | 40 | Complete | 2026-01-17 |
| v1.1 Investor Onboarding | 7 | 8 | Complete | 2026-01-18 |
| v1.2 Provider Experience | 6 | 5/? | In Progress | - |

| Phase | Milestone | Plans | Status | Completed |
|-------|-----------|-------|--------|-----------|
| 16. Provider Dashboard Enhancement | v1.2 | 1/1 | Complete | 2026-01-18 |
| 16.1 Layout & Navigation Improvements | v1.2 | 1/1 | Complete | 2026-01-18 |
| 16.3 Shadcn Sidebar Layout | v1.2 | 2/2 | Complete | 2026-01-18 |
| 17. Client Management | v1.2 | 1/2 | In progress | - |
| 18. Service Provider Profiles | v1.2 | 0/? | Not started | - |
| 19. Provider Analytics | v1.2 | 0/? | Not started | - |
| 20. Provider Settings & Availability | v1.2 | 0/? | Not started | - |

---

*See [PROJECT.md](PROJECT.md) for current state and requirements*
