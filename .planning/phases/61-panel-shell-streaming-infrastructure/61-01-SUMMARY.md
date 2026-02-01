---
phase: 61
plan: 01
subsystem: ai-backend
tags: [convex, ai-sdk, streaming, agent, session-management]
requires: [40-01, 42-01, 43-01]
provides: [platform-assistant, streaming-query, session-threads]
affects: [61-02, 61-03]
tech-stack:
  added: []
  patterns: [session-based-threads, role-injection, real-time-streaming]
key-files:
  created: [convex/ai/streaming.ts]
  modified: [convex/schema.ts, convex/ai/agent.ts, convex/ai/threads.ts, convex/ai/chat.ts, convex/ai/messages.ts]
decisions:
  - session-timeout-24h
  - platform-assistant-rename
  - role-specific-prompts
metrics:
  files_changed: 7
  lines_of_code: 176
  duration: 5min
  completed: 2026-02-01
---

# Phase 61 Plan 01: Backend Streaming Infrastructure + Session-based Threads Summary

**One-liner:** Renamed agent to platformAssistant, added session-based thread management with 24h timeout, and created real-time streaming query infrastructure.

## What Was Done

### Task 1: Schema Extension + Agent Rename + Streaming Query

**Files:** convex/schema.ts, convex/ai/agent.ts, convex/ai/streaming.ts

1. **Extended aiThreads schema:**
   - Added `sessionId: v.optional(v.string())` for 24-hour session grouping
   - Added `lastRole: v.optional(v.string())` to track role context
   - Added `by_user_and_session` index for efficient session queries

2. **Renamed agent from investorAssistant to platformAssistant:**
   - Changed name from "Investor Assistant" to "REOS Assistant"
   - Generalized instructions to support all platform roles (investors, vendors, etc.)
   - Removed investor-specific language and team-building prompts
   - Kept tool configuration unchanged (searchProperties, searchProviders)
   - Updated type export to `PlatformAssistant`

3. **Created streaming.ts with real-time query:**
   - Implemented `listMessages` query wrapping `listUIMessages` and `syncStreams` from @convex-dev/agent
   - Provides reactive subscriptions for live message updates
   - Handles authentication and returns empty state for unauthenticated users
   - Designed for frontend useQuery hook integration

**Commit:** c0f6605 - 63 lines changed (3 files)

### Task 2: Session-based Threads + Chat Action Role Support

**Files:** convex/ai/threads.ts, convex/ai/chat.ts, convex/ai/messages.ts

1. **Implemented session-based thread management in threads.ts:**
   - Added `SESSION_TIMEOUT_MS = 24 * 60 * 60 * 1000` constant
   - Updated `getOrCreateThread`:
     - Queries ALL threads for user (not `.unique()`)
     - Reuses thread if most recent is <24h old
     - Creates new thread with `sessionId` if >24h or no threads exist
     - Preserves `previousSummary` from stale thread for context continuity
   - Updated `getThreadForUser`: Returns most recent thread by `lastActivityAt`
   - Updated `clearMemory`: Deletes ALL threads for user (not just one)
   - Added `updateThreadRole` internal mutation to track role usage per thread

2. **Added role support to chat.ts:**
   - Added `role: v.optional(v.string())` to sendMessage args
   - Built role-specific system prompts:
     - Investor role: Focus on property discovery, investment analysis, provider recommendations
     - Other roles: Generic assistance message
   - Integrated `previousSummary` handling for new sessions
   - Called `updateThreadRole` mutation at end of each message
   - Replaced ALL `investorAssistant` references with `platformAssistant`

3. **Updated messages.ts:**
   - Changed import from `investorAssistant` to `platformAssistant`
   - Updated comment references
   - Updated `listMessages` action to use platformAssistant

**Commit:** 41bd278 - 113 lines changed (4 files)

## Deviations from Plan

None - plan executed exactly as written.

## Technical Details

### Session Management Logic

```typescript
// Reuse thread if <24h old
if (mostRecent && (now - mostRecent.lastActivityAt) < SESSION_TIMEOUT_MS) {
  await ctx.db.patch(mostRecent._id, { lastActivityAt: now, updatedAt: now });
  return { threadId: mostRecent._id, agentThreadId: mostRecent.agentThreadId, isNew: false };
}

// Create new thread if stale, preserve summary
const sessionId = crypto.randomUUID();
const threadId = await ctx.db.insert("aiThreads", {
  userId: user._id,
  sessionId,
  summary: previousSummary, // Carry forward from stale thread
  lastActivityAt: now,
  createdAt: now,
  updatedAt: now,
});
```

### Role-Specific Prompts

```typescript
const userRole = role ?? "investor";
if (userRole === "investor") {
  rolePrompt = "## Your Role\n\nYou are assisting an investor looking to invest in Israeli real estate.\nFocus on: property discovery, investment analysis, provider recommendations, and deal guidance.\n\n";
} else {
  rolePrompt = `## Your Role\n\nYou are assisting a ${userRole} on the REOS platform.\nHelp them with their specific needs and tasks.\n\n`;
}
```

### Streaming Query Integration

Uses @convex-dev/agent exports:
- `listUIMessages`: Fetches paginated messages
- `syncStreams`: Provides real-time delta streaming data

Frontend will use `useQuery(api.ai.streaming.listMessages, { threadId, paginationOpts })` for reactive updates.

## Files Changed

### Created (1 file):
- `convex/ai/streaming.ts` - Real-time streaming query wrapper

### Modified (6 files):
- `convex/schema.ts` - Added sessionId, lastRole fields and by_user_and_session index
- `convex/ai/agent.ts` - Renamed to platformAssistant, generalized instructions
- `convex/ai/threads.ts` - Session management logic, updateThreadRole mutation
- `convex/ai/chat.ts` - Role parameter, role-specific prompts, platformAssistant usage
- `convex/ai/messages.ts` - platformAssistant import
- `convex/_generated/api.d.ts` - Generated API types (auto-updated)

## Verification Results

✅ TypeScript compilation: `npx tsc --noEmit` - passed
✅ Convex schema push: `npx convex dev --once` - successful (11.31s)
✅ All imports verified: No references to `investorAssistant` remain
✅ Streaming query exports: Confirmed `listUIMessages` and `syncStreams` exist in @convex-dev/agent

## Next Phase Readiness

**Ready for Phase 61-02:** Frontend AI panel implementation can now:
- Use streaming query for real-time message updates via `useQuery`
- Call `sendMessage` action with optional `role` parameter
- Expect session-based thread continuity (24h timeout)
- Rely on platformAssistant serving all user roles

**Dependencies satisfied:**
- Real-time streaming query infrastructure: ✅
- Session-based thread management: ✅
- Role-agnostic agent (role injected at runtime): ✅

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| 24-hour session timeout | Balance between context continuity and memory freshness | New threads created daily, previous summary preserved |
| Role injection vs separate agents | Single agent reduces complexity, role context added via system prompt | One agent serves all roles, lower maintenance |
| Preserve summary on session expiry | Maintain long-term context across sessions | Users don't lose historical context when starting new day |
| Real-time streaming via query | Enables reactive UI updates without polling | Frontend gets live updates as messages stream |

## Performance Notes

- Execution time: 5 minutes (schema + 2 tasks)
- Schema push: 11.31s
- All existing functionality preserved (backward compatible)
- No breaking changes to existing AI thread API

## Integration Points

**For 61-02 (Frontend Panel):**
- Use `api.ai.streaming.listMessages` query for reactive message list
- Pass `role` param to `api.ai.chat.sendMessage` based on user type
- Expect `threadId` from `getOrCreateThread` to remain stable for 24h

**For 61-03 (Auto-greeting):**
- Role-specific prompts already in place
- Can detect user role from profile and inject appropriate context
- Auto-greeting logic can leverage role parameter

## Known Limitations

None identified.

## Testing Recommendations for Next Plan

1. Verify streaming query updates UI reactively when new messages arrive
2. Test session timeout: Confirm new thread created after 24h inactivity
3. Verify previousSummary appears in context for new sessions
4. Test role parameter: Investor vs vendor prompts render correctly
5. Verify clearMemory deletes all threads (multi-session cleanup)
