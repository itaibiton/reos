# Phase 32: Locale Formatting - Research

**Researched:** 2026-01-20
**Domain:** next-intl useFormatter for dates, numbers, currency
**Confidence:** HIGH

## Summary

This phase converts all hardcoded date, number, and currency formatting in the REOS application to use next-intl's `useFormatter` hook, ensuring locale-aware display for English (en-US) and Hebrew (he-IL) users.

Key findings:
- **24 files** with hardcoded number formatting (`formatUSD`, `toLocaleString`)
- **15 files** with hardcoded date formatting (`toLocaleDateString` with "en-US")
- **3 files** with custom `formatRelativeTime` functions (hardcoded English strings)
- **8 duplicate `formatDate` functions** scattered across components
- **8 duplicate `formatUSD` functions** - identical code copied everywhere
- **next-intl `useFormatter` is the solution**: Already installed (^4.7.0), provides locale-aware formatting

**Primary recommendation:** Create centralized format configuration in `i18n/request.ts`, then replace all scattered helper functions with `useFormatter` calls. The hook automatically uses the current locale from routing.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next-intl | ^4.7.0 | useFormatter hook | Already installed, provides locale-aware formatting |
| Intl API | Built-in | Underlying formatting engine | Standard JavaScript API used by next-intl |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| useNow | N/A | Current time for relative formatting | Synced time across components |
| getFormatter | N/A | Server component formatting | Async server-side formatting |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| useFormatter | date-fns with locales | Extra dependency, next-intl already handles it |
| useFormatter | Intl API directly | Loses locale context, more boilerplate |
| Global formats | Per-component options | Less consistent, more duplication |

**Installation:**
```bash
# No new packages needed - next-intl already installed
```

## Architecture Patterns

### Recommended Configuration Structure

Add format presets to `src/i18n/request.ts`:

```typescript
import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    formats: {
      dateTime: {
        short: {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        },
        medium: {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        },
        monthDay: {
          day: 'numeric',
          month: 'short'
        },
        full: {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        },
        dateTime: {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric'
        }
      },
      number: {
        integer: {
          maximumFractionDigits: 0
        },
        decimal: {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        },
        compact: {
          notation: 'compact'
        },
        percent: {
          style: 'percent',
          minimumFractionDigits: 1
        }
      }
    }
  }
})
```

### Pattern 1: Currency Formatting with useFormatter

**What:** Replace `formatUSD` helper functions with useFormatter
**When to use:** All currency display throughout the app
**Example:**
```typescript
// Source: https://next-intl.dev/docs/usage/numbers
// BEFORE - hardcoded in 8+ files:
function formatUSD(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

// AFTER - locale-aware:
import { useFormatter } from "next-intl";

function PropertyPrice({ priceUsd }: { priceUsd: number }) {
  const format = useFormatter();

  return (
    <span>
      {format.number(priceUsd, { style: "currency", currency: "USD", maximumFractionDigits: 0 })}
    </span>
  );
}
```

**Output by locale:**
- en-US: `$1,500,000`
- he-IL: `$1,500,000` (currency symbol positioning may differ)

### Pattern 2: Date Formatting with useFormatter

**What:** Replace `formatDate` helper functions with useFormatter
**When to use:** All date display throughout the app
**Example:**
```typescript
// Source: https://next-intl.dev/docs/usage/dates-times
// BEFORE - hardcoded locale:
function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// AFTER - using global format preset:
import { useFormatter } from "next-intl";

function DealDate({ timestamp }: { timestamp: number }) {
  const format = useFormatter();

  return (
    <span>
      {format.dateTime(new Date(timestamp), 'short')}
    </span>
  );
}
```

**Output by locale:**
- en-US: `Jan 19, 2026`
- he-IL: `19 בינו׳ 2026`

### Pattern 3: Relative Time Formatting

**What:** Replace manual relative time calculation with useFormatter.relativeTime
**When to use:** "X hours ago", "yesterday", etc.
**Example:**
```typescript
// Source: https://next-intl.dev/docs/usage/dates-times
// BEFORE - hardcoded English strings:
function formatRelativeTime(timestamp: number) {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// AFTER - locale-aware:
import { useFormatter, useNow } from "next-intl";

function RelativeTime({ timestamp }: { timestamp: number }) {
  const format = useFormatter();
  const now = useNow({ updateInterval: 1000 * 60 }); // Update every minute

  return (
    <span>
      {format.relativeTime(new Date(timestamp), now)}
    </span>
  );
}
```

**Output by locale:**
- en-US: `2 hours ago`, `yesterday`, `3 days ago`
- he-IL: `לפני שעתיים`, `אתמול`, `לפני 3 ימים`

### Pattern 4: Number Formatting

**What:** Replace `toLocaleString("en-US")` with useFormatter
**When to use:** Large numbers, percentages
**Example:**
```typescript
// Source: https://next-intl.dev/docs/usage/numbers
// BEFORE:
function formatNumber(value: number) {
  return value.toLocaleString("en-US");
}

// AFTER:
import { useFormatter } from "next-intl";

function PropertySize({ sqm }: { sqm: number }) {
  const format = useFormatter();

  return (
    <span>
      {format.number(sqm, 'integer')} sqm
    </span>
  );
}
```

**Output by locale:**
- en-US: `1,500,000`
- he-IL: `1,500,000`

### Pattern 5: Dual Currency Display (USD + ILS)

**What:** Property prices shown in both USD and ILS
**When to use:** PropertyCard, PropertyDetails
**Example:**
```typescript
// Current pattern in codebase shows both currencies
import { useFormatter } from "next-intl";
import { USD_TO_ILS_RATE } from "@/lib/constants";

function PropertyPrice({ priceUsd, priceIls }: { priceUsd: number; priceIls?: number }) {
  const format = useFormatter();
  const ilsAmount = priceIls || priceUsd * USD_TO_ILS_RATE;

  return (
    <div>
      <p className="text-lg font-bold">
        {format.number(priceUsd, { style: "currency", currency: "USD", maximumFractionDigits: 0 })}
      </p>
      <p className="text-xs text-muted-foreground">
        {format.number(ilsAmount, { style: "currency", currency: "ILS", maximumFractionDigits: 0 })}
      </p>
    </div>
  );
}
```

### Anti-Patterns to Avoid
- **Duplicating formatUSD/formatDate helpers:** Use useFormatter instead
- **Hardcoding locale in Intl calls:** `"en-US"` should be dynamic from useFormatter
- **Manual relative time strings:** Use `format.relativeTime()` for locale-aware output
- **Creating format utilities in lib/utils.ts:** The hook IS the utility

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Currency formatting | `formatUSD()` helper functions | `format.number(x, {style: 'currency', currency: 'USD'})` | Locale-aware symbol placement |
| Date formatting | `formatDate()` helper functions | `format.dateTime(date, 'short')` | Locale-aware month names, order |
| Relative time | Manual "X hours ago" logic | `format.relativeTime(date, now)` | Handles all languages ("אתמול", "yesterday") |
| Number separators | `toLocaleString("en-US")` | `format.number(x)` | Respects current locale |
| Compact numbers | Manual "1.5M" logic | `format.number(x, {notation: 'compact'})` | Built-in, locale-aware |

**Key insight:** Every `new Intl.NumberFormat("en-US", ...)` or `.toLocaleDateString("en-US", ...)` in the codebase is a bug for Hebrew users. The `useFormatter` hook automatically uses the correct locale.

## Common Pitfalls

### Pitfall 1: Forgetting useNow for Relative Time
**What goes wrong:** Relative times don't update, or hydration mismatch
**Why it happens:** Using `Date.now()` directly instead of synced now
**How to avoid:** Use `useNow({ updateInterval: 60000 })` from next-intl
**Warning signs:** Console hydration warnings, stale "5 minutes ago" that never updates

### Pitfall 2: Currency Symbol Placement Assumptions
**What goes wrong:** Assuming "$X" format everywhere
**Why it happens:** Hebrew displays currency differently: `X $` instead of `$X`
**How to avoid:** Use `format.number()` with currency style, don't hardcode symbols
**Warning signs:** Tests checking for `$1,500,000` fail in Hebrew locale

### Pitfall 3: Month Name Hardcoding
**What goes wrong:** Chart axis labels stay in English
**Why it happens:** Using `date.toLocaleDateString("en-US", { month: "short" })` directly
**How to avoid:** Pass dates through `format.dateTime()` even for chart labels
**Warning signs:** "Jan", "Feb" labels when user is in Hebrew

### Pitfall 4: Missing Format Configuration
**What goes wrong:** `format.dateTime(date, 'short')` throws error
**Why it happens:** Format preset not defined in i18n/request.ts
**How to avoid:** Define all used presets in formats configuration
**Warning signs:** Runtime errors about undefined format

### Pitfall 5: Server/Client Formatting Mismatch
**What goes wrong:** Hydration errors on dates/numbers
**Why it happens:** Server and client render different formats
**How to avoid:** Ensure both use same locale from routing
**Warning signs:** Flash of different format on page load

### Pitfall 6: Charts and Libraries Not Using Formatter
**What goes wrong:** Recharts/Chart.js labels stay in English
**Why it happens:** External libraries don't use next-intl hooks
**How to avoid:** Format data before passing to chart, or use formatter in custom tick functions
**Warning signs:** Charts look English in Hebrew UI

## Code Examples

Verified patterns from official sources:

### Complete Component Migration Example
```typescript
// Source: https://next-intl.dev/docs/usage/numbers + dates-times
// File: src/components/properties/PropertyCard.tsx

"use client";

import { useFormatter, useTranslations } from "next-intl";
import { USD_TO_ILS_RATE } from "@/lib/constants";

interface PropertyCardProps {
  priceUsd: number;
  priceIls?: number;
  createdAt: number;
  bedrooms: number;
  bathrooms: number;
  size: number;
}

export function PropertyCard({
  priceUsd,
  priceIls,
  createdAt,
  bedrooms,
  bathrooms,
  size,
}: PropertyCardProps) {
  const t = useTranslations("properties");
  const format = useFormatter();

  const ilsAmount = priceIls || priceUsd * USD_TO_ILS_RATE;

  return (
    <div>
      {/* Price - locale-aware currency formatting */}
      <p className="text-xl font-bold">
        {format.number(priceUsd, { style: "currency", currency: "USD", maximumFractionDigits: 0 })}
      </p>
      <p className="text-sm text-muted-foreground">
        {format.number(ilsAmount, { style: "currency", currency: "ILS", maximumFractionDigits: 0 })}
      </p>

      {/* Stats - locale-aware number formatting */}
      <div className="flex gap-4">
        <span>{format.number(bedrooms)} {t("card.bedrooms")}</span>
        <span>{format.number(bathrooms)} {t("card.bathrooms")}</span>
        <span>{format.number(size)} {t("card.sqm")}</span>
      </div>

      {/* Date - locale-aware date formatting */}
      <p className="text-xs text-muted-foreground">
        {format.dateTime(new Date(createdAt), 'short')}
      </p>
    </div>
  );
}
```

### Relative Time Component
```typescript
// Source: https://next-intl.dev/docs/usage/dates-times
// File: src/components/chat/MessageTimestamp.tsx

"use client";

import { useFormatter, useNow } from "next-intl";

interface MessageTimestampProps {
  timestamp: number;
  showDate?: boolean;
}

export function MessageTimestamp({ timestamp, showDate = false }: MessageTimestampProps) {
  const format = useFormatter();
  const now = useNow({ updateInterval: 1000 * 60 }); // Update every minute

  const date = new Date(timestamp);
  const diffInHours = (now.getTime() - timestamp) / (1000 * 60 * 60);

  // Use relative time for recent messages, absolute date for older
  if (diffInHours < 24 && !showDate) {
    return <span>{format.relativeTime(date, now)}</span>;
  }

  return <span>{format.dateTime(date, 'short')}</span>;
}
```

### Chart Formatting Helper
```typescript
// For Recharts/Chart.js that need formatted strings
// File: src/lib/chart-formatters.ts

import { createFormatter } from 'next-intl';

// Note: Charts may need pre-formatted data since they don't support hooks
// Format data before passing to chart component

// In a component:
export function AnalyticsChart({ data, locale }: { data: DataPoint[]; locale: string }) {
  const format = useFormatter();

  const formattedData = data.map(point => ({
    ...point,
    formattedValue: format.number(point.value, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
    formattedDate: format.dateTime(new Date(point.date), 'monthDay'),
  }));

  return (
    <ResponsiveContainer>
      <LineChart data={formattedData}>
        <XAxis dataKey="formattedDate" />
        <YAxis tickFormatter={(value) => format.number(value, 'compact')} />
        {/* ... */}
      </LineChart>
    </ResponsiveContainer>
  );
}
```

## Locale Format Behavior Reference

### Date Formats by Locale

| Format | en-US | he-IL |
|--------|-------|-------|
| short | Jan 19, 2026 | 19 בינו׳ 2026 |
| medium | January 19, 2026 | 19 בינואר 2026 |
| dateStyle: 'short' | 1/19/26 | 19.1.2026 |

### Number Formats by Locale

| Value | en-US | he-IL |
|-------|-------|-------|
| 1500000 | 1,500,000 | 1,500,000 |
| compact 1500000 | 1.5M | 1.5M |

### Currency Formats by Locale

| Currency | en-US | he-IL |
|----------|-------|-------|
| USD $1,500,000 | $1,500,000 | 1,500,000.00 $ |
| ILS 5,550,000 | ILS 5,550,000 | 5,550,000.00 ILS |

### Relative Time by Locale

| Time Diff | en-US | he-IL |
|-----------|-------|-------|
| -2 hours | 2 hours ago | לפני שעתיים |
| -1 day | yesterday | אתמול |
| -3 days | 3 days ago | לפני 3 ימים |

## Scope of Work

### Files Requiring Updates

**Currency Formatting (formatUSD):**
1. `src/components/deals/InvestorQuestionnaireCard.tsx`
2. `src/components/properties/MortgageCalculator.tsx`
3. `src/components/profile/PortfolioSection.tsx`
4. `src/components/properties/PropertyCard.tsx`
5. `src/components/dashboard/ProviderDashboard.tsx`
6. `src/components/properties/SoldPropertiesTable.tsx`
7. `src/components/dashboard/DashboardMapClient.tsx`
8. `src/components/dashboard/RecommendedProperties.tsx`
9. `src/app/[locale]/(app)/deals/page.tsx`
10. `src/app/[locale]/(app)/deals/[id]/page.tsx`
11. `src/app/[locale]/(app)/dashboard/page.tsx`
12. `src/app/[locale]/(app)/clients/page.tsx`
13. `src/app/[locale]/(app)/clients/[id]/page.tsx`
14. `src/app/[locale]/(app)/properties/[id]/page.tsx`
15. `src/app/[locale]/(app)/providers/[id]/page.tsx`
16. `src/app/[locale]/(app)/analytics/page.tsx`

**ILS Formatting (formatILS):**
1. `src/components/dashboard/RecommendedProperties.tsx`
2. `src/components/properties/PropertyCard.tsx`
3. `src/app/[locale]/(app)/properties/[id]/page.tsx`

**Date Formatting (formatDate):**
1. `src/components/dashboard/InvestorDashboard.tsx`
2. `src/components/dashboard/ProviderDashboard.tsx`
3. `src/components/settings/AvailabilitySettings.tsx`
4. `src/components/properties/SoldPropertiesTable.tsx`
5. `src/components/properties/ValueHistoryChart.tsx`
6. `src/app/[locale]/(app)/deals/page.tsx`
7. `src/app/[locale]/(app)/deals/[id]/page.tsx`
8. `src/app/[locale]/(app)/clients/page.tsx`
9. `src/app/[locale]/(app)/clients/[id]/page.tsx`
10. `src/app/[locale]/(app)/providers/[id]/page.tsx`
11. `src/app/[locale]/(app)/analytics/page.tsx`
12. `src/components/chat/ChatMessage.tsx`

**Relative Time (formatRelativeTime):**
1. `src/components/notifications/NotificationCenter.tsx`
2. `src/components/chat/ConversationSelector.tsx`
3. `src/components/dashboard/ProviderDashboard.tsx`

**Other toLocaleString calls:**
1. `src/components/search/GlobalSearchBar.tsx`
2. `src/components/questionnaire/steps/BudgetStep.tsx`
3. `src/components/questionnaire/steps/PropertySizeStep.tsx`
4. `src/components/ui/chart.tsx`
5. `src/components/ui/calendar.tsx`

**Total unique files:** ~28 files

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hardcoded locale in Intl | useFormatter hook | next-intl standard | Automatic locale from routing |
| Manual relative time | format.relativeTime() | next-intl 3.x | Full i18n support |
| Scattered helper functions | Centralized format config | Best practice | Consistency, maintainability |

**Deprecated/outdated:**
- Manual `Intl.NumberFormat("en-US", ...)` calls in components: Use useFormatter
- Custom `formatRelativeTime` with hardcoded strings: Use format.relativeTime()

## Open Questions

Things that couldn't be fully resolved:

1. **Chart library formatting**
   - What we know: Recharts uses custom tick formatters
   - What's unclear: Best pattern for locale-aware chart labels
   - Recommendation: Format data before passing to chart, or use format in tickFormatter

2. **Calendar component (react-day-picker)**
   - What we know: Has built-in Hebrew support
   - What's unclear: Whether it automatically respects next-intl locale
   - Recommendation: Check if locale prop needs to be passed explicitly

## Sources

### Primary (HIGH confidence)
- [next-intl Numbers](https://next-intl.dev/docs/usage/numbers) - useFormatter for numbers/currency
- [next-intl Dates/Times](https://next-intl.dev/docs/usage/dates-times) - dateTime, relativeTime
- [next-intl Configuration](https://next-intl.dev/docs/usage/configuration) - formats object
- Codebase analysis - grep for existing patterns

### Secondary (MEDIUM confidence)
- [MDN Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat) - underlying API
- [MDN Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat) - underlying API

### Tertiary (LOW confidence)
- WebSearch for Hebrew locale patterns - verified with Node.js tests

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - next-intl already installed, patterns documented
- Architecture: HIGH - Format presets pattern from official docs
- Pitfalls: HIGH - Based on locale behavior testing
- Scope: HIGH - Grep analysis of actual codebase

**Research date:** 2026-01-20
**Valid until:** ~90 days (formatting patterns are stable)
