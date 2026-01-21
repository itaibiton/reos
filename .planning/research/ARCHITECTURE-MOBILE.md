# Architecture Patterns: Mobile Responsive Integration

**Domain:** Mobile responsiveness and header redesign for existing Next.js App Router application
**Researched:** 2026-01-21
**Confidence:** HIGH (based on codebase analysis)

## Current Architecture Summary

### Component Hierarchy

```
LocaleLayout (src/app/[locale]/layout.tsx)
├── ClerkProvider
│   └── ConvexClientProvider
│       └── Providers (DirectionProvider + NextIntlClientProvider)
│           └── Route Group Layouts
│               ├── (auth)/layout.tsx - Minimal auth pages
│               ├── (main)/layout.tsx - Landing pages
│               └── (app)/layout.tsx - Main app shell
                    └── AppShell
                        ├── SidebarProvider
                        │   ├── AppSidebar (collapsible icon)
                        │   └── SidebarInset
                        │       ├── Header (sticky)
                        │       │   ├── SidebarTrigger
                        │       │   ├── Breadcrumbs
                        │       │   ├── GlobalSearchBar
                        │       │   └── ProviderHeaderContent
                        │       │       ├── LocaleSwitcher
                        │       │       ├── NotificationCenter
                        │       │       ├── RoleSwitcher (admin)
                        │       │       └── UserButton
                        │       └── Main Content
```

### Existing Mobile Handling

| Component | Current Mobile Behavior |
|-----------|------------------------|
| `sidebar.tsx` | Uses Sheet component for mobile via `useIsMobile()` hook (768px breakpoint) |
| `MobileBottomNav.tsx` | Exists but **not integrated** into AppShell - hardcoded investor nav items |
| `Header.tsx` | Separate legacy component, not currently used in main flow |
| `GlobalSearchBar` | Hidden on mobile (`hidden md:flex`) |
| `useIsMobile` | Hook at 768px breakpoint via `matchMedia` |

### Key Integration Points

| Integration Point | File | How It Works |
|-------------------|------|--------------|
| Mobile Detection | `src/hooks/use-mobile.ts` | `useIsMobile()` returns boolean, 768px breakpoint |
| RTL Support | `Providers.tsx` | `DirectionProvider` wraps app, direction from locale |
| Role-Based Nav | `src/lib/navigation.ts` | `getNavigationForRole(role)` returns role-specific groups |
| Sidebar State | `sidebar.tsx` | `SidebarContext` provides `isMobile`, `openMobile`, `state` |
| Auth State | `useCurrentUser.ts` | Provides `effectiveRole`, `isAdmin`, `isLoading` |

## Recommended Architecture for Mobile Responsive

### Overview

```
AppShell (modified)
├── SidebarProvider
│   ├── AppSidebar (desktop only - hidden on mobile)
│   └── SidebarInset
│       ├── ResponsiveHeader (new - simplified on mobile)
│       │   ├── Desktop: Full header with breadcrumbs, search, actions
│       │   └── Mobile: Minimal header with hamburger menu trigger
│       ├── Main Content (add bottom padding on mobile for tab bar)
│       └── MobileBottomNav (mobile only - role-aware)
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `AppShell` | Layout orchestration, mobile/desktop switching | SidebarProvider, useIsMobile |
| `ResponsiveHeader` | Adaptive header rendering | useIsMobile, existing header components |
| `MobileBottomNav` | Bottom tab navigation on mobile | getNavigationForRole, useCurrentUser |
| `MobileHeaderMenu` | Slide-out menu for mobile (replaces sidebar) | Navigation config, Sheet component |
| `HeaderActionsDropdown` | Consolidated header actions | NotificationCenter, LocaleSwitcher, UserButton |

### Data Flow

```
User Role (useCurrentUser)
       │
       ▼
getNavigationForRole(role)
       │
       ├──────────────────────┬────────────────────┐
       ▼                      ▼                    ▼
AppSidebar (desktop)    MobileBottomNav       MobileHeaderMenu
       │                   (mobile)             (mobile)
       │                      │                    │
       ▼                      ▼                    ▼
Role-specific groups    Top 4-5 nav items     Full navigation
with collapsibles       (configurable)        in sheet/drawer
```

## New Components Needed

### 1. MobileBottomNav (Refactor existing)

**Current:** Hardcoded `navItems` array for investor role only
**Needed:** Role-aware navigation using `getNavigationForRole()`

```typescript
// Suggested structure
interface MobileNavConfig {
  // Map roles to their mobile tab priorities
  [role: string]: {
    items: string[]; // hrefs of items to show in bottom tabs
    moreLabel: string; // i18n key for "More" tab
  }
}

const mobileNavConfig: MobileNavConfig = {
  investor: {
    items: ["/properties", "/properties/saved", "/deals", "/chat"],
    moreLabel: "navigation.items.more"
  },
  broker: {
    items: ["/dashboard", "/properties", "/leads", "/chat"],
    moreLabel: "navigation.items.more"
  },
  // ... other roles
};
```

### 2. MobileHeaderMenu (New)

**Purpose:** Full navigation access on mobile via hamburger menu
**Pattern:** Use existing Sheet component (already used by sidebar on mobile)

```typescript
// Key props
interface MobileHeaderMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
// Renders: Full navigation tree from getNavigationForRole()
// Includes: User info, settings, logout
```

### 3. HeaderActionsDropdown (New)

**Purpose:** Consolidate header right-side actions on mobile
**Pattern:** Single dropdown containing all header actions

```typescript
// Contents when expanded:
// - NotificationCenter (or badge + link)
// - LocaleSwitcher
// - ThemeSwitcher (new)
// - Role Switcher (admin only)
// - Profile link
// - Sign out
```

### 4. ThemeProvider Integration (New)

**Purpose:** Support light/dark/system theme switching
**Pattern:** Wrap at Providers level, use next-themes

```typescript
// In Providers.tsx
<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  <DirectionProvider dir={direction}>
    {/* ... */}
  </DirectionProvider>
</ThemeProvider>
```

## Modified Components

### AppShell Modifications

| Change | Rationale |
|--------|-----------|
| Add `useIsMobile()` hook call | Conditional rendering of mobile vs desktop layout |
| Conditionally render `AppSidebar` | Hide sidebar completely on mobile (use bottom nav + menu instead) |
| Add `MobileBottomNav` for mobile | Primary navigation on mobile |
| Add bottom padding to main content | Prevent bottom nav overlap |
| Simplify header on mobile | Remove breadcrumbs, consolidate actions |

### Sidebar Modifications

| Change | Rationale |
|--------|-----------|
| Add `hidden md:block` to wrapper | Completely hide on mobile (not sheet mode) |
| Remove mobile Sheet rendering | Mobile nav handled by MobileBottomNav + MobileHeaderMenu |

### Header Modifications

| Change | Rationale |
|--------|-----------|
| Mobile: Hide breadcrumbs | Space constrained, use page titles instead |
| Mobile: Replace search with icon button | Opens search modal |
| Mobile: Consolidate right actions into dropdown | Single tap to access all actions |
| Add hamburger menu trigger | Opens MobileHeaderMenu sheet |

## Patterns to Follow

### Pattern 1: Responsive Component Composition

**What:** Use composition with `useIsMobile()` for different mobile/desktop renders
**When:** Component has significantly different mobile vs desktop UI

```typescript
export function ResponsiveHeader() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileHeader />;
  }

  return <DesktopHeader />;
}
```

### Pattern 2: Role-Aware Mobile Navigation

**What:** Derive mobile nav items from existing navigation config
**When:** Building role-specific bottom tabs

```typescript
function getMobileNavItems(role: UserRole): NavItem[] {
  const config = getNavigationForRole(role);
  const mobileConfig = mobileNavPriority[role];

  // Filter and order items based on mobile priority
  return mobileConfig.items
    .map(href => findNavItem(config, href))
    .filter(Boolean)
    .slice(0, 4); // Max 4 items + "More"
}
```

### Pattern 3: Safe Area Handling

**What:** Account for device safe areas (notch, home indicator)
**When:** Fixed positioning at screen edges

```typescript
// Already in MobileBottomNav:
className="... pb-safe"

// CSS utility needed in globals.css:
@layer utilities {
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
  }
  .pt-safe {
    padding-top: env(safe-area-inset-top);
  }
}
```

### Pattern 4: Theme Integration with next-themes

**What:** Use next-themes for theme switching
**When:** Adding dark mode support

```typescript
// Already installed: "next-themes": "^0.4.6"
import { useTheme } from "next-themes";

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  // ...
}
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Duplicating Navigation Logic

**What:** Creating separate navigation arrays for mobile
**Why bad:** Maintenance burden, inconsistency risk
**Instead:** Derive mobile nav from existing `getNavigationForRole()`

### Anti-Pattern 2: CSS-Only Responsive (for complex state)

**What:** Using only CSS media queries for mobile navigation
**Why bad:** Navigation state, animations, and gestures need JS
**Instead:** Use `useIsMobile()` hook for conditional rendering

### Anti-Pattern 3: Inline Mobile Breakpoint Checks

**What:** Checking `window.innerWidth` directly in components
**Why bad:** SSR issues, inconsistent behavior, no reactivity
**Instead:** Use `useIsMobile()` hook consistently

### Anti-Pattern 4: Ignoring RTL in Mobile

**What:** Hardcoding left/right positioning
**Why bad:** Breaks Hebrew RTL layout
**Instead:** Use logical properties (`start`/`end`) and `useDirection()` from Radix

## Suggested Build Order

### Phase 1: Foundation (Low risk, enables rest)

| Step | Component | Rationale |
|------|-----------|-----------|
| 1.1 | Add ThemeProvider to Providers.tsx | next-themes already installed, simple wrap |
| 1.2 | Add safe-area CSS utilities to globals.css | Required for mobile bottom nav |
| 1.3 | Create mobile nav config type/constants | Foundation for role-aware mobile nav |

### Phase 2: Mobile Navigation (Core feature)

| Step | Component | Rationale |
|------|-----------|-----------|
| 2.1 | Refactor MobileBottomNav to use role config | Make existing component role-aware |
| 2.2 | Create MobileHeaderMenu component | Full nav access via hamburger |
| 2.3 | Integrate MobileBottomNav into AppShell | Show on mobile only |
| 2.4 | Add hamburger trigger to header | Opens MobileHeaderMenu |

### Phase 3: Header Redesign (Polish)

| Step | Component | Rationale |
|------|-----------|-----------|
| 3.1 | Create HeaderActionsDropdown | Consolidate right-side actions |
| 3.2 | Create ThemeSwitcher component | Light/dark/system toggle |
| 3.3 | Create ResponsiveHeader | Desktop vs mobile header logic |
| 3.4 | Update AppShell header section | Use ResponsiveHeader |

### Phase 4: Integration and Testing (Validation)

| Step | Task | Rationale |
|------|------|-----------|
| 4.1 | Test all user roles on mobile | Verify role-specific nav works |
| 4.2 | Test RTL (Hebrew) on mobile | Verify mirroring works |
| 4.3 | Test theme switching | Light/dark/system all work |
| 4.4 | Test safe areas | iPhone notch/home indicator |

## File Organization

```
src/components/layout/
├── AppShell.tsx          # Modified: add mobile detection, conditional rendering
├── Sidebar.tsx           # Modified: hide on mobile via CSS
├── Header.tsx            # May deprecate or refactor
├── ResponsiveHeader.tsx  # New: mobile/desktop header switcher
├── MobileBottomNav.tsx   # Modified: role-aware navigation
├── MobileHeaderMenu.tsx  # New: full nav sheet for mobile
├── HeaderActionsDropdown.tsx  # New: consolidated header actions
├── ThemeSwitcher.tsx     # New: theme toggle component
├── TopNav.tsx            # Existing: may integrate or deprecate
└── InvestorSearchBar.tsx # Existing: keep for specific pages

src/lib/
├── navigation.ts         # Existing: add mobile nav priority config
└── mobile-nav.ts         # New: mobile-specific nav utilities
```

## RTL Considerations

| Element | RTL Handling |
|---------|--------------|
| Bottom Nav | Items naturally flow RTL via flexbox |
| Sheet/Menu | Opens from `end` side (right in LTR, left in RTL) |
| Icons | Most icons are symmetric, no flip needed |
| Swipe gestures | Reverse direction for RTL (if using gestures) |
| Safe areas | Same across LTR/RTL |

The existing `DirectionProvider` from Radix and logical CSS properties (`start`/`end`, `ms-`/`me-`) in the codebase handle most RTL concerns automatically.

## Sources

| Source | Confidence | Notes |
|--------|------------|-------|
| Codebase analysis | HIGH | Direct file inspection of AppShell, Sidebar, navigation.ts |
| Shadcn sidebar component | HIGH | Reviewed implementation patterns in sidebar.tsx |
| next-themes package | HIGH | Already in dependencies, well-documented |
| Tailwind CSS 4 | MEDIUM | Using @import syntax, CSS variables |

## Open Questions

1. **Gesture Navigation:** Should mobile menu support swipe-to-close? Requires additional library or custom implementation.

2. **Search on Mobile:** Should search be a full-screen modal or slide-out panel? Current GlobalSearchBar uses CommandDialog which may need mobile adaptation.

3. **Notification Count Badge:** Should the consolidated header dropdown show aggregate notification count? Currently NotificationCenter shows its own badge.

4. **Tab Bar Animation:** Should bottom nav items animate on selection? Framer Motion is available in dependencies.

5. **More Tab Behavior:** Should "More" tab open the full MobileHeaderMenu, or show a mini-menu with remaining items?
