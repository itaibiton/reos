---
phase: 31-translation-infrastructure
plan: 06
subsystem: i18n
tags: [next-intl, translations, chat, feed, hebrew, rtl]

# Dependency graph
requires:
  - phase: 31-translation-infrastructure
    provides: [next-intl setup, translation patterns, en.json structure]
provides:
  - chat namespace with ~40 translation keys
  - feed namespace with ~40 translation keys
  - Hebrew translations for chat and feed
  - Translated chat components (ChatInput, ChatPane, LayoutModeSelector, LeaveGroupDialog, DeleteGroupDialog)
  - Translated feed components (CreatePostDialog, EngagementFooter, CommentSection, ShareButton, FollowButton, FollowStats)
affects: [future feature additions to chat/feed, RTL styling phase]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - useTranslations hook pattern for client components
    - Namespace-based translation organization (chat.*, feed.*)
    - Role labels via common.roles namespace

key-files:
  created:
    - .planning/phases/31-translation-infrastructure/31-06-SUMMARY.md
  modified:
    - messages/en.json
    - messages/he.json
    - src/app/[locale]/(app)/chat/page.tsx
    - src/app/[locale]/(app)/feed/page.tsx
    - src/components/chat/ChatInput.tsx
    - src/components/chat/ChatPane.tsx
    - src/components/chat/LayoutModeSelector.tsx
    - src/components/chat/LeaveGroupDialog.tsx
    - src/components/chat/DeleteGroupDialog.tsx
    - src/components/feed/CreatePostDialog.tsx
    - src/components/feed/EngagementFooter.tsx
    - src/components/feed/CommentSection.tsx
    - src/components/feed/ShareButton.tsx
    - src/components/feed/FollowButton.tsx
    - src/components/feed/FollowStats.tsx
    - src/components/feed/DiscussionPostCard.tsx
    - src/components/feed/ServiceRequestPostCard.tsx
    - src/components/feed/PropertyPostCard.tsx

key-decisions:
  - "Used common.roles namespace for role labels to avoid duplication"
  - "Organized chat translations into modes, input, layout, pane, participants, group, empty, time sub-namespaces"
  - "Organized feed translations into tabs, filters, post, engagement, comments, share, follow, empty, card sub-namespaces"
  - "Service type labels in CreatePostDialog use common.roles for consistency"

patterns-established:
  - "Client components use useTranslations('namespace') hook"
  - "Nested translation keys for sub-sections (chat.group.leave, feed.post.visibility)"
  - "Toast messages use translation keys for success/error feedback"
  - "Aria-labels use translation keys for accessibility"

# Metrics
duration: 12min
completed: 2026-01-20
---

# Phase 31 Plan 06: Chat & Feed Translations Summary

**Chat and feed namespaces with ~80 translation keys total, Hebrew translations, and 18 components updated to use next-intl**

## Performance

- **Duration:** 12 min
- **Started:** 2026-01-20T05:50:00Z
- **Completed:** 2026-01-20T06:02:17Z
- **Tasks:** 5
- **Files modified:** 18

## Accomplishments
- Added chat namespace with translations for modes, input, layout, pane, participants, group dialogs, empty states, and time formatting
- Added feed namespace with translations for tabs, filters, post creation, engagement actions, comments, sharing, following, and empty states
- Translated 7 chat components and 10 feed components to use next-intl
- Added Hebrew translations for all new keys

## Task Commits

Each task was committed atomically:

1. **Task 1: Add chat and feed namespaces to en.json** - `ef214f3` (feat)
2. **Task 2: Translate chat page and components** - `fa3c5c2` (feat)
3. **Task 3: Translate feed page and components** - `9458acc` (feat)
4. **Task 4: Add Hebrew translations** - `297c66f` (feat)
5. **Task 5: Verify type-safety** - No separate commit (verification task)

## Files Created/Modified

### Message Files
- `messages/en.json` - Added chat and feed namespaces (~80 new keys)
- `messages/he.json` - Added common, navigation, chat, and feed namespaces

### Chat Components
- `src/app/[locale]/(app)/chat/page.tsx` - Translated empty states and helper text
- `src/components/chat/ChatInput.tsx` - Translated placeholder
- `src/components/chat/ChatPane.tsx` - Translated drag/drop messages
- `src/components/chat/LayoutModeSelector.tsx` - Translated layout tooltips
- `src/components/chat/LeaveGroupDialog.tsx` - Translated dialog content
- `src/components/chat/DeleteGroupDialog.tsx` - Translated dialog content

### Feed Components
- `src/app/[locale]/(app)/feed/page.tsx` - Translated page title, tabs, filters, empty states
- `src/components/feed/CreatePostDialog.tsx` - Translated form labels, placeholders, validation
- `src/components/feed/EngagementFooter.tsx` - Translated aria-labels for engagement buttons
- `src/components/feed/CommentSection.tsx` - Translated placeholder, buttons, empty state
- `src/components/feed/ShareButton.tsx` - Translated toast messages
- `src/components/feed/FollowButton.tsx` - Translated button labels
- `src/components/feed/FollowStats.tsx` - Translated followers/following labels
- `src/components/feed/DiscussionPostCard.tsx` - Translated post type label, role badges
- `src/components/feed/ServiceRequestPostCard.tsx` - Translated service request badge
- `src/components/feed/PropertyPostCard.tsx` - Translated role badges

## Decisions Made

1. **Used common.roles for service type labels** - Instead of duplicating role labels in feed namespace, reused common.roles (broker, mortgageAdvisor, lawyer) for consistency and maintainability.

2. **Removed hardcoded ROLE_LABELS and SERVICE_TYPE_LABELS** - Replaced static Record objects with dynamic translation lookups using a roleKeyMap to convert snake_case values to camelCase translation keys.

3. **Added comprehensive Hebrew translations** - Including common namespace and navigation items to ensure he.json structure matches en.json for consistency.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all translations integrated smoothly with existing next-intl setup.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Chat and feed pages now fully support i18n
- Hebrew translations ready for RTL testing
- Pattern established for translating additional components
- Ready for RTL styling improvements in phase 32

---
*Phase: 31-translation-infrastructure*
*Completed: 2026-01-20*
