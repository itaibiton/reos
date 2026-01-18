# Roadmap: REOS

## Overview

Building an end-to-end real estate investment platform connecting US investors with Israeli properties. The journey starts with foundational setup and authentication, moves through profile and marketplace systems, adds intelligent search, then implements the core deal flow orchestration, and culminates with dashboards and real-time communication features.

## Milestones

- ✅ [v1.0 MVP](milestones/v1.0-ROADMAP.md) (Phases 1-8) — SHIPPED 2026-01-17
- ✅ **v1.1 Investor Onboarding** — Phases 9-15 — SHIPPED 2026-01-18

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

## ✅ v1.1 Investor Onboarding (Complete)

**Milestone Goal:** Gated investor onboarding questionnaire with AI-powered conversational flow, enabling personalized property matching and service provider visibility.

**SHIPPED:** 2026-01-18

### Phase 9: Onboarding Gate & State

**Goal**: Lock platform features behind onboarding, create progress tracking
**Depends on**: v1.0 MVP complete
**Research**: Unlikely (internal patterns - routing, middleware)
**Plans**: 1/1 complete

Plans:
- [x] 09-01: Onboarding gate infrastructure — completed 2026-01-18

### Phase 10: Questionnaire UI Framework

**Goal**: Multi-step wizard with AI-style conversational UI and draft persistence
**Depends on**: Phase 9
**Research**: Unlikely (internal patterns - forms, wizard)
**Plans**: 1/1 complete

Plans:
- [x] 10-01: Questionnaire wizard framework — completed 2026-01-18

### Phase 11: Questionnaire Content - Part 1

**Goal**: Citizenship, residency, experience, ownership, and investment type questions
**Depends on**: Phase 10
**Research**: Unlikely (internal patterns - form fields)
**Plans**: 1/1 complete

Plans:
- [x] 11-01: 5 questionnaire steps with state persistence — completed 2026-01-18

### Phase 12: Questionnaire Content - Part 2

**Goal**: Budget, investment horizon, goals, yield preferences, and financing questions
**Depends on**: Phase 11
**Research**: Unlikely (internal patterns - form fields)
**Plans**: 1/1 complete

Plans:
- [x] 12-01: 5 financial context steps with budget and goals — completed 2026-01-18

### Phase 13: Property Preferences & Location

**Goal**: Property characteristics, city/area selection with map, radius search
**Depends on**: Phase 12
**Research**: Likely (AI integration for preference parsing)
**Research topics**: Claude/OpenAI for parsing free-text preferences into structured filters
**Plans**: 1/1 complete

Plans:
- [x] 13-01: Property preferences and location steps — completed 2026-01-18

### Phase 14: AI Preferences & Service Selection

**Goal**: Free-text AI preferences input, timeline, service provider selection
**Depends on**: Phase 13
**Research**: Unlikely (already using Claude in Phase 5)
**Plans**: 1/1 complete

Plans:
- [x] 14-01: AI preferences & service selection steps — completed 2026-01-18

### Phase 15: Profile Display & Edit

**Goal**: Investor profile visible to providers, edit answers, completeness indicator
**Depends on**: Phase 14
**Research**: Unlikely (internal patterns)
**Plans**: 2/2 complete

Plans:
- [x] 15-01: Profile display for providers — completed 2026-01-18
- [x] 15-02: Profile edit for investors — completed 2026-01-18

## Progress

| Milestone | Phases | Plans | Status | Shipped |
|-----------|--------|-------|--------|---------|
| v1.0 MVP | 17 | 40 | Complete | 2026-01-17 |
| v1.1 Investor Onboarding | 7 | 8 | Complete | 2026-01-18 |

| Phase | Milestone | Plans | Status | Completed |
|-------|-----------|-------|--------|-----------|
| 9. Onboarding Gate & State | v1.1 | 1/1 | Complete | 2026-01-18 |
| 10. Questionnaire UI Framework | v1.1 | 1/1 | Complete | 2026-01-18 |
| 11. Questionnaire Content - Part 1 | v1.1 | 1/1 | Complete | 2026-01-18 |
| 12. Questionnaire Content - Part 2 | v1.1 | 1/1 | Complete | 2026-01-18 |
| 13. Property Preferences & Location | v1.1 | 1/1 | Complete | 2026-01-18 |
| 14. AI Preferences & Service Selection | v1.1 | 1/1 | Complete | 2026-01-18 |
| 15. Profile Display & Edit | v1.1 | 2/2 | Complete | 2026-01-18 |

---

*See [PROJECT.md](PROJECT.md) for current state and requirements*
