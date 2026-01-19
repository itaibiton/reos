# Phase 28: i18n Infrastructure - Research

**Researched:** 2026-01-19
**Domain:** Next.js Internationalization (next-intl v4, Clerk auth, Radix RTL)
**Confidence:** HIGH

## Summary

This phase establishes i18n infrastructure for the REOS application using next-intl v4 with the Next.js 16 App Router. The primary challenge is composing next-intl middleware with Clerk authentication while restructuring the existing route groups `(app)`, `(auth)`, `(main)` under a new `[locale]` segment.

Key findings:
- **next-intl v4** provides full App Router support with `defineRouting` configuration and middleware-based locale handling
- **Clerk middleware composition** is well-documented - clerkMiddleware wraps outer and returns intlMiddleware from its handler
- **Next.js 16** renamed `middleware.ts` to `proxy.ts` - this is a file rename, functionality is identical
- **DirectionProvider** from `@radix-ui/react-direction` must wrap the app at root level for Radix/Shadcn RTL support
- **Heebo font** supports both Hebrew and Latin subsets natively via `next/font/google`

**Primary recommendation:** Use `localePrefix: 'always'` (URLs always include `/en/` or `/he/`) for simpler implementation, cleaner matcher patterns, and avoiding edge cases with the Link component.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next-intl | ^4.x | i18n routing, translations, locale handling | De facto standard for Next.js App Router i18n |
| @radix-ui/react-direction | ^1.x | RTL context for Radix primitives | Official Radix solution for direction |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Heebo (next/font/google) | N/A | Hebrew-Latin font family | Bilingual Hebrew/English apps |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| next-intl | next-translate | next-intl has better App Router support, more active maintenance |
| localePrefix: 'always' | localePrefix: 'as-needed' | 'as-needed' hides prefix for default locale but has Link hydration edge cases |
| Heebo | Noto Sans Hebrew + Inter | Heebo is single font with both scripts, simpler to manage |

**Installation:**
```bash
npm install next-intl @radix-ui/react-direction
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── i18n/
│   ├── routing.ts         # defineRouting config (locales, defaultLocale)
│   ├── navigation.ts      # createNavigation exports (Link, redirect, etc.)
│   └── request.ts         # getRequestConfig for server-side locale
├── proxy.ts               # Composed Clerk + next-intl middleware
└── app/
    └── [locale]/
        ├── layout.tsx     # Root locale layout with providers
        ├── (app)/         # Protected app routes (dashboard, etc.)
        │   ├── layout.tsx # AppShell layout
        │   └── ...
        ├── (auth)/        # Authentication routes (sign-in, sign-up)
        │   ├── layout.tsx
        │   └── ...
        └── (main)/        # Public marketing routes
            ├── layout.tsx
            └── ...
```

### Pattern 1: Middleware Composition (Clerk + next-intl)

**What:** Clerk middleware wraps outer, returns intlMiddleware from its handler
**When to use:** Always - this is the required pattern for auth + i18n
**Example:**
```typescript
// Source: https://clerk.com/docs/reference/nextjs/clerk-middleware
// File: src/proxy.ts (Next.js 16) or middleware.ts (Next.js 15)

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

// Define protected routes (must include locale prefix in pattern)
const isProtectedRoute = createRouteMatcher([
  '/:locale/dashboard(.*)',
  '/:locale/properties(.*)',
  '/:locale/profile(.*)',
  '/:locale/onboarding(.*)',
  // Add all (app) routes
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
  return intlMiddleware(req)
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

### Pattern 2: Locale-Aware Root Layout with DirectionProvider

**What:** Root `[locale]/layout.tsx` sets HTML lang/dir and wraps with providers
**When to use:** Always - required for RTL support and locale context
**Example:**
```typescript
// Source: https://next-intl.dev/docs/getting-started/app-router/with-i18n-routing
// File: src/app/[locale]/layout.tsx

import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { ClerkProvider } from '@clerk/nextjs'
import { DirectionProvider } from '@radix-ui/react-direction'
import { routing } from '@/i18n/routing'
import { Heebo } from 'next/font/google'

const heebo = Heebo({
  subsets: ['latin', 'hebrew'],
  variable: '--font-heebo',
})

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const direction = locale === 'he' ? 'rtl' : 'ltr'

  return (
    <html lang={locale} dir={direction} className={heebo.variable}>
      <body className="font-sans antialiased">
        <ClerkProvider
          signInUrl={`/${locale}/sign-in`}
          signUpUrl={`/${locale}/sign-up`}
          signInFallbackRedirectUrl={`/${locale}/dashboard`}
          signUpFallbackRedirectUrl={`/${locale}/dashboard`}
        >
          <DirectionProvider dir={direction}>
            {children}
          </DirectionProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
```

### Pattern 3: Routing Configuration

**What:** Central routing config shared between middleware and navigation
**When to use:** Always - defines supported locales
**Example:**
```typescript
// Source: https://next-intl.dev/docs/routing/configuration
// File: src/i18n/routing.ts

import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'he'],
  defaultLocale: 'en',
  localePrefix: 'always', // URLs always include /en/ or /he/
  // localeDetection: true (default) - detects from Accept-Language header
})
```

### Pattern 4: Navigation APIs

**What:** Locale-aware navigation hooks that respect routing config
**When to use:** For all internal navigation (Link, redirect, useRouter)
**Example:**
```typescript
// Source: https://next-intl.dev/docs/routing/navigation
// File: src/i18n/navigation.ts

import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
```

### Anti-Patterns to Avoid
- **Using Next.js native Link/redirect:** Always use next-intl's locale-aware versions
- **Hardcoding locale in URLs:** Use the navigation APIs which handle locale automatically
- **Placing DirectionProvider inside route groups:** Must be at root level to affect all Radix components
- **Setting dir on body instead of html:** HTML spec requires dir on html element
- **Using 'as-needed' prefix without understanding edge cases:** Can cause hydration mismatches with Link

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Locale detection | Custom Accept-Language parsing | next-intl middleware | Handles cookies, headers, negotiation automatically |
| Locale-aware redirects | Manual redirect logic | next-intl middleware | Handles all redirect scenarios |
| RTL context | Custom context provider | DirectionProvider | Radix components expect this specific context |
| Locale-aware links | Manually prepending locale | `Link` from next-intl/navigation | Handles all edge cases, respects config |
| Language switching | Custom href construction | `usePathname` + `Link` with locale prop | Preserves current path, handles dynamic segments |

**Key insight:** next-intl middleware handles a surprising number of edge cases: locale negotiation, cookie persistence, pathname rewrites, and redirect responses. Custom implementations invariably miss edge cases.

## Common Pitfalls

### Pitfall 1: Forgetting to Update ClerkProvider URLs
**What goes wrong:** Auth redirects go to non-locale URLs (`/sign-in` instead of `/en/sign-in`)
**Why it happens:** ClerkProvider signInUrl/signUpUrl are copied from existing code without adding locale
**How to avoid:** Pass locale-prefixed URLs to ClerkProvider in the locale layout
**Warning signs:** Users redirected to 404 after sign-in, or authentication loops

### Pitfall 2: Route Matcher Patterns Missing Locale
**What goes wrong:** Protected routes aren't protected, or public routes are blocked
**Why it happens:** createRouteMatcher patterns don't account for `/:locale/` prefix
**How to avoid:** Include `:locale` segment in all route patterns: `'/:locale/dashboard(.*)'`
**Warning signs:** Auth protection working inconsistently across locales

### Pitfall 3: DirectionProvider Placement
**What goes wrong:** Some Radix components don't respond to RTL
**Why it happens:** DirectionProvider placed too low in tree (inside route group layouts)
**How to avoid:** Place in root `[locale]/layout.tsx`, wrapping all children
**Warning signs:** Dropdowns, popovers, or toasts animating in wrong direction

### Pitfall 4: Using Old Root Layout
**What goes wrong:** Conflicting layouts, wrong lang/dir attributes
**Why it happens:** Keeping `app/layout.tsx` alongside `app/[locale]/layout.tsx`
**How to avoid:** Remove old root layout - the locale layout becomes the new root
**Warning signs:** Console warnings about multiple `<html>` elements, wrong language in page source

### Pitfall 5: Static Params Not Generated
**What goes wrong:** Build fails or pages not pre-rendered
**Why it happens:** Missing `generateStaticParams` for `[locale]` segment
**How to avoid:** Add `generateStaticParams` to locale layout returning all locales
**Warning signs:** Build errors mentioning dynamic params, or slow cold starts

### Pitfall 6: Font Not Supporting Both Scripts
**What goes wrong:** Hebrew text falls back to system font
**Why it happens:** Using Latin-only font, or not including 'hebrew' subset
**How to avoid:** Use Heebo with `subsets: ['latin', 'hebrew']`
**Warning signs:** Visual inconsistency between English and Hebrew text

## Code Examples

Verified patterns from official sources:

### Request Configuration (Server-Side Locale)
```typescript
// Source: https://next-intl.dev/docs/getting-started/app-router/with-i18n-routing
// File: src/i18n/request.ts

import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale

  return {
    locale,
    // Messages will be added in Phase 29
    // messages: (await import(`../../messages/${locale}.json`)).default
  }
})
```

### Static Params Generation
```typescript
// Source: https://next-intl.dev/docs/getting-started/app-router/with-i18n-routing
// Add to src/app/[locale]/layout.tsx

import { routing } from '@/i18n/routing'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}
```

### Heebo Font Configuration
```typescript
// Source: https://nextjs.org/docs/app/getting-started/fonts
// Add to src/app/[locale]/layout.tsx

import { Heebo } from 'next/font/google'

const heebo = Heebo({
  subsets: ['latin', 'hebrew'],
  variable: '--font-heebo',
  display: 'swap', // Prevent FOIT
})

// In layout JSX:
// <html className={heebo.variable}>
// In Tailwind config or CSS:
// font-family: var(--font-heebo), system-ui, sans-serif
```

### Language Switcher Component
```typescript
// Source: https://next-intl.dev/docs/routing/navigation
// File: src/components/LanguageSwitcher.tsx

'use client'

import { usePathname, Link } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

export function LanguageSwitcher() {
  const pathname = usePathname()

  return (
    <div className="flex gap-2">
      {routing.locales.map((locale) => (
        <Link
          key={locale}
          href={pathname}
          locale={locale}
          className="px-2 py-1 rounded hover:bg-muted"
        >
          {locale === 'en' ? 'EN' : 'עב'}
        </Link>
      ))}
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| middleware.ts | proxy.ts | Next.js 16 (Dec 2025) | File rename, same functionality |
| getStaticPaths | generateStaticParams | Next.js 13 (App Router) | New naming in App Router |
| next-intl v3 `createSharedPathnamesNavigation` | next-intl v4 `createNavigation` | next-intl 4.0 | Simplified API |
| Manual locale prefix in ClerkProvider URLs | Same - still required | N/A | Must manually include locale |

**Deprecated/outdated:**
- `middleware.ts` filename: Renamed to `proxy.ts` in Next.js 16, but still works with deprecation warning
- `createSharedPathnamesNavigation`: Replaced by `createNavigation` in next-intl v4
- Edge runtime for middleware/proxy: No longer supported in Next.js 16's proxy.ts

## Open Questions

Things that couldn't be fully resolved:

1. **next.config.ts i18n configuration**
   - What we know: next-intl handles routing via middleware, not next.config
   - What's unclear: Whether any next.config changes are needed for Next.js 16
   - Recommendation: Start without next.config changes, add if needed

2. **Convex provider placement**
   - What we know: Currently in root layout, needs to move to locale layout
   - What's unclear: Any locale-specific Convex considerations
   - Recommendation: Move ConvexClientProvider inside locale layout, inside ClerkProvider

3. **Existing redirect rules**
   - What we know: Middleware will handle `/dashboard` -> `/en/dashboard` redirects
   - What's unclear: Any existing redirects in next.config or elsewhere
   - Recommendation: Audit for existing redirect logic before implementing

## Sources

### Primary (HIGH confidence)
- [next-intl App Router Setup](https://next-intl.dev/docs/getting-started/app-router/with-i18n-routing) - Complete setup guide
- [next-intl Middleware](https://next-intl.dev/docs/routing/middleware) - Middleware composition
- [next-intl Routing Configuration](https://next-intl.dev/docs/routing/configuration) - localePrefix options
- [Clerk Middleware Docs](https://clerk.com/docs/reference/nextjs/clerk-middleware) - Composition pattern
- [Radix DirectionProvider](https://www.radix-ui.com/primitives/docs/utilities/direction-provider) - RTL setup
- [Next.js 16 proxy.ts](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) - Middleware rename
- [Next.js Fonts](https://nextjs.org/docs/app/getting-started/fonts) - Font optimization

### Secondary (MEDIUM confidence)
- [Next.js Route Groups](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups) - Organizing routes
- [Heebo on Google Fonts](https://fonts.google.com/specimen/Heebo) - Font subsets info

### Tertiary (LOW confidence)
- Medium articles on Clerk + next-intl composition - Community patterns, verify against official docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official documentation from next-intl, Clerk, Radix
- Architecture: HIGH - Verified patterns from official sources
- Pitfalls: MEDIUM - Derived from documentation warnings and community discussions
- Code examples: HIGH - Directly from official documentation

**Research date:** 2026-01-19
**Valid until:** ~60 days (next-intl and Clerk are stable, patterns unlikely to change)
