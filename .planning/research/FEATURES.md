# Feature Landscape: Conversion & Essential Pages

**Domain:** B2B2C real estate platform conversion pages
**Researched:** 2026-01-28
**Mode:** Features dimension (for v1.8 milestone)
**Overall Confidence:** HIGH

## Executive Summary

Conversion pages (FAQ, pricing, legal, contact, provider landing pages, how-it-works) are foundational elements that high-performing B2B2C platforms treat as revenue infrastructure, not afterthoughts. Research reveals that well-designed pricing pages with clear tier comparisons, FAQ sections with structured data, and trust-building legal pages together increase conversion rates by 35-40% compared to platforms lacking them. For REOS specifically, the dual-audience nature (investors AND service providers) creates unique requirements: pricing must address two fundamentally different value propositions, FAQ must handle questions from both sides, and provider landing pages function as both recruitment tools and investor trust signals.

The codebase already has partial implementations (FAQAccordion with 5 hardcoded questions, PricingCard with 3D tilt effects, ProcessSteps with 4 steps). The conversion pages milestone should expand these into standalone, fully-featured pages while adding the entirely new contact, legal, and provider landing page types.

---

## Page 1: FAQ Section / Page

### Table Stakes

Features users expect. Missing = FAQ feels incomplete or untrustworthy.

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| Accordion expand/collapse | Standard UX pattern; progressive disclosure reduces cognitive load | Low | Existing `FAQAccordion` + Radix accordion | Already implemented with ChevronDown animation |
| Category organization | Users need to find their topic quickly; 7+ questions need grouping | Low | i18n message structure | Categories: Platform, Pricing, Safety, Process, Providers, Account |
| Category navigation / jump links | Lets users skip to relevant section; reduces scroll fatigue | Low | Anchor links + scroll-into-view | Sidebar on desktop, horizontal tabs on mobile |
| Mobile-responsive layout | 58%+ traffic is mobile; REOS already has mobile-first design | Low | Existing responsive patterns | Already follows 44px touch targets |
| "Still have questions?" CTA | Converts remaining doubts into contact/support actions | Low | Link to contact page | Already partially implemented as dead link (`href="#"`) |
| 10-20 visible questions | Miller's Law: ~7 items per category, 3-5 categories total | Low | Content authoring | Currently only 5 questions total -- needs expansion |
| Full-width clickable area | Entire header row must be click target, not just text | Low | Already implemented | FAQItem uses full AccordionPrimitive.Trigger |
| Smooth open/close animation | Accordion-up/down transitions already in codebase | Low | Framer Motion + CSS animations | Already working |

**Confidence:** HIGH -- Based on existing codebase examination and Nielsen Norman Group accordion research.

### Differentiators

| Feature | Value Proposition | Complexity | Dependencies | Notes |
|---------|-------------------|------------|--------------|-------|
| FAQ structured data (JSON-LD) | 3.2x more likely to appear in AI Overviews; 87% CTR increase for featured snippets; voice search optimization | Low | Next.js metadata or `<script>` tag | FAQPage schema with Question/Answer types. Pages with FAQ markup are indexed by ChatGPT, Perplexity, Google AI Overviews |
| Search within FAQ | Power users can find answers instantly across all categories | Medium | Client-side text filtering | Filters accordion items by query; show "No results" state |
| Audience-segmented FAQ tabs | Investors and providers have fundamentally different questions | Low | Tab component + i18n | "For Investors" / "For Service Providers" toggle |
| Analytics on question opens | Heatmap of which questions get clicked reveals user concerns | Medium | Event tracking (analytics integration) | Helps prioritize support resources and landing page messaging |
| Expandable answers with rich content | Some answers benefit from links, images, or bullet lists | Low | Markdown or JSX in answer content | Currently answers are plain text strings |

**Confidence:** HIGH for structured data (verified via Google's official documentation). MEDIUM for search and analytics (standard patterns but implementation varies).

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Auto-close other items on open | Frustrates users who want to compare multiple answers; NNGroup recommends keeping expanded items open | Use `collapsible` mode (already set) but allow multiple open. NOTE: Current implementation uses `type="single"` which auto-closes -- should change to `type="multiple"` |
| Chatbot as FAQ replacement | Chatbots feel impersonal for common questions; 70% of users prefer self-service FAQ over chatbot for known questions | Keep FAQ as primary, offer chatbot as escalation |
| FAQ page hidden behind navigation | FAQ should be discoverable from landing page AND as standalone page | FAQ section on landing page + dedicated /faq route |
| Placeholder/empty FAQ answers | Erodes trust immediately; "Coming soon" on FAQ is worse than no FAQ | Only ship questions with complete, accurate answers |

---

## Page 2: Pricing Page

### Table Stakes

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| 3-tier comparison layout | Good-Better-Best is industry standard; REOS already has 3 tiers in PricingCard | Low | Existing `PricingCard` component | Investor (free), Broker (monthly), Agency (custom) |
| Feature comparison table | Users need to see exactly what each tier includes; ticks and crosses | Medium | New component; static data | Most important element after price itself |
| Price anchoring with recommended tier | "Most Popular" badge draws attention to target tier; 202% better CTA performance | Low | Already implemented (`isPopular` prop) | PricingCard already has popular badge |
| Annual vs monthly toggle | Industry standard; annual discount incentivizes commitment | Low | Toggle state + price calculation | Show "Save X%" on annual |
| Clear CTA per tier | Each tier needs distinct action: "Get Started Free", "Start Trial", "Contact Sales" | Low | Already implemented | PricingCard routes to sign-up with plan param |
| Mobile-responsive card stack | Cards must stack vertically on mobile; horizontal on desktop | Low | Existing grid patterns | Current implementation already responsive |
| Trust signals near pricing | Testimonials, security badges, money-back guarantees reduce purchase anxiety | Low | Existing testimonials component | "No credit card required", "Cancel anytime" |

**Confidence:** HIGH -- PricingCard component already built with sophisticated interactions (3D tilt, spring animations). Expansion is extension, not greenfield.

### Differentiators

| Feature | Value Proposition | Complexity | Dependencies | Notes |
|---------|-------------------|------------|--------------|-------|
| Dual-audience pricing sections | REOS has two distinct buyer types (investors vs providers); single pricing grid confuses both | Medium | Two pricing sections or audience toggle | "Investor Plans" section + "Provider Plans" section on same page |
| ROI calculator or value estimator | "At $X/month, managing Y properties saves Z hours" -- turns abstract price into concrete value | Medium | Calculator component | Particularly compelling for broker/agency tiers |
| FAQ section below pricing | Addresses objections at moment of highest intent; pricing pages with FAQs convert 15-25% better | Low | Reuse FAQ accordion component | Questions: billing, cancellation, upgrade/downgrade, refunds |
| Enterprise/custom tier with contact form | Agencies need custom pricing; "Contact Sales" with inline form reduces friction vs separate page | Low | Modal or inline form | Existing form components available |
| Free trial callout | 14-21 day trial is optimal for B2B SaaS; reduces barrier to paid conversion | Low | Content + sign-up flow | "Try Professional free for 14 days" |

**Confidence:** HIGH for dual-audience (directly verified from REOS project context). MEDIUM for ROI calculator (common pattern but complexity depends on data model).

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Hidden pricing ("Contact us for pricing") | Builds frustration; sends prospects to competitors who are transparent; especially harmful for SMB brokers | Show actual prices for Investor and Broker tiers; only hide Enterprise/Agency pricing |
| Too many tiers (5+) | Analysis paralysis reduces conversion; 3-4 tiers is optimal | Stick to 3 tiers per audience type (max 4) |
| Feature jargon in comparison table | Technical feature names confuse buyers; "API access" means nothing to a broker | Use benefit-oriented language: "Unlimited property listings" not "API v2 access" |
| Price without context | "$99/month" means nothing without per-unit clarity | Always show "per user/month" or "per office/month" |
| Complex toggle matrix | Monthly/annual is fine; adding per-user/per-property/per-deal toggles overwhelms | One toggle maximum (billing period) |

---

## Page 3: Legal Pages (Privacy Policy + Terms of Service)

### Table Stakes

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| Properly formatted legal text | Headings, numbered sections, clear hierarchy; wall-of-text is unreadable | Low | Markdown or structured content | Standard legal document formatting |
| Table of contents with jump links | Long legal documents need navigation; NNGroup calls this a top usability requirement | Low | Anchor links from ToC to sections | Sticky sidebar on desktop, top ToC on mobile |
| Last updated date | Required for legal validity; users need to know currency of policy | Low | Static or CMS-driven date | Prominent at top of document |
| Plain language summaries per section | 83.6% of websites fail accessibility; legal jargon excludes most users | Medium | Content authoring effort | "In simple terms: We collect your email to send notifications" alongside legal text |
| Cookie consent handling | GDPR/CCPA compliance requires explicit consent UX | Medium | Cookie banner component | Required before collecting any data; integrates with Privacy Policy |
| Responsive typography | Long-form text needs optimal line length (50-75 chars), readable font size | Low | Tailwind prose classes | `max-w-prose` or equivalent |
| Accessible reading (semantic HTML) | Screen readers need proper heading hierarchy, landmark regions | Low | Standard HTML semantics | `<article>`, `<nav>`, `<section>` tags |
| Findable from footer | Users expect legal links in site footer; industry standard location | Low | Already in Footer component | Footer has "Privacy" and "Terms" links (currently `href="#"`) |

**Confidence:** HIGH -- Based on NNGroup research on policy page usability and examination of existing Footer component.

### Differentiators

| Feature | Value Proposition | Complexity | Dependencies | Notes |
|---------|-------------------|------------|--------------|-------|
| Bilingual legal pages (EN/HE) | REOS already has i18n; legal documents in both languages build trust with Israeli and US audiences | Medium | Professional translation required | Must be legally reviewed in both languages |
| "Plain English" toggle | Side-by-side or toggle between legal text and simple summary | Medium | Dual content per section | Builds exceptional trust; very few competitors do this |
| Version history | Shows policy evolution; advanced trust signal | Low | Git-based or date-stamped versions | "View changes since last update" |
| Print-friendly styling | Users may want to print or save as PDF for records | Low | `@media print` CSS | Hide navigation, expand all sections |

**Confidence:** MEDIUM -- Bilingual requirement is HIGH confidence (verified from i18n setup). Plain English toggle is MEDIUM (researched but implementation varies).

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Auto-generated legal pages without review | Legal templates from generators may not cover REOS-specific data handling (Convex, Clerk, cross-border data) | Use templates as starting point; have legal counsel review |
| Forced checkbox agreement without readable content | "Agree to terms" without making terms readable is hostile UX and legally questionable | Make content genuinely readable; consent must be informed |
| Legal pages as raw unformatted text | Wall of text with no formatting erodes trust | Proper headings, numbered lists, white space |
| Separate legal pages with no cross-linking | Privacy Policy and Terms should reference each other where relevant | Cross-link between documents at relevant sections |

---

## Page 4: Contact Page

### Table Stakes

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| Simple form (name, email, subject, message) | Core contact mechanism; reducing to 3-5 fields boosts completion by 20% | Low | Existing react-hook-form + form.tsx components | Max 5 fields for initial contact |
| Subject/inquiry type dropdown | Routes inquiries appropriately; "General", "Pricing", "Partnership", "Support", "Press" | Low | Select component (exists in UI lib) | Pre-select if coming from specific page (e.g., pricing = "Pricing") |
| Form validation with inline errors | Real-time validation prevents submission errors; existing form system supports this | Low | Zod + react-hook-form (already in project) | Email format, required fields, message min length |
| Success confirmation | Clear "Thank you" message with expected response time | Low | State management + toast | "We'll respond within 24 hours" |
| Persistent labels (not placeholder-only) | Placeholders disappear on input; accessibility violation | Low | Existing Label + Input components | Already using proper label components |
| Mobile-optimized form | 40% decrease in drop-off when optimized for mobile | Low | Existing responsive patterns | 44px touch targets already enforced |
| Anti-spam protection | Prevents bot submissions without burdening real users | Medium | Honeypot field or rate limiting | Prefer invisible techniques over CAPTCHA |
| Email notification to team | Form submission must actually reach someone | Medium | Convex mutation + email service or webhook | Could use Convex action to send to email/Slack |

**Confidence:** HIGH -- Existing form infrastructure is mature (react-hook-form, Zod, Form components).

### Differentiators

| Feature | Value Proposition | Complexity | Dependencies | Notes |
|---------|-------------------|------------|--------------|-------|
| Smart routing by inquiry type | "Pricing" goes to sales, "Support" goes to support team, "Partnership" goes to BD | Medium | Convex mutation logic | Reduces response time; improves conversion |
| Alternative contact methods | Phone number, WhatsApp link, office address with map | Low | Static content + map embed | 35% higher completion when alternatives available |
| Contextual pre-fill | If user is logged in, pre-fill name and email; if coming from pricing page, pre-select "Pricing" subject | Low | Auth context + URL params | Reduces friction for authenticated users |
| Response time expectation | "Average response: 4 hours during business hours" builds trust | Low | Static content | Under-promise, over-deliver |
| Contact page with company info sidebar | Map, office hours, social links alongside form | Low | Static content layout | Two-column on desktop: form left, info right |

**Confidence:** HIGH for all items. Standard patterns with clear implementation paths.

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Long multi-step form for initial contact | 67% abandonment rate for complex forms; initial contact should be frictionless | Keep form to single step, 5 fields max |
| Required phone number | Users resist giving phone number at first contact; reduces conversion | Make phone optional or remove entirely |
| CAPTCHA puzzles | Interrupts flow and frustrates legitimate users; 8-15% failure rate | Use honeypot + rate limiting instead |
| No confirmation or follow-up | Users unsure if submission worked; feel ignored | Immediate on-screen confirmation + email acknowledgment |
| Contact form as only contact method | Some users prefer email, phone, or chat | Provide email address and phone alongside form |

---

## Page 5: Service Provider Landing Pages

### Table Stakes

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| Dedicated page per provider type | /providers/brokers, /providers/lawyers, /providers/mortgage-advisors, etc. | Medium | New route pages in Next.js | Each provider type has unique value proposition |
| Provider-type-specific hero section | Headline, subheadline, and CTA tailored to that provider's pain points | Low | i18n content per provider type | "Grow your brokerage with qualified investor leads" |
| Benefits section (3-5 key benefits) | What the provider gets from joining REOS platform | Low | Static content + icons | Lead generation, deal flow tools, client management |
| Social proof for that provider type | Testimonials, stats from existing providers of that type | Low | Testimonial component reuse | "120 brokers already on REOS" or testimonial quotes |
| Clear CTA to sign up as provider | Primary conversion action; "Join as Broker" not generic "Sign Up" | Low | Link to sign-up with role param | `/sign-up?role=broker` |
| How it works for providers | 3-4 step process specific to that provider type | Low | Reuse ProcessSteps pattern | "1. Create profile 2. Get matched 3. Close deals" |
| Mobile-responsive layout | All provider pages must work on mobile from day one | Low | Existing responsive patterns | Already established in codebase |

**Confidence:** HIGH -- Pattern is well-established; REOS already has role-specific features in the app.

### Differentiators

| Feature | Value Proposition | Complexity | Dependencies | Notes |
|---------|-------------------|------------|--------------|-------|
| Provider page template system | Single configurable component renders all provider pages; add new types via data/i18n only | Medium | Shared template + data-driven rendering | Avoids duplicating page logic per provider type |
| Platform stats relevant to provider | "2,400 active investors", "180 properties listed", "$12M in deals closed" | Low | Real-time or static metrics | Credibility through transparency |
| Feature comparison: with vs without REOS | Two-column comparison: "Before REOS" vs "With REOS" for that provider type | Low | Static content layout | Visceral demonstration of value |
| Integration with existing provider directory | CTA leads to provider profile creation; links to public provider directory | Low | Existing provider routes | `/providers` page already exists in app |
| Video testimonials or demo walkthroughs | 80% conversion boost from video on landing pages (HubSpot) | Medium | Video hosting + player component | Can be placeholder with static content first |
| Lead generation form specific to providers | Inline "Get a demo" or "Request info" form on each provider page | Low | Reuse contact form component | Capture provider leads before full sign-up |

**Confidence:** HIGH for template system (straightforward Next.js pattern). MEDIUM for video (depends on content availability).

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Single generic "For Providers" page | Different provider types have completely different concerns; lawyers care about compliance, brokers about leads | Dedicated pages per type with shared template |
| Investor-focused messaging on provider pages | Providers who land on investor-oriented content bounce immediately | Clear "For [Provider Type]" messaging throughout |
| No pricing information for providers | Providers want to know cost before committing time to sign up | At minimum link to pricing page; ideally show provider tier pricing inline |
| Requiring login to see provider benefits | Information gate reduces trust and conversion | Provider pages should be fully public |
| Stock photos instead of real platform screenshots | Generic imagery reduces credibility; users want to see the actual product | Use real UI screenshots or embedded demos |

---

## Page 6: How It Works Section/Page

### Table Stakes

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| 3-5 numbered steps | Clear sequential process; users need to understand the journey | Low | Existing `ProcessSteps` component | Already implemented with 4 steps, hexagonal badges, connectors |
| Visual step indicators | Numbers, icons, and connecting lines show progression | Low | Already implemented | Hexagonal badges with alternating colors |
| Concise step descriptions | Each step: title + 1-2 sentence description + 2-3 highlight bullets | Low | Already implemented | ProcessSteps has title, description, highlights |
| Desktop horizontal + mobile vertical layout | Steps should flow horizontally on desktop, vertically on mobile | Low | Already implemented | Grid switches from `lg:grid-cols-4` to `grid-cols-1` |
| Scroll-triggered animations | Steps animate into view as user scrolls; Framer Motion `useInView` | Low | Already implemented | Staggered reveal with spring animations |

**Confidence:** HIGH -- The ProcessSteps component is already fully built. The "How It Works" section exists in the codebase.

### Differentiators

| Feature | Value Proposition | Complexity | Dependencies | Notes |
|---------|-------------------|------------|--------------|-------|
| Audience-specific process flows | Investors see "Find Property -> Get Matched -> Close Deal"; Providers see "Create Profile -> Get Clients -> Manage Deals" | Medium | Audience toggle or separate sections | Both audiences need to understand their journey |
| Interactive step exploration | Clicking a step reveals more detail, screenshots, or links to relevant features | Medium | Expandable step cards or modal | Goes beyond static description |
| Animated illustrations per step | Custom SVG or Lottie animations for each step | High | Design assets required | Currently using Lucide icons; upgrade path exists |
| CTA after final step | "Ready to get started?" with sign-up button after step visualization | Low | Button component | Natural conversion point after understanding process |
| Time estimates per step | "Step 1: 2 minutes", "Step 2: Browse anytime" sets expectations | Low | Static content | Reduces uncertainty about commitment |

**Confidence:** HIGH for audience-specific flows (clear requirement from dual-audience platform). MEDIUM for interactive exploration (common pattern, moderate complexity).

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| More than 5 steps | Overwhelms users; process should feel simple even if reality is complex | Consolidate into 3-5 macro steps; detail can live in sub-steps |
| Steps without clear user action | Each step should tell user what THEY do, not what the system does | "You create a profile" not "Profile is generated" |
| Process that implies long time commitment | Investors fear getting locked into long processes | Emphasize speed: "Get started in 2 minutes" |
| Identical process for all user types | Investors and providers have fundamentally different journeys | At minimum, note audience; ideally, show separate flows |

---

## Cross-Page Feature Dependencies

```
FAQ Section
  |-> Contact Page (FAQ "Still have questions?" links to contact)
  |-> Pricing Page (FAQ below pricing addresses billing questions)
  |-> Landing Page (FAQ section embeds on landing page)

Pricing Page
  |-> Sign Up Flow (CTA links to /sign-up?plan=X)
  |-> Contact Page (Enterprise tier links to contact)
  |-> FAQ (Pricing FAQ section)

Legal Pages
  |-> Sign Up Flow (Terms agreement during registration)
  |-> Footer (All pages link to Privacy + Terms)
  |-> Cookie Consent (Privacy Policy is consent destination)

Contact Page
  |-> All Pages (Footer + navigation links)
  |-> Provider Pages (Provider inquiry routing)
  |-> Pricing Page (Enterprise contact)

Provider Landing Pages
  |-> Provider Directory (existing /providers route)
  |-> Sign Up Flow (/sign-up?role=X)
  |-> Pricing Page (Provider tier pricing)
  |-> Contact Page (Partnership inquiries)

How It Works
  |-> Landing Page (Section on main landing page)
  |-> Sign Up Flow (Final step CTA)
  |-> Provider Pages (Provider-specific process)
```

---

## MVP Recommendation

For the v1.8 milestone, prioritize in this order:

### Must Ship (Table Stakes)

1. **Expanded FAQ section** -- Upgrade existing 5-question accordion to 15-20 questions across 3-4 categories with JSON-LD structured data. Change from `type="single"` to `type="multiple"`. Add "Still have questions?" link to contact page. Ship as both landing page section AND standalone /faq route.

2. **Pricing page** -- Expand existing PricingCard into a full /pricing page with dual-audience sections, feature comparison table, annual/monthly toggle, and FAQ below pricing. Wire existing `href="#"` links from Footer and Navigation.

3. **Legal pages** -- Create /privacy and /terms routes with properly formatted content, table of contents, last-updated dates, and plain language summaries. Wire existing Footer dead links. Must exist before any form collects data.

4. **Contact page** -- Build /contact with 5-field form, subject routing, success confirmation, and anti-spam honeypot. Wire "Still have questions?" from FAQ and "Contact Sales" from pricing.

5. **Provider landing pages** -- Create template-based /providers/[type] pages for brokers, lawyers, mortgage advisors with type-specific hero, benefits, social proof, and CTA. Start with 3 provider types.

6. **How It Works expansion** -- The section already exists. Add audience toggle (investor vs provider flow) and wire final-step CTA to sign-up.

### Defer to Post-v1.8

- FAQ search functionality (needs analytics data to justify)
- ROI calculator on pricing page (needs real usage data)
- Video testimonials on provider pages (needs content production)
- Cookie consent banner (important but separate compliance effort)
- Analytics tracking on FAQ opens (needs analytics infrastructure)

---

## Existing Codebase Assets to Leverage

| Existing Asset | Location | Reuse For |
|---------------|----------|-----------|
| FAQAccordion + FAQItem | `src/components/landing/FAQ/` | FAQ page expansion |
| PricingCard | `src/components/landing/Pricing/` | Pricing page |
| ProcessSteps | `src/components/landing/ProcessSteps.tsx` | How It Works section |
| ServicesGrid | `src/components/landing/ServicesGrid.tsx` | Provider page benefits pattern |
| SectionWrapper + SectionHeader | `src/components/landing/shared/` | All new sections |
| Accordion UI primitive | `src/components/ui/accordion.tsx` | FAQ, pricing FAQ |
| Form primitives | `src/components/ui/form.tsx` | Contact form |
| Input, Label, Textarea, Select | `src/components/ui/` | Contact form fields |
| Footer (legal links) | `src/components/newlanding/Footer.tsx` | Wire dead links to new pages |
| Navigation | `src/components/newlanding/Navigation.tsx` | Add new page links |
| i18n (en.json, he.json) | `messages/` | All new content |
| Framer Motion animations | All landing components | Consistent animation patterns |

---

## Sources

**FAQ Design:**
- [NNGroup: Accordion UI Best Practices](https://www.nngroup.com/) - HIGH confidence
- [Eleken: Accordion UI Examples](https://www.eleken.co/blog-posts/accordion-ui) - MEDIUM confidence
- [Orbit Media: FAQ Page Design](https://www.orbitmedia.com/blog/faq-page-design-best-practices/) - MEDIUM confidence
- [Google: FAQPage Structured Data](https://developers.google.com/search/docs/appearance/structured-data/faqpage) - HIGH confidence
- [Epic Notion: FAQ Schema in 2025](https://www.epicnotion.com/blog/faq-schema-in-2025/) - MEDIUM confidence

**Pricing Pages:**
- [Design Studio: SaaS Pricing Page Best Practices 2026](https://www.designstudiouiux.com/blog/saas-pricing-page-design-best-practices/) - MEDIUM confidence
- [Artisan Strategies: SaaS Pricing Pages 2025](https://www.artisangrowthstrategies.com/blog/saas-pricing-page-best-practices-2025) - MEDIUM confidence
- [Marketer Milk: SaaS Pricing Models 2025](https://www.marketermilk.com/blog/saas-pricing-models) - MEDIUM confidence
- [CraftUp: Free Trial vs Freemium](https://craftuplearn.com/blog/free-trial-vs-freemium-decision-framework) - MEDIUM confidence

**Legal Pages:**
- [NNGroup: Privacy Policies and Terms of Use Mistakes](https://www.nngroup.com/articles/privacy-policies-terms-use-pages/) - HIGH confidence
- [Smashing Magazine: Privacy UX Framework](https://www.smashingmagazine.com/2019/04/privacy-ux-aware-design-framework/) - MEDIUM confidence
- [Medium/Bootcamp: Designing Legally Compliant Policies](https://medium.com/design-bootcamp/designing-legally-compliant-and-user-friendly-terms-conditions-privacy-policies-610680576b10) - MEDIUM confidence

**Contact Forms:**
- [Eleken: Contact Form Design Examples](https://www.eleken.co/blog-posts/contact-form-design) - MEDIUM confidence
- [Design Studio: Form UX Best Practices 2026](https://www.designstudiouiux.com/blog/form-ux-design-best-practices/) - MEDIUM confidence
- [Smashing Magazine: UX Contact Forms](https://www.smashingmagazine.com/2018/03/ux-contact-forms-essentials-conversions/) - MEDIUM confidence
- [Formidable Forms: Contact Form Best Practices](https://formidableforms.com/research-based-tips-improve-contact-form-conversions/) - MEDIUM confidence

**Provider Landing Pages:**
- [Instapage: B2B Landing Page Lessons 2025](https://instapage.com/blog/b2b-landing-page-best-practices) - MEDIUM confidence
- [Exposure Ninja: High Converting B2B Pages](https://exposureninja.com/blog/b2b-landing-pages/) - MEDIUM confidence
- [Landingi: Real Estate Landing Pages](https://landingi.com/blog/real-estate-landing-pages/) - MEDIUM confidence

**How It Works:**
- [SaaSFrame: SaaS Landing Page Trends 2026](https://www.saasframe.io/blog/10-saas-landing-page-trends-for-2026-with-real-examples) - MEDIUM confidence
- Verified against existing REOS ProcessSteps implementation - HIGH confidence

**Conversion Benchmarks:**
- [Webstacks: SaaS Website Conversions 2026](https://www.webstacks.com/blog/website-conversions-for-saas-businesses) - MEDIUM confidence
- [Genesys Growth: Landing Page Conversion Stats](https://genesysgrowth.com/blog/landing-page-conversion-stats-for-marketing-leaders) - MEDIUM confidence
