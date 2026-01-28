---
phase: 53-landing-page-sections
plan: 01
subsystem: ui
tags: [framer-motion, next-intl, landing-page, animations, i18n, lucide-react]

# Dependency graph
requires:
  - phase: 47-new-landing-page
    provides: Landing page foundation, CTA and Stats components as animation reference patterns
provides:
  - HowItWorks landing section component with 4-step process flow
  - landing.howItWorks i18n namespace (EN + HE) with step-by-step investment guide
affects: [53-03-landing-integration, 56-navigation-wiring]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Scroll-triggered stagger animations with useInView + useReducedMotion"
    - "Numbered step flow with visual connector line (desktop only)"
    - "RTL-safe positioning using logical properties (-end-* instead of -right-*)"

key-files:
  created:
    - src/components/newlanding/HowItWorks.tsx
  modified:
    - messages/en.json
    - messages/he.json

key-decisions:
  - "Use logical properties (-end-2) instead of directional properties (-right-2) for RTL support"
  - "Visual connector line hidden on mobile (md:block) to avoid layout complexity on small screens"
  - "Amount: 0.2 for useInView trigger (20% visibility) matches Stats.tsx pattern"

patterns-established:
  - "Step-based flow sections use numbered badges positioned with logical properties for RTL"
  - "Icons array (STEP_ICONS) maps to steps by index for clean rendering loop"
  - "CTA buttons at section bottom use rounded-full style from CTA.tsx reference"

# Metrics
duration: 4min
completed: 2026-01-28
---

# Phase 53 Plan 01: How It Works Landing Section Summary

**Four-step investment process section with scroll-triggered stagger animations, visual step connectors, and RTL-safe positioning for EN/HE landing pages**

## Performance

- **Duration:** 4 minutes
- **Started:** 2026-01-28T18:12:30Z
- **Completed:** 2026-01-28T18:16:37Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Created HowItWorks.tsx component with 4 numbered steps showing investment flow (Account → Properties → Experts → Close)
- Added landing.howItWorks i18n namespace to English and Hebrew message files with complete step descriptions
- Implemented scroll-triggered stagger animation with reduced motion support for accessibility
- Visual connector line between steps on desktop layouts

## Task Commits

Each task was committed atomically:

1. **Task 1: Add How It Works i18n translations to EN and HE message files** - `8e288cb` (feat)
2. **Task 2: Create HowItWorks.tsx component with numbered steps and scroll animations** - `0f8fd72` (feat)

## Files Created/Modified
- `src/components/newlanding/HowItWorks.tsx` - Client component with 4-step process flow, scroll animations, and CTA
- `messages/en.json` - Added landing.howItWorks with heading, subheading, 4 steps, and CTA
- `messages/he.json` - Added landing.howItWorks Hebrew translations with full step descriptions

## Decisions Made

**1. RTL-safe positioning with logical properties**
- Used `-end-2` instead of `-right-2` for step number badge positioning
- Ensures correct badge placement in Hebrew (RTL) without separate styling
- Follows best practice for international web applications

**2. Visual connector line desktop-only**
- Hidden on mobile (`hidden md:block`) to avoid layout complexity on small screens
- Absolute positioning with percentage-based left/right creates clean desktop connection line
- Simplifies mobile layout while enhancing desktop visual flow

**3. useInView trigger threshold**
- Amount: 0.2 (20% visibility) matches Stats.tsx pattern for consistency
- Triggers animation when section is mostly visible, creating smooth scroll experience
- Paired with `once: true` to prevent re-animation on scroll up

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all tasks completed without issues. Reference components (CTA.tsx, Stats.tsx) provided clear patterns for imports, variants, and animation structure.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for integration:**
- HowItWorks component exists and follows newlanding conventions
- All i18n keys present in both EN and HE
- Awaits barrel export addition in Plan 03 (landing integration)

**No blockers** - component is self-contained and ready to render when imported.

---
*Phase: 53-landing-page-sections*
*Completed: 2026-01-28*
