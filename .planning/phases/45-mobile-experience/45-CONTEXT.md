# Phase 45: Mobile Experience - Context

**Gathered:** 2026-01-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Touch-optimized AI experience with tabbed navigation for mobile devices. Users switch between Profile and AI Assistant views via bottom tabs. All interactive elements meet 44px touch target requirements. Chat input stays visible above keyboard.

</domain>

<decisions>
## Implementation Decisions

### Tab design & switching
- Bottom tab bar positioned at screen bottom (thumb-friendly, native pattern)
- Icon + label for each tab (Profile, AI Assistant)
- Slide/swipe animation when switching between tabs (content slides left/right)
- Tap-only navigation (no swipe gestures to avoid conflict with chat scrolling)

### Chat input behavior
- Input sticky above keyboard when keyboard opens (native chat feel)
- Auto-grow textarea up to 3 lines (matches desktop 4-line cap, slightly smaller for mobile)
- Send button appears only when there's text to send
- Tap outside input area dismisses keyboard (lets user read messages)

### Touch targets & spacing
- All interactive elements minimum 44px touch target
- 8px minimum gap between tappable elements
- Quick reply buttons in horizontal scrollable row (saves vertical space)
- Property/provider cards fully tappable (entire card opens detail modal)
- Large floating stop button during AI streaming (easy to tap, obvious)

### Profile view adaptation
- Collapsible accordion sections (saves space, user controls visibility)
- Completeness bar sticky at top while scrolling
- Inline editing opens full-screen modal (more space than popover)
- All sections collapsed by default on mobile (compact initial view)

### Claude's Discretion
- Exact animation timing and easing curves
- Tab bar height and icon sizes within 44px constraint
- Keyboard handling implementation details (visualViewport API vs CSS)
- Horizontal scroll snap behavior for quick replies

</decisions>

<specifics>
## Specific Ideas

- Bottom tabs like iOS/Android native apps (not web-style top tabs)
- Stop button should be prominent and obvious, not subtle
- Full-screen modal for editing should feel like a native form, not a cramped overlay

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 45-mobile-experience*
*Context gathered: 2026-01-23*
