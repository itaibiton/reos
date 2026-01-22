# Phase 44: Investor Summary Page - Context

**Gathered:** 2026-01-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Two-panel page with profile summary and AI assistant working together. Desktop shows profile summary (left) and AI assistant (right). Profile displays questionnaire data, supports inline editing, shows completeness indicator, and offers quick reply buttons for common queries. Page serves as both post-onboarding destination AND ongoing profile management.

</domain>

<decisions>
## Implementation Decisions

### Profile Display
- Accordion sections, one per questionnaire step
- First section expanded by default, rest collapsed
- Summary view density: key values only (e.g., "Budget: $500K", "Locations: Tel Aviv, Haifa")
- Incomplete sections marked with badge indicator on section header

### Inline Editing
- Click on any displayed value to edit it
- Popover editor appears next to the value
- Explicit Save and Cancel buttons in popover (no auto-save)
- Profile changes immediately available to AI after save

### Completeness Indicator
- Progress bar at top of profile panel (fixed, always visible)
- Click progress bar to jump to first incomplete section (auto-expands it)
- Celebration moment (confetti or checkmark animation) when reaching 100%

### Quick Reply Buttons
- Appear above chat input as chips/pills
- Mix of fixed prompts ("Show properties", "Build my team") + context-aware ones (e.g., "Complete profile" if incomplete)
- Collapse to expandable icon after conversation starts

### Claude's Discretion
- Exact accordion animation and styling
- Which context-aware prompts to show based on profile state
- Confetti vs checkmark for 100% celebration
- Popover positioning and styling details
- Keyboard shortcuts for popover (Enter/Escape)

</decisions>

<specifics>
## Specific Ideas

- Summary view should feel scannable — investor sees their key choices at a glance
- Quick reply buttons should feel like helpful suggestions, not a cluttered toolbar
- The collapse-to-icon behavior keeps chat clean once conversation is underway

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 44-investor-summary-page*
*Context gathered: 2026-01-22*
