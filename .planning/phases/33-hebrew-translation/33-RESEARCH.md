# Phase 33: Hebrew Translation - Research

**Researched:** 2026-01-20
**Domain:** Content translation (Hebrew) for next-intl i18n infrastructure
**Confidence:** HIGH

## Summary

Phase 33 is a pure content translation task. The translation infrastructure (Phase 28-31) is complete, and the task is to populate Hebrew translations for all remaining English translation keys. The English source file (`messages/en.json`) contains 1,208 translation keys organized into 16 namespaces. The Hebrew file (`messages/he.json`) currently has 409 keys translated across 5 complete namespaces (common, navigation, landing, chat, feed), leaving **799 keys across 11 namespaces** requiring translation.

This is a content task, not a code task. The structure and format of the translation files are already established. The work involves translating the remaining namespaces while preserving ICU message syntax for interpolation and pluralization.

**Primary recommendation:** Translate remaining 11 namespaces in batches grouped by feature area, preserving all ICU patterns and JSON structure.

## Translation Scope Analysis

### Current State

| Namespace | English Keys | Hebrew Keys | Status |
|-----------|-------------|-------------|--------|
| common | 124 | 124 | COMPLETE |
| navigation | 37 | 37 | COMPLETE |
| dashboard | 54 | 0 | MISSING |
| settings | 72 | 0 | MISSING |
| clients | 58 | 0 | MISSING |
| analytics | 25 | 0 | MISSING |
| landing | 104 | 104 | COMPLETE |
| properties | 118 | 0 | MISSING |
| deals | 204 | 0 | MISSING |
| chat | 56 | 56 | COMPLETE |
| feed | 88 | 88 | COMPLETE |
| providers | 41 | 0 | MISSING |
| profile | 33 | 0 | MISSING |
| search | 32 | 0 | MISSING |
| onboarding | 156 | 0 | MISSING |
| misc | 6 | 0 | MISSING |

**Total:** 1,208 English keys, 409 Hebrew keys translated, **799 keys remaining**

### File Structure

Single JSON file per locale:
```
messages/
  en.json   (60,925 bytes, 1,208 keys)
  he.json   (24,347 bytes, 409 keys)
```

No namespace-per-file splitting. All translations in one JSON object with nested namespaces.

## ICU Message Patterns

The translation files use ICU message syntax. These patterns MUST be preserved during translation:

### Simple Interpolation (50+ occurrences)
```json
// English
"welcome": "Welcome back, {name}"

// Hebrew (preserve variable name)
"welcome": "ברוך שובך, {name}"
```
Variables `{name}`, `{count}`, `{query}`, etc. must remain unchanged.

### Plural Forms (6 occurrences)
```json
// English
"count": "{count, plural, =0 {No properties} =1 {1 property} other {# properties}} found"

// Hebrew (adapt plural forms)
"count": "{count, plural, =0 {לא נמצאו נכסים} =1 {נכס אחד} other {# נכסים}} נמצאו"
```

Hebrew plural patterns differ from English. Key considerations:
- Hebrew has singular (=1) and plural (other) forms
- The `#` placeholder represents the count value
- Word order may change (subject-verb vs verb-subject)

### Identified Plural Keys (must adapt carefully)
1. `properties.count` - property count with plural
2. `properties.listingsCount` - listings count
3. `properties.saved.count` - saved properties with nested plural
4. `deals.card.providersAssigned` - provider count
5. `deals.files.filesCount` - file count
6. `providers.card.reviews` - review count

### Interpolation in Context
```json
// Template strings with multiple variables
"range": "{min} - {max}"                    // Keep as-is
"bedroomsRange": "{min} - {max} bedrooms"   // Translate "bedrooms"
"aboutCity": "About {city}"                 // Translate "About"
```

## Domain-Specific Terminology

Real estate terminology requires accurate Hebrew equivalents:

### Property Terms
| English | Hebrew | Notes |
|---------|--------|-------|
| Residential | מגורים | Already in common namespace |
| Commercial | מסחרי | Already in common namespace |
| Mixed Use | שימוש מעורב | Already in common namespace |
| Cap Rate | שיעור היוון | Financial term |
| ROI | תשואה | Return on investment |
| Cash-on-Cash | תשואה על הון עצמי | Investment metric |
| Pre-approval | אישור עקרוני | Mortgage term |
| Due Diligence | בדיקת נאותות | Already in common namespace |

### Role Terms
| English | Hebrew | Notes |
|---------|--------|-------|
| Broker | מתווך | Already translated |
| Mortgage Advisor | יועץ משכנתא | Already translated |
| Lawyer | עורך דין | Already translated |
| Appraiser | שמאי | Already translated |
| Notary | נוטריון | Already translated |

## Standard Patterns

### Translation Process
1. Read English namespace structure
2. Translate leaf values (strings only)
3. Preserve all JSON structure and keys
4. Preserve ICU syntax ({variable}, {count, plural, ...})
5. Adapt word order for Hebrew grammar
6. Use consistent terminology from existing translations

### What NOT to Change
- JSON keys (e.g., `"welcome"`, `"dashboard.title"`)
- ICU variable names (e.g., `{name}`, `{count}`)
- ICU format syntax (e.g., `{count, plural, =0 {...} =1 {...} other {...}}`)
- Array structures (pricing features are arrays)

### Hebrew Grammar Considerations
- Word order: Hebrew may use verb-subject vs English subject-verb
- Gendered forms: Some terms have masculine/feminine (use masculine as default for generic UI)
- Definite articles: ה prefix for "the" (e.g., "Dashboard" = "לוח הבקרה")
- Construct state (סמיכות): Compound nouns (e.g., "mortgage advisor" = "יועץ משכנתא")

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Pluralization | Custom plural logic | ICU plural syntax | Standard, handles edge cases |
| Interpolation | String concatenation | ICU interpolation | Preserves variable positions |
| Number formatting | Manual formatting | Intl.NumberFormat | Locale-aware (Phase 32 complete) |
| Date formatting | Manual formatting | useFormatter | Locale-aware (Phase 32 complete) |

## Common Pitfalls

### Pitfall 1: Breaking ICU Syntax
**What goes wrong:** Modifying variable names or plural structure
**Why it happens:** Treating ICU patterns as regular text
**How to avoid:** Copy ICU patterns exactly, only translate surrounding text
**Example:**
```json
// WRONG - changed variable name
"welcome": "ברוך שובך, {שם}"

// CORRECT - preserved variable name
"welcome": "ברוך שובך, {name}"
```

### Pitfall 2: Missing Keys
**What goes wrong:** Hebrew file missing keys that exist in English
**Why it happens:** Incomplete translation pass
**How to avoid:** Use JSON diff tools to verify key parity
**Verification:** Compare key counts before/after each namespace

### Pitfall 3: Inconsistent Terminology
**What goes wrong:** Same English term translated differently
**Why it happens:** Multiple translation passes without reference
**How to avoid:** Use existing common namespace as terminology reference
**Example:** "Investor" should always be "משקיע" (already in common.roles)

### Pitfall 4: Word Order in Interpolations
**What goes wrong:** Awkward Hebrew phrasing
**Why it happens:** Translating word-for-word without restructuring
**How to avoid:** Restructure sentence around variable placement
**Example:**
```json
// English: "About {city}"
// AWKWARD: "אודות {city}"
// NATURAL: "{city} - מידע על האזור"
```

### Pitfall 5: Array Order Changes
**What goes wrong:** Reordering array items (e.g., pricing features)
**Why it happens:** Thinking translation means reorganization
**How to avoid:** Translate in place, preserve array order
**Note:** Array order may be significant for UI rendering

## Batching Strategy

Recommended batching by feature area for logical grouping:

### Batch 1: Dashboard & Analytics (79 keys)
- dashboard (54 keys) - Main user dashboard
- analytics (25 keys) - Performance metrics

### Batch 2: Settings & Profile (105 keys)
- settings (72 keys) - User settings tabs
- profile (33 keys) - User profile display

### Batch 3: Properties (118 keys)
- properties (118 keys) - Property browsing, details, forms

### Batch 4: Deals (204 keys)
- deals (204 keys) - Deal management, stages, questionnaire

### Batch 5: Service Providers (41 keys)
- providers (41 keys) - Provider discovery, profiles

### Batch 6: Onboarding (156 keys)
- onboarding (156 keys) - Role selection, investor questionnaire

### Batch 7: Search & Clients (90 keys)
- search (32 keys) - Search functionality
- clients (58 keys) - Client management

### Batch 8: Misc (6 keys)
- misc (6 keys) - Error states, coming soon

**Total: 8 batches, 799 keys**

## Verification Checklist

After each batch:
- [ ] Key count matches English namespace
- [ ] All ICU patterns preserved
- [ ] No broken JSON syntax
- [ ] Consistent terminology with common namespace
- [ ] No English text remaining (except proper nouns)

End-to-end verification:
- [ ] `messages/he.json` parses without errors
- [ ] All 1,208 keys present
- [ ] App loads in Hebrew without console errors
- [ ] Visual inspection of translated UI

## Sources

### Primary (HIGH confidence)
- `/Users/Kohelet/Code/REOS/messages/en.json` - Source English translations (1,208 keys)
- `/Users/Kohelet/Code/REOS/messages/he.json` - Existing Hebrew translations (409 keys)
- `/Users/Kohelet/Code/REOS/src/i18n/request.ts` - Message loading configuration
- Phase 31 decisions in STATE.md - Namespace structure and patterns

### Secondary (MEDIUM confidence)
- ICU Message Format spec - Pluralization and interpolation syntax
- Existing common/navigation Hebrew translations - Terminology reference

## Metadata

**Confidence breakdown:**
- Scope analysis: HIGH - Direct file inspection confirms counts
- ICU patterns: HIGH - Patterns identified from source files
- Terminology: HIGH - Existing translations provide reference
- Batching: MEDIUM - Logical grouping, may adjust based on dependencies

**Research date:** 2026-01-20
**Valid until:** N/A - Content translation task, infrastructure stable
