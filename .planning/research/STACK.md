# Technology Stack: i18n + RTL Support

**Project:** REOS v1.4 Internationalization
**Researched:** 2026-01-19
**Overall Confidence:** HIGH

## Executive Summary

Adding internationalization with Hebrew/RTL support to your Next.js 15 App Router stack is well-supported with mature tooling. The key recommendation is **next-intl v4** for translation management and routing, combined with **Tailwind v4's native logical properties** for RTL layout. No additional RTL plugins are needed - Tailwind v4 and Radix UI have built-in RTL support.

## Recommended Stack

### Core i18n Library

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| **next-intl** | ^4.7.0 | Translation, routing, formatting | HIGH |

**Why next-intl:**
- Purpose-built for Next.js App Router (next-i18next does NOT support App Router)
- Native Server Component support
- ICU message syntax for complex formatting (plurals, dates, numbers)
- Built-in middleware for locale detection and URL routing
- TypeScript-first with strict locale typing in v4
- Composes cleanly with Clerk middleware (verified pattern)
- 931,000+ weekly downloads, 3,700+ GitHub stars

**Verified Clerk Integration Pattern:**
```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)
const isProtectedRoute = createRouteMatcher(['/(.*)/dashboard(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect()
  return intlMiddleware(req)
})
```

### RTL Support (No Additional Libraries Needed)

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| **Tailwind CSS v4** | ^4.0.0 (existing) | Logical properties for RTL | HIGH |
| **@radix-ui/react-direction** | ^1.1.1 | Global RTL context for Radix components | HIGH |

**Why no RTL plugin needed:**

Tailwind CSS v4 has native logical property utilities built-in:
- `ms-*` / `me-*` (margin-inline-start/end)
- `ps-*` / `pe-*` (padding-inline-start/end)
- `text-start` / `text-end`
- `float-start` / `float-end`
- `border-s-*` / `border-e-*`

These automatically flip based on `dir="rtl"` on the HTML element.

**Radix Direction Provider:**
Your Shadcn/ui components are built on Radix primitives. Radix has a DirectionProvider that enables RTL awareness across all primitives:

```typescript
import { DirectionProvider } from '@radix-ui/react-direction'

// In your root layout
<DirectionProvider dir={locale === 'he' ? 'rtl' : 'ltr'}>
  {children}
</DirectionProvider>
```

### Date/Number Formatting

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| **date-fns** | ^4.1.0 (existing) | Date formatting with Hebrew locale | HIGH |
| **Intl API** | Native | Number/currency formatting | HIGH |

**date-fns Hebrew locale:**
```typescript
import { he } from 'date-fns/locale/he'
import { format } from 'date-fns'

format(new Date(), 'PPP', { locale: he })
// Output: "19 בינואר 2026"
```

**Native Intl for currency (ILS):**
```typescript
new Intl.NumberFormat('he-IL', {
  style: 'currency',
  currency: 'ILS'
}).format(1234567)
// Output: "1,234,567.00 ₪"
```

next-intl wraps these APIs and integrates them with your translation messages via ICU syntax.

### Hebrew Font Support

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| **Heebo** or **Rubik** | Google Fonts | Hebrew-Latin typeface | HIGH |

**Recommended: Heebo** (extends Roboto to Hebrew - clean, modern)
**Alternative: Rubik** (geometric, rounded corners, slightly playful)

Both support the `hebrew` subset in next/font:

```typescript
import { Heebo } from 'next/font/google'

const heebo = Heebo({
  subsets: ['latin', 'hebrew'],
  variable: '--font-heebo',
})
```

## What NOT to Use

### DO NOT use next-i18next

| Library | Why Not |
|---------|---------|
| **next-i18next** | Does NOT support App Router. Built for Pages Router only. Maintainers recommend react-i18next or next-intl for App Router. |

The next-i18next library is explicitly not compatible with App Router. Using it will cause routing conflicts and 404 errors. The maintainers themselves recommend using react-i18next with App Router, but next-intl is the better choice for App Router because it handles the routing complexity natively.

### DO NOT use tailwindcss-rtl plugin

| Library | Why Not |
|---------|---------|
| **tailwindcss-rtl** | Unnecessary - Tailwind v4 has native logical property support |
| **tailwindcss-flip** | Unnecessary - use logical properties instead |

Tailwind v4 includes logical properties by default. Adding RTL plugins creates:
- Duplicate utilities
- Potential conflicts
- Larger bundle size
- Maintenance burden

### DO NOT use i18n config in next.config.js

| Approach | Why Not |
|----------|---------|
| `i18n` key in next.config.js | Deprecated for App Router. Causes routing issues and latency. Use middleware-based routing instead. |

## Installation

```bash
# Core i18n
npm install next-intl@^4.7.0

# RTL support for Radix components
npm install @radix-ui/react-direction@^1.1.1
```

No changes needed to existing dependencies:
- Tailwind v4 already has logical properties
- date-fns already installed (add Hebrew locale import)

## Required File Structure

```
src/
├── app/
│   └── [locale]/              # NEW: Dynamic locale segment
│       ├── layout.tsx         # Locale-aware root layout
│       ├── page.tsx
│       ├── (app)/             # Move existing route groups here
│       ├── (auth)/
│       └── (main)/
├── i18n/                      # NEW: i18n configuration
│   ├── routing.ts             # Locale/route config
│   ├── request.ts             # Server request config
│   └── navigation.ts          # Navigation wrappers
├── messages/                  # NEW: Translation files
│   ├── en.json
│   └── he.json
middleware.ts                  # UPDATE: Add next-intl middleware
```

## Integration Points with Existing Stack

### Clerk Authentication

Clerk middleware composes with next-intl middleware. The pattern is well-documented and verified:
1. Clerk middleware wraps the request
2. Returns next-intl middleware response
3. Protected routes use locale-aware matchers like `'/(.*)/dashboard(.*)'`

### Convex Backend

No changes needed. Convex is locale-agnostic. Translation happens at the UI layer.

### Shadcn/ui Components

Requires code migration to use logical properties:
- Replace `ml-*` with `ms-*`, `mr-*` with `me-*`
- Replace `pl-*` with `ps-*`, `pr-*` with `pe-*`
- Replace `text-left` with `text-start`, `text-right` with `text-end`
- Add `rtl:space-x-reverse` where `space-x-*` is used

This is a one-time migration of existing component code.

### next/font (Inter)

Current setup uses Inter with Latin subset. Update to include Hebrew font:
- Add Heebo font with hebrew + latin subsets
- Apply Hebrew font when locale is 'he'
- Keep Inter for English

## Configuration Summary

### next-intl Routing Config

```typescript
// src/i18n/routing.ts
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'he'],
  defaultLocale: 'en',
  localePrefix: 'always'  // URLs: /en/dashboard, /he/dashboard
})
```

### Middleware Integration

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)
const isProtectedRoute = createRouteMatcher([
  '/(en|he)/dashboard(.*)',
  '/(en|he)/properties(.*)',
  '/(en|he)/deals(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect()
  return intlMiddleware(req)
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

### Root Layout with RTL

```typescript
// src/app/[locale]/layout.tsx
import { DirectionProvider } from '@radix-ui/react-direction'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages = await getMessages()
  const dir = locale === 'he' ? 'rtl' : 'ltr'

  return (
    <html lang={locale} dir={dir}>
      <body>
        <DirectionProvider dir={dir}>
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </DirectionProvider>
      </body>
    </html>
  )
}
```

## TypeScript Requirements

next-intl v4 requires **TypeScript 5+** (your project already has ^5).

Type registration for strict locale typing:

```typescript
// src/types/next-intl.d.ts
import en from '../messages/en.json'

type Messages = typeof en

declare module 'next-intl' {
  interface AppConfig {
    Messages: Messages
    Locale: 'en' | 'he'
  }
}
```

## Version Compatibility Matrix

| Dependency | Required | Your Current | Status |
|------------|----------|--------------|--------|
| Next.js | 14+ | 16.1.1 | OK |
| React | 17+ | 19.2.3 | OK |
| TypeScript | 5+ | ^5 | OK |
| Tailwind CSS | 4.0+ | ^4 | OK |
| date-fns | 3+ | ^4.1.0 | OK |

## Effort Estimation

| Task | Complexity | Notes |
|------|------------|-------|
| Install dependencies | Low | 2 packages |
| Create i18n config files | Low | 3 files, boilerplate |
| Restructure app to [locale] | Medium | Move all routes under [locale] segment |
| Create translation files | Medium | Extract all UI strings to JSON |
| Migrate Shadcn components to logical properties | Medium | Search/replace patterns |
| Update middleware | Low | Compose with Clerk |
| Add Hebrew font | Low | Update next/font config |
| Test RTL layouts | Medium | Visual verification |

## Sources

### Official Documentation (HIGH confidence)
- [next-intl App Router Setup](https://next-intl.dev/docs/getting-started/app-router)
- [next-intl 4.0 Release](https://next-intl.dev/blog/next-intl-4-0)
- [next-intl Middleware](https://next-intl.dev/docs/routing/middleware)
- [Tailwind CSS v4 Margin](https://tailwindcss.com/docs/margin)
- [Tailwind CSS v4 Padding](https://tailwindcss.com/docs/padding)
- [Radix Direction Provider](https://www.radix-ui.com/primitives/docs/utilities/direction-provider)
- [Clerk Middleware Integration](https://clerk.com/docs/reference/nextjs/clerk-middleware)
- [date-fns i18n](https://github.com/date-fns/date-fns/blob/main/docs/i18n.md)
- [Heebo Font - Google Fonts](https://fonts.google.com/specimen/Heebo)
- [Rubik Font - Google Fonts](https://fonts.google.com/specimen/Rubik?subset=hebrew)

### Community Sources (MEDIUM confidence)
- [next-intl Guide 2025](https://www.buildwithmatija.com/blog/nextjs-internationalization-guide-next-intl-2025)
- [Best i18n Libraries for App Router 2025](https://medium.com/better-dev-nextjs-react/the-best-i18n-libraries-for-next-js-app-router-in-2025-21cb5ab2219a)
- [Shadcn RTL Support Discussion](https://github.com/shadcn-ui/ui/issues/2759)
- [Flowbite RTL Guide](https://flowbite.com/docs/customize/rtl/)
