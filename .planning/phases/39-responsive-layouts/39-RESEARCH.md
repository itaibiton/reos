# Phase 39: Responsive Layouts - Research

**Researched:** 2026-01-21
**Domain:** Mobile responsive design, touch interactions, conditional rendering
**Confidence:** HIGH

## Summary

This research covers all six RSP requirements for making existing pages render optimally on mobile. The codebase already has strong foundations: `useIsMobile()` hook at 768px breakpoint, existing Sheet component for bottom drawers (used in InvestorSearchBar), and framer-motion for animations. The main work involves:

1. Converting property card grids from `md:grid-cols-2` to mobile-first full-width
2. Adding mobile-specific width classes to form inputs
3. Creating a responsive Dialog/Drawer wrapper using existing components
4. Auditing and increasing touch target sizes on interactive elements
5. Implementing pull-to-refresh on the feed page
6. Ensuring all changes preserve desktop behavior

**Primary recommendation:** Use conditional rendering pattern with existing `useIsMobile()` hook and Drawer component for modal-to-sheet conversion. For pull-to-refresh, use `react-simple-pull-to-refresh` (zero dependencies) or implement with framer-motion which is already installed.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `framer-motion` | ^12.26.2 | Animation/gestures | Already installed, used for tab animations |
| `vaul` | ^1.1.2 | Bottom drawer/sheet | Already installed via Drawer component |
| `@radix-ui/react-dialog` | ^1.1.15 | Dialog primitive | Already used throughout codebase |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `react-simple-pull-to-refresh` | latest | Pull-to-refresh | If framer-motion approach is too complex |
| `use-pull-to-refresh` | latest | Pull-to-refresh hook | Alternative with Next.js SSR support |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-simple-pull-to-refresh | framer-motion useGesture | Framer already installed, but PTR libraries have better defaults |
| Custom responsive dialog | credenza library | Adds dependency vs. using existing components |

**Installation (if needed):**
```bash
npm install react-simple-pull-to-refresh
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── ui/
│   │   ├── responsive-dialog.tsx  # NEW: Dialog/Drawer responsive wrapper
│   │   └── ...existing components...
│   └── feed/
│       └── PullToRefresh.tsx      # NEW: Pull-to-refresh wrapper
├── hooks/
│   └── use-mobile.ts              # EXISTS: useIsMobile() at 768px
└── ...
```

### Pattern 1: Responsive Dialog/Drawer
**What:** Conditionally render Dialog on desktop, Drawer on mobile
**When to use:** All modal dialogs that should become bottom sheets on mobile (RSP-03)

**Example:**
```typescript
// src/components/ui/responsive-dialog.tsx
"use client";

import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";

interface ResponsiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function ResponsiveDialog({ open, onOpenChange, children }: ResponsiveDialogProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>{children}</DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>{children}</DialogContent>
    </Dialog>
  );
}

// Compound components for header/footer that adapt
export const ResponsiveDialogHeader = ({ children, ...props }: React.ComponentProps<"div">) => {
  const isMobile = useIsMobile();
  return isMobile ? (
    <DrawerHeader {...props}>{children}</DrawerHeader>
  ) : (
    <DialogHeader {...props}>{children}</DialogHeader>
  );
};

// Similar for Title, Description, Footer...
```

### Pattern 2: Mobile-First Grid with Breakpoints
**What:** Single-column on mobile, multi-column on larger screens
**When to use:** Property cards, client cards, provider cards (RSP-01)

**Current patterns in codebase:**
```typescript
// Current (needs updating for RSP-01)
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">  // md:grid-cols-2 isn't full-width

// Recommended mobile-first pattern
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
// Already correct in: /properties/listings/page.tsx

// For properties page with map (RSP-01 specific)
// Mobile: stacked cards full-width, no map
// Desktop: split view with map
```

### Pattern 3: Full-Width Form Inputs on Mobile
**What:** Inputs expand to full container width on mobile
**When to use:** All form inputs (RSP-02)

**Example:**
```typescript
// Current Input default (already correct - has w-full)
<Input className="w-full" />  // Already in input.tsx

// Form grid patterns that need fixing:
// Current:
<div className="grid grid-cols-2 gap-4">
  <Input />
  <Input />
</div>

// Fixed for RSP-02:
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <Input />
  <Input />
</div>
```

### Pattern 4: Touch Target Minimum Size
**What:** All interactive elements are at least 44x44px on mobile
**When to use:** Buttons, links, icons, checkboxes (RSP-04)

**Example:**
```typescript
// Button sizes (current values from button.tsx)
size: {
  default: "h-9 px-4 py-2",     // 36px - TOO SMALL
  sm: "h-8 rounded-md",         // 32px - TOO SMALL
  lg: "h-10 rounded-md px-6",   // 40px - CLOSE
  icon: "size-9",               // 36px - TOO SMALL
}

// Fix: Add mobile-specific touch targets
// Option A: Mobile-specific utility class
<Button className="min-h-[44px] min-w-[44px]" />

// Option B: Create touch-target variant in button.tsx (better)
"touch-target": "min-h-[44px] min-w-[44px]",
```

### Anti-Patterns to Avoid
- **Don't use fixed pixel widths on mobile:** Use percentage/full-width
- **Don't rely solely on md: breakpoint:** Properties page needs specific mobile handling for map
- **Don't forget safe-area-bottom:** Already handled by MobileBottomNav, but ensure new components respect it
- **Don't hide essential functionality:** Touch targets must be accessible, not just hover

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Mobile detection | Custom window.innerWidth check | `useIsMobile()` hook | Already exists, handles SSR, uses matchMedia |
| Bottom sheet | CSS-only drawer | vaul `Drawer` component | Already installed, handles gestures/accessibility |
| Pull-to-refresh | Custom touch events | react-simple-pull-to-refresh or framer-motion | Edge cases (overscroll, resistance, loading states) |
| Touch target sizing | Per-component min-height | Utility class pattern | Consistent, easy to audit |

**Key insight:** The codebase already has all the primitives needed. The work is primarily:
1. Creating a ResponsiveDialog wrapper using existing Dialog/Drawer
2. Applying responsive classes systematically
3. Auditing touch targets with a standard pattern

## Common Pitfalls

### Pitfall 1: Hydration Mismatch with useIsMobile
**What goes wrong:** Server renders one layout, client hydrates with different
**Why it happens:** `useIsMobile()` returns `undefined` on first render (SSR)
**How to avoid:** Use mounted state pattern or render same initial state
**Warning signs:** Flash of different content on page load

```typescript
// Current hook returns !!isMobile which is false when undefined
// Safe approach for conditional rendering:
const isMobile = useIsMobile();

// If false initially, render desktop and let client update
// Don't show loading spinner for layout changes
```

### Pitfall 2: Property Page Split Layout on Mobile
**What goes wrong:** Map still takes half the page on mobile
**Why it happens:** Current code uses `hidden lg:block` for map, but cards need full width
**How to avoid:** On mobile, hide map completely and make cards full-width
**Warning signs:** Cards squeezed into left half, empty space on right

```typescript
// Current pattern in properties/page.tsx:
<div className="h-full flex">
  <div className="flex-1 p-6 overflow-auto">  // Cards
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  </div>
  <div className="w-1/2 hidden lg:block flex-shrink-0">  // Map
```

### Pitfall 3: Dialog Content Overflow on Mobile Drawer
**What goes wrong:** Long dialog content doesn't scroll properly as drawer
**Why it happens:** Dialog and Drawer have different scroll behaviors
**How to avoid:** Test drawer with long content, add ScrollArea if needed
**Warning signs:** Content cut off at bottom, can't reach submit button

### Pitfall 4: Touch Targets in Grid Layouts
**What goes wrong:** Icons and small buttons remain 24-32px
**Why it happens:** Size only applied to icon, not touch area
**How to avoid:** Make the button/link the touch target, not just the icon
**Warning signs:** Users miss taps, need multiple attempts

```typescript
// Bad - icon is 16px, button is small
<button className="p-1"><Icon size={16} /></button>

// Good - button is the touch target
<button className="min-h-[44px] min-w-[44px] flex items-center justify-center">
  <Icon size={16} />
</button>
```

## Code Examples

### Example 1: ResponsiveDialog Component
```typescript
// src/components/ui/responsive-dialog.tsx
"use client";

import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

interface ResponsiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function ResponsiveDialog({ open, onOpenChange, children }: ResponsiveDialogProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85vh]">
          {children}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {children}
      </DialogContent>
    </Dialog>
  );
}

// Compound components
export function ResponsiveDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const isMobile = useIsMobile();
  const Component = isMobile ? DrawerHeader : DialogHeader;
  return <Component className={className} {...props} />;
}

export function ResponsiveDialogTitle({
  className,
  ...props
}: React.ComponentProps<"h2">) {
  const isMobile = useIsMobile();
  const Component = isMobile ? DrawerTitle : DialogTitle;
  return <Component className={className} {...props} />;
}

export function ResponsiveDialogDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  const isMobile = useIsMobile();
  const Component = isMobile ? DrawerDescription : DialogDescription;
  return <Component className={className} {...props} />;
}

export function ResponsiveDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const isMobile = useIsMobile();
  const Component = isMobile ? DrawerFooter : DialogFooter;
  return <Component className={className} {...props} />;
}
```

### Example 2: Pull-to-Refresh with react-simple-pull-to-refresh
```typescript
// src/components/feed/PullToRefresh.tsx
"use client";

import PullToRefresh from "react-simple-pull-to-refresh";
import { useIsMobile } from "@/hooks/use-mobile";

interface PullToRefreshWrapperProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export function PullToRefreshWrapper({
  onRefresh,
  children
}: PullToRefreshWrapperProps) {
  const isMobile = useIsMobile();

  // Only enable on mobile
  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <PullToRefresh
      onRefresh={onRefresh}
      resistance={2.5}
      maxPullDownDistance={95}
      pullDownThreshold={67}
      refreshingContent={
        <div className="flex justify-center py-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      {children}
    </PullToRefresh>
  );
}
```

### Example 3: Touch-Target Utility Pattern
```typescript
// Add to src/lib/utils.ts or as Tailwind utility
// Minimum 44x44px touch target

// Pattern for icon buttons:
<Button
  variant="ghost"
  size="icon"
  className="min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0"
>
  <Icon size={16} />
</Button>

// Or create a mobile-specific size in button.tsx:
"icon-touch": "size-9 min-h-[44px] min-w-[44px] md:min-h-9 md:min-w-9",
```

## Codebase Audit Results

### RSP-01: Property Cards - Files to Update
| File | Current Grid | Change Needed |
|------|-------------|---------------|
| `src/app/[locale]/(app)/properties/page.tsx` | `grid-cols-1 md:grid-cols-2` + split w/ map | Mobile: full-width cards, hide map |
| `src/app/[locale]/(app)/properties/listings/page.tsx` | `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` | Already correct |
| `src/components/dashboard/RecommendedProperties.tsx` | Check | Verify mobile behavior |
| `src/components/properties/NearbyProperties.tsx` | `grid-cols-2 lg:grid-cols-4` | Change to `grid-cols-1 sm:grid-cols-2` |

### RSP-02: Form Inputs - Patterns to Fix
| File | Pattern | Change Needed |
|------|---------|---------------|
| `src/components/properties/PropertyForm.tsx` | `grid-cols-2 gap-4` (multiple) | Add `grid-cols-1 sm:grid-cols-2` |
| `src/components/profile/InvestorProfileForm.tsx` | `grid-cols-2 gap-4` | Add `grid-cols-1 sm:grid-cols-2` |
| `src/components/layout/InvestorSearchBar.tsx` | `grid-cols-2 gap-2` | Already handles mobile via Sheet |

### RSP-03: Dialogs to Convert
| File | Component | Priority |
|------|-----------|----------|
| `src/components/feed/CreatePostDialog.tsx` | CreatePostDialog | HIGH |
| `src/components/deals/RequestProviderDialog.tsx` | RequestProviderDialog | HIGH |
| `src/components/chat/NewConversationDialog.tsx` | NewConversationDialog | HIGH |
| `src/components/feed/FollowListDialog.tsx` | FollowListDialog | MEDIUM |
| `src/components/chat/AddMembersDialog.tsx` | AddMembersDialog | MEDIUM |
| `src/components/chat/ParticipantSelectorDialog.tsx` | ParticipantSelectorDialog | MEDIUM |
| `src/components/feed/RepostDialog.tsx` | RepostDialog | MEDIUM |

**Already using Sheet on mobile:**
- `InvestorSearchBar.tsx` - Uses Sheet for mobile filters

### RSP-04: Touch Target Audit
| Component | Current Size | Issue |
|-----------|-------------|-------|
| Button (default) | h-9 (36px) | Below 44px |
| Button (sm) | h-8 (32px) | Below 44px |
| Button (icon) | size-9 (36px) | Below 44px |
| Avatar buttons | h-8 w-8 (32px) | Below 44px |
| Tab triggers | Varies | Check padding |
| Checkbox labels | Text only | Need larger tap area |

### RSP-05: Feed Page Pull-to-Refresh
**Target file:** `src/app/[locale]/(app)/feed/page.tsx`
**Integration point:** Wrap the posts list container with PullToRefreshWrapper
**Refresh action:** Invalidate paginated query or trigger refetch

### RSP-06: Desktop Regression Prevention
**Key files to test after changes:**
- Properties page (map + cards split view)
- All dialog-using pages
- Forms (PropertyForm, InvestorProfileForm)
- Feed page with sidebar

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Separate mobile/desktop components | Conditional rendering with hooks | React 18+ | Less code duplication |
| CSS-only drawers | vaul library | 2023 | Better accessibility, gestures |
| Custom pull-to-refresh | react-simple-pull-to-refresh | 2024 | Cross-platform, zero deps |
| px-based touch targets | Tailwind min-h/min-w utilities | Always | Flexible with breakpoints |

**Deprecated/outdated:**
- `react-pull-to-refresh` (original): Last updated 3 years ago, use `react-simple-pull-to-refresh` instead
- Fixed viewport units (vh): Use dvh for mobile browsers

## Open Questions

1. **Pull-to-refresh library choice**
   - What we know: framer-motion is installed, react-simple-pull-to-refresh is zero deps
   - What's unclear: Performance comparison, bundle size impact
   - Recommendation: Start with react-simple-pull-to-refresh for simplicity

2. **AlertDialog conversion**
   - What we know: AlertDialogs used for destructive confirmations
   - What's unclear: Should these also become bottom sheets?
   - Recommendation: Keep AlertDialogs as centered modals (they're intentionally interruptive)

3. **Property cards inside dialogs**
   - What we know: PropertySelector in CreatePostDialog shows property cards
   - What's unclear: Should these be full-width in drawer mode?
   - Recommendation: Yes, maintain consistency

## Sources

### Primary (HIGH confidence)
- Codebase analysis: All files referenced directly from `/Users/Kohelet/Code/REOS/src`
- Existing patterns: `use-mobile.ts`, `sheet.tsx`, `drawer.tsx`, `dialog.tsx`

### Secondary (MEDIUM confidence)
- [shadcn/ui Drawer docs](https://ui.shadcn.com/docs/components/drawer) - Official pattern
- [Credenza responsive dialog](https://github.com/redpangilinan/credenza) - Community pattern
- [react-simple-pull-to-refresh npm](https://www.npmjs.com/package/react-simple-pull-to-refresh)

### Tertiary (LOW confidence)
- [use-pull-to-refresh](https://github.com/Senbonzakura1234/use-pull-to-refresh) - Alternative option
- Web search results for current year best practices

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in codebase
- Architecture: HIGH - Patterns verified against existing code
- Pitfalls: HIGH - Based on actual codebase audit
- Touch targets: HIGH - Measured from actual component code

**Research date:** 2026-01-21
**Valid until:** 30 days (stable domain)
