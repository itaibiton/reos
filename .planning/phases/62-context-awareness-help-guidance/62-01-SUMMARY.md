---
phase: 62-context-awareness-help-guidance
plan: 01
subsystem: ai-backend
tags: [context-resolution, entity-resolver, system-prompt, page-awareness]

dependency_graph:
  requires: [61-01]
  provides: [buildPageContext-internalQuery, pageContext-arg-in-sendMessage]
  affects: [62-02, 63-01]

tech_stack:
  added: []
  patterns: [server-side-context-resolution, access-controlled-entity-lookup, graceful-degradation]

key_files:
  created: []
  modified:
    - convex/ai/context.ts
    - convex/ai/chat.ts

decisions:
  - id: entity-resolvers-private
    choice: "All entity resolvers are private functions, only buildPageContext exported"
    reason: "Single entry point with clean API, internal resolvers not callable externally"
  - id: id-validation-underscore
    choice: "Validate Convex IDs by checking for underscore character"
    reason: "Lightweight check preventing obvious invalid IDs from hitting ctx.db.get"
  - id: provider-lookup-dual-strategy
    choice: "Try userId index first, then direct get as fallback for provider resolution"
    reason: "Frontend may pass either userId or profile document ID"

metrics:
  duration: ~3 min
  completed: 2026-02-01
---

# Phase 62 Plan 01: Backend Context Resolution Summary

**One-liner:** Server-side page context resolution with entity resolvers, access control, and help guidance injected into AI system prompts.

## What Was Done

### Task 1: Add buildPageContext internalQuery to convex/ai/context.ts
- Added `buildPageContext` internalQuery accepting `userId`, `pageType`, `entityType`, `entityId`
- Implemented 4 entity resolvers (all private, not exported):
  - `resolvePropertyContext` -- property title, location, price, type, status, metrics
  - `resolveDealContext` -- deal stage, property, provider assignments with access control (participant check)
  - `resolveProviderContext` -- provider name, type, areas, experience, bio (dual lookup: userId index + direct get fallback)
  - `resolveClientContext` -- client name, deal count, stages with access control (assigned provider check)
- Implemented `buildListPageContext` with 14 static page-type context strings
- Implemented `getHelpGuidance` with 8 page-type help guidance strings
- All entity resolvers wrapped in try/catch returning null on any error
- Convex ID validation (underscore check) before any db.get call

### Task 2: Extend sendMessage to accept and use pageContext
- Added optional `pageContext` arg to `sendMessage` action: `{ pageType, entityType?, entityId? }`
- Calls `buildPageContext` after profile context load, wrapped in try/catch for graceful degradation
- Injected page context string into system prompt between profile context and conversation summary
- Added page-aware auto-greeting hint when both page context and auto-greeting are active
- Fully backward compatible -- existing calls without pageContext continue to work unchanged

## Deviations from Plan

None -- plan executed exactly as written.

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Entity resolver visibility | Private functions, only buildPageContext exported | Clean API boundary, single entry point |
| ID validation | Check for underscore character | Lightweight guard against obviously invalid IDs |
| Provider lookup strategy | Try userId index first, direct get fallback | Frontend may pass either userId or profile document ID |
| Set iteration | `Array.from(new Set(...))` instead of spread | TypeScript target compatibility (avoids downlevelIteration requirement) |

## Verification Results

- TypeScript compilation: PASS (no errors in context.ts or chat.ts)
- Backward compatibility: PASS (pageContext is v.optional)
- Graceful degradation: PASS (all resolvers in try/catch, buildPageContext call in try/catch)
- Access control: PASS (deal participant check, client assignment check)
- System prompt order: rolePrompt -> profileContext -> pageContext -> summary -> autoGreeting

## Commits

| Hash | Message |
|------|---------|
| b3a055c | feat(62-01): add buildPageContext internalQuery with entity resolvers and help guidance |
| dbc6a53 | feat(62-01): extend sendMessage to accept pageContext and inject into system prompt |

## Next Phase Readiness

Plan 62-02 (Frontend context hooks) can proceed. It needs to:
- Import and call `sendMessage` with the new `pageContext` arg
- Map route paths to `pageType` values matching the strings in `buildListPageContext` and `getHelpGuidance`
- Extract `entityType` and `entityId` from route params
