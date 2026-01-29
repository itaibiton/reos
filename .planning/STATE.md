# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-28)

**Core value:** Deal flow tracking from interest to close.
**Current focus:** v1.8 Conversion & Essential Pages

## Current Position

Milestone: v1.8 Conversion & Essential Pages
Phase: 56 of 56 (Navigation Wiring & Cross-Linking) -- complete (2 plans, 1 wave)
Plan: 02 of 02 complete
Status: Phase complete, Milestone complete
Last activity: 2026-01-29 -- Completed 56-01-PLAN.md (Navigation & footer wiring)

Progress: [██████████] 100% (2/2 plans complete in Phase 56)

## Performance Metrics

**Velocity:**
- Total plans completed: 167
- Average duration: 4.4 min
- Total execution time: 11.13 hours

**By Phase (v1.7):**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 40 | 3/3 | 11 min | 3.7 min |
| 41 | 3/3 | 7 min | 2.3 min |
| 42 | 3/3 | 9 min | 3 min |
| 43 | 3/3 | 11 min | 3.7 min |
| 44 | 3/3 | 21 min | 7 min |
| 45 | 3/3 | 3 min | 1 min |
| 46 | 4/4 | 12 min | 3 min |
| 47 | 2/2 | 6 min | 3 min |
| 48 | 1/1 | 3 min | 3 min |
| 49 | 1/1 | 3 min | 3 min |

**By Phase (v1.8):**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 53 | 3/3 | 13 min | 4.3 min |
| 54 | 3/3 | 22 min | 7.3 min |
| 55 | 2/2 | 11 min | 5.5 min |
| 56 | 2/2 | 6 min | 3 min |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

| Decision | Context | Impact |
|----------|---------|--------|
| V1.8-SCOPE | Replace mobile responsive with conversion pages | Focus on critical missing pages to improve conversion |
| EXISTING-LANDING | Don't modify existing landing components | New sections/pages only, preserve current work |
| SERVICES-ROUTE | Use /services/[type] not /providers/[type] | Avoids middleware auth conflict on /providers routes |
| LEGAL-BEFORE-CONTACT | Legal pages must exist before contact form | GDPR/CCPA compliance -- cannot collect data without privacy policy |
| NAV-LAST | Wire navigation after all target pages exist | Prevents broken links during development |
| RTL-LOGICAL-PROPS | Use logical properties (-end-*) not directional (-right-*) | Ensures RTL support for Hebrew without duplicate styling |
| DESKTOP-CONNECTORS | Visual connector lines desktop-only (md:block) | Simplifies mobile layouts while enhancing desktop visual flow |
| FAQ-AUDIENCE-TABS | Use Radix Tabs for investor vs provider segmentation | Different audiences have distinct concerns - investors care about trust/cost/process, providers care about platform/leads/revenue |
| FAQ-ACCORDION-MULTIPLE | Use Accordion type='multiple' for independent expand/collapse | Users often want to compare multiple answers side-by-side without having previous answers auto-collapse |
| FAQ-JSON-LD-ALL | Include ALL questions (both tabs) in JSON-LD FAQPage schema | Maximize SEO benefit - search engines should index all FAQ content regardless of tab visibility |
| LEGAL-I18N-STRUCTURE | Nested legal.privacy and legal.terms namespaces with sections | Mirrors existing i18n structure pattern, enables granular translation access |
| TOC-SCROLL-SPY | IntersectionObserver with rootMargin: '-20% 0px -35% 0px' | Activates link when heading is in top portion of viewport (natural reading position) |
| TOC-RESPONSIVE | Hidden on mobile (lg:block), inline render for mobile TOC | Sticky sidebar impractical on mobile; legal pages can render inline TOC above content |
| PRICING-CLIENT-WRAPPER | page.tsx exports generateMetadata (server) and renders client PricingPageContent | Enables both SSR metadata and client state management for pricing toggles |
| PRICING-RESPONSIVE-COMPARISON | Desktop: table with checkmarks, Mobile: stacked cards with included features only | Optimizes comparison display for each viewport - full table too cramped on mobile |
| CONTACT-SUBJECTS | 5 subject types: general, pricing, support, partnerships, provider | Changed from sales/media to pricing/provider to match platform focus |
| CONTACT-HONEYPOT-POSITION | Use position absolute left -9999px (not display:none) | Bots detect display:none, position absolute is more effective anti-spam |
| CONTACT-SUSPENSE-PATTERN | Wrap useSearchParams component in Suspense boundary | Next.js 15 requirement for dynamic APIs in static pages |
| PROVIDER-TYPE-SET | 7 provider types: broker, lawyer, appraiser, mortgage-advisor, entrepreneur, asset-manager, financial-advisor | Replaced accountant/notary/tax-consultant with types aligned to platform investor focus |
| PROVIDER-ROLE-MAP | Sign-up CTA includes ?role= query parameter via roleMap | Pre-selects appropriate role (e.g., entrepreneur→investor) to reduce friction |
| JSON-LD-SERVICE-TYPE | Use Service schema (not deprecated ProfessionalService) | Schema.org Service is current recommended type, includes serviceType property |
| SOCIAL-PROOF-PLACEMENT | Stats + testimonial between benefits and steps | Users need credibility validation after seeing benefits but before reading process steps |
| NAV-SITEMAP-LOCATION | Place sitemap.ts at app root, not inside [locale] | Next.js convention for sitemap generation at /sitemap.xml |
| NAV-CTA-STYLING | Use Link with inline className instead of Button asChild for CTA section | Preserves exact rounded-full styling without shadcn Button class conflicts |
| NAV-PRICING-CONDITIONAL | Conditionally route enterprise to /contact, others to /sign-up | Enterprise requires sales discussion, self-service tiers go to signup |

### Pending Todos

- Replace placeholder partner logos with real partner/media logos (deferred)
- Complete mobile responsive work (deferred to future milestone)

### Blockers/Concerns

- Legal pages (/privacy, /terms) referenced in footer -- addressed in Phase 54
- Contact page needed for hero CTA -- addressed in Phase 55-01 (functional contact form complete)
- Provider pages not yet created -- addressed in Phase 55-02 (7 provider landing pages complete)

### Roadmap Evolution

- Milestone v1.6 complete: AI-Powered Investor Experience (Phases 40-46)
- Milestone v1.7 complete: New Landing Page (Phases 47-52)
- Milestone v1.8 roadmap created: Conversion & Essential Pages (Phases 53-56)
  - Phase 53: Landing Page Sections (FAQ + How It Works)
  - Phase 54: Legal & Pricing Pages
  - Phase 55: Contact & Provider Landing Pages
  - Phase 56: Navigation Wiring & Cross-Linking

## Session Continuity

Last session: 2026-01-29
Stopped at: Completed 56-01-PLAN.md (Navigation & footer wiring)
Resume file: None
Next: Phase 56 complete. Milestone v1.8 (Conversion & Essential Pages) complete. All landing navigation now wired to real routes.
