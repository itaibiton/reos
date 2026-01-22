# Testing Patterns

**Analysis Date:** 2026-01-22

## Test Framework

**Status:** Not Currently Implemented

**Note:** The codebase has no configured testing framework or test files in the `src/` directory. No test configuration files are present (`jest.config.js`, `vitest.config.ts`, etc.).

**Package Manager:**
- npm (with `package.json` lock file)

**Development Dependencies:**
- TypeScript 5
- ESLint 9 (for code quality, not testing)
- Next.js 16.1.1
- No test runner currently installed

## Recommended Testing Setup

**For Future Implementation:**
- **Runner:** Vitest (modern, fast, ESM-native, works well with Next.js and TypeScript)
- **Assertion Library:** Vitest built-in assertions or Chai
- **Component Testing:** React Testing Library (for React 19 compatibility)
- **E2E Testing:** Playwright or Cypress (for Next.js apps)

## Current Testing Status

**Unit Tests:** None configured
**Integration Tests:** None configured
**E2E Tests:** None configured

**Why No Tests Now:**
- Early-stage application (v0.1.0)
- Active feature development phase (AI chat components recently added)
- Focus on rapid iteration over test coverage
- Future addition when codebase stabilizes

## Suggested Testing Approach

When testing is implemented, follow these patterns based on the existing codebase:

### Component Testing Pattern

**For React Components (e.g., `AIChatPanel`, `ChatMessage`):**

```typescript
// Tests should verify:
// 1. Props are rendered correctly
// 2. User interactions work (clicks, typing)
// 3. States change appropriately
// 4. Error states display correctly

// Example structure:
describe('AIChatPanel', () => {
  it('should render with default props', () => {
    render(<AIChatPanel />);
    expect(screen.getByText(/AI Assistant/i)).toBeInTheDocument();
  });

  it('should disable clear button when no messages', () => {
    render(<AIChatPanel />);
    expect(screen.getByRole('button', { name: /clear/i })).toBeDisabled();
  });

  it('should display error message when error exists', () => {
    // Mock hook to return error
    render(<AIChatPanel />);
    // Assert error display
  });
});
```

### Hook Testing Pattern

**For Custom Hooks (e.g., `useAIChat`):**

```typescript
// Tests should verify:
// 1. Initial state values
// 2. State updates on actions
// 3. Async behavior (messages fetching, sending)
// 4. Error handling

// Example structure using react-hooks testing library:
describe('useAIChat', () => {
  it('should initialize with empty messages', () => {
    const { result } = renderHook(() => useAIChat());
    expect(result.current.messages).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });

  it('should handle sendMessage optimistically', async () => {
    const { result } = renderHook(() => useAIChat());

    await act(async () => {
      await result.current.sendMessage('Hello');
    });

    // Should have optimistic message immediately
    expect(result.current.messages).toHaveLength(1);
  });

  it('should rollback optimistic message on error', async () => {
    // Mock action to throw error
    const { result } = renderHook(() => useAIChat());

    await act(async () => {
      try {
        await result.current.sendMessage('Hello');
      } catch {}
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.messages).toEqual([]);
  });
});
```

### Utility Function Testing Pattern

**For Pure Functions (e.g., `cn()`, `getSpecializationsForType()`):**

```typescript
// Tests should verify:
// 1. Output matches expected values
// 2. Edge cases handled

// Example from codebase:
describe('cn utility', () => {
  it('should merge Tailwind classes', () => {
    const result = cn('px-2 py-1', 'px-4');
    expect(result).toBe('py-1 px-4'); // px-4 overrides px-2
  });
});

describe('getSpecializationsForType', () => {
  it('should return broker specializations', () => {
    const specs = getSpecializationsForType('broker');
    expect(specs).toEqual(BROKER_SPECIALIZATIONS);
  });

  it('should return empty array for unknown type', () => {
    const specs = getSpecializationsForType('unknown');
    expect(specs).toEqual([]);
  });
});
```

## Test File Organization

**Suggested Location:**
- Co-locate with source files or in parallel directory structure
- Pattern 1: `ComponentName.tsx` + `ComponentName.test.tsx` (same directory)
- Pattern 2: `src/components/` + `src/__tests__/components/` (separate)

**Naming Convention:**
- Test files: `*.test.ts` or `*.test.tsx` for unit tests
- Spec files: `*.spec.ts` or `*.spec.tsx` (alternative)
- Suggested: Use `.test.ts(x)` for consistency

**Directory Structure (when implemented):**
```
src/
├── components/
│   ├── ai/
│   │   ├── AIChatPanel.tsx
│   │   ├── AIChatPanel.test.tsx
│   │   ├── ChatMessage.tsx
│   │   ├── ChatMessage.test.tsx
│   │   ├── hooks/
│   │   │   ├── useAIChat.ts
│   │   │   └── useAIChat.test.ts
│   │   └── index.ts
├── lib/
│   ├── utils.ts
│   └── utils.test.ts
└── hooks/
    ├── useCurrentUser.ts
    └── useCurrentUser.test.ts
```

## Testing Priorities

**High Priority (if implementing tests):**
1. **Hooks:** `useAIChat` - complex state, async logic, error handling
2. **Utilities:** `cn()`, validation functions, data transformations
3. **Components:** Interactive components (AIChatPanel, AIChatInput)

**Medium Priority:**
1. Form components and their validation
2. Utility functions in `lib/`
3. Custom hooks (`useCurrentUser`, `useSmartScroll`)

**Lower Priority:**
1. Presentational/UI-only components (if well-structured)
2. Components that heavily depend on external state (can mock instead)

## Mocking Strategy (When Testing)

**What to Mock:**
- External API calls: Convex actions/mutations/queries (already abstracted in hooks)
- External services: Clerk authentication
- Browser APIs: LocalStorage, sessionStorage
- Date/time functions for consistent test results

**What NOT to Mock:**
- React hooks (useState, useCallback, etc.) - test actual behavior
- Built-in utilities: `cn()`, date-fns functions
- Component rendering - test real DOM
- Business logic utilities (unless deterministic and external)

**Mocking Example Pattern:**
```typescript
// Mock Convex action
vi.mock("convex/react", () => ({
  useAction: vi.fn(),
  useMutation: vi.fn(),
  useQuery: vi.fn(),
}));

// Mock Clerk
vi.mock("@clerk/nextjs", () => ({
  useUser: vi.fn(() => ({
    user: { imageUrl: "...", fullName: "Test User" }
  })),
}));

// Use in tests
describe('ChatMessageList', () => {
  it('should display user name and image', () => {
    render(<ChatMessageList ... />);
    // Assertions
  });
});
```

## Coverage Targets (When Testing)

**Suggested Coverage Goals:**
- **Statements:** 70-80% (not 100% - diminishing returns on utilities)
- **Branches:** 65-75% (focus on error paths)
- **Functions:** 75-85%
- **Lines:** 70-80%

**High-Value Coverage Areas:**
1. Error handling paths (try/catch blocks)
2. Conditional logic (if/else, ternary operators)
3. Hook state changes
4. User interactions and callbacks

## Notes on Codebase Testing Readiness

**Strengths for Testing:**
- Well-structured components with clear prop interfaces
- Hooks abstract data fetching logic (easy to mock)
- Error handling already in place
- TypeScript provides type safety
- Components are relatively small and focused

**Challenges to Address:**
- Heavy reliance on external state (Convex, Clerk)
- Next.js App Router components (require special setup)
- Some deeply nested components may need refactoring
- No test utilities library yet

## Next Steps for Implementation

1. **Install test dependencies:**
   ```bash
   npm install --save-dev vitest @vitest/ui react-test-library @testing-library/jest-dom
   npm install --save-dev @testing-library/react @testing-library/user-event
   ```

2. **Create `vitest.config.ts`:**
   ```typescript
   import { defineConfig } from 'vitest/config'
   import react from '@vitejs/plugin-react'

   export default defineConfig({
     plugins: [react()],
     test: {
       globals: true,
       environment: 'jsdom',
       setupFiles: ['./vitest.setup.ts'],
     },
   })
   ```

3. **Create test setup file (`vitest.setup.ts`):**
   - Import `@testing-library/jest-dom`
   - Setup mocks for Convex, Clerk, etc.

4. **Add test command to `package.json`:**
   ```json
   {
     "scripts": {
       "test": "vitest",
       "test:watch": "vitest --watch",
       "test:coverage": "vitest --coverage"
     }
   }
   ```

5. **Start with integration/hook tests** (easiest to implement)

---

*Testing analysis: 2026-01-22*
