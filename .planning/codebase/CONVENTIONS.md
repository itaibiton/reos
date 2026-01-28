# Coding Conventions

**Analysis Date:** 2026-01-28

## Naming Patterns

**Files:**
- Component files: PascalCase (e.g., `AIChatPanel.tsx`, `ChatMessage.tsx`, `Hero.tsx`, `Navigation.tsx`)
- Non-component files: camelCase (e.g., `useAIChat.ts`, `utils.ts`, `constants.ts`)
- Barrel export files: lowercase `index.ts`
- Hook files: camelCase starting with `use` (e.g., `useSmartScroll.ts`, `useCurrentUser.ts`)
- Config/constant files: kebab-case or camelCase (e.g., `deal-constants.ts`, `constants.ts`)

**Functions:**
- Component functions: PascalCase (e.g., `export function AIChatPanel()`, `export function Navigation()`, `export function Hero()`)
- Hook functions: camelCase with `use` prefix (e.g., `export function useAIChat()`, `export function useInView()`)
- Utility functions: camelCase (e.g., `getInitials()`, `getSpecializationsForType()`)
- Event handlers: camelCase with `handle` prefix (e.g., `handleLocaleChange()`, `handleSend()`, `handleScroll()`, `toggleSidebar()`)
- Callback handlers: camelCase with `handle` or `on` prefix (e.g., `onSend`, `onStop`, `handleClearMemory()`)
- Internal animation helpers: camelCase (e.g., `updateValue()`, `checkInitial()`)

**Variables:**
- Constants (exported): UPPER_SNAKE_CASE for literal constants (e.g., `USD_TO_ILS_RATE`, `PROPERTY_TYPES`, `ISRAELI_LOCATIONS`)
- Local variables: camelCase (e.g., `messages`, `isStreaming`, `visiblePanes`, `scrollYProgress`, `displayValue`)
- Boolean variables: camelCase, often prefixed with `is`, `has`, `should`, or `can` (e.g., `isEmpty`, `isStreaming`, `isLoading`, `isNearBottom`, `scrolled`, `isMounted`)
- Instance state variables: camelCase (e.g., `messages`, `error`, `threadId`, `activeMenuItem`, `sidebarExpanded`)
- Animation refs: camelCase with `Ref` suffix (e.g., `hasAnimatedRef`, `prevTextRef`, `statsRef`, `heroRef`)

**Types/Interfaces:**
- Interface names: PascalCase, often suffixed with `Props` for component props (e.g., `AIChatPanelProps`, `ChatMessageProps`, `NavigationProps`, `HeroProps`)
- Type names: PascalCase (e.g., `UserRole`, `LayoutMode`, `Message`)
- Union types: PascalCase (e.g., `"user" | "assistant"`)
- Literal string unions: lowercase with underscore separator (e.g., `"short_term"`, `"long_term"`, `"real_estate_transactions"`)
- Framer Motion types: Use imported `Variants` type from framer-motion (e.g., `const fadeInUp: Variants = { ... }`)

## Code Style

**Formatting:**
- Line length: No strict limit enforced, but prefer readability
- Indentation: 2 spaces (standard Next.js/TypeScript default)
- Quotes: Double quotes for JSX/HTML attributes and strings (e.g., `"use client"`, `className="..."`)
- Semicolons: Included on all statements
- Trailing commas: Used in multi-line objects and arrays

**Linting:**
- Tool: ESLint 9 with Next.js core web vitals and TypeScript configurations
- Config: `eslint.config.mjs` (modern flat config)
- Extends: `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Ignored: `.next/**`, `out/**`, `build/**`, `next-env.d.ts`
- Run command: `npm run lint`

**Key Rules:**
- Use strict TypeScript (`strict: true` in tsconfig)
- No unused variables or imports
- Accessibility: aria labels, roles, semantic HTML, minimum touch target sizes (44px min-h/min-w for buttons)
- React best practices: memoization with `memo()` for expensive renders
- Client components: Use `"use client"` directive at top of file when needed

## Import Organization

**Order:**
1. React/Next.js imports (e.g., `import { useState } from "react"`)
2. Animation/Motion imports (e.g., `import { motion, type Variants } from "framer-motion"`)
3. Internationalization imports (e.g., `import { useTranslations } from "next-intl"`)
4. External library imports (e.g., `import { useQuery } from "convex/react"`, `import Image from "next/image"`)
5. Icons/UI imports (e.g., `import { Menu, Building2, Users } from "lucide-react"`)
6. Internal absolute imports using `@/` alias (e.g., `import { Button } from "@/components/ui/button"`)
7. Local relative imports (e.g., `import { ChatMessage } from "./ChatMessage"`)
8. Type imports (increasingly using TS type imports pattern)

**Path Aliases:**
- `@/*` maps to `./src/*` (configured in `tsconfig.json`)
- Always use `@/` for imports within `src/` directory
- Examples:
  - `@/components/ui/button`
  - `@/lib/utils`
  - `@/hooks/useCurrentUser`
  - `@/i18n/navigation`
  - `@/components/newlanding/Navigation`
  - Import generated files directly: `import { api } from "../../../../convex/_generated/api"`

**Examples from codebase:**
```typescript
// src/components/newlanding/Hero.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, type Variants, useScroll, useTransform, useMotionValue, animate, useMotionValueEvent } from "framer-motion";
import { useTranslations } from "next-intl";
import RotatingText from "@/components/ui/rotating-text";
import { ArrowRight, PlayCircle, Menu, PieChart, Building2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
```

## Animation Patterns

**Framer Motion Usage:**
- Import `type Variants` from framer-motion for type safety
- Define animation variants as constants before component definition
- Use `motion.div`, `motion.section`, `motion.header` for animated elements
- Common animation variants:
  - `fadeInUp`: Combines opacity and y-translation for entrance effects
  - `stagger`: Child animations with staggered timing
  - Individual item variants for staggered animations

**Variant Definition Pattern:**
```typescript
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};
```

**Scroll-Triggered Animations:**
- Use `useScroll()` for scroll position tracking
- Use `useTransform()` to map scroll progress to animation values
- Apply styles with `motion.div` using `style` prop:
```typescript
const { scrollYProgress } = useScroll({
  target: heroRef,
  offset: ["start start", "end end"],
});

const statsOpacity = useTransform(scrollYProgress, [0.1, 0.3], [0, 1]);

<motion.div style={{ opacity: statsOpacity }}>Content</motion.div>
```

**Hover and View-Port Animations:**
```typescript
<motion.div
  whileHover={{
    scale: 1.02,
    y: -4,
    transition: { duration: 0.2, ease: "easeOut" }
  }}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true }}
  variants={fadeInUp}
>
  Content
</motion.div>
```

**Initial and Transition Props:**
- Set `initial={false}` when state drives animation (avoids animation on mount)
- Use `animate` prop to drive motion based on state
- Custom ease functions: `ease: [0.25, 1, 0.5, 1]` for smooth motion
- Apply transitions to all state-driven animations for consistency

## Component Composition Approach

**Functional Components with Hooks:**
- All components are functional components using hooks
- Component structure: props interface → state hooks → effects → JSX return
- Split complex components into smaller, focused sub-components
- Example structure in `src/components/newlanding/Hero.tsx`:
  - Main export function `Hero()`
  - Internal sub-components (`CountUp`, `DecryptedText`) defined above main export
  - Props defined via TypeScript interfaces

**Sub-Component Pattern:**
```typescript
interface HeroProps {
  className?: string;
}

// Sub-component before main component
function CountUp({
  value,
  duration = 2,
  isVisible = true
}: {
  value: string;
  duration?: number;
  isVisible?: boolean;
}) {
  // Implementation
  return <span>{displayValue}</span>;
}

// Main component
export function Hero({ className }: HeroProps) {
  // Implementation
  return <motion.header>...</motion.header>;
}
```

**Props Pattern:**
- Always define props via TypeScript interface
- Destructure props in function signature
- Add optional `className` prop for composition
- Use `cn()` utility to merge classes when props include className

**Client Components:**
- Use `"use client"` directive for interactive landing components
- Necessary for hooks, event handlers, and state management
- All new landing components are client components

## Styling Patterns

**Tailwind CSS:**
- Use atomic utility classes for styling
- Combine colors with opacity: `bg-white/10`, `text-white/80`, `border-white/20`
- Use CSS variables for dark theme support: `dark:from-[#1a1a1a]`, `dark:shadow-[...]`
- Responsive design with breakpoints: `md:`, `sm:`, `lg:` prefixes
- Gradient backgrounds: `bg-gradient-to-b`, `bg-gradient-to-r`, `from-blue-500/10 to-blue-500/40`

**Dark Theme Integration:**
- Next-themes provides dark mode (see `next-themes` in dependencies)
- Use `dark:` prefix for dark mode specific styles
- Example from Hero mockup:
```typescript
className="rounded-[20px] p-3 bg-gradient-to-b from-[#e8e8e8] via-[#d4d4d4] to-[#e8e8e8] dark:from-[#1a1a1a] dark:via-[#0f0f0f] dark:to-[#1a1a1a]"
```

**Color System:**
- Use semantic colors: `foreground`, `background`, `muted-foreground`, `border`, `card`
- Semantic color variants: `text-foreground`, `bg-background`, `text-muted-foreground`
- Color with opacity: Use `/` syntax for opacity variants
- Status colors: `blue-500` (info), `green-400` (success), `red-400` (error), `yellow-400` (warning)

**Layout & Spacing:**
- Use Tailwind utilities for layouts: `flex`, `grid`, `absolute`, `sticky`, `fixed`
- Positioning: `top-0`, `left-0`, `right-0`, `bottom-0`, `inset-0` for full coverage
- Z-index management: Use semantic values `z-10`, `z-20`, `z-50` for stacking
- Always use `max-w-7xl mx-auto` for content containers to match standard max-width

**Border & Shadow Patterns:**
```typescript
// Subtle borders
className="border border-border/50 rounded-lg"

// Inset shadows for depth
className="shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]"

// Glow effects
className="shadow-lg shadow-blue-900/20"

// Backdrop blur
className="backdrop-blur-sm"
```

**Hover & Transition States:**
- Use `transition-colors`, `transition-all`, `transition-opacity`
- Duration: `duration-200`, `duration-300`, `duration-500`
- Easing: `ease-out` for entrance animations
- Hover classes: `hover:bg-white/5`, `hover:text-white`, `hover:shadow-lg`
- Group hover: Use `group` and `group-hover:` for parent-child hover effects

## Translation Usage (next-intl)

**Pattern:**
- Import `useTranslations` hook from `next-intl`
- Call hook once per component: `const t = useTranslations("namespace")`
- Use namespace pattern: `landing.navigation`, `landing.hero`, `landing.testimonials`, `landing.stats`
- Access translations: `t("key")` or `t("nested.key")`

**Examples:**
```typescript
// From Navigation.tsx
const t = useTranslations("landing.navigation");

// Usage
<span>{t("logo")}</span>
<span>{t("menu.platform")}</span>
<span>{t("platform.propertyManagement.title")}</span>
<span>{t("actions.getStarted")}</span>

// From Hero.tsx
const t = useTranslations("landing.hero");
t("badge")
t("heading")
t("roles.investors")
t("dashboard.menu.overview")
```

**Namespace Structure:**
- Top-level: Feature/section name (e.g., `landing`, `dashboard`, `auth`)
- Second level: Component or area (e.g., `navigation`, `hero`, `menu`)
- Third+ levels: Specific content (e.g., `platform.propertyManagement.title`)

**Integration with Dynamic Content:**
- Wrap dynamic role/menu items with translations for i18n support
- Example from Hero component:
```typescript
texts={[
  t("roles.investors"),
  t("roles.mortgageAdvisors"),
  t("roles.brokers"),
  // ...
]}
```

## State Management in Client Components

**Pattern:**
- Use React hooks (`useState`, `useRef`, `useEffect`) for local component state
- Combine with Framer Motion hooks for scroll/animation state (`useScroll`, `useTransform`, `useInView`, `useMotionValueEvent`)
- Lift state up when needed for parent-child communication

**State Initialization:**
```typescript
const [scrolled, setScrolled] = useState(false);
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
const [isMounted, setIsMounted] = useState(false);
const [sidebarExpanded, setSidebarExpanded] = useState(true);
const [activeMenuItem, setActiveMenuItem] = useState<"Overview" | "Properties">("Overview");
```

**Effect Patterns:**

1. **Scroll Event Handling (Optimized):**
   - Use `requestAnimationFrame` for smooth scroll tracking
   - Debounce with `ticking` flag to prevent excessive state updates
   - Always clean up event listeners in return function
```typescript
useEffect(() => {
  let ticking = false;
  let lastScrollY = window.scrollY;

  const handleScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const scrollingDown = currentScrollY > lastScrollY;

        if (scrollingDown && currentScrollY > 100) {
          setScrolled(true);
        } else if (!scrollingDown && currentScrollY < 80) {
          setScrolled(false);
        }

        lastScrollY = currentScrollY;
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => window.removeEventListener("scroll", handleScroll);
}, []);
```

2. **DOM Manipulation (CSS Injection):**
   - Create and inject styles dynamically when needed
   - Always clean up injected styles in return function
```typescript
useEffect(() => {
  const style = document.createElement('style');
  style.innerHTML = `
    [data-slot="navigation-menu-content"] a:hover {
      background-color: transparent !important;
      color: white !important;
    }
  `;
  document.head.appendChild(style);
  return () => {
    document.head.removeChild(style);
  };
}, []);
```

3. **Hydration Safety:**
   - Use mount flag to prevent SSR/client mismatch:
```typescript
const [isMounted, setIsMounted] = useState(false);

useEffect(() => {
  setIsMounted(true);
}, []);

// Render only when mounted
{isMounted && (
  <nav>...</nav>
)}
```

4. **Animation Value Tracking:**
   - Use `useMotionValueEvent` to respond to motion value changes
   - Check animation thresholds to trigger state updates:
```typescript
useMotionValueEvent(statsOpacity, "change", (latest) => {
  if (latest > 0.3 && !initialStatsVisible) {
    setInitialStatsVisible(true);
  }
});
```

5. **Periodic Checks:**
   - Use intervals for continuous checks, clean up properly:
```typescript
useEffect(() => {
  const checkInitial = () => {
    const statsOp = statsOpacity.get();
    if (statsOp > 0.3 && !initialStatsVisible) {
      setInitialStatsVisible(true);
    }
  };
  checkInitial();
  const interval = setInterval(checkInitial, 100);
  return () => clearInterval(interval);
}, [statsOpacity, initialStatsVisible]);
```

**Ref Usage:**
- Use `useRef` for tracking whether animation has played: `const hasAnimatedRef = useRef(false);`
- Use `useRef` for DOM references: `const heroRef = useRef<HTMLElement>(null);`
- Pass refs to motion.div via `ref` prop for scroll/InView tracking

**Framer Motion State Integration:**
- Store computed animation progress in state when needed for conditional rendering
- Example: Track when stats become visible to trigger sub-animations
- Use `useInView` hook to detect when sections enter viewport

## Error Handling

**Patterns:**
- Try/catch blocks for async operations: Always wrap with try/catch
- Error state in hooks: Store errors in state (`const [error, setError] = useState<string | null>(null)`)
- Error display in components: Show error messages in UI (e.g., `{error && <div className="...">` in AIChatPanel)
- Optimistic updates: Add optimistic state before async calls, rollback on error (see useAIChat.ts line 60-81)
- Error messages: User-friendly messages, e.g., `"Failed to send message"`
- Logging: Use `console.error()` for debugging, e.g., in useAIChat.ts: `console.error("Failed to fetch messages:", err)`

**Error Handling Examples:**
```typescript
// From useAIChat.ts - optimistic update with rollback
try {
  await sendMessageAction({ message: text });
  await fetchMessages();
} catch (err) {
  if (err instanceof Error && err.message.includes("abort")) {
    await fetchMessages(); // Still refetch on abort
  } else {
    setError(err instanceof Error ? err.message : "Failed to send message");
    setMessages(prev => prev.filter(m => m._id !== optimisticUserMessage._id)); // Rollback
  }
} finally {
  setIsStreaming(false);
}
```

## Logging

**Framework:** `console` (no logging library configured)

**Patterns:**
- Use `console.error()` for errors during async operations
- Use `console.log()` cautiously in development
- Errors logged with context: `console.error("Failed to fetch messages:", err)`
- Not heavily used in production code; focus on state-based error display

**Examples:**
```typescript
// From useAIChat.ts
console.error("Failed to fetch messages:", err);
console.error("Failed to stop generation:", err);

// From AIChatPanel.tsx - errors displayed in UI, not logged
{error && (
  <div className="px-4 py-2 bg-destructive/10 text-destructive text-sm flex-shrink-0">
    {error}
  </div>
)}
```

## Comments

**When to Comment:**
- Comments explain business logic or non-obvious decisions
- Comments describe what/why, not what the code literally does
- Inline comments for complex calculations or conditionals
- Section comments to separate logical blocks within components

**Comment Style:**
- Single-line comments: `// Comment text`
- Multi-line comments: `/* ... */` for JSDoc, but not consistently used
- Comments are sparse in the codebase; code is generally self-documenting

**JSDoc/TSDoc:**
- Used selectively for functions (see `useAIChat.ts` line 14-21)
- Hook documentation example:
```typescript
/**
 * Hook for managing AI chat state and actions.
 * Provides: messages, sendMessage, isStreaming, stopGeneration, clearMemory
 *
 * Note: Messages are fetched via action (not query) because the agent component
 * stores messages in internal tables. We refetch after sending messages since
 * actions don't support real-time subscriptions.
 */
export function useAIChat() { ... }
```
- Parameter/return types documented via TypeScript interfaces, not @param/@returns tags

**Comment Examples from Code:**
```typescript
// From ChatLayoutContainer.tsx
// Determine visible panes based on mode
const visiblePanes = mode === "single" ? 1 : mode === "split" ? 2 : 4;

// From Navigation.tsx
// Add custom styles to override NavigationMenu default hover colors
// Mobile Navigation - Static, no animation - Client-side only to prevent hydration mismatch

// From Hero.tsx
// Stats fade in earlier (when scroll progress reaches 0.1, very early)
// Switch stats and mockup content at middle of scroll (0.4-0.6)
// Scroll progress indicator (0 to 100%)
```

## Function Design

**Size:**
- Prefer small, focused functions (most are 10-50 lines)
- Components average 30-60 lines of JSX (landing components are larger: 100-300 lines for complex dashboards)
- Hooks are 50-120 lines depending on complexity
- Sub-components for animation logic (e.g., `CountUp`, `DecryptedText`) are 30-60 lines

**Parameters:**
- Use props objects for component parameters (e.g., `ChatMessageListProps` interface)
- Destructure props in function signature
- Add default values (e.g., `isStreaming = false`, `disabled = false`)
- For callbacks: define types in props interface

**Return Values:**
- Components: Return JSX wrapped in elements
- Hooks: Return object with multiple values (e.g., `{ messages, isStreaming, error, sendMessage, ... }`)
- Utility functions: Return specific values or objects

**Examples:**
```typescript
// Component with props interface
interface HeroProps {
  className?: string;
}

export function Hero({ className }: HeroProps) {
  // ... implementation
}

// Sub-component for animation
function CountUp({
  value,
  duration = 2,
  isVisible = true
}: {
  value: string;
  duration?: number;
  isVisible?: boolean;
}) {
  // ... implementation
  return <span>{displayValue}</span>;
}

// Hook returning object with multiple values
export function useAIChat() {
  // ... implementation
  return {
    messages,
    isStreaming,
    isLoading,
    error,
    threadId: thread?._id,
    sendMessage,
    stopGeneration,
    clearMemory,
  };
}
```

## Module Design

**Exports:**
- Named exports preferred: `export function ComponentName() { ... }`
- Export interfaces for component props: `export interface ComponentProps { ... }`
- Barrel exports use `export * from "./module"`
- Functions and components exported at module level, not as default exports

**Examples:**
```typescript
// src/components/ai/index.ts (barrel export)
export { AIChatPanel } from "./AIChatPanel";
export { ChatMessage } from "./ChatMessage";
export { useAIChat } from "./hooks/useAIChat";

// src/components/newlanding/index.ts
export { Navigation } from "./Navigation";
export { Hero } from "./Hero";
export { Testimonials } from "./Testimonials";
export { Stats } from "./Stats";
```

**Barrel Files:**
- Used for organizing component directories (e.g., `src/components/ai/index.ts`)
- Allows cleaner imports: `import { AIChatPanel, useAIChat } from "@/components/ai"`
- Also used for larger sections: `src/components/landing/index.ts`
- Pattern: Each subdirectory can have `index.ts` that re-exports its contents

**File Organization:**
- Components and hooks in same directory with `index.ts` barrel export
- Hooks placed in `hooks/` subdirectory when multiple hooks exist
- Utilities in `lib/` directory
- UI components in `components/ui/` directory (Radix UI + customizations)
- Landing page components in `components/newlanding/` directory

---

*Convention analysis: 2026-01-28*
