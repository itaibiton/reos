---
phase: 54-legal-and-pricing-pages
plan: 02
subsystem: ui
tags: [next-intl, legal-pages, privacy-policy, terms-of-service, i18n, metadata]

# Dependency graph
requires:
  - phase: 54-01
    provides: Legal content foundation (TableOfContents, LegalSection, legal translation namespaces)
provides:
  - /privacy page route with 13 sections, TOC, jump links, metadata (EN/HE)
  - /terms page route with 16 sections, TOC, jump links, metadata (EN/HE)
  - Responsive two-column desktop layout with sticky sidebar TOC
  - WCAG-compliant legal page pattern (heading hierarchy, RTL support, 75ch max-width)
affects: [54-03-wire-pricing-page, 55-contact-and-provider-pages, 56-navigation-wiring]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Server component pages with generateMetadata for SEO
    - Two-column desktop layout (sticky sidebar) + inline mobile TOC
    - Max-width 75ch for optimal readability (45-75 characters per line)
    - Logical properties (ps, pe, ms, me, border-s) for RTL support

key-files:
  created:
    - src/app/[locale]/(main)/privacy/page.tsx
    - src/app/[locale]/(main)/terms/page.tsx
  modified: []

key-decisions:
  - "Server component pattern for legal pages (generateMetadata + useTranslations)"
  - "Two-column desktop layout with sticky TOC sidebar, inline TOC on mobile"
  - "Max-width 75ch on article for optimal line length"

patterns-established:
  - "Legal pages use server components with generateMetadata for SEO"
  - "TOC hidden on mobile (lg:block), inline render above content for mobile"
  - "Headings array defined in page component, passed to TableOfContents"
  - "LegalSection provides consistent section wrapper with scroll-mt-24 for jump links"

# Metrics
duration: 5min
completed: 2026-01-28
---

# Phase 54 Plan 02: Privacy & Terms Pages Summary

**Privacy Policy and Terms of Service pages with scroll spy TOC, responsive layouts, and full i18n metadata for EN/HE**

## Performance

- **Duration:** 5 min
- **Started:** 2026-01-28T22:36:45Z
- **Completed:** 2026-01-28T22:42:47Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Privacy Policy page (/privacy) with 13 sections covering CCPA, GDPR, and Israeli privacy law
- Terms of Service page (/terms) with 16 sections covering investor/provider obligations and legal agreements
- Both pages have full metadata (title, description, OpenGraph) in EN and HE with alternates
- Responsive typography with max-width 75ch for optimal readability
- Two-column desktop layout (sticky TOC sidebar) and inline mobile TOC
- WCAG-compliant heading hierarchy (single h1, h2 for sections, h3 for subsections)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Privacy Policy page at /privacy** - `6f4eed1` (feat)
2. **Task 2: Create Terms of Service page at /terms** - `4dd6cc6` (feat)

## Files Created/Modified
- `src/app/[locale]/(main)/privacy/page.tsx` - Privacy Policy page with 13 sections (introduction, data-collection, data-use, data-processors, cross-border, data-sharing, your-rights with CCPA/GDPR/Israel subsections, data-security, cookies, retention, children, changes, contact)
- `src/app/[locale]/(main)/terms/page.tsx` - Terms of Service page with 16 sections (introduction, eligibility, accountTerms, platformUse, investorTerms with investment disclaimer, providerTerms with licensing requirements, intellectualProperty, userContent, disclaimer, limitationOfLiability, indemnification, termination, governingLaw with NY law, disputeResolution with arbitration, changes, contact)

## Decisions Made

None - followed plan as specified. Used server component pattern with generateMetadata as documented in plan.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. Pre-existing build error in accounting module unrelated to legal pages.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Legal pages complete and ready for navigation wiring in Phase 56
- Footer already references /privacy and /terms (per 54-RESEARCH.md)
- Pages satisfy LEGAL-BEFORE-CONTACT decision (required before contact form)
- Pricing page (/pricing) can now be wired (Phase 54-03) to complete legal/pricing phase
- Contact page can now be built (Phase 55) since privacy policy exists

**Blockers:** None

**Concerns:** None

---
*Phase: 54-legal-and-pricing-pages*
*Completed: 2026-01-28*
