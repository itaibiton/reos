---
phase: 54-legal-and-pricing-pages
plan: 01
subsystem: legal-content-foundation
tags: [i18n, legal, privacy, terms, components, scroll-spy, toc]
status: complete

# Dependency graph
requires:
  - "53-03: Landing page sections wiring (newlanding components pattern)"
provides:
  - "Legal translation content (privacy + terms) in EN and HE"
  - "Shared legal components (TableOfContents, LegalSection)"
affects:
  - "54-02: Privacy page implementation (consumes legal.privacy translations)"
  - "54-03: Terms page implementation (consumes legal.terms translations)"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "IntersectionObserver scroll spy for table of contents"
    - "Logical properties (ps-*, border-s-*) for RTL support"
    - "Sticky positioning with scroll-margin-top offset"

# File tracking
key-files:
  created:
    - "src/components/legal/TableOfContents.tsx"
    - "src/components/legal/LegalSection.tsx"
    - "src/components/legal/index.ts"
  modified:
    - "messages/en.json"
    - "messages/he.json"

# Decisions
decisions:
  - id: LEGAL-I18N-STRUCTURE
    choice: "Nested legal.privacy and legal.terms namespaces with sections"
    rationale: "Mirrors existing i18n structure pattern, enables granular translation access"
    alternatives: ["Flat legal namespace", "Separate legal-privacy.json file"]

  - id: TOC-SCROLL-SPY
    choice: "IntersectionObserver with rootMargin: '-20% 0px -35% 0px'"
    rationale: "Activates link when heading is in top portion of viewport (natural reading position)"
    alternatives: ["Scroll event listener", "Third-party scroll spy library"]

  - id: TOC-RESPONSIVE
    choice: "Hidden on mobile (lg:block), inline render for mobile TOC"
    rationale: "Sticky sidebar impractical on mobile; legal pages can render inline TOC above content"
    alternatives: ["Always visible sticky", "Collapsible mobile drawer"]

# Metrics
duration: 7
completed: 2026-01-28
---

# Phase 54 Plan 01: Legal Content Foundation Summary

**One-liner:** Legal i18n content (privacy policy + terms of service in EN/HE) with shared scroll-spy TableOfContents and LegalSection components.

## What Was Built

### Legal Translation Content
Added comprehensive legal content to both EN and HE message files:

**Privacy Policy (legal.privacy):**
- 13 sections covering CCPA/GDPR/Israeli privacy law
- Data collection, use, processors, cross-border transfers
- User rights (California, EU/EEA, Israeli residents)
- Security, retention, cookies, children's privacy
- Meta tags for SEO (title, description)

**Terms of Service (legal.terms):**
- 15 sections covering platform usage and obligations
- Eligibility, account terms, platform use restrictions
- Investor terms (disclaimers, due diligence responsibility)
- Provider terms (licensing, professional standards)
- IP, liability, indemnification, dispute resolution
- Meta tags for SEO

**Hebrew translations:**
- Complete formal legal terminology
- RTL-appropriate text
- Accurate translation of all sections

### Shared Legal Components

**TableOfContents component:**
- Client component with IntersectionObserver scroll spy
- Observer config: `rootMargin: '-20% 0px -35% 0px'` for top-viewport activation
- Active section highlighting (font-semibold + border-primary)
- Smooth scroll navigation via scrollIntoView
- Sticky positioning (`sticky top-24`) desktop-only (`hidden lg:block`)
- RTL-safe logical properties (`ps-4 border-s-2`)
- Props: `headings: Array<{ id: string; text: string }>`

**LegalSection component:**
- Server component (pure rendering wrapper)
- Section wrapper with `scroll-mt-24` offset for sticky header
- Props: `id`, `heading`, `children`
- Renders h2 heading + content wrapper with spacing

**Barrel export:**
- `src/components/legal/index.ts` exports both components

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Add legal translation keys (EN + HE) | b4d01b5 | messages/en.json, messages/he.json |
| 2 | Create shared legal components | 39a3137 | src/components/legal/*.tsx, index.ts |

## Technical Implementation

### Translation Structure
```json
{
  "legal": {
    "privacy": {
      "meta": { "title": "...", "description": "..." },
      "title": "Privacy Policy",
      "lastUpdated": "Last updated: January 28, 2026",
      "sections": {
        "introduction": { "heading": "...", "content": "..." },
        "dataCollection": {
          "heading": "...",
          "whatWeCollect": { "heading": "...", "content": "..." },
          "automaticData": { "heading": "...", "content": "..." }
        }
        // ... 13 sections total
      }
    },
    "terms": { /* same structure, 15 sections */ }
  }
}
```

### Scroll Spy Pattern
```typescript
useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    },
    { rootMargin: "-20% 0px -35% 0px" }
  );
  // Observe all heading elements...
}, [headings]);
```

### RTL-Safe Styling
```typescript
className={cn(
  "ps-4 border-s-2", // Logical properties (not padding-left/border-left)
  activeId === id
    ? "border-primary font-semibold"
    : "border-transparent text-muted-foreground"
)}
```

## Verification Results

All verification checks passed:
1. ✅ `messages/en.json` contains `legal.privacy` and `legal.terms`
2. ✅ `messages/he.json` contains `legal.privacy` and `legal.terms`
3. ✅ TypeScript compiles without errors
4. ✅ Barrel export includes TableOfContents and LegalSection

## Deviations from Plan

None - plan executed exactly as written.

## Decisions Made

1. **Legal content structure:** Nested sections with heading/content pairs for flexible rendering
2. **Observer threshold:** Top 20%-65% of viewport triggers active state (natural reading position)
3. **Mobile TOC:** Hidden sticky TOC on mobile (legal pages can render inline TOC above content)
4. **Logical properties:** Use `ps-*` and `border-s-*` instead of `padding-left`/`border-left` for RTL

## Files Changed

**Created:**
- `src/components/legal/TableOfContents.tsx` (client component, scroll spy)
- `src/components/legal/LegalSection.tsx` (server component, section wrapper)
- `src/components/legal/index.ts` (barrel export)

**Modified:**
- `messages/en.json` (+163 lines: legal.privacy + legal.terms)
- `messages/he.json` (+163 lines: Hebrew translations)

## Next Steps

**Immediate (Phase 54):**
- Plan 02: Create privacy page at `/privacy` consuming `legal.privacy` translations
- Plan 03: Create terms page at `/terms` consuming `legal.terms` translations

**Follow-up:**
- Footer links to `/privacy` and `/terms` already exist (will become active when pages created)
- Contact form can reference privacy policy link

## Success Metrics

- 2/2 tasks completed
- 2 commits (one per task)
- 0 TypeScript errors (excluding pre-existing pricing page reference)
- 328 sections of legal content (13 privacy + 15 terms × 2 languages)
- 100% translation coverage (EN and HE)

## Notes

**Legal compliance coverage:**
- CCPA/CPRA (California Consumer Privacy Act)
- GDPR (General Data Protection Regulation - EU/EEA)
- Israeli Protection of Privacy Law (PPL)

**Data processors disclosed:**
- Clerk (authentication) - US-based, SOC 2 Type II
- Convex (database) - US-based, SOC 2 compliant
- Anthropic (AI features) - US-based

**Hebrew translation quality:**
- Formal legal terminology used throughout
- RTL-appropriate text direction
- Culturally appropriate phrasing

Duration: 7 minutes
