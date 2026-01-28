# Phase 54: Legal & Pricing Pages - Research

**Researched:** 2026-01-28
**Domain:** Marketing pages (legal, pricing) with Next.js, next-intl, Radix UI
**Confidence:** HIGH

## Summary

This phase adds three critical marketing pages: Privacy Policy, Terms of Service, and Pricing comparison. These pages require careful attention to legal compliance (GDPR, CCPA, new 2026 state laws), conversion optimization patterns, and full i18n support.

The project's existing stack (Next.js 16.1.1, next-intl 4.7.0, Radix UI, Tailwind CSS, Framer Motion) already contains all necessary primitives. The main implementation challenges are content organization (legal documents with TOC, feature comparison tables), responsive design patterns (especially for pricing tables on mobile), and proper internationalized metadata for SEO.

Legal pages follow established document patterns: table of contents with scroll spy, proper heading hierarchy for accessibility (WCAG 2.1 AA), and readable typography (45-75 characters per line). Pricing pages use proven conversion patterns: 3-tier structure with "Most Popular" badge, annual/monthly toggle using Radix Switch, feature comparison table, trust signals near CTAs, and billing FAQ section.

**Primary recommendation:** Use existing project components (Tabs, Accordion, Switch, Table) with translation keys in messages/*.json; create new pages under (main) route group to share Navigation/Footer layout; implement scroll spy TOC with IntersectionObserver for legal pages; use controlled Switch state for pricing toggle.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.1 | App Router, metadata, routing | Already in use; official metadata API for SEO |
| next-intl | 4.7.0 | Internationalization, translations | Already in use; handles en/he with RTL |
| Radix UI | Various | Accessible primitives (Tabs, Accordion, Switch) | Already in use; WCAG compliant, unstyled |
| Tailwind CSS | 4.x | Styling, responsive design | Already in use; logical properties for RTL |
| Framer Motion | 12.26.2 | Animations, scroll detection | Already in use; useInView for scroll spy |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Lucide React | 0.562.0 | Icons (check marks, badges) | Feature comparison tables, trust signals |
| next/script | Built-in | JSON-LD structured data | SEO schema for legal pages and pricing |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Scroll spy (custom) | react-scroll library | Native IntersectionObserver is lighter, no dependency |
| Radix Switch | Custom toggle component | Radix provides accessibility, keyboard nav out of box |
| next-intl | react-i18next | next-intl integrates better with App Router static rendering |

**Installation:**
All dependencies already installed. No new packages required.

## Architecture Patterns

### Recommended Project Structure
```
src/app/[locale]/(main)/
├── pricing/
│   └── page.tsx              # Pricing comparison page
├── privacy/
│   └── page.tsx              # Privacy policy with TOC
└── terms/
    └── page.tsx              # Terms of service with TOC

messages/
├── en.json                   # Add legal, pricing keys
└── he.json                   # Hebrew translations

src/components/
├── pricing/
│   ├── PricingTiers.tsx      # Tier cards with CTAs
│   ├── PricingToggle.tsx     # Annual/monthly switch
│   ├── FeatureComparison.tsx # Feature table
│   └── BillingFAQ.tsx        # FAQ accordion
└── legal/
    ├── TableOfContents.tsx   # Scroll spy navigation
    └── LegalSection.tsx      # Reusable section wrapper
```

### Pattern 1: Internationalized Metadata
**What:** Generate metadata with next-intl for SEO in both languages
**When to use:** All pages requiring title, description, OpenGraph tags
**Example:**
```typescript
// Source: https://next-intl.dev/docs/environments/actions-metadata-route-handlers
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata({ params }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pricing.meta' });

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      locale: locale === 'he' ? 'he_IL' : 'en_US',
      type: 'website',
    },
  };
}
```

### Pattern 2: Scroll Spy Table of Contents
**What:** Highlight active section in TOC as user scrolls through legal content
**When to use:** Long-form content with multiple sections (legal pages)
**Example:**
```typescript
// Source: https://blog.logrocket.com/create-table-contents-highlighting-react/
function TableOfContents({ headings }) {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -35% 0px' } // Top 20%, bottom 35%
    );

    headings.forEach((h) => {
      const element = document.getElementById(h.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  return (
    <nav>
      {headings.map((h) => (
        <a
          key={h.id}
          href={`#${h.id}`}
          onClick={(e) => {
            e.preventDefault();
            document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' });
          }}
          className={activeId === h.id ? 'font-bold' : 'font-normal'}
        >
          {h.text}
        </a>
      ))}
    </nav>
  );
}
```

### Pattern 3: Pricing Toggle with State
**What:** Annual/monthly billing toggle using Radix Switch with controlled state
**When to use:** Pricing pages with billing period options
**Example:**
```typescript
// Source: https://www.radix-ui.com/primitives/docs/components/switch
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';

function PricingToggle() {
  const [isAnnual, setIsAnnual] = useState(true);
  const t = useTranslations('pricing');

  return (
    <div className="flex items-center gap-3">
      <span className={!isAnnual ? 'font-semibold' : 'text-muted-foreground'}>
        {t('billing.monthly')}
      </span>
      <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
      <span className={isAnnual ? 'font-semibold' : 'text-muted-foreground'}>
        {t('billing.annual')}
        <span className="text-xs text-green-600 ms-1">{t('billing.save20')}</span>
      </span>
    </div>
  );
}
```

### Pattern 4: Feature Comparison Table (Responsive)
**What:** Feature grid showing checkmarks per tier, collapsing to cards on mobile
**When to use:** Pricing pages comparing plan features
**Example:**
```typescript
// Source: https://cxl.com/blog/mobile-saas-pricing-pages/
function FeatureComparison({ tiers, features, isAnnual }) {
  return (
    <>
      {/* Desktop: Table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Feature</TableHead>
              {tiers.map(t => <TableHead key={t.id}>{t.name}</TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {features.map(f => (
              <TableRow key={f.id}>
                <TableCell>{f.name}</TableCell>
                {tiers.map(t => (
                  <TableCell key={t.id}>
                    {f.tiers.includes(t.id) ? <Check /> : <X />}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile: Stacked cards */}
      <div className="md:hidden space-y-4">
        {tiers.map(tier => (
          <div key={tier.id} className="border rounded-lg p-4">
            <h3>{tier.name}</h3>
            <ul>
              {features.filter(f => f.tiers.includes(tier.id)).map(f => (
                <li key={f.id}><Check /> {f.name}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}
```

### Pattern 5: JSON-LD for SEO
**What:** Structured data for legal pages and pricing using next/script
**When to use:** All marketing pages for rich snippets
**Example:**
```typescript
// Source: https://yoast.com/json-ld/
import Script from 'next/script';

function PricingPage() {
  const pricingSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "REOS Platform",
    "offers": [
      {
        "@type": "Offer",
        "name": "Investor Plan",
        "price": "0",
        "priceCurrency": "USD"
      },
      // ... more tiers
    ]
  };

  return (
    <>
      <Script
        id="pricing-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingSchema) }}
      />
      {/* Page content */}
    </>
  );
}
```

### Anti-Patterns to Avoid
- **Multiple h1s on legal pages:** Use single h1 for page title, h2 for sections (WCAG best practice)
- **Fixed pixel widths on pricing cards:** Use flex/grid with min-width for responsive tiers
- **Hard-coded prices in components:** Store in translation files for easy updates
- **Forgot aria-hidden on decorative elements:** Connector lines, icons should not be announced
- **Using directional props (-right, -left):** Use logical props (-start, -end) for RTL support

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Scroll spy/active section | Custom scroll event listener with position calculations | IntersectionObserver API with rootMargin | Observer is more performant, handles edge cases, built-in browser API |
| Annual savings calculation | Manual price * 12 * 0.8 in JSX | Translation key with calculated value or useMemo | Easier to update, testable, no duplication |
| Feature comparison logic | Nested loops checking tier access per feature | Normalized data structure with tier IDs array per feature | More maintainable, easier to query |
| Pricing tier "Most Popular" badge | Hardcode badge on middle tier | Add isPopular flag to tier data | Content-driven, easy to change |
| Legal page last updated date | Manual string in component | Date from translation file or CMS | Single source of truth, easy auditing |
| Privacy policy content | Write from scratch | Use template + customize for REOS data processors | Legal templates cover compliance requirements (GDPR/CCPA) |

**Key insight:** Marketing pages are content-heavy; separation of content (translations) from presentation (components) is critical for maintainability and legal updates.

## Common Pitfalls

### Pitfall 1: Line Length on Legal Pages
**What goes wrong:** Legal text spans full viewport width, making it unreadable on wide screens
**Why it happens:** Default block behavior without max-width constraint
**How to avoid:** Use prose max-width of 65-75ch (ideal: 45-75 characters per line per research)
**Warning signs:** Users complain about reading difficulty, high bounce rate on legal pages
**Solution:**
```tsx
<article className="max-w-[75ch] mx-auto leading-relaxed">
  {/* Legal content */}
</article>
```

### Pitfall 2: Mobile Pricing Table Overflow
**What goes wrong:** Feature comparison table scrolls horizontally on mobile, users miss tiers
**Why it happens:** Table with 3+ columns doesn't fit narrow viewport
**How to avoid:** Responsive pattern: table on desktop (md:block), stacked cards on mobile
**Warning signs:** High mobile bounce rate on pricing page, analytics show horizontal scroll
**Solution:** See Pattern 4 above for responsive comparison table

### Pitfall 3: Forgetting Alternate Language Links
**What goes wrong:** Google doesn't index both language versions, SEO suffers
**Why it happens:** Missing alternate links in metadata for multilingual pages
**How to avoid:** Add alternates to metadata for each language version
**Warning signs:** Search console shows language detection issues
**Solution:**
```tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const { locale } = await params;
  return {
    // ...other metadata
    alternates: {
      canonical: `https://reos.app/${locale}/pricing`,
      languages: {
        'en': 'https://reos.app/en/pricing',
        'he': 'https://reos.app/he/pricing',
      }
    }
  };
}
```

### Pitfall 4: Privacy Policy Missing Data Processors
**What goes wrong:** Legal non-compliance (GDPR Article 28 requires disclosing processors)
**Why it happens:** Forgot to list third-party services that process user data
**How to avoid:** Explicitly list Clerk, Convex, Anthropic with their roles in privacy policy
**Warning signs:** Legal audit flags missing processor disclosure
**Solution:** Add dedicated "Data Processors and Sub-Processors" section listing:
- Clerk (authentication, US-based)
- Convex (database, US-based)
- Anthropic (AI features, US-based)

### Pitfall 5: CTA Button Hierarchy on Pricing
**What goes wrong:** All tier CTAs look the same, no visual guidance toward recommended tier
**Why it happens:** Using same button variant for all tiers
**How to avoid:** Use hierarchy: primary CTA for popular tier, secondary for others
**Warning signs:** Users struggle to choose, equal distribution across tiers instead of concentration
**Solution:**
```tsx
<Button variant={tier.isPopular ? "default" : "outline"}>
  {tier.ctaText}
</Button>
```

### Pitfall 6: 2026 Privacy Law Compliance Gap
**What goes wrong:** Privacy policy doesn't address new 2026 state laws (Kentucky, Indiana, Rhode Island)
**Why it happens:** Using outdated privacy policy template from before 2026
**How to avoid:** Include CCPA/CPRA updates effective Jan 1, 2026 (cookies/pixels, risk assessment, data broker requirements)
**Warning signs:** Legal review flags non-compliance with new state laws
**Solution:** Verify privacy policy template includes 2026 CCPA amendments and new state laws

## Code Examples

Verified patterns from official sources:

### Next.js Metadata with Title Template
```typescript
// Source: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
// app/[locale]/layout.tsx
export const metadata: Metadata = {
  title: {
    template: '%s | REOS',
    default: 'REOS - Real Estate Operating System',
  },
  description: 'Connect US investors with Israeli properties',
};

// app/[locale]/(main)/pricing/page.tsx
export const metadata: Metadata = {
  title: 'Pricing', // Becomes "Pricing | REOS"
};
```

### Legal Page with Heading Hierarchy (WCAG)
```typescript
// Source: https://www.w3.org/WAI/tutorials/page-structure/headings/
function PrivacyPolicy() {
  const t = useTranslations('legal.privacy');

  return (
    <article>
      <h1>{t('title')}</h1> {/* Only one h1 */}

      <section id="introduction">
        <h2>{t('sections.introduction.heading')}</h2> {/* h2 for main sections */}
        <p>{t('sections.introduction.content')}</p>
      </section>

      <section id="data-collection">
        <h2>{t('sections.dataCollection.heading')}</h2>

        <h3>{t('sections.dataCollection.whatWeCollect.heading')}</h3> {/* h3 for subsections */}
        <p>{t('sections.dataCollection.whatWeCollect.content')}</p>

        <h3>{t('sections.dataCollection.howWeUse.heading')}</h3>
        <p>{t('sections.dataCollection.howWeUse.content')}</p>
      </section>
    </article>
  );
}
```

### Smooth Scroll Jump Links
```typescript
// Source: https://www.seanoliver.dev/scroll-links
function TableOfContents({ sections }) {
  return (
    <nav aria-label="Table of contents">
      {sections.map(section => (
        <a
          key={section.id}
          href={`#${section.id}`}
          onClick={(e) => {
            e.preventDefault();
            const element = document.getElementById(section.id);
            element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
        >
          {section.title}
        </a>
      ))}
    </nav>
  );
}
```

### Pricing Tier with Trust Signals
```typescript
// Source: https://optinmonster.com/pricing-page-best-practices/
function PricingTier({ tier, isPopular, isAnnual }) {
  const t = useTranslations('pricing');

  return (
    <div className={cn(
      "border rounded-lg p-6 relative",
      isPopular && "border-primary shadow-lg scale-105"
    )}>
      {isPopular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
          {t('badges.mostPopular')}
        </span>
      )}

      <h3 className="text-2xl font-semibold">{tier.name}</h3>
      <p className="text-muted-foreground">{tier.description}</p>

      <div className="my-6">
        <span className="text-4xl font-bold">
          ${isAnnual ? tier.priceAnnual : tier.priceMonthly}
        </span>
        <span className="text-muted-foreground">
          /{isAnnual ? t('billing.year') : t('billing.month')}
        </span>
      </div>

      <Button variant={isPopular ? "default" : "outline"} className="w-full">
        {tier.cta}
      </Button>

      {tier.id === 'investor' && (
        <p className="text-xs text-center text-muted-foreground mt-2">
          {t('trustSignals.noCreditCard')}
        </p>
      )}

      <ul className="mt-6 space-y-2">
        {tier.features.map(f => (
          <li key={f} className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-600 shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Radix Accordion for FAQ (from Phase 53)
```typescript
// Source: Existing project FAQ component
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

function BillingFAQ() {
  const t = useTranslations('pricing.faq');
  const questions = t.raw('questions') as Array<{id: string, question: string, answer: string}>;

  return (
    <Accordion type="multiple" className="w-full">
      {questions.map(q => (
        <AccordionItem key={q.id} value={q.id}>
          <AccordionTrigger className="text-base font-medium text-start">
            {q.question}
          </AccordionTrigger>
          <AccordionContent className="text-foreground/60 leading-relaxed">
            {q.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Privacy Shield (US-Israel transfers) | Standard Contractual Clauses + risk assessment | 2020 (Schrems II) / Israel clarification 2022 | Privacy policies must explain transfer mechanism, not just cite Privacy Shield |
| WCAG 2.0 | WCAG 2.1 AA (legal standard 2026) | ADA Title II codified 2024 | Heading hierarchy, 1.5 line height, accessible navigation required |
| react-scroll library | Native IntersectionObserver API | ~2019 (broad browser support) | Lighter bundle, better performance, no external dependency |
| Static pricing in code | Dynamic with billing toggle | SaaS standard ~2018+ | Higher conversions (annual commitment), flexibility |
| Single global privacy policy | CCPA-specific addendums | CCPA 2020, new states 2026 | Separate or dedicated sections for California/state-specific rights |

**Deprecated/outdated:**
- Privacy Shield for US-Israel data transfers: Use Standard Contractual Clauses (SCCs) instead
- Single h1 rule (strict): WCAG allows multiple h1s but single h1 is best practice for SEO
- scroll event + offsetTop calculations: Use IntersectionObserver for scroll spy

## Open Questions

Things that couldn't be fully resolved:

1. **Specific legal content for REOS data processors**
   - What we know: Must list Clerk, Convex, Anthropic per GDPR Article 28
   - What's unclear: Exact privacy policy language for cross-border transfers (US-Israel) given 2026 updates
   - Recommendation: Consult with legal counsel on Standard Contractual Clauses language and Israeli PPA guidance; use privacy policy generator as starting point but customize processor section

2. **Contact Sales CTA destination**
   - What we know: Enterprise tier needs "Contact Sales" CTA, Phase 54 context says "legal pages must exist before contact form"
   - What's unclear: Is contact form in scope for this phase or future phase?
   - Recommendation: Link to /contact route (will be created in future phase) or mailto:sales@reos.app as temporary solution

3. **Actual pricing values**
   - What we know: Three tiers (Investor free, Broker monthly, Agency custom)
   - What's unclear: Specific dollar amounts for Broker tier, annual discount percentage
   - Recommendation: Use placeholder values ($0, $49, "Custom") in translation files, easy to update later

4. **Trust badges/security seals**
   - What we know: Trust signals boost conversion (security badges, "No credit card required")
   - What's unclear: Which specific security badges to display (McAfee? Norton? Payment logos?)
   - Recommendation: Start with "No credit card required" text only; add badge images in future iteration if security certifications obtained

## Sources

### Primary (HIGH confidence)
- Next.js generateMetadata official docs: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
- next-intl metadata with Server Actions: https://next-intl.dev/docs/environments/actions-metadata-route-handlers
- WCAG heading structure: https://www.w3.org/WAI/tutorials/page-structure/headings/
- Radix UI Switch component: https://www.radix-ui.com/primitives/docs/components/switch
- Schema.org JSON-LD: https://schema.org/ and https://json-ld.org/
- Existing project components (ui/switch.tsx, ui/table.tsx, ui/accordion.tsx verified in codebase)

### Secondary (MEDIUM confidence)
- LogRocket: Create table of contents with highlighting in React: https://blog.logrocket.com/create-table-contents-highlighting-react/
- IntersectionObserver scroll spy: https://css-tricks.com/table-of-contents-with-intersectionobserver/
- CXL: Mobile SaaS pricing pages design: https://cxl.com/blog/mobile-saas-pricing-pages/
- SaaS pricing page best practices 2026: https://www.designstudiouiux.com/blog/saas-pricing-page-design-best-practices/
- Feature comparison table design: https://blog.logrocket.com/ux-design/ui-design-comparison-features/
- Line length readability: https://www.uxpin.com/studio/blog/optimal-line-length-for-readability/ (45-75 chars)
- Baymard on readability: https://baymard.com/blog/line-length-readability
- Trust badges best practices: https://kinsta.com/blog/trust-badges/
- GDPR/CCPA compliance 2026: https://secureprivacy.ai/blog/ccpa-requirements-2026-complete-compliance-guide
- Israel privacy law data transfer: https://iclg.com/practice-areas/data-protection-laws-and-regulations/israel
- WCAG 2026 compliance: https://www.accessibility.works/blog/wcag-ada-website-compliance-standards-requirements/

### Tertiary (LOW confidence)
- WebSearch results for "pricing page design best practices 2026" (multiple sources agree on patterns but not primary documentation)
- WebSearch results for "cross-border data transfer US Israel 2026" (legal interpretation varies, recommend legal counsel review)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in project, verified in package.json and existing components
- Architecture patterns: HIGH - Based on official docs (Next.js, next-intl, Radix UI) and existing project patterns (FAQ, HowItWorks components)
- Pitfalls: MEDIUM-HIGH - Combination of documented best practices (WCAG, readability) and common patterns from multiple sources
- Legal compliance: MEDIUM - 2026 privacy laws well-documented but specific REOS implementation requires legal review

**Research date:** 2026-01-28
**Valid until:** 2026-02-28 (30 days - stable domain with well-established patterns, but monitor for privacy law updates)
