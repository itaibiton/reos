---
phase: 37-mobile-navigation
plan: 02
completed: 2026-01-21
duration: 1 min
subsystem: layout
tags: [mobile, navigation, framer-motion, role-based, badges]

dependency-graph:
  requires: [37-01-mobile-tab-config]
  provides: [role-aware-mobile-bottom-nav, animated-tab-indicator, unread-badge]
  affects: [37-03-appshell-integration]

tech-stack:
  added: []
  patterns:
    - framer-motion layoutId for tab indicator animation
    - useCurrentUser for role detection
    - Convex useQuery for real-time unread count
    - safe-area-bottom class for iOS safe area

key-files:
  created: []
  modified:
    - src/components/layout/MobileBottomNav.tsx

decisions:
  - id: 37-02-D1
    choice: Use layoutId="activeTab" for animated indicator
    why: Framer-motion shared layout enables smooth spring animation between tabs
  - id: 37-02-D2
    choice: Default to investor role when effectiveRole is undefined
    why: Prevents flash of wrong navigation during initial load
  - id: 37-02-D3
    choice: Fix safe-area class from pb-safe to safe-area-bottom
    why: pb-safe class doesn't exist; safe-area-bottom is defined in globals.css

metrics:
  lines_added: 53
  lines_removed: 38
  test_coverage: N/A
---

# Phase 37 Plan 02: MobileBottomNav Component Summary

Role-aware bottom tab navigation with animations and unread badges.

## What Was Done

### Task 1: Refactor MobileBottomNav with role-based navigation

Completely rewrote MobileBottomNav.tsx to be role-aware with animations:

**Removed:**
- Hardcoded navItems array with 5 static items
- Direct HugeIcon imports (Home01Icon, Building02Icon, etc.)
- Local NavItem type definition

**Added:**
- `getMobileTabsForRole()` from navigation.ts for role-based tabs
- `useCurrentUser()` hook for effectiveRole detection
- `useTranslations()` for i18n-ready tab labels
- `useQuery(api.directMessages.getTotalUnreadCount)` for real-time badge
- Framer-motion `layoutId="activeTab"` for animated indicator
- Badge component for unread count display

**Fixed:**
- Changed `pb-safe` to `safe-area-bottom` (correct class from globals.css)
- Changed `left-0 right-0` to `inset-x-0` for brevity

## Key Implementation Details

```tsx
// Role-based tab selection
const tabs = getMobileTabsForRole((effectiveRole as UserRole) ?? "investor");

// Animated active indicator using framer-motion
{isActive && (
  <motion.div
    layoutId="activeTab"
    className="absolute -top-2 left-1/2 -translate-x-1/2 h-0.5 w-6 bg-primary rounded-full"
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
  />
)}

// Unread badge on chat tab
{unreadCount > 0 && (
  <Badge variant="destructive" className="absolute -top-1.5 -end-2 ...">
    {unreadCount > 99 ? "99+" : unreadCount}
  </Badge>
)}
```

## Commits

| Hash | Message |
|------|---------|
| 5d8dafe | feat(37-02): refactor MobileBottomNav with role-based navigation |

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- [x] Component imports getMobileTabsForRole from navigation.ts
- [x] Component uses useCurrentUser for effectiveRole
- [x] Component queries directMessages.getTotalUnreadCount
- [x] Uses safe-area-bottom class (not pb-safe)
- [x] Has md:hidden to hide on desktop
- [x] Has motion.div with layoutId="activeTab" for animation
- [x] Badge component used for unread count display
- [x] TypeScript compiles without errors

## Next Phase Readiness

**Ready for 37-03:** AppShell Integration

The MobileBottomNav component is complete and ready to be integrated into AppShell. Next plan will:
1. Import MobileBottomNav into AppShell
2. Add bottom padding to content area on mobile (pb-20)
3. Adjust full-bleed page heights to account for tab bar

**No blockers identified.**
