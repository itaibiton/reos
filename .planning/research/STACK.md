# Technology Stack: Platform-Wide AI Assistant Side Panel

**Project:** REOS Platform-Wide Context-Aware AI Assistant
**Researched:** 2026-02-01
**Overall Confidence:** HIGH

## Executive Summary

REOS already has a working AI assistant for investors with streaming, memory, and tool use via `@convex-dev/agent@0.3.2` + `ai@5.0.123` + `@ai-sdk/anthropic@2.0.57`. The new milestone extends this to a **platform-wide** assistant available to all roles (investor, broker, mortgage_advisor, lawyer, admin) with a side panel UI, context injection, quick action execution, and proactive nudges.

**The key finding is that zero new npm packages are needed.** The existing stack has everything required. The work is primarily architectural: generalizing the investor-only agent into a multi-role agent, upgrading from the custom `useAIChat` hook to the agent-native `useUIMessages` hook for proper streaming, building the side panel with existing Shadcn Sheet/Drawer primitives, and adding Convex scheduled functions for proactive nudges.

**Critical version constraint:** `@convex-dev/agent@0.3.2` requires `ai@^5.0.29` as a peer dependency. AI SDK 6 support is tracked in GitHub issue #202 but is NOT yet available. Do NOT upgrade to `ai@6.x` -- it will produce 53+ build errors. Stay on `ai@5.0.123`.

---

## What You Already Have (DO NOT ADD)

These packages are installed, configured, and working. No changes needed.

| Package | Installed Version | Current Use | Ready for Side Panel |
|---------|-------------------|-------------|----------------------|
| `@convex-dev/agent` | 0.3.2 | Agent definition, thread memory, tool calling, streaming | YES -- supports `createTool`, `streamText`, `saveStreamDeltas`, `listUIMessages`, `syncStreams`, `useUIMessages` |
| `ai` | 5.0.123 | Vercel AI SDK core (model interfaces, streaming primitives) | YES -- provides `streamText`, tool definitions, `UIMessage` type |
| `@ai-sdk/anthropic` | 2.0.57 | Claude provider for AI SDK | YES -- supports Claude Sonnet 4, tool_use, streaming |
| `@anthropic-ai/sdk` | 0.71.2 | Direct Anthropic SDK (used for summarization, search parsing) | YES -- keep for Haiku calls (summarization) |
| `convex` | 1.31.3 | Backend: real-time DB, actions, mutations, scheduled functions | YES -- `ctx.scheduler` for nudges, mutations for quick actions |
| `convex-helpers` | 0.1.111 | Utility helpers for Convex | YES -- triggers for event-driven nudges |
| `vaul` | 1.1.2 | Drawer primitive (mobile bottom sheets) | YES -- used by existing `Drawer` component |
| `@radix-ui/react-dialog` | 1.1.15 | Dialog/Sheet primitives | YES -- used by existing `Sheet` component |
| `react-resizable-panels` | 4.4.0 | Resizable panel layout | MAYBE -- for adjustable side panel width on desktop in v2 |
| `framer-motion` | 12.26.2 | Animations | YES -- typing indicators, panel transitions, nudge toasts |
| `react-markdown` | 10.1.0 | Markdown rendering in chat messages | YES -- already used for AI responses |
| `zod` | 4.3.5 | Schema validation for tool args | YES -- used by `createTool` |
| `sonner` | 2.0.7 | Toast notifications | YES -- for nudge notification toasts |

---

## What NOT to Add (and Why)

| Package | Why NOT |
|---------|---------|
| `ai@6.x` (upgrade) | `@convex-dev/agent@0.3.2` requires `ai@^5.0.29`. GitHub issue #202 tracks v6 support but it is not yet released. Upgrading breaks the build with 53+ errors. **Stay on ai@5.0.123.** |
| `@ai-sdk/anthropic@3.x` (upgrade) | Version 3.x is for AI SDK 6. The installed 2.0.57 works correctly with `ai@5.x` and `@convex-dev/agent@0.3.2`. **Stay on 2.0.57.** |
| `@langchain/*` | Overkill. Convex Agent + AI SDK already provides tool calling, streaming, memory. LangChain adds unnecessary abstraction. |
| `zustand` / `jotai` / `@tanstack/store` | Not needed for AI panel state. React Context + `useQuery`/`useMutation` from Convex handles state. The side panel open/close state is simple `useState`. |
| `@convex-dev/agent-playground` | Development/debugging tool, not a production dependency. Useful for testing but should not be a prod dependency. |
| `pusher` / `socket.io` / `ably` | Convex provides real-time WebSocket subscriptions natively. No external pub/sub needed for nudge delivery. |
| `@convex-dev/crons` | Runtime cron registration is not needed. Proactive nudges use `ctx.scheduler.runAfter()` (one-off scheduled functions) triggered by mutations, not periodic crons. If periodic scanning is needed later, static `crons.ts` suffices. |
| `openai` / `@ai-sdk/openai` | No second LLM provider needed. Claude handles all assistant capabilities. |
| Any state machine library (`xstate`, `robot`) | Agent conversation flow does not need a formal state machine. Tool calling loop is handled by `maxSteps` in the agent config. |

---

## Stack Changes Required (Code-Level, Not Package-Level)

The work is architectural, not dependency-related. Here is what changes.

### 1. Agent Definition: Generalize from Investor-Only to Multi-Role

**Current state:** Single `investorAssistant` agent in `convex/ai/agent.ts` with investor-specific instructions and two tools (searchProperties, searchProviders).

**Required change:** Create a generalized `platformAssistant` agent (or keep `investorAssistant` and add role-specific tool sets). The recommended approach is a **single Agent with role-aware system prompts and conditional tools**.

**Why single agent, not multiple agents:**
- All roles share the same thread persistence and memory infrastructure
- Tools are conditionally available based on role (passed at runtime via system prompt context)
- Simpler to maintain one agent with role-specific behavior than 5 separate agents
- `@convex-dev/agent` supports passing different `system` prompts per `streamText` call -- role context is injected at call time, not at agent definition time

**Implementation pattern:**
```typescript
// convex/ai/agent.ts -- evolve investorAssistant
export const platformAssistant = new Agent(components.agent, {
  name: "REOS Assistant",
  languageModel: anthropic("claude-sonnet-4-20250514"),
  instructions: "Base instructions shared across all roles...",
  tools: {
    // Universal tools (all roles)
    searchProperties: searchPropertiesTool,
    searchProviders: searchProvidersTool,
    // Quick action tools (new)
    navigateTo: navigateToTool,
    saveProperty: savePropertyTool,
    createDeal: createDealTool,
    getDealStatus: getDealStatusTool,
    // Context tools (new)
    getPageContext: getPageContextTool,
    getUserProfile: getUserProfileTool,
  },
  maxSteps: 8, // Increased from 5 for complex multi-tool workflows
  contextOptions: { recentMessages: 10 },
});
```

**Confidence:** HIGH -- This pattern is documented in Convex Agent docs and matches how multiple-role agents are typically structured.

### 2. Client-Side Streaming: Migrate to `useUIMessages` Hook

**Current state:** Custom `useAIChat` hook (`src/components/ai/hooks/useAIChat.ts`) that:
- Calls `listMessagesAction` (a Convex action) to fetch messages
- Manages local `useState<Message[]>` manually
- Does NOT use real-time subscriptions for messages
- Has no streaming delta display (shows full response only after completion)

**Required change:** Migrate to `@convex-dev/agent/react` hooks:
- `useUIMessages` for paginated messages with real-time streaming
- `useSmoothText` for smooth token-by-token display
- Backend: expose `listUIMessages` + `syncStreams` as a query

**Why migrate:**
- Current hook fetches via action (no real-time updates) -- panel must refetch manually after each message
- `useUIMessages` with `stream: true` provides real-time streaming via WebSocket subscriptions
- Eliminates the optimistic update workaround in current `useAIChat`
- Supports pagination (`loadMore`) for long conversation histories
- `UIMessage` type includes `parts` (text, toolCall, toolResult) for richer rendering

**Implementation pattern (backend):**
```typescript
// convex/ai/streaming.ts (new file)
import { listUIMessages, syncStreams } from "@convex-dev/agent";
import { query } from "../_generated/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";

export const listMessages = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
    streamArgs: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Auth check here
    const messages = await listUIMessages(ctx, components.agent, args);
    const streams = await syncStreams(ctx, components.agent, args);
    return { ...messages, ...streams };
  },
});
```

**Implementation pattern (client):**
```typescript
// hooks/useAssistantMessages.ts (new file)
import { useUIMessages } from "@convex-dev/agent/react";
import { api } from "../../convex/_generated/api";

export function useAssistantMessages(threadId: string | undefined) {
  return useUIMessages(
    api.ai.streaming.listMessages,
    threadId ? { threadId } : "skip",
    { initialNumItems: 20, stream: true }
  );
}
```

**Confidence:** HIGH -- `useUIMessages` and `syncStreams` are the official Convex Agent client APIs, documented at docs.convex.dev/agents/streaming and docs.convex.dev/agents/messages.

### 3. Side Panel UI: Sheet (Desktop) + Full-Screen Drawer (Mobile)

**Current state:** AI chat is embedded as `AIChatPanel` component inside the investor summary page. Not accessible from other pages.

**Required change:** Create a `ResponsiveAssistantPanel` component pattern:
- **Desktop:** Shadcn `Sheet` (side="right", ~400px wide), slide-in from right edge
- **Mobile:** Vaul `Drawer` (direction="bottom", full-screen height), swipe-to-dismiss

**Why Sheet + Drawer (not a new package):**
- Both components already exist in `src/components/ui/sheet.tsx` and `src/components/ui/drawer.tsx`
- This follows the existing `ResponsiveDialog` pattern in `src/components/ui/responsive-dialog.tsx` (dialog on desktop, drawer on mobile)
- No new primitives to learn or install

**Decision point -- Sheet vs. fixed panel:**

| Approach | Pros | Cons |
|----------|------|------|
| **Shadcn Sheet** (overlay) | Already built, familiar UX, focuses attention | Blocks interaction with main content |
| **Fixed side panel** (no overlay) | Can interact with main content alongside assistant | Needs layout shift, more complex |
| **Hybrid** (Sheet without overlay, main content shifts) | Best of both | Requires custom Sheet variant |

**Recommendation:** Start with Shadcn Sheet (overlay) for v1. It is simpler, already built, and focuses user attention on the conversation. Upgrade to overlay-free fixed panel in a later iteration if users request simultaneous interaction. The existing `react-resizable-panels@4.4.0` package can be used later for a resizable side panel.

**Confidence:** HIGH -- Sheet and Drawer are already in the codebase and working.

### 4. Context Injection: Page-Aware System Prompts

**Current state:** Context injection builds investor profile from questionnaire data (`convex/ai/context.ts`). Only investor role supported.

**Required change:** Create a role-aware, page-aware context builder:

```typescript
// convex/ai/context.ts -- extend with:
export const buildPageContext = internalQuery({
  args: {
    userId: v.id("users"),
    role: v.string(),
    currentPage: v.string(),
    pageEntityId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Build context based on role + current page
    // e.g., on /properties/abc123: fetch property details
    // e.g., on /deals/def456: fetch deal pipeline status
    // e.g., on /clients: fetch client list summary
  },
});
```

**How page context flows from client to backend:**
1. Client reads current URL via `usePathname()` from `next-intl` (already used in `AppShell.tsx`)
2. Client sends `currentPage` + `pageEntityId` with each message
3. Backend `context.ts` resolves entity data from Convex DB
4. Context string is injected as system prompt alongside role instructions

**No new packages needed.** `usePathname()` is already used throughout the app. The context data is fetched from existing Convex tables.

**Confidence:** HIGH -- This is a straightforward extension of the existing `buildProfileContext` pattern.

### 5. Quick Action Execution: Convex Mutations via Tools

**Current state:** Tools only do read operations (searchProperties, searchProviders).

**Required change:** Add write-capable tools that execute Convex mutations:

```typescript
// convex/ai/tools/actions.ts (new file)
export const savePropertyTool = createTool({
  description: "Save a property to the user's favorites",
  args: z.object({ propertyId: z.string() }),
  handler: async (ctx, args) => {
    await ctx.runMutation(api.properties.toggleFavorite, {
      propertyId: args.propertyId as Id<"properties">,
    });
    return { success: true, message: "Property saved to favorites" };
  },
});
```

**Key design decision:** Tools that trigger navigation should return a `{ action: "navigate", url: "/path" }` response. The client renders this as a clickable link/button, NOT an automatic redirect. This keeps the user in control.

**Confidence:** HIGH -- `createTool` handler can call `ctx.runMutation` just as easily as `ctx.runQuery`. The pattern is identical to existing tools.

### 6. Proactive Nudges: Convex Scheduled Functions + Notifications

**Current state:** Notification system exists (`convex/notifications.ts`) with types like `deal_stage_change`, `new_message`, etc. No scheduled functions or cron jobs exist.

**Required change:** Two nudge delivery mechanisms:

**A. Event-driven nudges (immediate):**
When a mutation fires (e.g., deal stage changes), schedule an AI analysis:
```typescript
// In deal stage change mutation:
await ctx.scheduler.runAfter(0, internal.ai.nudges.analyzeDealChange, {
  userId: deal.investorId,
  dealId: deal._id,
  newStage: args.stage,
});
```

The nudge analyzer calls the AI to generate a contextual suggestion, then writes to the `notifications` table. The client picks it up via existing `useQuery(api.notifications.list)` real-time subscription.

**B. Periodic nudges (optional, later):**
If needed, add a `convex/crons.ts` for periodic scans:
```typescript
// convex/crons.ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();
crons.daily("nudge-check", { hourUTC: 9 }, internal.ai.nudges.dailyScan);
export default crons;
```

**No new packages needed.** `ctx.scheduler.runAfter()` is built into Convex. The `notifications` table and real-time subscription already exist. Nudge notifications can include a special type (extend the notification type union) that the client renders as an AI suggestion card.

**Confidence:** HIGH for event-driven nudges (standard Convex pattern). MEDIUM for periodic nudges (needs design work on what to scan for).

---

## Version Pinning Recommendations

| Package | Current | Target | Rationale |
|---------|---------|--------|-----------|
| `@convex-dev/agent` | 0.3.2 | 0.3.2 (stay) | Latest stable. When a new version with AI SDK 6 support ships, evaluate upgrade. |
| `ai` | 5.0.123 | 5.0.123 (stay) | Pinned by `@convex-dev/agent` peer dep `^5.0.29`. Do NOT upgrade to 6.x. |
| `@ai-sdk/anthropic` | 2.0.57 | 2.0.57 (stay) | Works with `ai@5.x`. Version 3.x is for AI SDK 6, incompatible. |
| `@anthropic-ai/sdk` | 0.71.2 | 0.71.2 (stay) | Used for direct Haiku calls in summarization. No need to change. |
| `convex` | 1.31.3 | 1.31.5 (minor bump OK) | Latest is 1.31.5 (3 days old). Safe minor bump for bug fixes. |
| `framer-motion` | 12.26.2 | 12.26.2 (stay) | Stable, no need to upgrade. |
| `sonner` | 2.0.7 | 2.0.7 (stay) | Used for nudge toasts. Stable. |

---

## Model Selection

| Use Case | Model | Rationale |
|----------|-------|-----------|
| **Platform assistant (all roles)** | `claude-sonnet-4-20250514` | Best balance of capability, speed, and cost for multi-tool conversations. Already used by `investorAssistant`. |
| **Summarization** | `claude-3-haiku-20240307` | Cheap, fast. Already used in `summarization.ts`. |
| **Search parsing** | `claude-3-haiku-20240307` | Already working. No change needed. |
| **Nudge analysis** | `claude-3-haiku-20240307` | Short analysis tasks (is this deal change worth nudging about?). Cost-effective. |

**Note on model aliases:** The `@ai-sdk/anthropic` provider accepts full model IDs like `anthropic("claude-sonnet-4-20250514")`. The project already uses the full model ID. Keep this convention for reproducibility -- aliases can silently resolve to different models when new versions release.

**Confidence:** HIGH -- Model selection is already validated in the existing implementation.

---

## Integration Points with Existing Code

### Files to Modify (Not Replace)

| File | Change | Reason |
|------|--------|--------|
| `convex/ai/agent.ts` | Generalize instructions, add new tools, rename to `platformAssistant` | Multi-role support |
| `convex/ai/context.ts` | Add `buildPageContext` and role-specific context builders | Page awareness, multi-role |
| `convex/ai/chat.ts` | Accept `currentPage`, `role` params; use generalized agent | Context-aware messages |
| `convex/ai/threads.ts` | Add role field to thread creation | Track which role owns each thread |
| `convex/schema.ts` | Extend `aiThreads` with `role` field; extend `notifications` with AI nudge types | Multi-role threads, nudge delivery |
| `src/components/layout/AppShell.tsx` | Add assistant FAB/trigger button and panel mounting | Platform-wide access point |
| `convex/notifications.ts` | Add `ai_nudge` notification type and nudge-specific metadata | Nudge delivery |

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/ai/AssistantPanel.tsx` | The responsive side panel (Sheet desktop, Drawer mobile) |
| `src/components/ai/AssistantProvider.tsx` | React Context providing panel state + page context to entire app |
| `src/components/ai/AssistantTrigger.tsx` | FAB / header button to open the assistant |
| `src/components/ai/hooks/useAssistantMessages.ts` | Wraps `useUIMessages` from `@convex-dev/agent/react` |
| `src/components/ai/hooks/usePageContext.ts` | Reads current page/route and resolves entity context |
| `convex/ai/streaming.ts` | Backend query exposing `listUIMessages` + `syncStreams` |
| `convex/ai/tools/actions.ts` | Write-capable tools (save property, create deal, etc.) |
| `convex/ai/tools/navigation.ts` | Navigation suggestion tool (returns URLs) |
| `convex/ai/nudges.ts` | Nudge analysis and scheduling logic |

### Files to Deprecate/Remove (After Migration)

| File | Reason |
|------|--------|
| `src/components/ai/hooks/useAIChat.ts` | Replaced by `useAssistantMessages.ts` using `useUIMessages` |
| `convex/ai/messages.ts` | Replaced by `convex/ai/streaming.ts` using `listUIMessages` |

---

## Alternatives Considered

| Decision | Recommended | Alternative | Why Not Alternative |
|----------|-------------|-------------|---------------------|
| Side panel approach | Shadcn Sheet + Vaul Drawer | Custom panel with `react-resizable-panels` | Sheet is simpler for v1; resizable panel adds complexity and requires layout restructuring. Can upgrade later. |
| Agent architecture | Single agent, role-injected at runtime | Multiple agent instances per role | Single agent is simpler, all roles share memory infrastructure. Per-role instructions are injected as system prompt context. |
| Streaming approach | `useUIMessages` with `stream: true` | Keep custom `useAIChat` hook | `useUIMessages` provides real-time WebSocket streaming, pagination, and `UIMessage` type. Current hook has no real-time updates. |
| Nudge delivery | Convex scheduled functions + notifications table | External push service (Pusher, etc.) | Convex real-time subscriptions already push to clients via WebSocket. Notifications table already works. No external service needed. |
| Context injection | System prompt with page data | Vector search over page content | System prompt is simpler, deterministic, and page context is structured data (not unstructured text). Vector search adds latency for no benefit here. |
| AI SDK version | Stay on 5.0.123 | Upgrade to 6.0.39 | `@convex-dev/agent` does not yet support AI SDK 6 (GitHub issue #202). Upgrading breaks the build. |
| New packages | Zero new packages | Add state management library for panel state | React Context + useState is sufficient for panel open/close state. No global state library needed for one piece of UI state. |

---

## Installation Commands

**No installation needed.** All required packages are already installed. If Convex is bumped:

```bash
# Optional: minor Convex bump for bug fixes
npm install convex@1.31.5
```

---

## Confidence Assessment

| Area | Confidence | Source | Notes |
|------|------------|--------|-------|
| Version constraints (ai@5 vs 6) | HIGH | npm peer deps + GitHub issue #202 | Verified installed peer dependencies directly |
| `useUIMessages` / `syncStreams` API | HIGH | docs.convex.dev/agents/streaming, docs.convex.dev/agents/messages | Official documentation, verified available in 0.3.2 |
| Sheet/Drawer for side panel | HIGH | Existing components in codebase | Already built and used (`sheet.tsx`, `drawer.tsx`, `responsive-dialog.tsx`) |
| `createTool` for mutations | HIGH | Existing codebase pattern | Already working with `ctx.runQuery`, `ctx.runMutation` documented |
| Scheduled functions for nudges | HIGH | docs.convex.dev/scheduling | Built-in Convex feature, no extra packages |
| Single vs multi-agent design | MEDIUM | Convex Agent docs + community patterns | Documented pattern but this specific multi-role design needs validation during implementation |
| `useSmoothText` hook | MEDIUM | docs.convex.dev/agents/streaming | Documented but not yet used in this codebase; needs integration testing |

---

## Sources

### Official Documentation (HIGH Confidence)
- [Convex Agent - Streaming](https://docs.convex.dev/agents/streaming) -- `useUIMessages`, `syncStreams`, `saveStreamDeltas`, `useSmoothText`
- [Convex Agent - Messages](https://docs.convex.dev/agents/messages) -- `listUIMessages`, `UIMessage` type, `useUIMessages` hook
- [Convex Agent - Overview](https://docs.convex.dev/agents) -- Agent constructor, tools, threads
- [Convex Scheduling](https://docs.convex.dev/scheduling) -- `ctx.scheduler.runAfter()`, scheduled functions
- [Convex Cron Jobs](https://docs.convex.dev/scheduling/cron-jobs) -- Static cron definitions
- [AI SDK Anthropic Provider](https://ai-sdk.dev/providers/ai-sdk-providers/anthropic) -- Tool use, streaming, model options

### Package Registry (HIGH Confidence)
- [@convex-dev/agent@0.3.2](https://www.npmjs.com/package/@convex-dev/agent) -- Peer dep: `ai@^5.0.29`
- [ai@5.0.123](https://www.npmjs.com/package/ai) -- Latest 5.x; 6.0.39 exists but incompatible
- [@ai-sdk/anthropic@2.0.57](https://www.npmjs.com/package/@ai-sdk/anthropic) -- Works with ai@5.x
- [ai@6.0.39](https://www.npmjs.com/package/ai) -- Latest, NOT compatible with current agent

### GitHub Issues (HIGH Confidence)
- [get-convex/agent#202: Support for AI SDK v6](https://github.com/get-convex/agent/issues/202) -- Confirms incompatibility, open issue

### Verified in Codebase (HIGH Confidence)
- `package.json` -- Current installed versions
- `node_modules/@convex-dev/agent/package.json` -- Peer dependency verification
- `convex/ai/agent.ts` -- Current agent definition
- `src/components/ai/hooks/useAIChat.ts` -- Current chat hook (to be replaced)
- `src/components/ui/sheet.tsx` -- Existing Sheet component
- `src/components/ui/drawer.tsx` -- Existing Drawer component
- `src/components/ui/responsive-dialog.tsx` -- Existing responsive pattern
- `convex/notifications.ts` -- Existing notification system
- `convex/ai/context.ts` -- Existing context builder

---

## Summary

**Zero new packages.** The platform-wide AI assistant side panel is built entirely with the existing stack:

1. **Side Panel UI:** Shadcn Sheet (desktop) + Vaul Drawer (mobile) -- both already installed
2. **Streaming:** Migrate from custom `useAIChat` to `useUIMessages` from `@convex-dev/agent/react` -- already in the package
3. **Tool Use / Actions:** Add more `createTool` definitions for write operations -- same pattern as existing tools
4. **Context Injection:** Extend `convex/ai/context.ts` with role + page awareness -- pure code, no deps
5. **Proactive Nudges:** `ctx.scheduler.runAfter()` + existing `notifications` table -- built into Convex
6. **Multi-Role:** Single agent with runtime role injection via system prompt -- supported by Agent API

The only potential version change is a minor Convex bump (1.31.3 to 1.31.5) for bug fixes, which is optional and low-risk.
