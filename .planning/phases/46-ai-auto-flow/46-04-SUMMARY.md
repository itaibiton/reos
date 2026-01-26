# Plan 46-04 Summary: Fix Tool Result Extraction for Card Rendering

## Completed: 2026-01-26

## What Was Done

Fixed the tool result extraction in `convex/ai/messages.ts` that was causing property and provider cards to not render (AUTO-02, AUTO-03, AUTO-04 failures).

## Root Cause

The @convex-dev/agent stores tool RESULTS in separate messages with `role: "tool"`. With `excludeToolMessages: true`, these results were never retrieved, so tool calls had no paired results.

## Changes Made

### convex/ai/messages.ts

1. **Changed `excludeToolMessages: false`**
   - Now includes "tool" role messages that contain the actual results
   - Increased `numItems` from 50 to 100 to capture more messages

2. **Added Global Tool Result Map**
   - First pass: Collect all tool-result parts from ALL messages (assistant AND tool)
   - Extracts results from both `result` field and `output.value` field

3. **Updated extractToolCalls Function**
   - Now accepts global result map as parameter
   - Pairs tool calls with results from any message via `toolCallId`
   - Falls back to local results if global not found

4. **Removed Debug Logging**
   - Cleaned up console.log statements from previous debugging

## Key Decision

- **46-04**: `excludeToolMessages: false` required to capture tool results from "tool" role messages
- **46-04**: Global tool result map collects results from ALL messages before pairing with tool calls
- **46-04**: Tool results are in "tool" role messages, not embedded in assistant message content

## Verification

Human-verified after deployment:
- Property cards render with images, prices, and match badges
- SaveAllButton visible when 2+ properties shown
- Provider cards grouped by role in accordion
- Each provider has "Add to Team" button

## Files Changed

- convex/ai/messages.ts

## Duration

~5 minutes (fix + deploy + verify)
