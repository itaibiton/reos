# Phase 53: Landing Page Sections - Research

**Researched:** 2026-01-28
**Domain:** React landing page components, FAQ/How-It-Works sections, scroll animations, SEO structured data
**Confidence:** HIGH

## Summary

Phase 53 adds two critical conversion sections to the existing REOS landing page: a "How It Works" section with numbered steps and visual flow, and an FAQ section with category organization and audience segmentation. The research reveals that the project already has strong foundations in place: existing FAQ and ProcessSteps components in `/src/components/landing/`, established animation patterns using Framer Motion, working i18n infrastructure with English and Hebrew support, and shadcn/ui components built on Radix UI primitives.

The standard approach for 2026 landing pages favors simplicity: 3-5 numbered steps for How It Works sections with visual connectors and scroll-triggered animations, and FAQ sections using Radix UI Accordion with `type="multiple"` for independent expand/collapse. SEO structured data should be implemented using Next.js Script tags with JSON-LD format, following the official Next.js guidelines. Both sections must integrate seamlessly with the existing newlanding components while maintaining the established design language.

**Primary recommendation:** Adapt the existing `/src/components/landing/` FAQ and ProcessSteps components to match the newlanding design system, use Radix UI Accordion with `type="multiple"` for FAQ, implement Tabs for audience segmentation, add JSON-LD structured data via Script tags, and follow the existing Framer Motion animation patterns from Hero.tsx and Features.tsx.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @radix-ui/react-accordion | ^1.2.12 | FAQ accordion UI | Accessible, headless, supports `type="multiple"` for independent expand/collapse |
| @radix-ui/react-tabs | ^1.1.13 | Audience segmentation | Built-in keyboard navigation, ARIA compliance |
| framer-motion | ^12.26.2 | Scroll animations | Already used throughout landing page, supports useInView and whileInView |
| next-intl | ^4.7.0 | Internationalization | Already configured for EN/HE, proven in existing components |
| lucide-react | ^0.562.0 | Icons for steps | Consistent with newlanding icon usage |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| schema-dts | Latest | TypeScript types for JSON-LD | Type-safe structured data (optional but recommended) |
| next/script | Built-in | Script injection for JSON-LD | Required for FAQPage structured data |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Radix Accordion | Custom accordion | Custom would require accessibility work already solved by Radix |
| Framer Motion | CSS animations | Framer Motion provides better scroll triggers and reduced motion support |
| JSON-LD via Script | Metadata API | Script tags are official Next.js recommendation for structured data |

**Installation:**
```bash
# All dependencies already installed in package.json
# Optional: npm install schema-dts --save-dev
```

## Architecture Patterns

### Recommended Project Structure
```
src/components/newlanding/
├── HowItWorks.tsx       # New component - numbered steps with visual flow
├── FAQ.tsx              # New component - accordion with tabs
├── index.ts             # Export both new components
└── [existing files]

messages/
├── en.json              # Add landing.howItWorks and landing.faq keys
└── he.json              # Hebrew translations

src/app/[locale]/(main)/
└── page.tsx             # Add HowItWorks and FAQ to component list
```

### Pattern 1: How It Works Section
**What:** Numbered steps with icons, scroll-triggered animations, visual connectors, ending with CTA
**When to use:** Explaining multi-step processes on landing pages
**Example:**
```typescript
// Adapted from existing ProcessSteps.tsx pattern
"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion, type Variants } from "framer-motion";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export function HowItWorks() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const shouldReduceMotion = useReducedMotion();
  const t = useTranslations("landing.howItWorks");

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={shouldReduceMotion ? { hidden: {}, visible: {} } : stagger}
      className="py-12 md:py-16 relative"
    >
      {/* Steps grid with connectors */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={fadeInUp}>
          <h2 className="text-3xl md:text-5xl font-light tracking-tighter">
            {t("heading")}
          </h2>
        </motion.div>

        {/* Steps - adapt from ProcessSteps.tsx */}

        {/* CTA at end */}
        <motion.div variants={fadeInUp} className="text-center mt-10">
          <a href="/questionnaire" className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-full">
            {t("cta")}
          </a>
        </motion.div>
      </div>
    </motion.section>
  );
}
```

### Pattern 2: FAQ Section with Tabs and Accordion
**What:** Radix Tabs for audience segmentation, Accordion with `type="multiple"` for independent expand/collapse
**When to use:** FAQ sections requiring category organization and audience filtering
**Example:**
```typescript
// Combining Tabs + Accordion patterns
"use client";

import { useTranslations } from "next-intl";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

export function FAQ() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const t = useTranslations("landing.faq");

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      className="py-12 md:py-16"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-5xl font-light tracking-tighter mb-8">
          {t("heading")}
        </h2>

        {/* Audience Tabs */}
        <Tabs defaultValue="investors">
          <TabsList>
            <TabsTrigger value="investors">{t("tabs.investors")}</TabsTrigger>
            <TabsTrigger value="providers">{t("tabs.providers")}</TabsTrigger>
          </TabsList>

          <TabsContent value="investors">
            {/* Accordion with type="multiple" - allows multiple items open */}
            <Accordion type="multiple" className="w-full">
              {/* Questions mapped from i18n */}
              <AccordionItem value="q1">
                <AccordionTrigger>{t("investors.q1.question")}</AccordionTrigger>
                <AccordionContent>{t("investors.q1.answer")}</AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>

          <TabsContent value="providers">
            <Accordion type="multiple" className="w-full">
              {/* Provider questions */}
            </Accordion>
          </TabsContent>
        </Tabs>

        {/* "Still have questions?" CTA */}
        <div className="text-center mt-10">
          <p className="text-foreground/50 mb-4">{t("stillHaveQuestions")}</p>
          <a href="/contact" className="text-foreground underline">
            {t("contactUs")}
          </a>
        </div>
      </div>
    </motion.section>
  );
}
```

### Pattern 3: JSON-LD Structured Data
**What:** FAQPage schema.org structured data for SEO
**When to use:** FAQ sections for rich snippet eligibility in search results
**Example:**
```typescript
// In FAQ.tsx or page.tsx
import Script from "next/script";
import { useTranslations } from "next-intl";

export function FAQ() {
  const t = useTranslations("landing.faq");

  // Build JSON-LD from translations
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": t("investors.q1.question"),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t("investors.q1.answer")
        }
      },
      // ... more questions
    ]
  };

  return (
    <>
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* FAQ component JSX */}
    </>
  );
}
```

### Pattern 4: i18n Integration
**What:** Translation keys for both sections with category organization
**When to use:** All user-facing content requiring EN/HE support
**Example:**
```json
// messages/en.json
{
  "landing": {
    "howItWorks": {
      "heading": "How It Works",
      "steps": [
        {
          "title": "Create Account",
          "description": "Sign up and complete your investor profile",
          "icon": "UserPlus"
        },
        {
          "title": "Browse Properties",
          "description": "Explore vetted Israeli real estate opportunities",
          "icon": "Building2"
        },
        {
          "title": "Connect with Experts",
          "description": "Work with verified legal, mortgage, and advisory professionals",
          "icon": "Users"
        },
        {
          "title": "Complete Transaction",
          "description": "Close your deal with full platform support",
          "icon": "CheckCircle"
        }
      ],
      "cta": "Start Investing"
    },
    "faq": {
      "heading": "Frequently Asked Questions",
      "tabs": {
        "investors": "For Investors",
        "providers": "For Service Providers"
      },
      "investors": {
        "q1": {
          "question": "What is REOS?",
          "answer": "REOS is the all-in-one real estate operating system..."
        }
        // 15-20 questions organized by category
      },
      "providers": {
        // Provider-specific questions
      },
      "stillHaveQuestions": "Still have questions?",
      "contactUs": "Contact our support team"
    }
  }
}
```

### Anti-Patterns to Avoid
- **Using `type="single"` for FAQ accordion:** Requirements specify independent expand/collapse, which requires `type="multiple"`
- **Modifying existing landing components:** EXISTING-LANDING decision requires new sections only, don't modify Hero/Features/etc.
- **Hardcoded content:** All text must go through next-intl for EN/HE support
- **Skipping reduced motion:** Existing components check `useReducedMotion()`, new sections must too
- **Custom accordion implementation:** Radix UI already provides accessible accordion with proper ARIA

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Accordion expand/collapse | Custom useState toggle | Radix UI Accordion | Handles keyboard nav, ARIA, focus management, animations |
| Tab switching | Custom state management | Radix UI Tabs | Built-in accessibility, keyboard support, proper ARIA roles |
| Scroll animations | Custom IntersectionObserver | Framer Motion useInView | Already used in project, handles reduced motion, cleaner API |
| i18n content loading | Custom translation system | next-intl useTranslations | Already configured, supports locale routing, type-safe |
| Visual connectors between steps | Custom SVG lines | Adapt from ProcessSteps.tsx | Already solves desktop/mobile, animation timing, responsive |

**Key insight:** The project already has high-quality implementations of FAQ (FAQAccordion.tsx), ProcessSteps (ProcessSteps.tsx), and animation patterns (animations.ts). The task is adaptation to newlanding design system, not building from scratch.

## Common Pitfalls

### Pitfall 1: Accordion Type Mismatch
**What goes wrong:** Using `type="single"` instead of `type="multiple"` prevents multiple FAQ items from being open simultaneously
**Why it happens:** Radix Accordion defaults to single mode; requirement FAQ-02 explicitly requires independent expand/collapse
**How to avoid:** Always use `<Accordion type="multiple">` for FAQ sections
**Warning signs:** Users can only expand one question at a time, closing others automatically

### Pitfall 2: JSON-LD Schema Validation Failures
**What goes wrong:** Invalid or incomplete FAQPage schema prevents rich snippets in search results
**Why it happens:** Missing required fields (question name, answer text), improper nesting, or using wrong @type
**How to avoid:**
- Use schema-dts TypeScript types for compile-time validation
- Test with Google Rich Results Test tool
- Ensure every Question has acceptedAnswer with text field
**Warning signs:** Google Search Console shows structured data errors, no FAQ rich snippets in SERPs

### Pitfall 3: Translation Key Mismatches
**What goes wrong:** FAQ questions fail to load in Hebrew, showing translation keys instead
**Why it happens:** Forgetting to add keys to he.json, typos in translation paths
**How to avoid:**
- Add both en.json and he.json entries simultaneously
- Use TypeScript const assertions for translation key arrays to catch typos
- Test with locale switcher before committing
**Warning signs:** `[missing translation]` warnings in console, English text showing on Hebrew pages

### Pitfall 4: Animation Performance Issues
**What goes wrong:** Laggy scroll animations, especially on mobile
**Why it happens:** Animating too many elements, not using transform/opacity, missing will-change hints
**How to avoid:**
- Follow Framer Motion best practices: animate transform and opacity only
- Use `once: true` in useInView to prevent re-triggering
- Check `useReducedMotion()` and provide instant variants
- Test on actual mobile devices, not just Chrome DevTools
**Warning signs:** Janky scrolling, layout shifts, poor Lighthouse performance scores

### Pitfall 5: Breaking Existing Landing Page
**What goes wrong:** New sections disrupt Hero/Features/Stats layout or animations
**Why it happens:** CSS conflicts, z-index issues, animation timing interference
**How to avoid:**
- Add new components to page.tsx after existing sections
- Use isolated className namespacing
- Test full page scroll flow before committing
- Follow EXISTING-LANDING decision: new sections only, preserve current work
**Warning signs:** Hero stats not animating, scroll progress indicator broken, overlapping elements

### Pitfall 6: RTL Layout Issues in Hebrew
**What goes wrong:** FAQ accordion icons, tab order, or step connectors render incorrectly in Hebrew
**Why it happens:** Hardcoded left/right positioning instead of logical start/end
**How to avoid:**
- Use Tailwind's logical properties: `ps-*`, `pe-*`, `start-*`, `end-*` instead of `pl-*`, `pr-*`, `left-*`, `right-*`
- Test with `<html dir="rtl">` early and often
- Mirror visual connectors for RTL using `transform: scaleX(-1)` conditionally
**Warning signs:** Arrows pointing wrong direction, text alignment issues, overlapping content in Hebrew

## Code Examples

Verified patterns from official sources:

### Radix Accordion with Multiple Type
```typescript
// Source: https://www.radix-ui.com/primitives/docs/components/accordion
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

<Accordion type="multiple" className="w-full">
  <AccordionItem value="item-1">
    <AccordionTrigger>Is it accessible?</AccordionTrigger>
    <AccordionContent>
      Yes. It adheres to the WAI-ARIA design pattern.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Is it styled?</AccordionTrigger>
    <AccordionContent>
      Yes. It comes with default styles.
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

### Framer Motion Scroll Trigger with useInView
```typescript
// Source: https://motion.dev/docs/react-use-in-view
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

function Component() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5 }}
    >
      Content
    </motion.div>
  );
}
```

### Next.js JSON-LD Structured Data
```typescript
// Source: https://nextjs.org/docs/app/guides/json-ld
import Script from "next/script";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is REOS?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "REOS is the all-in-one real estate operating system connecting US investors with Israeli properties."
      }
    }
  ]
};

export default function Page() {
  return (
    <>
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Page content */}
    </>
  );
}
```

### next-intl Translation Usage
```typescript
// Source: Project codebase pattern from Hero.tsx
import { useTranslations } from "next-intl";

export function FAQ() {
  const t = useTranslations("landing.faq");

  return (
    <div>
      <h2>{t("heading")}</h2>
      {/* Access nested keys */}
      <p>{t("investors.q1.question")}</p>
    </div>
  );
}
```

### Radix Tabs Pattern
```typescript
// Source: https://www.radix-ui.com/primitives/docs/components/tabs
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

<Tabs defaultValue="investors">
  <TabsList>
    <TabsTrigger value="investors">For Investors</TabsTrigger>
    <TabsTrigger value="providers">For Service Providers</TabsTrigger>
  </TabsList>
  <TabsContent value="investors">
    {/* Investor FAQ content */}
  </TabsContent>
  <TabsContent value="providers">
    {/* Provider FAQ content */}
  </TabsContent>
</Tabs>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Custom accordion with useState | Radix UI Accordion primitives | 2022-2023 | Better accessibility, keyboard nav, ARIA |
| Inline styles for animations | Framer Motion variants | 2023-2024 | Declarative animations, reduced motion support |
| Manual IntersectionObserver | Framer Motion useInView | 2023-2024 | Cleaner code, automatic cleanup |
| metadata object for structured data | Script tags for JSON-LD | Next.js 13+ (2023) | Recommended by Next.js docs, better SEO tools support |
| Raw i18n dictionary access | next-intl useTranslations hook | 2024+ | Type-safe, better DX |

**Deprecated/outdated:**
- **HeadlessUI Accordion:** Radix UI is now preferred for better TypeScript support and broader ecosystem
- **react-intl:** next-intl is Next.js-specific and handles App Router better
- **Custom scroll observers:** Framer Motion useInView is the standard for React animation libraries

## Open Questions

Things that couldn't be fully resolved:

1. **FAQ Category Organization**
   - What we know: Requirements specify 15-20 questions organized by category (Trust/Safety, Process, Cost, Providers)
   - What's unclear: Whether categories should be visible sub-headings within tabs or just internal organization
   - Recommendation: Start with categories as visual sub-headings (better UX), can remove if content team prefers flat list

2. **How It Works Step Count**
   - What we know: Requirements say "4-5 numbered steps"
   - What's unclear: Exact number and specific step content for investment process
   - Recommendation: Plan for 4 steps (industry standard per research), leave flexibility to add 5th if content team requires

3. **Contact Page URL**
   - What we know: FAQ CTA should link to contact page (requirement FAQ-04)
   - What's unclear: Final URL - Phase 55 will create contact page, might be `/contact` or localized
   - Recommendation: Use `/contact` and update in Phase 56 (Navigation Wiring) if locale prefix required

4. **Visual Connector Animation Timing**
   - What we know: Existing ProcessSteps.tsx has connectors with staggered animations
   - What's unclear: Whether newlanding design system requires same timing or faster/slower
   - Recommendation: Match existing ProcessSteps timing initially, adjust based on design feedback

## Sources

### Primary (HIGH confidence)
- Radix UI Accordion Documentation - https://www.radix-ui.com/primitives/docs/components/accordion
- Radix UI Tabs Documentation - https://www.radix-ui.com/primitives/docs/components/tabs
- Next.js JSON-LD Guide - https://nextjs.org/docs/app/guides/json-ld
- Framer Motion useInView - https://motion.dev/docs/react-use-in-view
- Project codebase: `/src/components/ui/accordion.tsx`, `/src/components/ui/tabs.tsx` (verified Radix implementations)
- Project codebase: `/src/components/landing/FAQ/FAQAccordion.tsx`, `/src/components/landing/ProcessSteps.tsx` (existing patterns)
- Project codebase: `/src/components/newlanding/Hero.tsx` (animation patterns with Framer Motion)
- Package.json dependencies (verified all required packages installed)

### Secondary (MEDIUM confidence)
- Landing Page Best Practices 2026 - Multiple sources confirming 3-5 step standard for How It Works sections
- Framer Motion scroll animation guides - Community best practices for useInView
- Schema.org FAQPage specification - Standard structured data format

### Tertiary (LOW confidence)
- N/A - All findings verified with official documentation or project codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in package.json, verified in codebase
- Architecture: HIGH - Existing components provide proven patterns to adapt
- Pitfalls: MEDIUM - Based on common issues with Radix UI and i18n, not project-specific failures

**Research date:** 2026-01-28
**Valid until:** 2026-04-28 (90 days - stable domain, unlikely to change)

**Key findings:**
1. Project already has FAQ and ProcessSteps components - adapt to newlanding design, don't rebuild
2. Radix Accordion with `type="multiple"` required for independent expand/collapse (FAQ-02)
3. JSON-LD via Script tags is Next.js official recommendation for structured data
4. All animation patterns should follow existing Framer Motion usage in Hero.tsx and Features.tsx
5. i18n structure in messages/en.json shows clear pattern to follow for new sections
