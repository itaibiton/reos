# Phase 45: Mobile Experience - Research

**Researched:** 2026-01-23
**Domain:** Mobile UI/UX, Touch Interactions, Keyboard Handling
**Confidence:** HIGH

## Summary

This phase transforms the Investor Summary Page into a mobile-optimized experience with tabbed navigation, touch-friendly interactions, and keyboard-aware chat input. The codebase already has the necessary foundation: Framer Motion for animations, Vaul (Drawer) for mobile modals, Radix Tabs for tab structure, and a mobile detection hook (`useIsMobile`).

The primary challenge is creating a seamless tab-switching experience between Profile and AI Assistant views on mobile, while ensuring the chat input stays visible when the keyboard opens. The existing components (ProfileSummaryPanel, AIChatPanel, QuickReplyButtons) are well-structured and only require wrapper/layout changes for mobile adaptation.

**Primary recommendation:** Build a new `MobileInvestorSummary` component that renders full-screen tabs with AnimatePresence slide animations, conditionally shown on mobile via `useIsMobile`. Keep existing desktop layout unchanged.

## Standard Stack

The project already has all required libraries installed. No new dependencies needed.

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| framer-motion | ^12.26.2 | Tab switching animations | Already used for MobileBottomNav animations |
| vaul | ^1.1.2 | Mobile drawers for edit modals | Already integrated via shadcn Drawer component |
| @radix-ui/react-tabs | ^1.1.13 | Accessible tab structure | Standard Radix component in shadcn setup |

### Supporting (Already Installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| tailwind-merge | ^3.4.0 | Class merging | Conditional mobile styles |
| clsx | ^2.1.1 | Conditional classes | Mobile-specific class toggling |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS `dvh` units | VisualViewport API | dvh is simpler but less precise for keyboard height |
| Framer AnimatePresence | CSS transitions | Framer provides better exit animations and direction awareness |
| Vaul Drawer | Full-screen Dialog | Drawer has native swipe-to-dismiss gesture support |

**Installation:**
No new packages required. All libraries already in package.json.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── profile/
│   │   ├── ProfileSummaryPanel.tsx      # Existing - no changes needed
│   │   ├── QuickReplyButtons.tsx        # Minor mobile style updates
│   │   ├── InlineFieldEditor.tsx        # Add mobile drawer variant
│   │   └── MobileFieldEditor.tsx        # NEW: Full-screen drawer for editing
│   └── ai/
│       ├── AIChatPanel.tsx              # Existing - no changes needed
│       └── AIChatInput.tsx              # Add keyboard-aware positioning
├── app/[locale]/(app)/profile/investor/summary/
│   └── page.tsx                         # Update with mobile detection
└── hooks/
    └── use-keyboard-visible.ts          # NEW: Keyboard detection hook
```

### Pattern 1: Conditional Mobile Layout with useIsMobile
**What:** Render completely different layouts for mobile vs desktop
**When to use:** When mobile layout is fundamentally different (tabs vs side-by-side)
**Example:**
```typescript
// Source: Existing pattern in AppShell.tsx line 378
export default function InvestorSummaryPage() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileInvestorSummary />;
  }

  return <DesktopInvestorSummary />;
}
```

### Pattern 2: AnimatePresence for Tab Content Transitions
**What:** Slide content horizontally when switching tabs
**When to use:** Tab content transitions with direction awareness
**Example:**
```typescript
// Source: Framer Motion docs, verified against existing MobileBottomNav
import { AnimatePresence, motion } from "framer-motion";

function TabContent({ activeTab, direction }: { activeTab: string; direction: 1 | -1 }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={activeTab}
        initial={{ x: direction * 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: direction * -100, opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      >
        {activeTab === "profile" ? <ProfileSummaryPanel /> : <AIChatPanel />}
      </motion.div>
    </AnimatePresence>
  );
}
```

### Pattern 3: Responsive Popover/Drawer
**What:** Show Popover on desktop, Drawer on mobile
**When to use:** Form editing, field editing modals
**Example:**
```typescript
// Source: Vaul + Radix pattern, matches existing Drawer component
import { useIsMobile } from "@/hooks/use-mobile";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Drawer, DrawerTrigger, DrawerContent } from "@/components/ui/drawer";

function ResponsiveEditor({ children, trigger }: Props) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent className="max-h-[85vh]">
          {children}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent>{children}</PopoverContent>
    </Popover>
  );
}
```

### Pattern 4: Keyboard-Aware Chat Input
**What:** Keep input visible above mobile keyboard
**When to use:** Chat inputs, form fields at bottom of screen
**Example:**
```typescript
// Source: VisualViewport API (MDN), verified approach
function useKeyboardVisible() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;

    const viewport = window.visualViewport;
    const initialHeight = viewport.height;

    const handleResize = () => {
      const heightDiff = initialHeight - viewport.height;
      // Only consider it keyboard if height reduced by > 100px
      setKeyboardHeight(heightDiff > 100 ? heightDiff : 0);
    };

    viewport.addEventListener("resize", handleResize);
    return () => viewport.removeEventListener("resize", handleResize);
  }, []);

  return keyboardHeight;
}
```

### Anti-Patterns to Avoid
- **Using CSS position:fixed for keyboard handling:** Use VisualViewport API or CSS `dvh` units instead. Fixed positioning breaks with iOS Safari keyboard.
- **Hardcoding bottom nav height:** Use CSS custom properties (`--tab-bar-height: 4rem` already defined in globals.css).
- **Swipe gestures for tab switching:** Conflicts with chat message scrolling - use tap-only navigation as per CONTEXT.md decision.
- **Using `exitBeforeEnter` on AnimatePresence:** Deprecated in Framer Motion 7+, throws error in v10+. Use `mode="wait"` instead.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Mobile drawer | Custom slide-up panel | Vaul (existing Drawer component) | Handles iOS rubber-banding, touch gestures, accessibility |
| Tab accessibility | Custom keyboard nav | Radix Tabs | WAI-ARIA compliant, focus management |
| Touch target sizing | Manual width/height | Tailwind `min-h-11 min-w-11` | 44px = 11 * 4px (Tailwind spacing) |
| Keyboard detection | resize event listener | VisualViewport API | More accurate, handles pinch zoom |
| Safe area insets | Manual padding | CSS `env(safe-area-inset-*)` | Already used in MobileBottomNav |
| Horizontal scroll snap | Custom swipe handler | CSS `scroll-snap-type: x mandatory` | Native touch support, no JS needed |

**Key insight:** The existing codebase has excellent patterns for mobile. MobileBottomNav uses Framer Motion's layoutId, AppShell handles tab bar spacing with CSS custom properties, and Drawer already supports all directions with the Vaul library.

## Common Pitfalls

### Pitfall 1: iOS Safari Keyboard Viewport Issues
**What goes wrong:** Input gets hidden behind keyboard, or page zooms unexpectedly
**Why it happens:** iOS Safari has unique viewport behavior when keyboard opens
**How to avoid:**
- Use `dvh` units for full-height containers (already supported)
- Add `<meta name="viewport" content="..., maximum-scale=1">` to prevent zoom on input focus
- Use VisualViewport API for precise keyboard height detection
**Warning signs:** Chat input disappears when typing on iOS

### Pitfall 2: Tab Animation Direction
**What goes wrong:** Content always slides from the same direction regardless of which tab was clicked
**Why it happens:** Not tracking which direction the user navigated
**How to avoid:** Track previous tab index, calculate direction: `direction = newIndex > prevIndex ? 1 : -1`
**Warning signs:** Animations feel inconsistent or confusing

### Pitfall 3: Touch Target Stacking
**What goes wrong:** Users accidentally tap adjacent quick reply buttons
**Why it happens:** Buttons too close together, no gap between touch targets
**How to avoid:**
- Minimum 8px gap between tappable elements (per CONTEXT.md)
- Use `gap-2` (8px) on button containers
- Test with actual finger taps, not mouse clicks
**Warning signs:** Analytics show high "back" navigation after quick reply selection

### Pitfall 4: Scroll Context Loss
**What goes wrong:** User's scroll position resets when switching tabs
**Why it happens:** Tab content remounts, losing scroll state
**How to avoid:** Keep both tab contents mounted, use `visibility: hidden` or `display: none` for inactive tab
**Warning signs:** User always starts at top of profile when switching back from chat

### Pitfall 5: Double Rendering on Mobile Detection
**What goes wrong:** Flash of desktop layout before mobile renders
**Why it happens:** `useIsMobile` returns `undefined` on first render (SSR)
**How to avoid:** Show loading skeleton until mobile detection resolves, or use CSS media queries for initial layout
**Warning signs:** Layout jumps on page load on mobile devices

## Code Examples

Verified patterns from official sources and existing codebase:

### Bottom Tab Bar (Already Exists - Reference)
```typescript
// Source: /src/components/layout/MobileBottomNav.tsx (existing)
// Key patterns to reuse:
// - Motion layoutId for active indicator
// - safe-area-bottom class for notch devices
// - min-w-[60px] for touch targets
// - Icon size 22px with stroke width variation for active state
```

### Mobile Full-Height Container
```typescript
// Source: globals.css line 58-59, existing pattern
// CSS custom properties already defined:
// --header-height: 4rem;
// --tab-bar-height: 4rem;

// Use in component:
<div className="h-[calc(100dvh-var(--header-height)-var(--tab-bar-height))]">
  {/* Full height minus header and tab bar */}
</div>
```

### Horizontal Scroll Snap for Quick Replies
```typescript
// Source: CSS scroll-snap spec, MDN
<div className="flex overflow-x-auto scroll-snap-x snap-mandatory gap-2 px-3 pb-safe">
  {prompts.map(({ labelKey, prompt }) => (
    <Button
      key={labelKey}
      className="flex-shrink-0 snap-start min-h-11 min-w-[120px]"
      // 44px touch target (min-h-11 = 44px)
    >
      {t(labelKey)}
    </Button>
  ))}
</div>

// CSS (add to globals.css or component):
// .scroll-snap-x { scroll-snap-type: x mandatory; }
// .snap-mandatory already exists in Tailwind
// .snap-start { scroll-snap-align: start; }
```

### Stop Button Floating Style
```typescript
// Source: CONTEXT.md decision - "Large floating stop button during AI streaming"
<Button
  variant="destructive"
  size="lg"
  className={cn(
    "fixed bottom-[calc(var(--tab-bar-height)+5rem)] inset-x-4",
    "h-14 rounded-full shadow-lg",
    "flex items-center justify-center gap-2"
  )}
  onClick={onStop}
>
  <HugeiconsIcon icon={Cancel01Icon} size={24} />
  <span>Stop</span>
</Button>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `100vh` for full height | `100dvh` (dynamic viewport height) | 2022 | Handles mobile browser chrome, keyboard |
| `exitBeforeEnter` prop | `mode="wait"` prop | Framer Motion 7.2 (Aug 2022) | Breaking change in v10 |
| CSS `env(keyboard-inset-*)` | Still experimental | 2023 | Not widely supported, use VisualViewport |
| Touch target 48px | 44px (WCAG 2.1 AAA) | 2018 | Industry standard, Apple/Google guidelines |

**Deprecated/outdated:**
- `exitBeforeEnter` on AnimatePresence: Throws error in Framer Motion 10+, use `mode="wait"`
- `viewport-fit=cover` without safe-area: Must use `env(safe-area-inset-*)` with it
- Window resize event for keyboard: Use VisualViewport API instead

## Open Questions

Things that couldn't be fully resolved:

1. **iOS Safari Keyboard Height Precision**
   - What we know: VisualViewport API gives accurate height difference
   - What's unclear: Exact threshold to distinguish keyboard from other viewport changes (toolbar hide, etc.)
   - Recommendation: Use 100px threshold as starting point, test on real devices

2. **Tab Content Persistence vs Memory**
   - What we know: Keeping both tabs mounted preserves scroll position
   - What's unclear: Memory impact of keeping chat messages rendered when viewing profile
   - Recommendation: Start with both mounted, optimize later if needed

3. **Quick Reply Button Count on Mobile**
   - What we know: Horizontal scroll supports any number
   - What's unclear: Optimal visible count before scrolling (2-3 visible initially?)
   - Recommendation: Let buttons size naturally, ensure scroll indicator is visible

## Sources

### Primary (HIGH confidence)
- MDN VisualViewport API - https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport
- Framer Motion AnimatePresence - Verified mode="wait" replaces exitBeforeEnter
- WCAG 2.1 Success Criterion 2.5.5 - https://www.w3.org/WAI/WCAG21/Understanding/target-size.html
- Project codebase: MobileBottomNav.tsx, AppShell.tsx, globals.css patterns

### Secondary (MEDIUM confidence)
- CSS scroll-snap - MDN documentation, widely supported
- Vaul drawer patterns - Verified against existing Drawer component in codebase

### Tertiary (LOW confidence)
- iOS-specific keyboard behaviors - Based on community reports, needs device testing

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed and in use
- Architecture: HIGH - Follows existing patterns in codebase
- Pitfalls: MEDIUM - Some iOS-specific issues need real device testing
- Animation timing: MEDIUM - 200ms recommended but may need tuning

**Research date:** 2026-01-23
**Valid until:** 2026-02-23 (stable libraries, low churn expected)
