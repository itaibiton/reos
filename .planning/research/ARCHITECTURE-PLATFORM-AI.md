# Architecture: Platform-Wide AI Assistant Side Panel

**Project:** REOS Platform-Wide AI Assistant
**Scope:** How the AI side panel integrates with existing Next.js App Router + Convex architecture
**Researched:** 2026-02-01
**Confidence:** HIGH (based on verified codebase analysis, Convex Agent docs, and Next.js App Router patterns)

---

## Executive Summary

The REOS platform already has a working AI assistant (`src/components/ai/`) that lives exclusively on the investor summary page, backed by `@convex-dev/agent` v0.3.2 with persistent threads, tool use (property + provider search), streaming via `saveStreamDeltas`, and conversation summarization. The platform-wide evolution requires moving this from a page-embedded component to a global side panel accessible from any page within the `(app)` route group, with context-awareness of the current page/route, multi-role support beyond investors, and the ability to execute Convex mutations (not just queries) through tool use.

The architecture leverages three key existing patterns:
1. **AppShell** (`src/components/layout/AppShell.tsx`) already wraps all authenticated content -- the side panel slots in alongside `SidebarInset` at this level.
2. **@convex-dev/agent** already supports multiple agents on the same thread, `contextHandler` for dynamic context injection, and `createTool` with full `ActionCtx` (including `runMutation`).
3. **ResponsiveDialog** pattern (`src/components/ui/responsive-dialog.tsx`) provides the desktop Dialog / mobile Drawer split -- the AI panel follows the same principle: desktop Sheet, mobile full-screen Drawer.

---

## Current Architecture (What Exists)

### Component Tree (Authenticated Pages)

```
LocaleLayout (server)
  ClerkProvider
    ConvexClientProvider
      Providers (next-intl, theme)
        (app)/layout.tsx (client -- auth gate + onboarding redirect)
          AppShell
            SidebarProvider
              AppSidebar (left nav)
              SidebarInset
                <header> (breadcrumbs, search, avatar)
                <main> {children}
              MobileBottomNav (fixed bottom, md:hidden)
```

### Existing AI Stack

| Layer | File | Role |
|-------|------|------|
| Agent definition | `convex/ai/agent.ts` | `investorAssistant` -- single agent, Claude Sonnet, 2 tools |
| Chat action | `convex/ai/chat.ts` | `sendMessage` action -- builds context, streams via `saveStreamDeltas` |
| Thread management | `convex/ai/threads.ts` | One thread per user (`aiThreads` table), summary storage |
| Context builder | `convex/ai/context.ts` | `buildProfileContext` -- investor questionnaire only |
| Summarization | `convex/ai/summarization.ts` | Haiku-based summarization at 15 messages |
| Tools | `convex/ai/tools/propertySearch.ts` | `searchPropertiesTool` -- read-only query |
| Tools | `convex/ai/tools/providerSearch.ts` | `searchProvidersTool` -- read-only query |
| Messages | `convex/ai/messages.ts` | `listMessages` action -- extracts tool calls, reverses to chronological |
| Frontend hook | `src/components/ai/hooks/useAIChat.ts` | Polling-based (action, not query), optimistic updates |
| UI panel | `src/components/ai/AIChatPanel.tsx` | Self-contained chat panel with header, messages, input |
| UI messages | `src/components/ai/ChatMessage.tsx` | Markdown rendering, tool result cards |
| Usage | Investor summary page only | Embedded in 2-column grid layout |

### Key Limitation: No Real-Time Streaming to Client

The current `useAIChat` hook uses **action-based message fetching** (not Convex query subscriptions). It polls by calling `listMessagesAction` after each send completes. The `saveStreamDeltas` configuration is set on the backend but the frontend does **not** use `useUIMessages` or `syncStreams` from `@convex-dev/agent` -- it waits for the full response then refetches. This means users see no incremental text during generation, only a typing indicator until completion.

---

## Target Architecture (Platform-Wide)

### Component Tree Addition

```
AppShell
  SidebarProvider
    AppSidebar (left nav)
    SidebarInset
      <header>
        ... existing ...
        [AI Toggle Button]  <-- NEW: in header, right side
      <main> {children}
    MobileBottomNav

  [AIAssistantProvider]  <-- NEW: React Context wrapping SidebarProvider children
    [AIAssistantPanel]   <-- NEW: Desktop = Sheet (right), Mobile = Drawer (bottom)
```

### Where the Panel Lives

**Recommendation: Inside `AppShell`, as a sibling to the content area, managed by React Context state.**

The side panel should NOT be:
- A parallel route (`@assistant`) -- too heavy for a panel that shares state with the current page; parallel routes force file-system coupling and make context passing awkward.
- A global overlay managed by URL params -- the panel state (open/closed) is ephemeral UI state, not navigation state.

It SHOULD be:
- A `Sheet` component (from `src/components/ui/sheet.tsx`) rendered inside `AppShell`, opened/closed via React Context.
- On mobile: a `Drawer` (from `src/components/ui/drawer.tsx`) sliding up from bottom, similar to the `ResponsiveDialog` pattern.
- State managed by `AIAssistantProvider` context that also handles route-awareness and context injection.

**Rationale:** The Sheet component already exists in the codebase, uses `@radix-ui/react-dialog` under the hood, supports `side="right"`, and follows the project's existing RTL-aware patterns (`inset-y-0 end-0`). This is the lightest integration path.

---

## New Components

### 1. AIAssistantProvider (React Context)

**File:** `src/providers/AIAssistantProvider.tsx`

**Responsibilities:**
- Manages open/closed state of the AI panel
- Tracks current route via `usePathname()` from `@/i18n/navigation`
- Resolves page context (which property, deal, or client the user is viewing)
- Provides `openAssistant()`, `closeAssistant()`, `toggleAssistant()` methods
- Provides `pageContext` object to the chat system
- Manages keyboard shortcut (Cmd+J or similar) to toggle

**Key design decisions:**
- Context value should be **memoized** to prevent re-renders of the entire page tree. The provider should split into two contexts: one for dispatch (stable functions) and one for state (open, pageContext) -- following the React pattern of separating state from dispatch to prevent consumer re-renders.
- Page context resolution uses pathname matching, NOT route params. The provider reads `usePathname()` and extracts entity IDs via regex (e.g., `/properties/abc123` -> property ID `abc123`), then queries the relevant Convex data.

**Interface:**

```typescript
interface AIAssistantContextState {
  isOpen: boolean;
  pageContext: PageContext | null;
}

interface AIAssistantContextDispatch {
  openAssistant: (initialPrompt?: string) => void;
  closeAssistant: () => void;
  toggleAssistant: () => void;
  setPageContext: (context: PageContext) => void;
}

interface PageContext {
  route: string;                    // e.g., "/properties/abc123"
  entityType?: "property" | "deal" | "client" | "provider" | "dashboard";
  entityId?: string;                // Convex document ID
  entityData?: Record<string, any>; // Pre-fetched entity data for context injection
  role: UserRole;                   // Current effective role
}
```

### 2. AIAssistantPanel (UI Component)

**File:** `src/components/ai/AIAssistantPanel.tsx`

**Responsibilities:**
- Renders the chat UI inside a Sheet (desktop) or Drawer (mobile)
- Consumes `AIAssistantProvider` context for page awareness
- Contains the existing `AIChatPanel` internals (messages, input, clear)
- Adds page-context indicator chip (e.g., "Viewing: 3BR Apartment in Tel Aviv")
- Adds suggested prompts based on page context

**Desktop layout:**
```
+---------------------------+
| AI Assistant     [X close] |
| ========================= |
| [Context: Property #xyz]  |  <-- context chip, clickable to clear
| ========================= |
| [message list]            |
| [message list]            |
| [message list]            |
| ========================= |
| [Suggested: "Analyze ROI"]|  <-- context-aware suggestions
| ========================= |
| [input] [send/stop]       |
+---------------------------+
```

**Width:** 400px fixed on desktop (matches Sheet's `sm:max-w-sm` default). Can be widened to ~480px since AI responses need more room than typical sheets.

**Mobile layout:** Full-screen drawer from bottom, occupying `100dvh - header height`. No overlay on the main content since it replaces it entirely.

### 3. AIToggleButton (Header Integration)

**File:** `src/components/ai/AIToggleButton.tsx`

**Placement:** Inside `AppShell` header, to the left of `AvatarDropdown`, inside the `<Authenticated>` block.

**Behavior:**
- Icon button with AI/sparkle icon
- Badge dot when AI has proactive nudge
- Keyboard shortcut label on hover (desktop)
- On mobile: also accessible, but may also be triggered from a FAB or bottom nav integration

### 4. useAIAssistantChat (Enhanced Hook)

**File:** `src/components/ai/hooks/useAIAssistantChat.ts`

**Evolution of `useAIChat`:** The existing hook must be enhanced to:
1. Accept `pageContext` and pass it to the backend
2. Support real-time streaming via `useUIMessages` + `syncStreams` (replacing the polling pattern)
3. Handle multi-role threads (not just investor)

---

## Backend Architecture Changes

### From Single Agent to Agent Registry

The current `investorAssistant` in `convex/ai/agent.ts` is hardcoded for investors. The platform-wide assistant needs role-aware and context-aware agent selection.

**Recommendation: Single "platform assistant" agent with dynamic instructions and tool sets, NOT multiple separate agents.**

**Rationale:**
- `@convex-dev/agent` threads can be shared across agents, but switching agents mid-thread creates confusing context (the new agent inherits the old agent's messages which may reference the old agent's tools).
- The REOS use case is one user, one conversation, multiple roles. Different roles need different tools and instructions, but the conversation is continuous.
- Per Convex docs, tools can be overridden at the thread level or per-invocation: `args.tools ?? thread.tools ?? agent.options.tools`. This means we can define a base agent and swap tools/instructions per call.

**Implementation:**

```
convex/ai/
  agent.ts           -- Base agent definition (shared model, base instructions)
  agents/
    investor.ts      -- Investor-specific instructions + tools
    broker.ts        -- Broker-specific instructions + tools
    provider.ts      -- Generic provider instructions + tools
    admin.ts         -- Admin instructions + tools
  context.ts         -- Enhanced: buildProfileContext + buildPageContext
  contextResolvers/
    property.ts      -- Resolve property page context
    deal.ts          -- Resolve deal page context
    client.ts        -- Resolve client page context
    dashboard.ts     -- Resolve dashboard context
  tools/
    propertySearch.ts   -- EXISTING (read-only)
    providerSearch.ts   -- EXISTING (read-only)
    saveProperty.ts     -- NEW: mutation tool
    createDeal.ts       -- NEW: mutation tool
    navigateTo.ts       -- NEW: returns URL for frontend navigation
    lookupDeal.ts       -- NEW: query tool for deal details
    lookupProperty.ts   -- NEW: query tool for property details
```

### Context Injection Flow

The chat action receives `pageContext` from the frontend and builds a composite system prompt:

```
System Prompt =
  Base Instructions (role-specific)
  + Profile Context (questionnaire data, always fresh)
  + Page Context (what the user is currently viewing)
  + Thread Summary (if conversation is long)
```

**New `sendMessage` action signature:**

```typescript
export const sendMessage = action({
  args: {
    message: v.string(),
    pageContext: v.optional(v.object({
      route: v.string(),
      entityType: v.optional(v.string()),
      entityId: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    // 1. Get user + role
    // 2. Resolve page context to actual data
    // 3. Select role-specific instructions + tools
    // 4. Build composite system prompt
    // 5. Stream response with role-appropriate tools
  },
});
```

### Thread Model Evolution

**Current:** One `aiThreads` row per user. Single thread, single agent.

**Platform-wide:** Still one primary thread per user (conversation continuity), but with:
- Role tracking on the thread (to know when role switches happen)
- Page context not stored on thread (ephemeral, changes every call)
- Agent thread ID stays the same (multi-agent on same thread)

**Schema change needed:**

```typescript
aiThreads: defineTable({
  userId: v.id("users"),
  agentThreadId: v.optional(v.string()),
  summary: v.optional(v.string()),
  summarizedMessageCount: v.optional(v.number()),
  lastRole: v.optional(v.string()),        // NEW: track last role used
  lastActivityAt: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
```

### Mutation Tools (New Capability)

The existing tools (`searchProperties`, `searchProviders`) are read-only queries. Platform-wide assistant needs to execute mutations:

**Tool: `savePropertyTool`**
```typescript
export const savePropertyTool = createTool({
  description: "Save a property to the user's favorites",
  args: z.object({
    propertyId: z.string().describe("The property ID to save"),
  }),
  handler: async (ctx, args) => {
    await ctx.runMutation(api.favorites.toggleFavorite, {
      propertyId: args.propertyId as Id<"properties">,
    });
    return { saved: true, message: "Property saved to favorites" };
  },
});
```

**Tool: `createDealTool`**
```typescript
export const createDealTool = createTool({
  description: "Express interest in a property and create a deal",
  args: z.object({
    propertyId: z.string().describe("The property ID"),
    offerPrice: z.number().optional().describe("Optional offer price in USD"),
    notes: z.string().optional().describe("Notes for the deal"),
  }),
  handler: async (ctx, args) => {
    const dealId = await ctx.runMutation(api.deals.create, {
      propertyId: args.propertyId as Id<"properties">,
      offerPrice: args.offerPrice,
      notes: args.notes,
    });
    return { dealId, message: "Deal created successfully" };
  },
});
```

**Tool: `navigateToTool`**
```typescript
export const navigateToTool = createTool({
  description: "Generate a navigation link for the user to visit a page",
  args: z.object({
    destination: z.enum(["property", "deal", "provider", "settings", "dashboard"]),
    entityId: z.string().optional(),
  }),
  handler: async (ctx, args) => {
    const urlMap = {
      property: `/properties/${args.entityId}`,
      deal: `/deals/${args.entityId}`,
      provider: `/providers/${args.entityId}`,
      settings: "/settings",
      dashboard: "/dashboard",
    };
    return { url: urlMap[args.destination], message: "Navigate to this page" };
  },
});
```

**Frontend handling of navigation tools:** The `ChatMessage` component detects `navigateTo` tool results and renders them as clickable links/buttons, not raw text.

### Streaming Upgrade Path

**Current state:** Backend uses `saveStreamDeltas: true`, but frontend ignores deltas and polls after completion.

**Target state:** Frontend subscribes to real-time deltas via `useUIMessages` + `syncStreams`.

This requires:
1. A new Convex query that wraps `listUIMessages` and `syncStreams` from `@convex-dev/agent`
2. Frontend hook replacement from action-polling to query-subscription
3. `useSmoothText` integration for visual typing effect

**New query:**

```typescript
// convex/ai/streaming.ts
export const listThreadMessages = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
    streamArgs: vStreamArgs,
  },
  handler: async (ctx, args) => {
    const paginated = await listUIMessages(ctx, components.agent, args);
    const streams = await syncStreams(ctx, components.agent, args);
    return { ...paginated, streams };
  },
});
```

**Frontend hook:**

```typescript
const { results, status, loadMore } = useUIMessages(
  api.ai.streaming.listThreadMessages,
  { threadId },
  { initialNumItems: 20, stream: true },
);
```

---

## Data Flow: Full Lifecycle

### Opening the Panel

```
1. User clicks AI button in header (or presses Cmd+J)
   |
2. AIAssistantProvider sets isOpen = true
   |
3. Sheet/Drawer opens
   |
4. Panel reads pageContext from provider
   |
5. If thread exists: subscribe to messages via useUIMessages
   If no thread: show welcome state with context-aware suggestions
```

### Sending a Message with Page Context

```
1. User types "What's the ROI on this property?"
   |
2. Frontend reads pageContext: { entityType: "property", entityId: "abc123" }
   |
3. Calls sendMessage action with { message, pageContext }
   |
4. Backend resolves:
   a. User role -> selects instructions + tools
   b. entityId "abc123" -> queries property data
   c. Builds system prompt with property details
   |
5. Agent streams response with saveStreamDeltas
   |
6. Frontend receives deltas via useUIMessages subscription
   |
7. AI uses lookupProperty tool if it needs more data
   |
8. Final response: "Based on the property at [address], the expected ROI is 7.2%..."
```

### Tool Use with Mutations

```
1. User: "Save this property to my favorites"
   |
2. AI recognizes intent, calls savePropertyTool with propertyId from pageContext
   |
3. Tool executes ctx.runMutation(api.favorites.toggleFavorite, ...)
   |
4. Tool returns { saved: true }
   |
5. AI responds: "Done! I've saved [property name] to your favorites."
   |
6. ChatMessage renders a confirmation card with link to favorites
```

### Mobile Full-Screen Experience

```
1. User taps AI button in header
   |
2. Drawer slides up from bottom
   |
3. Drawer height: 100dvh - 64px (header) - safe area
   |
4. MobileBottomNav is hidden while drawer is open (z-index management)
   |
5. Keyboard pushes drawer content up (reuse useKeyboardVisible from existing code)
   |
6. Close: swipe down or tap X
```

---

## Integration Points with Existing Components

### Modified Components

| Component | Change | Why |
|-----------|--------|-----|
| `AppShell.tsx` | Add `AIAssistantProvider` wrapper + `AIAssistantPanel` + `AIToggleButton` in header | Panel must be accessible from any page |
| `useAIChat.ts` | Evolve to accept `pageContext`, switch to real-time subscriptions | Context-awareness + proper streaming |
| `convex/ai/agent.ts` | Refactor to base agent + role-specific configs | Multi-role support |
| `convex/ai/chat.ts` | Accept `pageContext` arg, resolve context dynamically | Page-aware responses |
| `convex/ai/context.ts` | Add `buildPageContext()` alongside existing `buildProfileContext()` | Page context injection |
| `convex/schema.ts` | Add `lastRole` field to `aiThreads` | Track role switches |
| Investor summary page | Remove embedded `AIChatPanel`, add "Open AI Assistant" button instead | Deduplicate -- AI lives in global panel now |

### New Components

| Component | Purpose |
|-----------|---------|
| `src/providers/AIAssistantProvider.tsx` | React Context for panel state + page context |
| `src/components/ai/AIAssistantPanel.tsx` | Sheet/Drawer wrapper for the chat UI |
| `src/components/ai/AIToggleButton.tsx` | Header button to open/close panel |
| `src/components/ai/AIContextChip.tsx` | Shows current page context in panel header |
| `src/components/ai/AIPageSuggestions.tsx` | Context-aware suggested prompts |
| `src/components/ai/AINavigationCard.tsx` | Renders navigation tool results as clickable cards |
| `src/components/ai/AIMutationConfirmation.tsx` | Renders mutation tool results as confirmation cards |
| `convex/ai/agents/investor.ts` | Investor-specific instructions + tools |
| `convex/ai/agents/broker.ts` | Broker-specific instructions + tools |
| `convex/ai/contextResolvers/property.ts` | Resolves property page context |
| `convex/ai/contextResolvers/deal.ts` | Resolves deal page context |
| `convex/ai/tools/saveProperty.ts` | Mutation tool: save to favorites |
| `convex/ai/tools/createDeal.ts` | Mutation tool: create deal |
| `convex/ai/tools/navigateTo.ts` | Navigation tool: generate URLs |
| `convex/ai/tools/lookupProperty.ts` | Query tool: full property details |
| `convex/ai/tools/lookupDeal.ts` | Query tool: deal details |
| `convex/ai/streaming.ts` | Query for real-time message streaming |

### Untouched Components

| Component | Why Unchanged |
|-----------|---------------|
| `MobileBottomNav.tsx` | AI panel overlays on top; no nav item change needed |
| `Sidebar.tsx` | No sidebar item for AI; it is header-triggered |
| `ChatMessage.tsx` | Reused as-is inside the new panel (may need minor extensions for new tool types) |
| `ChatMessageList.tsx` | Reused as-is |
| `AIChatInput.tsx` | Reused as-is |
| `PropertyCardRenderer.tsx` | Reused as-is for property tool results |
| `ProviderCardRenderer.tsx` | Reused as-is for provider tool results |

---

## Scalability Considerations

| Concern | Current (Single Page) | Platform-Wide | Notes |
|---------|----------------------|---------------|-------|
| Thread count | 1 per user | Still 1 per user | Single continuous conversation |
| Context size | ~500 tokens (investor profile only) | ~1500-2000 tokens (profile + page context) | Well within Claude's 200K context |
| Tool count | 2 (search only) | 6-8 (search + mutations + navigation) | `maxSteps` may need increase from 5 to 8 |
| Concurrent users | N/A | Multiple users streaming simultaneously | Convex handles this natively |
| Message volume | Low (investor summary only) | Higher (accessible from every page) | Summarization threshold may need lowering |
| Mobile performance | Tab-based on summary page | Full-screen drawer from any page | Keyboard handling already solved |

---

## Suggested Build Order

### Phase 1: Global Panel Shell (No Backend Changes)

**Goal:** Get the panel rendering from any page with the existing AI functionality.

1. Create `AIAssistantProvider` with open/close state
2. Create `AIAssistantPanel` wrapping existing `AIChatPanel` in Sheet/Drawer
3. Create `AIToggleButton` in AppShell header
4. Wire up in `AppShell.tsx`
5. Test: AI panel opens/closes from any page, chat works as before

**Dependencies:** None. Uses existing backend as-is.
**Risk:** LOW -- purely UI composition of existing components.

### Phase 2: Context Injection

**Goal:** Panel knows what page you are on and injects context.

1. Add `pageContext` tracking to `AIAssistantProvider` (pathname parsing)
2. Create context resolvers (`convex/ai/contextResolvers/`)
3. Modify `convex/ai/chat.ts` to accept and use `pageContext`
4. Create `AIContextChip` and `AIPageSuggestions` components
5. Test: "Tell me about this property" works on property detail page

**Dependencies:** Phase 1 complete.
**Risk:** MEDIUM -- context resolver logic needs thorough testing per entity type.

### Phase 3: Multi-Role Support

**Goal:** AI adapts its behavior to the user's role.

1. Create role-specific instruction configs (`convex/ai/agents/`)
2. Modify agent setup to select instructions + tools by role
3. Add `lastRole` to `aiThreads` schema
4. Extend context builder for provider-specific data (serviceProviderProfiles)
5. Test: Broker gets different tools/behavior than investor

**Dependencies:** Phase 2 complete.
**Risk:** MEDIUM -- instruction design for each role is content-heavy.

### Phase 4: Mutation Tools

**Goal:** AI can execute actions (save property, create deal).

1. Create mutation tools (`saveProperty`, `createDeal`, `navigateTo`)
2. Create frontend renderers for mutation results (`AIMutationConfirmation`, `AINavigationCard`)
3. Wire tool results into `ChatMessage` rendering
4. Add confirmation UX for destructive mutations
5. Test: "Save this property" actually saves it

**Dependencies:** Phase 2 complete (needs page context for entity IDs). Can parallel with Phase 3.
**Risk:** HIGH -- mutation tools need careful permission checking and confirmation UX.

### Phase 5: Real-Time Streaming Upgrade

**Goal:** Replace polling with real-time delta streaming.

1. Create `convex/ai/streaming.ts` with `listThreadMessages` query
2. Replace `useAIChat` action-based polling with `useUIMessages` subscription
3. Add `useSmoothText` for visual typing effect
4. Remove `listMessages` action (replaced by query)
5. Test: Text appears word-by-word during generation

**Dependencies:** Phase 1 complete. Can parallel with Phases 2-4.
**Risk:** MEDIUM -- requires understanding `@convex-dev/agent`'s streaming query API. May need agent package upgrade.

### Phase 6: Investor Summary Page Migration

**Goal:** Replace embedded AI on investor summary page with global panel.

1. Remove `AIChatPanel` from investor summary page
2. Add "Open AI Assistant" button that triggers the global panel with investor context
3. Preserve auto-greeting behavior (trigger on first visit via the panel)
4. Test: Investor summary page still feels complete, AI accessible via panel

**Dependencies:** Phase 1 + Phase 2 complete.
**Risk:** LOW -- straightforward replacement.

### Phase 7: Proactive Nudges (Future)

**Goal:** AI proactively suggests actions based on real-time data changes.

1. Create Convex query that watches for nudge-worthy events (new property matching criteria, deal stage change)
2. Surface nudges as badge on AI toggle button
3. Pre-populate suggested prompt when user opens panel with active nudge
4. Test: Badge appears when new matching property is listed

**Dependencies:** All previous phases.
**Risk:** HIGH -- real-time subscription design for nudges is complex.

---

## Anti-Patterns to Avoid

### 1. Parallel Route for AI Panel

**What:** Using Next.js App Router parallel routes (`@assistant/`) for the panel.
**Why bad:** Forces file-system coupling, makes passing page context awkward (would need URL search params), and adds unnecessary route complexity for what is fundamentally UI state.
**Instead:** React Context + Sheet component. Keep AI panel state in React, not in the URL.

### 2. Separate Thread Per Page

**What:** Creating a new AI thread every time the user navigates to a different page.
**Why bad:** Destroys conversation continuity. User says "tell me about this property" on page A, navigates to page B, loses all context.
**Instead:** Single thread per user. Page context is injected per-call via system prompt, not stored in thread metadata.

### 3. Storing Page Context in Thread

**What:** Saving the current page/route as thread metadata.
**Why bad:** Page context is ephemeral -- it changes with every navigation. Storing it in the database is wasteful and misleading (the stored context would be stale by the next message).
**Instead:** Pass `pageContext` as an argument to each `sendMessage` call. Resolve it fresh on the backend.

### 4. Client-Side Context Resolution

**What:** Fetching all entity data on the frontend and sending it to the backend in the message.
**Why bad:** Exposes data transfer overhead, potential security issues (client could send fake context), and bloats the message payload.
**Instead:** Frontend sends `{ entityType, entityId }`. Backend resolves the full entity data from Convex tables directly.

### 5. Role-Specific Threads

**What:** Creating separate AI threads for each role (investor thread, broker thread).
**Why bad:** Admin users who switch roles would lose context. The AI should be aware of role switches, not siloed.
**Instead:** Single thread with `lastRole` tracking. When role changes, the AI adapts its instructions and tools but keeps conversation history.

### 6. Blocking Panel Open on Data Load

**What:** Waiting for page context to fully resolve before showing the AI panel.
**Why bad:** Adds perceived latency. User clicks the button and nothing happens for 500ms.
**Instead:** Open panel immediately. Show context chip as "loading..." then populate. Messages can be sent without page context (general questions still work).

---

## Key Technical Decisions

### 1. Sheet vs Custom Panel

**Decision:** Use existing `Sheet` component from `src/components/ui/sheet.tsx`.
**Rationale:** Already in the codebase, RTL-aware, animated, accessible. Customizing width from `sm:max-w-sm` (384px) to ~`max-w-md` (448px) is trivial.

### 2. State Management

**Decision:** Dedicated React Context (`AIAssistantProvider`), not zustand/jotai.
**Rationale:** The REOS codebase uses no external state management library. All state is either Convex queries (server state) or React Context/local state. Adding zustand for one feature would be inconsistent. The AI panel state is simple enough (open/closed + pageContext) for Context.

### 3. Thread Model

**Decision:** Keep single thread per user. Do not create conversation-per-session.
**Rationale:** Matches the existing `aiThreads` model. The existing summarization system handles long conversations. Users expect the AI to remember past conversations (per Phase 40 context decisions).

### 4. Mobile UX

**Decision:** Full-screen bottom Drawer, NOT a bottom Sheet with partial height.
**Rationale:** The existing `MobileInvestorSummary` uses a full-height tab for the AI chat. Chat input + keyboard + messages need full viewport height to be usable. Partial sheets create cramped, frustrating chat experiences on mobile.

### 5. Investor Summary Page Migration

**Decision:** Remove embedded AI from investor summary page. Replace with "Chat with AI" button that opens the global panel.
**Rationale:** Having two entry points to the same AI thread (embedded panel + global panel) creates UX confusion. The global panel is the single source of truth.

---

## Sources

- [Convex AI Agents Documentation](https://docs.convex.dev/agents) -- Agent definition, thread sharing, tool creation (HIGH confidence)
- [Convex Agent Context Documentation](https://docs.convex.dev/agents/context) -- contextHandler, contextOptions, cross-thread search (HIGH confidence)
- [Convex Agent Streaming Documentation](https://docs.convex.dev/agents/streaming) -- saveStreamDeltas, useUIMessages, syncStreams (HIGH confidence)
- [Convex Agent Tools Documentation](https://docs.convex.dev/agents/tools) -- createTool, ToolCtx, mutation access (HIGH confidence)
- [@convex-dev/agent npm](https://www.npmjs.com/package/@convex-dev/agent) -- v0.3.2 API surface (HIGH confidence)
- [Convex Agent GitHub](https://github.com/get-convex/agent) -- Multi-agent thread sharing, tool override patterns (HIGH confidence)
- [AI UI Patterns](https://www.patterns.dev/react/ai-ui-patterns/) -- React AI assistant patterns (MEDIUM confidence)
- [Next.js App Router Architecture 2026](https://www.yogijs.tech/blog/nextjs-project-architecture-app-router) -- Server-first, client-islands (MEDIUM confidence)
- REOS Codebase: `src/components/layout/AppShell.tsx` -- Current layout structure (HIGH confidence, verified)
- REOS Codebase: `convex/ai/` -- Current AI implementation (HIGH confidence, verified)
- REOS Codebase: `src/components/ai/` -- Current AI UI components (HIGH confidence, verified)
- REOS Codebase: `src/components/ui/sheet.tsx` -- Sheet component (HIGH confidence, verified)
- REOS Codebase: `src/components/ui/responsive-dialog.tsx` -- Desktop/mobile adaptive pattern (HIGH confidence, verified)
- REOS Codebase: `src/components/ui/drawer.tsx` -- Drawer component (HIGH confidence, verified)
