---
phase: 42
plan: 01
subsystem: ai-tools
type: feature
tags: [ai, convex, rag, tool-calling, property-search]
requires:
  - phase: 41
    plan: 03
    reason: "AI agent infrastructure with streaming chat"
  - phase: 40
    plan: 01
    reason: "Agent component setup and profile context"
provides:
  - searchPropertiesTool for agent
  - RAG-grounded property recommendations
  - Anti-hallucination safeguards
affects:
  - phase: 42
    plan: 02
    reason: "UI will consume tool results for property cards"
  - phase: 42
    plan: 03
    reason: "Integration testing will verify tool behavior"
tech-stack:
  added:
    - "@convex-dev/agent createTool API"
  patterns:
    - "RAG grounding with database queries"
    - "Tool-calling with Zod schemas"
    - "Explicit anti-hallucination instructions"
key-files:
  created:
    - convex/ai/tools/propertyQueries.ts
    - convex/ai/tools/propertySearch.ts
  modified:
    - convex/ai/agent.ts
decisions:
  - decision: "Use createTool from @convex-dev/agent instead of tool from ai"
    rationale: "Provides Convex action context (ctx.runQuery, ctx.runMutation) for database access"
    date: 2026-01-22
  - decision: "Cap maxResults at 5 properties"
    rationale: "Prevents overwhelming chat UI and keeps recommendations focused"
    date: 2026-01-22
  - decision: "Include explicit example match explanations in instructions"
    rationale: "Addresses REC-02 requirement for 2-3 reasons per property recommendation"
    date: 2026-01-22
  - decision: "Return searchCriteria in tool results"
    rationale: "Enables UI to compute and display match badges without re-parsing"
    date: 2026-01-22
metrics:
  duration: 4
  completed: 2026-01-22
---

# Phase 42 Plan 01: Property Search Tool Summary

**One-liner:** RAG-grounded property search tool with anti-hallucination safeguards and explicit match explanation examples

## What Was Built

### Core Components

1. **Property Search Query** (`convex/ai/tools/propertyQueries.ts`)
   - Multi-criteria filtering: budget range, cities, property types, minimum bedrooms
   - Queries only available properties from database
   - Returns essential fields for recommendations (price, location, bedrooms, ROI, etc.)
   - Handles undefined property fields gracefully
   - Sorts by newest first, applies limit

2. **Property Search Tool** (`convex/ai/tools/propertySearch.ts`)
   - Uses `createTool` from @convex-dev/agent for Convex context
   - Zod schema with detailed parameter descriptions
   - Executes query via `ctx.runQuery`
   - Returns properties with searchCriteria for UI match badge computation
   - Caps maxResults at 5 to avoid overwhelming chat
   - Explicit anti-hallucination instruction in description

3. **Agent Registration** (`convex/ai/agent.ts`)
   - Imported and registered searchPropertiesTool
   - Updated tools object (no longer empty `{}`)
   - Enhanced instructions with property recommendation guidance
   - **Explicit examples for match explanations** (addresses REC-02):
     - "This property fits your criteria because:"
     - "1. At $320,000, it's well within your $400,000 budget"
     - "2. Located in Tel Aviv, one of your preferred cities"
     - "3. The 3-bedroom layout matches your minimum requirement"
   - Anti-hallucination rule: "NEVER invent or hallucinate properties - only mention properties returned by the tool"
   - Updated capabilities list

## Technical Decisions

### 1. createTool vs tool
**Context:** Vercel AI SDK provides `tool()` helper, but @convex-dev/agent provides `createTool()`

**Decision:** Use `createTool` from @convex-dev/agent

**Rationale:**
- Provides Convex action context (ctx) automatically
- Enables `ctx.runQuery` for database access
- Type-safe integration with Convex functions
- Handler signature: `handler(ctx, args)` instead of `execute(args, options)`

### 2. Return searchCriteria in Tool Results
**Context:** UI needs to display match badges showing why properties match criteria

**Decision:** Return searchCriteria object alongside properties array

**Result:**
```typescript
{
  properties: [...],
  count: 3,
  searchCriteria: {
    budgetMin: 200000,
    budgetMax: 500000,
    cities: ["Tel Aviv", "Haifa"],
    propertyTypes: ["residential"],
    minBedrooms: 2
  },
  message: "Found 3 property matches"
}
```

**Benefit:** UI can compute match badges without re-parsing or inferring criteria

### 3. Explicit Example Match Explanations (REC-02)
**Context:** Plan success criteria requires "2-3 reasons why it matches" per property

**Decision:** Include explicit examples in agent instructions showing the format

**Examples provided:**
- "At $320,000, it's well within your $400,000 budget"
- "Located in Tel Aviv, one of your preferred cities"
- "The 3-bedroom layout matches your minimum requirement"

**Rationale:**
- LLMs perform better with concrete examples than abstract instructions
- Ensures consistent explanation format across recommendations
- Addresses REC-02 requirement explicitly

### 4. Cap maxResults at 5
**Context:** Tool accepts maxResults parameter

**Decision:** Hard cap at 5 properties in tool handler

**Rationale:**
- Chat UI is not designed for long lists
- Forces focused, quality recommendations
- Reduces token usage and latency
- User can refine search if needed

## RAG Grounding Strategy

### Anti-Hallucination Safeguards

1. **Tool-level:** Description explicitly states "NEVER invent or hallucinate properties"
2. **Agent-level:** Instructions repeat "only mention properties returned by the tool"
3. **Query-level:** Only returns properties with `status: "available"` from database
4. **Result structure:** Includes count and message to confirm tool execution

### Why This Works

Traditional LLM issue:
- "Show me 3-bedroom apartments in Tel Aviv under $400k"
- LLM invents: "123 Ben Yehuda St, 3BR, $350k" (doesn't exist)

RAG-grounded approach:
1. LLM calls searchProperties tool with criteria
2. Tool queries actual database
3. Tool returns only existing properties
4. LLM presents real properties with IDs
5. UI can fetch full details by ID (verification)

## Verification Results

All success criteria met:

- ✅ Property search query accepts budget, location, type, bedrooms filters
- ✅ Tool definition uses Zod schema with proper descriptions
- ✅ Tool returns properties with searchCriteria for UI matching
- ✅ Agent registered with tool and updated instructions
- ✅ Agent instructions include explicit examples for "2-3 reasons why it matches" (REC-02)
- ✅ All files compile without TypeScript errors

Convex dev output:
```
✔ Convex functions ready! (5.64s)
```

## Deviations from Plan

None - plan executed exactly as written.

## Files Changed

### Created (2 files)
- `convex/ai/tools/propertyQueries.ts` - Database query with multi-criteria filtering
- `convex/ai/tools/propertySearch.ts` - AI tool definition with Zod schema

### Modified (1 file)
- `convex/ai/agent.ts` - Tool registration and enhanced instructions

## Git Commits

1. `be00c3e` - feat(42-01): create property search query
2. `a80eda5` - feat(42-01): create property search tool definition
3. `6f73fa6` - feat(42-01): register search tool and update agent instructions

## Integration Points

### Upstream Dependencies
- Phase 40: Agent component infrastructure
- Phase 41: AI chat panel for displaying recommendations
- Existing: Properties schema and database

### Downstream Consumers
- Phase 42-02: PropertyRecommendationCard will display tool results
- Phase 42-03: Integration tests will verify tool behavior
- Future: Provider search tool (Phase 43) will follow same pattern

## Next Phase Readiness

**Ready for Phase 42-02 (Property Recommendation UI)**

Prerequisites met:
- ✅ Tool returns structured property data
- ✅ searchCriteria available for match badge computation
- ✅ Property IDs enable fetching full details
- ✅ Count and message enable empty state handling

**Blockers:** None

**Recommended next steps:**
1. Test tool behavior with real investor profiles
2. Verify tool call traces in Convex dashboard
3. Proceed to Plan 02 (Property Recommendation UI)

## Testing Notes

**Manual verification performed:**
- `npx convex dev --once` - TypeScript compilation passed
- Import paths resolved correctly
- Tool registered in agent tools object
- Instructions include explicit examples

**Recommended integration tests (Plan 03):**
- Tool executes successfully with various criteria
- Returns only available properties
- Respects maxResults cap
- Handles empty results gracefully
- searchCriteria matches input parameters

## Knowledge for Future Sessions

### Tool Pattern Established
This is the first tool in the REOS AI system. Future tools (provider search, etc.) should follow this pattern:

1. Create query in `convex/ai/tools/*Queries.ts` (database access)
2. Create tool in `convex/ai/tools/*Search.ts` (AI SDK integration)
3. Use `createTool` from @convex-dev/agent (not `tool` from ai)
4. Return results + metadata for UI consumption
5. Register in agent.ts with descriptive key
6. Update agent instructions with explicit examples

### Anti-Hallucination Best Practices
- Explicit instructions at both tool and agent level
- Return count/message to confirm tool execution
- Include IDs so UI can verify entities exist
- Provide examples of correct behavior

### Context for Claude
When working on property recommendations in future sessions:
- Tool results include searchCriteria (don't re-parse)
- maxResults capped at 5 (intentional limitation)
- Properties have essential fields only (not full schema)
- Agent instructions include specific example formats (maintain consistency)
