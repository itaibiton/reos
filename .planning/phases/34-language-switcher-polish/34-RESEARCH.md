# Phase 34: Language Switcher & Polish - Research

**Researched:** 2026-01-20
**Domain:** next-intl v4 language switching, locale persistence, browser detection
**Confidence:** HIGH

## Summary

This phase implements a language switcher component that allows users to toggle between English and Hebrew, with automatic persistence via next-intl's cookie mechanism and browser-based auto-detection for first-time visitors.

The codebase already has a complete next-intl v4 setup from Phase 28 with `localePrefix: 'always'`, `NextIntlClientProvider` in the Providers component, and locale-aware navigation utilities. The middleware correctly chains Clerk authentication with next-intl's locale handling.

**Primary recommendation:** Create a `LocaleSwitcher` client component using the existing `usePathname`, `useRouter` from `@/i18n/navigation`, and `useLocale` from `next-intl`. Place it in the AppShell header (right side, before UserButton) and the SidebarFooter. Use shadcn's DropdownMenu component with the Lucide `Languages` icon. Configure `localeCookie` with extended `maxAge` for persistent preference storage.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next-intl | ^4.7.0 | i18n framework | Already configured in Phase 28, provides `useLocale`, `useRouter` with locale support |
| lucide-react | ^0.562.0 | Icons | `Languages` and `Globe` icons available, consistent with existing icon usage |

### Supporting (Already Installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @radix-ui/react-dropdown-menu | (via shadcn) | Dropdown UI | Accessible dropdown for language selection |
| @radix-ui/react-direction | (installed) | RTL support | Already provides `DirectionProvider` in use |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| DropdownMenu | Select component | Select is better for forms; DropdownMenu better for action menus like settings |
| DropdownMenu | Simple Link toggle | Two-language toggle is simpler but harder to extend if more languages added |
| Globe icon | Languages icon | Languages icon explicitly represents i18n; Globe more generic |

**No new installations required** - all dependencies are already in place.

## Architecture Patterns

### Recommended Component Structure
```
src/
├── components/
│   └── LocaleSwitcher.tsx       # Client component for language switching
├── i18n/
│   ├── routing.ts               # Add localeCookie config (update)
│   ├── navigation.ts            # Already exports useRouter, usePathname
│   └── request.ts               # No changes needed
```

### Pattern 1: Client-Side Locale Switching with useRouter
**What:** Use next-intl's locale-aware `useRouter` with `replace()` to switch locales without full page reload
**When to use:** Any interactive language switcher component
**Example:**
```typescript
// Source: https://next-intl.dev/docs/routing/navigation
'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(newLocale: string) {
    router.replace(pathname, { locale: newLocale });
  }

  return (
    // DropdownMenu with routing.locales.map()
  );
}
```

### Pattern 2: Cookie Persistence with Extended maxAge
**What:** Configure `localeCookie` in routing.ts to persist user preference beyond session
**When to use:** When users should return to their chosen language across browser sessions
**Example:**
```typescript
// Source: https://next-intl.dev/docs/routing/configuration
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'he'],
  defaultLocale: 'en',
  localePrefix: 'always',
  localeCookie: {
    name: 'NEXT_LOCALE',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  },
});
```

### Pattern 3: Browser Accept-Language Detection
**What:** next-intl middleware automatically detects browser language on first visit
**When to use:** Built-in, no custom code needed
**How it works:**
1. User visits `/` without `NEXT_LOCALE` cookie
2. Middleware checks `Accept-Language` header
3. Uses `@formatjs/intl-localematcher` "best fit" algorithm
4. Redirects to matched locale (e.g., `/he` for Hebrew browser)
5. Sets `NEXT_LOCALE` session cookie

### Pattern 4: Link-Based Switching (Alternative)
**What:** Use next-intl's `Link` component with `locale` prop
**When to use:** Simple link-based switchers (already used in landing Footer)
**Example:**
```typescript
// Source: https://next-intl.dev/docs/routing/navigation
import { Link } from '@/i18n/navigation';

<Link href="/" locale="he">Switch to Hebrew</Link>
```

### Anti-Patterns to Avoid
- **Manual cookie setting:** Don't use `document.cookie` directly; let next-intl middleware handle it via `router.replace()`
- **Full page reload:** Don't use `window.location.href` for locale switching; use `router.replace()` for client-side navigation
- **Hardcoded locales:** Don't hardcode `['en', 'he']` in components; import from `routing.locales`
- **Ignoring RTL:** Don't forget to use `useDirection()` hook for RTL-aware dropdown positioning

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Locale cookie management | Custom cookie utils | next-intl's localeCookie config | Handles session/persistent, GDPR-compliant default, sameSite: lax |
| Browser language detection | Custom Accept-Language parsing | next-intl middleware | Uses @formatjs/intl-localematcher for proper locale matching (en-GB matches en-US) |
| URL locale handling | Manual path manipulation | `router.replace(pathname, { locale })` | Handles pathnames, query params, preserves scroll position |
| Dropdown positioning for RTL | Manual side calculation | Radix DropdownMenu with `useDirection()` | Automatically handles RTL positioning via DirectionProvider |

**Key insight:** next-intl v4's middleware handles the entire locale detection cascade (URL -> cookie -> Accept-Language -> default). The component only needs to trigger a route change; persistence is automatic.

## Common Pitfalls

### Pitfall 1: Stale Cookie During Testing
**What goes wrong:** After switching locale, switching back doesn't work; seems stuck
**Why it happens:** `NEXT_LOCALE` cookie takes precedence over Accept-Language; browser DevTools may not show it
**How to avoid:** Clear cookies when testing; use browser's Application tab to inspect `NEXT_LOCALE`
**Warning signs:** Locale doesn't change on navigation; browser language detection seems broken

### Pitfall 2: Missing NextIntlClientProvider
**What goes wrong:** `useLocale()` throws error: "NextIntlClientProvider not found"
**Why it happens:** Client component rendered outside provider hierarchy
**How to avoid:** Ensure `LocaleSwitcher` is within the app's provider tree (already set up in Providers.tsx)
**Warning signs:** Runtime error in client component

### Pitfall 3: Dropdown Positioning in RTL
**What goes wrong:** Dropdown appears on wrong side in Hebrew mode
**Why it happens:** Default `side="bottom"` doesn't account for RTL reading direction
**How to avoid:** Use `align="end"` with Radix DropdownMenuContent; the existing `DirectionProvider` handles the rest
**Warning signs:** Dropdown covers trigger button or appears off-screen in RTL

### Pitfall 4: Locale Not Updating Immediately
**What goes wrong:** Page content doesn't update after clicking language switcher
**Why it happens:** Using `router.push()` instead of `router.replace()`, or not calling `router.refresh()` if needed
**How to avoid:** Use `router.replace(pathname, { locale: newLocale })` - this triggers a soft navigation with locale change
**Warning signs:** URL changes but text remains in old language

### Pitfall 5: Session Cookie vs Persistent Cookie
**What goes wrong:** User returns next day and sees default English instead of their chosen Hebrew
**Why it happens:** Default `localeCookie` is session-only (no maxAge), clears on browser close
**How to avoid:** Configure `localeCookie: { maxAge: 60 * 60 * 24 * 365 }` in routing.ts
**Warning signs:** Preference "forgets" between browser sessions

## Code Examples

Verified patterns from official sources:

### LocaleSwitcher Component
```typescript
// Source: https://next-intl.dev/docs/routing/navigation + shadcn DropdownMenu
'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Languages } from 'lucide-react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const localeNames: Record<string, string> = {
  en: 'English',
  he: 'עברית',
};

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('common.language');

  function switchLocale(newLocale: string) {
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Languages className="h-4 w-4" />
          <span className="sr-only">{t('switchLanguage')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {routing.locales.map((l) => (
          <DropdownMenuItem
            key={l}
            onClick={() => switchLocale(l)}
            className={locale === l ? 'bg-accent' : ''}
          >
            {localeNames[l]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### Updated routing.ts with Cookie Persistence
```typescript
// Source: https://next-intl.dev/docs/routing/configuration
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'he'],
  defaultLocale: 'en',
  localePrefix: 'always',
  localeCookie: {
    name: 'NEXT_LOCALE',
    maxAge: 60 * 60 * 24 * 365, // Persist for 1 year
  },
});
```

### Translation Keys Structure
```json
{
  "common": {
    "language": {
      "switchLanguage": "Switch language",
      "english": "English",
      "hebrew": "Hebrew"
    }
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `localeDetection: false` to disable cookie | `localeCookie: false` | next-intl v4.0 | Config is now explicit; separate concerns |
| Manual cookie in language switcher | `router.replace()` with locale option | next-intl v3+ | Cookie set automatically by middleware on redirect |
| `middleware.ts` filename | `proxy.ts` filename | Next.js 16 | Middleware renamed to proxy (current codebase uses middleware.ts, still works) |

**Deprecated/outdated:**
- Using `localeDetection: false` to prevent cookie: Now use `localeCookie: false`
- Setting cookies manually in switcher component: Middleware handles this automatically

## Open Questions

Things that couldn't be fully resolved:

1. **Placement priority: Header vs Sidebar Footer**
   - What we know: Both are viable; Header is more visible, Sidebar footer is conventional for settings
   - What's unclear: Product preference for primary placement
   - Recommendation: Add to both - header for quick access, sidebar footer for discoverability

2. **Visual indicator for current language**
   - What we know: Current footer uses text highlighting; dropdown can use checkmark or background
   - What's unclear: Whether to show flag icons (US/Israel flags) or text only
   - Recommendation: Use text labels (`English` / `עברית`) without flags; cleaner and more accessible

3. **Auth pages language switcher**
   - What we know: Sign-in/sign-up pages use Clerk components; they're outside AppShell
   - What's unclear: Whether language switcher should appear on auth pages
   - Recommendation: Consider adding to auth layout if users need to switch before signing in

## Sources

### Primary (HIGH confidence)
- [next-intl Routing Configuration](https://next-intl.dev/docs/routing/configuration) - localeCookie, localeDetection options
- [next-intl Navigation APIs](https://next-intl.dev/docs/routing/navigation) - useRouter, usePathname, Link with locale
- [next-intl Middleware](https://next-intl.dev/docs/routing/middleware) - locale detection cascade, Accept-Language handling
- [next-intl 4.0 Release](https://next-intl.dev/blog/next-intl-4-0) - v4 changes including localeCookie default behavior

### Secondary (MEDIUM confidence)
- [next-intl GitHub Discussion #532](https://github.com/amannn/next-intl/discussions/532) - Language switcher patterns from community
- [shadcn/ui DropdownMenu](https://ui.shadcn.com/docs/components/dropdown-menu) - Component usage patterns
- [Lucide Icons](https://lucide.dev/icons/languages) - Languages icon for switcher trigger

### Tertiary (LOW confidence)
- General i18n best practices from blog posts (validated against official docs)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed and configured from Phase 28
- Architecture: HIGH - Patterns verified against official next-intl v4 documentation
- Pitfalls: HIGH - Based on official documentation and well-documented GitHub issues
- UI placement: MEDIUM - Based on existing codebase patterns (AppShell, Sidebar)

**Research date:** 2026-01-20
**Valid until:** 2026-04-20 (next-intl v4 is stable; patterns unlikely to change soon)

## Existing Codebase Integration Points

### Files to Modify
| File | Change |
|------|--------|
| `src/i18n/routing.ts` | Add `localeCookie` configuration with maxAge |
| `src/components/layout/AppShell.tsx` | Add LocaleSwitcher to header (before UserButton) |
| `src/components/layout/Sidebar.tsx` | Add LocaleSwitcher to SidebarFooter |
| `messages/en.json` | Add `common.language` translation keys |
| `messages/he.json` | Add `common.language` translation keys |

### Files to Create
| File | Purpose |
|------|---------|
| `src/components/LocaleSwitcher.tsx` | Main language switcher component |

### Existing Patterns to Leverage
- `useTranslations` hook already used throughout codebase
- `Link` from `@/i18n/navigation` already locale-aware
- `DirectionProvider` already wraps app for RTL support
- `routing.locales` available for locale list
- Footer already has text-based language links (can reference for styling)
