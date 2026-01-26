# Phase 48: Hero Section - Research

**Researched:** 2026-01-26
**Domain:** Landing page hero section for investor-focused real estate platform
**Confidence:** HIGH

## Summary

Phase 48 requires adapting the existing hero section for the new investor-focused REOS landing page. The project already has a comprehensive Hero component (`src/components/landing/Hero/Hero.tsx`) with sophisticated animations, background effects, and an ecosystem visualization. The challenge is to refocus the content, messaging, and visuals to speak to US investors interested in Israeli real estate opportunities.

Modern hero section best practices in 2026 emphasize:
1. Full-viewport height using `min-h-dvh` (dynamic viewport height) for mobile compatibility
2. Single, clear primary CTA above the fold with optional secondary action
3. Scroll indicators with smooth animations to encourage exploration
4. High-contrast visuals that don't compete with the headline
5. Mobile-first responsive design with thumb-friendly CTA zones

The existing REOS hero implementation already follows these patterns with Framer Motion animations, reduced motion support, and proper accessibility. The primary work is content adaptation and ensuring the hero works with the fixed navbar (z-50) from Phase 47.

**Primary recommendation:** Update hero content to focus on investor value proposition ("Connect with Israeli Real Estate Opportunities"), ensure `id="hero"` attribute for hash navigation, verify 100vh works with fixed navbar padding, and adjust CTA to match NAV-CTA decision ("Get Started" scrolls to #contact).

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.1 | App Router, SSR, SEO | Industry standard, excellent for landing pages with static optimization |
| Framer Motion | 12.26.2 | Hero animations, scroll indicators | De facto standard for React animations, built-in reduced motion support |
| Tailwind CSS | v4 | Responsive utilities, viewport units | Modern standard, min-h-dvh support for mobile viewport handling |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Lucide React | 0.562.0 | Hero icons, CTA arrow icons | Already in project, lightweight, 1000+ icons |
| next-intl | 4.7.0 | Multilingual hero content | Already in project, supports English/Hebrew for REOS |
| clsx + tailwind-merge | Latest | Conditional hero styling | Via `cn()` utility in existing hero component |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| min-h-dvh | min-h-vh | dvh handles mobile address bar better, but vh has wider support (use vh as fallback) |
| Framer Motion scroll indicator | CSS-only animation | CSS is lighter but Framer Motion respects reduced motion automatically |
| Custom hero visual | Stock photography | Custom geometric visuals (already implemented) look more distinctive than stock images |

**Installation:**
All dependencies already installed. No new packages required.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   └── [locale]/
│       └── (main)/
│           └── page.tsx              # Landing page - imports Hero
├── components/
│   └── landing/
│       └── Hero/
│           ├── Hero.tsx              # EXISTS - Main hero component
│           ├── HeroBackground.tsx    # EXISTS - Animated background
│           └── HeroEcosystem.tsx     # EXISTS - Visual diagram
└── messages/
    └── en.json                       # Translation strings for hero
```

### Pattern 1: Full-Viewport Hero with Fixed Navbar Compensation
**What:** Use `min-h-dvh` for mobile-friendly 100vh, add padding-top to compensate for fixed navbar

**When to use:** All full-viewport hero sections with fixed navigation

**Example:**
```tsx
// Source: Modern CSS viewport units 2026
// https://medium.com/@tharunbalaji110/understanding-mobile-viewport-units-a-complete-guide-to-svh-lvh-and-dvh-0c905d96e21a
<section
  id="hero"
  className={cn(
    "relative min-h-dvh min-h-[100vh]", // dvh with vh fallback
    "flex items-center",
    "pt-20 pb-16 sm:pt-24 md:pt-28 lg:pt-32", // Accounts for navbar height
    "px-4 sm:px-6 lg:px-8",
    "overflow-hidden"
  )}
  aria-label="Hero section"
>
  {/* Hero content */}
</section>
```

**Why min-h-dvh:** Dynamic viewport height (dvh) adjusts for mobile browser UI (address bars) automatically. On iOS Safari, 100vh can cause content to be hidden behind the address bar. The dvh unit solves this. Include min-h-[100vh] as fallback for older browsers.

### Pattern 2: CTA Button Hierarchy (Primary + Secondary)
**What:** Single prominent primary CTA, optional secondary CTA with less visual weight

**When to use:** Hero sections that need to offer two user paths without confusion

**Example:**
```tsx
// Source: REOS existing implementation + 2026 CTA best practices
// https://www.landingpageflow.com/post/best-cta-placement-strategies-for-landing-pages
<div className="flex flex-col sm:flex-row items-center gap-4">
  {/* Primary CTA - high contrast, larger */}
  <Button
    size="lg"
    className={cn(
      "bg-landing-primary text-white",
      "hover:bg-landing-primary/90",
      "clip-corner-cut-tr",
      "px-8 py-6 text-lg font-semibold",
      "shadow-lg shadow-landing-primary/20"
    )}
    asChild
  >
    <a href="#contact">Get Started</a>
  </Button>

  {/* Secondary CTA - outline, less prominent */}
  <Button
    size="lg"
    variant="outline"
    className={cn(
      "border-landing-primary/30 text-landing-text",
      "hover:bg-landing-primary/10",
      "px-8 py-6 text-lg font-medium"
    )}
  >
    <Play className="me-2 h-5 w-5" />
    Watch Demo
  </Button>
</div>
```

**Best practices:**
- Primary CTA uses action verbs: "Start Investing", "Get Started", "Join Now"
- Secondary CTA is educational: "Watch Demo", "Learn More", "See How It Works"
- Mobile: Stack vertically, primary CTA first
- Desktop: Horizontal layout, primary CTA left (F-pattern reading)

### Pattern 3: Animated Scroll Indicator
**What:** Subtle arrow/chevron animation at bottom of hero that bounces to indicate scrolling

**When to use:** Full-viewport heroes where content continues below the fold

**Example:**
```tsx
// Source: Existing REOS implementation + Framer Motion docs
// https://www.framer.com/motion/use-scroll/
<motion.div
  initial={{ opacity: 0, y: -10 }}
  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
  transition={shouldReduceMotion ? { duration: 0.01 } : { delay: 1.5, duration: 0.5 }}
  className="absolute bottom-8 left-1/2 -translate-x-1/2"
>
  <motion.div
    animate={shouldReduceMotion ? {} : { y: [0, 8, 0] }}
    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    className="flex flex-col items-center gap-2 text-landing-text/50"
  >
    <span className="text-xs uppercase tracking-widest">Scroll</span>
    <ChevronDown className="w-5 h-5" />
  </motion.div>
</motion.div>
```

**Accessibility:** Always check `useReducedMotion()` to disable animations for users who prefer reduced motion.

### Pattern 4: Hero Visual Placement (Two-Column Layout)
**What:** Split hero into text content (left) and visual element (right) on desktop, stack on mobile

**When to use:** Heroes with both text and visual content that need equal emphasis

**Example:**
```tsx
// Source: Existing REOS implementation
<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
  {/* Text content - left on desktop, top on mobile */}
  <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
    <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
      {t("landing.hero.headline")}
    </h1>
    <p className="font-serif-display text-xl sm:text-2xl md:text-3xl italic">
      {t("landing.hero.subheadline")}
    </p>
    {/* CTAs */}
  </div>

  {/* Visual - right on desktop, bottom on mobile */}
  <div className="relative lg:order-last">
    <HeroEcosystem className="w-full max-w-lg mx-auto" />
  </div>
</div>
```

### Pattern 5: Hash Navigation with ID Attribute
**What:** Add `id="hero"` to hero section so navbar links with `href="#hero"` can scroll to it

**When to use:** All landing page sections that are navigation targets

**Example:**
```tsx
// Source: Hash navigation best practices 2026
// https://css-tricks.com/hash-tag-links-padding/
<section
  id="hero"
  className="min-h-dvh"
  aria-label="Hero section"
>
  {/* Hero content */}
</section>
```

**CSS companion (already in globals.css):**
```css
/* Offset scroll target to account for fixed navbar */
:target {
  scroll-margin-top: 5rem; /* 80px for navbar height */
}
```

This ensures when users click `<a href="#hero">`, the scroll position accounts for the fixed navbar.

### Anti-Patterns to Avoid
- **100vh without fallback:** Mobile browsers with dynamic address bars will have overlap issues. Always use `min-h-dvh min-h-[100vh]` for fallback.
- **Multiple competing CTAs:** Hero should have ONE clear primary action. Too many CTAs reduce conversions by up to 266% (2026 research).
- **Text over busy backgrounds:** Ensure text has sufficient contrast (WCAG AA: 4.5:1 ratio). Use overlays or gradients if background is complex.
- **Forgetting scroll-margin-top:** Fixed navbars cover content when scrolling to hash anchors. Always set scroll-margin-top on target sections.
- **Animation without reduced motion check:** Always respect `prefers-reduced-motion` media query via `useReducedMotion()` hook.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Scroll indicator animation | Custom CSS keyframes with state management | Framer Motion motion.div with animate prop | Built-in reduced motion support, easier to maintain, integrates with other animations |
| Viewport height calculation | JavaScript to measure window height | Tailwind `min-h-dvh` with `min-h-[100vh]` fallback | CSS-native, handles mobile browser UI automatically, better performance |
| CTA button hover effects | Custom CSS transitions | Framer Motion whileHover and whileTap | Consistent with other animations, respects reduced motion, easier to orchestrate |
| Hash scroll behavior | window.scrollTo() with offset calculations | CSS `scroll-behavior: smooth` + `scroll-margin-top` | Native browser behavior, no JavaScript, works with keyboard navigation |
| Responsive text sizing | Manual media queries | Tailwind responsive typography (text-4xl sm:text-5xl md:text-6xl) | Consistent breakpoints, mobile-first, fewer CSS lines |
| Background gradients | Multiple CSS classes | Tailwind gradient utilities (bg-gradient-to-br from-X via-Y to-Z) | Declarative, design system consistency, easier to modify |

**Key insight:** Framer Motion's `useReducedMotion()` hook is critical for accessibility. Hand-rolling reduced motion checks requires manual media query monitoring and cleanup. Framer Motion handles this automatically across all motion components.

## Common Pitfalls

### Pitfall 1: Mobile Viewport Height (100vh) Bug
**What goes wrong:** On iOS Safari and mobile Chrome, 100vh includes the address bar height. When the page loads, content at the bottom of the hero is hidden behind the address bar. As users scroll and the address bar shrinks, content jumps or shifts.

**Why it happens:** Mobile browsers define viewport height (vh) based on the largest possible viewport (when address bar is hidden), but initially the address bar is visible, creating a mismatch.

**How to avoid:**
- Use `min-h-dvh` (dynamic viewport height) as primary unit
- Include `min-h-[100vh]` as fallback for browsers without dvh support (~10% of browsers as of 2026)
- Test on actual iOS devices, not just browser DevTools

**Warning signs:**
- Hero content cut off on initial mobile load
- Content "jumps" when scrolling on mobile
- Address bar overlaps hero CTA buttons

**Example:**
```tsx
// Correct approach with fallback
<section className="min-h-dvh min-h-[100vh]">

// Incorrect - no mobile compensation
<section className="min-h-[100vh]">
```

**Further reading:** [Understanding Mobile Viewport Units](https://medium.com/@tharunbalaji110/understanding-mobile-viewport-units-a-complete-guide-to-svh-lvh-and-dvh-0c905d96e21a)

### Pitfall 2: CTA Button Not Thumb-Friendly on Mobile
**What goes wrong:** CTA buttons placed too high (above the fold but near top) are hard to reach with one-handed mobile use. Buttons smaller than 44×44px are difficult to tap accurately.

**Why it happens:** Desktop-first design places CTAs near headline (top of screen), but mobile users hold phones at bottom. Small desktop button sizes don't account for touch target requirements.

**How to avoid:**
- Position CTA in the vertical middle of the hero on mobile (not at very top)
- Ensure minimum touch target of 44×44px (Apple) or 48×48px (Android)
- Add sufficient spacing between multiple CTAs (minimum 8px gap)
- Test with thumb-friendly zone overlays (bottom third of screen is easiest)

**Warning signs:**
- User testing shows missed taps on CTA
- Mobile analytics show lower conversion than desktop
- CTA requires scrolling on some mobile screens

**Example:**
```tsx
// Good: Large touch targets with spacing
<Button size="lg" className="px-8 py-6 text-lg">
  Get Started
</Button>

// Bad: Small touch target
<Button size="sm" className="px-3 py-1 text-sm">
  Get Started
</Button>
```

**Further reading:** [CTA Button Placement Best Practices](https://www.dancingchicken.com/post/cta-button-placement-best-practices-landing-pages)

### Pitfall 3: Hero Visual Competes with Headline
**What goes wrong:** Hero background or visual element is too busy/colorful, making headline difficult to read. Users focus on visual instead of message.

**Why it happens:** Designer excitement about visuals overtakes user experience. No contrast checks during design phase.

**How to avoid:**
- Ensure headline has 4.5:1 contrast ratio minimum (WCAG AA)
- Use subtle, low-opacity background patterns (existing REOS uses 0.03-0.1 opacity)
- Add gradient overlays to reduce background complexity
- Test with grayscale mode to check if hierarchy still works

**Warning signs:**
- Headline difficult to read on certain screen sizes
- WCAG contrast checker fails
- Users report "can't find the main message"
- Eye-tracking shows users focus on visual instead of text

**Example:**
```tsx
// Good: Subtle background (REOS implementation)
<div className="absolute inset-0 opacity-[0.03]">
  <DiagonalGrid />
</div>

// Bad: High-opacity competing visual
<div className="absolute inset-0 opacity-60">
  <BusyPattern />
</div>
```

### Pitfall 4: Scroll Indicator Doesn't Disappear on Scroll
**What goes wrong:** Scroll indicator (down arrow) remains visible after users scroll past hero section, creating visual clutter and confusing UX.

**Why it happens:** Animation doesn't track scroll position or viewport visibility.

**How to avoid:**
- Use `useInView` hook to detect when hero is visible
- Only show scroll indicator when hero is in view
- Add fade-out animation as users start scrolling
- Position absolutely at bottom of hero (not fixed to viewport)

**Warning signs:**
- Scroll indicator visible on subsequent sections
- Indicator overlaps next section content
- Users report "bouncing arrow won't go away"

**Example:**
```tsx
// Good: Tied to hero visibility
const ref = useRef<HTMLElement>(null);
const isInView = useInView(ref, { once: false, amount: 0.5 });

<motion.div
  animate={isInView ? { opacity: 1 } : { opacity: 0 }}
  className="absolute bottom-8"
>
  <ScrollIndicator />
</motion.div>

// Bad: Always visible
<div className="fixed bottom-8">
  <ScrollIndicator />
</div>
```

### Pitfall 5: Missing ID for Hash Navigation
**What goes wrong:** Navbar links with `href="#hero"` don't scroll to hero section, or scroll to wrong position due to fixed navbar overlap.

**Why it happens:** Forgot to add `id="hero"` attribute, or didn't set `scroll-margin-top` to account for navbar height.

**How to avoid:**
- Add unique `id` attribute to all sections referenced in navigation
- Set `scroll-margin-top: 5rem` in CSS (already in globals.css) to offset fixed navbar
- Verify smooth scroll behavior is enabled (`scroll-behavior: smooth` on html)
- Test keyboard navigation (Tab + Enter on link should scroll correctly)

**Warning signs:**
- Clicking nav link doesn't scroll anywhere
- Scroll position is partially hidden behind navbar
- URL changes (#hero) but page doesn't move
- Keyboard users can't navigate to sections

**Example:**
```tsx
// Good: ID + proper scroll margin
<section
  id="hero"
  className="min-h-dvh"
>
  {/* Hero content */}
</section>

// globals.css (already exists)
:target {
  scroll-margin-top: 5rem;
}

// Bad: Missing ID
<section className="min-h-dvh">
  {/* Hero content */}
</section>
```

## Code Examples

Verified patterns from official sources and existing codebase:

### Complete Hero Section with All Requirements
```tsx
// Source: Existing REOS Hero.tsx + 2026 best practices
"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HeroBackground } from "./HeroBackground";
import { HeroVisual } from "./HeroVisual";

export function Hero({ className }: { className?: string }) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const shouldReduceMotion = useReducedMotion();
  const t = useTranslations("landing.hero");

  return (
    <section
      ref={ref}
      id="hero"
      className={cn(
        "relative min-h-dvh min-h-[100vh]", // HERO-01: Full viewport with mobile fallback
        "flex items-center",
        "pt-20 pb-16 sm:pt-24 md:pt-28 lg:pt-32", // Accounts for fixed navbar
        "px-4 sm:px-6 lg:px-8",
        "overflow-hidden",
        className
      )}
      aria-label="Hero section"
    >
      {/* HERO-04: Animated background */}
      <HeroBackground />

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-7xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text content */}
          <motion.div
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center text-center lg:items-start lg:text-left"
          >
            {/* HERO-01: Compelling headline */}
            <motion.h1
              className={cn(
                "font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl",
                "tracking-wide uppercase leading-[0.9]",
                "text-landing-text mb-4"
              )}
            >
              {t("headline")}
            </motion.h1>

            {/* HERO-02: Subheadline with value proposition */}
            <motion.p
              className={cn(
                "font-serif-display text-xl sm:text-2xl md:text-3xl",
                "text-landing-primary italic mb-6"
              )}
            >
              {t("subheadline")}
            </motion.p>

            {/* Description */}
            <motion.p
              className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl mb-8"
            >
              {t("description")}
            </motion.p>

            {/* HERO-03: Primary CTA button */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Button
                size="lg"
                className={cn(
                  "bg-landing-primary text-white hover:bg-landing-primary/90",
                  "clip-corner-cut-tr px-8 py-6 text-lg font-semibold",
                  "shadow-lg shadow-landing-primary/20"
                )}
                asChild
              >
                <a href="#contact">
                  {t("ctaPrimary")}
                  <ArrowRight className="ms-2 h-5 w-5" />
                </a>
              </Button>

              {/* Secondary CTA */}
              <Button
                size="lg"
                variant="outline"
                className={cn(
                  "border-landing-primary/30 text-landing-text",
                  "hover:bg-landing-primary/10 px-8 py-6 text-lg"
                )}
              >
                {t("ctaSecondary")}
              </Button>
            </div>
          </motion.div>

          {/* HERO-04: Hero visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={shouldReduceMotion ? { duration: 0.01 } : { duration: 0.8, delay: 0.3 }}
            className="relative lg:order-last"
          >
            <HeroVisual className="w-full max-w-lg mx-auto" />
          </motion.div>
        </div>
      </div>

      {/* HERO-05: Scroll indicator animation */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
        transition={shouldReduceMotion ? { duration: 0.01 } : { delay: 1.5, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={shouldReduceMotion ? {} : { y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 text-landing-text/50"
        >
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </section>
  );
}
```

### Translation Strings for Investor-Focused Hero
```json
// messages/en.json
{
  "landing": {
    "hero": {
      "badge": "US Investors ⟷ Israeli Real Estate",
      "headline": "Your Gateway to Israeli Property Investment",
      "subheadline": "Connect, Track, Close Deals with Confidence",
      "description": "REOS connects US investors with premium Israeli real estate opportunities. From discovery to closing, manage your entire investment journey on one platform.",
      "ctaPrimary": "Start Investing",
      "ctaSecondary": "Watch Demo",
      "trustLabel": "Trusted by investors nationwide",
      "trustProperties": "Properties",
      "trustSatisfaction": "Success Rate",
      "trustSupport": "Support"
    }
  }
}
```

### CSS Viewport Units with Fallback
```css
/* Source: Tailwind CSS v4 + modern viewport units
   https://tailwindcss.com/docs/min-height
   https://medium.com/@tharunbalaji110/understanding-mobile-viewport-units-a-complete-guide-to-svh-lvh-and-dvh-0c905d96e21a */

/* In component className */
.hero-section {
  min-height: 100vh; /* Fallback for browsers without dvh support */
  min-height: 100dvh; /* Dynamic viewport height - adjusts for mobile UI */
}

/* Or with Tailwind utilities (preferred) */
<section className="min-h-dvh min-h-[100vh]">
```

**Why this order:** CSS cascade means the second `min-height` overrides the first IF the browser supports dvh. Browsers that don't support dvh ignore it and use the vh fallback.

### Scroll Indicator Component (Reusable)
```tsx
// Source: Framer Motion docs + REOS implementation
// components/landing/Hero/ScrollIndicator.tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export function ScrollIndicator() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={shouldReduceMotion ? {} : { y: [0, 8, 0] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="flex flex-col items-center gap-2 text-landing-text/50 cursor-pointer"
      onClick={() => {
        // Scroll to next section
        const nextSection = document.getElementById("features");
        nextSection?.scrollIntoView({ behavior: "smooth" });
      }}
    >
      <span className="text-xs uppercase tracking-widest">Scroll</span>
      <ChevronDown className="w-5 h-5" aria-hidden="true" />
    </motion.div>
  );
}
```

### Landing Page with Hash Navigation
```tsx
// Source: app/[locale]/(main)/page.tsx pattern
export default function LandingPage() {
  return (
    <div className="landing-section-bg">
      {/* HERO-01 to HERO-05: Hero Section */}
      <Hero id="hero" />

      {/* LOGO-01 to LOGO-02: Trust/Logos Section */}
      <TrustLogos id="logos" />

      {/* FEAT-01 to FEAT-05: Features Section */}
      <Features id="features" />

      {/* TEST-01 to TEST-03: Testimonials Section */}
      <Testimonials id="testimonials" />

      {/* FORM-01 to FORM-04: Contact Form */}
      <ContactForm id="contact" />
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 100vh only | min-h-dvh with vh fallback | 2025-2026 | Solves mobile viewport issues with dynamic browser UI |
| Multiple CTAs in hero | Single primary + optional secondary | 2024-2026 shift | Research shows 266% conversion drop with competing CTAs |
| Stock photography | Custom geometric visuals / 3D illustrations | 2024-2026 trend | More distinctive, better brand identity, faster load times |
| CSS-only animations | Framer Motion declarative animations | 2023-2026 | Built-in reduced motion, easier orchestration, better UX |
| Absolute scroll calculations | scroll-margin-top CSS property | 2022+ | Native browser support, works with keyboard navigation |
| Desktop-first hero | Mobile-first with thumb zones | 2023-2026 | Mobile traffic now 60%+ for landing pages |

**Deprecated/outdated:**
- **100vh without mobile consideration:** Mobile browsers have dynamic address bars; dvh is now standard for hero sections
- **Multiple competing CTAs:** Research shows single clear action converts better; secondary CTA should be visually distinct
- **Heavy video backgrounds:** Slow load times hurt conversion more than video helps; subtle animations or gradients preferred
- **"Hero fold" obsession:** Modern best practice is ensuring key message + CTA visible, not cramming everything above fold

## Open Questions

Things that couldn't be fully resolved:

1. **Hero visual content for investor focus**
   - What we know: Existing HeroEcosystem shows REOS platform services (Properties, Tenants, Maintenance)
   - What's unclear: Whether this visualization aligns with investor landing page, or if we need different visual (property images, map of Israel, investment flow diagram)
   - Recommendation: Test current ecosystem visualization with investor messaging; consider property showcase or geographic visualization if ecosystem doesn't resonate

2. **Trust indicators specificity**
   - What we know: Existing hero has trust stats (500+ Properties, 98% Satisfaction, 24/7 Support)
   - What's unclear: Whether these metrics are real, placeholder, or need updating for investor audience (e.g., "Total Deals Closed", "Average ROI", "Active Investors")
   - Recommendation: Verify with stakeholder if metrics are real or placeholder; adjust to investor-relevant metrics

3. **Secondary CTA action**
   - What we know: Primary CTA scrolls to #contact (per NAV-CTA decision), secondary shows "Watch Demo"
   - What's unclear: Does "Watch Demo" video exist, or is this placeholder for future VID-01 requirement (Phase 51)
   - Recommendation: If video doesn't exist yet, consider alternative secondary CTA like "Learn More" scroll to #features, or disable secondary CTA until video ready

4. **dvh browser support threshold**
   - What we know: dvh has ~90% browser support as of 2026, requires vh fallback for ~10% of users
   - What's unclear: Whether REOS analytics show significant traffic from non-dvh browsers (older iOS, Android)
   - Recommendation: Use `min-h-dvh min-h-[100vh]` pattern; monitor analytics for viewport-related issues

## Sources

### Primary (HIGH confidence)
- Existing REOS Codebase: `/src/components/landing/Hero/Hero.tsx` - Verified working implementation with animations, accessibility, responsive design
- Existing REOS Codebase: `/src/app/globals.css` - CSS custom properties for landing colors, scroll-margin-top already configured
- Existing REOS Codebase: `/messages/en.json` - Translation structure for hero content
- Framer Motion Official Docs: [useScroll Hook](https://www.framer.com/motion/use-scroll/) - Scroll-linked animations, scroll indicators
- Next.js 16 Official Docs: [App Router](https://nextjs.org/blog/next-16) - Server/client component patterns, layout architecture
- Tailwind CSS v4 Docs: [Min Height Utilities](https://tailwindcss.com/docs/min-height) - Viewport units, responsive utilities

### Secondary (MEDIUM confidence)
- [Understanding Mobile Viewport Units: svh, lvh, dvh](https://medium.com/@tharunbalaji110/understanding-mobile-viewport-units-a-complete-guide-to-svh-lvh-and-dvh-0c905d96e21a) - WebSearch verified with multiple sources - dvh vs vh for mobile
- [The Best CTA Placement Strategies For 2026 Landing Pages](https://www.landingpageflow.com/post/best-cta-placement-strategies-for-landing-pages) - WebSearch, corroborated by multiple UX research sources
- [Hero Section Design: Best Practices & Examples for 2026](https://www.perfectafternoon.com/2025/hero-section-design/) - WebSearch, general hero section patterns
- [CSS Hash Tag Links Padding](https://css-tricks.com/hash-tag-links-padding/) - Official CSS-Tricks, scroll-margin-top usage
- [Prismic Hero Section Best Practices](https://prismic.io/blog/website-hero-section) - WebSearch verified, hero layout patterns

### Tertiary (LOW confidence)
- [Real Estate Landing Page Examples](https://www.convertflow.com/campaigns/real-estate-landing-pages) - WebSearch only, visual inspiration but not technical guidance
- [Dribbble Real Estate Hero Sections](https://dribbble.com/tags/real-estate-hero-section) - Design examples, not implementation patterns
- [10 CTA Button Best Practices](https://bitly.com/blog/cta-button-best-practices-for-landing-pages/) - WebSearch, general CTA guidance

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified in package.json and existing codebase
- Architecture patterns: HIGH - Existing Hero component implements modern patterns (dvh, Framer Motion, reduced motion)
- Hero content adaptation: MEDIUM - Technical implementation clear, but investor-specific messaging needs stakeholder validation
- Visual strategy: MEDIUM - Existing geometric visuals are high-quality, but alignment with investor audience unclear
- CTA targets: HIGH - Primary CTA to #contact confirmed by NAV-CTA decision, hash navigation already configured

**Research date:** 2026-01-26
**Valid until:** ~2026-03-26 (60 days) - Stack is mature (Next.js 16, Framer Motion 12, Tailwind v4 are current production versions), hero patterns are stable
