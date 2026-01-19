# Phase 30: RTL Component Patches - Research

**Researched:** 2026-01-20
**Domain:** Radix UI RTL Behavior, Shadcn Component Patches, Directional Icon Flipping
**Confidence:** HIGH

## Summary

This phase focuses on ensuring Shadcn/Radix components work correctly in RTL mode. Phase 29 completed the CSS logical properties migration (255+ classes), so the styling foundation is solid. Phase 30 addresses three remaining areas:

1. **Sidebar RTL behavior** - The sidebar component needs to appear on the right side in Hebrew mode
2. **Positioned components** - Sheet, DropdownMenu, Tooltip positioning may need RTL adjustments
3. **Directional icons** - Arrow and chevron icons should flip appropriately in RTL

The DirectionProvider from `@radix-ui/react-direction` is already wrapping the app (Phase 28), which enables Radix primitives to inherit direction context. However, some components may need explicit side prop adjustments or icon flipping with `rtl:-scale-x-100`.

**Primary recommendation:**
1. Make sidebar `side` prop locale-aware (dynamic "left"/"right" based on direction)
2. Update Sheet side prop in mobile sidebar usage
3. Add `rtl:-scale-x-100` to directional icons (back buttons, breadcrumb separators, pagination chevrons, collapsible indicators)

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @radix-ui/react-direction | ^1.1.1 | RTL context for all Radix primitives | Already installed; provides `useDirection()` hook |
| tailwindcss | ^4 | RTL modifiers (`rtl:`, `ltr:`) for icon flipping | Already in project |
| tw-animate-css | - | RTL-aware animation classes | Already imported; provides `slide-in-from-start/end` |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next-intl | v4 | Locale detection for direction | Already configured; use `useLocale()` to determine direction |
| embla-carousel-react | - | Carousel with RTL support | Already used; has `direction: 'rtl'` option |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `rtl:-scale-x-100` | Separate LTR/RTL icons | Duplication; scale is simpler and more maintainable |
| Dynamic side props | Fixed side with CSS flip | CSS flip doesn't work for Sheet slide animations |

**Installation:**
```bash
# No additional packages needed - all required libraries already installed
```

## Architecture Patterns

### Recommended Pattern: Direction-Aware Sidebar

The Sidebar component has a `side` prop that accepts "left" or "right". In RTL mode, the sidebar should appear on the right (which is the logical "start" side).

**Pattern:**
```typescript
// In layout component using useDirection from Radix
import { useDirection } from "@radix-ui/react-direction";

function AppSidebar() {
  const direction = useDirection();
  const sidebarSide = direction === "rtl" ? "right" : "left";

  return <Sidebar side={sidebarSide} collapsible="icon">...</Sidebar>;
}
```

**Alternative Pattern (if useDirection unavailable in server components):**
```typescript
// Pass direction from Providers to layout
// Since DirectionProvider already receives direction prop
function AppSidebar({ direction }: { direction: "ltr" | "rtl" }) {
  const sidebarSide = direction === "rtl" ? "right" : "left";
  return <Sidebar side={sidebarSide} collapsible="icon">...</Sidebar>;
}
```

### Pattern 2: Directional Icon Flipping

Icons that indicate direction should flip in RTL:

```tsx
// Back button icon - points left in LTR, right in RTL
<HugeiconsIcon
  icon={ArrowLeft01Icon}
  className="rtl:-scale-x-100"
/>

// Breadcrumb separator - ChevronRight flips
<ChevronRight className="rtl:-scale-x-100" />

// Collapsible indicator - rotates 90deg when open, flips in RTL
<ChevronRight className="ms-auto rtl:-scale-x-100 transition-transform group-data-[state=open]/collapsible:rotate-90" />

// Pagination arrows - already logical with ChevronLeft/Right but need flipping
<ChevronLeftIcon className="rtl:-scale-x-100" />
<ChevronRightIcon className="rtl:-scale-x-100" />
```

### Pattern 3: Tooltip Side for Sidebar

The SidebarMenuButton tooltip uses `side="right"` hardcoded. In RTL, when sidebar is on right, tooltip should appear on left:

```tsx
// Current (hardcoded)
<TooltipContent side="right" ... />

// Fixed (direction-aware)
const tooltipSide = direction === "rtl" ? "left" : "right";
<TooltipContent side={tooltipSide} ... />
```

### Pattern 4: Animation Classes (tw-animate-css)

The tw-animate-css package provides RTL-aware animation classes using logical directions:

```tsx
// Physical directions (current - need changing)
"slide-in-from-left" / "slide-out-to-left"
"slide-in-from-right" / "slide-out-to-right"

// Logical directions (RTL-aware - use these)
"slide-in-from-start" / "slide-out-to-start"
"slide-in-from-end" / "slide-out-to-end"
```

For Sheet component:
```tsx
// Current implementation already uses logical positioning (end-0, start-0)
// But animations use physical directions
side === "right" &&
  "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right"

// Should use logical
side === "right" &&
  "data-[state=closed]:slide-out-to-end data-[state=open]:slide-in-from-end"
```

### Anti-Patterns to Avoid

- **Hardcoding side="left" or side="right"** without locale awareness
- **Using physical animation directions** when logical alternatives exist
- **Forgetting to flip icons** that indicate navigation direction
- **Wrapping with both rtl: and ltr:** when only rtl: is needed (transforms don't auto-flip)

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Direction detection | Manual locale checking | `useDirection()` from @radix-ui/react-direction | Consistent with DirectionProvider, reactive |
| Icon flipping | Conditional icon components | `rtl:-scale-x-100` Tailwind modifier | Single source of truth, no extra components |
| Animation direction | Manual rtl:/ltr: conditionals | `slide-in-from-start/end` classes | tw-animate-css handles it automatically |
| Sidebar positioning | CSS transforms | Dynamic `side` prop | Sheet animations need side prop, not CSS |

**Key insight:** Radix primitives respect DirectionProvider for positioning, but props like `side` are semantic ("right" means physical right, not logical end). So while positioning CSS can use logical properties, semantic props need runtime locale awareness.

## Common Pitfalls

### Pitfall 1: Sheet Side vs Animation Mismatch

**What goes wrong:** Sheet `side="left"` still slides from physical left in RTL, creating jarring UX
**Why it happens:** The `side` prop controls slide animation direction
**How to avoid:**
- For sidebar mobile, pass dynamic side based on direction
- Update animation classes to use logical `start/end` variants
**Warning signs:** Sheet slides from wrong edge, sidebar appears on wrong side in RTL

### Pitfall 2: Tooltip Appearing Behind Sidebar

**What goes wrong:** Tooltip with `side="right"` appears behind sidebar when sidebar is on right in RTL
**Why it happens:** Physical side doesn't flip with direction
**How to avoid:** Make tooltip side direction-aware:
```tsx
const tooltipSide = direction === "rtl" ? "left" : "right";
```
**Warning signs:** Tooltips hidden or overlapping with sidebar in RTL mode

### Pitfall 3: Double-Flipped Icons

**What goes wrong:** Icon appears in original orientation in RTL
**Why it happens:** Icon component already flips internally, then `rtl:-scale-x-100` flips it back
**How to avoid:** Test each icon type - lucide-react icons don't auto-flip, hugeicons don't auto-flip
**Warning signs:** Back arrow points same direction in both modes

### Pitfall 4: Carousel RTL

**What goes wrong:** Carousel slides in wrong direction
**Why it happens:** Embla needs explicit `direction: 'rtl'` option
**How to avoid:** Pass direction option to useEmblaCarousel:
```tsx
useEmblaCarousel({ direction: direction === "rtl" ? "rtl" : "ltr" })
```
**Warning signs:** Next/prev buttons feel inverted in RTL

### Pitfall 5: Navigation Menu Animation

**What goes wrong:** Navigation menu content slides from wrong side
**Why it happens:** Uses `data-[motion=from-end]:slide-in-from-right-52` (physical)
**How to avoid:** Replace with logical animation classes
**Warning signs:** Menu content animations feel wrong in RTL

## Code Examples

Verified patterns from the codebase and documentation:

### Direction Hook Usage
```typescript
// Source: @radix-ui/react-direction
import { useDirection } from "@radix-ui/react-direction";

function DirectionAwareComponent() {
  const direction = useDirection();
  // direction is "ltr" | "rtl" | undefined
  // undefined means no DirectionProvider, defaults to ltr

  const isRtl = direction === "rtl";
  return <div>{isRtl ? "RTL mode" : "LTR mode"}</div>;
}
```

### Sidebar with Dynamic Side
```typescript
// Source: Pattern for REOS
import { useDirection } from "@radix-ui/react-direction";
import { Sidebar } from "@/components/ui/sidebar";

export function AppSidebar() {
  const direction = useDirection();
  const sidebarSide = direction === "rtl" ? "right" : "left";

  return (
    <Sidebar side={sidebarSide} collapsible="icon">
      {/* sidebar content */}
    </Sidebar>
  );
}
```

### Directional Icon with RTL Flip
```typescript
// Source: Pattern for REOS
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { ChevronRight } from "lucide-react";

// Back button
<Button onClick={goBack}>
  <HugeiconsIcon
    icon={ArrowLeft01Icon}
    className="rtl:-scale-x-100"
  />
  Back
</Button>

// Breadcrumb separator
<BreadcrumbSeparator>
  <ChevronRight className="rtl:-scale-x-100" />
</BreadcrumbSeparator>
```

### Sheet with RTL-Aware Animation
```typescript
// Source: Updated pattern for sheet.tsx
function SheetContent({ side = "right", ...props }) {
  return (
    <SheetPrimitive.Content
      className={cn(
        "fixed z-50 flex flex-col gap-4",
        side === "right" &&
          "data-[state=closed]:slide-out-to-end data-[state=open]:slide-in-from-end inset-y-0 end-0",
        side === "left" &&
          "data-[state=closed]:slide-out-to-start data-[state=open]:slide-in-from-start inset-y-0 start-0",
        // ... other sides
      )}
    />
  );
}
```

### Carousel with RTL Support
```typescript
// Source: Embla carousel documentation
import { useDirection } from "@radix-ui/react-direction";
import useEmblaCarousel from "embla-carousel-react";

function Carousel({ children }) {
  const direction = useDirection();
  const [carouselRef] = useEmblaCarousel({
    direction: direction === "rtl" ? "rtl" : "ltr",
  });

  return <div ref={carouselRef}>{children}</div>;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| rtl:/ltr: prefix everywhere | Logical properties in CSS | Tailwind 3.3+ (2023) | Simpler code, auto-flipping |
| Separate RTL stylesheets | DirectionProvider + logical CSS | Radix 1.0 (2022) | Single codebase |
| Physical animation classes | start/end animation classes | tw-animate-css | RTL-aware animations |

**Deprecated/outdated:**
- `tailwindcss-rtl` plugin: Not needed with Tailwind 4's native logical properties
- Manual CSS direction property: Use DirectionProvider for React component awareness

## Codebase Analysis

### Components Requiring Patches

Based on grep analysis of the codebase:

**1. Sidebar Component** (`src/components/ui/sidebar.tsx`)
- Line 155-165: `side` prop defaults to "left" - needs locale awareness
- Line 539: Tooltip `side="right"` hardcoded - needs locale awareness
- Line 196: Sheet side passed through - needs dynamic value

**2. Directional Icons** (11 files, ~25 usages)
- ArrowLeft01Icon used for back buttons in 8 pages
- ArrowRight01Icon used for "go to" actions in 4 components
- ChevronRight used in sidebar collapsible, breadcrumbs, dropdown-menu
- ChevronLeft/ChevronRight in pagination

**3. Sheet Component** (`src/components/ui/sheet.tsx`)
- Animation classes use physical directions: `slide-out-to-right`, `slide-in-from-right`
- Should migrate to: `slide-out-to-end`, `slide-in-from-end`

**4. Navigation Menu** (`src/components/ui/navigation-menu.tsx`)
- Line 93: Uses physical animation directions `slide-in-from-right-52`, `slide-in-from-left-52`
- Should migrate to logical variants

**5. Carousel** (`src/components/ui/carousel.tsx`)
- No direction option passed to useEmblaCarousel
- Arrow icons (ArrowLeft, ArrowRight) don't flip

**6. Dropdown Menu SubTrigger** (`src/components/ui/dropdown-menu.tsx`)
- Line 220: ChevronRightIcon needs `rtl:-scale-x-100`

**7. Breadcrumb Separator** (`src/components/ui/breadcrumb.tsx`)
- Line 78: ChevronRight needs `rtl:-scale-x-100`

### Components Already RTL-Ready

Based on Phase 29 verification:
- All CSS classes use logical properties (ms-/me-/ps-/pe-/start-/end-)
- DirectionProvider wrapping is in place
- Radix primitives respect direction for positioning

## Open Questions

Things that couldn't be fully resolved:

1. **useDirection() in Server Components**
   - What we know: useDirection is a client hook, can't use in server components
   - What's unclear: Whether Sidebar component is always a client component
   - Recommendation: The Sidebar is already "use client", so useDirection should work

2. **Calendar Component RTL**
   - What we know: react-day-picker has RTL support via dir prop
   - What's unclear: Whether current Calendar implementation handles RTL
   - Recommendation: Test during implementation, may need dir prop pass-through

3. **Context Menu vs Dropdown Menu**
   - What we know: Both have ChevronRightIcon in sub-triggers
   - What's unclear: Whether context-menu needs same patches
   - Recommendation: Apply same icon flipping pattern to both

## Sources

### Primary (HIGH confidence)
- Radix UI DirectionProvider docs: https://www.radix-ui.com/primitives/docs/utilities/direction-provider
- tw-animate-css GitHub: https://github.com/Wombosvideo/tw-animate-css (slide-in-from-start/end classes)
- Embla Carousel Options: https://www.embla-carousel.com/api/options/ (direction option)

### Secondary (MEDIUM confidence)
- shadcn-ui RTL GitHub issue #7280: SidebarInset margin fix
- shadcn-ui RTL GitHub issue #5776: General RTL support discussion
- Tailwind RTL modifier usage: https://tailkits.com/blog/tailwind-rtl-not-working/

### Tertiary (LOW confidence)
- Community patterns for icon flipping (WebSearch results, need validation during implementation)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in project, well-documented
- Architecture patterns: HIGH - Verified against Radix and tw-animate-css docs
- Pitfalls: MEDIUM - Some patterns derived from community issues, not official docs

**Research date:** 2026-01-20
**Valid until:** 60 days (stable libraries, patterns unlikely to change)
