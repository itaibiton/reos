# Technology Stack: Conversion Pages

**Project:** REOS Conversion Pages (FAQ, Pricing, Legal, Contact, Provider Landing, How It Works)
**Researched:** 2026-01-28
**Overall Confidence:** HIGH

## Executive Summary

The existing REOS stack already has nearly everything needed for conversion pages. **Zero new runtime dependencies are required.** The project already has a working FAQ accordion, pricing cards, a contact form with Zod v4 + react-hook-form, and a ProcessSteps component. The only additions are: (1) `schema-dts` as a dev dependency for type-safe JSON-LD structured data (SEO), and (2) optionally `@convex-dev/resend` if you want email notifications when contact forms are submitted. Everything else is composition of existing components into new routes.

---

## What You Already Have (DO NOT ADD)

These are installed, configured, and already used in landing page components.

| Technology | Version | Used By | Relevant For |
|------------|---------|---------|--------------|
| **@radix-ui/react-accordion** | ^1.2.12 | `FAQAccordion`, `FAQItem` | FAQ section |
| **react-hook-form** | ^7.71.0 | `ContactFormSection` | Contact form |
| **@hookform/resolvers** | ^5.2.2 | `ContactFormSection` (zodResolver) | Contact form validation |
| **zod** | ^4.3.5 | `ContactFormSection` (via `zod/v4`) | Form schema validation |
| **framer-motion** | ^12.26.2 | All landing sections | Page animations, scroll reveals |
| **next-intl** | ^4.7.0 | All components via `useTranslations` | i18n for all new pages |
| **react-markdown** | ^10.1.0 | `ChatMessage` (AI chat) | Legal page prose rendering |
| **convex** | ^1.31.3 | `leads.submitLead` mutation | Contact form submission backend |
| **sonner** | ^2.0.7 | Toast notifications | Form submission feedback |
| **lucide-react** | ^0.562.0 | Icons across all components | Icons for all new pages |
| **next-themes** | ^0.4.6 | Theme switching | Light-mode enforcement on landing |
| **Shadcn/ui** | N/A | Full component library | Cards, Buttons, Inputs, Tabs, etc. |

### Existing Landing Components Directly Reusable

| Component | Location | Reuse For |
|-----------|----------|-----------|
| `FAQAccordion` + `FAQItem` | `src/components/landing/FAQ/` | FAQ section on landing page |
| `PricingCard` + `PricingPlans` | `src/components/landing/Pricing/` | Pricing page (refactor to share) |
| `ProcessSteps` | `src/components/landing/ProcessSteps.tsx` | How It Works section |
| `ContactFormSection` | `src/components/landing/ContactForm/` | Contact page (refactor to share) |
| `SectionWrapper` + `SectionHeader` | `src/components/landing/shared/` | All new page sections |
| `ServicesGrid` | `src/components/landing/ServicesGrid.tsx` | Provider landing pages |
| Navigation + Footer | `src/components/newlanding/` | All new pages via `(main)` layout |

### Existing Backend Already Covers Contact

The `convex/leads.ts` mutation (`submitLead`) already handles contact form submissions with name, email, phone, investorType, and message fields. The `leads` table in the schema has proper indexes. **No new backend mutations are needed for the contact form.**

---

## Recommended Additions

### 1. `schema-dts` -- Type-Safe JSON-LD Structured Data (DEV DEPENDENCY)

**What:** TypeScript types for Schema.org vocabulary, maintained by Google.
**Version:** 1.1.5 (latest, stable)
**Why:** Conversion pages benefit enormously from structured data for SEO. The FAQ page should emit `FAQPage` schema, pricing should emit `Product` + `Offer` schema, and provider pages benefit from `ProfessionalService` schema. Type safety prevents malformed structured data that silently fails in search indexing.
**Confidence:** HIGH -- This is the standard approach in Next.js projects. The Next.js official docs recommend JSON-LD `<script>` tags in page components.

```bash
npm install -D schema-dts
```

**How it integrates:**

```typescript
// Example: FAQ page structured data
import type { WithContext, FAQPage } from "schema-dts";

const faqJsonLd: WithContext<FAQPage> = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

// In page component (server component):
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
/>
```

**Alternative considered:** Hardcoding JSON-LD as plain objects without types. Rejected because typos in schema.org properties (e.g., `mainentity` vs `mainEntity`) silently fail and are undetectable until you run Google's Rich Results Test manually.

### 2. `@convex-dev/resend` -- Email Notifications (OPTIONAL, DEFERRED)

**What:** Official Convex component for sending transactional emails via Resend.
**Why OPTIONAL:** The contact form already saves to the `leads` table. Email notification to the team is a nice-to-have, not a blocker for conversion pages. The team can monitor leads via an admin dashboard.
**Why DEFERRED:** Requires Resend account setup, DNS verification for sending domain, and RESEND_API_KEY environment variable. This is infrastructure work outside the scope of page creation.
**When to add:** When the team wants automated email notifications for new contact form submissions or when building transactional email features (welcome emails, etc.).

```bash
# ONLY when ready for email infrastructure:
npm install @convex-dev/resend resend
```

**Confidence:** HIGH that this is the right choice IF email is needed. The Convex team officially maintains this component with exactly-once delivery guarantees, retry logic, and rate limiting.

---

## What NOT to Add

| Library | Why You Might Think You Need It | Why You Do Not |
|---------|-------------------------------|---------------|
| **MDX / @next/mdx** | Legal pages need rich text | Use `react-markdown` (already installed) for rendering legal content stored in translation files or markdown files. MDX adds compile-time complexity with no benefit for static legal prose. |
| **remark / remark-html** | Markdown processing for legal pages | `react-markdown` already handles markdown-to-React rendering. It uses remark internally. Adding remark separately adds redundancy. |
| **gray-matter** | Frontmatter parsing for content files | Not needed. Legal content goes in `messages/en.json` and `messages/he.json` via next-intl, or in simple `.md` files read at build time. No frontmatter parsing needed. |
| **next-seo** | SEO metadata for new pages | Next.js 16 has built-in `generateMetadata` and the `metadata` export in page components. next-seo is legacy from Pages Router. Use native `metadata` exports. |
| **contentlayer / contentful / sanity** | CMS for legal content | Massive overkill for 2-3 legal pages that change once a year. Store content in translation JSON files or static markdown files. |
| **@react-email/components** | Email templates for contact form | Not needed unless implementing email notifications. Even then, simple HTML strings work with Convex Resend component. |
| **Stripe / payment libraries** | Pricing page has tiers | The pricing page displays information only. Payment integration is a separate milestone entirely. Do NOT couple pricing display with payment processing. |
| **form libraries (Formik, etc.)** | Contact form | react-hook-form + zod is already installed and used. Do not add a competing form library. |
| **animation libraries (GSAP, etc.)** | Page transitions | Framer Motion is already installed and used across all landing components. |

---

## Integration Architecture for New Pages

### Routing Strategy

New pages live under the `(main)` route group which already provides Navigation + Footer.

```
src/app/[locale]/(main)/
  page.tsx              -- existing landing page
  pricing/page.tsx      -- NEW: /en/pricing
  contact/page.tsx      -- NEW: /en/contact
  privacy/page.tsx      -- NEW: /en/privacy
  terms/page.tsx        -- NEW: /en/terms
  providers/
    page.tsx            -- NEW: /en/providers (overview)
    brokers/page.tsx    -- NEW: /en/providers/brokers
    lawyers/page.tsx    -- NEW: /en/providers/lawyers
    mortgage/page.tsx   -- NEW: /en/providers/mortgage
```

**Why `(main)` group:** It already has the landing layout with Navigation + Footer + light theme enforcement. All conversion pages share this same shell.

**Why NOT `(app)` group:** The `(app)` group requires authentication (Clerk middleware). Conversion pages must be publicly accessible to unauthenticated visitors.

### i18n Strategy for New Pages

All content goes through `next-intl` via translation JSON files. Pattern already established by existing landing components.

```json
// messages/en.json additions:
{
  "pricing": {
    "title": "Simple, Transparent Pricing",
    "subtitle": "...",
    "tiers": { ... }
  },
  "contact": {
    "title": "Get in Touch",
    "subtitle": "...",
    "form": { ... }
  },
  "legal": {
    "privacy": { "title": "Privacy Policy", "lastUpdated": "...", "content": "..." },
    "terms": { "title": "Terms of Service", "lastUpdated": "...", "content": "..." }
  },
  "providers": {
    "overview": { ... },
    "brokers": { ... },
    "lawyers": { ... },
    "mortgage": { ... }
  }
}
```

**For long legal content:** Two viable approaches:
1. **Translation JSON with markdown strings** -- Store the legal text as a single markdown string in the translation file, render with `react-markdown`. Simpler, keeps everything in one i18n system.
2. **Separate markdown files** -- Store as `content/en/privacy.md` and `content/he/privacy.md`, read at build time in a server component. Better for very long documents.

**Recommendation:** Use approach 1 (translation JSON) because the legal content is typically 2-5 pages of text. This keeps the i18n system unified and avoids a parallel content loading mechanism. If legal content grows very large, refactor to approach 2 later.

### SEO Metadata Strategy

Each new page exports `metadata` using Next.js 16 native metadata API.

```typescript
// src/app/[locale]/(main)/pricing/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing - REOS",
  description: "Transparent pricing for US investors in Israeli real estate.",
  openGraph: {
    title: "REOS Pricing Plans",
    description: "...",
    type: "website",
  },
};
```

**Combined with JSON-LD structured data** via `schema-dts` for rich search results.

### Contact Form Strategy

The existing `ContactFormSection` component is a fully working contact form with:
- Zod v4 validation schema
- react-hook-form integration
- Convex `leads.submitLead` mutation
- Success state with animation
- Error handling
- i18n via `useTranslations`

**For the standalone `/contact` page:** Extract or reuse `ContactFormSection` directly. The component is self-contained and can be imported into a new page component. The only change might be removing the `SectionWrapper` for a full-page layout, or adding additional fields (e.g., subject/topic dropdown).

**For extended contact form fields:** The existing `leads` schema already supports `message` (free text) and `source` (which can be set to "contact_page" vs "landing_page"). If additional fields are needed (e.g., subject category), extend the Convex `leads` table schema and mutation.

### Provider Landing Pages Strategy

Provider pages are static marketing pages. They do NOT need:
- Authentication
- Database queries for provider listings (that is the authenticated `/providers` page in `(app)`)
- Real-time data

They DO need:
- Compelling copy about each provider type (brokers, lawyers, mortgage advisors)
- CTAs that link to sign-up or contact
- Shared layout with Navigation + Footer
- SEO-optimized structured data (`ProfessionalService` schema)

**Content source:** Translation JSON files, same as all other landing content.

---

## Version Compatibility Matrix

All versions verified against the project's `package.json` as of 2026-01-28.

| Dependency | Installed | Compatible With | Notes |
|------------|-----------|----------------|-------|
| zod | ^4.3.5 | @hookform/resolvers ^5.2.2 | Zod v4 supported since resolvers v5.x. Import from `zod/v4`. |
| react-hook-form | ^7.71.0 | @hookform/resolvers ^5.2.2 | Latest RHF v7, full compatibility. |
| next-intl | ^4.7.0 | Next.js 16.1.1 | App Router fully supported. |
| react-markdown | ^10.1.0 | React 19.2.3 | Peer dep satisfied. Used for legal prose. |
| framer-motion | ^12.26.2 | React 19.2.3 | Full React 19 support. |
| schema-dts | 1.1.5 (NEW) | TypeScript ^5 | Dev dependency only, no runtime impact. |

---

## Configuration Checklist

| Item | Status | Action Required |
|------|--------|----------------|
| Routing under `(main)` group | Ready | Create new page directories |
| Navigation + Footer layout | Done | Already in `(main)/layout.tsx` |
| Light theme enforcement | Done | Already in `(main)/layout.tsx` |
| FAQ accordion component | Done | Already built, reuse |
| Pricing card component | Done | Already built, refactor for standalone page |
| Contact form component | Done | Already built, reuse/extend |
| Process steps component | Done | Already built, reuse for How It Works |
| i18n infrastructure | Done | Add translation keys to JSON files |
| Lead submission backend | Done | `convex/leads.ts` submitLead mutation |
| SEO metadata | Built-in | Use Next.js `metadata` export per page |
| JSON-LD structured data | TODO | Add `schema-dts` dev dep, create JSON-LD per page |
| Legal content | TODO | Add to translation JSON files |
| Provider page content | TODO | Add to translation JSON files |

---

## Effort Estimation

| Page/Feature | Complexity | Why |
|-------------|------------|-----|
| FAQ section on landing | Low | Component exists, just needs integration into landing page |
| Pricing standalone page | Low | Components exist, new route + page composition |
| Privacy Policy page | Low | Static content + react-markdown rendering |
| Terms of Service page | Low | Static content + react-markdown rendering |
| Contact standalone page | Low-Medium | Component exists, may extend fields, new route |
| How It Works on landing | Low | ProcessSteps component exists, needs integration |
| Provider overview page | Medium | New content, new layout, CTAs |
| Provider type pages (x3) | Medium | New content per type, shared layout pattern |
| JSON-LD structured data | Low | schema-dts types + script tags per page |
| i18n translations | Medium | Content writing for en + he across all pages |

**Total estimated complexity:** Low-Medium. This milestone is primarily content creation and page composition, not new technical capabilities.

---

## Installation Summary

```bash
# Only dev dependency addition:
npm install -D schema-dts

# OPTIONAL (defer until email infrastructure is ready):
# npm install @convex-dev/resend resend
```

---

## Sources

### Verified (HIGH confidence)
- Project `package.json` -- All version numbers verified against installed dependencies
- Project source code -- Existing components verified by reading `FAQAccordion.tsx`, `PricingCard.tsx`, `ProcessSteps.tsx`, `ContactFormSection.tsx`
- Convex `schema.ts` and `leads.ts` -- Backend already supports contact form submissions
- [Next.js JSON-LD Guide](https://nextjs.org/docs/app/guides/json-ld) -- Official structured data approach
- [@hookform/resolvers releases](https://github.com/react-hook-form/resolvers/releases) -- Zod v4 support confirmed in v5.x
- [Convex Resend Component](https://www.convex.dev/components/resend) -- Official email integration

### WebSearch Verified (MEDIUM confidence)
- [schema-dts npm](https://www.npmjs.com/package/schema-dts) -- v1.1.5, 334K weekly downloads, maintained by Google
- [next-intl Markdown chapter](https://learn.next-intl.dev/chapters/07-content/06-markdown) -- Official guidance on markdown with next-intl
- [Schema.org FAQPage](https://schema.org/FAQPage) -- Structured data type for FAQ sections

### Training Data (LOW confidence, verified by codebase inspection)
- Pattern of using `metadata` export in Next.js App Router pages -- Verified by existing `page.tsx` in `(main)` which already exports metadata
- react-markdown rendering approach -- Verified by existing usage in `src/components/ai/ChatMessage.tsx`
