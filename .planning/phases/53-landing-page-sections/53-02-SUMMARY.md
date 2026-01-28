---
phase: 53-landing-page-sections
plan: 02
type: execute
subsystem: landing-ui
tags: [faq, i18n, accordion, tabs, json-ld, seo]
requires:
  - phase: 53
    plan: 01
    reason: "Plan 01 established howItWorks in same wave and both modify messages/en.json and messages/he.json"
provides:
  - artifact: "src/components/newlanding/FAQ.tsx"
    type: "component"
    description: "FAQ landing page section with audience tabs, category-grouped accordion, and JSON-LD structured data"
  - artifact: "messages/en.json (landing.faq)"
    type: "translations"
    description: "English FAQ translations with 10 investor + 7 provider questions"
  - artifact: "messages/he.json (landing.faq)"
    type: "translations"
    description: "Hebrew FAQ translations with 10 investor + 7 provider questions"
affects:
  - phase: 53
    plan: 03
    reason: "Plan 03 (landing page) will import and render FAQ component"
tech-stack:
  added: []
  patterns:
    - "Radix UI Accordion with type='multiple' for independent expand/collapse"
    - "Radix UI Tabs for audience segmentation (investors vs providers)"
    - "JSON-LD structured data via next/script Script component"
    - "t.raw() pattern for iterating over translation arrays"
    - "Category-based question grouping with visible sub-headings"
key-files:
  created:
    - "src/components/newlanding/FAQ.tsx (152 lines)"
  modified:
    - "messages/en.json (added landing.faq with 17 questions)"
    - "messages/he.json (added landing.faq with 17 questions)"
decisions:
  - id: FAQ-AUDIENCE-TABS
    decision: "Use Radix Tabs for investor vs provider segmentation"
    rationale: "Different audiences have distinct concerns - investors care about trust/cost/process, providers care about platform/leads/revenue"
    alternatives: "Single flat list, filter buttons, separate pages"

  - id: FAQ-ACCORDION-MULTIPLE
    decision: "Use Accordion type='multiple' for independent expand/collapse"
    rationale: "Users often want to compare multiple answers side-by-side without having previous answers auto-collapse"
    alternatives: "type='single' (one open at a time)"

  - id: FAQ-CATEGORY-GROUPS
    decision: "Group questions by category with visible sub-headings"
    rationale: "17 questions is too many for flat list - categories (trust, process, cost, platform, leads) help users scan"
    alternatives: "Flat list, nested accordions"

  - id: FAQ-JSON-LD-ALL
    decision: "Include ALL questions (both tabs) in JSON-LD FAQPage schema"
    rationale: "Maximize SEO benefit - search engines should index all FAQ content regardless of tab visibility"
    alternatives: "Only include default tab, separate schemas per tab"

  - id: FAQ-TRAW-ITERATION
    decision: "Use t.raw() to get raw translation objects for iteration"
    rationale: "next-intl's useTranslations returns proxies - t.raw() gives actual objects we can map/iterate over"
    alternatives: "Hardcode question IDs, use separate translation keys"
metrics:
  duration: "5 min"
  completed: 2026-01-28
---

# Phase 53 Plan 02: FAQ Landing Section Summary

**One-liner:** Audience-segmented FAQ section with 17 questions across 2 tabs, category grouping, Radix Accordion type="multiple", and FAQPage JSON-LD structured data for SEO.

## What Was Built

### FAQ Component (src/components/newlanding/FAQ.tsx)

Client component following newlanding section patterns:

**Architecture:**
- Radix UI Tabs with 2 tabs: "For Investors" / "For Service Providers"
- Radix UI Accordion with `type="multiple"` for independent expand/collapse
- Questions organized into categories with visible sub-headings
- JSON-LD FAQPage structured data emitted via next/script Script tag
- Framer Motion scroll animations with useInView and useReducedMotion
- All text from useTranslations("landing.faq") for full i18n support

**Question Structure:**
- **Investor questions (10):**
  - Trust & Safety (3): licensing, vetting, data security
  - Process (4): getting started, property types, timeline, remote investing
  - Cost & Pricing (3): free platform, typical costs, financing options

- **Provider questions (7):**
  - Platform (3): who can join, deal handoff, client management
  - Leads & Clients (2): matching algorithm, lead quality
  - Cost & Plans (2): platform cost, commission structure

**SEO Enhancement:**
- JSON-LD FAQPage schema includes ALL 17 questions (both tabs)
- Structured data follows schema.org FAQPage specification
- Each question represented as Question with acceptedAnswer
- Enables rich results in search engines

### Translations (messages/en.json + messages/he.json)

Added `landing.faq` namespace with complete translations:

**Structure:**
- `heading`: "Frequently Asked Questions" / "שאלות נפוצות"
- `tabs`: investor/provider labels
- `investors.categories`: trust, process, cost labels
- `investors.questions[]`: 10 questions with id, category, question, answer
- `providers.categories`: platform, leads, cost labels
- `providers.questions[]`: 7 questions with id, category, question, answer
- `stillHaveQuestions`, `contactCta`, `contactDescription`: CTA text

**Question Format:**
Each question object has:
- `id`: unique identifier (inv-1, inv-2, ..., prov-1, prov-2, ...)
- `category`: grouping key (trust, process, cost, platform, leads)
- `question`: question text
- `answer`: answer text

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Add FAQ i18n translations (EN + HE) | e858611 | messages/en.json, messages/he.json |
| 2 | Create FAQ component with tabs, accordion, JSON-LD | c269de8 | src/components/newlanding/FAQ.tsx |

## Decisions Made

### FAQ-AUDIENCE-TABS: Use Radix Tabs for investor vs provider segmentation

**Context:** FAQ needs to serve two distinct audiences with different concerns

**Decision:** Implement Radix UI Tabs with "For Investors" and "For Service Providers" tabs

**Rationale:**
- Investors care about: trust/safety, investment process, costs
- Providers care about: platform features, lead quality, pricing
- Tabs reduce cognitive load by showing relevant questions only
- Cleaner than single long list of 17 questions

**Alternatives considered:**
- Single flat list with all 17 questions (overwhelming, hard to scan)
- Filter buttons (less clear state indication)
- Separate /faq/investors and /faq/providers pages (poor UX, splits SEO value)

**Impact:** FAQ is scannable and audience-appropriate without fragmentation

---

### FAQ-ACCORDION-MULTIPLE: Use Accordion type='multiple' for independent expand/collapse

**Context:** Need to decide whether users can open multiple FAQ answers simultaneously

**Decision:** Use Radix Accordion with `type="multiple"` allowing independent expand/collapse

**Rationale:**
- Users often want to compare multiple answers side-by-side
- Example: comparing "typical costs" with "financing options" for budgeting
- No harm in multiple open accordions - content is static text
- More flexible UX than forcing "one open at a time"

**Alternatives considered:**
- `type="single"` (one open at a time) - too restrictive, auto-closes previous answer when opening new one

**Impact:** Users can expand multiple questions to compare information without re-expanding

---

### FAQ-CATEGORY-GROUPS: Group questions by category with visible sub-headings

**Context:** 17 total questions (10 investor + 7 provider) could be overwhelming as flat list

**Decision:** Group questions by category with visible sub-headings:
- Investors: Trust & Safety, Process, Cost & Pricing
- Providers: Platform, Leads & Clients, Cost & Plans

**Rationale:**
- Categories help users quickly scan for their specific concern
- Sub-headings (text-sm, uppercase, tracking-wider, foreground/40) visually separate groups
- Matches FAQ best practices from research (FAQ-01)
- Preserves single accordion per tab for simplicity

**Alternatives considered:**
- Flat list (harder to scan, no visual hierarchy)
- Nested accordions (category expands to reveal question accordions - too complex)
- Separate accordions per category (feels fragmented)

**Impact:** FAQ is scannable with clear information hierarchy

---

### FAQ-JSON-LD-ALL: Include ALL questions (both tabs) in JSON-LD FAQPage schema

**Context:** Need to decide which questions to include in structured data for search engines

**Decision:** Include all 17 questions from both tabs in single FAQPage JSON-LD schema

**Rationale:**
- Search engines should index all FAQ content for maximum discoverability
- Users search for both investor and provider questions
- Single FAQPage schema is simpler than multiple schemas
- Tab visibility is UI concern, not SEO concern

**Alternatives considered:**
- Only include default (investors) tab - loses provider SEO value
- Separate FAQPage schemas per tab - more complex, unclear if Google supports multiple FAQPages on one page
- No JSON-LD - misses structured data SEO benefit

**Impact:** Maximum SEO coverage for all FAQ content regardless of tab state

---

### FAQ-TRAW-ITERATION: Use t.raw() to get raw translation objects for iteration

**Context:** Need to iterate over question arrays from next-intl translations

**Decision:** Use `t.raw("investors.questions")` to get raw array for iteration

**Rationale:**
- `useTranslations` returns proxies optimized for key access, not iteration
- `t.raw()` returns actual JavaScript objects/arrays we can map/filter/group
- Official next-intl pattern for structured data iteration
- Enables `groupByCategory()` helper to organize questions by category

**Alternatives considered:**
- Hardcode question IDs (inv-1, inv-2, ...) and iterate - loses flexibility if questions added/removed
- Use separate translation keys per question - verbose, harder to maintain structure

**Impact:** Component can dynamically render questions from translation structure without hardcoding IDs

## Next Phase Readiness

### Integration Points

**For Plan 53-03 (Landing Page Assembly):**
- Import: `import { FAQ } from "@/components/newlanding/FAQ";`
- Usage: `<FAQ />`
- No props required (pulls from i18n)
- Optional: `<FAQ className="..." />` for custom spacing

### Technical Debt

None - component follows established patterns.

### Blockers

None - FAQ is complete and ready for integration.

### Concerns

None - component is self-contained with translations and structured data.

## Testing Notes

### Manual Verification

**Completed:**
- ✅ 10 investor questions exist in en.json and he.json
- ✅ 7 provider questions exist in en.json and he.json
- ✅ Accordion has `type="multiple"` attribute
- ✅ JSON-LD script with `application/ld+json` type
- ✅ TabsTrigger components for investor/provider tabs
- ✅ CTA linking to `/contact`
- ✅ Component is 152 lines (exceeds 100 line minimum)
- ✅ TypeScript compiles without errors

**To test in browser (Plan 53-03):**
- [ ] Both tabs render with correct questions
- [ ] Multiple accordions can be open simultaneously
- [ ] Category sub-headings visible and styled correctly
- [ ] JSON-LD appears in page source
- [ ] CTA button links to /contact page
- [ ] Animations respect prefers-reduced-motion
- [ ] RTL support for Hebrew (dir="rtl")

## Deviations from Plan

None - plan executed exactly as written.

## Lessons Learned

### What Went Well

1. **t.raw() pattern** - Clean way to iterate over structured translation data
2. **Category grouping** - Reduces visual complexity of 17 questions
3. **Accordion type="multiple"** - More flexible than single for comparison use case
4. **JSON-LD all questions** - Maximizes SEO without complex multi-schema setup

### What Could Be Improved

Nothing - straightforward implementation following established patterns.

### Recommendations

- Consider analytics on which questions are most expanded (future enhancement)
- May want search/filter for FAQ if question count grows beyond 20-25
- Could add "Was this helpful?" feedback buttons (future enhancement)

## Files Changed

```
messages/en.json          (+~200 lines) landing.faq translations
messages/he.json          (+~200 lines) landing.faq translations
src/components/newlanding/FAQ.tsx  (+152 lines) FAQ component
```

## Commit Log

```
e858611 feat(53-02): add FAQ i18n translations (EN + HE)
c269de8 feat(53-02): create FAQ component with tabs, accordion, and JSON-LD
```
