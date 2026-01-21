# Phase 35: Mobile Foundation - Research

**Researched:** 2026-01-21
**Domain:** CSS viewport units, safe-area insets, next-themes integration, responsive hooks
**Confidence:** HIGH

## Summary

Phase 35 establishes the CSS and configuration foundation required for all subsequent mobile responsive work. The research confirms that REOS has all required packages installed (next-themes v0.4.6, Tailwind v4) but needs configuration changes. The work is purely configuration and CSS additions - no new dependencies required.

**Key findings:**
1. **Viewport meta tag is missing** - Next.js default is `width=device-width, initial-scale=1` but lacks `viewport-fit=cover` required for iOS safe area insets
2. **next-themes installed but not wired up** - Sonner already imports `useTheme` which returns undefined/default without ThemeProvider
3. **10+ instances of `100vh`/`min-h-screen`** exist that need conversion to dynamic viewport units (`dvh`)
4. **useIsMobile hook works correctly** - 768px breakpoint matches Tailwind's `md:` breakpoint

**Primary recommendation:** Configure viewport meta with `viewportFit: 'cover'`, add ThemeProvider to Providers.tsx, create CSS utility classes for safe-area insets, and convert `100vh`/`min-h-screen` to `100dvh`/`min-h-dvh`.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next-themes | 0.4.6 | Theme state management | Already installed, shadcn/ui recommended |
| Tailwind CSS | 4.x | Responsive utilities, dark mode | Already configured with `.dark` variant |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @radix-ui/react-direction | 1.1.1 | RTL direction context | Already in Providers.tsx |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| next-themes | Custom localStorage | Would lose SSR hydration handling, system preference sync |
| CSS env() | JS-based safe area | CSS-only is more performant, no hydration issues |

**Installation:**
```bash
# No installation needed - all packages already present
```

## Architecture Patterns

### Recommended Changes to Existing Files

```
src/app/[locale]/
├── layout.tsx         # ADD viewport export, ADD suppressHydrationWarning to <html>
└── Providers.tsx      # ADD ThemeProvider wrapper

src/app/
└── globals.css        # ADD safe-area utility classes, ADD --tab-bar-height CSS variable
```

### Pattern 1: Viewport Configuration (Next.js 14+/15)

**What:** Export static viewport object from root layout
**When to use:** Always - required for iOS safe area insets
**Example:**
```typescript
// src/app/[locale]/layout.tsx
// Source: https://nextjs.org/docs/app/api-reference/functions/generate-viewport
import type { Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover', // CRITICAL for env(safe-area-inset-*) to work on iOS
};
```

### Pattern 2: ThemeProvider Configuration

**What:** Wrap application with next-themes ThemeProvider
**When to use:** Required for theme switching, already expected by Sonner component
**Example:**
```typescript
// src/app/[locale]/Providers.tsx
// Source: https://github.com/pacocoursey/next-themes
import { ThemeProvider } from "next-themes";

export function Providers({ children, locale, direction, messages }: Props) {
  return (
    <ThemeProvider
      attribute="class"           // Matches Tailwind's .dark class selector
      defaultTheme="system"       // Respects OS preference
      enableSystem                // Auto-switch on OS change
      disableTransitionOnChange   // Prevents flash during theme switch
    >
      <DirectionProvider dir={direction}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </DirectionProvider>
    </ThemeProvider>
  );
}
```

### Pattern 3: Safe Area CSS Utilities

**What:** CSS classes for safe area padding
**When to use:** Any fixed-position element at screen edges (bottom tab bar, headers)
**Example:**
```css
/* src/app/globals.css */
/* Source: https://developer.mozilla.org/en-US/docs/Web/CSS/env */

/* CSS variables for layout calculations */
:root {
  --header-height: 4rem;      /* 64px - matches current h-16 */
  --tab-bar-height: 4rem;     /* 64px - for bottom tab bar */
}

/* Safe area utility classes */
@layer utilities {
  .safe-area-bottom {
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }

  .safe-area-top {
    padding-top: env(safe-area-inset-top, 0px);
  }

  .safe-area-left {
    padding-left: env(safe-area-inset-left, 0px);
  }

  .safe-area-right {
    padding-right: env(safe-area-inset-right, 0px);
  }
}
```

### Pattern 4: Dynamic Viewport Height

**What:** Use `dvh` units instead of `vh` for full-height layouts
**When to use:** Any full-screen or full-height container
**Example:**
```typescript
// BEFORE (broken on iOS Safari)
<div className="h-[calc(100vh-4rem)]">{children}</div>
<div className="min-h-screen">...</div>

// AFTER (works correctly)
<div className="h-[calc(100dvh-4rem)]">{children}</div>
<div className="min-h-dvh">...</div>
```

### Anti-Patterns to Avoid
- **Using 100vh on iOS:** Safari calculates 100vh as maximum viewport (when browser chrome is hidden), causing content to be clipped when browser UI is visible
- **Forgetting suppressHydrationWarning:** Causes React hydration errors because next-themes modifies the `<html>` element
- **Not setting attribute="class":** REOS uses `@custom-variant dark (&:is(.dark *))` which expects `.dark` class on HTML

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Theme state management | localStorage + useEffect | next-themes | Handles SSR, system preference, hydration |
| Safe area insets | JS viewport detection | CSS env() | Native CSS, no JS needed, no hydration issues |
| Mobile breakpoint detection | Manual resize listener | existing useIsMobile() | Already implemented correctly at 768px |

**Key insight:** CSS-native solutions (env(), dvh) are more reliable than JavaScript-based approaches because they avoid hydration mismatches and work before JS loads.

## Common Pitfalls

### Pitfall 1: Theme Flash (FOWT)
**What goes wrong:** Page flashes wrong theme color on load
**Why it happens:** Server renders without knowing localStorage theme preference
**How to avoid:**
1. Add `suppressHydrationWarning` to `<html>` tag
2. Use `disableTransitionOnChange` on ThemeProvider
3. For theme-dependent images, render both with CSS hiding: `dark:hidden` and `hidden dark:block`
**Warning signs:** Console hydration mismatch errors, visible flash on page load

### Pitfall 2: iOS Safari 100vh Bug
**What goes wrong:** Bottom elements get cut off or overlap with browser UI
**Why it happens:** iOS Safari calculates 100vh as maximum viewport height (with hidden browser chrome)
**How to avoid:**
1. Use `100dvh` instead of `100vh`
2. Use `min-h-dvh` instead of `min-h-screen`
3. Set `viewportFit: 'cover'` in viewport export
**Warning signs:** Testing only in Chrome DevTools (works there, fails on real iOS)

### Pitfall 3: Safe Area Insets Not Working
**What goes wrong:** `env(safe-area-inset-*)` returns 0 even on notched devices
**Why it happens:** Missing `viewport-fit=cover` in viewport meta tag
**How to avoid:** Ensure viewport export includes `viewportFit: 'cover'`
**Warning signs:** Bottom padding on tab bar doesn't account for iPhone home indicator

### Pitfall 4: useIsMobile Hydration Flash
**What goes wrong:** Layout flashes between mobile/desktop on initial load
**Why it happens:** Hook initializes as `undefined`, then updates on client
**How to avoid:**
1. Accept initial flash (current behavior is acceptable)
2. Use CSS-only responsive patterns for critical layout (`md:hidden`, `hidden md:flex`)
3. Reserve JS detection for interaction logic, not layout
**Warning signs:** Layout shift on page load

## Code Examples

Verified patterns from official sources:

### Root Layout Updates
```typescript
// src/app/[locale]/layout.tsx
// Source: https://nextjs.org/docs/app/api-reference/functions/generate-viewport
import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default async function LocaleLayout({ children, params }: Props) {
  // ... existing code ...
  return (
    <html
      lang={locale}
      dir={direction}
      suppressHydrationWarning  // Required for next-themes
      className={`${inter.variable} ...`}
    >
      {/* ... */}
    </html>
  );
}
```

### Providers.tsx with ThemeProvider
```typescript
// src/app/[locale]/Providers.tsx
// Source: https://github.com/pacocoursey/next-themes
"use client";

import { DirectionProvider } from "@radix-ui/react-direction";
import { NextIntlClientProvider, type Messages } from "next-intl";
import { ThemeProvider } from "next-themes";

type Props = {
  children: React.ReactNode;
  locale: string;
  direction: "ltr" | "rtl";
  messages: Messages;
};

export function Providers({ children, locale, direction, messages }: Props) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <DirectionProvider dir={direction}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </DirectionProvider>
    </ThemeProvider>
  );
}
```

### Safe Area CSS Additions
```css
/* src/app/globals.css - ADD to existing file */
/* Source: https://developer.mozilla.org/en-US/docs/Web/CSS/env */

:root {
  --header-height: 4rem;
  --tab-bar-height: 4rem;
}

@layer utilities {
  .safe-area-bottom {
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }

  .safe-area-top {
    padding-top: env(safe-area-inset-top, 0px);
  }

  /* Full height accounting for header (used in app layouts) */
  .h-app-content {
    height: calc(100dvh - var(--header-height));
  }

  /* Full height accounting for header and tab bar (mobile with bottom nav) */
  .h-app-content-mobile {
    height: calc(100dvh - var(--header-height) - var(--tab-bar-height));
  }
}
```

### Files Requiring 100vh -> 100dvh Conversion

Based on grep analysis, these files need updating:

| File | Current | Change To |
|------|---------|-----------|
| `src/components/layout/AppShell.tsx:372` | `h-[calc(100vh-4rem)]` | `h-[calc(100dvh-4rem)]` |
| `src/app/[locale]/(main)/page.tsx:25` | `min-h-screen` | `min-h-dvh` |
| `src/app/[locale]/(auth)/sign-in/[[...sign-in]]/page.tsx:5` | `min-h-screen` | `min-h-dvh` |
| `src/app/[locale]/(auth)/sign-up/[[...sign-up]]/page.tsx:5` | `min-h-screen` | `min-h-dvh` |
| `src/components/landing/Hero/Hero.tsx:256` | `min-h-screen` | `min-h-dvh` |
| `src/app/[locale]/(app)/properties/[id]/page.tsx:61,105,230` | `min-h-screen` | `min-h-dvh` |
| `src/app/[locale]/(app)/layout.tsx:61,70` | `min-h-screen` | `min-h-dvh` |

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `100vh` | `100dvh` | CSS 2022 | Fixes iOS Safari dynamic toolbar issue |
| Viewport meta string | Next.js Viewport export | Next.js 14 | Type-safe viewport configuration |
| Custom theme localStorage | next-themes | Established | Handles hydration, system preference |

**Browser support for dvh:**
- Safari 15.4+ (iOS 15.4+, March 2022)
- Chrome 108+ (December 2022)
- Firefox 101+ (May 2022)
- All modern browsers support it as of 2024

## Open Questions

No major open questions - the implementation path is clear:

1. **Potential edge case:** Sonner component already uses `useTheme` - verify it works after ThemeProvider is added (expected: yes, it will work correctly)
2. **RTL consideration:** Safe area insets are direction-agnostic, but verify on RTL layouts during testing

## Sources

### Primary (HIGH confidence)
- [Next.js generateViewport docs](https://nextjs.org/docs/app/api-reference/functions/generate-viewport) - Viewport configuration
- [next-themes GitHub](https://github.com/pacocoursey/next-themes) - ThemeProvider configuration
- [MDN env() CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/env) - Safe area insets
- [MDN Viewport concepts](https://developer.mozilla.org/en-US/docs/Web/CSS/Viewport_concepts) - dvh/svh/lvh units

### Secondary (MEDIUM confidence)
- [GitHub Discussion: viewport-fit support](https://github.com/vercel/next.js/discussions/46542) - Confirmed viewportFit is supported
- [shadcn/ui Dark Mode docs](https://ui.shadcn.com/docs/dark-mode/next) - ThemeProvider pattern validation

### Tertiary (LOW confidence)
- None - all findings verified with official sources

## Metadata

**Confidence breakdown:**
- Viewport configuration: HIGH - Official Next.js docs
- ThemeProvider setup: HIGH - Official next-themes docs + shadcn/ui docs
- Safe area CSS: HIGH - MDN documentation, browser support well-established
- 100vh conversion: HIGH - MDN documentation, well-documented iOS issue

**Research date:** 2026-01-21
**Valid until:** 2026-04-21 (90 days - stable CSS features and Next.js patterns)

## Current State Analysis

### Existing Configuration

**Viewport meta tag:** NOT CONFIGURED
- Next.js uses default: `<meta name="viewport" content="width=device-width, initial-scale=1" />`
- Missing `viewport-fit=cover` required for safe area insets

**ThemeProvider:** NOT WIRED UP
- next-themes v0.4.6 is installed in package.json
- Providers.tsx does NOT import or use ThemeProvider
- Sonner component imports useTheme but gets undefined (defaults to "system")

**CSS safe-area utilities:** NOT PRESENT
- globals.css has no env() usage
- No CSS variables for layout heights

**useIsMobile hook:** WORKING CORRECTLY
```typescript
// src/hooks/use-mobile.ts
const MOBILE_BREAKPOINT = 768  // Matches Tailwind md: breakpoint
// Returns boolean based on window.matchMedia
```

### Files to Modify

1. **`src/app/[locale]/layout.tsx`**
   - Add `viewport` export with `viewportFit: 'cover'`
   - Add `suppressHydrationWarning` to `<html>` tag

2. **`src/app/[locale]/Providers.tsx`**
   - Import `ThemeProvider` from `next-themes`
   - Wrap children with ThemeProvider (outermost provider)

3. **`src/app/globals.css`**
   - Add CSS variables: `--header-height`, `--tab-bar-height`
   - Add utility classes: `.safe-area-bottom`, `.safe-area-top`

4. **Multiple files with `100vh`/`min-h-screen`**
   - Convert to `100dvh`/`min-h-dvh` (8+ files identified)
