# Coding Conventions

**Analysis Date:** 2026-01-22

## Naming Patterns

**Files:**
- Component files: PascalCase (e.g., `AIChatPanel.tsx`, `ChatMessage.tsx`)
- Non-component files: camelCase (e.g., `useAIChat.ts`, `utils.ts`, `constants.ts`)
- Barrel export files: lowercase `index.ts`
- Hook files: camelCase starting with `use` (e.g., `useSmartScroll.ts`, `useCurrentUser.ts`)
- Config/constant files: kebab-case or camelCase (e.g., `deal-constants.ts`, `constants.ts`)

**Functions:**
- Component functions: PascalCase (e.g., `export function AIChatPanel()`)
- Hook functions: camelCase with `use` prefix (e.g., `export function useAIChat()`)
- Utility functions: camelCase (e.g., `getInitials()`, `getSpecializationsForType()`)
- Event handlers: camelCase with `handle` prefix (e.g., `handleLocaleChange()`, `handleSend()`)
- Callback handlers: camelCase with `handle` or `on` prefix (e.g., `onSend`, `onStop`, `handleClearMemory()`)

**Variables:**
- Constants (exported): UPPER_SNAKE_CASE for literal constants (e.g., `USD_TO_ILS_RATE`, `PROPERTY_TYPES`, `ISRAELI_LOCATIONS`)
- Local variables: camelCase (e.g., `messages`, `isStreaming`, `visiblePanes`)
- Boolean variables: camelCase, often prefixed with `is`, `has`, `should`, or `can` (e.g., `isEmpty`, `isStreaming`, `isLoading`, `isNearBottom`)
- Instance state variables: camelCase (e.g., `messages`, `error`, `threadId`)

**Types/Interfaces:**
- Interface names: PascalCase, often suffixed with `Props` for component props (e.g., `AIChatPanelProps`, `ChatMessageProps`)
- Type names: PascalCase (e.g., `UserRole`, `LayoutMode`, `Message`)
- Union types: PascalCase (e.g., `"user" | "assistant"`)
- Literal string unions: lowercase with underscore separator (e.g., `"short_term"`, `"long_term"`, `"real_estate_transactions"`)

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
- Accessibility: aria labels, roles, semantic HTML
- React best practices: memoization with `memo()` for expensive renders

## Import Organization

**Order:**
1. React/Next.js imports (e.g., `import { useState } from "react"`)
2. External library imports (e.g., `import { useQuery } from "convex/react"`)
3. Internal absolute imports using `@/` alias (e.g., `import { Button } from "@/components/ui/button"`)
4. Local relative imports (e.g., `import { ChatMessage } from "./ChatMessage"`)
5. Type imports (increasingly using TS type imports pattern)

**Path Aliases:**
- `@/*` maps to `./src/*` (configured in `tsconfig.json`)
- Always use `@/` for imports within `src/` directory
- Examples:
  - `@/components/ui/button`
  - `@/lib/utils`
  - `@/hooks/useCurrentUser`
  - `@/i18n/navigation`
  - Import generated files directly: `import { api } from "../../../../convex/_generated/api"`

**Examples from codebase:**
```typescript
// src/components/ai/AIChatPanel.tsx
"use client";

import { useState } from "react";
import { useAIChat } from "./hooks/useAIChat";
import { ChatMessageList } from "./ChatMessageList";
import { AIChatInput } from "./AIChatInput";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  // ...
} from "@/components/ui/alert-dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
```

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

// Grid layout based on mode
const gridClass = { ... }

// From LocaleSwitcher.tsx
// Native language names - hardcoded so users can find their language
// regardless of current UI language
const localeNames: Record<string, string> = { ... }

// From ChatMessageList.tsx
// Get the last message to check if it's still streaming
const lastMessage = messages[messages.length - 1];
```

## Function Design

**Size:**
- Prefer small, focused functions (most are 10-50 lines)
- Components average 30-60 lines of JSX
- Hooks are 50-120 lines depending on complexity

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
interface AIChatPanelProps {
  className?: string;
}

export function AIChatPanel({ className }: AIChatPanelProps) {
  // ... implementation
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
    refetchMessages: fetchMessages,
  };
}

// Event handler callbacks
const handleSend = useCallback(() => {
  const trimmed = value.trim();
  if (trimmed && !disabled && !isStreaming) {
    onSend(trimmed);
    setValue("");
  }
}, [value, disabled, isStreaming, onSend]);
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
export { ChatMessageList } from "./ChatMessageList";
export { AIChatInput } from "./AIChatInput";
export { TypingIndicator } from "./TypingIndicator";
export { StreamingCursor } from "./StreamingCursor";
export { useAIChat } from "./hooks/useAIChat";
export { useSmartScroll } from "./hooks/useSmartScroll";
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

---

*Convention analysis: 2026-01-22*
