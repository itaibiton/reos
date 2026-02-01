---
phase: 61
plan: 02
subsystem: ai-assistant
tags: [react, context, responsive-design, i18n, shadcn-ui]
requires: [61-01]
provides:
  - AI assistant panel shell UI (Sheet on desktop, Drawer on mobile)
  - AIAssistantProvider global state management
  - AIToggleButton (header) and AIToggleFAB (mobile)
  - Keyboard shortcut (Cmd/Ctrl+J) to toggle panel
  - i18n strings for panel UI (en, he)
affects: [61-03]
tech-stack:
  added: []
  patterns:
    - Split context pattern for state/dispatch separation
    - Responsive UI patterns (Sheet vs Drawer)
    - sessionStorage for panel state persistence
key-files:
  created:
    - src/providers/AIAssistantProvider.tsx
    - src/components/ai/AIToggleButton.tsx
    - src/components/ai/AIAssistantPanel.tsx
  modified:
    - src/components/layout/AppShell.tsx
    - src/components/layout/MobileBottomNav.tsx
    - messages/en.json
    - messages/he.json
decisions:
  - decision: Use split context pattern (separate state/dispatch contexts)
    rationale: Prevents unnecessary re-renders when only actions are needed
    scope: ai-assistant
  - decision: Use sessionStorage (not localStorage) for panel state
    rationale: Panel state should reset per-session, not persist across browser sessions
    scope: ai-assistant
  - decision: Use VisuallyHidden for Sheet/Drawer headers
    rationale: Accessibility requirement while keeping UI clean
    scope: ai-assistant
  - decision: Hide MobileBottomNav when AI panel is open
    rationale: Full-screen drawer needs entire viewport on mobile
    scope: mobile-ui
metrics:
  duration: "3min"
  completed: "2026-02-01"
---

# Phase 61 Plan 02: Frontend Panel Shell + AIAssistantProvider + i18n Summary

**One-liner:** Responsive AI assistant panel shell with Sheet (desktop) and Drawer (mobile), global state management via split context, and full i18n support.

## What Was Built

### Task 1: AIAssistantProvider + AIToggleButton
Created the global state management provider and toggle UI components:

**AIAssistantProvider (`src/providers/AIAssistantProvider.tsx`):**
- Split context pattern with separate state and dispatch contexts
- Manages panel open/closed state
- Keyboard shortcut handler (Cmd/Ctrl+J)
- sessionStorage persistence for panel state
- Context methods: `open()`, `close()`, `toggle()`
- Hook: `useAIAssistant()` for consuming state and actions

**AIToggleButton (`src/components/ai/AIToggleButton.tsx`):**
- Desktop variant: Ghost icon button in header (9x9px)
- Shows active state (bg-accent) when panel is open
- Uses AiChat02Icon from Hugeicons
- ARIA label from i18n

**AIToggleFAB:**
- Mobile-only floating action button
- Positioned bottom-24 end-4 (above MobileBottomNav)
- Only renders when panel is closed and viewport is mobile
- 14x14 size, primary color, rounded-full
- Active press animation (scale-95)

**Commit:** `3a24d5a`

### Task 2: AIAssistantPanel + AppShell Integration + i18n
Created the responsive panel shell and integrated it into the app layout:

**AIAssistantPanel (`src/components/ai/AIAssistantPanel.tsx`):**
- Responsive component that renders Sheet (desktop) or Drawer (mobile)
- Desktop Sheet: 440px width, right-side overlay, hidden close button
- Mobile Drawer: Full-screen (100dvh), rounded-none for edge-to-edge
- Uses VisuallyHidden for accessibility headers (Sheet/DrawerTitle, Description)
- Renders existing AIChatPanel component inside
- Controlled by AIAssistantProvider state

**AppShell Integration (`src/components/layout/AppShell.tsx`):**
- Wrapped entire app in AIAssistantProvider (outside SidebarProvider)
- Added AIToggleButton to header's right section (authenticated users only)
- Added gap-2 to header's right div for spacing
- Placed AIAssistantPanel and AIToggleFAB after MobileBottomNav
- Both panel components wrapped in `<Authenticated>`

**MobileBottomNav Update (`src/components/layout/MobileBottomNav.tsx`):**
- Added `useAIAssistant()` hook
- Returns null when `isAIPanelOpen === true`
- Allows full-screen drawer to use entire viewport

**i18n Strings (messages/en.json, messages/he.json):**
Added comprehensive `aiAssistant` namespace with:
- Panel title and description
- Toggle labels and tooltips (with separate Mac version)
- FAB label
- Welcome messages
- Input placeholders
- Header labels (title, clear, close)
- Clear dialog (title, description, cancel, confirm)
- Error messages (sendFailed, connectionLost, generic)
- Loading and streaming states

**Commit:** `d42124a`

## Technical Implementation

### Split Context Pattern
The AIAssistantProvider uses two separate contexts:
- `AIAssistantStateContext`: Contains only `{ isOpen: boolean }`
- `AIAssistantDispatchContext`: Contains only action functions

This prevents components that only need actions (like toggle button) from re-rendering when state changes.

### Responsive Strategy
- Desktop: Sheet overlay (doesn't affect page layout)
- Mobile: Full-screen Drawer (MobileBottomNav hides)
- FAB only shows on mobile when panel is closed
- Panel state persists across page navigation (sessionStorage)

### Accessibility
- VisuallyHidden headers satisfy Radix UI requirements
- ARIA labels on all interactive elements
- Keyboard shortcut (Cmd/Ctrl+J) for power users
- Proper semantic HTML (button, nav)

## Testing Performed

1. TypeScript compilation: No errors in AI Assistant files
2. Icon availability: Verified AiChat02Icon exists in @hugeicons/core-free-icons
3. Dependency check: Confirmed @radix-ui/react-visually-hidden is installed
4. Git commits: Both tasks committed atomically with proper messages

## Deviations from Plan

None - plan executed exactly as written.

## Known Issues

- Pre-existing TypeScript error in `convex/ai/messages.ts:62` (unrelated to this plan)
- This error exists from before this phase and is not caused by these changes

## Next Phase Readiness

**Ready for Plan 61-03:** Backend streaming infrastructure
- Panel shell is complete and functional
- State management is in place
- i18n is ready for all UI strings
- Next: Wire up real AI streaming via Convex actions

**Blockers:** None

**Recommendations:**
1. Test keyboard shortcut on both Mac and Windows
2. Verify RTL layout for Hebrew (Sheet uses `end-0` for RTL support)
3. Test mobile drawer drag-to-close behavior
4. Verify panel state persistence across page navigations
