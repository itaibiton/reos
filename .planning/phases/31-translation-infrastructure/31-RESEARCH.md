# Phase 31: Translation Infrastructure - Research

**Researched:** 2026-01-20
**Domain:** next-intl string extraction and namespace organization
**Confidence:** HIGH

## Summary

This phase involves extracting all hardcoded UI strings from the REOS application into translation files and organizing them by namespace. The existing next-intl v4 infrastructure (Phase 28) is already configured with message loading in `src/i18n/request.ts`, and the landing page components already demonstrate the translation pattern.

Key findings:
- **~594 hardcoded strings** exist across ~88 component files that need extraction
- **next-intl patterns already established**: Landing page components use `useTranslations('landing.section')` pattern successfully
- **Existing translation files**: `messages/en.json` and `messages/he.json` contain ~190 keys (landing namespace only)
- **Feature domains identified**: 8 clear namespaces map to the app structure (common, navigation, dashboard, properties, deals, chat, feed, settings)
- **Client vs Server components**: All app pages are client components (`"use client"`), so `useTranslations` is the primary API

**Primary recommendation:** Organize translations by feature namespace matching component folders, using the existing `messages/{locale}.json` single-file structure with nested namespaces. Extract strings systematically by namespace, starting with highest-traffic components.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next-intl | ^4.x | Translation hook, message loading | Already installed and configured in Phase 28 |
| useTranslations | N/A | Client component translations | Built into next-intl |
| getTranslations | N/A | Server component translations | Built into next-intl |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| useFormatter | N/A | Number/date/currency formatting | For locale-aware number formatting |
| ICU MessageFormat | Built-in | Pluralization, interpolation | Complex messages with variables |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Single JSON file per locale | Split JSON files per namespace | Single file simpler for this scale (~500 keys total) |
| Nested namespaces | Flat keys with dots | Nested matches component structure better |
| Manual extraction | i18n-extract tools | Manual gives more control, tools often miss context |

**Installation:**
```bash
# No new packages needed - next-intl already installed
```

## Architecture Patterns

### Recommended Translation File Structure
```
messages/
├── en.json           # All English translations (~500 keys)
└── he.json           # All Hebrew translations (~500 keys)
```

Each JSON file has nested namespaces:
```json
{
  "common": { ... },           // Shared across app
  "navigation": { ... },       // Nav items, sidebar
  "dashboard": { ... },        // Dashboard pages
  "properties": { ... },       // Property listings, details
  "deals": { ... },            // Deal flow, stages
  "chat": { ... },             // Chat/messaging
  "feed": { ... },             // Social feed
  "settings": { ... },         // Settings, profile
  "landing": { ... }           // Already exists
}
```

### Pattern 1: Client Component Translation

**What:** Use `useTranslations` hook with namespace parameter
**When to use:** All client components (`"use client"`)
**Example:**
```typescript
// Source: https://next-intl.dev/docs/usage/messages
// File: src/app/[locale]/(app)/dashboard/page.tsx

"use client";

import { useTranslations } from "next-intl";

export default function DashboardPage() {
  const t = useTranslations("dashboard");

  return (
    <div>
      <h1>{t("title")}</h1>
      <p>{t("welcome", { name: user.name })}</p>
    </div>
  );
}
```

### Pattern 2: Component-Level Translations

**What:** Components receive namespace prefix matching their domain
**When to use:** Reusable components within a feature
**Example:**
```typescript
// Source: Existing landing components in codebase
// File: src/components/chat/ChatInput.tsx

"use client";

import { useTranslations } from "next-intl";

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const t = useTranslations("chat");

  return (
    <div>
      <textarea placeholder={t("input.placeholder")} />
      <Button>{t("input.send")}</Button>
    </div>
  );
}
```

### Pattern 3: Shared/Common Translations

**What:** Common strings (buttons, labels, errors) in `common` namespace
**When to use:** Strings appearing across multiple features
**Example:**
```typescript
// Source: https://next-intl.dev/docs/usage/messages
// File: Any component needing shared strings

const t = useTranslations("common");

<Button>{t("actions.save")}</Button>
<Button variant="outline">{t("actions.cancel")}</Button>
<span className="text-destructive">{t("errors.required")}</span>
```

### Pattern 4: Dynamic Values with ICU MessageFormat

**What:** String interpolation and pluralization
**When to use:** Strings with variables or count-based variants
**Example:**
```typescript
// Source: https://next-intl.dev/docs/usage/messages
// In messages/en.json:
{
  "properties": {
    "count": "{count, plural, =0 {No properties} one {# property} other {# properties}} found"
  }
}

// In component:
t("count", { count: properties.length })
// Renders: "5 properties found" or "1 property found" or "No properties found"
```

### Pattern 5: Constants with Translation Keys

**What:** Replace hardcoded label objects with translation key references
**When to use:** Constants that display user-facing labels
**Example:**
```typescript
// BEFORE (src/lib/constants.ts):
export const PROPERTY_TYPES = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
];

// AFTER:
export const PROPERTY_TYPES = [
  { value: "residential", labelKey: "propertyTypes.residential" },
  { value: "commercial", labelKey: "propertyTypes.commercial" },
] as const;

// In component:
const t = useTranslations("common");
{PROPERTY_TYPES.map(type => (
  <option value={type.value}>{t(type.labelKey)}</option>
))}
```

### Anti-Patterns to Avoid
- **Mixing namespaces in one component:** Keep components focused on one namespace
- **Duplicating strings across namespaces:** Use `common` for shared strings
- **Hardcoding numbers/currencies:** Use `useFormatter` for locale-aware formatting
- **Translating technical terms:** Keep "API", "URL", brand names untranslated
- **Breaking sentences into multiple keys:** Keep full sentences as single keys for translator context

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Number formatting | Manual Intl.NumberFormat | `useFormatter().number()` | Respects global format config |
| Date formatting | Manual date string construction | `useFormatter().dateTime()` | Locale-aware, consistent |
| Currency display | Hardcoded "$" + number | `format.number(amount, {style: 'currency', currency})` | Handles ILS/USD per locale |
| Pluralization | Manual if/else on count | ICU `{count, plural, ...}` | Handles all language rules |
| Relative time | Custom "X days ago" logic | `format.relativeTime()` | Locale-aware, auto-updates |

**Key insight:** The `useFormatter` hook from next-intl handles number, currency, and date formatting with locale awareness. This replaces the current `formatUSD()` helper functions scattered through the codebase.

## Common Pitfalls

### Pitfall 1: Missing Namespace in useTranslations
**What goes wrong:** Translation keys not found, showing raw keys
**Why it happens:** Calling `useTranslations()` without namespace parameter
**How to avoid:** Always pass namespace: `useTranslations("dashboard")`
**Warning signs:** Rendered text like `dashboard.title` instead of "Dashboard"

### Pitfall 2: Forgetting NextIntlClientProvider Messages
**What goes wrong:** Client components can't access translations
**Why it happens:** Messages not passed to NextIntlClientProvider
**How to avoid:** Already handled in existing `src/i18n/request.ts` - verify it loads messages
**Warning signs:** Console errors about missing messages

### Pitfall 3: Breaking Sentences for Translation
**What goes wrong:** Translators can't produce natural translations
**Why it happens:** Splitting "Click {here} to continue" into multiple keys
**How to avoid:** Use full sentences with rich text: `"Click <link>here</link> to continue"`
**Warning signs:** Awkward translations, translator complaints

### Pitfall 4: Inconsistent Key Naming
**What goes wrong:** Hard to find and maintain translations
**Why it happens:** No naming convention: `submitButton`, `submit_btn`, `btnSubmit`
**How to avoid:** Use consistent convention: `{context}.{element}.{modifier}` like `form.button.submit`
**Warning signs:** Duplicate strings with different keys, confusion during updates

### Pitfall 5: Not Handling Empty/Loading States
**What goes wrong:** Untranslated fallback text appears
**Why it happens:** Only translating primary content, not edge cases
**How to avoid:** Include all UI states: `empty.noResults`, `loading.text`, `error.generic`
**Warning signs:** English text in Hebrew UI during loading/error states

### Pitfall 6: Ignoring Constant Labels
**What goes wrong:** Options in dropdowns remain in English
**Why it happens:** Constants like `PROPERTY_TYPES` have hardcoded `label` strings
**How to avoid:** Replace labels with translation keys, look up at render time
**Warning signs:** Mixed language dropdowns, radio groups, etc.

## Code Examples

Verified patterns from official sources:

### useTranslations with Namespace
```typescript
// Source: https://next-intl.dev/docs/usage/messages
// File: src/components/dashboard/DashboardStats.tsx

"use client";

import { useTranslations } from "next-intl";

export function DashboardStats() {
  const t = useTranslations("dashboard.stats");

  return (
    <div>
      <h2>{t("title")}</h2>
      <Card>
        <p className="text-muted-foreground">{t("properties.label")}</p>
        <p className="text-2xl font-bold">{stats.totalProperties}</p>
      </Card>
    </div>
  );
}
```

### useFormatter for Numbers and Currency
```typescript
// Source: https://next-intl.dev/docs/usage/numbers
// File: src/components/properties/PropertyPrice.tsx

"use client";

import { useFormatter } from "next-intl";

export function PropertyPrice({ priceUsd }: { priceUsd: number }) {
  const format = useFormatter();

  return (
    <span>
      {format.number(priceUsd, { style: "currency", currency: "USD" })}
    </span>
  );
}
```

### Pluralization Pattern
```typescript
// Source: https://next-intl.dev/docs/usage/messages
// In messages/en.json:
{
  "deals": {
    "count": "You have {count, plural, =0 {no deals} one {# deal} other {# deals}}"
  }
}

// In messages/he.json:
{
  "deals": {
    "count": "יש לך {count, plural, =0 {אין עסקאות} one {עסקה אחת} two {# עסקאות} other {# עסקאות}}"
  }
}

// In component:
<p>{t("count", { count: deals.length })}</p>
```

### Dynamic Keys from Constants
```typescript
// Source: Derived from next-intl patterns
// In messages/en.json:
{
  "common": {
    "propertyTypes": {
      "residential": "Residential",
      "commercial": "Commercial",
      "mixed_use": "Mixed Use",
      "land": "Land"
    }
  }
}

// In component:
const t = useTranslations("common");

{PROPERTY_TYPES.map(type => (
  <SelectItem key={type.value} value={type.value}>
    {t(`propertyTypes.${type.value}`)}
  </SelectItem>
))}
```

### getTranslations for Server Components
```typescript
// Source: https://next-intl.dev/docs/environments/server-client-components
// File: src/app/[locale]/(app)/properties/page.tsx (if converted to server)

import { getTranslations } from "next-intl/server";

export default async function PropertiesPage() {
  const t = await getTranslations("properties");

  return (
    <div>
      <h1>{t("title")}</h1>
    </div>
  );
}
```

## Namespace Inventory

Based on codebase analysis, recommended namespaces:

### `common` - Shared Strings (~50 keys)
- `common.actions.save`, `common.actions.cancel`, `common.actions.edit`, `common.actions.delete`
- `common.status.loading`, `common.status.error`, `common.status.success`
- `common.labels.email`, `common.labels.phone`, `common.labels.name`
- `common.propertyTypes.*` - Residential, Commercial, Mixed Use, Land
- `common.roles.*` - Investor, Broker, Mortgage Advisor, Lawyer
- `common.empty.*` - No results, no data states

### `navigation` - Nav Items (~20 keys)
- `navigation.dashboard`, `navigation.properties`, `navigation.deals`
- `navigation.chat`, `navigation.feed`, `navigation.settings`
- `navigation.saved`, `navigation.search`

### `dashboard` - Dashboard Pages (~40 keys)
- `dashboard.title`, `dashboard.welcome`
- `dashboard.stats.properties`, `dashboard.stats.value`, `dashboard.stats.roi`
- `dashboard.profile.title`, `dashboard.profile.email`, `dashboard.profile.role`
- `dashboard.quickActions.browse`, `dashboard.quickActions.saved`

### `properties` - Property Listings (~60 keys)
- `properties.title`, `properties.count`
- `properties.card.bedrooms`, `properties.card.bathrooms`, `properties.card.size`
- `properties.details.description`, `properties.details.amenities`
- `properties.form.*` - Add/edit property fields
- `properties.empty.*` - No properties states

### `deals` - Deal Flow (~50 keys)
- `deals.title`, `deals.count`
- `deals.stages.*` - Interest, With Broker, Mortgage, Legal, Closing, Completed
- `deals.card.started`, `deals.card.providers`
- `deals.empty.*` - No deals states
- `deals.filters.*` - Filter options

### `chat` - Messaging (~40 keys)
- `chat.title`, `chat.placeholder`
- `chat.modes.deals`, `chat.modes.direct`
- `chat.empty.*` - Select deal, select conversation
- `chat.participants.drag`
- `chat.group.*` - Group chat actions

### `feed` - Social Feed (~40 keys)
- `feed.title`, `feed.createPost`
- `feed.tabs.global`, `feed.tabs.following`
- `feed.filters.*` - All, Properties, Services, Discussions
- `feed.empty.*` - No posts states
- `feed.post.*` - Post creation fields

### `settings` - Settings (~30 keys)
- `settings.title`, `settings.tabs.profile`, `settings.tabs.availability`
- `settings.form.*` - Profile form fields
- `settings.notifications.*` - Notification preferences

### `landing` - Landing Page (Already exists, ~190 keys)
- Keep existing structure: `landing.nav.*`, `landing.hero.*`, etc.

## String Extraction Strategy

### Phase Order (by impact and dependency)
1. **common** - Extract shared strings first, other namespaces depend on it
2. **navigation** - High visibility, affects all pages
3. **dashboard** - Entry point for users
4. **properties** - Core feature
5. **deals** - Core feature
6. **chat** - Core feature
7. **feed** - Secondary feature
8. **settings** - Settings and profile

### Files with Most Hardcoded Strings
Components (highest to lowest string count):
1. `InvestorQuestionnaireCard.tsx` - 78 strings
2. `AppShell.tsx` - 40 strings (navigation)
3. `ProcessSteps.tsx` - 24 strings (landing - already translated)
4. `TeamSection.tsx` - 21 strings (landing - already translated)
5. `deals/[id]/page.tsx` - 32 strings
6. `clients/[id]/page.tsx` - 28 strings

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Flat translation keys | Nested namespaces | Common practice | Better organization |
| String concatenation | ICU MessageFormat | Always | Proper pluralization |
| Manual Intl usage | useFormatter hook | next-intl standard | Consistent formatting |

**Deprecated/outdated:**
- `react-intl` for Next.js App Router: Use next-intl instead
- Separate translation files per page: Overkill for <1000 keys

## Open Questions

Things that couldn't be fully resolved:

1. **Constants file translation pattern**
   - What we know: Constants like `DEAL_STAGES` have hardcoded labels
   - What's unclear: Whether to keep labels or use key lookups
   - Recommendation: Replace labels with keys, look up in components

2. **Server Component conversion opportunity**
   - What we know: All app pages are client components currently
   - What's unclear: Whether some could become server components
   - Recommendation: Keep as client for now, optimize later

3. **Hebrew translation content**
   - What we know: Landing page already has Hebrew translations
   - What's unclear: Who will translate the new ~300 keys
   - Recommendation: Add English translations, defer Hebrew to translation phase

## Sources

### Primary (HIGH confidence)
- [next-intl Messages Usage](https://next-intl.dev/docs/usage/messages) - useTranslations, namespaces
- [next-intl Server/Client Components](https://next-intl.dev/docs/environments/server-client-components) - getTranslations
- [next-intl Number Formatting](https://next-intl.dev/docs/usage/numbers) - useFormatter
- [next-intl Date Formatting](https://next-intl.dev/docs/usage/dates-times) - dateTime, relativeTime
- Existing codebase patterns in `src/components/landing/*` - Verified working patterns

### Secondary (MEDIUM confidence)
- [next-intl Configuration](https://next-intl.dev/docs/usage/configuration) - Message loading
- Phase 28 research (internal) - i18n infrastructure already built

### Tertiary (LOW confidence)
- String count estimates from grep analysis - May miss/overcount some patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - next-intl already installed and patterns proven
- Architecture: HIGH - Landing page demonstrates working pattern
- Pitfalls: HIGH - Based on documented common issues
- String inventory: MEDIUM - Grep-based estimates, actual count may vary

**Research date:** 2026-01-20
**Valid until:** ~90 days (translation patterns are stable)
