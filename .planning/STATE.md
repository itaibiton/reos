# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-01)

**Core value:** Deal flow tracking from interest to close.
**Current focus:** v1.10 Super AI Assistant -- Phase 62: Context Awareness + Help Guidance

## Current Position

Milestone: v1.10 Super AI Assistant
Phase: 62 of 66 (Context Awareness + Help Guidance)
Plan: 1 of 2 in current phase
Status: In progress
Last activity: 2026-02-01 -- Completed 62-01-PLAN.md

Progress: [██░░░░░░░░] 17%

## Performance Metrics

**Velocity:**
- Total plans completed: 181
- Average duration: 4.3 min
- Total execution time: ~12.9 hours

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

61-01 implementation decisions:
- 24-hour session timeout for AI threads (balance between context continuity and memory freshness)
- Role injection via system prompts (not separate agents - single platformAssistant serves all roles)
- Preserve previousSummary on session expiry (maintain long-term context across daily sessions)
- Real-time streaming via query (enables reactive UI updates without polling)

61-02 implementation decisions:
- Split context pattern for AIAssistantProvider (state/dispatch separation prevents unnecessary re-renders)
- sessionStorage for panel state (not localStorage - state should reset per browser session)
- VisuallyHidden for Sheet/Drawer headers (accessibility requirement with clean UI)
- MobileBottomNav hides when AI panel open (full-screen drawer needs entire viewport)

61-03 implementation decisions:
- Type assertions for useUIMessages compatibility (TypeScript inference limitations with v.any())
- Preserve existing ChatMessage/ChatMessageList for backward compatibility (investor summary page)
- Add StreamingChatMessage and StreamingChatMessageList as new exports
- UIMessage.parts processing extracts text and tool invocations separately

62-01 implementation decisions:
- All entity resolvers private, only buildPageContext exported as internalQuery
- Convex ID validation via underscore check before db.get
- Provider lookup uses dual strategy: userId index first, direct get fallback
- Array.from(new Set(...)) for TypeScript target compatibility

### Pending Todos

- Replace placeholder partner logos with real partner/media logos (deferred)

### Blockers/Concerns

None.

### Roadmap Evolution

- Milestones v1.0 through v1.9 shipped (Phases 1-60)
- v1.10 Super AI Assistant: Phases 61-66 (6 phases, 23 requirements)

## Session Continuity

Last session: 2026-02-01
Stopped at: Completed 62-01-PLAN.md
Resume file: None
Next: Execute 62-02-PLAN.md (Frontend context hooks)
