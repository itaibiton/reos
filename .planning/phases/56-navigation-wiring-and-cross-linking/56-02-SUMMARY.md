---
phase: 56
plan: 02
subsystem: navigation-and-seo
tags: [navigation, i18n, routing, sitemap, seo, cta, links]

requires: [56-01]
provides:
  - CTA section links to /contact and /pricing with locale awareness
  - FAQ contact CTA linking to /contact with locale prefix
  - Pricing tier CTAs linking to /contact (enterprise) and /sign-up (investor/provider)
  - Complete sitemap.xml with all static and dynamic pages
  - i18n alternates (en/he) for all sitemap entries

affects: []

tech-stack:
  added: []
  patterns:
    - Locale-aware routing via Link from @/i18n/navigation
    - Next.js sitemap generation with MetadataRoute.Sitemap
    - i18n alternates pattern for SEO

key-files:
  created:
    - src/app/sitemap.ts
  modified:
    - src/components/newlanding/CTA.tsx
    - src/components/newlanding/FAQ.tsx
    - src/components/pricing/PricingTiers.tsx
    - src/components/newlanding/Navigation.tsx

decisions:
  - id: NAV-SITEMAP-LOCATION
    what: Place sitemap.ts at app root, not inside [locale]
    why: Next.js convention for sitemap generation at /sitemap.xml
    impact: Automatic sitemap serving without additional configuration

metrics:
  duration: 3 minutes
  completed: 2026-01-29
---

# Phase 56 Plan 02: CTA Link Wiring & Sitemap Summary

> Wired cross-page CTAs with locale-aware routing and generated comprehensive sitemap with i18n alternates for SEO.

## What Was Built

### Cross-Page CTA Links (NAV-04, NAV-05, NAV-06, NAV-07)

**CTA Section Links:**
- Converted "Contact Sales" button to Link component → /contact
- Converted "View Pricing" button to Link component → /pricing
- Preserved exact visual styling with inline classes (rounded-full, custom padding)
- Both links handle locale prefixing automatically

**FAQ Contact CTA:**
- Replaced hardcoded `<a href="/contact">` with `<Link href="/contact">`
- Maintains existing styling and behavior
- Locale prefix added automatically via Link component

**Pricing Tier CTAs:**
- Enterprise tier: Links to /contact (Contact Sales)
- Investor tier: Links to /sign-up (Get Started Free)
- Provider tier: Links to /sign-up (Start Free Trial)
- All use Button with `asChild` wrapping Link for shadcn/ui compatibility
- Conditional rendering based on tier.key for proper routing

### Comprehensive Sitemap (NAV-08)

**Static Pages (6 entries):**
- `/` (landing) - priority 1.0, monthly
- `/pricing` - priority 0.9, monthly
- `/services` - priority 0.8, weekly
- `/contact` - priority 0.6, monthly
- `/privacy` - priority 0.5, yearly
- `/terms` - priority 0.5, yearly

**Dynamic Provider Pages (7 entries):**
- `/services/broker` - priority 0.7, weekly
- `/services/lawyer` - priority 0.7, weekly
- `/services/appraiser` - priority 0.7, weekly
- `/services/mortgage-advisor` - priority 0.7, weekly
- `/services/entrepreneur` - priority 0.7, weekly
- `/services/asset-manager` - priority 0.7, weekly
- `/services/financial-advisor` - priority 0.7, weekly

**i18n Alternates:**
- Each entry includes `en` and `he` language alternates
- Pattern: `{BASE_URL}/en{path}` and `{BASE_URL}/he{path}`
- Proper hreflang signals for search engines

**Total:** 13 sitemap entries, 26 URLs (13 × 2 languages)

## Technical Implementation

### Link Component Pattern

All internal navigation now uses locale-aware Link:

```tsx
import { Link } from "@/i18n/navigation";

// Direct Link with styling (CTA section)
<Link
  href="/contact"
  className="px-8 py-4 bg-foreground text-background rounded-full..."
>
  {t("actions.contactSales")}
</Link>

// Button with asChild pattern (Pricing)
<Button variant="outline" asChild>
  <Link href="/contact">{tierT.cta}</Link>
</Button>
```

**Why this pattern:**
- Link automatically adds locale prefix (/en/contact, /he/contact)
- Client-side navigation with Next.js routing
- Type-safe with i18n routing config
- No manual locale handling needed

### Sitemap Generation

Next.js convention-based sitemap:

```typescript
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${BASE_URL}/en/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
      alternates: {
        languages: {
          en: `${BASE_URL}/en/pricing`,
          he: `${BASE_URL}/he/pricing`,
        },
      },
    },
    // ... more entries
  ];
}
```

**Served at:** `/sitemap.xml`
**Benefits:**
- Automatic generation on build
- Type-safe with MetadataRoute.Sitemap
- i18n alternates for proper language targeting
- Dynamic provider pages included
- Proper priority signals for crawlers

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed missing Factory icon import in Navigation.tsx**

- **Found during:** Task 1 verification (build check)
- **Issue:** TypeScript build error - `Factory` icon used but not imported from lucide-react
- **Fix:** Added `Factory` to lucide-react imports in Navigation.tsx
- **Files modified:** src/components/newlanding/Navigation.tsx
- **Commit:** c02ced2 (included with Task 1)
- **Rationale:** Build blocker - could not verify Task 1 without fixing this pre-existing bug

## Verification Results

✅ Build passes with no errors
✅ CTA "Contact Sales" links to /contact with locale prefix
✅ CTA "View Pricing" links to /pricing with locale prefix
✅ FAQ "Still have questions?" links to /contact with locale prefix
✅ Pricing enterprise tier links to /contact
✅ Pricing investor/provider tiers link to /sign-up
✅ All links use Link from @/i18n/navigation
✅ Sitemap.ts exists at src/app/sitemap.ts
✅ Sitemap contains 6 static + 7 provider = 13 entries
✅ Each entry has en and he alternates
✅ /sitemap.xml served by Next.js automatically

## Next Phase Readiness

**Ready for:** Phase 56 Plan 03 (if any) or Phase 57

**Blockers:** None

**Concerns:** None

**Recommendations:**
- Test locale switching on all CTA links to verify proper routing
- Verify /sitemap.xml renders correctly in production
- Consider adding lastModified dates from actual file modification times
- Monitor sitemap indexing in Google Search Console

## Files Changed

### Created (1)
- `src/app/sitemap.ts` - Sitemap generation with 13 entries and i18n alternates

### Modified (4)
- `src/components/newlanding/CTA.tsx` - Contact Sales and View Pricing CTAs
- `src/components/newlanding/FAQ.tsx` - Still have questions CTA
- `src/components/pricing/PricingTiers.tsx` - Conditional tier CTAs
- `src/components/newlanding/Navigation.tsx` - Factory icon import fix

## Decisions Made

| ID | Decision | Rationale | Impact |
|----|----------|-----------|--------|
| NAV-SITEMAP-LOCATION | Place sitemap.ts at app root (src/app/sitemap.ts), not inside [locale] | Next.js convention for sitemap generation | Automatic serving at /sitemap.xml without additional config |
| NAV-CTA-STYLING | Use Link with inline className instead of Button asChild for CTA section | Preserves exact rounded-full styling without shadcn Button class conflicts | Visual consistency with design, no regression |
| NAV-PRICING-CONDITIONAL | Conditionally route enterprise to /contact, others to /sign-up | Enterprise requires sales discussion, self-service tiers go to signup | Proper user flow based on tier complexity |

## Lessons Learned

**What worked well:**
- Locale-aware Link component handles all i18n routing automatically
- Next.js sitemap convention provides type safety and automatic serving
- Inline className on Link preserves custom styling without Button wrapper conflicts
- Conditional rendering based on tier.key provides clean routing logic

**What could be improved:**
- Could extract sitemap entries to separate config file for easier maintenance
- Consider dynamic lastModified based on actual content update times
- Could add more granular priority calculation based on page importance

**What to watch:**
- Build time impact of sitemap generation (currently negligible)
- Sitemap size as more provider types are added
- Locale prefix handling in production environment

## Task Breakdown

| Task | Description | Commit | Files Changed | Duration |
|------|-------------|--------|---------------|----------|
| 1 | Wire CTA, FAQ, and Pricing links | c02ced2 | CTA.tsx, FAQ.tsx, PricingTiers.tsx, Navigation.tsx | 2 min |
| 2 | Create sitemap.ts with all pages | 3ef4deb | sitemap.ts | 1 min |

**Total Duration:** 3 minutes
**Total Commits:** 2
**Total Files Changed:** 5 (1 created, 4 modified)
