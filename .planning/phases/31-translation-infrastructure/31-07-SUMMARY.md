---
phase: 31
plan: 7
subsystem: i18n
tags: [translation, providers, profile, search, onboarding]

dependency-graph:
  requires: [31-01, 31-06]
  provides: [providers-translations, profile-translations, search-translations, onboarding-translations]
  affects: [31-08]

tech-stack:
  added: []
  patterns: [namespace-organization, component-level-translations]

key-files:
  created: []
  modified:
    - messages/en.json
    - src/app/[locale]/(app)/providers/page.tsx
    - src/app/[locale]/(app)/providers/[id]/page.tsx
    - src/app/[locale]/(app)/profile/[id]/page.tsx
    - src/app/[locale]/(app)/profile/investor/page.tsx
    - src/app/[locale]/(app)/search/page.tsx
    - src/app/[locale]/(app)/onboarding/page.tsx
    - src/components/profile/ProfileHeader.tsx
    - src/components/profile/StatsRow.tsx
    - src/components/profile/PortfolioSection.tsx
    - src/components/search/SearchResults.tsx
    - src/components/discovery/TrendingSection.tsx
    - src/components/discovery/PeopleToFollow.tsx
    - src/components/questionnaire/QuestionnaireWizard.tsx
    - src/components/questionnaire/QuestionnaireProgress.tsx
    - src/components/ComingSoon.tsx

decisions:
  - key: namespace-structure
    choice: Separate namespaces for providers, profile, search, onboarding, misc
    rationale: Clear separation of concerns by feature area
  - key: role-translation-pattern
    choice: Use ROLE_KEY_MAP constants to map database values to translation keys
    rationale: Decouples data layer from presentation layer

metrics:
  duration: 25m
  completed: 2026-01-20
---

# Phase 31 Plan 7: Discovery & Misc Page Translations Summary

**One-liner:** Providers, profile, search, onboarding pages with 5 new translation namespaces

## What Was Built

### New Translation Namespaces (5)

1. **providers** - Service provider pages
   - tabs: brokers, mortgage advisors, lawyers
   - card: reviews, experience, service areas, contact
   - profile: about, reviews, portfolio, contact info
   - filters: service area, language, specialization
   - empty states and not found

2. **profile** - User profile pages
   - tabs: posts, reposts, portfolio
   - stats: rating, reviews, deals, experience
   - sections: bio, contact, specializations, service areas
   - investor and provider sub-sections
   - empty states and not found

3. **search** - Search functionality
   - tabs: all, users, posts, properties
   - results: showing, no results, no matches per type
   - trending: title, today, this week, posts, properties
   - suggestions: title, no suggestions, check back

4. **onboarding** - Onboarding flow
   - role selection: labels and descriptions for all 4 roles
   - questionnaire: progress, navigation, skip, complete
   - questions: titles and descriptions for all 17 steps
   - options: bedrooms, area, min/max labels

5. **misc** - Miscellaneous
   - comingSoon: title, description
   - error: not found, unauthorized, generic, go back

### Translated Pages (5)

| Page | Namespace | Key Translations |
|------|-----------|-----------------|
| /providers | providers | tabs, cards, empty states |
| /providers/[id] | providers, profile | stats, about, reviews, portfolio |
| /profile/[id] | profile | tabs, not found |
| /profile/investor | profile | title, questionnaire |
| /search | search | title, showing results, empty state |
| /onboarding | onboarding | title, roles, continue |

### Translated Components (8)

| Component | Namespace | Patterns |
|-----------|-----------|----------|
| ProfileHeader | common.roles | Role key mapping |
| StatsRow | profile.stats | Direct translations |
| PortfolioSection | providers.profile | Empty state |
| SearchResults | search | tabs, results, trending |
| TrendingSection | search.trending | Time windows, empty |
| PeopleToFollow | search.suggestions, common.roles | Role formatting |
| QuestionnaireWizard | onboarding.questionnaire | Navigation buttons |
| QuestionnaireProgress | onboarding.questionnaire | Progress counter |
| ComingSoon | misc.comingSoon | Default values |

## Architecture Patterns

### Role Translation Pattern
```typescript
const ROLE_KEY_MAP: Record<string, string> = {
  broker: "broker",
  mortgage_advisor: "mortgageAdvisor",
  lawyer: "lawyer",
};

const roleKey = ROLE_KEY_MAP[profile.role] || profile.role;
const label = tCommon(`roles.${roleKey}`);
```

### Provider Type Tab Pattern
```typescript
const PROVIDER_TAB_KEYS: Record<ProviderType, string> = {
  broker: "brokers",
  mortgage_advisor: "mortgageAdvisors",
  lawyer: "lawyers",
};

const typeLabel = t(`tabs.${PROVIDER_TAB_KEYS[providerType]}`);
```

## Commits

| Hash | Type | Description |
|------|------|-------------|
| c466b7f | feat | Add providers, profile, search, onboarding namespaces |
| 88de24d | feat | Translate providers and profile pages |
| 436d58f | feat | Translate search, onboarding, and discovery components |

## Verification

- [x] TypeScript compiles without errors
- [x] All 5 new namespaces present in en.json
- [x] All 5 main pages use useTranslations
- [x] All 8 components use useTranslations
- [x] common.roles shared across multiple components

## Next Phase Readiness

Ready for 31-08 (final integration):
- All major feature pages translated
- Consistent namespace organization
- Role translation pattern established
- Component-level translations working
