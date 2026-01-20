---
phase: 33-hebrew-translation
plan: 06
subsystem: i18n
tags: [translation, hebrew, onboarding, questionnaire]

dependency_graph:
  requires: []
  provides: [onboarding-hebrew-translations]
  affects: [investor-onboarding-flow]

tech_stack:
  added: []
  patterns:
    - ICU message syntax for progress indicators
    - Nested option translations with label/description

key_files:
  created: []
  modified:
    - messages/he.json

decisions:
  - "Progress indicator uses Hebrew word order: 'step X of Y'"
  - "City names stored as key-value pairs for lookup"

metrics:
  duration: 5 min
  completed: 2026-01-20
---

# Phase 33 Plan 06: Onboarding Namespace Hebrew Translation Summary

**One-liner:** Complete Hebrew translation of onboarding namespace (156 keys) including roles, questionnaire, and all investor questions.

## What Was Done

### Task 1: Core, Roles, Questionnaire Base (30 keys)
- Translated onboarding title, subtitle, settingUp, continue
- Added 4 role translations (investor, broker, mortgageAdvisor, lawyer) with Hebrew labels and descriptions
- Translated questionnaire section: title, subtitle, progress (ICU), upNext (ICU), navigation buttons
- Added options section (bedrooms, area, minimum, maximum)
- Added complete section (title, subtitle, cta)
- Added editProfile section (6 keys)

### Task 2: Questions Part 1 (65 keys)
- citizenship: Israeli/non-Israeli options with tax implications context
- residency: 4 status options (resident, returning, non-resident, unsure) with descriptions
- experience: 3 levels (none, some, experienced) for Israeli real estate
- ownsProperty: Yes/no options explaining tax implications
- investmentType: Residential/investment with Hebrew descriptions
- budget: Min/max fields with placeholder examples
- horizon: Short/medium/long term investment timeline options
- goals: 4 investment goals (appreciation, rental, diversification, tax benefits)

### Task 3: Questions Part 2 (61 keys)
- yield: Rental yield vs appreciation focus options
- financing: Cash/mortgage/exploring options
- propertyTypes: Title and description
- locations: 15 Israeli cities with proper Hebrew spelling
- propertySize: Bedroom and area range placeholders
- amenities: Title and description
- timeline: 4 purchase timeline options (3mo, 6mo, 1yr, exploring)
- services: Broker, mortgage advisor, lawyer options
- additional: Free text with charCount ICU pattern

## Key Translations

| English | Hebrew |
|---------|--------|
| Investment Questionnaire | שאלון השקעות |
| Complete Your Profile | השלם את הפרופיל |
| Skip for now | דלג לעת עתה |
| Israeli Citizen | אזרח ישראלי |
| Returning Resident | תושב חוזר |
| Investment Experience | ניסיון בהשקעות |
| Investment Horizon | אופק ההשקעה |
| Capital Appreciation | עליית ערך |
| Rental Income | הכנסה משכירות |
| Rental Yield Focus | התמקדות בתשואת שכירות |
| Cash Purchase | רכישה במזומן |
| Mortgage/Financing | משכנתא/מימון |

## ICU Patterns Preserved

- Progress: `"שלב {current} מתוך {total}"` (Step X of Y)
- UpNext: `"הבא: {step}"` (Next: step)
- CharCount: `"{count}/{max} תווים"` (characters)

## Israeli Cities in Hebrew

Tel Aviv=תל אביב, Jerusalem=ירושלים, Haifa=חיפה, Netanya=נתניה, Herzliya=הרצליה, Ramat Gan=רמת גן, Rishon LeZion=ראשון לציון, Petah Tikva=פתח תקווה, Ashdod=אשדוד, Beer Sheva=באר שבע, Eilat=אילת, Rehovot=רחובות, Kfar Saba=כפר סבא, Ashkelon=אשקלון, Bat Yam=בת ים

## Verification Results

```
onboarding: 156/156 keys
Progress ICU: PASS
UpNext ICU: PASS
CharCount ICU: PASS
Tel Aviv in Hebrew: PASS
Jerusalem in Hebrew: PASS
Haifa in Hebrew: PASS
All questions have description: PASS
```

## Commits

| Commit | Description |
|--------|-------------|
| 2fef82a | feat(33-06): translate onboarding core, roles, questionnaire base |
| 0ce7b94 | feat(33-06): translate onboarding questions part 1 (65 keys) |
| 0191ba4 | feat(33-06): translate onboarding questions part 2 (61 keys) |

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

- [x] All 156 onboarding keys translated
- [x] ICU patterns preserved correctly
- [x] Israeli cities use proper Hebrew spelling
- [x] Question descriptions are natural and helpful
- [x] JSON syntax valid
- [ ] Ready for: More Hebrew translation plans
