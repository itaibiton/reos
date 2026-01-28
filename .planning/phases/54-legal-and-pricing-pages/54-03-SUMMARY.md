---
phase: 54-legal-and-pricing-pages
plan: 03
subsystem: pages
tags: [next-intl, radix-ui, pricing, i18n, seo, json-ld]

# Dependency graph
requires:
  - phase: 54-01
    provides: legal translation foundation and legal components pattern
provides:
  - Pricing page at /en/pricing and /he/pricing with full i18n
  - 3-tier pricing display (Investor free, Broker $49/$39, Agency custom)
  - Annual/monthly billing toggle with Radix Switch
  - Responsive feature comparison table (desktop table, mobile cards)
  - Billing FAQ with Radix Accordion
  - JSON-LD Product schema for SEO
affects: [56-navigation, 55-contact]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Radix Switch for toggle components"
    - "Responsive table/card pattern for comparison tables"
    - "JSON-LD Product schema with Offer array for pricing pages"
    - "Client wrapper pattern for server pages with state (generateMetadata + client content)"

key-files:
  created:
    - messages/en.json (pricing namespace)
    - messages/he.json (pricing namespace)
    - src/components/pricing/PricingToggle.tsx
    - src/components/pricing/PricingTiers.tsx
    - src/components/pricing/FeatureComparison.tsx
    - src/components/pricing/BillingFAQ.tsx
    - src/components/pricing/index.ts
    - src/app/[locale]/(main)/pricing/page.tsx
    - src/app/[locale]/(main)/pricing/PricingPageContent.tsx
  modified: []

key-decisions:
  - "Use Radix Switch for annual/monthly toggle instead of custom implementation"
  - "Responsive pattern: desktop table with checkmarks, mobile stacked cards showing only included features"
  - "Accordion type='multiple' for FAQ to allow multiple questions open simultaneously"
  - "Client wrapper pattern: page.tsx has generateMetadata (server), PricingPageContent manages state (client)"
  - "JSON-LD Product schema with 3 Offer entries (Investor $0, Broker $49, Agency custom)"

patterns-established:
  - "Pricing namespace structure: meta, title, subtitle, billing, tiers, comparison, faq, trustSignals"
  - "Tier features as array in translation files for easy iteration"
  - "Feature comparison data structure with boolean flags per tier"
  - "Trust signals displayed as row between tiers and comparison sections"

# Metrics
duration: 10min
completed: 2026-01-28
---

# Phase 54 Plan 03: Pricing Page Summary

**Complete pricing page with 3-tier comparison, annual/monthly toggle, responsive feature table, billing FAQ, and JSON-LD SEO structured data**

## Performance

- **Duration:** 10 min
- **Started:** 2026-01-28T22:36:44Z
- **Completed:** 2026-01-28T22:46:22Z
- **Tasks:** 2
- **Files modified:** 2 (messages/*.json)
- **Files created:** 7 (4 pricing components + index + 2 page files)

## Accomplishments

- Complete i18n pricing content in English and Hebrew with 3 tiers, 15 feature comparisons, and 6 FAQ questions
- Four reusable pricing components using Radix UI primitives (Switch, Table, Accordion)
- Pricing page route with SEO metadata, OpenGraph, language alternates, and JSON-LD Product schema
- Responsive feature comparison: desktop table with checkmarks/dashes, mobile stacked cards
- Trust signals row between tiers and comparison sections

## Task Commits

Each task was committed atomically:

1. **Task 1: Add pricing translation keys and create pricing components** - `41adc2c` (feat)
   - Pricing namespace in messages/en.json and messages/he.json
   - PricingToggle.tsx with Radix Switch
   - PricingTiers.tsx with 3-tier cards and Most Popular badge
   - FeatureComparison.tsx with responsive table/cards
   - BillingFAQ.tsx with Radix Accordion
   - Barrel exports in index.ts

2. **Task 2: Create Pricing page at /pricing with metadata and JSON-LD** - `f9ad4ab` (feat)
   - page.tsx with generateMetadata and JSON-LD Product schema
   - PricingPageContent.tsx client component managing isAnnual state
   - Routes: /en/pricing and /he/pricing

## Files Created/Modified

**Translation files (modified):**
- `messages/en.json` - Added pricing namespace with tiers, features, comparison, FAQ, trust signals
- `messages/he.json` - Complete Hebrew translations for pricing namespace

**Pricing components (created):**
- `src/components/pricing/PricingToggle.tsx` - Annual/monthly toggle using Radix Switch with "Save 20%" badge
- `src/components/pricing/PricingTiers.tsx` - 3-tier cards (Investor free, Broker $49/$39, Agency custom) with Most Popular badge on Broker tier
- `src/components/pricing/FeatureComparison.tsx` - Responsive feature comparison (table on desktop md+, stacked cards on mobile)
- `src/components/pricing/BillingFAQ.tsx` - FAQ accordion with 6 billing questions using Radix Accordion type="multiple"
- `src/components/pricing/index.ts` - Barrel exports for all pricing components

**Page route (created):**
- `src/app/[locale]/(main)/pricing/page.tsx` - Server component with generateMetadata (title, description, OpenGraph, alternates) and JSON-LD Product schema
- `src/app/[locale]/(main)/pricing/PricingPageContent.tsx` - Client component managing isAnnual state, renders all pricing sections

## Decisions Made

1. **Radix Switch over custom toggle** - Leverages existing Radix UI component for accessibility and consistent styling
2. **Responsive comparison pattern** - Desktop users see full table with all tiers side-by-side, mobile users see stacked cards with only included features per tier
3. **Accordion type="multiple"** - Allows users to keep multiple FAQ answers open for comparison (consistent with landing FAQ pattern)
4. **Client wrapper pattern** - page.tsx exports generateMetadata (server) and renders client PricingPageContent (state management), enabling both SSR metadata and client interactivity
5. **JSON-LD Product schema** - Uses Product type with 3 Offer entries (Investor $0, Broker $49, Agency custom) for search engine structured data

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all components integrated cleanly with existing Radix UI infrastructure and translation system.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for:**
- Phase 55 Contact page can link to pricing tiers in form flow
- Phase 56 Navigation can add /pricing link to header menu
- Footer already has /pricing link placeholder that will now work

**Provides:**
- Pricing page satisfies requirements PRICE-01 through PRICE-10
- Complete pricing content foundation for conversion flows
- Reusable pricing components for dashboards or marketing materials

---
*Phase: 54-legal-and-pricing-pages*
*Completed: 2026-01-28*
