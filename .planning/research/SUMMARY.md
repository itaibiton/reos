# Project Research Summary

**Project:** REOS v1.8 -- Conversion & Essential Pages
**Domain:** B2B2C real estate investment platform (US investors, Israeli properties, service providers)
**Researched:** 2026-01-28
**Confidence:** HIGH

## Executive Summary

REOS v1.8 adds six page types to the existing marketing site: FAQ section on the landing page, standalone pricing page, legal pages (privacy/terms), contact page with form, service provider landing pages (per provider type), and a How It Works section on the landing page. Research across stack, features, architecture, and pitfalls converges on a single conclusion: **this milestone is a content and composition exercise, not a technical one.** The existing codebase already contains working implementations of every component needed -- FAQ accordion, pricing cards, process steps, contact form with Zod validation, and the Convex backend for lead submission. Zero new runtime dependencies are required. The only addition is `schema-dts` as a dev dependency for type-safe JSON-LD structured data.

The recommended approach is to build inside the existing `(main)` route group, which automatically provides Navigation, Footer, and light-theme enforcement for all public pages. The most important architectural decision is to use `/services/[type]` for provider landing pages instead of `/providers/[type]`, because the middleware already protects the `/:locale/providers(.*)` pattern for the authenticated provider directory. This avoids a middleware conflict that would either block public access to marketing pages or weaken auth on the app. A template-driven approach for provider pages (single dynamic route with `generateStaticParams`) keeps effort low and future provider types trivial to add.

The key risks are non-technical: navigation bloat from cramming six new page types into the top nav (keep it lean -- only add Pricing), generic legal pages that fail to disclose REOS-specific data processors (Clerk, Convex, Anthropic), FAQ content that reads like a product manual instead of addressing investor objections, and provider pages that accidentally speak to investors instead of providers. The dual-audience challenge (investors vs. service providers) runs through every page and is the single biggest content risk. Every page must have a clear primary audience.

## Key Findings

### Recommended Stack

**No new runtime dependencies.** The existing stack covers every technical need for conversion pages. The project already has Radix Accordion, react-hook-form + Zod v4, Framer Motion, next-intl, react-markdown, Convex with a working `leads.submitLead` mutation, Sonner for toasts, Lucide icons, and the full Shadcn component library.

**Additions:**

- `schema-dts` (dev dependency, v1.1.5): Type-safe JSON-LD structured data for SEO. Prevents silent schema.org typos. Used for FAQPage, Product/Offer, and ProfessionalService schemas.

**Explicitly excluded:**

- MDX / @next/mdx -- use react-markdown (already installed) for legal prose
- next-seo -- use Next.js native `metadata` exports
- CMS (Contentlayer, Sanity, Contentful) -- overkill for pages that change once a year
- Stripe / payment libraries -- pricing page is display-only, not transactional
- Formik or competing form libraries -- react-hook-form is already integrated
- @convex-dev/resend -- defer email notifications until email infrastructure is ready

See: `.planning/research/STACK-CONVERSION-PAGES.md`

### Expected Features

**Must have (table stakes):**

- FAQ: 15-20 questions across 3-4 categories, `type="multiple"` accordion (not "single"), JSON-LD structured data, "Still have questions?" CTA linking to contact
- Pricing: 3-tier comparison, feature table, "Most Popular" badge, annual/monthly toggle, clear CTAs per tier, trust signals
- Legal: Formatted prose with heading hierarchy, table of contents with jump links, last-updated date, accessible semantic HTML, footer links wired
- Contact: 5-field max form (name, email, subject dropdown, message, optional phone), inline validation, success confirmation, honeypot anti-spam
- Provider pages: Dedicated page per type with type-specific hero, benefits, social proof, provider-facing CTAs, "How it works for providers" steps
- How It Works: 3-5 numbered steps with icons, scroll-triggered animations (already built via ProcessSteps)

**Should have (differentiators):**

- FAQ: Audience-segmented tabs (Investors / Providers), search within FAQ
- Pricing: Dual-audience sections (Investor Plans + Provider Plans), FAQ below pricing
- Legal: Bilingual (EN/HE) with professional translation, plain-language summaries per section
- Contact: Subject-based routing, referral source tracking (which page the user came from), alternative contact methods (phone, WhatsApp)
- Provider pages: Template system (single configurable component, add types via data only), platform stats, "with vs without REOS" comparison
- How It Works: Audience-specific process flows (investor journey vs provider journey)

**Defer to post-v1.8:**

- FAQ search functionality and analytics on question opens
- ROI calculator on pricing page
- Video testimonials on provider pages
- Cookie consent banner (separate compliance effort)
- Conversion tracking / analytics infrastructure
- Email notifications on contact form submission (@convex-dev/resend)

See: `.planning/research/FEATURES.md`

### Architecture Approach

All new pages live under the `(main)` route group, inheriting Navigation + Footer + light theme + Convex client access. No middleware changes are needed. The only backend addition is a new `contactSubmissions` Convex table and mutation for the contact form. Legal pages are pure Server Components (zero interactivity, optimal for SEO). Interactive pages (FAQ, pricing toggle, contact form) use Client Components within Server Component page shells that export metadata. Provider pages use a dynamic `[type]` route with `generateStaticParams` for static generation at build time. All content flows through `next-intl` translation JSON files.

**Major components:**

1. `(main)/` route group -- public marketing shell (Navigation + Footer + light theme)
2. Landing page sections (FAQ.tsx, HowItWorks.tsx) -- added to existing landing page composition between Features/CTA
3. Static pages (pricing, privacy, terms) -- new routes, no backend, Server Component page shells
4. Contact page -- new route, new Convex table + mutation, Client Component form
5. Services/[type] -- dynamic route, template-driven, `generateStaticParams` for all provider types
6. Navigation + Footer link wiring -- update all `href="#"` dead links to real routes using locale-aware `Link`

**Key architectural decisions:**

- Use `/services/[type]` NOT `/providers/[type]` to avoid middleware auth conflict
- Legal content in structured JSON sections within translation files (not MDX, not CMS)
- Contact form writes to new `contactSubmissions` table (not the existing `leads` table, which has different field structure)
- Place HowItWorks after Features, FAQ before CTA in landing page order

See: `.planning/research/ARCHITECTURE-CONVERSION.md`

### Critical Pitfalls

1. **Navigation bloat** -- Adding 6+ pages to top nav destroys the conversion funnel. Keep nav lean: add only "Pricing" to top nav. FAQ, legal, contact go in footer. Provider pages go under existing "Solutions" dropdown. Test mobile nav after every addition.

2. **Legal pages as copy-paste liability** -- Generic templates miss REOS-specific data processors (Clerk, Convex, Anthropic), cross-border data transfers (US/Israel), and multi-jurisdiction requirements (CCPA, GDPR, Israeli Privacy Protection Law). Map all data flows before writing legal content.

3. **FAQ as content dump** -- FAQ must be structured by buyer journey stage (Trust/Safety, Process, Cost, Providers), limited to 15-20 questions, and sourced from real user objections -- not developer assumptions.

4. **Provider pages speaking to wrong audience** -- Each provider type needs distinct value propositions and provider-facing language. Brokers care about leads, lawyers about compliance, mortgage advisors about qualified borrowers. Generic "Sign Up" CTAs fail; use "Join as Broker Partner" etc.

5. **Contact form spam without protection** -- Public forms attract bots within days. Implement honeypot field + rate limiting in the Convex mutation from day one. Do not defer spam protection.

6. **Middleware route collision** -- Using `/providers/[type]` for public marketing pages collides with authenticated `/providers/` routes. Use `/services/[type]` instead.

See: `.planning/research/PITFALLS-CONVERSION-PAGES.md`

## Implications for Roadmap

Based on research, suggested phase structure (4 phases):

### Phase 1: Foundation -- Landing Page Sections + Design Tokens

**Rationale:** Zero new routes, zero backend changes. Lowest risk starting point. Validates the translation pattern and animation consistency before adding pages. Establishes the shared section patterns that all subsequent phases reuse.

**Delivers:**
- FAQ section added to landing page (expanded from 5 to 15-20 questions, `type="multiple"`, JSON-LD structured data)
- HowItWorks section added to landing page (investor journey focus, CTA to sign-up)
- Updated landing page composition order (Hero > SocialProof > Features > HowItWorks > Automation > Testimonials > Stats > FAQ > CTA)
- Shared design tokens documented (spacing, colors, animation variants) for consistency

**Features addressed:** FAQ section (table stakes), How It Works section (table stakes)
**Pitfalls avoided:** Pitfall 3 (FAQ as content dump -- structure by journey stage), Pitfall 8 (How It Works duplicating Features -- focus on user process), Pitfall 9 (design inconsistency -- establish tokens first), Pitfall 15 (i18n bypass -- set convention from phase 1)

### Phase 2: Static Pages -- Legal + Pricing

**Rationale:** Legal pages must exist before the contact form goes live (compliance requirement -- you cannot collect data via form without a privacy policy in place). Pricing is grouped here because it is also static content with no backend. These pages validate that new routes under `(main)` work correctly before adding backend-dependent pages.

**Delivers:**
- `/privacy` and `/terms` routes with structured legal content, table of contents, last-updated dates
- `/pricing` route with dual-audience tier cards, feature comparison, monthly/annual toggle, pricing FAQ
- Footer dead links wired to real routes (Privacy, Terms)
- `schema-dts` dev dependency installed for JSON-LD on pricing page

**Features addressed:** Legal pages (table stakes), Pricing page (table stakes + differentiators)
**Pitfalls avoided:** Pitfall 2 (legal copy-paste -- map REOS data flows first), Pitfall 4 (pricing confusion -- show both REOS fees and investment cost context), Pitfall 11 (pricing model not finalized -- confirm model before building), Pitfall 13 (legal pages without dates)

### Phase 3: Interactive Pages -- Contact + Provider Landing Pages

**Rationale:** Contact page requires the only backend addition (new Convex table + mutation). Legal pages from Phase 2 must exist before the contact form collects data. Provider landing pages are grouped here because they depend on the template pattern and provider-specific content, which is the highest content-authoring effort. The `/services/[type]` dynamic route avoids the middleware collision.

**Delivers:**
- `/contact` route with 5-field form, subject dropdown, honeypot anti-spam, Convex `contactSubmissions` mutation, success state
- `/services/[type]` dynamic route for brokers, lawyers, mortgage-advisors (minimum 3 types) with `generateStaticParams`
- Provider page template system (shared component, data-driven per type)
- Provider-specific hero, benefits, social proof, CTAs per type
- JSON-LD structured data (ProfessionalService) on provider pages

**Features addressed:** Contact page (table stakes), Provider landing pages (table stakes + template system differentiator)
**Pitfalls avoided:** Pitfall 5 (context-less contact form -- add subject + referral source), Pitfall 6 (wrong audience on provider pages -- distinct value props per type), Pitfall 10 (spam flood -- honeypot + rate limiting from day one)

### Phase 4: Navigation Wiring + Cross-Linking

**Rationale:** Wire all links last so every target page exists. This prevents broken links during development and forces a deliberate navigation hierarchy review. All `href="#"` dead links in Navigation, Footer, and CTA components get replaced with real locale-aware routes.

**Delivers:**
- Navigation.tsx updated: "Pricing" in top nav, provider pages under Solutions dropdown
- Footer.tsx updated: Contact, Privacy, Terms, and other links wired
- CTA.tsx updated: "Contact Sales" links to /contact, "View Pricing" links to /pricing
- Cross-page CTAs: FAQ "Still have questions?" to /contact, Pricing "Enterprise" to /contact, Provider pages to /sign-up?role=X
- Sitemap generation (Next.js `app/sitemap.ts`)
- All links use `Link` from `@/i18n/navigation` for locale-aware routing

**Features addressed:** Cross-page linking (table stakes), navigation hierarchy
**Pitfalls avoided:** Pitfall 1 (navigation bloat -- deliberate hierarchy), Pitfall 7 (orphan pages with no internal links -- sitemap + cross-linking)

### Phase Ordering Rationale

- **Phase 1 before Phase 2:** Landing page sections validate translation and animation patterns with zero risk (no new routes). If patterns are wrong, fix them before proliferating across 5+ new pages.
- **Phase 2 before Phase 3:** Legal pages must exist before the contact form collects personal data (GDPR/CCPA compliance). Pricing validates the new-route pattern without backend complexity.
- **Phase 3 after Phase 2:** Contact form depends on legal pages existing. Provider pages are the highest content effort and benefit from patterns established in earlier phases.
- **Phase 4 last:** Navigation wiring requires all target pages to exist. Doing it last prevents broken links and allows a holistic navigation hierarchy review.

### Research Flags

**Phases likely needing deeper research during planning:**

- **Phase 2 (Legal pages):** Legal content requires mapping all REOS data processors (Clerk, Convex, Anthropic, Vercel), cross-border data transfer disclosures, and multi-jurisdiction coverage. Consider legal counsel review. This is a content/compliance challenge, not a technical one.
- **Phase 3 (Provider pages):** Provider value propositions should ideally be validated with real brokers/lawyers/mortgage advisors. Content for 3+ distinct provider types is the biggest authoring effort in this milestone.

**Phases with standard patterns (skip deep research):**

- **Phase 1 (Landing sections):** FAQ accordion and process steps are well-documented patterns. Components already exist in the codebase. Straightforward composition.
- **Phase 4 (Navigation wiring):** Link updates are mechanical. The only decision (what goes in top nav vs footer) should be settled in Phase 1 planning.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Verified against project package.json. Zero runtime additions needed. All component versions confirmed compatible. |
| Features | HIGH | Cross-referenced with NNGroup, Google structured data docs, and conversion benchmarks. Features grounded in existing codebase capabilities. |
| Architecture | HIGH | Based on direct codebase analysis of all referenced files (middleware, layouts, route groups, existing components). Middleware collision identified and resolved. |
| Pitfalls | HIGH | 15 pitfalls identified across critical/moderate/minor severity. Sourced from industry research and verified against REOS-specific codebase patterns. |

**Overall confidence:** HIGH

All four research dimensions were verified against the actual codebase. Stack recommendations are grounded in `package.json` and existing component implementations. Architecture is based on reading the actual middleware, layouts, and route structure. Pitfalls reference specific files and patterns in the codebase.

### Gaps to Address

- **Pricing model finalization:** The pricing page design depends on a finalized business model (free tier, commission structure, provider fees). If the model is not settled, build a "pricing philosophy" placeholder page first and swap in real tiers when ready.
- **Legal content authorship:** Template-based legal content is a starting point but must be reviewed for REOS-specific data flows (Clerk auth data, Convex real-time storage, Anthropic AI processing, cross-border US/Israel transfers). Professional legal review recommended.
- **Provider value proposition validation:** Research suggests distinct messaging per provider type, but actual provider pain points should be validated with at least one real broker, lawyer, and mortgage advisor if possible.
- **Analytics infrastructure:** No analytics library currently exists in the project. Conversion tracking for new pages is deferred but should be addressed before measuring page performance.
- **Hebrew translation:** All new content needs EN and HE versions. Legal content in Hebrew may require professional translation. The i18n infrastructure is ready but the content authoring effort is significant.

## Sources

### Primary (HIGH confidence)
- REOS codebase analysis: `package.json`, `middleware.ts`, `(main)/layout.tsx`, `(main)/page.tsx`, all `newlanding/` components, `convex/schema.ts`, `convex/leads.ts`, `messages/en.json`
- [Next.js JSON-LD Guide](https://nextjs.org/docs/app/guides/json-ld)
- [Google FAQPage Structured Data](https://developers.google.com/search/docs/appearance/structured-data/faqpage)
- [schema-dts npm](https://www.npmjs.com/package/schema-dts) -- v1.1.5, 334K weekly downloads, maintained by Google

### Secondary (MEDIUM confidence)
- NNGroup: Accordion UI best practices, privacy policy usability
- Industry pricing page benchmarks (DesignStudioUIUX, Artisan Strategies, Marketer Milk)
- B2B landing page research (Instapage, Exposure Ninja, Landingi)
- Contact form conversion research (Eleken, Smashing Magazine, Formidable Forms)
- SEO and navigation best practices (Search Engine Journal, Ahrefs, Semrush)

### Tertiary (LOW confidence)
- Conversion rate benchmarks (35-40% uplift from conversion pages, 84-270% from social proof near pricing) -- directionally useful but vary widely by context
- Two-sided marketplace dynamics (Sharetribe) -- general patterns applied to REOS-specific context

---
*Research completed: 2026-01-28*
*Ready for roadmap: yes*
