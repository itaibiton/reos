# Phase 46: AI Auto-Flow - Verification Report

## Status: `gaps_found`

## Score: 4/7 must-haves verified

## Summary

Human verification identified that properties and providers are displaying as plain text instead of interactive cards (AUTO-02, AUTO-03, AUTO-04 failures). Investigation reveals the issue is in the message extraction pipeline.

## Must-Have Results

### ✅ PASSED

1. **AUTO-01**: AI sends greeting without user prompt after questionnaire completion
   - useAutoGreeting hook triggers sendMessage("", { allowEmpty: true }) correctly
   - Server detects empty message + new thread as auto-greeting scenario

2. **AUTO-05**: Questionnaire popup persists until completed
   - IncompleteProfileReminder correctly shows until status === "complete"
   - Skip is temporary (via lastPathRef tracking)

3. **Infrastructure**: Empty message support working
   - useAIChat accepts { allowEmpty: true } option
   - Server-side auto-greeting system prompt injection working

4. **SUCCESS-07**: Quick reply buttons visible after auto-suggestions
   - QuickReplyButtons component properly integrated via renderQuickReplies prop

### ❌ FAILED

5. **AUTO-02**: Tool results render as cards, not text - **FAILED**
   - Properties showing as markdown text instead of PropertyRecommendationCard components
   - **Root cause**: Tool call extraction in `convex/ai/messages.ts` may not correctly pair tool-calls with tool-results
   - The `extractToolCalls` function only reads `result` field but agent may store in `output` field

6. **AUTO-03**: SaveAllButton renders below property cards - **FAILED**
   - Cannot verify - property cards not rendering at all (blocked by AUTO-02)

7. **AUTO-04**: Provider cards grouped by role with Add to Team buttons - **FAILED**
   - Cannot verify - provider cards not rendering at all (blocked by AUTO-02)

## Gap Analysis

### Gap 1: Tool Result Extraction Not Working

**Location**: `convex/ai/messages.ts:94-130`

**Problem**: The `extractToolCalls` function extracts tool-call parts and attempts to pair them with tool-result parts, but:
1. Tool results may use `output` field instead of `result` field (see api.d.ts line 389-404)
2. The filter `.filter(msg => msg.content.length > 0)` at line 64 may filter out assistant messages that have tool calls but no text content

**Evidence from code review**:
```typescript
// Current code only checks result field:
result: resultMap.get(call.toolCallId),

// But API types show tool-result has both:
result?: any;
output?: { type: "text"; value: string } | { type: "json"; value: any } | ...
```

**Fix required**:
1. Update `extractToolCalls` to also check `output.value` when `result` is undefined
2. Remove or modify the empty content filter to allow tool-only messages through

### Gap 2: Message Content Filter Too Aggressive

**Location**: `convex/ai/messages.ts:64`

**Problem**: `.filter(msg => msg.content.length > 0)` filters out messages where text content is empty but tool calls exist.

**Fix required**: Change filter to allow messages that have either text content OR tool calls:
```typescript
.filter(msg => msg.content.length > 0 || (msg.toolCalls && msg.toolCalls.length > 0))
```

## Recommended Fix Plans

### Plan 46-04: Fix Tool Result Extraction

1. Update `extractToolCalls` in `convex/ai/messages.ts` to:
   - Check `output.value` when `result` is undefined
   - Handle both JSON and text output types
2. Update message filter to preserve tool-only messages
3. Add logging to debug tool call structure
4. Verify end-to-end card rendering

## Files Requiring Changes

- `convex/ai/messages.ts` - Fix tool result extraction and message filtering

## Verification Commands

```bash
# After fix, verify tool calls are extracted:
# 1. Complete questionnaire
# 2. Check browser console for tool call data
# 3. Confirm PropertyCardRenderer receives non-empty toolCalls prop
```
