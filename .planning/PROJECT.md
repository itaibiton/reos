# REOS

## What This Is

An A-Z real estate investment platform connecting US investors (primarily NYC) with Israeli properties, while orchestrating the full deal flow through service providers — brokers, mortgage advisors, and lawyers. Features natural language property search, multi-layout chat, real-time notifications, and comprehensive dashboards for all user roles.

## Core Value

**Deal flow tracking from interest to close.** If the end-to-end process of connecting investors with properties AND moving them through service providers doesn't work seamlessly, nothing else matters.

## Current State (v1.3)

**Latest Shipped:** 2026-01-19
**Total Shipped:** 4 milestones (v1.0, v1.1, v1.2, v1.3)
**LOC:** ~35,000+ TypeScript
**Tech Stack:** Next.js 15, Convex, Clerk, Shadcn/ui, Tailwind v4, Hugeicons

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

**v1.4 Internationalization & RTL Support**

- [ ] Full i18n infrastructure with next-intl or similar
- [ ] URL-based locale routing (/he/, /en/)
- [ ] Complete Hebrew translation for all system UI
- [ ] Full RTL layout flip when locale is Hebrew
- [ ] Directional icon handling (arrows, chevrons flip)
- [ ] RTL-aware Shadcn components
- [ ] Locale-aware date/time formatting
- [ ] Locale-aware number formatting
- [ ] Locale-aware currency display
- [ ] Language switcher component
- [ ] Locale auto-detection with persistence
- [ ] Scalable architecture for future languages

### Out of Scope

- **E-signatures / document signing** — MVP is file storage only, no DocuSign integration
- **Advanced analytics** — basic metrics only, no deep investment analysis tools
- **Payment processing / subscriptions** — all providers free during MVP
- **Semantic search** — MVP uses NLP → filters only, semantic understanding in v2
- **Property data auto-fetching** — manual property upload only for MVP
- **Multi-language support** — ~~English only for MVP~~ → v1.4
- **Offline mode** — real-time is core value

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

## Current Milestone: v1.4 Internationalization & RTL

**Goal:** Add full internationalization infrastructure with Hebrew as the first additional language, including complete RTL layout support and locale-aware formatting.

**Target features:**
- URL-based locale routing (`/he/`, `/en/`)
- Full Hebrew UI translation
- RTL layout flip (sidebar, text direction, icons)
- Locale-aware formatting (dates, numbers, currency)
- Scalable i18n architecture for future languages

---
*Last updated: 2026-01-19 after v1.4 milestone planning*
