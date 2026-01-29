# REOS

## What This Is

An A-Z real estate investment platform connecting US investors (primarily NYC) with Israeli properties, while orchestrating the full deal flow through service providers — brokers, mortgage advisors, and lawyers. Features natural language property search, multi-layout chat, real-time notifications, and comprehensive dashboards for all user roles.

## Core Value

**Deal flow tracking from interest to close.** If the end-to-end process of connecting investors with properties AND moving them through service providers doesn't work seamlessly, nothing else matters.

## Current Milestone: v1.9 Vendor Registration & Management

**Goal:** Rebuild the service provider experience with a structured onboarding questionnaire, admin approval gate, and revamped vendor personal area — client management, process timeline, and deal statistics.

**Target features:**
- Vendor onboarding questionnaire (full name, phone, email, profession, experience, company, language, license number, profile photo, bio, website link, geographic area, external recommendations)
- Admin approval workflow — vendors must be approved before appearing on platform
- Vendor personal area with client list, document access per client, process timeline per client with current stage
- Deal statistics dashboard (total deals, sales count for brokers)
- Profile photo upload for vendors

## Current State (v1.8)

**Latest Shipped:** 2026-01-29
**Total Shipped:** 9 milestones (v1.0, v1.1, v1.2, v1.3, v1.4, v1.5, v1.6, v1.7, v1.8)
**LOC:** ~48,735 TypeScript
**Tech Stack:** Next.js 15, Convex, Clerk, Shadcn/ui, Tailwind v4, Hugeicons, next-intl, Framer Motion

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
- Mobile-first responsive design with 100dvh viewport and safe-area handling
- Theme switching (Light/Dark/System) with smooth 300ms transitions
- Role-specific bottom tab navigation (5 tabs per role) with Framer Motion animations
- Consolidated header dropdown (notifications + settings + sign out) — custom Clerk UI
- ResponsiveDialog pattern (dialogs on desktop, bottom sheets on mobile)
- 44px touch targets on all interactive elements
- Pull-to-refresh on feed pages
- AI-powered investor summary page with two-panel layout
- Conversational AI assistant with streaming responses
- Property recommendations with match explanations and batch save
- Dream team builder (broker, mortgage, lawyer suggestions)
- AI memory persistence with sliding window + summarization
- Mobile tabbed interface for AI assistant
- Auto-greeting with property and provider recommendations
- **Modern marketing landing page with hero, social proof, features, automation, testimonials, stats**
- **"How It Works" 4-step animated process flow with RTL-safe connectors**
- **FAQ section with 17 questions, audience tabs (Investor/Provider), JSON-LD FAQPage**
- **Privacy Policy and Terms of Service with scroll-spy TOC, 29 legal sections**
- **Pricing page with 3 tiers, annual/monthly toggle, feature comparison, billing FAQ**
- **Contact form with Convex backend, Zod validation, honeypot anti-spam, URL pre-selection**
- **7 service provider landing pages with social proof, JSON-LD, role-preselected CTAs**
- **Full navigation wiring: Solutions dropdown (7 providers), footer routes, cross-page CTAs, sitemap.ts (13 pages x 2 locales)**
- **Vendor onboarding: 4-step wizard with profile photo upload, draft persistence, validation**
- **Admin approval workflow: pending vendors queue, approve/reject with reason, status banners**
- **Vendor visibility gating: unapproved vendors hidden from directory, grandfathering for existing providers**

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
- [x] 100dvh viewport units for mobile — v1.5
- [x] Safe-area CSS utilities for iOS — v1.5
- [x] Theme switching (Light/Dark/System) with persistence — v1.5
- [x] Role-specific bottom tab navigation (5 tabs) — v1.5
- [x] Consolidated header dropdown (notifications + settings + sign out) — v1.5
- [x] Custom Clerk UI (no Clerk UserButton) — v1.5
- [x] ResponsiveDialog (dialogs on desktop, bottom sheets on mobile) — v1.5
- [x] 44px touch targets on all interactive elements — v1.5
- [x] Pull-to-refresh on feed pages — v1.5
- [x] Mobile-first grid layouts for property cards and forms — v1.5
- [x] Investor Summary Page with two-panel layout (profile + AI) — v1.6
- [x] Profile summary display from questionnaire answers — v1.6
- [x] Inline editing for profile sections — v1.6
- [x] AI property recommendations based on investor profile — v1.6
- [x] "Quick save all" for recommended properties — v1.6
- [x] AI dream team builder (2-3 suggestions per provider role) — v1.6
- [x] Conversational AI for profile/property/provider questions — v1.6
- [x] AI memory persistence via Convex — v1.6
- [x] Mobile tabbed interface (Profile / AI Assistant) — v1.6
- [x] Auto-greeting with property and provider recommendations — v1.6
- [x] Modern marketing landing page (hero, social proof, features, automation, testimonials, stats) — v1.7
- [x] FAQ section on landing page with audience tabs and JSON-LD — v1.8
- [x] "How It Works" animated process flow section — v1.8
- [x] Pricing page with 3 tiers, comparison table, billing FAQ — v1.8
- [x] Privacy Policy and Terms of Service with scroll-spy TOC — v1.8
- [x] Contact page with Convex backend, Zod validation, honeypot anti-spam — v1.8
- [x] 7 service provider landing pages with JSON-LD and role-preselected CTAs — v1.8
- [x] Full navigation wiring with Solutions dropdown, footer routes, sitemap — v1.8
- [x] Vendor onboarding questionnaire with all registration fields — v1.9
- [x] Admin approval gate for new vendors — v1.9
- [x] Profile photo upload for vendors — v1.9

### Active

- [x] Vendor onboarding questionnaire with all registration fields — v1.9
- [x] Admin approval gate for new vendors — v1.9
- [ ] Vendor personal area: client management with document access — v1.9
- [ ] Process timeline per client with current stage display — v1.9
- [ ] Vendor deal statistics dashboard — v1.9
- [x] Profile photo upload for vendors — v1.9

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

## Next Milestone Goals

**Future directions (not yet scoped):**
- Analytics and reporting dashboards
- Advanced mobile features (PWA, push notifications)
- v2.0: Major feature expansion (payments, e-signatures)
- Email notifications on contact form submission
- Cookie consent banner
- A/B testing framework
- Enhanced vendor exposure to investors (paid tier)
- Internal social chat between professionals by topic

---
*Last updated: 2026-01-29 after Phase 57 complete (Vendor Onboarding & Admin Approval)*
