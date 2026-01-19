# Domain Pitfalls: i18n + RTL for Existing Next.js Application

**Domain:** Internationalization and RTL support for Next.js 15 + Shadcn/ui
**Researched:** 2026-01-19
**Confidence:** HIGH (verified with official documentation and multiple sources)

---

## Critical Pitfalls

Mistakes that cause rewrites, broken UIs, or major architectural issues.

---

### Pitfall 1: Hardcoded Directional CSS Classes

**What goes wrong:** The codebase uses `ml-*`, `mr-*`, `pl-*`, `pr-*`, `left-*`, `right-*`, `text-left`, `text-right`, `border-l-*`, `border-r-*` throughout 83+ files with 255+ occurrences. When RTL is enabled, these classes don't flip automatically, causing broken layouts.

**Why it happens:** Tailwind's directional classes (`ml-4`, `pr-2`) map to physical directions (left/right) rather than logical directions (start/end). In LTR they look correct, but in RTL the sidebar ends up on the wrong side, margins are backwards, and text alignment breaks.

**Consequences:**
- Sidebar appears on wrong side or overlaps content
- Spacing is reversed (padding/margins on wrong side)
- Icons and navigation elements point wrong direction
- Forms and inputs have backwards layouts
- The entire UI feels "mirrored incorrectly"

**Warning signs:**
- Grep for `ml-|mr-|pl-|pr-|left-|right-|text-left|text-right|border-l|border-r` returns many results
- Components use hardcoded `side="left"` or `side="right"` props
- Fixed positioning uses `left-0` or `right-0` without RTL variants

**Prevention:**
1. **Phase 1 task:** Create migration script to replace physical properties with logical:
   - `ml-*` -> `ms-*` (margin-inline-start)
   - `mr-*` -> `me-*` (margin-inline-end)
   - `pl-*` -> `ps-*` (padding-inline-start)
   - `pr-*` -> `pe-*` (padding-inline-end)
   - `text-left` -> `text-start`
   - `text-right` -> `text-end`
   - `left-*` -> `start-*` (for positioning)
   - `right-*` -> `end-*`
   - `border-l-*` -> `border-s-*`
   - `border-r-*` -> `border-e-*`

2. **ESLint rule:** Add custom rule to warn on physical directional classes

3. **For cases where physical is intentional:** Use `rtl:` variant explicitly:
   ```tsx
   // Icon that should NOT flip
   <Icon className="rotate-0" />

   // Element that needs different RTL behavior
   <div className="left-0 rtl:left-auto rtl:right-0">
   ```

**Detection:** Run `grep -r "ml-\|mr-\|pl-\|pr-\|text-left\|text-right" src/` - current count: 255 occurrences

**Phase to address:** Phase 1 (Infrastructure) - Must be done before any component work

---

### Pitfall 2: Shadcn/ui Components Ship LTR-Biased

**What goes wrong:** Shadcn/ui components have hardcoded LTR assumptions. The sidebar, sheet, dropdown menus, and many other components use physical positioning that breaks in RTL.

**Why it happens:** Shadcn/ui officially does not have RTL support. There's been an [open PR for 2+ years](https://github.com/shadcn-ui/ui/pull/1638) with no merge. The components assume LTR and use classes like `right-4`, `left-0`, `border-l`, etc.

**Consequences:**
- `Sheet` component slides from wrong direction
- `Sidebar` rail and resize handle positioned incorrectly
- `DropdownMenu` and `ContextMenu` open on wrong side
- `Tooltip` appears on wrong side when `side="right"`
- Close buttons (`X`) positioned incorrectly
- `SidebarMenuSub` border on wrong side

**Warning signs:**
- Sheet component has `side="left"` or `side="right"` without RTL logic
- Sidebar uses `group-data-[side=left]` and `group-data-[side=right]` selectors
- Components use `absolute right-4` for close buttons

**Prevention:**
1. **Wrap app with Radix DirectionProvider:**
   ```tsx
   import { DirectionProvider } from '@radix-ui/react-direction';

   <DirectionProvider dir={locale === 'he' ? 'rtl' : 'ltr'}>
     {children}
   </DirectionProvider>
   ```

2. **Fork/patch affected Shadcn components:**
   - `sidebar.tsx`: Replace all `left`/`right` with logical equivalents or RTL variants
   - `sheet.tsx`: Make `side` prop RTL-aware
   - `dropdown-menu.tsx`: Use `side="start"` / `side="end"` where possible

3. **Create RTL-aware wrapper components:**
   ```tsx
   function RTLSheet({ side, ...props }) {
     const { dir } = useDirection();
     const actualSide = dir === 'rtl'
       ? (side === 'left' ? 'right' : 'left')
       : side;
     return <Sheet side={actualSide} {...props} />;
   }
   ```

**Detection:** Search components for `side="left"`, `side="right"`, `right-*`, `left-*`

**Phase to address:** Phase 1-2 (Infrastructure + Component Patches)

---

### Pitfall 3: Server/Client Hydration Mismatch with Dates and Numbers

**What goes wrong:** Dates render as "January 15, 2026" on server but "15 January 2026" or different timezone on client, causing React hydration errors. Numbers may show as "1,234" vs "1.234" depending on locale.

**Why it happens:** Server runs in UTC or deployment timezone. Client runs in user's browser timezone. Locale-specific formatting (date order, number separators, Arabic numerals) differs between environments.

**Consequences:**
- React hydration errors flood console
- Dates flicker or show incorrect values
- Numbers display inconsistently
- SSR benefits lost as React must re-render client-side
- Property prices, dates, timestamps all affected

**Warning signs:**
- Using `new Date().toLocaleDateString()` without explicit locale/timezone
- `date-fns` format calls without locale configuration
- Displaying timestamps from Convex without timezone handling
- Numbers formatted with `toLocaleString()` without explicit locale

**Prevention:**
1. **Use next-intl's centralized configuration:**
   ```ts
   // i18n/request.ts
   export default getRequestConfig(async ({ locale }) => ({
     messages: (await import(`../messages/${locale}.json`)).default,
     timeZone: 'Asia/Jerusalem', // Or user preference
     now: new Date(),
   }));
   ```

2. **Use next-intl formatters consistently:**
   ```tsx
   const format = useFormatter();
   format.dateTime(date, { dateStyle: 'long' });
   format.number(price, { style: 'currency', currency: 'ILS' });
   ```

3. **For real-time Convex data:** Store timestamps as Unix/ISO, format on client with consistent locale context

4. **Add `suppressHydrationWarning` as last resort** for purely presentational time displays

**Detection:** Search for `toLocaleDateString`, `toLocaleString`, `format(` from date-fns without locale

**Phase to address:** Phase 2 (i18n Setup) - Must establish patterns before component migration

---

### Pitfall 4: Missing Radix DirectionProvider

**What goes wrong:** Radix primitives (used by Shadcn/ui) don't inherit `dir` attribute from HTML element. Components like dropdown, tooltip, and popover position incorrectly even with `dir="rtl"` on `<html>`.

**Why it happens:** Radix had a [breaking change](https://www.radix-ui.com/primitives/docs/overview/releases) requiring explicit `DirectionProvider`. Previously relied on document inheritance, now requires explicit wrapping.

**Consequences:**
- Popovers open on wrong side
- Dropdowns animate in wrong direction
- Tooltips positioned incorrectly
- Carousels navigate backwards
- Sheet slides from wrong edge

**Warning signs:**
- RTL enabled but Radix components still behave LTR
- `dir="rtl"` on html but popover opens on right instead of left

**Prevention:**
1. **Add DirectionProvider at app root:**
   ```tsx
   // app/layout.tsx
   import { DirectionProvider } from '@radix-ui/react-direction';

   export default function RootLayout({ children, params }) {
     const dir = params.locale === 'he' ? 'rtl' : 'ltr';
     return (
       <html lang={params.locale} dir={dir}>
         <body>
           <DirectionProvider dir={dir}>
             {children}
           </DirectionProvider>
         </body>
       </html>
     );
   }
   ```

2. **Test with devtools:** Toggle `dir` attribute and verify all Radix components respond

**Detection:** Check if `DirectionProvider` is imported and used in layout

**Phase to address:** Phase 1 (Infrastructure) - Foundation before component work

---

### Pitfall 5: Translation String Extraction Nightmare

**What goes wrong:** Existing 35,000 LOC codebase has thousands of hardcoded English strings scattered across components. Manual extraction is error-prone, time-consuming, and strings get missed.

**Why it happens:** i18n wasn't planned from the start. Strings are embedded in JSX, spread across many files, and some are constructed dynamically.

**Consequences:**
- Incomplete translations (English shows through)
- Inconsistent translation keys
- Duplicate translations
- Missed strings in edge cases
- Technical debt accumulates

**Warning signs:**
- JSX contains literal English text: `<Button>Save</Button>`
- Dynamic strings: `{`Property in ${city}`}`
- Error messages hardcoded in functions
- Alt text, aria-labels, placeholders all English

**Prevention:**
1. **Use automated extraction tools:**
   - `i18next-parser` or `babel-plugin-react-intl` for extraction
   - Consider `locize` or similar for translation management

2. **Establish naming conventions:**
   ```
   messages/
     en/
       common.json    # Shared across app
       dashboard.json # Dashboard-specific
       properties.json
       ...
   ```

3. **Create extraction script:**
   ```bash
   # Find all literal strings in JSX
   grep -rn ">[A-Z][a-zA-Z ]*<" src/components/
   ```

4. **Phase extraction by priority:**
   - Phase 1: UI chrome (nav, buttons, labels)
   - Phase 2: Content pages
   - Phase 3: Error messages, edge cases

5. **Add TypeScript checks:**
   ```tsx
   // next-intl provides type safety for keys
   const t = useTranslations('Dashboard');
   t('title'); // Type-checked against messages
   ```

**Detection:** Run `grep -r ">[A-Z][a-zA-Z]" src/` to find hardcoded strings

**Phase to address:** Phase 2-3 (Ongoing throughout implementation)

---

## Moderate Pitfalls

Mistakes that cause delays, technical debt, or degraded UX.

---

### Pitfall 6: Icons That Shouldn't Flip, Flip (and Vice Versa)

**What goes wrong:** All icons flip with `scaleX(-1)` in RTL, but some icons (checkmarks, universal symbols, brand logos) should never flip, while directional icons (arrows, chevrons) should.

**Why it happens:** No icon categorization strategy. Blanket RTL flip rule applied, or no rule at all.

**Consequences:**
- Checkmarks look wrong (backwards)
- Brand logos reversed
- Navigation arrows correct but universal icons broken
- Clock icons show counter-clockwise (wrong)
- Inconsistent visual language

**Warning signs:**
- Using `rtl:scale-x-[-1]` on all icons
- No icon wrapper component for consistent behavior
- HugeIcons used directly without RTL consideration

**Prevention:**
1. **Categorize icons:**
   - **Flip:** Arrows, chevrons, navigation, progress indicators
   - **No flip:** Checkmarks, clocks, universal symbols, brands, Hugeicons logo

2. **Create Icon wrapper:**
   ```tsx
   const DIRECTIONAL_ICONS = ['ArrowLeft', 'ArrowRight', 'ChevronLeft', ...];

   function Icon({ name, ...props }) {
     const shouldFlip = DIRECTIONAL_ICONS.includes(name);
     return (
       <HugeIcon
         icon={name}
         className={cn(shouldFlip && 'rtl:scale-x-[-1]', props.className)}
       />
     );
   }
   ```

3. **Document icon behavior** in design system

**Detection:** Audit all icon usages, especially in navigation and actions

**Phase to address:** Phase 2 (Component migration)

---

### Pitfall 7: Clerk Auth Components Not Localized

**What goes wrong:** Clerk sign-in/sign-up modals remain English while rest of app is Hebrew, creating jarring UX mismatch.

**Why it happens:** Clerk requires separate localization setup via `@clerk/localizations` package. Not automatically included.

**Consequences:**
- Sign-in form in English, app in Hebrew
- Error messages not localized
- User confusion at authentication boundary
- Unprofessional appearance

**Warning signs:**
- `ClerkProvider` without `localization` prop
- `@clerk/localizations` not in dependencies

**Prevention:**
1. **Install and configure Clerk localizations:**
   ```bash
   npm install @clerk/localizations
   ```

   ```tsx
   import { ClerkProvider } from '@clerk/nextjs';
   import { heIL } from '@clerk/localizations';

   <ClerkProvider localization={locale === 'he' ? heIL : undefined}>
   ```

2. **Note:** Hebrew (heIL) is community-contributed, may need customization

3. **Sync locale between next-intl and Clerk** in middleware

**Detection:** Check if `@clerk/localizations` is in package.json

**Phase to address:** Phase 2 (i18n Infrastructure)

---

### Pitfall 8: Next.js App Router i18n Routing Complexity

**What goes wrong:** URL structure becomes complex with locale segments (`/en/properties`, `/he/properties`). Existing links break, redirects malfunction, middleware misconfigured.

**Why it happens:** App Router doesn't have built-in i18n like Pages Router did. Must implement via dynamic route segment `[locale]` and middleware.

**Consequences:**
- Links missing locale prefix return 404
- Hard-coded internal links break
- SEO issues with duplicate content
- Middleware conflicts with Clerk middleware
- API routes accidentally i18n-routed

**Warning signs:**
- Using `<Link href="/properties">` instead of locale-aware links
- No middleware.ts or middleware doesn't handle locales
- API routes under app/ folder affected by locale routing

**Prevention:**
1. **Use next-intl's navigation utilities:**
   ```tsx
   import { Link, useRouter } from '@/i18n/routing';

   // Automatically handles locale
   <Link href="/properties">Browse</Link>
   ```

2. **Configure middleware matcher correctly:**
   ```ts
   export const config = {
     matcher: [
       // Match all paths except static files, api routes
       '/((?!api|_next|.*\\..*).*)'
     ]
   };
   ```

3. **Chain Clerk and next-intl middlewares:**
   ```ts
   import { clerkMiddleware } from '@clerk/nextjs/server';
   import createIntlMiddleware from 'next-intl/middleware';

   const intlMiddleware = createIntlMiddleware({...});

   export default clerkMiddleware(async (auth, req) => {
     // Clerk first, then i18n
     return intlMiddleware(req);
   });
   ```

4. **Move API routes** outside locale routing or exclude in matcher

**Detection:** Check for hardcoded paths in `<Link>` components

**Phase to address:** Phase 1 (Infrastructure) - Must be solid before page migration

---

### Pitfall 9: Tailwind RTL Classes Not Generating

**What goes wrong:** RTL variant classes (`rtl:mr-4`) exist in code but don't apply. Styles broken in RTL mode.

**Why it happens:**
- Tailwind v4 moved PostCSS to `@tailwindcss/postcss` - using old config breaks generation
- Conditional classes not scanned at build time
- SafeList not configured for dynamic RTL classes

**Consequences:**
- RTL styles silently fail
- Debugging is confusing (classes in HTML but no effect)
- Works in dev, breaks in production

**Warning signs:**
- Using Tailwind v4 but `tailwindcss` as PostCSS plugin (should be `@tailwindcss/postcss`)
- Dynamic class construction: `${isRTL ? 'mr-4' : 'ml-4'}`
- Classes in HTML inspector but styles not applied

**Prevention:**
1. **Verify Tailwind v4 PostCSS config:**
   ```js
   // postcss.config.js (Tailwind v4)
   module.exports = {
     plugins: {
       '@tailwindcss/postcss': {},  // NOT 'tailwindcss'
     },
   };
   ```

2. **Avoid dynamic class construction** - use logical properties instead:
   ```tsx
   // Bad - class might not generate
   className={isRTL ? 'mr-4' : 'ml-4'}

   // Good - always generates, adapts automatically
   className="me-4"
   ```

3. **Test RTL in production build** - not just dev mode

**Detection:** Build app, check if RTL classes in bundle

**Phase to address:** Phase 1 (Infrastructure verification)

---

### Pitfall 10: Switch/Toggle Component Direction Bug

**What goes wrong:** Shadcn Switch component thumb moves wrong direction in RTL, or breaks when dynamically switching languages.

**Why it happens:** [Known bug](https://github.com/shadcn-ui/ui/issues/8198) - Tailwind generates classes based on first render. If app starts in LTR and switches to RTL, the RTL classes never made it into the CSS bundle.

**Consequences:**
- Switch thumb animates wrong direction
- Toggle feels "backwards" to RTL users
- Dynamic language switching breaks component

**Warning signs:**
- Switch works in one direction but not when language changes
- Component correct on page load but breaks on locale switch

**Prevention:**
1. **Ensure both LTR and RTL classes are always in bundle:**
   ```tsx
   // Force both variants to be included
   <Switch className="data-[state=checked]:rtl:translate-x-[-100%] data-[state=checked]:ltr:translate-x-full" />
   ```

2. **Use Tailwind safelist for critical RTL classes:**
   ```js
   // tailwind.config.js
   module.exports = {
     safelist: [
       'rtl:translate-x-[-100%]',
       'ltr:translate-x-full',
       // ... other critical RTL classes
     ]
   }
   ```

3. **Test language switching flow** - don't just test static RTL

**Detection:** Switch language dynamically and test toggle components

**Phase to address:** Phase 2 (Component patches)

---

## Minor Pitfalls

Issues that cause annoyance but are easily fixable.

---

### Pitfall 11: Toaster Position Incorrect

**What goes wrong:** Toast notifications appear in wrong corner for RTL users (bottom-right feels wrong, should be bottom-left).

**Why it happens:** Toaster component has hardcoded `position="bottom-right"` in layout.

**Consequences:**
- Toasts appear in unexpected location
- Minor UX inconsistency

**Prevention:**
```tsx
<Toaster position={dir === 'rtl' ? 'bottom-left' : 'bottom-right'} />
```

**Detection:** Check Toaster component position prop

**Phase to address:** Phase 2 (Quick fix during component review)

---

### Pitfall 12: Breadcrumb Separator Direction

**What goes wrong:** Breadcrumb separators (`/` or `>`) point wrong direction in RTL, or don't flip.

**Why it happens:** Separator is visual arrow/slash that implies direction.

**Consequences:**
- Navigation hierarchy feels backwards
- Minor visual inconsistency

**Prevention:**
```tsx
// Use CSS to flip separator, or use neutral separator
<BreadcrumbSeparator className="rtl:rotate-180">
  <ChevronRight />
</BreadcrumbSeparator>
```

**Detection:** Visual review of breadcrumbs in RTL

**Phase to address:** Phase 2 (Component review)

---

### Pitfall 13: Calendar Component Locale

**What goes wrong:** Calendar shows English month names, wrong week start day (Sunday vs Saturday for Hebrew).

**Why it happens:** react-day-picker (used by Shadcn calendar) needs explicit locale configuration.

**Consequences:**
- Calendar shows "January" instead of Hebrew month
- Week starts on wrong day
- Date picker feels foreign

**Prevention:**
```tsx
import { he } from 'date-fns/locale';

<Calendar
  locale={currentLocale === 'he' ? he : undefined}
  weekStartsOn={currentLocale === 'he' ? 0 : 0} // Configure per locale
/>
```

**Detection:** Check Calendar component for locale prop

**Phase to address:** Phase 2 (Component customization)

---

### Pitfall 14: Placeholder Text Not Translated

**What goes wrong:** Input placeholders, aria-labels, and alt text remain English.

**Why it happens:** These are often overlooked during translation - not visible in normal string extraction.

**Consequences:**
- "Search..." shows in English in Hebrew UI
- Accessibility compromised for RTL screen reader users
- Incomplete localization

**Prevention:**
1. **Include in translation extraction:** Search for `placeholder=`, `aria-label=`, `alt=`
2. **Use translation function for all user-visible text:**
   ```tsx
   <Input placeholder={t('search.placeholder')} />
   <img alt={t('property.mainImage')} />
   ```

**Detection:** `grep -r "placeholder=\"" src/`

**Phase to address:** Phase 3 (Content translation)

---

### Pitfall 15: Arabic Plural Forms Complexity

**What goes wrong:** Arabic has 6 plural forms (zero, one, two, few, many, other). Using simple singular/plural breaks grammar.

**Why it happens:** English only has 2 forms, developers unfamiliar with Arabic grammar.

**Consequences:**
- "1 properties" or "5 property" grammatical errors
- Unprofessional appearance to Arabic speakers

**Prevention:**
```json
// messages/ar.json
{
  "properties": {
    "count": "{count, plural, =0 {لا توجد عقارات} one {عقار واحد} two {عقاران} few {# عقارات} many {# عقار} other {# عقار}}"
  }
}
```

**Detection:** Review all plural translations with Arabic speaker

**Phase to address:** Phase 3 (Content translation) - Requires Arabic expertise

---

## Phase-Specific Warnings

| Phase | Topic | Likely Pitfall | Mitigation |
|-------|-------|---------------|------------|
| 1 | Infrastructure | Tailwind PostCSS config wrong (v4) | Verify `@tailwindcss/postcss` not `tailwindcss` |
| 1 | Infrastructure | DirectionProvider missing | Add at root layout, wrap entire app |
| 1 | Infrastructure | Middleware conflicts (Clerk + i18n) | Chain middlewares correctly |
| 2 | Components | Shadcn sidebar/sheet broken | Patch with logical properties |
| 2 | Components | Switch direction bug | Safelist RTL classes |
| 2 | Components | Icons flip incorrectly | Create categorized Icon wrapper |
| 2 | Components | Clerk not localized | Add `@clerk/localizations` |
| 3 | Content | Missing string extraction | Automated tooling + manual review |
| 3 | Content | Date/time hydration errors | Use next-intl formatters consistently |
| 3 | Content | Arabic plurals wrong | Consult native speaker, use ICU format |
| 4 | Testing | RTL only tested statically | Test dynamic locale switching |
| 4 | Testing | Dev works, prod broken | Test production builds |

---

## Pre-Implementation Checklist

Before starting i18n work:

- [ ] Verify Tailwind v4 PostCSS configuration is correct
- [ ] Count hardcoded directional classes (`ml-`, `mr-`, etc.)
- [ ] Audit Shadcn components for RTL issues (sidebar, sheet, menus)
- [ ] Check if DirectionProvider needed for Radix components
- [ ] Plan string extraction strategy
- [ ] Set up translation management (files, tooling)
- [ ] Decide on URL structure (`/he/...` vs subdomain vs cookie)
- [ ] Plan Clerk localization integration
- [ ] Create RTL testing strategy (manual + automated)

---

## Sources

### Official Documentation
- [Next.js Internationalization Guide](https://nextjs.org/docs/pages/guides/internationalization)
- [next-intl App Router Setup](https://next-intl.dev/docs/getting-started/app-router)
- [next-intl Date Formatting](https://next-intl.dev/blog/date-formatting-nextjs)
- [Radix DirectionProvider](https://www.radix-ui.com/primitives/docs/utilities/direction-provider)
- [Tailwind CSS Logical Properties](https://tailwindcss.com/docs/padding)
- [Clerk Localization](https://clerk.com/docs/components/customization/localization)

### Community Issues & Discussions
- [Shadcn RTL Support Issue #2759](https://github.com/shadcn-ui/ui/issues/2759)
- [Shadcn RTL PR #1638](https://github.com/shadcn-ui/ui/pull/1638) (open 2+ years)
- [Shadcn Switch Direction Bug #8198](https://github.com/shadcn-ui/ui/issues/8198)
- [Shadcn Logical Properties Issue #1919](https://github.com/shadcn-ui/ui/issues/1919)
- [Tailwind RTL Discussion #1492](https://github.com/tailwindlabs/tailwindcss/discussions/1492)
- [Radix RTL Support Issue #11](https://github.com/radix-ui/themes/issues/11)

### Guides & Articles
- [next-intl Guide 2025](https://www.buildwithmatija.com/blog/nextjs-internationalization-guide-next-intl-2025)
- [Solving i18n Pitfalls in Next.js](https://medium.com/@rameshkannanyt0078/solving-common-i18n-pitfalls-in-next-js-static-ssr-real-time-translation-workflows-b574c440cd3f)
- [Icons RTL Mirroring Best Practices](https://dev.to/pffigueiredo/icons-have-meaning-rtl-in-a-web-platform-4-6-19of)
- [Flowbite RTL Support](https://flowbite.com/docs/customize/rtl/)
- [Material Design Bidirectionality](https://material.io/design/usability/bidirectionality.html)
