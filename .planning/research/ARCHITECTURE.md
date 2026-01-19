# Architecture Patterns: i18n + RTL for Next.js 15 App Router

**Domain:** Internationalization and RTL support for existing Next.js 15 application
**Researched:** 2026-01-19
**Overall confidence:** HIGH

## Executive Summary

Integrating i18n and RTL into the existing REOS codebase requires a **locale-segment architecture** where all routes are nested under a `[locale]` dynamic segment. This approach works seamlessly with Next.js 15 App Router while preserving the existing route group structure `(app)`, `(auth)`, `(main)`.

The key architectural changes are:
1. Add `[locale]` segment wrapping all route groups
2. Compose next-intl middleware with existing Clerk middleware
3. Wrap application with `DirectionProvider` for RTL-aware Radix/Shadcn components
4. Convert Tailwind physical properties (`ml-`, `mr-`) to logical properties (`ms-`, `me-`)

## Recommended Architecture

### File Structure Changes

**Current Structure:**
```
src/
  app/
    layout.tsx          # Root layout with ClerkProvider
    globals.css
    (app)/
      layout.tsx        # AppShell wrapper with auth checks
      dashboard/
      properties/
      deals/
      ...
    (auth)/
      layout.tsx
      sign-in/
      sign-up/
    (main)/
      layout.tsx
      page.tsx          # Landing page
```

**Target Structure:**
```
src/
  app/
    layout.tsx          # Minimal root: html, body, globals only
    globals.css
    [locale]/           # NEW: Dynamic locale segment
      layout.tsx        # LocaleLayout: ClerkProvider, NextIntlProvider, DirectionProvider
      (app)/
        layout.tsx      # AppShell (unchanged internally)
        dashboard/
        properties/
        deals/
        ...
      (auth)/
        layout.tsx
        sign-in/
        sign-up/
      (main)/
        layout.tsx
        page.tsx
  i18n/
    routing.ts          # NEW: Locale configuration
    request.ts          # NEW: Server request config
messages/
  en.json               # NEW: English translations
  he.json               # NEW: Hebrew translations
middleware.ts           # MODIFIED: Compose Clerk + next-intl
```

### Component Architecture

```
                    Root Layout (src/app/layout.tsx)
                           |
                    ┌──────┴──────┐
                    │   <html>    │  lang/dir set dynamically
                    │   <body>    │
                    └──────┬──────┘
                           |
                    LocaleLayout ([locale]/layout.tsx)
                           |
            ┌──────────────┼──────────────┐
            │              │              │
      ClerkProvider  NextIntlProvider  DirectionProvider
            │              │              │
            └──────────────┼──────────────┘
                           |
              ┌────────────┼────────────┐
              │            │            │
         (app)/       (auth)/       (main)/
              │            │            │
         AppShell     AuthLayout   MainLayout
```

## Middleware Composition Pattern

**CRITICAL:** Clerk and next-intl must be composed in the correct order. Clerk's `clerkMiddleware` allows chaining by returning another middleware's response.

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n/routing";

// Create the intl middleware
const intlMiddleware = createIntlMiddleware(routing);

// Define protected routes (same as current matcher logic)
const isProtectedRoute = createRouteMatcher([
  "/:locale/dashboard(.*)",
  "/:locale/properties(.*)",
  "/:locale/deals(.*)",
  "/:locale/chat(.*)",
  "/:locale/settings(.*)",
  "/:locale/profile(.*)",
  // ... all (app) routes
]);

// Public routes that don't need auth
const isPublicRoute = createRouteMatcher([
  "/:locale",
  "/:locale/sign-in(.*)",
  "/:locale/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect authenticated routes
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // Always run intl middleware to handle locale routing
  return intlMiddleware(req);
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

**Source:** [Clerk Middleware Documentation](https://clerk.com/docs/reference/nextjs/clerk-middleware), [GitHub Discussion on Middleware Composition](https://github.com/vercel/next.js/discussions/63736)

## Data Flow for Locale Context

### Server-Side Flow

```
Request → Middleware (detect/redirect locale) →
  [locale]/layout.tsx (extract locale from params) →
    NextIntlClientProvider (messages for locale) →
      Server Components (getTranslations)
```

### Client-Side Flow

```
NextIntlClientProvider → useTranslations() hook →
  React context for locale + messages →
    Client Components read translations
```

### RTL Direction Flow

```
[locale]/layout.tsx →
  Determine direction from locale (he → rtl, en → ltr) →
    Set html dir attribute →
      DirectionProvider (Radix) →
        All Shadcn/Radix components respect direction
```

## Layout Configurations

### Root Layout (Minimal)

```typescript
// src/app/layout.tsx
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Minimal root - locale layout handles everything else
  return children;
}
```

### Locale Layout

```typescript
// src/app/[locale]/layout.tsx
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { DirectionProvider } from "@radix-ui/react-direction";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { ConvexClientProvider } from "../ConvexClientProvider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

// Type for supported locales
type Locale = (typeof routing.locales)[number];

// Validate locale
function isValidLocale(locale: string): locale is Locale {
  return routing.locales.includes(locale as Locale);
}

// Get direction from locale
function getDirection(locale: Locale): "ltr" | "rtl" {
  return locale === "he" ? "rtl" : "ltr";
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!isValidLocale(locale)) {
    notFound();
  }

  const direction = getDirection(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} dir={direction}>
      <body className={inter.className}>
        <ClerkProvider
          signInUrl={`/${locale}/sign-in`}
          signUpUrl={`/${locale}/sign-up`}
          signInFallbackRedirectUrl={`/${locale}/dashboard`}
          signUpFallbackRedirectUrl={`/${locale}/dashboard`}
        >
          <NextIntlClientProvider messages={messages}>
            <DirectionProvider dir={direction}>
              <ConvexClientProvider>
                {children}
              </ConvexClientProvider>
              <Toaster position={direction === "rtl" ? "bottom-left" : "bottom-right"} />
            </DirectionProvider>
          </NextIntlClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
```

### i18n Routing Configuration

```typescript
// src/i18n/routing.ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "he"],
  defaultLocale: "en",
  localePrefix: "always", // URLs always include locale: /en/dashboard, /he/dashboard
});
```

### Request Configuration

```typescript
// src/i18n/request.ts
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  // Get locale from request (set by middleware)
  let locale = await requestLocale;

  // Validate and fallback
  if (!locale || !routing.locales.includes(locale as typeof routing.locales[number])) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
```

## RTL Integration with Tailwind v4

### Tailwind v4 Logical Properties (Already Supported)

Tailwind v4 outputs logical properties by default for spacing utilities:
- `mx-6` outputs `margin-inline: calc(var(--spacing) * 6);`
- This automatically flips for RTL

**Source:** [Tailwind CSS v4.0 Release](https://tailwindcss.com/blog/tailwindcss-v4)

### Classes Requiring Conversion

The following patterns in existing code must be converted:

| Physical Property | Logical Property | Notes |
|-------------------|------------------|-------|
| `ml-*` | `ms-*` | margin-inline-start |
| `mr-*` | `me-*` | margin-inline-end |
| `pl-*` | `ps-*` | padding-inline-start |
| `pr-*` | `pe-*` | padding-inline-end |
| `left-*` | `start-*` | inset-inline-start |
| `right-*` | `end-*` | inset-inline-end |
| `text-left` | `text-start` | text-align |
| `text-right` | `text-end` | text-align |
| `border-l-*` | `border-s-*` | border-inline-start |
| `border-r-*` | `border-e-*` | border-inline-end |
| `rounded-l-*` | `rounded-s-*` | border-start-radius |
| `rounded-r-*` | `rounded-e-*` | border-end-radius |

### RTL-Specific Overrides

For cases where physical direction IS intentional:

```css
/* Use rtl: and ltr: variants for intentional physical positioning */
<div className="ltr:left-0 rtl:right-0">
```

### Icons That Need Flipping

Directional icons (arrows, chevrons) should flip in RTL:

```typescript
// Create a utility component
function DirectionalIcon({
  icon: Icon,
  className
}: {
  icon: LucideIcon;
  className?: string;
}) {
  return (
    <Icon className={cn("rtl:scale-x-[-1]", className)} />
  );
}

// Usage
<DirectionalIcon icon={ChevronRight} />  // Flips to ChevronLeft in RTL
```

## Shadcn/Radix RTL Handling

### DirectionProvider Integration

Radix UI components automatically respect the `dir` attribute through `DirectionProvider`:

```typescript
import { DirectionProvider } from "@radix-ui/react-direction";

// In layout
<DirectionProvider dir={direction}>
  {/* All Radix/Shadcn components inside will respect RTL */}
</DirectionProvider>
```

**Source:** [Radix UI Direction Provider](https://www.radix-ui.com/primitives/docs/utilities/direction-provider)

### Shadcn Components Requiring Manual Fixes

Some Shadcn components use physical properties. These need patching in `src/components/ui/`:

**sidebar.tsx** - Already uses `side="left"` prop, needs RTL handling:
```typescript
// Current
side === "left"
  ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
  : "right-0 ..."

// Should use
side === "left"
  ? "start-0 group-data-[collapsible=offcanvas]:start-[calc(var(--sidebar-width)*-1)]"
  : "end-0 ..."
```

**sheet.tsx** - Position-based styling needs logical properties

**dropdown-menu.tsx** - Alignment positioning

**Estimated effort:** Review and patch ~15-20 Shadcn components

## Component Wrapper Patterns

### Translation Hook Pattern

```typescript
// Server Component
import { getTranslations } from "next-intl/server";

export default async function Dashboard() {
  const t = await getTranslations("Dashboard");

  return (
    <h1>{t("title")}</h1>
  );
}

// Client Component
"use client";
import { useTranslations } from "next-intl";

export function DashboardStats() {
  const t = useTranslations("Dashboard");

  return (
    <span>{t("stats.properties")}</span>
  );
}
```

### Formatting Pattern

```typescript
import { useFormatter, useLocale } from "next-intl";

function PropertyPrice({ price }: { price: number }) {
  const format = useFormatter();
  const locale = useLocale();

  // Automatically uses locale-appropriate formatting
  return (
    <span>
      {format.number(price, {
        style: "currency",
        currency: locale === "he" ? "ILS" : "USD"
      })}
    </span>
  );
}

function PropertyDate({ date }: { date: Date }) {
  const format = useFormatter();

  return (
    <span>
      {format.dateTime(date, {
        dateStyle: "medium"
      })}
    </span>
  );
}
```

### Link Wrapper for Locale-Aware Navigation

```typescript
// src/components/LocaleLink.tsx
import { Link } from "@/i18n/navigation";

// next-intl provides a locale-aware Link
export { Link as LocaleLink };

// Usage - locale is automatically prepended
<LocaleLink href="/dashboard">Dashboard</LocaleLink>
// Renders: /en/dashboard or /he/dashboard based on current locale
```

## Suggested Build Order (Phase Dependencies)

Based on the architecture, phases should be built in this order:

### Phase 1: Core i18n Infrastructure
**Prerequisites:** None
**Creates:** Foundation for all other phases

1. Install next-intl
2. Create routing.ts and request.ts
3. Create message files structure (en.json, he.json with minimal content)
4. Restructure app directory to add `[locale]` segment
5. Update middleware.ts to compose Clerk + next-intl
6. Create LocaleLayout with providers

**Testing:** Routes work with /en/ and /he/ prefixes, middleware redirects correctly

### Phase 2: RTL Foundation
**Prerequisites:** Phase 1 complete
**Creates:** RTL layout support

1. Install @radix-ui/react-direction
2. Add DirectionProvider to LocaleLayout
3. Update html element with dynamic dir attribute
4. Create RTL utility classes/components

**Testing:** Page direction flips when switching locales

### Phase 3: Shadcn Component RTL Audit
**Prerequisites:** Phase 2 complete
**Creates:** RTL-safe component library

1. Audit all src/components/ui/*.tsx files
2. Convert physical properties to logical properties
3. Test each component in RTL mode
4. Create DirectionalIcon utility for arrow/chevron icons

**Testing:** All UI components render correctly in both directions

### Phase 4: AppShell RTL
**Prerequisites:** Phase 3 complete
**Creates:** RTL-aware navigation

1. Update Sidebar.tsx for RTL
2. Update AppShell.tsx header for RTL
3. Update breadcrumbs for RTL
4. Update mobile navigation for RTL

**Testing:** Full app shell works in RTL

### Phase 5: Translation Extraction
**Prerequisites:** Phase 4 complete
**Creates:** Translatable UI

1. Extract all static strings from components
2. Organize translations by namespace (Navigation, Dashboard, Properties, etc.)
3. Create Hebrew translations
4. Update components to use useTranslations/getTranslations

**Testing:** All UI text displays in selected locale

### Phase 6: Formatting Integration
**Prerequisites:** Phase 5 complete
**Creates:** Locale-aware data display

1. Replace date formatting with useFormatter
2. Replace number formatting with useFormatter
3. Replace currency formatting with useFormatter
4. Update Clerk localization

**Testing:** Dates, numbers, and currency display correctly per locale

### Phase 7: Language Switcher & Persistence
**Prerequisites:** Phase 6 complete
**Creates:** User-facing locale control

1. Create language switcher component
2. Add to AppShell header
3. Implement locale persistence (cookie or user preference in Convex)
4. Handle locale detection for new visitors

**Testing:** Users can switch languages, preference persists

## Anti-Patterns to Avoid

### Anti-Pattern 1: Separate Middleware Files
**What:** Creating separate middleware for i18n and auth
**Why bad:** Next.js only supports one middleware.ts file
**Instead:** Compose middlewares using Clerk's callback pattern

### Anti-Pattern 2: Inline String Translations
**What:** Hardcoding translated strings in components
**Why bad:** Makes translation extraction impossible, duplicates content
**Instead:** Always use translation keys with useTranslations

### Anti-Pattern 3: Physical Properties for Layout
**What:** Using `ml-4` instead of `ms-4` for layout spacing
**Why bad:** Breaks RTL layout
**Instead:** Always use logical properties for layout-related spacing

### Anti-Pattern 4: Conditional RTL Classes
**What:** `className={isRtl ? "text-right" : "text-left"}`
**Why bad:** Verbose, error-prone, doesn't use CSS direction
**Instead:** Use `text-start` / `text-end` which respect direction automatically

### Anti-Pattern 5: Skipping DirectionProvider
**What:** Only setting html dir attribute without DirectionProvider
**Why bad:** Radix components won't respect RTL for popovers, menus, tooltips
**Instead:** Always wrap with DirectionProvider for Radix-based components

## Font Considerations for Hebrew

### Current Font Stack
The project uses Inter for sans-serif. Inter has limited Hebrew support.

### Recommended Approach

```typescript
// Option 1: Use a system font stack for Hebrew
const fontFamily = locale === "he"
  ? "'Heebo', 'Rubik', system-ui, sans-serif"
  : "'Inter', system-ui, sans-serif";

// Option 2: Load Heebo/Rubik alongside Inter
import { Inter, Heebo } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const heebo = Heebo({ subsets: ["hebrew", "latin"], variable: "--font-heebo" });

// Apply based on locale
<body className={locale === "he" ? heebo.variable : inter.variable}>
```

**Recommended fonts for Hebrew:**
- **Heebo** - Modern, clean, excellent for UI
- **Rubik** - Geometric, works well for both Latin and Hebrew
- **Assistant** - Friendly, readable at small sizes

## Convex Data Layer Considerations

### User Locale Preference Storage

```typescript
// convex/schema.ts - Add to users table
localePreference: v.optional(v.union(v.literal("en"), v.literal("he"))),
```

### Translatable Content Pattern (Future)

For user-generated content that needs translation:

```typescript
// Pattern for translatable fields
const i18nString = v.object({
  en: v.string(),
  he: v.optional(v.string()),
});

// Usage in schema
defineTable({
  title: i18nString,
  description: i18nString,
})
```

**Note:** For v1.4, focus on UI translation. Content translation is a separate concern.

## Sources

- [next-intl App Router Documentation](https://next-intl.dev/docs/getting-started/app-router)
- [Next.js Internationalization Guide](https://nextjs.org/docs/app/guides/internationalization)
- [Clerk Middleware Documentation](https://clerk.com/docs/reference/nextjs/clerk-middleware)
- [Tailwind CSS v4.0 Release - Logical Properties](https://tailwindcss.com/blog/tailwindcss-v4)
- [Radix UI Direction Provider](https://www.radix-ui.com/primitives/docs/utilities/direction-provider)
- [GitHub: Combining Clerk + next-intl Middleware](https://github.com/vercel/next.js/discussions/63736)
- [Shadcn UI RTL Issues](https://github.com/shadcn-ui/ui/issues/6493)
- [Clerk Localization](https://clerk.com/docs/guides/customizing-clerk/localization)
