# Technology Stack: Mobile Responsive + Theme Switching

**Project:** REOS Mobile Responsiveness & Header Redesign
**Researched:** 2026-01-21
**Overall Confidence:** HIGH

## Executive Summary

Your existing stack already has everything needed for mobile responsiveness, bottom tab navigation, and theme switching. **No new packages required.** The key insight: `next-themes` is already installed (v0.4.6) but not wired up, Tailwind v4 has the dark mode CSS variables configured, and Framer Motion is available for animations. The bottom tab bar is a custom component built with existing primitives.

## What You Already Have (DO NOT ADD)

| Technology | Version | Ready For | Notes |
|------------|---------|-----------|-------|
| **next-themes** | 0.4.6 | Theme switching | Installed, needs ThemeProvider setup |
| **Tailwind CSS v4** | 4.1.18 | Dark mode, responsive | `.dark` class variant configured, CSS vars defined |
| **framer-motion** | 12.26.2 | Animations | Page transitions, tab bar animations |
| **vaul** | 1.1.2 | Mobile drawers | Bottom sheet component for mobile dropdowns |
| **@radix-ui/react-tabs** | 1.1.13 | Tab navigation | Base for bottom tab bar |
| **Shadcn/ui sidebar** | N/A | Mobile detection | `useIsMobile()` hook at 768px breakpoint |
| **Hugeicons** | 3.1.1 | Tab icons | Icon library already in use |

## Stack Changes Required

### 1. Wire Up next-themes (CONFIGURATION ONLY)

**Current state:** Package installed, not integrated into Providers.

**Required change:** Add `ThemeProvider` to your existing Providers component.

```typescript
// src/app/[locale]/Providers.tsx - UPDATE
"use client";

import { DirectionProvider } from "@radix-ui/react-direction";
import { NextIntlClientProvider, type Messages } from "next-intl";
import { ThemeProvider } from "next-themes";

type Props = {
  children: React.ReactNode;
  locale: string;
  direction: "ltr" | "rtl";
  messages: Messages;
};

export function Providers({ children, locale, direction, messages }: Props) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <DirectionProvider dir={direction}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </DirectionProvider>
    </ThemeProvider>
  );
}
```

**Root layout update:** Add `suppressHydrationWarning` to `<html>` element.

```typescript
// src/app/[locale]/layout.tsx - UPDATE <html> tag
<html
  lang={locale}
  dir={direction}
  suppressHydrationWarning  // ADD THIS
  className={`${inter.variable} ...`}
>
```

**Why `attribute="class"`:** Your CSS already uses `@custom-variant dark (&:is(.dark *));` which expects a `.dark` class on the HTML element. This matches next-themes' `attribute="class"` setting.

**Why `disableTransitionOnChange`:** Prevents flash of wrong colors during theme switch. Recommended for production.

### 2. Theme Toggle Component (NEW COMPONENT)

Create using existing Shadcn/ui primitives and Hugeicons.

```typescript
// src/components/ThemeSwitcher.tsx - NEW FILE
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Sun02Icon, Moon02Icon, Settings02Icon } from "@hugeicons/core-free-icons";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-1">
      <DropdownMenuItem onClick={() => setTheme("light")}>
        <HugeiconsIcon icon={Sun02Icon} size={16} />
        <span>Light</span>
        {theme === "light" && <CheckIcon />}
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setTheme("dark")}>
        <HugeiconsIcon icon={Moon02Icon} size={16} />
        <span>Dark</span>
        {theme === "dark" && <CheckIcon />}
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setTheme("system")}>
        <HugeiconsIcon icon={Settings02Icon} size={16} />
        <span>System</span>
        {theme === "system" && <CheckIcon />}
      </DropdownMenuItem>
    </div>
  );
}
```

**Critical pattern:** The `mounted` state check prevents hydration mismatch because `useTheme()` returns undefined on server.

### 3. Bottom Tab Bar (NEW COMPONENT - NO NEW DEPS)

Build with existing primitives. No external bottom nav library needed.

**Why custom, not a library:**
- Shadcn/ui has no official bottom nav component
- Material UI's BottomNavigation requires installing all of MUI
- React Navigation is for React Native, not web
- Your existing components (Radix tabs, Framer Motion) are sufficient

**Component structure:**

```typescript
// src/components/layout/BottomTabBar.tsx - NEW FILE
"use client";

import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";

interface Tab {
  href: string;
  icon: React.ComponentType;
  label: string;
}

interface BottomTabBarProps {
  tabs: Tab[];
}

export function BottomTabBar({ tabs }: BottomTabBarProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "fixed bottom-0 inset-x-0 z-50 md:hidden",
        "bg-background/95 backdrop-blur-sm border-t",
        "pb-[env(safe-area-inset-bottom,0px)]"  // Safe area for notch devices
      )}
    >
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full",
                "text-muted-foreground transition-colors",
                isActive && "text-primary"
              )}
            >
              <motion.div
                initial={false}
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <HugeiconsIcon icon={tab.icon} size={24} />
              </motion.div>
              <span className="text-xs mt-1">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

**Key patterns:**
- `md:hidden` - Only shows on mobile (< 768px)
- `pb-[env(safe-area-inset-bottom)]` - Handles iPhone notch/home indicator
- `backdrop-blur-sm` - Modern glass effect
- Framer Motion for subtle active state animation

### 4. Custom Clerk Sign Out (REPLACE UserButton)

Replace `<UserButton>` with custom dropdown using `useClerk()`.

```typescript
// src/components/layout/UserMenu.tsx - NEW FILE
"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { HugeiconsIcon } from "@hugeicons/react";
import { Logout01Icon } from "@hugeicons/core-free-icons";

export function UserMenu() {
  const { signOut } = useClerk();
  const { user } = useUser();

  const initials = user?.firstName?.[0] ?? user?.emailAddresses?.[0]?.emailAddress?.[0] ?? "?";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.imageUrl} alt={user?.fullName ?? ""} />
            <AvatarFallback>{initials.toUpperCase()}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* Notifications tab content */}
        {/* Settings tab content with ThemeSwitcher and LocaleSwitcher */}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut({ redirectUrl: "/" })}>
          <HugeiconsIcon icon={Logout01Icon} size={16} />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

**Why replace UserButton:**
- Custom dropdown allows embedding theme switcher and language switcher
- Consistent styling with rest of app
- Full control over menu items
- Uses existing Avatar and DropdownMenu components

### 5. Responsive Layout Wrapper (MODIFICATION)

Update AppShell to handle mobile bottom nav and adjust main content padding.

```typescript
// Key changes to AppShell:
// 1. Add padding-bottom on mobile for tab bar: pb-20 md:pb-0
// 2. Hide sidebar on mobile: hidden md:block in sidebar
// 3. Conditionally render BottomTabBar on mobile
```

## What NOT to Add

| Library | Why Not |
|---------|---------|
| **@mui/material** | Massive bundle, different design system |
| **react-navigation** | For React Native, not web |
| **any bottom-nav package** | Unnecessary - build with existing Radix + Framer Motion |
| **tailwindcss-animate** | You have `tw-animate-css` and Framer Motion |
| **any viewport meta package** | Use CSS `env(safe-area-inset-*)` directly |

## CSS Additions Required

### Safe Area Insets for PWA/Mobile

```css
/* Add to globals.css or component styles */

/* For PWA standalone mode */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .safe-area-bottom {
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }
}
```

### Viewport Meta (Already likely set, verify)

```html
<!-- In your root layout or document -->
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

The `viewport-fit=cover` is required for `safe-area-inset-*` to work on iOS.

## Tailwind Responsive Strategy

Your existing breakpoints are standard Tailwind:
- `sm:` - 640px+
- `md:` - 768px+ (your mobile/desktop breakpoint)
- `lg:` - 1024px+
- `xl:` - 1280px+

**Mobile-first approach:**
- Default styles = mobile
- Add `md:` prefix for desktop overrides
- Bottom tab bar: shows by default, `md:hidden`
- Sidebar: `hidden md:block`

## Integration Points

### With Existing i18n

The theme switcher and bottom tab bar both use translations:
- Add keys to `messages/en.json` and `messages/he.json`
- Tab labels are translatable
- Theme options (Light/Dark/System) need translation keys

### With Existing Convex Auth

Use `useConvexAuth()` instead of Clerk's `useAuth()` for checking auth state:
```typescript
import { useConvexAuth } from "convex/react";

const { isAuthenticated, isLoading } = useConvexAuth();
```

This ensures the auth token is ready for Convex requests.

### With RTL Support

Bottom tab bar works with RTL automatically because:
- Uses `inset-x-0` (logical, not `left-0 right-0`)
- Flexbox `justify-around` is direction-agnostic
- Icons don't flip (intentional for navigation)

## Configuration Checklist

| Item | Status | Action |
|------|--------|--------|
| next-themes installed | Done | Wire up ThemeProvider |
| Tailwind dark mode CSS | Done | Already has `.dark` vars |
| Framer Motion | Done | Use for animations |
| useIsMobile hook | Done | Already exists |
| Radix primitives | Done | Use for dropdowns, tabs |
| Safe area CSS | TODO | Add to globals.css |
| viewport-fit meta | Verify | Check root layout |

## Effort Estimation

| Task | Complexity | Notes |
|------|------------|-------|
| Wire up ThemeProvider | Low | Modify Providers.tsx, add suppressHydrationWarning |
| Create ThemeSwitcher | Low | ~30 lines, uses existing hooks |
| Create BottomTabBar | Medium | New component, ~80 lines |
| Create UserMenu (replace UserButton) | Medium | New component, consolidates header items |
| Update AppShell for mobile layout | Medium | Add responsive classes, bottom padding |
| Add safe area CSS | Low | ~5 lines |
| Test across breakpoints | Medium | Visual verification |

## Sources

### Official Documentation (HIGH confidence)
- [next-themes GitHub](https://github.com/pacocoursey/next-themes) - v0.4.6 setup verified
- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode) - v4 selector strategy
- [Shadcn/ui Dark Mode](https://ui.shadcn.com/docs/dark-mode/next) - ThemeProvider pattern
- [Clerk Custom Sign-Out](https://clerk.com/docs/custom-flows/sign-out) - useClerk().signOut() API
- [MDN env() CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/env) - safe-area-inset-*
- [Motion (Framer Motion)](https://motion.dev/) - Animation library docs

### Community Sources (MEDIUM confidence)
- [Tailwind v4 + next-themes](https://medium.com/@kevstrosky/theme-colors-with-tailwind-css-v4-0-and-next-themes-dark-light-custom-mode-36dca1e20419)
- [Shadcn Bottom Nav Request](https://github.com/shadcn-ui/ui/issues/8847) - Confirms no official component
- [Chrome Edge-to-Edge](https://developer.chrome.com/docs/css-ui/edge-to-edge) - Safe area insets on Android

## Summary

**No new packages needed.** Your stack is complete for this milestone:

1. **Theme switching:** Wire up existing `next-themes` with `ThemeProvider`
2. **Bottom tab bar:** Build custom component with Radix + Framer Motion + Tailwind
3. **Header consolidation:** Replace `UserButton` with custom dropdown using `useClerk()`
4. **Mobile responsiveness:** Apply mobile-first Tailwind classes, add safe area insets

The implementation is pure configuration and component authoring, not dependency management.
