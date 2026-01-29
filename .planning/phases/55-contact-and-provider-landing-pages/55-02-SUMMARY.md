---
phase: 55-contact-and-provider-landing-pages
plan: 02
subsystem: marketing
status: complete
tags: [nextjs, i18n, seo, json-ld, provider-pages]

requires:
  - 55-01 # Contact form + thank-you page (contactSubmissions backend exists)

provides:
  - 7 static provider landing pages with type-specific content
  - JSON-LD Service structured data for SEO
  - Social proof sections with stats and testimonials
  - Role-preselected sign-up CTA links
  - Full EN and HE i18n for all provider types

affects:
  - 56-navigation # Navigation wiring will link to these provider pages

tech-stack:
  added: []
  patterns:
    - JSON-LD Service schema injection via Script component
    - roleMap for query parameter generation
    - Social proof section with stats grid and testimonial

key-files:
  created: []
  modified:
    - src/app/[locale]/(main)/services/[type]/page.tsx # Added JSON-LD, updated VALID_TYPES
    - src/app/[locale]/(main)/services/[type]/ProviderPageContent.tsx # Added social proof section, role CTA
    - src/app/[locale]/(main)/services/ServicesIndexContent.tsx # Updated to 7 new provider types
    - messages/en.json # Added 3 new types, stats/testimonials for all 7
    - messages/he.json # Added 3 new types, stats/testimonials for all 7

decisions:
  - title: New provider type set
    rationale: Replaced accountant/notary/tax-consultant with entrepreneur/asset-manager/financial-advisor to better match platform focus and user personas
    alternatives: Keep all 10 types (rejected - too cluttered), Add incrementally (rejected - better to launch complete set)

  - title: roleMap for sign-up query parameters
    rationale: Pre-select appropriate role on sign-up form based on provider type (e.g., entrepreneur→investor, mortgage-advisor→mortgage_advisor)
    impact: Improves conversion by reducing friction for providers signing up

  - title: JSON-LD Service schema (not ProfessionalService)
    rationale: schema.org deprecated ProfessionalService, Service is current recommended type
    spec: Uses serviceType property for specific service name, includes provider org and areaServed

  - title: Social proof placement between benefits and steps
    rationale: Users need credibility validation after seeing benefits but before committing to read process steps
    pattern: Stats grid (3 columns) followed by single featured testimonial

metrics:
  duration: 6 minutes
  tasks: 2
  commits: 2
  files_modified: 5
  completed: 2026-01-29
---

# Phase 55 Plan 02: Provider Landing Pages with Social Proof Summary

**One-liner:** Launched 7 provider landing pages (broker, lawyer, appraiser, mortgage-advisor, entrepreneur, asset-manager, financial-advisor) with JSON-LD Service structured data, stats-based social proof, role-preselected CTAs, and full EN/HE i18n.

## What Was Built

Upgraded provider landing pages from basic template to full-featured marketing pages with social proof and SEO optimization:

**Provider Type Changes:**
- Removed: accountant, notary, tax-consultant (not core to platform)
- Added: entrepreneur, asset-manager, financial-advisor (key user personas)
- Result: 7 provider types aligned with platform focus on real estate investors and professionals

**Social Proof Section:**
- Stats grid: 3 metrics per type (e.g., "2,500+ Active brokers", "$1.2B Deals closed")
- Testimonial: Featured quote with name and role
- Placement: Between benefits and how-it-works sections
- Animation: Framer Motion stagger for visual polish

**SEO Enhancement:**
- JSON-LD Service structured data on each provider page
- Schema.org Service type (not deprecated ProfessionalService)
- Includes: serviceType, provider org, areaServed, description, audience
- Injected via Script component in page.tsx

**Role-Preselected Sign-Up:**
- All sign-up CTAs include `?role=` query parameter
- roleMap matches provider type to sign-up role (e.g., entrepreneur→investor)
- Reduces friction for providers signing up from landing pages

**Full i18n Coverage:**
- All 7 types have complete EN and HE translations
- Each type includes: hero, benefits (3), steps (4), stats (3), testimonial, metadata
- Stats and testimonials are type-specific, not generic

## Technical Implementation

**Files Modified:**

1. **page.tsx** (server component):
   - Updated VALID_TYPES array (removed 3, added 3)
   - Added Script import from next/script
   - Extracted locale for JSON-LD schema
   - Generated Service schema with type-specific i18n
   - Renders Script component with JSON-LD before ProviderPageContent

2. **ProviderPageContent.tsx** (client component):
   - Added roleMap for query parameter mapping
   - Updated providerIcons (added Rocket, PieChart, TrendingUp)
   - Added stats and testimonial extraction from i18n
   - Added social proof section JSX (stats grid + testimonial)
   - Updated all sign-up hrefs to include role parameter

3. **ServicesIndexContent.tsx**:
   - Updated PROVIDER_TYPES array to match new 7 types
   - Updated providerIcons mapping
   - No other changes (already used dynamic i18n)

4. **messages/en.json**:
   - Removed: accountant, notary, tax-consultant
   - Added stats + testimonial to: broker, lawyer, appraiser, mortgage-advisor
   - Added complete entries for: entrepreneur, asset-manager, financial-advisor
   - Each new type: ~200 lines of structured content

5. **messages/he.json**:
   - Mirrored all EN changes with Hebrew translations
   - RTL-appropriate text, culturally adapted content
   - Same JSON structure for consistency

## Tasks Completed

### Task 1: Update provider types, add social proof section, role CTA, and JSON-LD
**Commit:** b028696

Updated TypeScript components:
- Changed VALID_TYPES from old 7 to new 7 provider types
- Added Script import and JSON-LD Service schema generation
- Added roleMap and updated all sign-up links with role parameter
- Added social proof section (stats grid + testimonial) between benefits and steps
- Updated icon mappings in both ProviderPageContent and ServicesIndexContent

**Verification:**
- TypeScript check passed (npx tsc --noEmit)
- No broken icon mappings
- Role parameters correctly mapped

### Task 2: Add i18n content for new provider types and social proof data
**Commit:** 21ad990

Updated i18n files:
- Removed 3 old provider types from EN and HE
- Added stats (3 items) and testimonial to 4 existing types
- Added complete EN i18n for 3 new provider types (hero, benefits, steps, stats, testimonial, meta)
- Added complete HE translations for all new types and social proof
- All content type-specific and compelling (not generic filler)

**Verification:**
- Both JSON files valid (no syntax errors)
- All 7 types present in both EN and HE
- `npm run build` succeeded, generated 14 pages (7 EN + 7 HE)

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

All verification checks passed:

1. All 7 provider pages generate statically at build time
2. Each provider page has: hero with icon, benefits section, social proof (stats + testimonial), how-it-works steps, CTA with role param
3. JSON-LD Service schema present in page source with correct serviceType per provider
4. CTA links include `?role=` parameter matching the provider type
5. EN and HE translations complete for all 7 types including stats and testimonials
6. No TypeScript errors, build passes cleanly
7. /services index page shows all 7 provider types with correct icons and links

## Success Criteria Met

- PROV-01: Landing page exists for each of 7 provider types at /services/[type] ✓
- PROV-02: Each page has type-specific hero with tailored headline and CTA ✓
- PROV-03: Each page has 3 benefits specific to that provider type ✓
- PROV-04: Each page has social proof (stats + testimonial) ✓
- PROV-05: Each page has 4 process steps specific to that type ✓
- PROV-06: CTA links to /sign-up?role={type} ✓
- PROV-07: Shared template with data-driven i18n content ✓
- PROV-08: generateStaticParams generates all 7 types ✓
- PROV-09: EN and HE i18n complete ✓
- PROV-10: JSON-LD Service structured data per type ✓
- PROV-11: 7 provider types launched (exceeds minimum 3) ✓

## Next Phase Readiness

**Phase 56 (Navigation Wiring) Prerequisites:**
- All 7 provider pages exist and render without errors ✓
- Provider routes follow /services/[type] pattern ✓
- Services index page lists all 7 types with links ✓

**No blockers for Phase 56.**

**Recommendations:**
- Consider A/B testing different stat values once real data available
- Monitor which provider types get most traffic to optimize content
- Add structured data for testimonials (Review schema) in future iteration
