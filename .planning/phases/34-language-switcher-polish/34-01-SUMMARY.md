---
phase: 34-language-switcher-polish
plan: 01
subsystem: i18n
tags: [next-intl, localization, cookies, dropdown]

# Dependency graph
requires:
  - phase: 28-i18n-foundation
    provides: next-intl routing setup with en/he locales
provides:
  - LocaleSwitcher component for header integration
  - Cookie persistence for user locale preferences
  - Translation keys for language switcher UI
affects: [34-02 header integration, future locales]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - localeCookie config for persistent user preferences
    - Native language names in switcher (shows each language in its own script)
    - routing.locales for dynamic locale list

key-files:
  created:
    - src/components/LocaleSwitcher.tsx
  modified:
    - src/i18n/routing.ts
    - messages/en.json
    - messages/he.json

key-decisions:
  - "1-year cookie maxAge for persistent locale preferences"
  - "Native script display for language names (English/Hebrew in Hebrew)"
  - "routing.locales used for locale list (not hardcoded in component)"

patterns-established:
  - "localeCookie pattern: next-intl auto-persists on router.replace()"
  - "Native language name pattern: hardcode in component, not translations"

# Metrics
duration: 1min
completed: 2026-01-20
---

# Phase 34 Plan 01: LocaleSwitcher Component Summary

**LocaleSwitcher dropdown with cookie persistence for user locale preferences**

## Performance

- **Duration:** 1 min
- **Started:** 2026-01-20T10:54:21Z
- **Completed:** 2026-01-20T10:55:44Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- Cookie persistence configured with 1-year expiry for locale preferences
- LocaleSwitcher component ready for header integration
- Translation keys added for accessibility labels in both languages

## Task Commits

Each task was committed atomically:

1. **Task 1: Configure cookie persistence in routing.ts** - `756c2b6` (feat)
2. **Task 2: Create LocaleSwitcher component** - `cd9b91f` (feat)
3. **Task 3: Add translation keys for language switcher** - `0e83d20` (feat)

## Files Created/Modified
- `src/i18n/routing.ts` - Added localeCookie config with NEXT_LOCALE name and 1-year maxAge
- `src/components/LocaleSwitcher.tsx` - New dropdown component using next-intl hooks
- `messages/en.json` - Added common.language.switchLanguage and currentLanguage keys
- `messages/he.json` - Added Hebrew translations for language switcher

## Decisions Made
- Used 1-year maxAge (31536000 seconds) for persistent preferences across browser sessions
- Language names displayed in native script (English shows "English", Hebrew shows Hebrew characters) so users can find their language regardless of current UI language
- Used routing.locales from i18n/routing.ts rather than hardcoding locale list in component

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- LocaleSwitcher component ready for header integration in Plan 02
- Cookie persistence will activate automatically when users switch locales
- No blockers for next plan

---
*Phase: 34-language-switcher-polish*
*Completed: 2026-01-20*
