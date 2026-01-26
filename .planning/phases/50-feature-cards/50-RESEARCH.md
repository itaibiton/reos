# Phase 50: Feature Cards - Research

**Researched:** 2026-01-26
**Domain:** Interactive feature cards with hover animations, icon mapping, i18n
**Confidence:** HIGH

## Summary

Feature cards are a core landing page component for 2026, emphasizing clean card-based layouts with purposeful hover animations. The industry has shifted from purely decorative animations to functionally helpful micro-interactions that signal interactivity and provide feedback.

The project already has a strong foundation: Framer Motion 12.26.2 with established animation patterns (`fadeInUp`, `staggerContainer`, `whileHover` support), SectionWrapper for scroll-triggered animations, Lucide React 0.562.0 for icons with type-safe `LucideIcon` pattern, and complete i18n setup with next-intl 4.7.0 supporting RTL Hebrew.

For Phase 50, the key differentiator is hover/interaction animations (FEAT-05). Best practices for 2026 emphasize subtle scale (1.02-1.05x), shadow elevation changes, and GPU-accelerated transforms. Critical accessibility requirements: keyboard support for hover states (WCAG 2.1.1), reduced motion respect, and focus indicators. The existing FeatureCard.tsx provides a proven card structure with alternating layouts, but Phase 50 needs a simpler grid-based approach with consistent card size and hover states.

**Primary recommendation:** Create FeatureCard components in a 4-column responsive grid (4→2→1 columns). Use Framer Motion's `whileHover` and `whileTap` for scale + shadow animations, respecting reduced motion. Map icons dynamically via translation keys using a type-safe icon map object (`Record<string, LucideIcon>`). Reuse SectionWrapper and existing animation variants for scroll-triggered entry.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Framer Motion | 12.26.2 | Card hover animations | Industry standard for React gesture animations, whileHover/whileTap props, reduced motion support, GPU-accelerated |
| Lucide React | 0.562.0 | Feature card icons | Already in project, 1,500+ icons, type-safe with LucideIcon type, tree-shakeable, consistent 24x24 grid |
| Tailwind CSS | v4 | Card styling + hover utilities | Already in project, hover:scale-* and hover:shadow-* utilities, CSS transforms for GPU acceleration |
| next-intl | 4.7.0 | i18n for card content | Already configured, supports RTL Hebrew, type-safe translations, SSR-compatible |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Existing SectionWrapper | - | Scroll-triggered animations | Use for FeatureCards section wrapper, provides useInView hook integration |
| Existing animations.ts | - | Reusable animation variants | Use fadeInUp for card entry, staggerContainer for grid container |
| Existing ValuePropCard | - | Card structure reference | Similar pattern but simpler (no alternating layouts, consistent grid) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Framer Motion whileHover | Pure CSS :hover transitions | CSS simpler but no gesture support (whileTap), no animation orchestration, harder to respect reduced motion programmatically |
| Lucide icon map | DynamicIcon component | DynamicIcon imports all icons at build time (larger bundle), only use if icon names come from CMS/database |
| CSS Grid auto-fit | Fixed grid-cols-4 with breakpoints | Auto-fit is responsive without media queries but harder to control exact breakpoints for design system consistency |

**Installation:**
```bash
# No new packages needed - all dependencies already installed
# framer-motion: 12.26.2
# lucide-react: 0.562.0
# next-intl: 4.7.0
# tailwindcss: v4
```

## Architecture Patterns

### Recommended Project Structure
```
src/components/landing/
├── FeatureCards/
│   ├── FeatureCardsSection.tsx  # Main section with grid
│   ├── FeatureCard.tsx           # Individual card with hover
│   ├── iconMap.ts                # Type-safe icon mapping
│   └── index.ts                  # Exports
└── shared/
    ├── SectionWrapper.tsx        # Already exists - reuse
    ├── SectionHeader.tsx         # Already exists - reuse
    └── animations.ts             # Already exists - reuse
```

### Pattern 1: Feature Card Grid with Hover Animations
**What:** Grid of 4 cards with scroll-triggered entry, hover scale + shadow
**When to use:** FEAT-01 through FEAT-05 requirements
**Example:**
```typescript
// Source: Project patterns + Motion docs + WebSearch findings
// File: src/components/landing/FeatureCards/FeatureCardsSection.tsx

"use client";

import { SectionWrapper, SectionHeader } from "../shared";
import { FeatureCard } from "./FeatureCard";
import { useTranslations } from "next-intl";
import { iconMap } from "./iconMap";

export function FeatureCardsSection() {
  const t = useTranslations("landing.features");

  // Type-safe features from translations
  const features = t.raw("items") as Array<{
    key: string;
    icon: keyof typeof iconMap;
    title: string;
    description: string;
  }>;

  return (
    <SectionWrapper
      id="features"
      background="transparent"
      animate={true}
      ariaLabel={t("heading")}
    >
      <SectionHeader
        title={t("heading")}
        subtitle={t("subheading")}
        centered={true}
      />

      {/* Responsive grid: 4→2→1 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {features.map((feature) => (
          <FeatureCard
            key={feature.key}
            icon={iconMap[feature.icon]}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </SectionWrapper>
  );
}
```

### Pattern 2: Interactive Card with whileHover and whileTap
**What:** Card component with hover scale, shadow elevation, and tap feedback
**When to use:** FEAT-05 - Card hover/interaction animations
**Example:**
```typescript
// Source: Framer Motion gestures docs + WebSearch best practices
// File: src/components/landing/FeatureCards/FeatureCard.tsx

"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { fadeInUp } from "../shared/animations";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={fadeInUp}
      whileHover={
        shouldReduceMotion
          ? undefined
          : {
              scale: 1.03,
              y: -4,
              transition: { duration: 0.2, ease: "easeOut" },
            }
      }
      whileTap={
        shouldReduceMotion
          ? undefined
          : { scale: 0.98, transition: { duration: 0.1 } }
      }
      className={cn(
        // Layout
        "flex flex-col items-center text-center",
        "p-6 rounded-xl",
        // Background & border
        "bg-card/50 backdrop-blur-sm",
        "border border-border/50",
        // Base shadow - will enhance on hover
        "shadow-sm",
        // Hover state (CSS fallback for devices without JS)
        "hover:shadow-lg hover:border-landing-primary/30",
        // Transitions for non-animated properties
        "transition-colors duration-300",
        // Keyboard accessibility
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-landing-primary",
        // Make entire card clickable/tappable if needed
        "cursor-pointer"
      )}
      // Keyboard accessibility - treat as interactive element
      tabIndex={0}
      role="article"
      aria-labelledby={`feature-${title.replace(/\s/g, "-")}`}
    >
      {/* Icon container with background */}
      <div
        className={cn(
          "w-16 h-16 mb-4",
          "rounded-xl",
          "bg-landing-primary/10",
          "flex items-center justify-center"
        )}
      >
        <Icon
          className="w-8 h-8 text-landing-primary"
          aria-hidden="true"
          strokeWidth={2}
        />
      </div>

      {/* Title */}
      <h3
        id={`feature-${title.replace(/\s/g, "-")}`}
        className="text-xl font-semibold mb-3 text-landing-text"
      >
        {title}
      </h3>

      {/* Description */}
      <p className="text-muted-foreground leading-relaxed text-sm">
        {description}
      </p>
    </motion.div>
  );
}
```

### Pattern 3: Type-Safe Icon Mapping
**What:** Map icon keys from translations to Lucide icon components
**When to use:** ICON-MAPPING requirement - dynamic icon selection
**Example:**
```typescript
// Source: Project existing pattern + Lucide React best practices
// File: src/components/landing/FeatureCards/iconMap.ts

import {
  Search,
  GitBranch,
  MessageSquare,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

/**
 * Type-safe icon mapping for feature cards
 * Keys match icon field in translation files
 */
export const iconMap: Record<string, LucideIcon> = {
  // FEAT-01: Property Discovery
  search: Search,

  // FEAT-02: Deal Flow
  dealFlow: GitBranch,

  // FEAT-03: Communication
  communication: MessageSquare,

  // FEAT-04: AI Assistant
  aiAssistant: Sparkles,
} as const;

// Type helper for translation validation
export type IconKey = keyof typeof iconMap;
```

### Pattern 4: Translation Structure for Feature Cards
**What:** next-intl translation structure with icon mapping
**When to use:** i18n setup for en/he locales
**Example:**
```json
// File: messages/en.json
{
  "landing": {
    "features": {
      "heading": "Platform Capabilities",
      "subheading": "Everything you need to invest with confidence",
      "items": [
        {
          "key": "property-discovery",
          "icon": "search",
          "title": "Property Discovery",
          "description": "Smart search with AI-powered recommendations to find your perfect Israeli property investment."
        },
        {
          "key": "deal-flow",
          "icon": "dealFlow",
          "title": "7-Stage Deal Flow",
          "description": "Track every step from discovery to closing. Connect with vetted service providers."
        },
        {
          "key": "communication",
          "icon": "communication",
          "title": "Real-Time Communication",
          "description": "Built-in chat and notifications keep you connected with partners and providers."
        },
        {
          "key": "ai-assistant",
          "icon": "aiAssistant",
          "title": "AI Assistant",
          "description": "Personalized recommendations based on your investment goals and preferences."
        }
      ]
    }
  }
}
```

### Pattern 5: Reduced Motion Respect
**What:** Disable animations for users with vestibular disorders
**When to use:** All animations - WCAG 2.3.3 requirement
**Example:**
```typescript
// Source: Framer Motion accessibility docs + existing project pattern

import { useReducedMotion } from "framer-motion";

function MyCard() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      // Conditional gesture animations
      whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}

      // Entry animation still works - variant system respects reduced motion
      variants={fadeInUp}
    >
      {/* Card content */}
    </motion.div>
  );
}

// CSS fallback for users without JavaScript
// Add to globals.css:
@media (prefers-reduced-motion: reduce) {
  .feature-card {
    transition: none !important;
    animation: none !important;
  }
}
```

### Anti-Patterns to Avoid

- **Hover-only interactivity:** Don't make cards interactive only on hover. Keyboard users must be able to focus and activate cards. Use `tabIndex={0}` and `role="article"` or make cards actual links/buttons if they navigate.

- **Missing whileTap feedback:** Don't use `whileHover` without `whileTap`. Touch device users expect tap feedback. Scale down slightly (0.97-0.98) on tap for tactile response.

- **Excessive scale:** Don't scale cards beyond 1.05x. Larger scales cause layout shift and feel jarring. Industry standard for 2026 is 1.02-1.04x for subtle lift effect.

- **Ignoring reduced motion:** Don't forget to conditionally disable `whileHover`/`whileTap` for `useReducedMotion()`. Some users experience nausea from motion. This is a WCAG requirement.

- **Will-change overuse:** Don't add `will-change: transform` to all cards by default. Only use when animating to avoid memory overhead on mobile. Browser optimizes transforms automatically.

- **Inconsistent icon sizing:** Don't use different icon sizes across cards. All icons should be same dimensions (w-8 h-8) with same strokeWidth (1.5-2) for visual consistency.

- **Dynamic icon component:** Don't use Lucide's DynamicIcon component unless icons truly come from a CMS/database. It imports all icons at build time, bloating bundle. Use static icon map instead.

- **Deep translation nesting:** Don't nest translations too deeply. `landing.features.items.0.title` is harder to type-check than extracting to a typed array. Use `t.raw("items")` with type assertion.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Hover + tap gestures | Custom onMouseEnter/onTouchStart handlers | Framer Motion whileHover + whileTap | Handles edge cases (hover on touch devices, pointer events, accessibility), unified API, respects reduced motion automatically |
| Reduced motion detection | Navigator API matchMedia | Framer Motion useReducedMotion() | Handles SSR correctly, updates on preference change, consistent with existing animation system |
| Icon dynamic loading | Custom icon loader or switch statement | Type-safe icon map object | Tree-shakeable, type-safe with TypeScript, simple to maintain, no runtime overhead |
| Card grid responsiveness | Manual media query breakpoints | Tailwind grid utilities (grid-cols-1 sm:grid-cols-2 lg:grid-cols-4) | Consistent with design system, mobile-first, readable class names |
| Scroll-triggered animations | Custom Intersection Observer | Existing SectionWrapper with useInView | Already implemented and tested, handles reduced motion, consistent animation timing |
| GPU acceleration | Manual transform: translateZ(0) hacks | Framer Motion transforms automatically | Motion library optimizes transforms for GPU, no need for manual intervention |

**Key insight:** The project has mature patterns for cards, animations, icons, and i18n. Don't create parallel implementations—reuse existing architecture. The main difference from Phase 49's ValuePropCard is adding gesture animations (whileHover/whileTap) and ensuring keyboard accessibility for interactive cards.

## Common Pitfalls

### Pitfall 1: Hover-Only Interactions Fail Accessibility
**What goes wrong:** Cards respond to hover but not keyboard focus, failing WCAG 2.1.1 (Keyboard) and making features unusable for keyboard-only users.
**Why it happens:** Developers test with mouse only. `whileHover` in Framer Motion doesn't automatically add keyboard support—you must add `tabIndex` and proper ARIA roles.
**How to avoid:**
- Add `tabIndex={0}` to make cards focusable via keyboard
- Use semantic HTML (`<article>`, `<button>`) or ARIA roles
- Add `focus-visible:ring-2` for visible focus indicator
- Test navigation with Tab key, ensure hover effects apply on focus
- Consider adding `onKeyDown` handler for Enter/Space if cards are clickable
**Warning signs:**
- Can't Tab to cards with keyboard
- No visible focus indicator when navigating with keyboard
- Screen reader doesn't announce card as interactive element
**WCAG reference:** 2.1.1 Keyboard (Level A), 2.4.7 Focus Visible (Level AA)

### Pitfall 2: Layout Shift from Scale Animations
**What goes wrong:** Cards push adjacent cards aside when scaling on hover, causing jarring layout shifts as the grid reflows.
**Why it happens:** CSS `transform: scale()` doesn't create stacking context by default with static positioning. Scaled card affects sibling positions in grid.
**How to avoid:**
- Don't scale beyond 1.05x (industry standard is 1.02-1.04x)
- Ensure cards have sufficient gap (gap-6 or gap-8) to absorb minor expansion
- Use `isolation: isolate` on grid container if needed (rare)
- Combine scale with `y: -4` to lift card rather than expand in place
- Test hover states at narrow viewport widths where gap is smallest
**Warning signs:**
- Hovering one card causes neighbors to shift position
- Grid columns change width on hover
- Horizontal scrollbar appears on hover
**Solution:** Small scale (≤1.03x) + y-translation creates lift effect without layout shift

### Pitfall 3: Touch Device Hover State Stuck
**What goes wrong:** On touch devices, tapping a card triggers hover state which stays stuck until user taps elsewhere, creating confusing UI.
**Why it happens:** Touch browsers emulate hover on tap. Without proper touch event handling, hover state persists after touch ends.
**How to avoid:**
- Use Framer Motion `whileTap` alongside `whileHover` - Motion handles touch properly
- Framer Motion automatically clears hover state on touch end
- For CSS-only fallbacks, use `@media (hover: none)` to disable hover effects on touch devices
- Test on actual touch devices, not just browser DevTools emulation (emulation doesn't capture full touch behavior)
**Warning signs:**
- Card stays scaled after tapping on phone/tablet
- Need to tap another card to clear hover state
- Double-tap required to actually trigger card action
**Code example:**
```css
/* Disable hover on touch devices */
@media (hover: none) {
  .feature-card:hover {
    transform: none;
    box-shadow: inherit;
  }
}
```

### Pitfall 4: Icon Type Safety with Translation Keys
**What goes wrong:** Translation file has `"icon": "wrongName"` but TypeScript doesn't catch the error until runtime, causing missing icons or crashes.
**Why it happens:** `t.raw("items")` returns `any` by default. Type assertion `as Array<{...}>` doesn't validate icon keys against iconMap at compile time.
**How to avoid:**
- Define `IconKey` type from iconMap: `type IconKey = keyof typeof iconMap`
- Use type assertion with IconKey: `icon: IconKey` in feature item type
- Add runtime fallback icon in FeatureCard component for unknown keys
- Consider zod schema for translation validation if critical
- Document icon key names in translation file comments
**Warning signs:**
- TypeScript allows any string in icon field
- Missing icons appear as blank spaces in production
- Console errors: "Cannot find icon X"
**Example with fallback:**
```typescript
import { HelpCircle } from "lucide-react"; // Fallback icon

const IconComponent = iconMap[feature.icon] || HelpCircle;
```

### Pitfall 5: Animation Performance on Lower-End Mobile
**What goes wrong:** Cards animate smoothly on desktop but stutter or lag on lower-end Android devices, especially with 4 cards animating simultaneously on scroll.
**Why it happens:** Mobile GPUs have less power. Animating multiple cards with shadows + transforms simultaneously can overwhelm rendering pipeline.
**How to avoid:**
- Stick to GPU-accelerated properties: `opacity`, `transform` (translate, scale, rotate)
- Don't animate `box-shadow` directly - use pseudo-element with opacity change instead
- Reduce stagger delay in grid: `staggerChildren: 0.05` instead of 0.1 for faster completion
- Consider reducing or disabling animations on low-end devices (navigator.hardwareConcurrency check)
- Test on actual mid-range Android device (Pixel 4a, Galaxy A53), not just iPhone
**Warning signs:**
- Frame rate drops below 30fps on mobile (check Chrome DevTools Performance)
- Scroll feels janky when cards enter viewport
- Touch interactions feel delayed or unresponsive
**Performance tip:** Framer Motion automatically uses GPU acceleration for transforms, but shadows are expensive. Use static shadow classes with CSS transitions instead of animating shadow in Motion.

### Pitfall 6: RTL Layout Breaking with Icon + Text
**What goes wrong:** Feature cards look perfect in English (LTR) but icons appear on wrong side, text alignment breaks in Hebrew (RTL), or animations slide in from wrong direction.
**Why it happens:** Hard-coded directional CSS (`text-align: left`, `margin-left`) doesn't flip with `dir="rtl"`. Transform animations with x-axis movement go wrong direction.
**How to avoid:**
- Use Tailwind logical properties: `text-start` not `text-left`, `ms-4` not `ml-4`
- Test early with Hebrew locale: switch to `he` and verify visual hierarchy flows right-to-left
- For centered layouts (feature cards), RTL is less problematic, but test anyway
- Animation directions: `fadeInLeft` becomes "fade in from left side of viewport" - okay for centered content, but verify it feels natural in RTL
- If needed, flip animation direction: `x: locale === 'he' ? 40 : -40`
**Warning signs:**
- Layout looks identical in en and he locales (no RTL flipping occurred)
- Text stays left-aligned in Hebrew
- Reading order feels unnatural in RTL
**Testing command:** Switch to `he` locale in Next.js and verify card layout

### Pitfall 7: Missing Focus Indicator on Cards
**What goes wrong:** Keyboard users Tab to cards but can't see which card has focus, failing WCAG 2.4.7 (Focus Visible).
**Why it happens:** Default browser focus outline removed with `outline: none`, and custom focus styles forgotten.
**How to avoid:**
- Use Tailwind `focus-visible:ring-2 focus-visible:ring-landing-primary` for custom focus indicator
- Don't remove focus outline without replacement
- Ensure focus indicator has 3:1 contrast ratio with background (WCAG 2.4.11)
- Test with keyboard navigation: Tab through cards, verify visible indicator
**Warning signs:**
- Can't see which card is focused when Tabbing
- Focus indicator same color as background
- Focus only visible on some browsers (inconsistent outline)
**WCAG reference:** 2.4.7 Focus Visible (Level AA), 2.4.11 Focus Appearance (Level AAA)

## Code Examples

Verified patterns from official sources:

### Framer Motion whileHover with Reduced Motion
```typescript
// Source: Framer Motion gestures documentation
// https://www.framer.com/motion/gestures/

import { motion, useReducedMotion } from "framer-motion";

function Card() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={
        shouldReduceMotion
          ? undefined
          : {
              scale: 1.03,
              y: -4,
              transition: { duration: 0.2, ease: "easeOut" }
            }
      }
      whileTap={
        shouldReduceMotion ? undefined : { scale: 0.98 }
      }
      className="p-6 bg-card rounded-xl shadow-sm hover:shadow-lg transition-shadow"
    >
      {/* Card content */}
    </motion.div>
  );
}
```

### Type-Safe Icon Map Pattern
```typescript
// Source: Project existing pattern + Lucide React TypeScript best practices

import type { LucideIcon } from "lucide-react";
import { Search, GitBranch, MessageSquare, Sparkles } from "lucide-react";

// Icon map with explicit type
export const iconMap: Record<string, LucideIcon> = {
  search: Search,
  dealFlow: GitBranch,
  communication: MessageSquare,
  aiAssistant: Sparkles,
} as const;

// Usage in component
interface FeatureCardProps {
  icon: LucideIcon; // Type, not string
  title: string;
  description: string;
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div>
      <Icon className="w-8 h-8" /> {/* Render icon component */}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

// In parent component
const features = t.raw("items") as Array<{
  icon: keyof typeof iconMap; // Constrain to valid keys
  title: string;
  description: string;
}>;

return features.map((f) => (
  <FeatureCard icon={iconMap[f.icon]} {...f} />
));
```

### Responsive Grid Layout with Tailwind
```typescript
// Source: WebSearch responsive grid patterns + Tailwind docs

function FeatureCardsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
      {/*
        Mobile: 1 column (stacked)
        Tablet (sm): 2 columns
        Desktop (lg): 4 columns
        Gap increases on larger screens for breathing room
      */}
      {cards.map((card) => (
        <FeatureCard key={card.key} {...card} />
      ))}
    </div>
  );
}
```

### Keyboard Accessibility for Interactive Cards
```typescript
// Source: WCAG 2.1.1 guidance + Framer Motion accessibility
// https://motion.dev/docs/react-accessibility

function InteractiveCard({ title, onClick }: { title: string; onClick: () => void }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      onKeyDown={(e) => {
        // Activate on Enter or Space
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={title}
      className={cn(
        "p-6 rounded-xl cursor-pointer",
        // Visible focus indicator for keyboard users
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-landing-primary",
        // Hover styles as CSS fallback
        "hover:shadow-lg transition-shadow"
      )}
    >
      {/* Card content */}
    </motion.div>
  );
}

// Note: Framer Motion's whileTap supports Enter key automatically
// when element is focusable, but explicit onKeyDown is clearer
```

### GPU-Accelerated Hover Effects with Tailwind
```css
/* Source: WebSearch CSS performance patterns + Tailwind utilities */

/* Good: GPU-accelerated transforms + shadow transition */
.feature-card {
  @apply transition-shadow duration-300;
  /* Scale handled by Framer Motion whileHover */
}

.feature-card:hover {
  @apply shadow-lg;
}

/* Tailwind class version: */
.feature-card {
  @apply hover:shadow-lg transition-shadow duration-300;
}

/* Don't: Animating shadow with transform causes repaint */
.bad-card:hover {
  box-shadow: 0 20px 25px rgba(0,0,0,0.15);
  transform: scale(1.05);
  /* Both properties animating simultaneously - less performant */
}
```

### Touch Device Hover Handling
```css
/* Source: WebSearch mobile hover patterns */

/* Disable hover effects on touch-only devices */
@media (hover: none) {
  .feature-card:hover {
    transform: none;
    box-shadow: inherit;
  }
}

/* Enable hover only on devices that support it */
@media (hover: hover) {
  .feature-card:hover {
    transform: scale(1.03) translateY(-4px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  }
}
```

### Complete Feature Card Component
```typescript
// Source: Integration of all patterns above

"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { fadeInUp } from "../shared/animations";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const cardId = `feature-${title.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <motion.article
      // Scroll-triggered entry animation
      variants={fadeInUp}

      // Hover animation (respects reduced motion)
      whileHover={
        shouldReduceMotion
          ? undefined
          : {
              scale: 1.03,
              y: -4,
              transition: { duration: 0.2, ease: "easeOut" },
            }
      }

      // Tap feedback for touch devices
      whileTap={
        shouldReduceMotion
          ? undefined
          : { scale: 0.98, transition: { duration: 0.1 } }
      }

      className={cn(
        // Layout
        "flex flex-col items-center text-center",
        "p-6 rounded-xl",

        // Background & border
        "bg-card/50 backdrop-blur-sm",
        "border border-border/50",

        // Shadow (CSS transition, not animated in Motion)
        "shadow-sm hover:shadow-lg",
        "transition-shadow duration-300",

        // Hover border color change
        "hover:border-landing-primary/30 transition-colors duration-300",

        // Keyboard focus
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-landing-primary",

        // Interactive cursor
        "cursor-pointer"
      )}

      // Accessibility
      tabIndex={0}
      role="article"
      aria-labelledby={`${cardId}-title`}
    >
      {/* Icon */}
      <div
        className={cn(
          "w-16 h-16 mb-4",
          "rounded-xl",
          "bg-landing-primary/10",
          "flex items-center justify-center"
        )}
      >
        <Icon
          className="w-8 h-8 text-landing-primary"
          aria-hidden="true"
          strokeWidth={2}
        />
      </div>

      {/* Title */}
      <h3
        id={`${cardId}-title`}
        className="text-xl font-semibold mb-3 text-landing-text"
      >
        {title}
      </h3>

      {/* Description */}
      <p className="text-muted-foreground leading-relaxed text-sm">
        {description}
      </p>
    </motion.article>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pure CSS :hover transitions | Framer Motion whileHover/whileTap | 2024-2025 | Unified gesture system, touch support, reduced motion handling, animation orchestration |
| Custom Intersection Observer | Framer Motion useInView hook | FM 10+ (2023) | Declarative API, integrated with animation system, better edge case handling |
| Decorative animations | Functional animations | 2025-2026 design trend | Animations signal interactivity, provide feedback, assist users rather than just visual interest |
| Icon fonts (FontAwesome) | SVG icon libraries (Lucide) | 2024-2025 | Tree-shakeable, no FOIT/FOUT, accessible, type-safe with TypeScript |
| Barrel icon imports | Individual icon imports | 2025-2026 | Smaller bundle sizes, better tree-shaking, explicit dependencies |
| Grid with fixed columns | CSS Grid with responsive utilities | Ongoing | Mobile-first design, simpler code with Tailwind, no manual media queries |
| DynamicIcon for all cases | Static icon map for most cases | Lucide 0.400+ | Smaller bundles (only imports used icons), better performance, type-safe |

**Deprecated/outdated:**
- **Manual transform: translateZ(0) for GPU acceleration:** Modern browsers optimize transforms automatically. Framer Motion handles this. Manual GPU hacks unnecessary and can cause memory issues.
- **Separate reduced-motion detection with matchMedia:** Framer Motion's `useReducedMotion()` hook is SSR-safe, updates on preference change, consistent with animation system. Don't build custom solutions.
- **Global hover states without touch consideration:** Must use `@media (hover: hover)` or JavaScript gesture detection to avoid stuck hover states on touch devices. Pure `:hover` CSS is insufficient for 2026 standards.
- **Hover-only interactions without keyboard support:** WCAG 2.1.1 requires keyboard access. `whileHover` alone doesn't provide keyboard support—must add `tabIndex`, focus indicators, and keyboard event handlers.

## Open Questions

Things that couldn't be fully resolved:

1. **Icon selection for specific features**
   - What we know: Lucide has 1,500+ icons, requirements specify 4 cards (Property Discovery, Deal Flow, Communication, AI Assistant)
   - What's unclear: Exact icon choices need design review. Semantic meaning must be clear without text.
   - Recommendation: Suggested icons in iconMap.ts example (Search, GitBranch, MessageSquare, Sparkles) based on semantic meaning. Replace with design-approved icons. Document choices in code comments for consistency. Test icon recognition: can users guess feature from icon alone?

2. **Card click behavior**
   - What we know: Cards have hover/interaction animations (FEAT-05), suggesting they're interactive
   - What's unclear: Do cards navigate somewhere, open modals, or just have hover states for visual interest?
   - Recommendation: If cards navigate, make them proper `<Link>` components or `<button>` elements, not just divs with hover states. If purely informational, use `role="article"` and don't suggest click behavior. Current implementation assumes informational cards with hover feedback for aesthetic purposes.

3. **Animation timing coordination with Phase 49**
   - What we know: Phase 49 (Trust & Value Props) uses same SectionWrapper with staggerContainer. Both sections may be close together on page.
   - What's unclear: If sections are within one viewport, will sequential stagger animations feel too slow?
   - Recommendation: Use standard `staggerContainer` for consistency. If sections are close (within ~800px), consider reducing `delayChildren` to 0.1s for FeatureCards to avoid cumulative delay feeling sluggish. Test full page flow before making changes.

4. **Mobile card count**
   - What we know: 4 cards in a row looks great on desktop, 2 on tablet, 1 on mobile
   - What's unclear: On large tablets (iPad Pro), does 2 cards per row look sparse? Should there be a 3-column breakpoint?
   - Recommendation: Start with 4→2→1 column breakpoints as standard. If 2 columns looks sparse on large tablets, add intermediate breakpoint: `md:grid-cols-3 lg:grid-cols-4`. Test on actual devices (iPad Pro, Galaxy Tab) before adding complexity.

5. **Shadow animation performance**
   - What we know: Box-shadow animations can cause repaint, especially on mobile. Transition-shadow with CSS is more performant than animating shadow in Motion.
   - What's unclear: Is current approach (CSS transition-shadow + Motion whileHover for scale) performant enough, or should shadow be removed on low-end devices?
   - Recommendation: Keep CSS transition-shadow as implemented. It's GPU-friendly. Test on mid-range Android device (Pixel 4a, Galaxy A53). If performance issues arise, consider removing shadow on mobile: `sm:hover:shadow-lg` (only apply on larger screens).

## Sources

### Primary (HIGH confidence)
- [Framer Motion Gestures Documentation](https://www.framer.com/motion/gestures/) - Official whileHover/whileTap API
- [Framer Motion Accessibility Guide](https://motion.dev/docs/react-accessibility) - Official accessibility best practices
- [Lucide React Documentation](https://lucide.dev/guide/packages/lucide-react) - Official icon library docs with TypeScript types
- [WCAG 2.1.1: Keyboard Accessibility](https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html) - W3C keyboard access requirements
- [WCAG 1.4.13: Content on Hover or Focus](https://www.w3.org/WAI/WCAG21/Understanding/content-on-hover-or-focus.html) - W3C hover/focus requirements
- Existing project code:
  - `/src/components/landing/shared/SectionWrapper.tsx` - Scroll animation pattern
  - `/src/components/landing/shared/animations.ts` - Animation variants (fadeInUp, staggerContainer)
  - `/src/components/landing/Features/FeatureCard.tsx` - Card structure reference (alternating layout)
  - `/src/components/landing/ValueProps/ValuePropCard.tsx` - Simpler card pattern (grid-based)
  - `/src/app/globals.css` - Geometric clip utilities, landing colors
  - `/package.json` - Confirmed library versions

### Secondary (MEDIUM confidence)
- [Creating React animations in Motion - LogRocket Blog](https://blog.logrocket.com/creating-react-animations-with-motion/) - Verified implementation patterns
- [Top Landing Page Design Trends for B2B SaaS in 2026 - SaaS Hero](https://www.saashero.net/content/top-landing-page-design-trends/) - 2026 design trends
- [12 UI/UX Design Trends That Will Dominate 2026 - Index](https://www.index.dev/blog/ui-ux-design-trends) - Motion design trends
- [Card Hover Effects in Tailwind CSS - Tailwind Tap](https://www.tailwindtap.com/blog/card-hover-effects-in-tailwind-css) - Tailwind hover patterns
- [CSS will-change Property - DigitalOcean](https://www.digitalocean.com/community/tutorials/css-will-change) - Performance optimization guidance
- [Hover Actions and Accessibility - Bureau of Internet Accessibility](https://www.boia.org/blog/hover-actions-and-accessibility-addressing-a-common-wcag-violation) - WCAG hover violations
- [Responsive Card Grid Layout - DEV Community](https://dev.to/m97chahboun/responsive-card-layout-with-css-grid-a-step-by-step-guide-3ej1) - Grid layout patterns
- [How to Design Card UI - UXPin](https://www.uxpin.com/studio/blog/card-design-ui/) - Card design best practices
- [Best React Icon Libraries for 2026 - Mighil](https://mighil.com/best-react-icon-libraries) - Icon library comparison

### Tertiary (LOW confidence)
- Various WebSearch results on feature card patterns - Directional guidance, not technical implementation
- General animation trend articles - Industry trends but not specific technical requirements
- CSS Grid tutorials - Common knowledge patterns, not authoritative for this specific project

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in project with confirmed versions, official docs verified, existing patterns proven
- Architecture: HIGH - Existing SectionWrapper, animations.ts, card patterns provide clear structure, only adding gesture animations
- Pitfalls: HIGH - Based on WCAG requirements (authoritative), official Framer Motion docs, WebSearch verified with official sources, common mobile performance issues well-documented
- Code examples: HIGH - Mix of official docs (Framer Motion, WCAG), existing project code, verified WebSearch patterns

**Research limitations:**
- Context7 MCP tool not available, relied on official documentation via direct links
- Specific icon choices for the 4 features are recommendations based on semantic meaning, not design-approved
- Performance testing on actual mid-range Android devices not conducted (recommendations based on known patterns)
- RTL Hebrew layout assumptions based on next-intl docs and Tailwind RTL features, not tested in this specific project

**Research date:** 2026-01-26
**Valid until:** ~30 days (2026-02-26) - Tech stack is stable (Framer Motion 12, Tailwind v4, Next.js 16), patterns are mature. Re-validate if major version updates occur (Next.js 17, Framer Motion 13) or if WCAG 2.2/3.0 introduces new requirements.
