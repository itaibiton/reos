# Phase 53: Hero & Navigation Mobile - Research

**Researched:** 2026-01-27
**Domain:** Mobile-first responsive design, React/Next.js mobile UI patterns
**Confidence:** HIGH

## Summary

This phase focuses on implementing mobile responsiveness for the Hero and Navigation components, targeting devices from 320px to 768px. The research covers Tailwind CSS v4 mobile-first patterns, Framer Motion mobile animation optimization, hamburger menu implementations, and touch-friendly UI standards.

The existing components are desktop-optimized with complex animations and layouts. The standard approach is to use Tailwind's mobile-first breakpoint system (unprefixed utilities for mobile, prefixed for larger screens), leverage existing shadcn/ui Sheet or Drawer components for mobile menus, optimize Framer Motion animations for mobile performance, and ensure all interactive elements meet the 44x44px touch target standard.

Key findings include: Tailwind CSS v4 uses mobile-first breakpoints where base styles apply to all screens and sm:/md:/lg: prefixes layer changes at 640px+/768px+/1024px+; Framer Motion performs best on mobile when animating transform properties (x, y, scale, rotate) and opacity rather than layout-affecting properties; shadcn/ui provides both Sheet and Drawer components for mobile menus with the recommendation to use Sheet for side panels or Drawer for mobile-optimized bottom/side drawers; and WCAG 2.5.5 (Level AAA) requires 44x44px touch targets with research showing 3x higher error rates for smaller targets.

**Primary recommendation:** Use Tailwind's mobile-first approach with unprefixed utilities for base mobile styles, leverage existing Sheet/Drawer components for hamburger menu, optimize Framer Motion by animating only transform/opacity properties, and ensure all touch targets are 44px minimum.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Tailwind CSS | v4 | Mobile-first responsive design | Industry standard utility-first CSS framework with built-in mobile-first breakpoints |
| Framer Motion | 12.26.2 | Mobile animations | Already in use, GPU-accelerated animations, optimized for React |
| shadcn/ui Sheet | via @radix-ui/react-dialog 1.1.15 | Mobile slide-in menu | Already installed, accessible, built on Radix UI primitives |
| shadcn/ui Drawer | via vaul 1.1.2 | Mobile bottom drawer | Already installed, mobile-optimized with gesture support |
| shadcn/ui Accordion | via @radix-ui/react-accordion 1.2.12 | Nested mobile menus | Already installed, accessible, keyboard navigable |
| next-intl | 4.7.0 | Internationalized content | Already in use for translations |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Radix UI Navigation Menu | 1.2.14 | Desktop dropdown menus | Already installed, used in current Navigation.tsx |
| Lucide React | 0.562.0 | Icons (Menu, X, etc.) | Already in use, consistent icon system |
| next-themes | 0.4.6 | Theme support | Already installed, dark mode compatibility |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Sheet | Drawer | Sheet better for side menus, Drawer better for bottom drawers on mobile |
| Custom hamburger | react-burger-menu | Custom solution better when using existing shadcn/ui components |
| Fixed breakpoints | Container queries | Container queries for component-level, media queries for page layout (both can be used) |

**Installation:**
```bash
# All dependencies already installed
# If Sheet not yet added to project:
pnpm dlx shadcn@latest add sheet

# If Drawer not yet added:
pnpm dlx shadcn@latest add drawer

# If Accordion not yet added:
pnpm dlx shadcn@latest add accordion
```

## Architecture Patterns

### Recommended Mobile-First Component Structure
```
src/components/newlanding/
├── Hero.tsx                 # Responsive hero with mobile layouts
├── Navigation.tsx           # Navigation with mobile menu
└── MobileMenu.tsx          # Optional: Extracted mobile menu component
```

### Pattern 1: Mobile-First Tailwind Breakpoints
**What:** Tailwind CSS uses a mobile-first approach where unprefixed utilities apply to all screen sizes, and prefixed utilities (sm:, md:, lg:) apply at that breakpoint and above.

**When to use:** Always for responsive design in this project

**Example:**
```typescript
// Source: https://tailwindcss.com/docs/responsive-design
// CORRECT: Mobile-first approach
<div className="text-center sm:text-left">
  {/* Centered on mobile, left-aligned on 640px+ */}
</div>

<h1 className="text-3xl md:text-5xl lg:text-7xl">
  {/* 3xl on mobile, 5xl on tablet (768px+), 7xl on desktop (1024px+) */}
</h1>

// INCORRECT: Don't use sm: to target mobile
<div className="sm:text-center">
  {/* This only centers on 640px+, not mobile */}
</div>
```

### Pattern 2: Performance-Optimized Framer Motion Animations
**What:** Animate only GPU-accelerated properties (x, y, scale, rotate, opacity) to avoid layout recalculations on mobile.

**When to use:** All mobile animations, especially scroll-based and interactive

**Example:**
```typescript
// Source: Multiple sources on Framer Motion mobile optimization
// GOOD: GPU-accelerated properties
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  style={{ scale: scrollProgress }}
/>

// BAD: Layout-triggering properties
<motion.div
  initial={{ opacity: 0, top: "20px" }}  // Avoid top/left
  animate={{ opacity: 1, top: "0px" }}
  style={{ height: scrollProgress }}     // Avoid width/height
/>
```

### Pattern 3: Sheet/Drawer for Mobile Menu
**What:** Use shadcn/ui Sheet component for slide-in mobile navigation from left/right, or Drawer for bottom-up mobile menus.

**When to use:** Hamburger menu implementation (< 768px)

**Example:**
```typescript
// Source: https://ui.shadcn.com/docs/components/sheet
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

<Sheet>
  <SheetTrigger asChild>
    <button className="md:hidden">
      <Menu className="h-6 w-6" />
    </button>
  </SheetTrigger>
  <SheetContent side="left" className="w-[300px]">
    {/* Mobile menu content */}
  </SheetContent>
</Sheet>
```

### Pattern 4: Accordion for Nested Mobile Menus
**What:** Convert desktop dropdown menus to accordion items in mobile menu for nested navigation (Platform, Solutions).

**When to use:** Multi-level navigation in mobile menu

**Example:**
```typescript
// Source: Mobile navigation patterns research
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

<Accordion type="single" collapsible>
  <AccordionItem value="platform">
    <AccordionTrigger>Platform</AccordionTrigger>
    <AccordionContent>
      <a href="#" className="block py-3 px-4">Property Management</a>
      <a href="#" className="block py-3 px-4">Automation Engine</a>
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

### Pattern 5: Responsive Grid Layouts
**What:** Use Tailwind grid with breakpoint prefixes to change grid columns at different screen sizes.

**When to use:** Stats grid, CTA buttons, any multi-column layout

**Example:**
```typescript
// Source: Tailwind CSS responsive design docs
// Stats: 1 column on mobile, 2x2 on sm (640px+), 4 columns on md (768px+)
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
  {stats.map(stat => <StatCard {...stat} />)}
</div>

// CTA buttons: Stack on mobile, horizontal on sm+
<div className="flex flex-col sm:flex-row gap-4">
  <button>Get Started</button>
  <button>Learn More</button>
</div>
```

### Pattern 6: Conditional Rendering vs Hidden Classes
**What:** Use CSS classes (hidden md:block) for simple show/hide, or conditional rendering for complex components.

**When to use:** Hiding desktop dropdowns on mobile, showing mobile menu only on small screens

**Example:**
```typescript
// Source: React patterns and Tailwind best practices
// CSS classes for simple elements
<div className="hidden md:flex">
  {/* Desktop navigation */}
</div>

<div className="md:hidden">
  {/* Mobile menu trigger */}
</div>

// Conditional rendering for heavy components
{isMobileMenuOpen && (
  <MobileMenu onClose={() => setIsMobileMenuOpen(false)} />
)}
```

### Pattern 7: Touch Target Sizing
**What:** Ensure all interactive elements are at least 44x44px for touch accessibility.

**When to use:** All buttons, links, and interactive elements on mobile

**Example:**
```typescript
// Source: WCAG 2.5.5 guidelines
// Minimum touch target sizing
<button className="min-h-[44px] min-w-[44px] flex items-center justify-center">
  <Menu className="h-6 w-6" />
</button>

// Menu items with adequate padding
<a href="#" className="block py-3 px-4 text-base">
  {/* py-3 (12px top + 12px bottom = 24px) + text height > 44px */}
  Menu Item
</a>
```

### Anti-Patterns to Avoid
- **Using vh units on mobile:** Mobile browsers' dynamic address bar causes layout shifts. Use min-h-screen or dvh units instead of 100vh.
- **Animating width/height/margin on mobile:** These trigger layout recalculations. Use transform properties (scale, x, y) instead.
- **Nested dropdowns on mobile:** Touch interaction with nested dropdowns is problematic. Use accordion or flatten hierarchy.
- **Touch targets below 44px:** Research shows 3x higher error rates. Always meet minimum size requirements.
- **Desktop-first CSS:** Writing base styles for desktop then overriding for mobile. Use mobile-first approach instead.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Mobile slide-in menu | Custom overlay + animation | shadcn/ui Sheet or Drawer | Focus trapping, accessibility (ARIA), keyboard navigation, portal rendering, gesture support already handled |
| Hamburger icon animation | Custom SVG animation | Lucide Menu/X icons with conditional render | Simpler, consistent, accessible, smaller bundle |
| Accordion for nested menus | Custom expand/collapse | shadcn/ui Accordion | ARIA attributes, keyboard navigation, animation, single/multiple expansion modes built-in |
| Touch target detection | Custom click handlers | Native button/link elements with proper sizing | Browser handles touch vs click, hover states, focus management |
| Viewport height on mobile | JavaScript to calculate | Tailwind min-h-screen or CSS dvh units | Handles browser UI automatically, no JavaScript needed |
| Responsive breakpoint detection | useMediaQuery hook | Tailwind breakpoint classes | CSS-based, no JavaScript, better performance, no hydration issues |

**Key insight:** Mobile UI patterns involve complex accessibility, gesture handling, and cross-browser compatibility issues. shadcn/ui components (built on Radix UI) handle these edge cases comprehensively, saving development time and ensuring WCAG compliance.

## Common Pitfalls

### Pitfall 1: Using sm: Prefix to Target Mobile
**What goes wrong:** Developers write `sm:text-center` thinking it targets mobile phones, but it actually applies at 640px+ and has no effect on smaller screens.

**Why it happens:** Misunderstanding Tailwind's mobile-first philosophy. "Small" sounds like mobile, but it means "at the small breakpoint and above."

**How to avoid:** Remember: unprefixed utilities are mobile styles. Use prefixes only to change styles at larger breakpoints. "Mobile first, layer changes."

**Warning signs:**
- Styles not appearing on mobile devices
- Using all prefixed utilities with no base styles
- Components looking broken below 640px

### Pitfall 2: Animating Layout Properties on Mobile
**What goes wrong:** Animations feel janky, battery drains quickly, frame rate drops below 60fps on older devices.

**Why it happens:** Properties like width, height, top, left, margin, padding trigger layout recalculations on every frame. Mobile GPUs can't optimize these.

**How to avoid:** Only animate transform properties (x, y, scale, rotate) and opacity. Use Framer Motion's style prop with useTransform for scroll-based animations.

**Warning signs:**
- Scroll animations stuttering on mobile
- High CPU usage during animations
- User complaints about battery drain

### Pitfall 3: vh Units Causing Layout Shift on Mobile
**What goes wrong:** Elements sized with `100vh` shift when user scrolls and browser address bar hides/shows. Page "jumps" during scroll.

**Why it happens:** Mobile browsers calculate vh based on maximum viewport (UI hidden), but initially render with UI visible. As user scrolls, viewport height changes.

**How to avoid:** Use Tailwind's `min-h-screen` (handles this automatically) or new CSS `dvh` units (dynamic viewport height). Avoid `h-screen` or `height: 100vh`.

**Warning signs:**
- Hero section too tall on initial load
- Content shifting when user scrolls down
- Fixed elements jumping during scroll

### Pitfall 4: Touch Targets Below 44px
**What goes wrong:** Users frequently mis-tap, triggering wrong actions or getting frustrated. Accessibility failures in testing.

**Why it happens:** Designers prioritize visual density over usability. Average finger pad is 11mm (~42px), varying by device position.

**How to avoid:** Enforce 44x44px minimum for all interactive elements. Use Tailwind classes like `min-h-[44px] min-w-[44px]` or adequate padding (`py-3` + text height).

**Warning signs:**
- User testing shows repeated tap attempts
- High error rates on mobile analytics
- Accessibility audit failures (WCAG 2.5.5)

### Pitfall 5: Forgetting to Close Mobile Menu
**What goes wrong:** Users open hamburger menu, click link, but menu stays open overlaying new content.

**Why it happens:** Forgot to add onClose handlers to menu links, or Sheet component not configured to close on navigation.

**How to avoid:** Add `onClick` handlers to all Sheet content links that close the menu. Use Sheet's `open` and `onOpenChange` props for controlled state.

**Warning signs:**
- Menu doesn't close after link click
- Back button shows menu when it should be closed
- Menu overlays content after navigation

### Pitfall 6: Not Testing on Real Devices
**What goes wrong:** Animations smooth in browser DevTools mobile emulation but janky on real phones. Touch targets work with mouse but fail with fingers.

**Why it happens:** Desktop CPU/GPU much faster than mobile. Mouse pointer more precise than finger. DevTools can't simulate touch physics.

**How to avoid:** Test on real devices (iPhone SE for small screen, mid-range Android for performance). Use Chrome remote debugging. Check on older devices (2-3 years old).

**Warning signs:**
- Works in DevTools but reports of mobile issues
- Animations smooth on desktop, janky on device
- Touch interactions feel wrong

## Code Examples

Verified patterns from official sources:

### Mobile-First Hero Text Sizing
```typescript
// Source: Tailwind CSS responsive design documentation
// Text scales from 3xl (mobile) → 5xl (768px+) → 7xl (1024px+)
<h1 className="text-3xl md:text-5xl lg:text-7xl font-light tracking-tighter">
  {t("heading")}{" "}
  <br className="hidden md:block" />
  <RotatingText texts={roles} />
</h1>

// Badge text smaller on mobile
<span className="text-xs md:text-sm font-light tracking-wide">
  {t("badge")}
</span>
```

### Responsive Stats Grid
```typescript
// Source: Tailwind CSS grid documentation
// 1 column on mobile (< 640px)
// 2x2 grid on sm (640px+)
// 4 columns on md (768px+)
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
  {stats.map((stat, index) => (
    <div key={index} className="text-center">
      <div className="text-2xl sm:text-3xl md:text-4xl font-light">
        {stat.value}
      </div>
      <div className="text-sm text-foreground/50">
        {stat.label}
      </div>
    </div>
  ))}
</div>
```

### CTA Buttons Stack on Mobile
```typescript
// Source: Tailwind CSS flexbox documentation
// flex-col on mobile (stacks vertically)
// flex-row on sm+ (horizontal)
<div className="flex flex-col sm:flex-row gap-4">
  <a
    href="/questionnaire"
    className="flex items-center justify-center gap-2 px-6 py-3 bg-foreground text-background rounded-full min-h-[44px]"
  >
    <span>{t("cta.primary")}</span>
    <ArrowRight className="w-4 h-4" />
  </a>
  <a
    href="/properties"
    className="flex items-center justify-center gap-2 px-6 py-3 border border-border bg-foreground/5 rounded-full min-h-[44px]"
  >
    <span>{t("cta.secondary")}</span>
  </a>
</div>
```

### Sheet Component Mobile Menu
```typescript
// Source: https://ui.shadcn.com/docs/components/sheet
"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] px-0">
        <div className="flex flex-col gap-4 py-4">
          {/* Accordion for nested menus */}
          <Accordion type="single" collapsible className="px-4">
            <AccordionItem value="platform">
              <AccordionTrigger className="text-base py-3">
                Platform
              </AccordionTrigger>
              <AccordionContent>
                <a
                  href="#"
                  className="block py-3 px-4 text-sm hover:bg-accent"
                  onClick={() => setOpen(false)}
                >
                  Property Management
                </a>
                <a
                  href="#"
                  className="block py-3 px-4 text-sm hover:bg-accent"
                  onClick={() => setOpen(false)}
                >
                  Automation Engine
                </a>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Simple links */}
          <a
            href="#"
            className="px-4 py-3 text-base hover:bg-accent"
            onClick={() => setOpen(false)}
          >
            Institutions
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

### Performance-Optimized Mobile Animations
```typescript
// Source: Framer Motion mobile optimization research
import { motion, useScroll, useTransform } from "framer-motion";

export function MobileOptimizedHero() {
  const { scrollYProgress } = useScroll();

  // GOOD: Animate opacity and y (transform) only
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.3], [0, -50]);

  return (
    <motion.div style={{ opacity, y }}>
      {/* Content */}
    </motion.div>
  );
}

// Mobile-specific animation configuration
const mobileAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: {
    type: "spring",
    damping: 30,
    stiffness: 400,
    // Shorter duration for mobile
    duration: 0.3
  }
};
```

### Touch-Friendly Navigation Items
```typescript
// Source: WCAG 2.5.5 accessibility guidelines
// Minimum 44x44px touch targets with visual feedback
<nav className="flex flex-col gap-1">
  <a
    href="#"
    className="flex items-center gap-3 px-4 py-3 min-h-[44px] text-base hover:bg-accent transition-colors"
  >
    <Building2 className="h-5 w-5" />
    <span>Properties</span>
  </a>
  <a
    href="#"
    className="flex items-center gap-3 px-4 py-3 min-h-[44px] text-base hover:bg-accent transition-colors"
  >
    <Users className="h-5 w-5" />
    <span>Team</span>
  </a>
</nav>
```

### Hide Desktop Menu, Show Mobile Menu
```typescript
// Source: Tailwind CSS responsive design patterns
<nav>
  {/* Desktop navigation - hidden on mobile */}
  <div className="hidden md:flex items-center">
    <NavigationMenu>
      {/* Desktop dropdown menus */}
    </NavigationMenu>
  </div>

  {/* Mobile menu trigger - hidden on desktop */}
  <div className="md:hidden">
    <MobileNav />
  </div>

  {/* CTAs - hide "Log in" below 640px */}
  <div className="flex items-center gap-4">
    <a href="#" className="hidden sm:block text-sm">
      Log in
    </a>
    <a href="#" className="text-sm bg-foreground text-background px-4 py-2 rounded-full">
      Get Started
    </a>
  </div>
</nav>
```

### Viewport Height Alternative
```typescript
// Source: Modern CSS viewport units research
// BAD: Causes layout shift on mobile
<section className="h-screen">
  {/* Content */}
</section>

// GOOD: Uses min-h-screen (Tailwind handles mobile)
<section className="min-h-screen">
  {/* Content */}
</section>

// BETTER: Use dvh if targeting very modern browsers
<section className="min-h-[100dvh]">
  {/* Content */}
</section>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| vh units for full-height | min-h-screen or dvh units | 2022-2024 | Eliminates mobile layout shift from browser UI |
| Custom hamburger menus | shadcn/ui Sheet/Drawer | 2023+ | Accessibility built-in, less code, better UX |
| JavaScript media queries | Tailwind breakpoint classes | Ongoing | Better performance, no hydration issues |
| react-burger-menu library | Native Sheet/Drawer components | 2024+ | Lighter bundle, better integration with design system |
| Container div with padding | Tailwind max-w-* utilities | Ongoing | More consistent, responsive by default |
| Animating all properties | Transform + opacity only | Ongoing | 60fps animations on mobile |
| Hidden overflow on body | Focus trap in Sheet/Dialog | 2023+ | Better scroll behavior, accessibility |

**Deprecated/outdated:**
- **100vh for mobile layouts**: Use min-h-screen or dvh units (addresses browser UI issue)
- **Custom media query hooks**: Use Tailwind classes instead (better performance, no hydration)
- **react-burger-menu**: Use shadcn/ui Sheet/Drawer (better accessibility, modern React patterns)
- **Fixed pixel breakpoints**: Use Tailwind's rem-based breakpoints (better accessibility)

## Open Questions

Things that couldn't be fully resolved:

1. **Optimal dashboard mockup scaling on mobile**
   - What we know: Current mockup is complex with nested elements (sidebar, charts, tables)
   - What's unclear: Whether to maintain proportional scale or simplify for mobile readability
   - Recommendation: Test both approaches - proportional scaling with transform: scale() vs simplified mobile-specific mockup. User testing will determine which is more effective for conversion.

2. **Stats animation triggering on mobile scroll**
   - What we know: Current implementation uses scroll progress with useMotionValueEvent
   - What's unclear: Whether scroll-based animations work well on mobile (touch scrolling is fast)
   - Recommendation: Implement scroll-based but with adjusted thresholds for mobile. Consider IntersectionObserver as alternative trigger for more reliable mobile detection.

3. **Rotating text performance on older mobile devices**
   - What we know: RotatingText component uses character-by-character animation with Framer Motion
   - What's unclear: Performance impact on 2-3 year old mid-range Android devices
   - Recommendation: Test on older devices. May need to reduce animation complexity or disable on low-end devices using performance detection.

4. **Container queries vs media queries for component responsiveness**
   - What we know: Tailwind v4 supports container queries with @container and @md: syntax
   - What's unclear: Whether to use container queries for Hero/Navigation or stick with viewport-based media queries
   - Recommendation: Use media queries for initial implementation (simpler, more predictable). Container queries better suited for reusable components that may appear in different contexts.

## Sources

### Primary (HIGH confidence)
- [Tailwind CSS Responsive Design Documentation](https://tailwindcss.com/docs/responsive-design) - Official breakpoint system and mobile-first approach
- [WCAG 2.5.5: Target Size Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html) - Official accessibility standards for touch targets
- [shadcn/ui Sheet Component](https://ui.shadcn.com/docs/components/sheet) - Official documentation for mobile menu implementation
- [shadcn/ui Drawer Component](https://ui.shadcn.com/docs/components/drawer) - Official documentation for mobile drawer
- Package.json verification - Confirmed installed versions: Framer Motion 12.26.2, Tailwind v4, shadcn/ui components

### Secondary (MEDIUM confidence)
- [Framer Motion Performance Optimization](https://app.studyraid.com/en/read/7850/206068/optimizing-animations-for-mobile-devices) - Transform properties and mobile best practices
- [Mobile Navigation Patterns 2026](https://phone-simulator.com/blog/mobile-navigation-patterns-in-2026) - Industry patterns and best practices
- [Smashing Magazine: Accessible Touch Targets](https://www.smashingmagazine.com/2023/04/accessible-tap-target-sizes-rage-taps-clicks/) - Research-based touch target guidelines
- [Modern CSS Viewport Units](https://medium.com/@alekswebnet/fix-mobile-100vh-bug-in-one-line-of-css-dynamic-viewport-units-in-action-102231e2ed56) - dvh units and mobile viewport issues
- [Tailwind CSS Best Practices 2025-2026](https://www.frontendtools.tech/blog/tailwind-css-best-practices-design-system-patterns) - Mobile-first patterns and design tokens

### Tertiary (LOW confidence)
- Multiple Medium articles on Framer Motion and Tailwind patterns - General guidance, not version-specific
- Community discussions on mobile navigation patterns - Useful patterns but not authoritative

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified in package.json, official documentation reviewed
- Architecture: HIGH - Tailwind mobile-first and shadcn/ui patterns are well-documented and stable
- Pitfalls: HIGH - Based on official WCAG standards, Tailwind docs, and verified mobile development issues
- Animation optimization: MEDIUM - Research-based but some aspects require device testing
- Dashboard mockup strategy: MEDIUM - Requires user testing to determine optimal approach

**Research date:** 2026-01-27
**Valid until:** 2026-02-27 (30 days - relatively stable domain)

**Note:** This research focused on the technical implementation patterns. The existing Hero.tsx and Navigation.tsx components were reviewed to understand current architecture. All recommended libraries are already installed in the project.
