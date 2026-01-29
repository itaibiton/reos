# Phase 55: Contact & Provider Landing Pages - Context

**Gathered:** 2026-01-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can submit inquiries via a contact form at /contact (saving to Convex) and service providers can discover type-specific landing pages at /services/[type]. Contact page includes form with predefined subjects, alternative contact methods, and a thank-you redirect. Provider pages use a shared template with data-driven content, type-specific optional sections, JSON-LD ProfessionalService structured data, and CTA linking to sign-up with role pre-selected. All pages support EN/HE i18n with proper Next.js metadata.

</domain>

<decisions>
## Implementation Decisions

### Contact Form Behavior
- Form submits to Convex (no email notification — team checks admin/dashboard)
- On successful submission, redirect to a dedicated /contact/thank-you page
- Subject field is a **dropdown with predefined options** (General Inquiry, Pricing Question, Partnership, Support, Become a Provider)
- Subject pre-selects based on URL parameter (e.g. /contact?subject=pricing)
- Validation triggers **on submit** (show all errors at once when user clicks Send)
- Honeypot anti-spam field (hidden from real users)
- Fields: name, email, subject (dropdown), message, optional phone

### Contact Alternative Methods
- Display **email address + phone number** alongside the form
- **No map** — keep page clean and focused on the form
- **Social media links** shown as icons (LinkedIn, Twitter/X, etc.)
- **Response time estimate** displayed (e.g. "We typically respond within 24 hours")

### Provider Page Content & Layout
- **Hero section:** Bold value proposition headline about what the provider gains (leads, clients, revenue) with a CTA button
- **Benefits section:** Alternating left-right blocks (image on one side, text on the other)
- **Social proof:** Both testimonial quotes AND stats counters (e.g. "X deals closed", "Y active investors")
- **Process steps:** 3-4 steps showing how to get started (Sign up → Complete profile → Receive leads → Close deals), type-specific per provider
- **CTA:** Links to sign-up with role pre-selected (e.g. /sign-up?role=broker)

### Provider Type Differentiation
- **Shared template with optional unique sections** — one layout component, each type passes different headlines, benefits, steps, testimonials, and stats via i18n. Some types may have unique optional blocks
- **7 provider types** (expanded from roadmap's 3): brokers, lawyers, appraisers, mortgage advisors, entrepreneurs, asset managers, financial advisors
- **Shared brand colors** — all provider pages use the same REOS palette, no per-type accent colors
- Routes: /services/brokers, /services/lawyers, /services/appraisers, /services/mortgage-advisors, /services/entrepreneurs, /services/asset-managers, /services/financial-advisors
- Generate statically via generateStaticParams
- JSON-LD ProfessionalService structured data per type

### Claude's Discretion
- Thank-you page design and content
- Exact alternating section visual treatment (illustrations vs abstract graphics vs icons)
- Testimonial presentation format (cards, carousel, or static quotes)
- Stats counter animation or static display
- Form field ordering and spacing
- Social link icon selection and placement
- Loading/submitting state design

</decisions>

<specifics>
## Specific Ideas

- Provider CTA should deep-link to signup with role pre-selected so the provider onboarding starts immediately
- Contact subject dropdown should auto-select when coming from other pages (e.g. pricing page "Contact Sales" → subject=pricing)
- The `/services/[type]` route pattern was chosen to avoid middleware auth conflict on `/providers` routes (decision SERVICES-ROUTE from STATE.md)

</specifics>

<deferred>
## Deferred Ideas

- Email notification on form submission — requires email service setup, deferred to future phase
- Interactive map on contact page — could add later if office location becomes relevant
- Additional provider types beyond 7 — can be added as data entries later since template is shared

</deferred>

---

*Phase: 55-contact-and-provider-landing-pages*
*Context gathered: 2026-01-29*
