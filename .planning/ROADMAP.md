# Roadmap: REOS

## Overview

Building an end-to-end real estate investment platform connecting US investors with Israeli properties. The journey starts with foundational setup and authentication, moves through profile and marketplace systems, adds intelligent search, then implements the core deal flow orchestration, and culminates with dashboards and real-time communication features.

## Milestones

- [v1.0 MVP](milestones/v1.0-ROADMAP.md) (Phases 1-8) — SHIPPED 2026-01-17
- [v1.1 Investor Onboarding](milestones/v1.1-ROADMAP.md) (Phases 9-15) — SHIPPED 2026-01-18
- **v1.2 Provider Experience** (Phases 16-20) — SHIPPED 2026-01-19
- **v1.3 Social Feed & Global Community** — Phases 21-27 (in progress)

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

## v1.2 Provider Experience (Complete)

**Milestone Goal:** Enhance the service provider experience with improved dashboards, client management, public profiles, analytics, and settings.
**Shipped:** 2026-01-19

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
**Plans**: 2/2 complete
**Status**: Complete
**Completed**: 2026-01-18

Plans:
- [x] 17-01: Backend queries (getClients, getClientDetails)
- [x] 17-02: Client management UI

### Phase 18: Service Provider Profiles

**Goal**: Public-facing profiles, reviews/ratings, portfolio showcase
**Depends on**: Phase 17
**Research**: Unlikely (internal patterns)
**Plans**: 2/2 complete
**Status**: Complete
**Completed**: 2026-01-19

Plans:
- [x] 18-01: Schema & backend (reviews table, addReview, getPublicProfile)
- [x] 18-02: Frontend (listing page, profile page, reviews, portfolio)

### Phase 19: Provider Analytics

**Goal**: Earnings tracking, conversion metrics, performance insights
**Depends on**: Phase 18
**Research**: Unlikely (internal patterns)
**Plans**: 1/1 complete
**Status**: Complete
**Completed**: 2026-01-19

Plans:
- [x] 19-01: Analytics backend queries & dashboard UI

### Phase 20: Provider Settings & Availability

**Goal**: Availability calendar, service area management, notification preferences
**Depends on**: Phase 19
**Research**: Unlikely (internal patterns)
**Plans**: 2/2 complete
**Status**: Complete
**Completed**: 2026-01-19

Plans:
- [x] 20-01: Backend schema & queries (availability + notification preferences)
- [x] 20-02: Settings UI with Availability & Notifications tabs

## v1.3 Social Feed & Global Community (In Progress)

**Milestone Goal:** Transform REOS into a social real estate platform with a feed for sharing properties, service requests, and discussions. Enable likes, saves, shares, following users, and public profiles with activity streams. Make it the global all-in-one platform for real estate professionals and investors.

### Phase 21: Feed Infrastructure

**Goal**: Create posts table, feed queries, and define post types (property listing, service request, discussion)
**Depends on**: v1.2 complete
**Research**: Complete (21-RESEARCH.md)
**Plans**: 2/2 complete
**Status**: Complete
**Completed**: 2026-01-19

Plans:
- [x] 21-01: Schema + post creation mutations + feed queries
- [x] 21-02: Like/save/follow mutations with atomic counters

### Phase 22: Post Creation UI

**Goal**: UI for creating posts - upload properties, request services, start discussions
**Depends on**: Phase 21
**Research**: Unlikely (internal patterns)
**Plans**: 2/2 complete
**Status**: Complete
**Completed**: 2026-01-19

Plans:
- [x] 22-01: CreatePostDialog with tabbed interface for Discussion and Service Request posts
- [x] 22-02: PropertySelector component and property listing post creation

### Phase 23: Feed Display

**Goal**: Main feed page with infinite scroll, post cards, filtering by post type
**Depends on**: Phase 22
**Research**: Unlikely (internal patterns)
**Plans**: 2/2 complete
**Status**: Complete
**Completed**: 2026-01-19

Plans:
- [x] 23-01: Post card components (PropertyPostCard, ServiceRequestPostCard, DiscussionPostCard)
- [x] 23-02: Feed page with infinite scroll, filtering, create button

### Phase 24: Social Interactions

**Goal**: Like, save, share, and comment on posts
**Depends on**: Phase 23
**Research**: Unlikely (internal patterns)
**Plans**: 4/4 complete
**Status**: Complete
**Completed**: 2026-01-19

Plans:
- [x] 24-01: Interactive like/save buttons with optimistic updates
- [x] 24-02: Comments schema and backend mutations
- [x] 24-03: Comment UI with expandable section
- [x] 24-04: Share button with copy to clipboard

### Phase 25: User Following

**Goal**: Follow users, follower/following counts, personalized following feed
**Depends on**: Phase 24
**Research**: Unlikely (internal patterns)
**Plans**: 2/2 complete
**Status**: Complete
**Completed**: 2026-01-19

Plans:
- [x] 25-01: FollowButton component + Following feed tab
- [x] 25-02: FollowStats + FollowListDialog components

### Phase 26: User Profiles Revamp

**Goal**: Public profile pages showing posts, activity, followers, portfolio - like Facebook/Instagram profiles
**Depends on**: Phase 25
**Research**: Unlikely (internal patterns)
**Plans**: TBD

Plans:
- [ ] 26-01: TBD

### Phase 27: Global Discovery

**Goal**: Search posts/users globally, trending content, recommendations
**Depends on**: Phase 26
**Research**: Likely (search/ranking algorithms)
**Research topics**: Content ranking, trending algorithms, recommendation systems
**Plans**: TBD

Plans:
- [ ] 27-01: TBD

## Progress

| Milestone | Phases | Plans | Status | Shipped |
|-----------|--------|-------|--------|---------|
| v1.0 MVP | 17 | 40 | Complete | 2026-01-17 |
| v1.1 Investor Onboarding | 7 | 8 | Complete | 2026-01-18 |
| v1.2 Provider Experience | 6 | 11 | Complete | 2026-01-19 |
| v1.3 Social Feed & Global Community | 7 | 14/? | In Progress | - |

| Phase | Milestone | Plans | Status | Completed |
|-------|-----------|-------|--------|-----------|
| 16. Provider Dashboard Enhancement | v1.2 | 1/1 | Complete | 2026-01-18 |
| 16.1 Layout & Navigation Improvements | v1.2 | 1/1 | Complete | 2026-01-18 |
| 16.3 Shadcn Sidebar Layout | v1.2 | 2/2 | Complete | 2026-01-18 |
| 17. Client Management | v1.2 | 2/2 | Complete | 2026-01-18 |
| 18. Service Provider Profiles | v1.2 | 2/2 | Complete | 2026-01-19 |
| 19. Provider Analytics | v1.2 | 1/1 | Complete | 2026-01-19 |
| 20. Provider Settings & Availability | v1.2 | 2/2 | Complete | 2026-01-19 |
| 21. Feed Infrastructure | v1.3 | 2/2 | Complete | 2026-01-19 |
| 22. Post Creation UI | v1.3 | 2/2 | Complete | 2026-01-19 |
| 23. Feed Display | v1.3 | 2/2 | Complete | 2026-01-19 |
| 24. Social Interactions | v1.3 | 4/4 | Complete | 2026-01-19 |
| 25. User Following | v1.3 | 2/2 | Complete | 2026-01-19 |
| 26. User Profiles Revamp | v1.3 | 0/? | Not started | - |
| 27. Global Discovery | v1.3 | 0/? | Not started | - |

---

*See [PROJECT.md](PROJECT.md) for current state and requirements*
