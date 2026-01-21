# REOS

## What This Is

An A-Z real estate investment platform connecting US investors (primarily NYC) with Israeli properties, while orchestrating the full deal flow through service providers — brokers, mortgage advisors, and lawyers. Features natural language property search, multi-layout chat, real-time notifications, and comprehensive dashboards for all user roles.

## Core Value

**Deal flow tracking from interest to close.** If the end-to-end process of connecting investors with properties AND moving them through service providers doesn't work seamlessly, nothing else matters.

## Current State (v1.4)

**Latest Shipped:** 2026-01-20
**Total Shipped:** 5 milestones (v1.0, v1.1, v1.2, v1.3, v1.4)
**LOC:** ~35,000+ TypeScript
**Tech Stack:** Next.js 15, Convex, Clerk, Shadcn/ui, Tailwind v4, Hugeicons, next-intl

**What's Working:**
- Full authentication with 8 roles (investor, broker, mortgage_advisor, lawyer, admin, accountant, notary, tax_consultant, appraiser)
- Property marketplace with smart search (Claude AI) and traditional filters
- Interactive property pages with carousel, map, amenities, mortgage calculator
- 7-stage deal flow with service provider requests and handoffs
- Multi-layout chat (single, split, quad) with drag-and-drop
- Role-specific dashboards with recommendations
- Real-time notifications for all events
- Investor onboarding with conversational questionnaire
- Client management and provider analytics
- Public provider profiles with reviews and ratings
- Social feed with posts, likes, comments, shares, saves
- User following and personalized feeds
- Global search with autocomplete and quick actions
- Trending content and recommendations
- Full i18n with Hebrew/RTL support and locale-aware formatting

## Requirements

### Validated

- [x] User authentication via Clerk (investors and service providers) — v1.0
- [x] Investor profile builder — investment preferences, risk tolerance, budget — v1.0
- [x] Service provider profiles — broker, mortgage advisor, lawyer registration — v1.0
- [x] Role-based access (investor vs service provider types) — v1.0
- [x] Property listing display with real estate metrics (ROI, price, location) — v1.0
- [x] Admin interface to upload and manage properties — v1.0
- [x] Smart search — natural language input parsed to structured filters — v1.0
- [x] Property detail pages with full investment data — v1.0
- [x] Save/favorite properties functionality — v1.0
- [x] Investor can request service provider — v1.0
- [x] System recommends service providers based on property/location — v1.0
- [x] Deal stages tracking (interest → broker → mortgage → lawyer → close) — v1.0
- [x] File storage attached to deals — v1.0
- [x] Client handoff between service providers — v1.0
- [x] Investor dashboard: overview, saved properties, recommendations — v1.0
- [x] Service provider dashboard: clients, leads, activity feed — v1.0
- [x] Real-time chat between investor and service providers — v1.0
- [x] Real-time notifications for events — v1.0

### Active

**v1.5 Mobile Responsive & Header Redesign**

- [ ] Full mobile responsiveness across all pages
- [ ] Bottom tab bar navigation for mobile (role-specific tabs)
- [ ] Header redesign with consolidated dropdown (notifications + settings)
- [ ] Custom notification UI using Clerk functions (no Clerk components)
- [ ] Custom sign out UI using Clerk functions
- [ ] Theme switcher (Light/Dark/System)
- [ ] Unread notification badge on dropdown trigger
- [ ] Search icon → expanding search on mobile
- [ ] Property cards stack vertically on mobile
- [ ] All forms and modals mobile-optimized
- [ ] Touch-friendly interactions throughout

### Out of Scope

- **E-signatures / document signing** — MVP is file storage only, no DocuSign integration
- **Advanced analytics** — basic metrics only, no deep investment analysis tools
- **Payment processing / subscriptions** — all providers free during MVP
- **Semantic search** — MVP uses NLP → filters only, semantic understanding in v2
- **Property data auto-fetching** — manual property upload only for MVP
- **Offline mode** — real-time is core value
- **Native mobile app** — web responsive first, native apps in future

## Context

**Target Market:**
- Primary: US investors (especially NYC) → Israeli properties
- Secondary: Israel → US, Israel → Israel
- Marketing focus: US to Israel cross-border investment

**User Types:**
1. **Investors** — find properties, connect with service providers, track their deals
2. **Brokers** — receive leads, manage client relationships, hand off to next provider
3. **Mortgage/Finance Advisors** — receive warm leads from brokers, manage client financing
4. **Lawyers** — receive deals ready for closing, manage legal process
5. **Admin** — platform management, role switching for testing

**Platform Value Propositions:**
- For investors: Easy property discovery + streamlined purchase process
- For service providers: Warm leads + organized client management + deal continuity

## Constraints

- **Tech Stack**: Next.js + Convex + Shadcn/ui + Clerk — non-negotiable
- **Initial Properties**: Israeli real estate market
- **Initial Investors**: US-based, primarily NYC
- **Currency**: Handles USD ↔ ILS display (hardcoded rate for MVP)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Convex for backend | Real-time features (chat, deal updates), reactive by default | ✓ Good |
| Clerk for auth | Handles multi-tenant auth, role management out of box | ✓ Good |
| NLP → filters for MVP search | Faster to ship, semantic search adds complexity | ✓ Good |
| Free tier for MVP | Reduces friction for service provider adoption, billing later | — Pending |
| Deal flow as core value | Differentiator is end-to-end process, not just property discovery | ✓ Good |
| Tailwind v4 | Latest CSS features, auto-detected by Shadcn | ✓ Good |
| Hugeicons for icons | Better design than Lucide, consistent with Mira design | ✓ Good |
| OpenStreetMap + Leaflet | Free maps, no API key, works well | ✓ Good |
| dnd-kit for drag-and-drop | Cleaner API than react-dnd, easier to implement | ✓ Good |
| Claude AI for search parsing | Fast, accurate, cost-effective | ✓ Good |
| Hardcoded USD/ILS rate | Quick MVP, live API in v1.1 | ⚠️ Revisit |

## Current Milestone: v1.5 Mobile Responsive & Header Redesign

**Goal:** Make the entire application fully mobile responsive with modern mobile patterns, and redesign the header with a consolidated dropdown for notifications, settings, and sign out — all using custom UI with Clerk functions.

**Target features:**
- Bottom tab bar navigation for mobile (5 tabs, role-specific)
- Header consolidation: search bar + single dropdown (notifications tab, settings tab, sign out)
- Custom Clerk UI (no Clerk-provided components)
- Theme switcher (Light/Dark/System)
- Full mobile responsiveness without breaking desktop
- Property cards stacked vertically on mobile
- Search icon that expands on mobile

---
*Last updated: 2026-01-21 after v1.5 milestone started*
