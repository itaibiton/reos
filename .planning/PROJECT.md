# REOS

## What This Is

An A-Z real estate investment platform connecting US investors (primarily NYC) with Israeli properties, while orchestrating the full deal flow through service providers — brokers, mortgage advisors, and lawyers. The platform feels AI-powered through smart recommendations and natural language search, making cross-border property investment accessible and streamlined.

## Core Value

**Deal flow tracking from interest to close.** If the end-to-end process of connecting investors with properties AND moving them through service providers doesn't work seamlessly, nothing else matters.

## Requirements

### Validated

(None yet — ship to validate)

### Active

**Authentication & Profiles**
- [ ] User authentication via Clerk (investors and service providers)
- [ ] Investor profile builder — collect investment preferences, risk tolerance, budget, target criteria
- [ ] Service provider profiles — broker, mortgage advisor, lawyer registration
- [ ] Role-based access (investor vs service provider types)

**Property Marketplace**
- [ ] Property listing display with real estate metrics (ROI, cash-on-cash, price, location)
- [ ] Admin interface to upload and manage properties
- [ ] Smart search — natural language input parsed to structured filters
- [ ] Property detail pages with full investment data
- [ ] Save/favorite properties functionality

**Deal Flow & Connections**
- [ ] Investor can request service provider (goes to potential clients list)
- [ ] System recommends service providers based on property/location
- [ ] Deal stages tracking (interest → broker → mortgage → lawyer → close)
- [ ] File storage attached to deals, accessible by relevant parties
- [ ] Client handoff between service providers with data continuity

**Dashboards**
- [ ] Investor dashboard: overview, marketplace access, saved properties, investor profile, service provider recommendations
- [ ] Service provider dashboard: overview, clients page
- [ ] Clients page for providers: active clients (chat, files, investor profile), potential clients (leads)
- [ ] Real-time chat between investor and their service providers

**Recommendations & Discovery**
- [ ] Service provider recommendations shown to investors with transparency
- [ ] Property recommendations based on investor profile

### Out of Scope

- **E-signatures / document signing** — MVP is file storage only, no DocuSign integration
- **Advanced analytics** — basic metrics only, no deep investment analysis tools
- **Payment processing / subscriptions** — all providers free during MVP
- **Semantic search** — MVP uses NLP → filters only, semantic understanding in v2
- **Property data auto-fetching** — manual property upload only for MVP
- **Multi-language support** — English only for MVP

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

**Platform Value Propositions:**
- For investors: Easy property discovery + streamlined purchase process
- For service providers: Warm leads + organized client management + deal continuity

**"AI-Powered" Feel:**
- Smart recommendations that anticipate needs
- Natural language search that understands intent
- Not necessarily AI under the hood everywhere, but intelligent UX

## Constraints

- **Tech Stack**: Next.js + Convex + Shadcn/ui + Clerk — non-negotiable
- **Initial Properties**: Israeli real estate market
- **Initial Investors**: US-based, primarily NYC
- **Currency**: Must handle USD ↔ ILS display

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Convex for backend | Real-time features (chat, deal updates), reactive by default | — Pending |
| Clerk for auth | Handles multi-tenant auth, role management out of box | — Pending |
| NLP → filters for MVP search | Faster to ship, semantic search adds complexity | — Pending |
| Free tier for MVP | Reduces friction for service provider adoption, billing later | — Pending |
| Deal flow as core value | Differentiator is end-to-end process, not just property discovery | — Pending |

---
*Last updated: 2026-01-12 after initialization*
