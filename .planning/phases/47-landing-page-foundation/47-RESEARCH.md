# Phase 47: Landing Page Foundation - Research

**Researched:** 2026-01-26
**Domain:** Next.js landing page navigation, layout, and component architecture
**Confidence:** HIGH

## Summary

The landing page foundation requires a fixed navbar with responsive hamburger menu, footer with organized links, and a proper layout structure to receive content sections. The project already uses Next.js 16.1.1 App Router with Tailwind CSS v4 and Framer Motion 12.26.2, and has existing navbar and footer components that implement modern best practices.

The research reveals that the standard approach is to:
1. Use Next.js App Router with Server Component layouts and minimal Client Components for interactivity
2. Implement fixed/sticky positioning with Tailwind CSS utilities for navbar
3. Use Framer Motion's AnimatePresence and motion components for smooth mobile menu animations
4. Follow ARIA landmark and accessibility patterns for screen reader support
5. Prevent body scroll during mobile menu open state
6. Minimize CLS (Cumulative Layout Shift) by reserving space for fixed elements

**Primary recommendation:** Build on the existing LandingNav and Footer components, ensure they're integrated into a proper landing page layout route, add scroll lock optimization for iOS Safari, and implement proper semantic HTML with ARIA landmarks for accessibility.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.1 | App Router, SSR, routing | Industry standard for production React apps, excellent SEO, App Router is the modern approach as of 2025-2026 |
| Tailwind CSS | v4 | Utility-first styling, responsive design | De facto standard for modern web styling, v4 uses new @tailwindcss/postcss architecture |
| Framer Motion | 12.26.2 | Declarative animations, exit animations | Industry standard for React animations, AnimatePresence is the pattern for modal/menu animations |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Lucide React | 0.562.0 | Icon library | Already in project, lightweight, tree-shakeable SVG icons |
| next-intl | 4.7.0 | i18n support | Already in project, needed for bilingual English/Hebrew support |
| class-variance-authority | 0.7.1 | Component variants | Already in project via shadcn/ui pattern |
| clsx / tailwind-merge | Latest | Conditional classes | Already in project via `cn()` utility |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Framer Motion | CSS animations only | CSS is lighter but harder to orchestrate complex animations, no AnimatePresence for exit animations |
| Tailwind CSS v4 | Tailwind v3 | v3 has more examples but v4 is faster and uses native CSS features |
| Built-in scroll lock | body-scroll-lock library | Library handles edge cases but adds dependency; manual implementation sufficient for this use case |

**Installation:**
All dependencies already installed. No new packages required.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   └── [locale]/
│       ├── (landing)/           # Route group for landing pages
│       │   ├── layout.tsx       # Landing-specific layout with nav + footer
│       │   ├── page.tsx         # Landing page content
│       │   └── sections/        # Section components (optional)
│       └── layout.tsx           # Root locale layout
├── components/
│   ├── landing/
│   │   ├── Navigation/
│   │   │   └── LandingNav.tsx   # EXISTS - Navbar component
│   │   └── Footer/
│   │       └── Footer.tsx       # EXISTS - Footer component
│   └── ui/                      # Reusable UI components
└── lib/
    └── utils.ts                 # cn() utility for class merging
```

### Pattern 1: Fixed Navbar with Scroll-Based Styling
**What:** Use `fixed` positioning with Tailwind, track scroll position with Framer Motion's `useScroll`, apply backdrop blur and shadow when scrolled

**When to use:** All landing pages with sticky navigation

**Example:**
```typescript
// Source: Existing REOS codebase at src/components/landing/Navigation/LandingNav.tsx
'use client'

import { useState } from 'react'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 50)
  })

  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "transition-all duration-300",
        scrolled
          ? "bg-background/95 backdrop-blur-md shadow-sm border-b"
          : "bg-transparent"
      )}
    >
      {/* Navbar content */}
    </motion.header>
  )
}
```

### Pattern 2: Responsive Mobile Menu with AnimatePresence
**What:** Use Framer Motion's `motion.div` with variants for smooth height animations, separate mobile and desktop navigation structures

**When to use:** Responsive navbars that need smooth mobile menu animations

**Example:**
```typescript
// Source: Existing REOS codebase
const mobileMenuVariants = {
  closed: { opacity: 0, height: 0, transition: { duration: 0.3, ease: "easeInOut" } },
  open: { opacity: 1, height: "auto", transition: { duration: 0.3, ease: "easeInOut" } }
}

function MobileNav({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      variants={shouldReduceMotion ? {} : mobileMenuVariants}
      initial="closed"
      animate={isOpen ? "open" : "closed"}
      className="lg:hidden overflow-hidden"
    >
      <nav className="flex flex-col py-4">
        {/* Nav links */}
      </nav>
    </motion.div>
  )
}
```

### Pattern 3: Server/Client Component Composition
**What:** Keep layout as Server Component, mark only interactive parts with `'use client'`

**When to use:** All Next.js App Router layouts to minimize JavaScript bundle

**Example:**
```typescript
// Source: Next.js official docs - https://nextjs.org/docs/app/getting-started/server-and-client-components
// app/[locale]/(landing)/layout.tsx - Server Component (default)
import { LandingNav } from '@/components/landing/Navigation/LandingNav'
import { Footer } from '@/components/landing/Footer/Footer'

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LandingNav /> {/* Client Component */}
      <main>{children}</main>
      <Footer /> {/* Client Component */}
    </>
  )
}

// components/landing/Navigation/LandingNav.tsx - Client Component
'use client'
export function LandingNav() { /* interactive navbar */ }
```

### Pattern 4: Semantic HTML with ARIA Landmarks
**What:** Use `<header>`, `<nav>`, `<main>`, `<footer>` semantic elements with proper ARIA labels for multiple navigation regions

**When to use:** All public-facing pages for accessibility and SEO

**Example:**
```typescript
// Source: MDN ARIA navigation role docs
<header className="fixed top-0...">
  <nav aria-label="Main navigation">
    {/* Desktop nav links */}
  </nav>

  <nav aria-label="Mobile navigation" id="mobile-nav">
    {/* Mobile nav links */}
  </nav>
</header>

<footer role="contentinfo">
  {/* Footer content */}
</footer>
```

### Pattern 5: Body Scroll Lock for Mobile Menus
**What:** Use `document.body.style.overflow = 'hidden'` in useEffect when menu opens, with cleanup

**When to use:** Mobile hamburger menus, modals, drawers

**Example:**
```typescript
// Source: Existing REOS codebase
useEffect(() => {
  if (mobileMenuOpen) {
    document.body.style.overflow = "hidden"
  } else {
    document.body.style.overflow = ""
  }
  return () => {
    document.body.style.overflow = ""
  }
}, [mobileMenuOpen])
```

### Anti-Patterns to Avoid
- **Wrapping entire layout in `'use client'`:** Unnecessarily increases JavaScript bundle. Only mark interactive components as client components.
- **Using `position: sticky` without parent height:** Sticky positioning requires a scrollable parent with defined height to work properly.
- **Animating with `height` without `overflow: hidden`:** Causes content to be visible during collapse animation.
- **Forgetting scroll cleanup in useEffect:** Can leave body scroll locked if component unmounts while menu is open.
- **Using Fragment `<>` with AnimatePresence:** React doesn't preserve keys properly in Fragments; use array or div wrapper instead.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Mobile menu animations | Custom CSS transitions with state management | Framer Motion AnimatePresence + variants | AnimatePresence handles exit animations automatically, respects prefers-reduced-motion, provides declarative API |
| Scroll position tracking | window.addEventListener('scroll') | Framer Motion useScroll + useMotionValueEvent | Better performance (uses requestAnimationFrame), integrates with animation system, automatic cleanup |
| Body scroll lock for mobile | Custom overflow + position:fixed logic | Simple useEffect with overflow:hidden | iOS Safari has quirks with position:fixed; overflow:hidden is simpler and works cross-browser |
| Icon library | SVG sprite sheets or custom icon components | Lucide React (already installed) | Tree-shakeable, consistent design, actively maintained, 1000+ icons |
| Responsive utilities | Custom media queries | Tailwind responsive prefixes (md:, lg:) | Consistent breakpoints, mobile-first approach, reduces CSS duplication |
| Class name merging | Manual string concatenation | clsx + tailwind-merge via cn() | Handles conditional classes, resolves Tailwind conflicts (e.g., "p-2 p-4" becomes "p-4") |

**Key insight:** Framer Motion is the industry standard for React animations specifically because AnimatePresence solves the notoriously difficult problem of animating component unmounts. Hand-rolling this requires managing component lifecycle, timing coordination, and DOM cleanup - Framer Motion handles all of this declaratively.

## Common Pitfalls

### Pitfall 1: Cumulative Layout Shift (CLS) from Fixed Navbar
**What goes wrong:** Fixed navbar doesn't reserve space in document flow, causing content to jump when navbar renders or changes height

**Why it happens:** `position: fixed` removes element from document flow; content underneath doesn't account for navbar height

**How to avoid:**
- Add `padding-top` to main content equal to navbar height
- Use CSS custom properties for dynamic height: `--header-height: 4rem`
- Reserve space immediately in layout, not after client-side render

**Warning signs:**
- Content visible behind transparent navbar on initial load
- Content "jumps down" after page hydrates
- CLS score > 0.1 in Lighthouse

**Example:**
```css
/* Source: Existing REOS globals.css */
:root {
  --header-height: 4rem;
}

/* In layout or main content */
.main-content {
  padding-top: var(--header-height);
}
```

### Pitfall 2: iOS Safari Viewport Issues with Fixed Elements
**What goes wrong:** After iOS 26 update, fixed/sticky elements don't render properly behind address bar area, especially during URL bar show/hide transitions

**Why it happens:** iOS WebView doesn't provide granular control for fixed element positioning during URL bar state changes; Chrome on iOS uses system WebView with these limitations

**How to avoid:**
- Use moderate z-index values (e.g., z-50) to allow modals/dialogs above navbar
- Test on actual iOS devices, not just browser DevTools
- Avoid animating fixed elements during scroll on iOS
- Use `position: fixed` instead of `position: sticky` for navbar if iOS support is critical

**Warning signs:**
- Navbar disappears or overlaps incorrectly on iOS
- Fixed elements "jump" when URL bar shows/hides
- Reports from iOS users of broken navigation

### Pitfall 3: Focus Trap Missing in Mobile Menu
**What goes wrong:** Keyboard users (including assistive technology) can tab to elements behind the open mobile menu, creating confusion and accessibility barriers

**Why it happens:** Mobile menu is typically an overlay but doesn't trap focus; Tab key moves focus to page content behind menu

**How to avoid:**
- When menu opens, focus first interactive element (close button or first link)
- When menu closes, return focus to hamburger button that opened it
- Implement focus trap: Tab from last element returns to first element
- Add `aria-expanded` to hamburger button
- Add `aria-controls` linking button to menu ID

**Warning signs:**
- Keyboard focus moves to elements behind menu
- Tab order includes page content when menu is open
- Screen reader users report confusion
- WCAG accessibility audits fail

**Example:**
```typescript
// Source: Existing REOS codebase already implements some of this
<button
  type="button"
  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
  aria-expanded={mobileMenuOpen}
  aria-controls="mobile-nav"
  aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
>
  {/* Hamburger icon */}
</button>

<div id="mobile-nav">
  <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
</div>
```

**Note:** Current implementation has aria-expanded and aria-controls but may need focus management enhancement for full keyboard accessibility.

### Pitfall 4: Reduced Motion Not Respected
**What goes wrong:** Users with motion sensitivity (vestibular disorders) experience nausea or discomfort from animations that respect `prefers-reduced-motion: reduce` media query

**Why it happens:** Forgetting to check `useReducedMotion()` hook before applying animations

**How to avoid:**
- Use Framer Motion's `useReducedMotion()` hook
- Pass empty object `{}` instead of variants when reduced motion is preferred
- Test with browser DevTools: emulate `prefers-reduced-motion: reduce`
- Apply to all motion: navbar entrance, mobile menu, hover effects

**Warning signs:**
- Animations always play regardless of system settings
- User complaints about motion sickness
- Accessibility audits flag missing reduced motion support

**Example:**
```typescript
// Source: Existing REOS codebase already implements this correctly
const shouldReduceMotion = useReducedMotion()

<motion.div
  variants={shouldReduceMotion ? {} : mobileMenuVariants}
  initial="closed"
  animate={isOpen ? "open" : "closed"}
>
```

### Pitfall 5: Mobile Menu Doesn't Close on Resize
**What goes wrong:** User opens mobile menu on small screen, resizes browser to desktop width, menu stays open but hamburger button disappears, leaving broken UI state

**Why it happens:** Mobile menu state not synced with viewport size changes

**How to avoid:**
- Add resize event listener that closes mobile menu when viewport exceeds mobile breakpoint
- Use same breakpoint as CSS (1024px for `lg:` in Tailwind)
- Clean up event listener on component unmount

**Warning signs:**
- Mobile menu visible on desktop view after resize
- Hamburger button hidden but menu content visible
- Overlay background persists on desktop

**Example:**
```typescript
// Source: Existing REOS codebase already implements this correctly
useEffect(() => {
  const handleResize = () => {
    if (window.innerWidth >= 1024 && mobileMenuOpen) {
      setMobileMenuOpen(false)
    }
  }
  window.addEventListener("resize", handleResize)
  return () => window.removeEventListener("resize", handleResize)
}, [mobileMenuOpen])
```

## Code Examples

Verified patterns from official sources and existing codebase:

### Fixed Navbar with Z-Index Layering
```typescript
// Source: Tailwind CSS official docs - https://tailwindcss.com/docs/position
// Source: Existing REOS codebase
<motion.header
  className={cn(
    "fixed top-0 left-0 right-0",
    "z-50", // High enough for content, but allows z-[60] modals above
    "transition-all duration-300",
    scrolled
      ? "bg-background/95 backdrop-blur-md shadow-sm border-b"
      : "bg-transparent"
  )}
>
  {/* Navbar content */}
</motion.header>

{/* In main content */}
<main className="pt-16 sm:pt-18 lg:pt-20">
  {/* Reserve space for navbar height */}
  {children}
</main>
```

### Mobile Menu with Scroll Lock
```typescript
// Source: Existing REOS codebase synthesizes multiple best practices
'use client'

import { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export function ResponsiveNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  // Prevent body scroll when menu open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileMenuOpen])

  // Close menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [mobileMenuOpen])

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Logo />

        {/* Desktop nav - hidden on mobile */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
          {/* Desktop links */}
        </nav>

        {/* Hamburger button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile menu */}
      <div id="mobile-nav">
        <motion.div
          variants={shouldReduceMotion ? {} : {
            closed: { opacity: 0, height: 0 },
            open: { opacity: 1, height: "auto" }
          }}
          initial="closed"
          animate={mobileMenuOpen ? "open" : "closed"}
          className="lg:hidden overflow-hidden"
        >
          <nav aria-label="Mobile navigation">
            {/* Mobile links */}
          </nav>
        </motion.div>
      </div>
    </header>
  )
}
```

### Footer with Proper Landmark
```typescript
// Source: MDN ARIA contentinfo role - https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/navigation_role
// Source: Existing REOS codebase
export function Footer() {
  return (
    <footer
      className="relative bg-card border-t border-border pt-16 pb-8"
      role="contentinfo"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Footer grid */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-12 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <FooterLogo />
            <p className="mt-4 text-sm text-muted-foreground">
              {/* Tagline */}
            </p>
            {/* Social links */}
          </div>

          {/* Link columns */}
          {linkGroups.map((group) => (
            <div key={group.title}>
              <h3 className="font-semibold mb-4">{group.title}</h3>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t">
          <p className="text-sm text-muted-foreground">
            © 2026 REOS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
```

### Next.js App Router Landing Layout
```typescript
// Source: Next.js official docs - https://nextjs.org/docs/app/getting-started/layouts-and-pages
// app/[locale]/(landing)/layout.tsx
import { LandingNav } from '@/components/landing/Navigation/LandingNav'
import { Footer } from '@/components/landing/Footer/Footer'

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <LandingNav />
      {/* Main content with padding to account for fixed navbar */}
      <main className="min-h-screen pt-16 sm:pt-18 lg:pt-20">
        {children}
      </main>
      <Footer />
    </>
  )
}

// app/[locale]/(landing)/page.tsx
export default function LandingPage() {
  return (
    <>
      {/* Hero section */}
      <section id="hero" className="min-h-screen flex items-center justify-center">
        {/* Hero content */}
      </section>

      {/* Features section */}
      <section id="features" className="py-24">
        {/* Features content */}
      </section>

      {/* More sections... */}
    </>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router | App Router | Next.js 13+ (2023), default in Next.js 15+ (2025) | Layouts persist between pages, better streaming, native React Server Components |
| Tailwind v3 | Tailwind v4 | Released 2024 | Uses @tailwindcss/postcss, faster builds, native CSS features, simplified config |
| framer-motion <10 | framer-motion 12+ | v11-12 (2024-2025) | Better React 19 support, improved performance, motion-dev.com new docs |
| CSS animations | Framer Motion declarative animations | Industry shift ~2021-2023 | Easier exit animations, better UX, respects prefers-reduced-motion |
| position: sticky only | position: fixed with scroll detection | ~2024-2025 | Better mobile support, more control over styling transitions |
| body-scroll-lock library | Manual overflow: hidden | ~2024-2025 | Simpler approach works for most cases, iOS Safari improved |

**Deprecated/outdated:**
- **_app.js / _document.js in Pages Router:** Replaced by app/layout.tsx in App Router; provides better data fetching and nested layouts
- **getStaticProps in page components:** Replaced by async Server Components that fetch directly; simpler mental model, less boilerplate
- **Custom viewport meta tags in head:** Use Next.js `viewport` export from layout/page; type-safe, automatic handling
- **Imperative router.push() for navigation:** Use `<Link>` component for better prefetching; router.push() only for programmatic navigation (e.g., after form submit)

## Open Questions

Things that couldn't be fully resolved:

1. **Focus trap implementation completeness**
   - What we know: Current REOS codebase has aria-expanded and aria-controls on hamburger button
   - What's unclear: Whether focus is programmatically moved to first menu item on open, and returned to button on close
   - Recommendation: Test with keyboard-only navigation and screen reader; if focus doesn't move automatically, add refs and focus() calls

2. **iOS 26 viewport bug impact**
   - What we know: iOS 26 update introduced viewport bugs with fixed/sticky elements near address bar
   - What's unclear: Whether REOS needs to support iOS 26 specifically, and if the viewport: { viewportFit: "cover" } config is sufficient mitigation
   - Recommendation: Test on iOS 26 devices if available; may need additional viewport meta tag adjustments or safe-area-inset padding

3. **Landing page route structure**
   - What we know: LandingNav and Footer components exist in codebase
   - What's unclear: Whether they're integrated into a dedicated landing layout, or if landing page uses main app layout
   - Recommendation: Create (landing) route group with dedicated layout if not already present; keeps landing page separate from authenticated app routes

4. **Scroll-to-section smooth scrolling**
   - What we know: Nav links use hash anchors like `#features`, `#pricing`
   - What's unclear: Whether smooth scroll behavior is configured globally or per-link
   - Recommendation: Add `scroll-behavior: smooth` to CSS or use `scroll-margin-top` on sections to account for fixed navbar height; consider scroll-padding-top for better UX

## Sources

### Primary (HIGH confidence)
- Next.js Official Docs: [App Router Linking and Navigating](https://nextjs.org/docs/app/getting-started/linking-and-navigating) - Navigation best practices, prefetching behavior
- Next.js Official Docs: [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) - Component composition patterns
- Tailwind CSS Official Docs: [Position Utilities](https://tailwindcss.com/docs/position) - Fixed and sticky positioning
- MDN: [ARIA navigation role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/navigation_role) - Accessibility landmarks
- Existing REOS codebase: `/src/components/landing/Navigation/LandingNav.tsx` and `/src/components/landing/Footer/Footer.tsx` - Implemented patterns verified in production code

### Secondary (MEDIUM confidence)
- [Flowbite Navbar Components](https://flowbite.com/docs/components/navbar/) - WebSearch verified with official Tailwind docs - Responsive navbar patterns
- [Framer Motion Community Examples](https://medium.com/@georgestoilov/create-animated-hamburger-menu-with-react-and-framer-motion-e4ed2d36ed7c) - WebSearch, common patterns for hamburger animations
- [Accessibility Matters: Mobile Navigation](https://a11ymatters.com/pattern/mobile-nav/) - WebSearch, focus trap and keyboard navigation patterns
- [Locofy: Responsive Navigation Bar with TailwindCSS](https://www.locofy.ai/blog/build-a-responsive-navbar-with-tailwindcss) - WebSearch, responsive breakpoint patterns

### Tertiary (LOW confidence)
- Various WebSearch results on landing page footer design 2026 - General UX principles but not technical implementation details
- Community discussions on iOS Safari viewport bugs - WebSearch only, specific to iOS 26 which is very recent
- Medium articles on Framer Motion hamburger menus - WebSearch, tutorials from 2023-2024 but not official documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified in package.json, versions confirmed, official documentation reviewed
- Architecture: HIGH - Patterns verified in existing REOS codebase and official Next.js/Tailwind documentation
- Pitfalls: HIGH - Existing code already implements solutions to common pitfalls (scroll lock, resize handler, reduced motion)
- Footer structure: MEDIUM - General best practices clear, but specific legal requirements for REOS not documented
- iOS Safari issues: LOW - iOS 26 bug is very recent (2026), unclear if it affects REOS specifically

**Research date:** 2026-01-26
**Valid until:** ~2026-03-26 (60 days) - Stack is mature and stable; Next.js 16, Tailwind v4, Framer Motion 12 are current production versions
