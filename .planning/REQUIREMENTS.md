# Requirements: REOS v1.8 Conversion & Essential Pages

**Defined:** 2026-01-28
**Core Value:** Deal flow tracking from interest to close.

## Milestone Goal

Add critical pages and sections to maximize conversion and complete the website experience — FAQ, pricing, legal pages, contact, service provider landing pages, and "How It Works" section. All new content, no modifications to existing landing components.

## v1.8 Requirements

### FAQ Section

- [ ] **FAQ-01**: User can view FAQ section on landing page with 15-20 questions organized by category (Trust/Safety, Process, Cost, Providers)
- [ ] **FAQ-02**: User can expand/collapse individual FAQ items independently (type="multiple" accordion)
- [ ] **FAQ-03**: FAQ section includes JSON-LD FAQPage structured data for SEO
- [ ] **FAQ-04**: FAQ section includes "Still have questions?" CTA linking to contact page
- [ ] **FAQ-05**: FAQ content available in both English and Hebrew via i18n
- [ ] **FAQ-06**: FAQ section uses audience-segmented tabs (For Investors / For Service Providers)

### How It Works Section

- [ ] **HIW-01**: User can view "How It Works" section on landing page with 4-5 numbered steps showing the investment process
- [ ] **HIW-02**: Steps include icons, titles, descriptions, and connecting visual flow
- [ ] **HIW-03**: Section includes scroll-triggered animations consistent with existing landing style
- [ ] **HIW-04**: Section ends with CTA button linking to sign-up/questionnaire
- [ ] **HIW-05**: How It Works content available in both English and Hebrew via i18n

### Pricing Page

- [ ] **PRICE-01**: User can view pricing page at /pricing with clear tier comparison
- [ ] **PRICE-02**: Pricing page shows 3 tiers per audience: Investor (free), Broker (monthly), Agency (custom)
- [ ] **PRICE-03**: Pricing page includes feature comparison table with checkmarks per tier
- [ ] **PRICE-04**: Pricing page includes annual/monthly billing toggle with savings display
- [ ] **PRICE-05**: Each tier has a clear CTA button (Get Started Free / Start Trial / Contact Sales)
- [ ] **PRICE-06**: Pricing page includes "Most Popular" badge on recommended tier
- [ ] **PRICE-07**: Pricing page includes FAQ section addressing billing questions
- [ ] **PRICE-08**: Pricing page includes trust signals (security badges, "No credit card required")
- [ ] **PRICE-09**: Pricing page content available in both English and Hebrew via i18n
- [ ] **PRICE-10**: Pricing page has proper Next.js metadata (title, description, Open Graph)

### Legal Pages

- [ ] **LEGAL-01**: User can view Privacy Policy at /privacy with properly formatted legal content
- [ ] **LEGAL-02**: User can view Terms of Service at /terms with properly formatted legal content
- [ ] **LEGAL-03**: Legal pages include table of contents with jump links to sections
- [ ] **LEGAL-04**: Legal pages show "Last updated" date prominently
- [ ] **LEGAL-05**: Legal pages use responsive typography (proper line length, font size, heading hierarchy)
- [ ] **LEGAL-06**: Legal content addresses REOS-specific data processors (Clerk, Convex, Anthropic)
- [ ] **LEGAL-07**: Legal content covers cross-border data handling (US/Israel)
- [ ] **LEGAL-08**: Legal pages content available in both English and Hebrew via i18n
- [ ] **LEGAL-09**: Legal pages have proper Next.js metadata

### Contact Page

- [ ] **CONTACT-01**: User can view contact page at /contact with inquiry form
- [ ] **CONTACT-02**: Contact form includes fields: name, email, subject/inquiry type dropdown, message, optional phone
- [ ] **CONTACT-03**: Contact form validates input with inline error messages (Zod + react-hook-form)
- [ ] **CONTACT-04**: Contact form submission saves to Convex contactSubmissions table
- [ ] **CONTACT-05**: Contact form shows success confirmation with expected response time after submission
- [ ] **CONTACT-06**: Contact form includes honeypot anti-spam field
- [ ] **CONTACT-07**: Contact page shows alternative contact methods (email, phone number)
- [ ] **CONTACT-08**: Contact page content available in both English and Hebrew via i18n
- [ ] **CONTACT-09**: Contact page has proper Next.js metadata
- [ ] **CONTACT-10**: Subject dropdown pre-selects based on referral source URL parameter

### Service Provider Landing Pages

- [ ] **PROV-01**: User can view dedicated landing page per provider type at /services/[type] (brokers, lawyers, mortgage-advisors)
- [ ] **PROV-02**: Each provider page has a provider-type-specific hero section with tailored headline and CTA
- [ ] **PROV-03**: Each provider page has a benefits section (3-5 key benefits specific to that provider type)
- [ ] **PROV-04**: Each provider page has social proof section (stats, testimonials for that provider type)
- [ ] **PROV-05**: Each provider page has "How it works for [type]" process steps (3-4 steps)
- [ ] **PROV-06**: Each provider page has CTA linking to sign-up with role pre-selected (/sign-up?role=broker etc.)
- [ ] **PROV-07**: Provider pages use a shared template component with data-driven content per type
- [ ] **PROV-08**: Provider pages use generateStaticParams for static generation at build time
- [ ] **PROV-09**: Provider pages content available in both English and Hebrew via i18n
- [ ] **PROV-10**: Provider pages have proper Next.js metadata and JSON-LD ProfessionalService structured data
- [ ] **PROV-11**: Minimum 3 provider types launched: brokers, lawyers, mortgage-advisors

### Navigation & Cross-Linking

- [ ] **NAV-01**: Navigation updated: "Pricing" link added to top nav
- [ ] **NAV-02**: Navigation updated: Provider pages accessible under "Solutions" dropdown
- [ ] **NAV-03**: Footer updated: Privacy, Terms, Contact links wired to real routes
- [ ] **NAV-04**: CTA section updated: "Contact Sales" links to /contact, "View Pricing" links to /pricing
- [ ] **NAV-05**: FAQ "Still have questions?" links to /contact
- [ ] **NAV-06**: Pricing "Enterprise/Custom" tier links to /contact
- [ ] **NAV-07**: All internal links use locale-aware Link component
- [ ] **NAV-08**: Sitemap.ts generated covering all new pages

## Future Requirements (v1.9+)

### Deferred Features

- **FAQ-SEARCH**: Search within FAQ (needs analytics data to justify)
- **FAQ-ANALYTICS**: Track which FAQ questions get opened (needs analytics infrastructure)
- **PRICE-ROI**: ROI calculator on pricing page (needs real usage data)
- **PROV-VIDEO**: Video testimonials on provider pages (needs content production)
- **COOKIE-CONSENT**: Cookie consent banner (separate compliance effort)
- **EMAIL-NOTIFY**: Email notifications on contact form submission (needs email service setup)
- **ANALYTICS**: Conversion funnel tracking across all pages (needs analytics tool selection)
- **A11Y-AUDIT**: Comprehensive accessibility audit of new pages

## Out of Scope

| Feature | Reason |
|---------|--------|
| Modifying existing landing components | Explicitly excluded per user request |
| Payment processing on pricing page | Pricing is display-only; payments deferred to v2.0 |
| Cookie consent banner | Separate compliance effort, not content pages |
| CMS for content management | Overkill for pages that change rarely |
| Native mobile app features | Web-first approach |
| Email delivery from contact form | Requires email service infrastructure; Convex stores submissions |
| Analytics/tracking infrastructure | Separate milestone |
| A/B testing | Requires experiment framework; future milestone |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FAQ-01 | TBD | Pending |
| FAQ-02 | TBD | Pending |
| FAQ-03 | TBD | Pending |
| FAQ-04 | TBD | Pending |
| FAQ-05 | TBD | Pending |
| FAQ-06 | TBD | Pending |
| HIW-01 | TBD | Pending |
| HIW-02 | TBD | Pending |
| HIW-03 | TBD | Pending |
| HIW-04 | TBD | Pending |
| HIW-05 | TBD | Pending |
| PRICE-01 | TBD | Pending |
| PRICE-02 | TBD | Pending |
| PRICE-03 | TBD | Pending |
| PRICE-04 | TBD | Pending |
| PRICE-05 | TBD | Pending |
| PRICE-06 | TBD | Pending |
| PRICE-07 | TBD | Pending |
| PRICE-08 | TBD | Pending |
| PRICE-09 | TBD | Pending |
| PRICE-10 | TBD | Pending |
| LEGAL-01 | TBD | Pending |
| LEGAL-02 | TBD | Pending |
| LEGAL-03 | TBD | Pending |
| LEGAL-04 | TBD | Pending |
| LEGAL-05 | TBD | Pending |
| LEGAL-06 | TBD | Pending |
| LEGAL-07 | TBD | Pending |
| LEGAL-08 | TBD | Pending |
| LEGAL-09 | TBD | Pending |
| CONTACT-01 | TBD | Pending |
| CONTACT-02 | TBD | Pending |
| CONTACT-03 | TBD | Pending |
| CONTACT-04 | TBD | Pending |
| CONTACT-05 | TBD | Pending |
| CONTACT-06 | TBD | Pending |
| CONTACT-07 | TBD | Pending |
| CONTACT-08 | TBD | Pending |
| CONTACT-09 | TBD | Pending |
| CONTACT-10 | TBD | Pending |
| PROV-01 | TBD | Pending |
| PROV-02 | TBD | Pending |
| PROV-03 | TBD | Pending |
| PROV-04 | TBD | Pending |
| PROV-05 | TBD | Pending |
| PROV-06 | TBD | Pending |
| PROV-07 | TBD | Pending |
| PROV-08 | TBD | Pending |
| PROV-09 | TBD | Pending |
| PROV-10 | TBD | Pending |
| PROV-11 | TBD | Pending |
| NAV-01 | TBD | Pending |
| NAV-02 | TBD | Pending |
| NAV-03 | TBD | Pending |
| NAV-04 | TBD | Pending |
| NAV-05 | TBD | Pending |
| NAV-06 | TBD | Pending |
| NAV-07 | TBD | Pending |
| NAV-08 | TBD | Pending |

**Coverage:**
- v1.8 requirements: 52 total
- Mapped to phases: 0 (pending roadmap creation)
- Unmapped: 52

---
*Requirements defined: 2026-01-28*
*Last updated: 2026-01-28 after initial definition*
