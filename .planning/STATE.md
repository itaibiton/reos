# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-22)

**Core value:** Deal flow tracking from interest to close.
**Current focus:** Phase 46 - AI Auto-Flow (UP NEXT)

## Current Position

Milestone: v1.6 AI-Powered Investor Experience
Phase: 45 of 46 (Mobile Experience → AI Auto-Flow next)
Plan: 3 of 3 in current phase
Status: Phase 45 complete, Phase 46 pending planning
Last activity: 2026-01-23 — Completed Phase 45, created Phase 46 context

Progress: [████████░░] 86% (6/7 phases complete)

## Performance Metrics

**Velocity:**
- Total plans completed: 152
- Average duration: 4.7 min
- Total execution time: 10.01 hours

**By Phase (v1.6 most recent):**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 36 | 1/1 | 3 min | 3 min |
| 37 | 3/3 | 7 min | 2.3 min |
| 38 | 3/3 | 9 min | 3 min |
| 39 | 3/3 | 11 min | 3.7 min |
| 40 | 3/3 | 11 min | 3.7 min |
| 41 | 3/3 | 7 min | 2.3 min |
| 42 | 3/3 | 9 min | 3 min |
| 43 | 3/3 | 11 min | 3.7 min |
| 44 | 3/3 | 21 min | 7 min |
| 45 | 3/3 | 3 min | 1 min |

**Recent Trend:**
- Last 5 plans: 44-01 (2 min), 44-02 (2 min), 44-03 (15 min), 45-02 (2 min), 45-03 (1 min)
- Trend: Fast execution velocity, integration tasks completing in 1-2 minutes

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- v1.6 Research: Use @convex-dev/agent for thread-based memory persistence
- v1.6 Research: Use @ai-sdk/anthropic + ai (Vercel AI SDK) for streaming
- v1.6 Research: Sliding window + summarization for context management
- v1.6 Research: RAG grounding mandatory for property/provider facts
- 40-01: Used @ai-sdk/anthropic@2.x for zod 4 compatibility
- 40-01: Added convex-helpers as peer dependency for agent package
- 40-01: Created aiThreads table as application wrapper (agent manages internal tables)
- 40-02: Profile context rebuilt fresh per call (never stale)
- 40-02: 15-message threshold for summarization, keep 10 recent verbatim
- 40-02: Use Haiku for cost-effective summarization
- 40-03: In-memory Map for abort controller tracking
- 40-03: System context = profile + summary (injected dynamically)
- 40-03: Asynchronous summarization trigger (non-blocking)
- 41-01: Messages fetched via action (not query) - agent stores in internal tables
- 41-01: Refetch-after-send pattern since actions don't support subscriptions
- 41-01: Optimistic UI updates for user messages during send
- 41-01: Intersection Observer for smart auto-scroll
- 41-02: Used Cancel01Icon as stop button (StopIcon not in Hugeicons free set)
- 41-02: Memoized ChatMessage to prevent re-renders during streaming
- 41-02: Auto-growing textarea capped at ~4 lines (120px)
- 41-03: Messages load immediately on open (no deferred loading)
- 41-03: Typing indicator shows before first AI token arrives
- 41-03: Clear memory requires confirmation dialog (destructive action)
- 42-01: Use createTool from @convex-dev/agent (not tool from ai) for Convex context
- 42-01: Cap maxResults at 5 properties to avoid overwhelming chat
- 42-01: Include explicit example match explanations in agent instructions
- 42-01: Return searchCriteria in tool results for UI match badge computation
- 42-03: Extract tool calls from assistant message content array (paired via toolCallId)
- 42-03: PropertyCardRenderer component for separation of concerns
- 42-03: Pass isStreaming as isExecuting for loading indicator during tool execution
- 43-01: Use userId as provider identifier (for team management integration)
- 43-01: Cap maxPerRole at 5 providers to avoid overwhelming chat
- 43-01: Return searchCriteria in tool results for UI match badge computation
- 43-01: Proactive team prompt after EVERY property recommendation (TEAM-06)
- 43-02: Compute isOnTeam from active deals list (not per-provider query)
- 43-02: Skip pattern for modal queries (only load when open)
- 43-02: Map providerType to deal field dynamically
- 43-03: All accordion sections start expanded (defaultValue includes all roles)
- 43-03: Dual tool rendering: ChatMessage renders both PropertyCardRenderer and ProviderCardRenderer
- 44-01: Controlled Popover with explicit save/cancel (no auto-save)
- 44-01: Field-to-section ID mapping for click-to-jump navigation
- 44-01: Generic InlineFieldEditor with renderInput prop for field-type flexibility
- 44-01: Accordion defaults to first incomplete section
- 44-01: Multiselect fields use checkboxes for simplicity
- 44-01: Click progress bar to jump to first incomplete section (auto-expands)
- 44-01: Celebration animation (confetti) when profile reaches 100% complete
- 44-01: Inline editing pattern with Popover (explicit Save/Cancel, no auto-save)
- 44-02: Render prop pattern for renderQuickReplies instead of lifting useAIChat to parent
- 44-02: Collapse after first use to keep chat clean
- 44-02: Context-aware "Complete profile" prompt when profile incomplete
- 44-03: Fixed height layout with calc(100vh-64px) for header offset
- 44-03: Overflow-hidden on right panel for proper scroll containment
- 44-03: Message order reversed to chronological (oldest first) for chat display
- 44-03: Comprehensive i18n with fallback for missing option translations
- 45-01: VisualViewport API with 100px threshold to distinguish keyboard from browser chrome
- 45-01: AnimatePresence mode="wait" for smooth tab transitions (not deprecated exitBeforeEnter)
- 45-01: Direction-aware animations computed from tab order (forward/backward)
- 45-01: Both tabs forceMount to preserve scroll position (display toggle via data-state)
- 45-02: Use h-11/w-11 (44px) for all touch targets following mobile standards
- 45-02: Horizontal scroll with snap for quick reply buttons (not wrap)
- 45-02: gap-2 (8px) spacing prevents accidental adjacent taps
- 45-02: Drawer on mobile uses max-h-[85vh] for proper sizing

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

### Roadmap Evolution

- Milestone v1.6 created: AI-Powered Investor Experience, 6 phases (Phase 40-45)
- Phase structure derived from research and dependency analysis
- Phase 40 complete: AI infrastructure foundation ready
- Phase 41 complete: Conversational AI core ready for integration
- Phase 42 complete: Property recommendations end-to-end (tool, UI, chat integration)
- Phase 43 complete: Dream Team Builder (provider search, UI components, chat integration)
- Phase 44 complete: Investor Summary Page (two-panel layout with profile and AI, verified)
- Phase 45 complete: Mobile Experience (tabbed mobile layout, touch optimization, responsive design)
- Phase 46 created: AI Auto-Flow (AI-initiated conversation, auto property/provider suggestions)

## Session Continuity

Last session: 2026-01-23
Stopped at: Completed Phase 45 verification, created Phase 46 context
Resume file: None
Next: Plan Phase 46 (AI Auto-Flow) with /gsd:plan-phase 46
