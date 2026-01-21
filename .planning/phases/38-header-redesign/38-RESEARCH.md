# Phase 38: Header Redesign - Research

**Researched:** 2026-01-21
**Domain:** Header UI consolidation, Avatar dropdown, Mobile search expansion
**Confidence:** HIGH

## Summary

This phase consolidates multiple header elements (notifications, settings, sign out) into a single avatar dropdown while adding mobile-specific search behavior. The codebase already has all required building blocks: existing NotificationCenter with working queries, ThemeSwitcher and LocaleSwitcher components, Shadcn Tabs and Popover primitives, framer-motion animation utilities, and Clerk authentication hooks.

The key architectural decision is using a Popover with internal Tabs rather than a DropdownMenu, because tabs require persistent state and content areas that DropdownMenu doesn't support well. The existing NotificationCenter already uses Popover successfully.

**Primary recommendation:** Build an AvatarDropdown component using Popover + Tabs, refactoring existing NotificationCenter content into a reusable tab, and use `useClerk().signOut()` for custom sign-out instead of UserButton.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already in Codebase)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @radix-ui/react-popover | 1.1.15 | Dropdown container | Already used by NotificationCenter, handles positioning/focus |
| @radix-ui/react-tabs | 1.1.13 | Tab switching in dropdown | Already has Shadcn wrapper, accessible |
| framer-motion | 12.26.2 | Search expansion animation | Already used extensively in landing pages |
| @clerk/nextjs | 6.36.7 | Sign out via useClerk() | Already installed, supports custom UI |

### Supporting (Already in Codebase)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @radix-ui/react-avatar | 1.1.11 | Avatar trigger display | Already wrapped in src/components/ui/avatar.tsx |
| next-themes | 0.4.6 | Theme state | Already used by ThemeSwitcher |
| next-intl | 4.7.0 | i18n for dropdown labels | Already used throughout app |

### No New Dependencies Required

All functionality can be built with existing packages. Do NOT add:
- New dropdown libraries
- Animation libraries other than framer-motion
- Custom popover implementations

**Installation:** None required - all dependencies exist.

## Architecture Patterns

### Recommended Component Structure
```
src/components/
├── layout/
│   ├── Header.tsx                    # Modified - remove UserButton, add AvatarDropdown
│   └── AppShell.tsx                  # Modified - same changes
├── header/
│   ├── AvatarDropdown.tsx            # NEW - Main dropdown with tabs
│   ├── NotificationsTab.tsx          # NEW - Extracted from NotificationCenter
│   ├── SettingsTab.tsx               # NEW - Theme + Language switches
│   └── MobileSearchExpander.tsx      # NEW - Expanding search for mobile
└── notifications/
    └── NotificationCenter.tsx        # Keep for backwards compat, or deprecate
```

### Pattern 1: Popover with Tabs for Multi-Section Dropdown
**What:** Use Radix Popover containing Radix Tabs for organized content sections
**When to use:** When dropdown needs distinct content areas with state preservation
**Example:**
```typescript
// Source: Existing pattern in codebase + Radix docs
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AvatarDropdown() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.imageUrl} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          {/* Unread badge */}
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -end-1 h-4 min-w-4">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <Tabs defaultValue="notifications">
          <TabsList className="w-full">
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="notifications">
            {/* Notification list */}
          </TabsContent>
          <TabsContent value="settings">
            {/* Theme + Language */}
          </TabsContent>
        </Tabs>
        <Separator />
        <Button onClick={handleSignOut} variant="ghost" className="w-full">
          Sign Out
        </Button>
      </PopoverContent>
    </Popover>
  );
}
```

### Pattern 2: Clerk signOut with Custom UI
**What:** Use useClerk() hook to get signOut function instead of UserButton component
**When to use:** When building custom auth UI (requirement HDR-10)
**Example:**
```typescript
// Source: https://clerk.com/docs/custom-flows/sign-out
"use client";

import { useClerk } from "@clerk/nextjs";
import { useRouter } from "@/i18n/navigation";

function SignOutButton() {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirectUrl: "/" });
  };

  return (
    <Button onClick={handleSignOut} variant="ghost">
      Sign Out
    </Button>
  );
}
```

### Pattern 3: Framer Motion Search Expansion
**What:** AnimatePresence with width/opacity animation for mobile search
**When to use:** HDR-01 search expansion on mobile tap
**Example:**
```typescript
// Source: Existing animations.ts patterns + framer-motion docs
import { motion, AnimatePresence } from "framer-motion";

function MobileSearchExpander() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="md:hidden flex items-center">
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.button
            key="search-icon"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(true)}
          >
            <Search01Icon />
          </motion.button>
        ) : (
          <motion.div
            key="search-input"
            initial={{ width: 40, opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
            exit={{ width: 40, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex items-center gap-2"
          >
            <Input autoFocus placeholder="Search..." />
            <Button variant="ghost" onClick={() => setIsExpanded(false)}>
              <Cancel01Icon />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

### Pattern 4: Notification Grouping by Type
**What:** Group notifications by their type field before rendering
**When to use:** HDR-09 requirement for grouped notifications
**Example:**
```typescript
// Source: Existing notification types from convex/notifications.ts
const groupedNotifications = useMemo(() => {
  if (!notifications) return {};

  return notifications.reduce((groups, notification) => {
    const type = notification.type;
    if (!groups[type]) groups[type] = [];
    groups[type].push(notification);
    return groups;
  }, {} as Record<string, typeof notifications>);
}, [notifications]);

// Type labels for grouping
const typeLabels: Record<string, string> = {
  new_message: t("notifications.types.messages"),
  deal_stage_change: t("notifications.types.deals"),
  file_uploaded: t("notifications.types.files"),
  request_received: t("notifications.types.requests"),
  request_accepted: t("notifications.types.requests"),
  request_declined: t("notifications.types.requests"),
};
```

### Anti-Patterns to Avoid
- **Using DropdownMenu for tabbed content:** DropdownMenu closes on any click, doesn't support persistent tabs
- **Keeping UserButton and adding custom dropdown:** Creates duplicate auth UI, confusing UX
- **Building custom notification queries:** Use existing api.notifications.list and api.notifications.getUnreadCount
- **CSS-only animations for search expansion:** Framer-motion provides better accessibility and interruptibility

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Notification fetching | Custom queries | `api.notifications.list`, `api.notifications.getUnreadCount` | Already exists, handles auth, optimized |
| Theme switching | Custom theme state | `useTheme()` from next-themes | Already integrated, handles SSR |
| Locale switching | Custom locale state | Existing `LocaleSwitcher` component | Already handles routing, cookies |
| Sign out | Custom auth flow | `useClerk().signOut()` | Handles session cleanup, redirects |
| Avatar rendering | Custom image component | Shadcn Avatar | Handles fallbacks, loading states |
| Popover positioning | Custom positioning | Radix Popover | Handles viewport edges, RTL |
| Tab accessibility | Custom tab logic | Radix Tabs | ARIA, keyboard navigation |

**Key insight:** Every UI primitive needed already exists in the codebase. The work is composition and extraction, not creation.

## Common Pitfalls

### Pitfall 1: Popover Closes on Tab Click
**What goes wrong:** Default Popover closes when clicking inside
**Why it happens:** Radix Popover auto-closes on outside click by default
**How to avoid:** Ensure tab clicks stay within PopoverContent; avoid nested buttons that steal focus
**Warning signs:** Dropdown closes when switching tabs

### Pitfall 2: Animation Interruption on Fast Taps
**What goes wrong:** Search expansion animation jitters on rapid tap/collapse
**Why it happens:** AnimatePresence mode not set correctly
**How to avoid:** Use `mode="wait"` to let exit animation complete before enter
**Warning signs:** Visual glitches when rapidly tapping search icon

### Pitfall 3: Badge Not Updating in Real-Time
**What goes wrong:** Unread count badge doesn't reflect new notifications
**Why it happens:** Using stale query or not using Convex reactive queries
**How to avoid:** Use `useQuery(api.notifications.getUnreadCount)` directly in trigger component
**Warning signs:** Badge shows 0 when notifications exist

### Pitfall 4: Breadcrumbs Hidden But Layout Shifts
**What goes wrong:** Removing breadcrumbs on mobile causes layout shift
**Why it happens:** Conditional rendering without reserving space
**How to avoid:** Use `hidden md:flex` pattern (same as GlobalSearchBar currently uses)
**Warning signs:** Header height changes between mobile/desktop

### Pitfall 5: Sign Out Doesn't Clear Convex State
**What goes wrong:** User data persists after sign out
**Why it happens:** Convex queries cache data, sign out only clears Clerk
**How to avoid:** `signOut({ redirectUrl: "/" })` forces full page reload, clearing cache
**Warning signs:** Seeing previous user's notifications after sign out

## Code Examples

Verified patterns from official sources:

### Clerk Sign Out (from official docs)
```typescript
// Source: https://clerk.com/docs/custom-flows/sign-out
"use client";

import { useClerk } from "@clerk/nextjs";

export function SignOutButton() {
  const { signOut } = useClerk();

  return (
    <button onClick={() => signOut({ redirectUrl: "/" })}>
      Sign out
    </button>
  );
}
```

### Existing NotificationCenter Badge Pattern
```typescript
// Source: /Users/Kohelet/Code/REOS/src/components/notifications/NotificationCenter.tsx
{unreadCount !== undefined && unreadCount > 0 && (
  <Badge
    variant="destructive"
    className="absolute -top-1 -end-1 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center"
  >
    {unreadCount > 99 ? "99+" : unreadCount}
  </Badge>
)}
```

### Existing Animation Variants
```typescript
// Source: /Users/Kohelet/Code/REOS/src/components/landing/shared/animations.ts
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export const accordionExpand: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.3, ease: "easeInOut" },
      opacity: { duration: 0.2 },
    },
  },
  expanded: {
    height: "auto",
    opacity: 1,
    transition: {
      height: { duration: 0.3, ease: "easeInOut" },
      opacity: { duration: 0.3, delay: 0.1 },
    },
  },
};
```

### Existing Tabs Usage
```typescript
// Source: /Users/Kohelet/Code/REOS/src/components/ui/tabs.tsx
<Tabs defaultValue="notifications" className="w-full">
  <TabsList className="grid w-full grid-cols-2">
    <TabsTrigger value="notifications">
      {t("dropdown.notifications")}
    </TabsTrigger>
    <TabsTrigger value="settings">
      {t("dropdown.settings")}
    </TabsTrigger>
  </TabsList>
  <TabsContent value="notifications" className="mt-0">
    {/* Content */}
  </TabsContent>
  <TabsContent value="settings" className="mt-0">
    {/* Content */}
  </TabsContent>
</Tabs>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Clerk UserButton component | Custom UI with useClerk() | HDR-10 requirement | Full control over dropdown styling |
| Separate notification popover | Consolidated avatar dropdown | This phase | Single interaction point |
| Desktop-only search bar | Mobile-expandable search | This phase | Mobile usability improvement |

**Deprecated/outdated:**
- `UserButton` component: Being replaced with custom UI per HDR-10
- Separate `NotificationCenter` popover: Content moves to AvatarDropdown tabs

## Existing Components to Reuse/Refactor

### Components to Extract Content From
| Component | Current Location | Extract | Reason |
|-----------|-----------------|---------|--------|
| NotificationCenter | `src/components/notifications/NotificationCenter.tsx` | NotificationItem, notification queries | Reuse in NotificationsTab |
| ThemeSwitcher | `src/components/theme/ThemeSwitcher.tsx` | Entire component | Embed in SettingsTab |
| LocaleSwitcher | `src/components/LocaleSwitcher.tsx` | Locale selection logic | Embed in SettingsTab (simplified) |

### Components to Modify
| Component | Location | Changes |
|-----------|----------|---------|
| Header.tsx | `src/components/layout/Header.tsx` | Remove UserButton, add AvatarDropdown, add MobileSearchExpander |
| AppShell.tsx | `src/components/layout/AppShell.tsx` | Same changes as Header.tsx |

### Existing Convex Queries to Use
| Query | File | Purpose |
|-------|------|---------|
| `api.notifications.list` | `convex/notifications.ts` | Get notification list for tab |
| `api.notifications.getUnreadCount` | `convex/notifications.ts` | Badge count on avatar |
| `api.notifications.markAsRead` | `convex/notifications.ts` | Mark individual notification read |
| `api.notifications.markAllAsRead` | `convex/notifications.ts` | Clear all notifications |
| `api.users.getCurrentUser` | `convex/users.ts` | Get user avatar, name for display |

## Open Questions

Things that couldn't be fully resolved:

1. **Tab Default State**
   - What we know: Tabs component supports `defaultValue` prop
   - What's unclear: Should dropdown remember last tab or always open to notifications?
   - Recommendation: Default to "notifications" tab, simpler UX

2. **Mobile Search Close Behavior**
   - What we know: Expansion works with AnimatePresence
   - What's unclear: Should clicking outside close expanded search, or only the X button?
   - Recommendation: Both - standard mobile pattern

3. **Admin Role Switcher Placement**
   - What we know: Currently in header next to UserButton
   - What's unclear: Should it move into dropdown settings tab or stay separate?
   - Recommendation: Keep separate (it's admin-only, settings tab is for all users)

## Sources

### Primary (HIGH confidence)
- Codebase analysis: Header.tsx, AppShell.tsx, NotificationCenter.tsx, ThemeSwitcher.tsx
- Codebase analysis: convex/notifications.ts (query APIs)
- Codebase analysis: animations.ts (framer-motion patterns)
- Clerk official docs: https://clerk.com/docs/custom-flows/sign-out

### Secondary (MEDIUM confidence)
- Radix Popover docs (via existing codebase usage)
- Radix Tabs docs (via existing codebase usage)
- Framer Motion docs for AnimatePresence mode

### Tertiary (LOW confidence)
- None - all patterns verified in codebase or official docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in package.json and actively used
- Architecture: HIGH - Patterns derived from existing codebase components
- Pitfalls: HIGH - Based on actual codebase patterns and Radix behavior

**Research date:** 2026-01-21
**Valid until:** 2026-02-21 (30 days - stable patterns)
