# Project Research Summary

**Project:** REOS v1.4 Internationalization
**Domain:** Web application internationalization with Hebrew/RTL support
**Researched:** 2026-01-19
**Confidence:** HIGH

## Executive Summary

Adding internationalization with Hebrew/RTL support to the REOS Next.js 15 application is a well-understood problem with mature tooling. The recommended approach uses **next-intl v4** for translation and routing, combined with **Tailwind v4's native logical properties** for RTL layout. The existing stack (Next.js 16.1, Tailwind v4, Shadcn/ui, Clerk, Convex) is fully compatible with this approach, requiring no major technology additions beyond next-intl and the Radix DirectionProvider.

The architecture requires restructuring the app directory to add a `[locale]` dynamic segment wrapping all route groups. This is the most invasive change but is straightforward once the pattern is understood. The critical path runs through: infrastructure setup (routing, middleware composition) > RTL foundation (DirectionProvider, logical properties) > component migration > translation extraction. Each phase builds on the previous, with no opportunity for parallelization in the early stages.

The primary risk is the **CSS migration effort**. The codebase contains 255+ occurrences of hardcoded directional Tailwind classes (`ml-*`, `mr-*`, `left-*`, etc.) that must be converted to logical properties. Additionally, Shadcn/ui components have known RTL issues requiring manual patches. These are labor-intensive but low-risk tasks with well-documented patterns. The Clerk + next-intl middleware composition is a potential complexity point but has verified patterns in official documentation.

## Key Findings

### Recommended Stack

The i18n implementation requires minimal new dependencies. next-intl v4 is the clear choice for Next.js App Router - it provides server component support, ICU message syntax, TypeScript-first design, and documented Clerk middleware integration. No RTL plugins are needed because Tailwind v4 includes logical properties natively.

**Core technologies:**
- **next-intl ^4.7.0**: Translation, routing, formatting - purpose-built for App Router with native Server Component support
- **@radix-ui/react-direction ^1.1.1**: Global RTL context for Radix/Shadcn components
- **Heebo font**: Hebrew-Latin typeface via next/font (extends Roboto design language to Hebrew)

**DO NOT use:**
- next-i18next (does not support App Router)
- tailwindcss-rtl plugin (unnecessary with Tailwind v4)
- i18n config in next.config.js (deprecated for App Router)

### Expected Features

**Must have (table stakes):**
- URL-based locale routing (`/en/dashboard`, `/he/dashboard`)
- `dir="rtl"` dynamic attribute and CSS logical properties
- Static string externalization with ICU message syntax
- Date/number/currency formatting with Intl API
- Language switcher with locale persistence
- Radix DirectionProvider for Shadcn component RTL

**Should have (competitive):**
- CSS logical properties migration for all Tailwind classes
- Full Hebrew translation of all UI strings
- hreflang tags and localized SEO metadata
- Clerk component localization
- Locale auto-detection with cookie persistence

**Defer (v2+):**
- User-generated content translation
- Additional languages beyond English/Hebrew
- Translation management system integration
- Complex bidirectional text handling for mixed content

### Architecture Approach

The architecture follows a locale-segment pattern where all routes are nested under a `[locale]` dynamic segment. The existing route group structure `(app)`, `(auth)`, `(main)` is preserved, just moved one level deeper. The key providers stack in this order: ClerkProvider > NextIntlClientProvider > DirectionProvider > ConvexClientProvider.

**Major components:**
1. **Root Layout** (`app/layout.tsx`) - Minimal shell, just renders children
2. **Locale Layout** (`app/[locale]/layout.tsx`) - Sets html lang/dir, wraps with all providers, loads messages
3. **i18n Config** (`src/i18n/routing.ts`, `request.ts`) - Locale definitions, message loading
4. **Middleware** (`middleware.ts`) - Composes Clerk auth + next-intl routing, handles redirects

**Data flow:**
- Server: Request > Middleware (locale detection/redirect) > LocaleLayout (extract locale from params) > getMessages() > Server Components
- Client: NextIntlClientProvider > useTranslations hook > React context > Client Components
- RTL: `dir` attribute on html + DirectionProvider propagates to all Radix primitives

### Critical Pitfalls

Research identified 15 pitfalls. The top 5 require immediate attention:

1. **Hardcoded directional CSS classes** — 255+ occurrences of `ml-*`, `mr-*`, `left-*`, etc. must convert to logical properties (`ms-*`, `me-*`, `start-*`). Create migration script and ESLint rule.

2. **Shadcn/ui RTL issues** — sidebar, sheet, dropdown menus use physical positioning. Shadcn has no official RTL support (PR open 2+ years). Must patch components manually.

3. **Server/client hydration mismatch** — Dates/numbers formatted differently on server vs client causes React errors. Use next-intl formatters consistently with explicit timezone.

4. **Missing DirectionProvider** — Radix primitives don't inherit `dir` from HTML. Popovers, tooltips, dropdowns will position incorrectly without explicit DirectionProvider wrapping.

5. **Middleware composition** — Clerk and next-intl must be chained correctly. Clerk wraps outer, returns intlMiddleware response. Order matters for route protection.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Core i18n Infrastructure
**Rationale:** All other phases depend on routing and provider structure being in place first.
**Delivers:** Working locale routing with `/en/` and `/he/` paths, middleware composition, provider stack.
**Addresses:** URL-based routing, dir attribute, DirectionProvider
**Avoids:** Middleware conflicts (Pitfall 8), Missing DirectionProvider (Pitfall 4)

Tasks:
- Install next-intl, @radix-ui/react-direction
- Create i18n/routing.ts and i18n/request.ts
- Restructure app directory (add `[locale]` segment)
- Update middleware.ts to compose Clerk + next-intl
- Create LocaleLayout with all providers
- Add minimal translation files (en.json, he.json)
- Update html element with dynamic lang/dir

### Phase 2: RTL Component Foundation
**Rationale:** CSS migration must complete before page-level work to avoid double-handling components.
**Delivers:** RTL-safe component library, all Shadcn components working in both directions.
**Uses:** Tailwind v4 logical properties, DirectionProvider
**Avoids:** Hardcoded CSS pitfall (Pitfall 1), Shadcn RTL issues (Pitfall 2)

Tasks:
- Create CSS migration script for physical > logical properties
- Convert all `ml-*`/`mr-*`/etc to `ms-*`/`me-*` across codebase
- Audit and patch Shadcn components (sidebar.tsx, sheet.tsx, dropdown-menu.tsx)
- Create DirectionalIcon utility for arrow/chevron flipping
- Add ESLint rule to prevent future directional class usage
- Test all UI components in RTL mode

### Phase 3: AppShell RTL
**Rationale:** Navigation chrome is the most visible RTL impact; proves the RTL system works.
**Delivers:** Full RTL-aware navigation including sidebar, header, breadcrumbs.
**Implements:** Sidebar position flip, navigation layout, mobile menu

Tasks:
- Update Sidebar.tsx for RTL (rail position, collapse direction)
- Update AppShell header (search, user menu alignment)
- Update breadcrumbs separator direction
- Update mobile navigation drawer
- Test complete navigation flow in both directions

### Phase 4: Translation Infrastructure
**Rationale:** Once RTL layout works, focus shifts to content. String extraction is foundational for translation.
**Delivers:** All UI strings externalized to translation files, components using translation hooks.
**Addresses:** String externalization, ICU message syntax, form validation messages

Tasks:
- Create namespace structure (common, navigation, dashboard, properties, deals, etc.)
- Extract all hardcoded strings from components
- Implement useTranslations pattern in Server and Client components
- Add placeholder, aria-label, alt text translations
- Set up TypeScript type safety for translation keys

### Phase 5: Formatting and Localization
**Rationale:** After strings, handle data formatting and third-party component localization.
**Delivers:** Locale-aware dates, numbers, currency; localized Clerk components.
**Avoids:** Hydration mismatch (Pitfall 3), Clerk not localized (Pitfall 7)

Tasks:
- Replace date-fns format calls with next-intl useFormatter
- Replace number/currency formatting with useFormatter
- Configure timezone in i18n/request.ts
- Install @clerk/localizations, configure Hebrew
- Update Calendar component with Hebrew locale
- Test all data displays in both locales

### Phase 6: Hebrew Translation
**Rationale:** With infrastructure complete, content translation can proceed.
**Delivers:** Complete Hebrew translation of all UI strings.
**Addresses:** Full Hebrew translation from FEATURES.md

Tasks:
- Translate common.json namespace
- Translate navigation namespace
- Translate dashboard namespace
- Translate properties namespace
- Translate deals namespace
- Translate form validation messages
- Professional review of translations

### Phase 7: Language Switcher and Polish
**Rationale:** Final phase adds user-facing controls and handles edge cases.
**Delivers:** Working language switcher, locale persistence, SEO tags, production-ready i18n.
**Addresses:** Language switcher, locale persistence, hreflang tags

Tasks:
- Create language switcher component
- Add to AppShell header
- Implement cookie-based locale persistence
- Add locale auto-detection for new visitors
- Add hreflang tags to all pages
- Add localized metadata (title, description)
- Generate localized sitemap
- End-to-end testing of locale switching

### Phase Ordering Rationale

- **Infrastructure first (Phase 1):** All subsequent phases depend on the routing structure and provider stack. This cannot be parallelized.
- **RTL before content (Phases 2-3 before 4-6):** Extracting strings while also changing component structure leads to merge conflicts and rework. Complete CSS/layout changes first.
- **Components before AppShell (Phase 2 before 3):** The AppShell uses components from the UI library. Fix component-level RTL issues first.
- **Formatting before translation (Phase 5 before 6):** Ensures translators see proper date/number formatting patterns in context.
- **Polish last (Phase 7):** Language switcher and SEO are not blockers for development and testing.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2:** Shadcn component patches may require checking latest community solutions, specific component versions
- **Phase 6:** Hebrew translation may need native speaker review, real estate terminology research

Phases with standard patterns (skip research-phase):
- **Phase 1:** next-intl setup is well-documented with verified Clerk integration pattern
- **Phase 4:** String extraction is mechanical, patterns are clear
- **Phase 5:** Intl API and date-fns localization are standard
- **Phase 7:** Language switcher and SEO tags follow established patterns

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | next-intl v4 and Tailwind v4 logical properties are well-documented, version compatibility verified |
| Features | HIGH | i18n feature landscape is mature, table stakes vs differentiators well-understood |
| Architecture | HIGH | next-intl App Router pattern and Clerk middleware composition have official documentation |
| Pitfalls | HIGH | Pitfalls verified with GitHub issues, community reports, and official docs |

**Overall confidence:** HIGH

### Gaps to Address

- **Shadcn component patches:** While issues are documented, specific patch implementations may need iteration. Plan for component-by-component testing.
- **Hebrew translation quality:** UI translations should be reviewed by native Hebrew speaker with real estate domain knowledge. Budget for translation review.
- **Performance impact:** Adding i18n middleware and translation loading may affect TTFB. Monitor and optimize if needed.
- **Edge cases in bidirectional text:** Mixed English/Hebrew content (property addresses, names) may need `<bdi>` element usage. Address case-by-case during implementation.

## Sources

### Primary (HIGH confidence)
- [next-intl Official Documentation](https://next-intl.dev/docs/getting-started/app-router) — App Router setup, middleware, server/client patterns
- [next-intl 4.0 Release Notes](https://next-intl.dev/blog/next-intl-4-0) — TypeScript improvements, breaking changes
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs/padding) — Logical property utilities
- [Radix UI DirectionProvider](https://www.radix-ui.com/primitives/docs/utilities/direction-provider) — RTL context for primitives
- [Clerk Middleware Documentation](https://clerk.com/docs/reference/nextjs/clerk-middleware) — Middleware composition pattern
- [Clerk Localization](https://clerk.com/docs/guides/customizing-clerk/localization) — Hebrew localization setup

### Secondary (MEDIUM confidence)
- [Shadcn RTL Issue #2759](https://github.com/shadcn-ui/ui/issues/2759) — Community discussion of RTL challenges
- [Shadcn RTL PR #1638](https://github.com/shadcn-ui/ui/pull/1638) — Unmerged RTL support PR with implementation patterns
- [next-intl Guide 2025](https://www.buildwithmatija.com/blog/nextjs-internationalization-guide-next-intl-2025) — Community tutorial with patterns
- [Material Design Bidirectionality](https://material.io/design/usability/bidirectionality.html) — Icon mirroring best practices

### Tertiary (LOW confidence)
- [Shadcn Switch Direction Bug #8198](https://github.com/shadcn-ui/ui/issues/8198) — Specific component bug, may be fixed in newer versions

---
*Research completed: 2026-01-19*
*Ready for roadmap: yes*
