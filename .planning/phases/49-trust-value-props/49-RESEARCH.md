# Phase 49: Trust & Value Props - Research

**Researched:** 2026-01-26
**Domain:** Landing page social proof, value propositions, scroll animations
**Confidence:** HIGH

## Summary

Trust sections and value propositions are critical conversion elements on landing pages, leveraging social proof psychology to reduce user doubt. The standard approach in 2026 combines partner/client logos with 3-4 key value propositions, both enhanced with scroll-triggered fade-in animations.

The project already has Framer Motion 12.26.2 and established animation patterns in `src/components/landing/shared/animations.ts`, including `fadeInUp`, `staggerContainer`, and reduced-motion support via `useReducedMotion()` hook. The existing `SectionWrapper` component provides scroll-triggered animations via `useInView` from Framer Motion, making implementation straightforward.

For bilingual support (en/he), next-intl is configured with RTL awareness required for Hebrew. Logo displays should support both static grids and optional infinite marquee animations, with grayscale-to-color hover effects being industry standard for partner logos.

**Primary recommendation:** Use existing SectionWrapper with staggerContainer for both trust logos and value props sections. Implement logo grid with CSS grayscale filters and Tailwind CSS v4. Use Lucide icons (already in project as lucide-react 0.562.0) for value prop icons. Ensure reduced-motion support for all animations per WCAG 2.3.3.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Framer Motion | 12.26.2 | Scroll-triggered animations | Industry standard for React animations with useInView hook, tree-shakeable, excellent performance |
| Lucide React | 0.562.0 | Value prop icons | Already in project, 1,500+ clean stroke icons, tree-shakeable, consistent 24x24 grid |
| next/image | 16.1.1 | Logo optimization | Built-in Next.js 16 component, automatic WebP/AVIF, lazy loading, 60-80% file size reduction |
| Tailwind CSS | v4 | Styling & animations | Already in project, CSS filters for grayscale effects, grid layouts, responsive design |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next-intl | 4.7.0 | i18n for trust/value content | Already configured, supports RTL Hebrew, en/he locales |
| Existing animations.ts | - | Reusable animation variants | Use fadeInUp, staggerContainer, fadeIn for consistency |
| Existing SectionWrapper | - | Scroll detection wrapper | Use for both trust and value sections |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Lucide | Heroicons | Heroicons has only 290 icons vs 1,500+, but pairs well with Tailwind. Lucide already in project. |
| Static grid | Infinite marquee | Marquee adds motion/interest but requires careful accessibility (pause on hover, reduced-motion). Static is simpler. |
| useInView (Framer) | react-intersection-observer | Lighter weight (0.6kb) but Framer Motion already in bundle. No benefit to adding dependency. |

**Installation:**
```bash
# No new packages needed - all dependencies already installed
# framer-motion: 12.26.2
# lucide-react: 0.562.0
# next: 16.1.1
# next-intl: 4.7.0
```

## Architecture Patterns

### Recommended Project Structure
```
src/components/landing/
├── TrustSection/
│   ├── TrustSection.tsx          # Main trust/social proof section
│   ├── LogoGrid.tsx               # Partner/client logo grid
│   └── LogoMarquee.tsx            # Optional: infinite scrolling variant
├── ValueProps/
│   ├── ValuePropsSection.tsx      # Main value props section
│   ├── ValuePropCard.tsx          # Individual value prop with icon
│   └── index.ts                   # Exports
└── shared/
    ├── SectionWrapper.tsx         # Already exists - reuse
    ├── animations.ts              # Already exists - reuse
    └── SectionHeader.tsx          # Already exists - reuse
```

### Pattern 1: Trust Section with Logo Grid
**What:** Display partner/media logos with heading, grid layout, grayscale hover effect
**When to use:** LOGO-01, LOGO-02 requirements
**Example:**
```typescript
// Source: Project existing patterns + WebSearch findings
// File: src/components/landing/TrustSection/TrustSection.tsx

"use client";

import { SectionWrapper, SectionHeader } from "../shared";
import { LogoGrid } from "./LogoGrid";
import { useTranslations } from "next-intl";

export function TrustSection() {
  const t = useTranslations("landing.trust");

  return (
    <SectionWrapper
      id="trust"
      background="muted"
      animate={true}
      ariaLabel={t("heading")}
    >
      <SectionHeader
        title={t("heading")}
        subtitle={t("subheading")}
        centered={true}
      />
      <LogoGrid />
    </SectionWrapper>
  );
}

// File: src/components/landing/TrustSection/LogoGrid.tsx
import Image from "next/image";
import { motion } from "framer-motion";
import { fadeInUp } from "../shared/animations";

const logos = [
  { name: "Partner 1", src: "/logos/partner-1.svg" },
  { name: "Partner 2", src: "/logos/partner-2.svg" },
  // ... more logos
];

export function LogoGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 items-center">
      {logos.map((logo, index) => (
        <motion.div
          key={logo.name}
          variants={fadeInUp}
          custom={index}
          className="flex items-center justify-center"
        >
          <Image
            src={logo.src}
            alt={logo.name}
            width={120}
            height={60}
            className="grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
          />
        </motion.div>
      ))}
    </div>
  );
}
```

### Pattern 2: Value Props with Icons
**What:** 3-4 value propositions with icons, brief descriptions, staggered fade-in
**When to use:** VAL-01, VAL-02, VAL-03 requirements
**Example:**
```typescript
// Source: Project existing FeatureCard pattern + WebSearch findings
// File: src/components/landing/ValueProps/ValuePropsSection.tsx

"use client";

import { SectionWrapper, SectionHeader } from "../shared";
import { ValuePropCard } from "./ValuePropCard";
import { useTranslations } from "next-intl";
import { Shield, Zap, Users, TrendingUp } from "lucide-react";

const icons = {
  security: Shield,
  speed: Zap,
  community: Users,
  growth: TrendingUp,
};

export function ValuePropsSection() {
  const t = useTranslations("landing.valueProps");
  const valueProps = t.raw("items") as Array<{
    key: string;
    icon: keyof typeof icons;
    title: string;
    description: string;
  }>;

  return (
    <SectionWrapper
      id="value-props"
      background="transparent"
      animate={true}
      ariaLabel={t("heading")}
    >
      <SectionHeader
        title={t("heading")}
        subtitle={t("subheading")}
        centered={true}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {valueProps.map((prop) => (
          <ValuePropCard
            key={prop.key}
            icon={icons[prop.icon]}
            title={prop.title}
            description={prop.description}
          />
        ))}
      </div>
    </SectionWrapper>
  );
}

// File: src/components/landing/ValueProps/ValuePropCard.tsx
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { fadeInUp } from "../shared/animations";
import { cn } from "@/lib/utils";

interface ValuePropCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function ValuePropCard({ icon: Icon, title, description }: ValuePropCardProps) {
  return (
    <motion.div
      variants={fadeInUp}
      className="flex flex-col items-center text-center"
    >
      <div className={cn(
        "flex items-center justify-center",
        "w-16 h-16 mb-4",
        "rounded-lg",
        "bg-landing-primary/10",
        "text-landing-primary"
      )}>
        <Icon className="w-8 h-8" aria-hidden="true" />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-landing-text">
        {title}
      </h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}
```

### Pattern 3: Infinite Logo Marquee (Optional)
**What:** Pure CSS infinite scrolling logo carousel with accessibility
**When to use:** Alternative to static grid for visual interest
**Example:**
```typescript
// Source: Smashing Magazine infinite marquee pattern
// File: src/components/landing/TrustSection/LogoMarquee.tsx

"use client";

import Image from "next/image";
import { useReducedMotion } from "framer-motion";

const logos = [
  { name: "Partner 1", src: "/logos/partner-1.svg" },
  { name: "Partner 2", src: "/logos/partner-2.svg" },
  // Duplicate set for seamless loop
];

export function LogoMarquee() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        shouldReduceMotion ? "flex justify-evenly flex-wrap gap-8" : ""
      )}
      style={{
        maskImage: shouldReduceMotion
          ? "none"
          : "linear-gradient(to right, transparent, black 20%, black 80%, transparent)"
      }}
    >
      <div className={cn(
        "flex gap-12 items-center",
        !shouldReduceMotion && "animate-marquee"
      )}>
        {logos.map((logo, idx) => (
          <Image
            key={`${logo.name}-${idx}`}
            src={logo.src}
            alt={logo.name}
            width={120}
            height={60}
            className="grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300 flex-shrink-0"
          />
        ))}
      </div>
    </div>
  );
}

// tailwind.config.ts additions:
// theme: {
//   extend: {
//     animation: {
//       marquee: 'marquee 30s linear infinite',
//     },
//     keyframes: {
//       marquee: {
//         '0%': { transform: 'translateX(0)' },
//         '100%': { transform: 'translateX(-50%)' },
//       },
//     },
//   },
// }
```

### Pattern 4: Scroll-Triggered Animation Setup
**What:** Reuse existing SectionWrapper with useInView
**When to use:** VAL-03 requirement - scroll-triggered fade-in
**Example:**
```typescript
// Source: Existing project pattern in SectionWrapper.tsx
// This pattern is ALREADY IMPLEMENTED in the project

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { staggerContainer, reducedMotionContainer } from "./animations";

function MySection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, {
    once: true,        // Trigger only once
    amount: 0.2,       // 20% visible triggers animation
  });
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = shouldReduceMotion
    ? reducedMotionContainer
    : staggerContainer;

  return (
    <section ref={ref}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {/* Children with variants will stagger in */}
      </motion.div>
    </section>
  );
}
```

### Anti-Patterns to Avoid

- **Over-animation:** Don't animate every element. Trust logos and value props should fade in once, not continuously pulse or bounce. Excessive motion causes fatigue.

- **Ignoring reduced motion:** WCAG 2.3.3 requires respecting `prefers-reduced-motion`. Don't skip the `useReducedMotion()` check or reduced-motion CSS queries. Users with vestibular disorders need this.

- **Fake logos:** Don't use placeholder or fake partner logos. If you don't have real partners yet, skip the trust section entirely. Fake social proof destroys trust.

- **Unoptimized images:** Don't use `<img>` tags for logos. Use Next.js `<Image>` component for automatic optimization, lazy loading, and format conversion (WebP/AVIF).

- **Too many value props:** Don't list 6-8 benefits. Research shows 3-4 is optimal. More creates decision paralysis and reduces scanability.

- **Long descriptions:** Keep value prop descriptions to 1-2 sentences (15-25 words). If you need a paragraph, it's a feature, not a value prop.

- **Generic copy:** Avoid vague claims like "World-class service" or "Best platform." Be specific with quantified benefits: "Connect with 50+ vetted Israeli partners" or "Close deals 40% faster."

- **Missing alt text:** Don't forget meaningful alt text on partner logos for screen readers. "Partner 1 logo" is better than "" but "Goldman Sachs logo" is best.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Scroll-triggered animations | Custom Intersection Observer wrapper | Framer Motion useInView hook | Already in bundle, handles edge cases (amount, once, root), integrated with animation system |
| Infinite logo carousel | Custom JavaScript scroll loop | Pure CSS marquee with keyframes | CSS animations are GPU-accelerated, no JS overhead, simpler to implement and maintain |
| Reduced motion detection | Navigator API or custom hook | Framer Motion useReducedMotion() | Already in project, handles SSR correctly, consistent with existing animations |
| Image optimization | CDN or manual WebP conversion | Next.js Image component | Automatic format selection (WebP/AVIF), lazy loading, responsive srcset, LCP optimization built-in |
| Icon library | Custom SVG components | Lucide React (already installed) | 1,500+ icons, tree-shakeable, consistent sizing, semantic names, active maintenance |
| i18n for trust content | Context or manual switching | next-intl (already configured) | Handles RTL Hebrew, pluralization, type-safe translations, SSR-compatible |

**Key insight:** The project already has a mature animation system with accessibility built-in. Don't create parallel animation patterns—reuse SectionWrapper, existing variants, and Framer Motion hooks. Adding new animation approaches creates inconsistency and increases bundle size.

## Common Pitfalls

### Pitfall 1: Animation Performance on Mobile
**What goes wrong:** Scroll-triggered animations stutter or cause janky scrolling on mobile devices, especially with many elements animating simultaneously.
**Why it happens:** Mobile devices have less processing power. Animating properties like `width`, `height`, `top`, `left` triggers layout recalculations. Too many elements animating at once overwhelms the GPU.
**How to avoid:**
- Only animate `opacity`, `transform` (translate/scale/rotate) - these are GPU-accelerated
- Use `will-change: transform` sparingly (only on elements about to animate)
- Limit stagger animations to 4-6 items max per section
- Test on actual devices, not just Chrome DevTools mobile emulation
**Warning signs:**
- Frame drops in Chrome Performance panel
- Animations that feel choppy or delayed
- Page scroll feels heavy or unresponsive

### Pitfall 2: Logo Sizing Inconsistencies
**What goes wrong:** Partner logos have wildly different dimensions, creating an unbalanced grid with some logos tiny and others huge.
**Why it happens:** Real brand logos come in various aspect ratios (square, wide, tall). Setting uniform width/height distorts logos, but flexible sizing creates chaos.
**How to avoid:**
- Use `object-fit: contain` with fixed container dimensions
- Set max-width and max-height, not absolute dimensions
- Use Next.js Image with `width` and `height` props for aspect ratio, but CSS max-width/max-height to constrain
- Consider a two-tier system: primary partners (larger) vs. supporting partners (smaller)
**Warning signs:**
- One logo takes up 3x the space of others
- Stretched or squashed brand marks
- Optical weight imbalance (feels lopsided)

### Pitfall 3: Accessibility - Motion Without Escape
**What goes wrong:** Infinite marquee or auto-scrolling animations with no way to pause. Fails WCAG 2.3.3 (Animation from Interactions) at AAA level.
**Why it happens:** Developers forget that `prefers-reduced-motion` is set by only ~5-10% of users who need it. Infinite animations need controls for ALL users.
**How to avoid:**
- Respect `prefers-reduced-motion` (stop/disable animations)
- Add pause-on-hover for marquee animations
- Provide visible pause/play control for auto-scrolling content
- Consider auto-pausing after 5 seconds or providing static fallback
**Warning signs:**
- No pause mechanism for moving content
- Animation continues on hover/focus
- No testing with prefers-reduced-motion enabled
**WCAG reference:** Success Criterion 2.3.3 requires motion from interactions be disableable

### Pitfall 4: RTL Layout Breaking
**What goes wrong:** Trust section or value props look perfect in English but completely broken in Hebrew RTL mode. Logos stack wrong, icons appear on wrong side, visual hierarchy breaks.
**Why it happens:** Hard-coded directional CSS (`margin-left`, `text-align: left`, `flex-direction: row`) doesn't flip with `dir="rtl"`. Absolute positioning breaks. Transform animations go the wrong direction.
**How to avoid:**
- Use Tailwind's logical properties: `ms-4` (margin-start) not `ml-4`, `text-start` not `text-left`
- Avoid absolute positioning or use logical `inset-inline-start` not `left`
- Test with `<html dir="rtl">` early in development
- Use `flex-direction: row-reverse` for RTL via Tailwind's `rtl:` variant
- For animations, consider flipping x-axis transforms: `x: -40` becomes `x: 40` in RTL
**Warning signs:**
- Layout looks identical in LTR and RTL (no flipping occurred)
- Icons or arrows point wrong direction in Hebrew
- Reading order feels unnatural in RTL
**Testing:** Switch locale to `he`, verify visual hierarchy flows right-to-left

### Pitfall 5: Value Prop Icon Confusion
**What goes wrong:** Users can't quickly scan value props because icons don't match their descriptions, or multiple props use near-identical icons.
**Why it happens:** Designers/developers pick icons based on aesthetics ("this looks cool") rather than semantic meaning. Icon libraries have multiple similar icons (Shield, ShieldCheck, ShieldAlert, etc.).
**How to avoid:**
- Choose semantically clear icons: Shield = security, Zap = speed/performance, Users = community
- Avoid abstract icons that require explanation
- Use distinct icon categories (avoid two "shield" variants)
- Test icon recognition: can someone guess the value prop from icon alone?
- Prefer outlined (stroke) style for consistency with Lucide's default style
**Warning signs:**
- Three value props use variations of the same base icon
- You need a legend to explain what icons mean
- Icons feel decorative, not informative

### Pitfall 6: Translation Key Structure for Plural Forms
**What goes wrong:** English copy says "50+ partners" but translation system can't handle plural forms correctly, leading to awkward Hebrew translations.
**Why it happens:** next-intl supports ICU MessageFormat for plurals, but developers use simple string keys without plural variants.
**How to avoid:**
- Structure translation keys with ICU format: `"{count, plural, =0 {No partners} one {# partner} other {# partners}}"`
- For trust sections, separate numeric values from labels: `trustCount: "50"` and `trustLabel: "partners"`
- Consult Hebrew translator for correct plural forms (Hebrew has different rules than English)
**Warning signs:**
- Hard-coded numbers in English strings
- Plural forms look wrong in Hebrew
- Gender agreement issues (Hebrew adjectives match gender)

## Code Examples

Verified patterns from official sources:

### Framer Motion useInView with Animation Control
```typescript
// Source: LogRocket blog (verified pattern)
// https://blog.logrocket.com/react-scroll-animations-framer-motion/

import { motion, useAnimation } from "framer-motion";
import { useInView } from "framer-motion";
import { useEffect, useRef } from "react";

const fadeInVariant = {
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  hidden: { opacity: 0, y: 20 }
};

function AnimatedElement() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  return (
    <motion.div
      ref={ref}
      variants={fadeInVariant}
      initial="hidden"
      animate={controls}
    >
      Content fades in when scrolled into view
    </motion.div>
  );
}
```

### Simplified whileInView (Recommended for Simple Cases)
```typescript
// Source: Framer Motion documentation (modern approach)
// Simpler API, no need for useAnimation hook

import { motion } from "framer-motion";

function SimpleAnimatedElement() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
    >
      Content fades in when scrolled into view
    </motion.div>
  );
}
```

### CSS Grayscale Hover Effect with Accessibility
```css
/* Source: WebSearch best practices + WCAG guidance */

.logo-item {
  filter: grayscale(100%);
  opacity: 0.6;
  transition: filter 0.3s ease, opacity 0.3s ease;
}

.logo-item:hover {
  filter: grayscale(0%);
  opacity: 1;
}

/* Accessibility: Only apply hover on devices that support it */
@media (hover: none) {
  .logo-item {
    filter: grayscale(0%);
    opacity: 0.8;
  }
}

/* Reduce motion for users with vestibular disorders */
@media (prefers-reduced-motion: reduce) {
  .logo-item {
    transition: none;
  }
}
```

### Next.js Image Optimization for Logos
```typescript
// Source: Next.js 16 documentation
// https://nextjs.org/docs/app/api-reference/components/image

import Image from "next/image";

function LogoItem({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={120}
      height={60}
      quality={90}
      // Lazy load by default
      loading="lazy"
      // Optimize for logo type content
      className="grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
    />
  );
}
```

### Stagger Animation with Reduced Motion
```typescript
// Source: Existing project pattern (animations.ts + SectionWrapper.tsx)

import { motion, useReducedMotion } from "framer-motion";
import { staggerContainer, fadeInUp, reducedMotionInstant } from "./animations";

function ValuePropsGrid() {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = shouldReduceMotion
    ? { hidden: {}, visible: {} }
    : staggerContainer;

  const itemVariants = shouldReduceMotion
    ? reducedMotionInstant
    : fadeInUp;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
    >
      {items.map((item) => (
        <motion.div key={item.id} variants={itemVariants}>
          {item.content}
        </motion.div>
      ))}
    </motion.div>
  );
}
```

### RTL-Aware Layout with Tailwind
```typescript
// Source: next-intl + Tailwind RTL best practices

import { useLocale } from "next-intl";

function ValuePropCard({ icon: Icon, title, description }) {
  const locale = useLocale();
  const isRTL = locale === "he";

  return (
    <div className="flex flex-col items-center text-center">
      {/* Icon container - centered, no RTL adjustment needed */}
      <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-lg bg-landing-primary/10">
        <Icon className="w-8 h-8 text-landing-primary" />
      </div>

      {/* Text content - Tailwind handles RTL automatically with text-center */}
      <h3 className="text-xl font-semibold mb-2">
        {title}
      </h3>

      {/* Use text-start for left-align that flips in RTL, or text-center for always-centered */}
      <p className="text-muted-foreground leading-relaxed text-center">
        {description}
      </p>
    </div>
  );
}
```

### Infinite Marquee with Reduced Motion Fallback
```typescript
// Source: Smashing Magazine infinite marquee pattern
// https://www.smashingmagazine.com/2024/04/infinite-scrolling-logos-html-css/

"use client";

import { useReducedMotion } from "framer-motion";
import Image from "next/image";

function LogoMarquee({ logos }) {
  const shouldReduceMotion = useReducedMotion();

  // Duplicate logos for seamless loop
  const duplicatedLogos = [...logos, ...logos];

  if (shouldReduceMotion) {
    // Static grid fallback
    return (
      <div className="flex flex-wrap justify-center gap-8">
        {logos.map((logo, idx) => (
          <Image key={idx} src={logo.src} alt={logo.alt} width={120} height={60} />
        ))}
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden"
      style={{
        maskImage: "linear-gradient(to right, transparent, black 20%, black 80%, transparent)"
      }}
    >
      <div className="flex gap-12 animate-marquee hover:pause">
        {duplicatedLogos.map((logo, idx) => (
          <Image
            key={idx}
            src={logo.src}
            alt={logo.alt}
            width={120}
            height={60}
            className="flex-shrink-0"
          />
        ))}
      </div>
    </div>
  );
}

// In tailwind.config.ts:
// animation: {
//   marquee: 'marquee 30s linear infinite',
// },
// keyframes: {
//   marquee: {
//     '0%': { transform: 'translateX(0)' },
//     '100%': { transform: 'translateX(-50%)' },
//   },
// }
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-intersection-observer | Framer Motion useInView | FM 11.x (2023) | Unified animation library, one dependency instead of two, better integration with motion system |
| Custom scroll listeners | CSS Intersection Observer + Framer Motion | 2023-2024 | Better performance, declarative API, no manual scroll calculations |
| Font Awesome | Lucide/Heroicons | 2024-2025 | Smaller bundle sizes with tree-shaking, modern design system integration, stroke vs solid styles |
| Slick/Swiper carousels | Pure CSS marquee | 2025-2026 | No JS overhead for simple use cases, GPU-accelerated, simpler maintenance |
| Manual WebP conversion | Next.js Image automatic | Next.js 13+ | Automatic format selection (AVIF support added), lazy loading default, responsive srcset |
| Separate reduced-motion checks | Framer Motion useReducedMotion() | FM 10+ | Single hook for both CSS and JS animations, SSR-safe, consistent behavior |

**Deprecated/outdated:**
- **`<marquee>` HTML element:** Deprecated, use CSS animations instead. Modern browsers still support it but accessibility is poor and it's non-standard.
- **jQuery animation libraries:** SlickJS, OwlCarousel. Heavy dependencies, poor performance, React incompatible without wrappers.
- **`react-intersection-observer` separate package:** Redundant when Framer Motion provides `useInView` natively. Only add if NOT using Framer Motion.
- **Icon fonts (FontAwesome fonts):** Replaced by SVG icon libraries. Fonts cause FOIT/FOUT, accessibility issues, and can't be tree-shaken effectively.
- **Manual lazy loading:** Native browser `loading="lazy"` and Next.js Image handle this automatically. Custom Intersection Observer for images is unnecessary.

## Open Questions

Things that couldn't be fully resolved:

1. **Logo acquisition and licensing**
   - What we know: Partner logos should be in full color, SVG preferred for scalability, next/image supports SVG with remote patterns
   - What's unclear: Which actual partners/clients will provide logos, what their brand guidelines require
   - Recommendation: Create placeholder structure with sample logos, add TODO comment for logo replacement. Ensure layout works with varied aspect ratios (test with 1:1, 3:1, and 1:2 logos).

2. **Infinite marquee vs static grid decision**
   - What we know: Marquee adds visual interest but requires careful accessibility (pause-on-hover, reduced-motion). Static grid is simpler and more accessible by default.
   - What's unclear: User/stakeholder preference for trust section presentation style
   - Recommendation: Implement static grid first (meets all requirements), create LogoMarquee as opt-in alternative. Let Phase 49 success criteria determine which to use in production.

3. **Value prop icon selections**
   - What we know: Lucide provides 1,500+ icons, value props need semantically clear icons matching content
   - What's unclear: Exact value propositions haven't been finalized, so icon mapping is TBD
   - Recommendation: Define value props in translation files first, then select icons. Document icon choices in component comments for consistency. Common mappings: Shield (security/trust), Zap (speed), Users (community), TrendingUp (growth), CheckCircle (reliability), Clock (efficiency).

4. **Animation timing coordination**
   - What we know: Existing staggerContainer uses 0.1s stagger, 0.2s delay. Both trust and value sections will animate on scroll.
   - What's unclear: If both sections are close together, will sequential animations feel too slow? Should they use different timings?
   - Recommendation: Use standard staggerContainer for both (consistency). If sections are within one viewport of each other, consider reducing delayChildren to 0.1s for second section to avoid feeling sluggish.

## Sources

### Primary (HIGH confidence)
- [Framer Motion useInView documentation](https://motion.dev/docs/react-use-in-view) - Official API reference
- [Next.js Image Component documentation](https://nextjs.org/docs/app/api-reference/components/image) - Official Next.js 16 docs
- [WCAG 2.3.3: Animation from Interactions](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html) - W3C WCAG guidelines
- [Smashing Magazine: Infinite-Scrolling Logos In Flat HTML And Pure CSS](https://www.smashingmagazine.com/2024/04/infinite-scrolling-logos-html-css/) - Authoritative CSS technique
- Existing project code:
  - `/src/components/landing/shared/SectionWrapper.tsx` - Scroll animation pattern
  - `/src/components/landing/shared/animations.ts` - Animation variants
  - `/src/components/landing/Features/FeatureCard.tsx` - Icon + content pattern
  - `/package.json` - Confirmed library versions

### Secondary (MEDIUM confidence)
- [LogRocket: React scroll animations with Framer Motion](https://blog.logrocket.com/react-scroll-animations-framer-motion/) - Verified implementation patterns
- [12 Best Ways to Use Landing Page Social Proof in 2026](https://www.nudgify.com/social-proof-landing-pages/) - Industry best practices
- [11 Landing Page Best Practices (2026)](https://www.involve.me/blog/landing-page-best-practices) - Value prop layout patterns
- [Better Than Lucide: 8 Icon Libraries](https://hugeicons.com/blog/design/8-lucide-icons-alternatives-that-offer-better-icons) - Icon library comparison
- [Pope Tech: Design accessible animation and movement](https://blog.pope.tech/2025/12/08/design-accessible-animation-and-movement/) - December 2025 accessibility guidance
- [Next.js App Router Localization with next-intl](https://phrase.com/blog/posts/next-js-app-router-localization-next-intl/) - RTL implementation patterns

### Tertiary (LOW confidence)
- Various WordPress plugin documentation for logo carousels - UI patterns only, implementation differs
- WebSearch results on grayscale hover effects - Common pattern but specific implementations vary
- General landing page design trend articles - Directional guidance, not technical implementation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in project with confirmed versions, official docs verified
- Architecture: HIGH - Existing project patterns provide proven structure, scroll animations already implemented
- Pitfalls: MEDIUM-HIGH - Based on WebSearch + existing project patterns, some pitfalls are project-specific assumptions
- Code examples: HIGH - Mix of official docs (Framer Motion, Next.js), existing project code, and verified LogRocket patterns

**Research limitations:**
- Context7 MCP tool not available, relied on official documentation via WebFetch
- Specific value propositions and partner logos TBD, recommendations are structural
- Hebrew RTL testing assumptions based on next-intl docs, not verified in this specific project setup

**Research date:** 2026-01-26
**Valid until:** ~30 days (2026-02-26) - Tech stack is stable (Next.js 16, Framer Motion 12), patterns are mature. Re-validate if major version updates occur (Next.js 17, Framer Motion 13).
