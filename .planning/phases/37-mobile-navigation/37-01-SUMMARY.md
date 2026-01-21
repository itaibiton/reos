---
phase: 37-mobile-navigation
plan: 01
completed: 2026-01-21
duration: 3 min
subsystem: navigation
tags: [mobile, navigation, bottom-nav, role-based]

dependency-graph:
  requires:
    - 16.3 (Shadcn Sidebar with role-based navigation)
    - 31 (Navigation namespace translations)
  provides:
    - getMobileTabsForRole function
    - MobileTabItem type
  affects:
    - 37-02 (MobileBottomNav component)
    - 37-03 (AppShell integration)

tech-stack:
  added: []
  patterns:
    - Role-based navigation configuration pattern (investor vs provider)
    - Dual icon system (Lucide for compatibility, HugeIcon for mobile display)

key-files:
  created: []
  modified:
    - src/lib/navigation.ts

decisions:
  - Investor tabs: Properties, Feed, Chat, Deals, Profile (NAV-02)
  - Provider tabs: Dashboard, Clients, Chat, Feed, Profile (NAV-03)
  - Chat tab includes showBadge property for unread badge display
  - MobileTabItem includes both LucideIcon and HugeIcon for flexibility

metrics:
  tasks: 1/1
  commits: 1
---

# Phase 37 Plan 01: Mobile Tab Navigation Config Summary

**One-liner:** Role-based getMobileTabsForRole() function returning 5-tab configuration for mobile bottom navigation.

## What Was Built

Added mobile tab navigation configuration to the existing navigation.ts file:

1. **MobileTabItem Type** - New type defining mobile tab structure:
   - `labelKey`: Translation key for i18n
   - `href`: Navigation path
   - `icon`: Lucide icon (for compatibility)
   - `hugeIcon`: HugeIcon (for mobile display)
   - `showBadge`: Optional badge indicator ("chat" | "notifications")

2. **getMobileTabsForRole Function** - Returns exactly 5 tabs per role:
   - **Investor**: Properties, Feed, Chat, Deals, Profile
   - **Provider** (all 8 roles): Dashboard, Clients, Chat, Feed, Profile

## Key Implementation Details

```typescript
// Type definition
export type MobileTabItem = {
  labelKey: string;
  href: string;
  icon: LucideIcon;
  hugeIcon: IconSvgElement;
  showBadge?: "chat" | "notifications";
};

// Function returns 5 tabs based on role
export function getMobileTabsForRole(role: UserRole): MobileTabItem[]
```

## Commits

| Hash | Type | Description |
|------|------|-------------|
| d9b6e6d | feat | add mobile tab navigation configuration |

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- [x] TypeScript compiles without errors
- [x] getMobileTabsForRole("investor") returns 5 items
- [x] getMobileTabsForRole("broker") returns 5 items
- [x] Each item has labelKey, href, icon, hugeIcon
- [x] Chat item has showBadge: "chat"

## Next Phase Readiness

**Ready for 37-02:** MobileBottomNav component can now consume getMobileTabsForRole() to render the bottom navigation bar.

**Dependencies satisfied:**
- MobileTabItem type exported
- getMobileTabsForRole function exported
- All labelKeys use existing navigation.items.* translation keys
