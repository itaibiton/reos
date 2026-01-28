# Architecture: Conversion Pages Integration

**Project:** REOS v1.8 - Conversion & Essential Pages
**Researched:** 2026-01-28
**Confidence:** HIGH (based on direct codebase analysis of all referenced files)

## Existing Architecture Overview

The REOS codebase uses Next.js 15 App Router with three route groups under `[locale]`:

```
src/app/[locale]/
  layout.tsx                 -- Root: Clerk + Convex + NextIntl + ThemeProvider
  Providers.tsx              -- ThemeProvider + DirectionProvider + NextIntlClientProvider
  ConvexClientProvider.tsx   -- ConvexProviderWithClerk

  (main)/                    -- Public marketing pages (landing)
    layout.tsx               -- "use client": Navigation + Footer, forces light theme
    page.tsx                 -- Landing page (Hero, SocialProof, Features, Automation,
                                Testimonials, Stats, CTA)

  (app)/                     -- Authenticated app pages
    layout.tsx               -- Auth guard + AppShell (sidebar, bottom tabs)
    dashboard/page.tsx
    providers/page.tsx       -- Provider directory (authenticated)
    providers/[id]/page.tsx  -- Provider profile (authenticated)
    [40+ other routes]

  (auth)/                    -- Auth pages
    layout.tsx               -- Minimal wrapper (just children)
    sign-in/[[...sign-in]]/page.tsx
    sign-up/[[...sign-up]]/page.tsx
```

### Key Architectural Patterns

**Route Groups:** Next.js route groups `(main)`, `(app)`, `(auth)` share the locale layout but have different sub-layouts. New conversion pages that are public (no auth required) belong in `(main)`.

**Locale Routing:** All routes prefixed with `[locale]` (en/he). Routing config uses `localePrefix: 'always'`, meaning URLs are always `/en/...` or `/he/...`.

**Middleware Protection:** `middleware.ts` explicitly lists protected routes. The protection model is allowlist-based -- only routes matching the patterns require auth. The middleware currently protects `"/:locale/providers(.*)"` among others.

**Layout Composition:**
- `(main)/layout.tsx` is a `"use client"` component that renders `<Navigation />` + `<main>` + `<Footer />`
- It forces light theme via `useEffect` (removes dark class, sets colorScheme to "light")
- All new conversion pages placed under `(main)` automatically get Navigation + Footer

**Translation Pattern:** All landing components use `useTranslations("landing.section")` with structured keys in `messages/en.json` and `messages/he.json`.

**Animation Pattern:** Every landing section uses Framer Motion with a consistent `fadeInUp` variant:
```typescript
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
```

**Styling Pattern:** Consistent use of:
- Section wrapper: `py-24 relative overflow-hidden`
- Container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- Headings: `text-3xl md:text-5xl font-light tracking-tighter text-foreground`
- Accent text: `text-foreground/40`
- Body text: `text-lg text-foreground/50 font-light leading-relaxed`

---

## Integration Architecture for New Pages

### Route Structure

```
src/app/[locale]/(main)/
  page.tsx                           -- MODIFY: Add FAQ + HowItWorks sections
  pricing/page.tsx                   -- NEW ROUTE: /en/pricing
  contact/page.tsx                   -- NEW ROUTE: /en/contact
  privacy/page.tsx                   -- NEW ROUTE: /en/privacy
  terms/page.tsx                     -- NEW ROUTE: /en/terms
  services/
    [type]/page.tsx                  -- NEW DYNAMIC ROUTE: /en/services/brokers, etc.
```

All new routes sit inside the `(main)/` route group. This means:
1. They automatically get `Navigation` + `Footer` from the existing layout
2. They are forced to light theme
3. They are public (no auth required)
4. They get full i18n support from the root locale layout
5. They get Convex client access (for the contact form)

### URL Path Decision: /services/[type] NOT /providers/[type]

The middleware currently protects `"/:locale/providers(.*)"` because the authenticated app has provider pages at `(app)/providers/page.tsx` and `(app)/providers/[id]/page.tsx`. Since Next.js route groups are invisible in URLs, both `(main)/providers/[type]` and `(app)/providers/[id]` would resolve to `/:locale/providers/...` and the middleware would require auth for the public marketing pages.

**Recommendation: Use `/services/[type]` for public provider landing pages.** This cleanly separates marketing pages from the authenticated provider directory, avoids middleware conflicts, and is more descriptive from a URL perspective.

If the team strongly prefers `/providers/[type]`, the alternative is to refine the middleware matcher -- but this is fragile and not recommended.

### No Middleware Changes Needed

With the `/services/[type]` path, no middleware changes are required. The existing middleware does not protect `/:locale/services(.*)`, `/:locale/pricing(.*)`, `/:locale/contact(.*)`, `/:locale/privacy(.*)`, or `/:locale/terms(.*)`.

---

## Component Architecture

### New Component Organization

```
src/components/newlanding/
  index.ts                  -- MODIFY: Add new exports

  -- EXISTING (unchanged) --
  Hero.tsx
  SocialProof.tsx
  Features.tsx
  Automation.tsx
  Testimonials.tsx
  Stats.tsx
  CTA.tsx

  -- EXISTING (modify links) --
  Navigation.tsx            -- MODIFY: Update href="#" to real routes
  Footer.tsx                -- MODIFY: Update href="#" to real routes

  -- NEW LANDING SECTIONS --
  FAQ.tsx                   -- Accordion-based FAQ section for landing page
  HowItWorks.tsx            -- Step-by-step process flow section for landing page

  -- NEW PAGE-SPECIFIC COMPONENTS --
  pricing/
    PricingTiers.tsx        -- Tier cards with feature comparison
    PricingToggle.tsx       -- Monthly/annual toggle (client component)
    PricingFAQ.tsx          -- Pricing-specific FAQ
  contact/
    ContactForm.tsx         -- Form with react-hook-form + zod validation
    ContactInfo.tsx         -- Address, phone, email display
  legal/
    LegalContent.tsx        -- Reusable long-form content renderer
  services/
    ServiceHero.tsx         -- Dynamic hero per provider type
    ServiceFeatures.tsx     -- Benefits/features per provider type
    ServiceCTA.tsx          -- Type-specific CTA
    ServiceTestimonials.tsx -- Type-specific testimonials
```

### Landing Page Composition (Modified)

Current landing page order:
```tsx
<Hero />
<SocialProof />
<Features />
<Automation />
<Testimonials />
<Stats />
<CTA />
```

Recommended new order:
```tsx
<Hero />
<SocialProof />
<Features />
<HowItWorks />       // NEW: Between Features and Automation
<Automation />
<Testimonials />
<Stats />
<FAQ />               // NEW: Before CTA, answers objections before the ask
<CTA />
```

**Rationale for placement:**
- `HowItWorks` after `Features` because it explains the process after showing capabilities
- `FAQ` before `CTA` because it resolves objections right before the conversion ask

---

## Data Flow

```
Translation JSON files (messages/en.json, messages/he.json)
         |
         v
+----------------------------------+
|  [locale] Layout                 |
|  Clerk + Convex + NextIntl       |
+----------------------------------+
         |
+----------------------------------+
|  (main) Layout                   |
|  Navigation + Footer + Light     |
+----------------------------------+
         |
    +----+----+-----+------+------+------+
    |    |    |     |      |      |
Landing Pricing Contact Privacy Terms Services/[type]
(page)
    |
  +FAQ
  +HowItWorks
                |
          Contact Form
          submits to
          Convex mutation
          (public, no auth)
```

### Data Requirements by Page

| Page | Data Source | Rendering | Backend Needed |
|------|-----------|-----------|----------------|
| FAQ section | Translation JSON | Client (accordion interactions) | No |
| HowItWorks section | Translation JSON | Client (animations) | No |
| Pricing | Translation JSON | Server page + client toggle | No |
| Privacy | Translation JSON or MDX | Server (no interactivity) | No |
| Terms | Translation JSON or MDX | Server (no interactivity) | No |
| Contact | Translation JSON + Convex | Client (form + submission) | Yes -- new table + mutation |
| Services/[type] | Translation JSON | Server page + client animations | No |

---

## Backend Changes: Contact Form Only

The contact page is the ONLY new page requiring backend integration.

### New Convex Table

```typescript
// convex/schema.ts -- add to existing schema
contactSubmissions: defineTable({
  name: v.string(),
  email: v.string(),
  subject: v.optional(v.string()),
  message: v.string(),
  locale: v.string(),
  status: v.union(
    v.literal("new"),
    v.literal("read"),
    v.literal("replied")
  ),
  submittedAt: v.number(),
})
  .index("by_status", ["status"])
  .index("by_submitted", ["submittedAt"]),
```

### New Convex Mutation

```typescript
// convex/contactSubmissions.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const submit = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.optional(v.string()),
    message: v.string(),
    locale: v.string(),
  },
  handler: async (ctx, args) => {
    // No auth required -- public form
    await ctx.db.insert("contactSubmissions", {
      ...args,
      status: "new",
      submittedAt: Date.now(),
    });
  },
});
```

**No auth required.** This is a public form. Consider simple spam prevention:
- Honeypot field (hidden input that bots fill)
- Basic rate limiting (check for recent submissions from same email)
- Client-side validation with zod (already in dependencies)

### Client Form Stack

All dependencies already exist in the project:
- `react-hook-form` (v7.71.0) -- form state management
- `zod` (v4.3.5) -- schema validation
- `@hookform/resolvers` (v5.2.2) -- zod resolver for react-hook-form
- Shadcn `Form`, `Input`, `Textarea`, `Button` components -- all present in `src/components/ui/`

---

## Translation Structure

New keys to add to `messages/en.json` and `messages/he.json`:

```json
{
  "landing": {
    "faq": {
      "heading": "Frequently Asked Questions",
      "headingAccent": "Answered",
      "items": {
        "q1": { "question": "...", "answer": "..." },
        "q2": { "question": "...", "answer": "..." }
      }
    },
    "howItWorks": {
      "heading": "How It Works",
      "headingAccent": "Step by Step",
      "steps": {
        "step1": { "title": "...", "description": "...", "detail": "..." },
        "step2": { "title": "...", "description": "...", "detail": "..." }
      }
    }
  },
  "pricing": {
    "heading": "...",
    "subheading": "...",
    "toggle": { "monthly": "Monthly", "annual": "Annual" },
    "tiers": {
      "investor": { "name": "...", "price": "...", "features": ["..."] },
      "broker": { "name": "...", "price": "...", "features": ["..."] },
      "agency": { "name": "...", "price": "...", "features": ["..."] }
    },
    "faq": { ... }
  },
  "contact": {
    "heading": "...",
    "form": {
      "name": "...", "email": "...", "subject": "...",
      "message": "...", "submit": "...", "success": "...", "error": "..."
    },
    "info": { "address": "...", "email": "...", "phone": "..." }
  },
  "legal": {
    "privacy": {
      "title": "Privacy Policy",
      "lastUpdated": "...",
      "sections": { ... }
    },
    "terms": {
      "title": "Terms of Service",
      "lastUpdated": "...",
      "sections": { ... }
    }
  },
  "services": {
    "common": {
      "cta": { ... },
      "howItWorks": { ... }
    },
    "brokers": {
      "hero": { "heading": "...", "subheading": "..." },
      "features": [ ... ],
      "testimonials": [ ... ]
    },
    "lawyers": { ... },
    "mortgageAdvisors": { ... },
    "appraisers": { ... },
    "taxConsultants": { ... },
    "accountants": { ... }
  }
}
```

### Legal Content Approach

For privacy policy and terms of service, the translation JSON approach works if content is structured as sections with headings and body paragraphs. However, these documents tend to be very long.

**Recommended approach:** Store legal content as structured JSON sections in translations. Each section has a `title` and `content` (or array of paragraphs). The `LegalContent.tsx` component renders them. This keeps the i18n pattern consistent and avoids introducing MDX tooling for just two pages.

```json
"privacy": {
  "title": "Privacy Policy",
  "lastUpdated": "January 2026",
  "sections": [
    {
      "title": "Information We Collect",
      "content": ["Paragraph 1...", "Paragraph 2..."]
    },
    {
      "title": "How We Use Your Information",
      "content": ["Paragraph 1..."]
    }
  ]
}
```

---

## Navigation & Footer Link Updates

### Navigation.tsx Current State

All links currently use `href="#"` (placeholder anchors). The navigation has:
- **Platform dropdown:** Property Management, Automation Engine, Enterprise Security
- **Solutions dropdown:** Residential, Commercial, Industrial
- **Simple links:** Institutions, Developers
- **Actions:** Log in, Get Started

**Changes needed:**
1. Update "Log in" to link to `/sign-in`
2. Update "Get Started" to link to `/sign-up`
3. Add "Pricing" as a simple nav link
4. Consider adding "Contact" link
5. Wire dropdown items to relevant sections or pages
6. **Use `Link` from `@/i18n/navigation`** instead of raw `<a>` tags for locale-aware routing

### Footer.tsx Current State

Footer has four link columns, all with `href="#"`:
- **Product:** Platform, Data API, Workflows, Security
- **Solutions:** Residential, Commercial, Industrial
- **Company:** About, Careers, Blog, Contact
- **Legal:** Privacy, Terms, SLA

**Changes needed:**
1. Update "Contact" href to `/contact`
2. Update "Privacy" href to `/privacy`
3. Update "Terms" href to `/terms`
4. Wire other links as they become real pages
5. **Use `Link` from `@/i18n/navigation`** instead of raw `<a>` tags

### CTA.tsx Current State

CTA buttons use `<button>` elements with no navigation:
- "Contact Sales" -- should link to `/contact`
- "View Pricing" -- should link to `/pricing`

**Change to `Link` components** with appropriate hrefs.

---

## Existing UI Components to Reuse

| Component | Source | Use In New Pages |
|-----------|--------|-----------------|
| `Accordion` | `src/components/ui/accordion.tsx` | FAQ section, Pricing FAQ |
| `Card` | `src/components/ui/card.tsx` | Pricing tiers, service features |
| `Button` | `src/components/ui/button.tsx` | CTA buttons, form submit |
| `Input` | `src/components/ui/input.tsx` | Contact form fields |
| `Textarea` | `src/components/ui/textarea.tsx` | Contact form message |
| `Label` | `src/components/ui/label.tsx` | Contact form labels |
| `Form` | `src/components/ui/form.tsx` | Contact form validation wrapper |
| `Badge` | `src/components/ui/badge.tsx` | Pricing tier labels ("Popular") |
| `Separator` | `src/components/ui/separator.tsx` | Legal page section dividers |
| `Carousel` | `src/components/ui/carousel.tsx` | Service testimonials (matches Testimonials.tsx pattern) |
| `Tabs` | `src/components/ui/tabs.tsx` | Pricing toggle (monthly/annual) |

---

## Server Components vs Client Components

| Page/Component | Recommendation | Rationale |
|----------------|---------------|-----------|
| FAQ section | Client | Uses Accordion (interactive), follows landing pattern |
| HowItWorks section | Client | Animated with Framer Motion |
| Pricing page.tsx | Server | Export metadata, render server-side |
| PricingTiers | Client | Toggle interaction for monthly/annual |
| PricingFAQ | Client | Accordion interaction |
| Privacy page.tsx | Server | Static content, great for SEO |
| Terms page.tsx | Server | Static content, great for SEO |
| Contact page.tsx | Server | Export metadata |
| ContactForm | Client | Form state, Convex mutation |
| Services/[type] page.tsx | Server | Export metadata, generateStaticParams |
| ServiceHero | Client | Framer Motion animations |

**Legal pages are the best candidates for full Server Components.** They are long-form text with zero interactivity. Server rendering is optimal for SEO.

---

## SEO Considerations

### Metadata Per Page

Each new page should export proper metadata:

```typescript
// src/app/[locale]/(main)/pricing/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing - REOS",
  description: "Explore REOS pricing plans...",
};
```

### Static Generation for Services Pages

```typescript
// src/app/[locale]/(main)/services/[type]/page.tsx
export function generateStaticParams() {
  return [
    { type: "brokers" },
    { type: "lawyers" },
    { type: "mortgage-advisors" },
    { type: "appraisers" },
    { type: "tax-consultants" },
    { type: "accountants" },
  ];
}
```

### FAQ Structured Data

Consider adding JSON-LD for Google FAQ rich results on the landing page:

```typescript
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [...]
}
</script>
```

---

## Recommended Build Order

Based on dependencies and progressive complexity:

### Phase 1: Landing Page Sections (No New Routes)
1. **FAQ section** -- Self-contained accordion component, add to landing page
2. **HowItWorks section** -- Self-contained step-flow component, add to landing page
3. **Update `page.tsx`** -- Insert new sections into landing page composition
4. **Update `index.ts`** -- Add new exports to barrel file

**Rationale:** Lowest risk. No new routes, no backend changes. Just add components to the existing page. Tests the translation and animation patterns.

### Phase 2: Static Pages (New Routes, No Backend)
5. **Legal pages** (`/privacy`, `/terms`) -- Server-rendered, minimal components
6. **Pricing page** (`/pricing`) -- Mostly static, optional monthly/annual toggle

**Rationale:** New routes but no backend integration. Validates the route group structure works correctly for additional pages.

### Phase 3: Dynamic Pages (New Routes, Backend for Contact)
7. **Services pages** (`/services/[type]`) -- Dynamic routes with `generateStaticParams`
8. **Contact page** (`/contact`) -- Needs new Convex table + mutation + form

**Rationale:** Contact page is the only one needing backend work. Services pages are content-heavy but structurally simple.

### Phase 4: Navigation Wiring
9. **Update Navigation.tsx** -- Wire menu items to real routes using locale-aware `Link`
10. **Update Footer.tsx** -- Wire company/legal links to real routes
11. **Update CTA.tsx** -- Wire "Contact Sales" and "View Pricing" buttons
12. **Cross-page CTA links** -- Ensure all pages link to each other (pricing links to contact, services link to sign-up, etc.)

**Rationale:** Do linking last so all target pages exist first. Avoids broken links during development.

---

## Anti-Patterns to Avoid

### 1. Do NOT put conversion pages in `(app)` route group
The `(app)` layout requires authentication and renders the AppShell (sidebar, bottom tabs). Conversion pages must be public and use the marketing layout (Navigation + Footer).

### 2. Do NOT use `(main)/providers/[type]` URL path
This collides with the authenticated `(app)/providers/` route and the middleware protection pattern for `"/:locale/providers(.*)"`. Use `/services/[type]` instead.

### 3. Do NOT make the Contact form authenticated
Contact forms should be publicly accessible. Use rate limiting and honeypot fields for spam prevention, not auth guards.

### 4. Do NOT break the light theme enforcement
The `(main)` layout forces light theme. New components should use `text-foreground` / `bg-background` semantic tokens, not hardcoded dark/light colors -- unless intentionally using the dark-section pattern (like Automation's `bg-[#050A12]`).

### 5. Do NOT add new npm dependencies
Everything needed is already in the project: react-hook-form, zod, @hookform/resolvers, Shadcn components, Framer Motion, next-intl. No new packages are required for any conversion page.

### 6. Do NOT store massive legal text in translation JSON
Structure legal content as arrays of sections with titles and paragraph arrays. Keep it parseable and maintainable. If documents become extremely long (10+ pages), consider MDX files per locale as a future optimization.

### 7. Do NOT forget to export `generateStaticParams` for services/[type]
Without it, the dynamic route will be server-rendered on every request. With it, all provider type pages are pre-built at build time.

---

## Summary of Changes by File

### New Files

| File | Type | Purpose |
|------|------|---------|
| `src/app/[locale]/(main)/pricing/page.tsx` | Route | Pricing page |
| `src/app/[locale]/(main)/contact/page.tsx` | Route | Contact page |
| `src/app/[locale]/(main)/privacy/page.tsx` | Route | Privacy policy |
| `src/app/[locale]/(main)/terms/page.tsx` | Route | Terms of service |
| `src/app/[locale]/(main)/services/[type]/page.tsx` | Route | Provider landing pages |
| `src/components/newlanding/FAQ.tsx` | Component | FAQ accordion section |
| `src/components/newlanding/HowItWorks.tsx` | Component | Step-by-step process |
| `src/components/newlanding/pricing/PricingTiers.tsx` | Component | Tier cards |
| `src/components/newlanding/pricing/PricingToggle.tsx` | Component | Monthly/annual toggle |
| `src/components/newlanding/pricing/PricingFAQ.tsx` | Component | Pricing FAQ |
| `src/components/newlanding/contact/ContactForm.tsx` | Component | Contact form |
| `src/components/newlanding/contact/ContactInfo.tsx` | Component | Contact details |
| `src/components/newlanding/legal/LegalContent.tsx` | Component | Legal content renderer |
| `src/components/newlanding/services/ServiceHero.tsx` | Component | Provider type hero |
| `src/components/newlanding/services/ServiceFeatures.tsx` | Component | Provider features |
| `src/components/newlanding/services/ServiceCTA.tsx` | Component | Provider CTA |
| `convex/contactSubmissions.ts` | Backend | Contact form mutation |

### Modified Files

| File | Change |
|------|--------|
| `src/app/[locale]/(main)/page.tsx` | Add FAQ + HowItWorks sections |
| `src/components/newlanding/index.ts` | Add new component exports |
| `src/components/newlanding/Navigation.tsx` | Update links to real routes |
| `src/components/newlanding/Footer.tsx` | Update links to real routes |
| `src/components/newlanding/CTA.tsx` | Wire buttons to /contact and /pricing |
| `convex/schema.ts` | Add contactSubmissions table |
| `messages/en.json` | Add all new translation keys |
| `messages/he.json` | Add all new translation keys |

### Unchanged Files (no modifications needed)

- `middleware.ts` -- No changes (new routes are inherently public)
- `src/app/[locale]/layout.tsx` -- No changes
- `src/app/[locale]/(main)/layout.tsx` -- No changes (already provides Nav+Footer)
- All `(app)/` routes -- No changes
- All `(auth)/` routes -- No changes
- All `src/components/ui/` -- No changes (reuse existing)

---

## Sources

- Direct codebase analysis of all files referenced above (HIGH confidence)
- `middleware.ts` route matcher patterns (verified by reading the file)
- `(main)/layout.tsx` layout composition (verified by reading the file)
- `messages/en.json` existing translation structure (verified by reading the file)
- Next.js App Router route groups documentation
- next-intl locale-aware navigation (`createNavigation` from routing)
