# Feature Landscape: i18n + RTL Support

**Domain:** Web application internationalization with RTL support
**Researched:** 2026-01-19
**Confidence:** HIGH (verified via multiple authoritative sources)

## Table Stakes

Features users expect in a properly internationalized web application. Missing any of these creates a broken or amateurish experience.

### Core i18n Infrastructure

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **URL-based locale routing** | Users expect `/he/` and `/en/` paths; enables bookmarking, sharing, SEO | Medium | Use `[locale]` dynamic segment in App Router |
| **Static string externalization** | All UI text must be translatable, not hardcoded | Medium | Extract ~500+ strings to JSON files |
| **ICU message syntax** | Handles interpolation, pluralization, gender correctly | Low | next-intl uses ICU format natively |
| **Pluralization rules** | Hebrew has different plural forms than English | Low | ICU `{count, plural, ...}` handles this |
| **Date/time formatting** | 19/01/2026 vs 01/19/2026 vs other formats | Low | Use `Intl.DateTimeFormat` via next-intl |
| **Number formatting** | 1,234.56 vs 1.234,56 vs other conventions | Low | Use `Intl.NumberFormat` via next-intl |
| **Currency formatting** | $1,234 vs 1,234 $ vs symbol placement | Low | ILS and USD with locale-appropriate display |
| **Language switcher** | Users must be able to change language | Low | Preserve current path when switching |
| **Locale persistence** | Remember user's language choice | Low | Cookie-based persistence |

### RTL Layout Requirements

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **`dir="rtl"` on root element** | Browser interprets direction, flips flex/grid | Low | Dynamic based on locale |
| **CSS logical properties** | `margin-inline-start` instead of `margin-left` | High | Requires updating all Tailwind classes |
| **Sidebar position flip** | Navigation on right side for RTL | Medium | Automatically handled by logical properties |
| **Text alignment** | Right-aligned text in RTL | Low | `text-start` instead of `text-left` |
| **Form field alignment** | Input fields align correctly | Low | CSS logical properties handle this |
| **Scrollbar position** | Left side in RTL browsers | Low | Browser handles automatically |

### Directional Icon Handling

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Arrow/chevron mirroring** | Back arrow points right in RTL | Medium | Conditionally flip with `scale-x-[-1]` |
| **Navigation icon mirroring** | Menu, sidebar icons flip appropriately | Medium | Some icons should NOT flip (e.g., phone, home) |
| **Progress indicators** | Progress bars flow right-to-left | Low | CSS logical properties |

### SEO Requirements

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **hreflang tags** | Search engines serve correct language version | Medium | Add to all pages with alternates |
| **Self-referencing canonicals** | Each locale points to itself | Low | Standard SEO practice |
| **Localized metadata** | Title, description in each language | Medium | Part of translation workflow |
| **Localized sitemap** | URLs for all locales | Low | Generate per-locale URLs |

### Component-Level i18n

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Radix DirectionProvider** | Shadcn/Radix components respect RTL | Low | Wrap app with DirectionProvider |
| **Form validation messages** | Error messages in user's language | Medium | Use zod-i18n or translation keys |
| **Toast/notification messages** | System messages translated | Low | Use translation keys |
| **Empty states** | "No results" etc. translated | Low | Include in string extraction |

## Differentiators

Features that create an excellent i18n experience. Not strictly required, but significantly improve UX.

### Enhanced UX

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Auto-detection with graceful fallback** | Detect browser language, redirect appropriately | Medium | Middleware-based, respect `Accept-Language` |
| **Locale-specific fonts** | Hebrew may need different font weights | Low | Font stacks per locale |
| **Smooth transitions on locale change** | No jarring full-page reload | Medium | Client-side navigation preservation |
| **Relative time formatting** | "2 days ago" localized correctly | Low | `Intl.RelativeTimeFormat` |
| **List formatting** | "A, B, and C" vs "A, B and C" | Low | `Intl.ListFormat` |

### Advanced Bidirectional Support

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Bidirectional text isolation** | Mixed Hebrew/English in same string | Medium | `<bdi>` element for user content |
| **Unicode directional marks** | Punctuation in correct position | Medium | LRM/RLM characters when needed |
| **Property names/addresses** | English addresses in Hebrew UI | Medium | Isolate LTR content properly |
| **User-generated content** | Comments, posts with mixed content | High | Runtime direction detection |

### Developer Experience

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **TypeScript autocompletion** | IDE suggests translation keys | Low | next-intl provides this |
| **Missing translation detection** | Build-time warnings for missing keys | Medium | CI integration |
| **Namespace organization** | Modular translation files | Low | `common.json`, `properties.json`, etc. |
| **Translation key linting** | Detect unused/missing keys | Medium | eslint-plugin-i18n or similar |

### Content Management

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Pseudo-localization testing** | Test layout without real translations | Low | Extend strings with accents |
| **Translation progress tracking** | Know what's translated | Medium | TMS integration or manual tracking |
| **Context for translators** | Screenshots, descriptions with keys | Medium | Add to translation files |

## Anti-Features

Features to explicitly NOT build. Common mistakes that waste effort or create problems.

### Over-Engineering

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Build custom i18n framework** | Reinventing wheel, missing edge cases | Use next-intl, battle-tested |
| **Server-side locale detection only** | Ignores user preference, poor UX | Combine with cookie persistence |
| **Automatic content translation** | Low quality, misses context | Human translation for UI strings |
| **Translate user-generated content** | Complex, expensive, often unwanted | Leave UGC in original language |

### Common Implementation Mistakes

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **String concatenation** | Word order varies by language | Use ICU placeholders `{name}` |
| **Pixel-based layouts** | Translated text varies in length | Use flexible layouts, min/max widths |
| **Text in images** | Cannot be translated | Separate text from graphics |
| **Hardcoded date/number formats** | Different locales, different formats | Always use Intl API |
| **`rtl:` modifier everywhere** | Maintenance nightmare | Use CSS logical properties |
| **Single translation file** | Becomes huge, hard to maintain | Namespace by feature/page |

### RTL-Specific Anti-Patterns

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Mirroring ALL icons** | Some icons are universal (phone, home) | Selective mirroring list |
| **Testing with Lorem Ipsum** | Doesn't trigger RTL rendering | Test with actual Hebrew text |
| **Assuming flexbox auto-flips** | Only works with proper dir attribute | Verify DirectionProvider setup |
| **Ignoring bidirectional content** | Punctuation appears wrong | Use `<bdi>` and Unicode marks |

### SEO Anti-Patterns

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Same URL, different content** | Confuses search engines | Distinct URLs per locale |
| **Cross-locale canonicals** | Wrong: en page canonical to he page | Self-referencing canonicals |
| **Missing hreflang** | Search engines serve wrong version | Add hreflang to all pages |
| **Automatic redirects only** | Users can't choose, bad for SEO | Provide visible language switcher |

## Feature Dependencies

```
Core Infrastructure (must be first)
    |
    +-- URL-based routing
    |       |
    |       +-- Middleware locale detection
    |       +-- hreflang tags
    |       +-- Language switcher
    |
    +-- Translation file structure
    |       |
    |       +-- String externalization
    |       +-- ICU message syntax
    |       +-- Form validation messages
    |
    +-- RTL Layout
            |
            +-- dir attribute
            +-- DirectionProvider
            +-- CSS logical properties
            +-- Icon mirroring
```

**Phase Ordering Implication:**
1. Infrastructure first (routing, middleware, dir attribute)
2. Component updates (CSS logical properties, DirectionProvider)
3. Content extraction (string externalization)
4. Polish (icons, bidirectional text, testing)

## MVP Recommendation

For v1.4 MVP, prioritize in this order:

### Must Have (Week 1-2)
1. URL-based locale routing (`/he/`, `/en/`)
2. `dir="rtl"` dynamic attribute
3. Radix DirectionProvider wrapper
4. Basic string externalization for navigation and common UI
5. Language switcher component
6. Date/number/currency formatting

### Should Have (Week 2-3)
1. CSS logical properties migration (Tailwind classes)
2. Full Hebrew translation for all UI strings
3. hreflang and SEO metadata
4. Locale auto-detection with persistence
5. Form validation message translation

### Nice to Have (Week 3-4)
1. Directional icon handling
2. Bidirectional text support for user content
3. Pseudo-localization testing mode
4. Missing translation detection

### Defer to Post-v1.4
- User-generated content translation
- Additional languages beyond Hebrew/English
- Translation management system integration
- Advanced bidirectional text handling for complex cases

## Complexity Assessment

| Area | Effort | Risk | Notes |
|------|--------|------|-------|
| **Routing setup** | Low | Low | next-intl handles most complexity |
| **CSS migration** | High | Medium | Many files to update, find `left`/`right` |
| **String extraction** | High | Low | Tedious but straightforward |
| **Shadcn RTL** | Medium | Medium | Some components need manual fixes |
| **SEO tags** | Low | Low | Standard pattern |
| **Icon mirroring** | Medium | Low | Need to categorize all icons |

**Total estimated effort:** 2-4 weeks depending on string count and component complexity.

## Sources

### Authoritative (HIGH confidence)
- [Next.js Internationalization Guide](https://nextjs.org/docs/pages/guides/internationalization)
- [next-intl Documentation](https://next-intl.dev/)
- [Radix DirectionProvider](https://www.radix-ui.com/primitives/docs/utilities/direction-provider)
- [MDN CSS Logical Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Logical_properties_and_values/Margins_borders_padding)
- [W3C Internationalization Best Practices](https://www.w3.org/International/geo/html-tech/tech-bidi.html)
- [Google Multi-Regional Site Management](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)

### Community (MEDIUM confidence)
- [Phrase i18n Common Mistakes](https://phrase.com/blog/posts/10-common-mistakes-in-software-localization/)
- [Shopify i18n Best Practices](https://shopify.engineering/internationalization-i18n-best-practices-front-end-developers)
- [Smashing Magazine RTL Development](https://www.smashingmagazine.com/2017/11/right-to-left-mobile-design/)
- [shadcn-ui RTL Issues](https://github.com/shadcn-ui/ui/issues/2736)
- [zod-i18n Library](https://github.com/aiji42/zod-i18n)

### Framework-Specific (MEDIUM confidence)
- [Tailwind CSS RTL Plugin](https://github.com/20lives/tailwindcss-rtl)
- [tailwindcss-vanilla-rtl](https://github.com/thibaudcolas/tailwindcss-vanilla-rtl)
- [Flowbite RTL Support](https://flowbite.com/docs/customize/rtl/)
