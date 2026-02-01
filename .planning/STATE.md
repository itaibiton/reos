# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-01)

**Core value:** Deal flow tracking from interest to close.
**Current focus:** v1.10 Super AI Assistant -- Phase 61: Panel Shell + Streaming Infrastructure

## Current Position

Milestone: v1.10 Super AI Assistant
Phase: 61 of 66 (Panel Shell + Streaming Infrastructure)
Plan: 2 of 3 in current phase
Status: In progress
Last activity: 2026-02-01 -- Completed 61-02-PLAN.md (Frontend Panel Shell + AIAssistantProvider + i18n)

Progress: [██░░░░░░░░] 20%

## Performance Metrics

**Velocity:**
- Total plans completed: 177
- Average duration: 4.3 min
- Total execution time: ~12.6 hours

## Accumulated Context

### Decisions

v1.10 architecture decisions (from research):
- Single `platformAssistant` agent with role-injected system prompts (not separate agents per role)
- Overlay Sheet pattern on desktop (not content-pushing) to avoid breaking AppShell layout
- FAB trigger on mobile above tab bar, full-screen Drawer that hides MobileBottomNav
- Context is lazy-loaded on panel open only (not on every page navigation)
- Stay on `ai@5.0.123` -- AI SDK 6 breaks `@convex-dev/agent@0.3.2` (GitHub issue #202)
- Streaming via `useUIMessages` + `syncStreams` replacing action-based polling
- Server-side auth on every tool handler via `ctx.auth` (never trust LLM for authorization)

61-02 implementation decisions:
- Split context pattern for AIAssistantProvider (state/dispatch separation prevents unnecessary re-renders)
- sessionStorage for panel state (not localStorage - state should reset per browser session)
- VisuallyHidden for Sheet/Drawer headers (accessibility requirement with clean UI)
- MobileBottomNav hides when AI panel open (full-screen drawer needs entire viewport)

### Pending Todos

- Replace placeholder partner logos with real partner/media logos (deferred)

### Blockers/Concerns

None.

### Roadmap Evolution

- Milestones v1.0 through v1.9 shipped (Phases 1-60)
- v1.10 Super AI Assistant: Phases 61-66 (6 phases, 23 requirements)

## Session Continuity

Last session: 2026-02-01 11:42 UTC
Stopped at: Completed 61-02-PLAN.md (Frontend Panel Shell + AIAssistantProvider + i18n)
Resume file: None
Next: Execute 61-03-PLAN.md (Wire streaming to panel)
