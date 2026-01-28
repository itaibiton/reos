# Roadmap: REOS v1.8 Conversion & Essential Pages

## Overview

Add critical conversion and essential pages to the REOS marketing site: FAQ and How It Works sections on the landing page, standalone pricing and legal pages, a contact page with form submission, service provider landing pages per type, and full navigation wiring across all new content. All new content supports EN/HE i18n and follows existing design patterns. Four phases deliver progressively from zero-risk landing sections to final cross-linking.

## Milestones

- **v1.0 MVP** - Phases 1-8 (shipped 2026-01-17)
- **v1.1 Investor Onboarding** - Phases 9-15 (shipped 2026-01-18)
- **v1.2 Provider Experience** - Phases 16-20 (shipped 2026-01-19)
- **v1.3 Social Feed & Global Community** - Phases 21-27.2 (shipped 2026-01-19)
- **v1.4 Internationalization & RTL** - Phases 28-34.1 (shipped 2026-01-20)
- **v1.5 Mobile Responsive & Header Redesign** - Phases 35-39 (shipped 2026-01-22)
- **v1.6 AI-Powered Investor Experience** - Phases 40-46 (shipped 2026-01-26)
- **v1.7 New Landing Page** - Phases 47-52 (shipped 2026-01-26)
- **v1.8 Conversion & Essential Pages** - Phases 53-56 (current)

## Phases

- [x] **Phase 53: Landing Page Sections** - FAQ and How It Works sections added to landing page
- [x] **Phase 54: Legal & Pricing Pages** - Privacy Policy, Terms of Service, and Pricing standalone pages
- [ ] **Phase 55: Contact & Provider Landing Pages** - Contact form page and service provider type landing pages
- [ ] **Phase 56: Navigation Wiring & Cross-Linking** - Wire all links, update nav/footer, generate sitemap

## Phase Details

### Phase 53: Landing Page Sections
**Goal**: Users can learn how REOS works and find answers to common questions directly on the landing page
**Depends on**: Nothing (first phase of v1.8)
**Requirements**: FAQ-01, FAQ-02, FAQ-03, FAQ-04, FAQ-05, FAQ-06, HIW-01, HIW-02, HIW-03, HIW-04, HIW-05
**Success Criteria** (what must be TRUE):
  1. User sees a "How It Works" section on the landing page with 4-5 numbered steps showing the investment process, each with an icon, title, description, and visual connecting flow
  2. User sees a FAQ section on the landing page with 15-20 questions organized by category, filterable by audience tab (Investors / Service Providers), where each question expands and collapses independently
  3. How It Works section animates into view on scroll and ends with a CTA button linking to sign-up
  4. FAQ section includes a "Still have questions?" CTA and emits JSON-LD FAQPage structured data in the page source
  5. Both sections display correctly in English and Hebrew
**Plans**: 3 plans
Plans:
  - [ ] 53-01-PLAN.md — HowItWorks component with i18n translations (EN + HE)
  - [ ] 53-02-PLAN.md — FAQ component with tabs, accordion, JSON-LD, and i18n translations (EN + HE)
  - [ ] 53-03-PLAN.md — Wire both components into landing page and visual verification

### Phase 54: Legal & Pricing Pages
**Goal**: Users can review REOS legal terms and compare pricing tiers on dedicated pages
**Depends on**: Phase 53
**Requirements**: LEGAL-01, LEGAL-02, LEGAL-03, LEGAL-04, LEGAL-05, LEGAL-06, LEGAL-07, LEGAL-08, LEGAL-09, PRICE-01, PRICE-02, PRICE-03, PRICE-04, PRICE-05, PRICE-06, PRICE-07, PRICE-08, PRICE-09, PRICE-10
**Success Criteria** (what must be TRUE):
  1. User can navigate to /privacy and /terms and read properly formatted legal content with table of contents, jump links, last-updated date, and responsive typography that covers REOS-specific data processors and cross-border data handling
  2. User can navigate to /pricing and see 3 tiers (Investor free, Broker monthly, Agency custom) with feature comparison table, annual/monthly toggle, "Most Popular" badge, and clear CTA per tier
  3. Pricing page includes a billing FAQ section and trust signals (security badges, "No credit card required")
  4. All three pages have correct Next.js metadata (title, description, Open Graph) and display in both English and Hebrew
**Plans**: 3 plans
Plans:
  - [x] 54-01-PLAN.md — Legal i18n content (privacy + terms EN/HE) and shared legal components (TableOfContents, LegalSection)
  - [x] 54-02-PLAN.md — Privacy Policy and Terms of Service page routes with metadata
  - [x] 54-03-PLAN.md — Pricing page with i18n content, tier components, feature comparison, billing FAQ, and JSON-LD

### Phase 55: Contact & Provider Landing Pages
**Goal**: Users can submit inquiries via a contact form and service providers can discover type-specific landing pages
**Depends on**: Phase 54 (legal pages must exist before collecting personal data)
**Requirements**: CONTACT-01, CONTACT-02, CONTACT-03, CONTACT-04, CONTACT-05, CONTACT-06, CONTACT-07, CONTACT-08, CONTACT-09, CONTACT-10, PROV-01, PROV-02, PROV-03, PROV-04, PROV-05, PROV-06, PROV-07, PROV-08, PROV-09, PROV-10, PROV-11
**Success Criteria** (what must be TRUE):
  1. User can navigate to /contact, fill out a form (name, email, subject, message, optional phone), see inline validation errors, and receive a success confirmation after submission that saves to Convex
  2. Contact form subject dropdown pre-selects based on URL parameter, includes honeypot anti-spam, and shows alternative contact methods alongside the form
  3. User can navigate to /services/brokers, /services/lawyers, and /services/mortgage-advisors and see a type-specific hero, benefits section, social proof, process steps, and CTA linking to sign-up with role pre-selected
  4. Provider pages use a shared template component with data-driven content, generate statically via generateStaticParams, and include JSON-LD ProfessionalService structured data
  5. All pages display correctly in English and Hebrew with proper Next.js metadata
**Plans**: TBD (created during phase planning)

### Phase 56: Navigation Wiring & Cross-Linking
**Goal**: Every new page is discoverable through navigation, footer, and cross-page CTAs with no dead links remaining
**Depends on**: Phase 55 (all target pages must exist)
**Requirements**: NAV-01, NAV-02, NAV-03, NAV-04, NAV-05, NAV-06, NAV-07, NAV-08
**Success Criteria** (what must be TRUE):
  1. Top navigation includes "Pricing" link and provider pages are accessible under "Solutions" dropdown
  2. Footer includes working links to Privacy, Terms, Contact, and other relevant pages
  3. Cross-page CTAs work: FAQ "Still have questions?" goes to /contact, Pricing enterprise tier goes to /contact, CTA section "Contact Sales" goes to /contact and "View Pricing" goes to /pricing
  4. All internal links use locale-aware Link component and sitemap.ts covers all new pages
**Plans**: TBD (created during phase planning)

## Progress

**Execution Order:** Phases 53 -> 54 -> 55 -> 56

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 53. Landing Page Sections | v1.8 | 3/3 | Complete | 2026-01-28 |
| 54. Legal & Pricing Pages | v1.8 | 3/3 | Complete | 2026-01-28 |
| 55. Contact & Provider Landing Pages | v1.8 | 0/? | Not Started | - |
| 56. Navigation Wiring & Cross-Linking | v1.8 | 0/? | Not Started | - |

## Requirements Coverage

**v1.8 Total Requirements:** 59

**By Phase:**
- Phase 53: 11 requirements (FAQ-01 to FAQ-06, HIW-01 to HIW-05)
- Phase 54: 19 requirements (LEGAL-01 to LEGAL-09, PRICE-01 to PRICE-10)
- Phase 55: 21 requirements (CONTACT-01 to CONTACT-10, PROV-01 to PROV-11)
- Phase 56: 8 requirements (NAV-01 to NAV-08)

**Unmapped:** 0

---
*Roadmap created: 2026-01-28*
*Milestone: v1.8 Conversion & Essential Pages*
*Requirements: 59 mapped to 4 phases*
