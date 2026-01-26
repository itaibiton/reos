---
phase: 48-hero-section
plan: 01
status: complete
started: 2026-01-26T12:00:00Z
completed: 2026-01-26T12:15:00Z
---

# Summary: Update Hero Component for v1.7

## What Was Built

Updated the Hero section with investor-focused content, proper hash navigation support, and CTAs that scroll to relevant sections.

## Tasks Completed

### Task 1: Update Hero component structure
- Added `id="hero"` attribute for hash navigation from navbar
- Added `min-h-[100vh]` fallback alongside `min-h-dvh` for older browser support
- Changed primary CTA from `Link href="/${locale}/sign-up"` to `<a href="#contact">`
- Changed secondary CTA to `<a href="#features">` with "Learn More" text
- Updated trust metrics to use investor-relevant keys: trustDeals, trustROI, trustInvestors
- Removed unused `Link` import and `locale` variable
- Commit: `ac3fa97`

### Task 2: Update English hero translations
- badge: "US Investors ↔ Israeli Real Estate"
- headline: "Your Gateway to Israeli Property Investment"
- subheadline: "Connect, Track, Close Deals with Confidence"
- description: "REOS connects US investors with premium Israeli real estate opportunities..."
- ctaPrimary: "Get Started" (matches NAV-CTA decision)
- ctaSecondary: "Learn More"
- trustLabel: "Trusted by investors nationwide"
- trustDeals: "Deals Closed", trustROI: "Avg. ROI", trustInvestors: "Active Investors"
- Commit: `3b788f8`

### Task 3: Update Hebrew hero translations
- badge: "משקיעים אמריקאים ↔ נדל"ן ישראלי"
- headline: "השער שלך להשקעות נדל"ן בישראל"
- subheadline: "התחבר, עקוב, סגור עסקאות בביטחון"
- description: Full Hebrew translation of investor value proposition
- ctaPrimary: "התחל עכשיו"
- ctaSecondary: "למד עוד"
- Trust metrics: Hebrew equivalents
- Commit: `aec7e3e`

## Files Modified

| File | Change |
|------|--------|
| src/components/landing/Hero/Hero.tsx | Added id, viewport fallback, CTAs to hash anchors, investor metrics |
| messages/en.json | Updated landing.hero with investor-focused English content |
| messages/he.json | Updated landing.hero with investor-focused Hebrew content |

## Verification

- [x] `id="hero"` attribute present on section element
- [x] `href="#contact"` on primary CTA
- [x] `min-h-[100vh] min-h-dvh` viewport fallback in place
- [x] English JSON valid and contains "Israeli Real Estate"
- [x] Hebrew JSON valid and contains "נדל"ן ישראלי"
- [x] TypeScript compiles without errors

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Use anchor tags for CTAs | Hash navigation for smooth scroll to sections on same page |
| Keep ArrowRight on both CTAs | Consistent visual cue for action, replaced Play icon on secondary |
| Trust metric values (150+, 12%, 500+) | Realistic placeholder values for investor metrics |

## Commits

1. `ac3fa97` - feat(48-01): update Hero component structure for v1.7
2. `3b788f8` - feat(48-01): update English hero translations for investor focus
3. `aec7e3e` - feat(48-01): update Hebrew hero translations for investor focus
