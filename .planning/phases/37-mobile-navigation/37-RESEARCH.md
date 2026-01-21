# Phase 37: Mobile Navigation - Research

**Researched:** 2026-01-21
**Domain:** Mobile bottom tab bar, role-based navigation, framer-motion animations, safe-area insets
**Confidence:** HIGH

## Summary

Phase 37 implements a mobile-first bottom tab bar navigation that replaces the sidebar on mobile devices. The research confirms that the REOS codebase already has most infrastructure in place:

1. **MobileBottomNav component exists** at `src/components/layout/MobileBottomNav.tsx` but is NOT integrated into AppShell and has hardcoded nav items instead of role-based navigation
2. **Role-based navigation config** exists at `src/lib/navigation.ts` with `getNavigationForRole()` returning NavGroup arrays for all 9 roles
3. **useIsMobile() hook** at 768px breakpoint ready in `src/hooks/use-mobile.ts`
4. **Safe area utilities** defined in globals.css (`.safe-area-bottom`, etc.) but MobileBottomNav incorrectly uses `pb-safe` which doesn't exist
5. **Framer-motion animation patterns** exist in `src/components/landing/shared/animations.ts` with reusable variants

**Primary recommendation:** Refactor MobileBottomNav to use role-based navigation config, integrate into AppShell, fix safe-area class usage, add framer-motion animations, and add badge support for unread counts.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| framer-motion | 12.26.2 | Tab transition animations | Already in dependencies, used across landing page |
| next-intl | 4.7.0 | Tab label translations | Already configured, navigation.items.* keys exist |
| @hugeicons/react | 1.1.4 | Tab icons | Used throughout REOS for icons, matches existing MobileBottomNav |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | 0.562.0 | Sidebar icons (for reference) | Navigation config uses Lucide; may need icon mapping |
| convex | 1.31.3 | Unread count queries | api.directMessages.getTotalUnreadCount, api.notifications.getUnreadCount |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| HugeIcons | Lucide icons (from nav config) | Would require icon mapping; HugeIcons already used in MobileBottomNav |
| framer-motion | CSS transitions | Less flexibility, no spring physics, inconsistent with landing page |

**Installation:**
```bash
# No installation needed - all packages already present
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/layout/
│   ├── AppShell.tsx           # MODIFY: Add MobileBottomNav integration
│   ├── MobileBottomNav.tsx    # MODIFY: Role-based, badges, animations
│   └── Sidebar.tsx            # NO CHANGES (hidden via md:hidden by sidebar.tsx)
├── lib/
│   └── navigation.ts          # ADD: getMobileTabsForRole() function
└── hooks/
    └── use-mobile.ts          # NO CHANGES (already works)
```

### Pattern 1: Role-Based Mobile Tab Selection

**What:** Select 5 most important tabs per role from full navigation config
**When to use:** Always - mobile tab bar has limited space
**Example:**
```typescript
// src/lib/navigation.ts
// Source: Existing navigation.ts structure

export type MobileTabItem = {
  labelKey: string;
  href: string;
  icon: LucideIcon;       // Keep Lucide for type compatibility
  hugeIcon: IconSvgElement; // Add HugeIcon for mobile
  showBadge?: "chat" | "notifications"; // Which unread count to show
};

/**
 * Get mobile bottom tab items for a role (max 5 tabs)
 * Investor: Properties, Feed, Chat, Deals, Profile
 * Provider: Dashboard, Clients, Chat, Feed, Profile
 */
export function getMobileTabsForRole(role: UserRole): MobileTabItem[] {
  if (role === "investor") {
    return [
      { labelKey: "navigation.items.browseProperties", href: "/properties", icon: Building2, hugeIcon: Building02Icon },
      { labelKey: "navigation.items.feed", href: "/feed", icon: Rss, hugeIcon: News01Icon },
      { labelKey: "navigation.items.chat", href: "/chat", icon: MessageSquare, hugeIcon: Message02Icon, showBadge: "chat" },
      { labelKey: "navigation.items.deals", href: "/deals", icon: Handshake, hugeIcon: Agreement01Icon },
      { labelKey: "navigation.items.profile", href: "/profile/investor", icon: UserCircle, hugeIcon: UserIcon },
    ];
  }
  // Provider roles (broker, mortgage_advisor, lawyer, etc.)
  return [
    { labelKey: "navigation.items.dashboard", href: "/dashboard", icon: Home, hugeIcon: Home01Icon },
    { labelKey: "navigation.items.clients", href: "/clients", icon: Users, hugeIcon: UserMultiple02Icon },
    { labelKey: "navigation.items.chat", href: "/chat", icon: MessageSquare, hugeIcon: Message02Icon, showBadge: "chat" },
    { labelKey: "navigation.items.feed", href: "/feed", icon: Rss, hugeIcon: News01Icon },
    { labelKey: "navigation.items.profile", href: "/profile/provider", icon: UserCircle, hugeIcon: UserIcon },
  ];
}
```

### Pattern 2: Bottom Tab Bar with Animations

**What:** Fixed bottom tab bar with smooth tab transitions
**When to use:** Mobile navigation component
**Example:**
```typescript
// src/components/layout/MobileBottomNav.tsx
// Source: Existing MobileBottomNav + framer-motion patterns

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getMobileTabsForRole, type UserRole } from "@/lib/navigation";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function MobileBottomNav() {
  const pathname = usePathname();
  const t = useTranslations();
  const { effectiveRole } = useCurrentUser();

  // Unread counts
  const chatUnread = useQuery(api.directMessages.getTotalUnreadCount);
  const notificationUnread = useQuery(api.notifications.getUnreadCount);

  const role = (effectiveRole as UserRole) ?? "investor";
  const tabs = getMobileTabsForRole(role);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden safe-area-bottom">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");
          const unreadCount = tab.showBadge === "chat" ? chatUnread :
                             tab.showBadge === "notifications" ? notificationUnread : 0;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 min-w-[60px]",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-2 left-1/2 -translate-x-1/2 h-0.5 w-6 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}

              <div className="relative">
                <HugeiconsIcon
                  icon={tab.hugeIcon}
                  size={22}
                  strokeWidth={isActive ? 2 : 1.5}
                />
                {/* Badge for unread count */}
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1.5 -end-2 h-4 min-w-4 px-1 text-[10px]"
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Badge>
                )}
              </div>

              <span className="text-[10px] font-medium">{t(tab.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

### Pattern 3: AppShell Mobile Integration

**What:** Conditionally render MobileBottomNav and adjust content area
**When to use:** AppShell layout component
**Example:**
```typescript
// src/components/layout/AppShell.tsx
// Source: Existing AppShell structure

import { MobileBottomNav } from "./MobileBottomNav";
import { useIsMobile } from "@/hooks/use-mobile";

export function AppShell({ children }: AppShellProps) {
  const isMobile = useIsMobile();
  // ... existing code ...

  return (
    <SidebarProvider>
      {/* ... existing providers and sidebar ... */}
      <SidebarInset>
        {/* ... existing header ... */}

        {/* Main content area - add bottom padding on mobile for tab bar */}
        <main className={cn(
          isFullBleedPage ? "" : "p-6",
          isMobile && "pb-20" // ~80px for tab bar + safe area
        )}>
          {isFullBleedPage ? (
            <div className={cn(
              "h-[calc(100dvh-4rem)]",
              isMobile && "h-[calc(100dvh-4rem-5rem)]" // Account for tab bar
            )}>
              {children}
            </div>
          ) : (
            children
          )}
        </main>
      </SidebarInset>

      {/* Mobile bottom navigation - only shown on mobile via md:hidden */}
      <MobileBottomNav />
    </SidebarProvider>
  );
}
```

### Anti-Patterns to Avoid
- **Don't duplicate navigation config:** Use getMobileTabsForRole() derived from existing navigation.ts, not separate hardcoded arrays
- **Don't mix vh and dvh:** Use 100dvh consistently for iOS Safari compatibility (established in Phase 35)
- **Don't use pb-safe:** The utility doesn't exist; use `safe-area-bottom` class instead
- **Don't fetch unread counts without auth check:** Convex queries return 0 for unauthenticated users (safe)

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Tab animations | CSS transitions only | framer-motion layoutId | Shared layout animations for smooth tab indicator movement |
| Responsive detection | window.innerWidth checks | useIsMobile() hook | Already handles SSR, debouncing, and media query matching |
| Safe area padding | Custom CSS calc | safe-area-bottom class | env() fallbacks already handled in globals.css |
| Icon consistency | Mix icon libraries | HugeIcons for mobile, define mapping | Matches existing MobileBottomNav pattern |
| Unread badge styling | Custom styles | Badge component | Consistent with NotificationCenter styling |

**Key insight:** The infrastructure exists; this phase is primarily integration and refinement work, not building new systems.

## Common Pitfalls

### Pitfall 1: Safe Area Class Mismatch
**What goes wrong:** MobileBottomNav uses `pb-safe` which doesn't exist
**Why it happens:** Phase 35 defined `.safe-area-bottom`, not `.pb-safe`
**How to avoid:** Use `safe-area-bottom` class, not `pb-safe`
**Warning signs:** Tab bar content hidden behind iPhone home indicator

### Pitfall 2: Content Overlap with Tab Bar
**What goes wrong:** Page content renders behind fixed tab bar
**Why it happens:** Missing bottom padding in content area
**How to avoid:** Add conditional `pb-20` (or use `h-app-content-mobile` utility) on mobile
**Warning signs:** Last list items or buttons cut off or unclickable

### Pitfall 3: Sidebar Still Visible on Mobile
**What goes wrong:** Both sidebar and bottom tabs show on mobile
**Why it happens:** Shadcn sidebar uses Sheet (slide-over) on mobile, not hidden
**How to avoid:** Sidebar.tsx already uses `md:block` - sidebar is hidden on mobile by default
**Warning signs:** Double navigation elements

### Pitfall 4: Flash of Wrong Navigation
**What goes wrong:** Investor tabs flash before showing provider tabs (or vice versa)
**Why it happens:** effectiveRole is undefined during initial load
**How to avoid:** Show skeleton/loading state while `effectiveRole` is loading; default to "investor" is acceptable
**Warning signs:** Tab icons/labels changing after initial render

### Pitfall 5: Tab Bar on Auth Pages
**What goes wrong:** Bottom tabs appear on sign-in, landing, or unauthenticated pages
**Why it happens:** MobileBottomNav rendered unconditionally
**How to avoid:** Only render MobileBottomNav inside AppShell which is only used in (app) route group
**Warning signs:** Navigation tabs on landing page or login screen

## Code Examples

Verified patterns from official sources and existing codebase:

### Framer Motion layoutId for Tab Indicator
```typescript
// Source: framer-motion docs + existing landing page patterns
import { motion } from "framer-motion";

// Inside tab loop:
{isActive && (
  <motion.div
    layoutId="activeTab" // Shared across all tabs for smooth movement
    className="absolute -top-2 h-0.5 w-6 bg-primary rounded-full"
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
  />
)}
```

### Badge for Unread Count
```typescript
// Source: NotificationCenter.tsx lines 225-231
{unreadCount > 0 && (
  <Badge
    variant="destructive"
    className="absolute -top-1 -end-1 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center"
  >
    {unreadCount > 99 ? "99+" : unreadCount}
  </Badge>
)}
```

### Safe Area Bottom Padding
```css
/* Source: globals.css lines 324-326 */
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
```

### Role-Based Navigation Query
```typescript
// Source: Sidebar.tsx lines 39-46
const { effectiveRole, isLoading } = useCurrentUser();
const role = (effectiveRole as UserRole) ?? "investor";
const navigation = getNavigationForRole(role);
```

### Unread Count Convex Queries
```typescript
// Source: convex/directMessages.ts line 116
// Chat unread count
const chatUnread = useQuery(api.directMessages.getTotalUnreadCount);

// Source: convex/notifications.ts line 128
// Notification unread count
const notificationUnread = useQuery(api.notifications.getUnreadCount);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| CSS transitions for tabs | framer-motion layoutId | framer-motion v10+ | Smoother shared element transitions |
| 100vh for full height | 100dvh (dynamic viewport) | Phase 35 | Fixes iOS Safari bottom bar issues |
| viewport meta in HTML | Next.js Viewport export | Next.js 14+ | Type-safe, server-rendered viewport |

**Deprecated/outdated:**
- `pb-safe` utility: Never existed, was likely copied from tailwindcss-safe-area plugin docs. Use `safe-area-bottom` instead.

## Open Questions

Things that couldn't be fully resolved:

1. **Icon Library Decision**
   - What we know: MobileBottomNav uses HugeIcons, navigation.ts uses Lucide
   - What's unclear: Should we map Lucide icons to HugeIcons, or change navigation.ts?
   - Recommendation: Add hugeIcon property to MobileTabItem type; keep both for flexibility

2. **Admin Role Tabs**
   - What we know: Admin has viewingAsRole capability to impersonate other roles
   - What's unclear: Should admin bottom tabs reflect viewingAsRole or show admin-specific tabs?
   - Recommendation: Use effectiveRole (which includes viewingAsRole) consistently - already how Sidebar works

3. **Settings Tab Inclusion**
   - What we know: Requirements show 5 tabs without Settings
   - What's unclear: Should Settings be accessible via Profile or as 5th tab?
   - Recommendation: Settings accessible from Profile page, not in bottom tabs (matches iOS pattern)

## Sources

### Primary (HIGH confidence)
- `/Users/Kohelet/Code/REOS/src/components/layout/MobileBottomNav.tsx` - Existing component implementation
- `/Users/Kohelet/Code/REOS/src/lib/navigation.ts` - Full navigation config with 9 roles
- `/Users/Kohelet/Code/REOS/src/components/layout/AppShell.tsx` - Current layout structure
- `/Users/Kohelet/Code/REOS/src/components/ui/sidebar.tsx` - Shadcn sidebar mobile behavior
- `/Users/Kohelet/Code/REOS/src/app/globals.css` - Safe area utilities
- `/Users/Kohelet/Code/REOS/convex/directMessages.ts` - getTotalUnreadCount query
- `/Users/Kohelet/Code/REOS/convex/notifications.ts` - getUnreadCount query

### Secondary (MEDIUM confidence)
- `/Users/Kohelet/Code/REOS/src/components/landing/shared/animations.ts` - Framer motion patterns
- `/Users/Kohelet/Code/REOS/src/components/notifications/NotificationCenter.tsx` - Badge styling pattern
- `/Users/Kohelet/Code/REOS/.planning/phases/35-mobile-foundation/35-RESEARCH.md` - Safe area setup context

### Tertiary (LOW confidence)
- WebSearch: tailwindcss-safe-area plugin docs for `pb-safe` pattern (not installed in REOS)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All packages already installed, verified in package.json
- Architecture: HIGH - All integration points verified in existing code
- Pitfalls: HIGH - Discovered actual bug (pb-safe vs safe-area-bottom) through code review

**Research date:** 2026-01-21
**Valid until:** 2026-02-21 (30 days - stable patterns)
