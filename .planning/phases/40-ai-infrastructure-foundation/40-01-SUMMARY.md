---
phase: 40-ai-infrastructure-foundation
plan: 01
subsystem: ai
tags: [convex-agent, ai-sdk, anthropic, claude, streaming, memory]

# Dependency graph
requires:
  - phase: none
    provides: Initial AI infrastructure (no prior dependencies)
provides:
  - "@convex-dev/agent component registered and configured"
  - "aiThreads table for user-thread mapping"
  - "investorAssistant agent definition with Claude Sonnet"
  - "Foundation for AI memory and streaming"
affects:
  - 40-02 (streaming action layer)
  - 41 (context injection)
  - 42 (property tools)
  - 43 (provider tools)

# Tech tracking
tech-stack:
  added:
    - "@convex-dev/agent@0.3.2"
    - "ai@5.0.123"
    - "@ai-sdk/anthropic@2.0.57"
    - "convex-helpers@0.1.111"
  patterns:
    - "Agent definition pattern with languageModel and instructions"
    - "Convex component registration via defineApp"
    - "Application-level thread wrapper table"

key-files:
  created:
    - "convex/convex.config.ts"
    - "convex/ai/agent.ts"
  modified:
    - "package.json"
    - "convex/schema.ts"

key-decisions:
  - "Used @ai-sdk/anthropic@2.x for zod 4 compatibility"
  - "Added convex-helpers as peer dependency for agent package"
  - "Created aiThreads table as application wrapper (agent manages internal tables)"

patterns-established:
  - "AI agents defined in convex/ai/ directory"
  - "Agent component registered in convex.config.ts"
  - "languageModel property for Claude model configuration"

# Metrics
duration: 5min
completed: 2026-01-22
---

# Phase 40 Plan 01: AI Infrastructure Foundation Summary

**Convex Agent component with Claude Sonnet, aiThreads schema table, and package infrastructure for AI-powered investor experience**

## Performance

- **Duration:** 5 min
- **Started:** 2026-01-22T10:54:25Z
- **Completed:** 2026-01-22T10:59:25Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- Installed @convex-dev/agent, ai, and @ai-sdk/anthropic packages
- Registered Convex agent component in convex.config.ts
- Added aiThreads table to schema for user-thread mapping
- Created investorAssistant agent with Claude Sonnet model and investor-focused instructions

## Task Commits

Each task was committed atomically:

1. **Task 1: Install AI dependencies** - `0930088` (chore)
2. **Task 2: Register agent component and extend schema** - `325f439` (feat)
3. **Task 3: Create base agent definition** - `d05e06c` (feat)

## Files Created/Modified

- `convex/convex.config.ts` - Convex app config with agent component registration
- `convex/ai/agent.ts` - investorAssistant agent definition with Claude Sonnet
- `convex/schema.ts` - Added aiThreads table with by_user and by_last_activity indexes
- `package.json` - AI infrastructure dependencies

## Decisions Made

1. **Used @ai-sdk/anthropic@2.x** - Version 1.x required zod 3.x which conflicts with project's zod 4.x
2. **Added convex-helpers** - Required peer dependency for @convex-dev/agent
3. **aiThreads as wrapper table** - The @convex-dev/agent component manages its own internal tables; aiThreads provides application-level user-to-thread mapping and custom summarization tracking

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed @ai-sdk/anthropic version compatibility**
- **Found during:** Task 3 (Agent definition)
- **Issue:** @ai-sdk/anthropic@3.x uses LanguageModelV3 which is incompatible with @convex-dev/agent@0.3.2's LanguageModelV2 expectation; @ai-sdk/anthropic@1.x requires zod 3.x conflicting with project's zod 4.x
- **Fix:** Installed @ai-sdk/anthropic@2.x which supports zod 4.x and provides LanguageModelV2
- **Files modified:** package.json, package-lock.json
- **Verification:** `npx convex dev --once` passes without type errors
- **Committed in:** d05e06c (Task 3 commit)

**2. [Rule 3 - Blocking] Added missing convex-helpers peer dependency**
- **Found during:** Task 3 (Agent definition)
- **Issue:** @convex-dev/agent requires convex-helpers but it wasn't automatically installed
- **Fix:** Ran `npm install convex-helpers --legacy-peer-deps`
- **Files modified:** package.json, package-lock.json
- **Verification:** Convex bundler resolves all imports
- **Committed in:** d05e06c (Task 3 commit)

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both fixes necessary for the agent package to work. No scope creep.

## Issues Encountered

None - once version compatibility was resolved, all tasks completed successfully.

## User Setup Required

None - no external service configuration required. The ANTHROPIC_API_KEY environment variable will be needed at runtime (already documented in v1.6 research).

## Next Phase Readiness

- Agent component registered and available via `components.agent`
- Schema includes aiThreads table ready for thread management
- investorAssistant agent defined with Claude Sonnet model
- Ready for Plan 02: Streaming action layer implementation

---
*Phase: 40-ai-infrastructure-foundation*
*Completed: 2026-01-22*
