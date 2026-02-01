# Domain Pitfalls: Platform-Wide Super AI Assistant (v1.10)

**Domain:** Adding a context-aware AI assistant side panel with tool-use to an existing real estate SaaS platform
**Researched:** 2026-02-01
**Overall confidence:** HIGH (verified against REOS codebase, Vercel AI SDK docs, OWASP agentic AI top 10, and multiple industry sources)
**Scope:** Pitfalls specific to ADDING a platform-wide assistant to an existing system -- not general chatbot pitfalls (see PITFALLS-AI-ASSISTANT.md for v1.6 basics)

---

## Critical Pitfalls

Mistakes that cause security incidents, rewrites, or broken production experiences.

---

### Pitfall 1: Tool-Use Mutations Without Server-Side Auth Enforcement

**What goes wrong:** The AI assistant can execute write operations (save property, create deal, send message) and the authorization is checked only in the LLM's system prompt ("only do this if the user is an investor") rather than in deterministic server-side code. An attacker crafts a prompt injection through context (e.g., a malicious property description) that tricks the AI into executing mutations on behalf of the wrong user or with elevated privileges.

**Why it happens:** Developers trust the LLM to "understand" authorization rules in the system prompt. The LLM is a text predictor, not a security boundary. The OWASP Top 10 for Agentic AI (released December 2025) lists "Tool Misuse" and "Privilege Compromise" among the top 3 threats. ServiceNow's Now Assist had a real-world exploit in late 2025 where a low-privilege agent was tricked into requesting actions from a higher-privilege agent.

**Consequences:**
- Data exfiltration: AI reads deals/clients belonging to other users
- Unauthorized mutations: AI creates deals or sends messages the user shouldn't be able to
- Privilege escalation: Broker-role AI executes admin-level operations
- Financial data exposure: Investment details, client lists, deal terms leaked across role boundaries

**REOS-specific risk:** The existing system has 8 user roles with different data access scopes. The current AI tools (`searchProperties`, `searchProviders`) are read-only queries with no auth checks -- they run as the agent, not as the user. When adding write tools (save property, create deal, update deal stage), every tool handler MUST independently verify the calling user's identity and permissions.

**Current codebase evidence:**
```
convex/ai/tools/propertySearch.ts:
  - searchPropertiesTool handler calls ctx.runQuery(api.ai.tools.propertyQueries.searchProperties)
  - searchProperties is a public query with NO auth check
  - Returns all available properties regardless of who's asking

convex/ai/tools/providerSearch.ts:
  - Same pattern: public query, no auth verification
  - Returns enriched provider profiles with ratings and deal counts
```

**Prevention:**
1. **Every tool handler must re-verify auth** -- Do not pass `userId` as a tool argument. Instead, extract identity from `ctx.auth.getUserIdentity()` inside each tool handler, exactly as `chat.sendMessage` already does
2. **Implement tool-level RBAC** -- Each tool declares which roles can invoke it (e.g., `createDeal` requires `investor` role; `approveDeal` requires `broker`). Enforce in a wrapper, not in the prompt
3. **Never let the LLM choose privilege levels** -- Authorization decisions must be deterministic code, never LLM output
4. **Separate read tools from write tools** -- Read tools can be `toolChoice: "auto"`. Write tools should require explicit user confirmation in the UI before execution (confirm-first pattern from PROJECT.md)
5. **Log every tool invocation** -- Store tool name, args, userId, timestamp in an audit table for incident investigation

**Detection (warning signs):**
- Tool handlers that accept `userId` as an argument instead of deriving it from auth context
- System prompts containing authorization rules ("only do X for investors")
- Write tools that execute without a preceding user confirmation step
- No audit log of tool invocations

**Which phase should address it:** Phase 1 (tool architecture). The confirm-first pattern for writes and server-side auth enforcement must be the foundation before ANY write tools are added.

**Confidence:** HIGH -- OWASP Agentic AI Top 10, Convex authorization best practices, and ServiceNow exploit are well-documented.

**Sources:**
- [OWASP Top 10 for LLMs 2025](https://www.confident-ai.com/blog/the-comprehensive-guide-to-llm-security)
- [Convex Authorization Best Practices](https://stack.convex.dev/authorization)
- [Agentic AI Security Threats 2025](https://www.lasso.security/blog/agentic-ai-security-threats-2025)
- [LLM Security Risks 2026](https://sombrainc.com/blog/llm-security-risks-2026)

---

### Pitfall 2: Context Injection That Queries Everything on Every Page

**What goes wrong:** The AI assistant is "context-aware" (knows current page, pre-loads relevant data). A naive implementation queries the current page's entity (property, deal, client) PLUS user profile PLUS recent activity PLUS preferences on every page navigation and on every AI panel open -- even if the user never interacts with the AI. This creates expensive Convex queries on every route change that add latency to ALL page loads, not just AI interactions.

**Why it happens:** Developers equate "context-aware" with "always loaded." The instinct is to pre-fetch everything so the AI "knows" the page instantly. But REOS has 30+ distinct page types across roles (properties, deals, clients, dashboards, chat, settings, etc.), each with different data needs.

**Consequences:**
- Every page load triggers 3-5 additional Convex queries just for AI context (even when the user never opens the AI panel)
- Convex bandwidth and function call quotas consumed by unused context fetches
- Token costs increase 2-5x because system prompts balloon with pre-loaded entity data
- Mobile users on slow connections experience noticeable page load delays
- If using Convex `useQuery` subscriptions for context, every data change re-triggers context rebuilds

**REOS-specific risk:** The existing `buildProfileContext` query (in `convex/ai/context.ts`) runs on every AI call -- this is correct. But extending it to also fetch the current property, current deal, current client list, recent notifications, etc. on every page load would be expensive. The existing AppShell renders on every route; putting context fetching there would affect all navigation.

**Prevention:**
1. **Lazy context loading** -- Only fetch page context when the user OPENS the AI panel, not on page load. Use a React state/ref to track panel visibility and conditionally run queries
2. **Route-based context registry** -- Create a registry mapping route patterns to context fetcher functions: `/properties/[id]` fetches property; `/deals/[id]` fetches deal; `/dashboard` fetches summary stats. Only invoke the matched fetcher
3. **Cache context per page visit** -- If the user opens/closes the AI panel multiple times on the same page, do not re-fetch. Use `useMemo` or a context cache keyed by route + entity ID
4. **Tiered context injection** -- Tier 1 (always): user role + name. Tier 2 (on panel open): current page entity. Tier 3 (on first message): deeper data like history, related entities
5. **Measure token cost per route** -- Track average input tokens per AI call, broken down by route. Set alerts for routes that exceed a threshold (e.g., >2000 tokens of context)

**Detection (warning signs):**
- Convex function call count increases proportionally with page navigations (not AI interactions)
- AI system prompts exceeding 3000 tokens before the user even says anything
- Page load Lighthouse scores dropping after AI integration
- `useQuery` calls in the AI context provider firing on routes where users never interact with AI

**Which phase should address it:** Phase 1 (context architecture). Lazy loading and the route-based registry must be designed before the side panel is wired to page data.

**Confidence:** HIGH -- verified against existing REOS codebase patterns and context window cost research.

**Sources:**
- [Hidden Costs of Context Windows](https://brimlabs.ai/blog/the-hidden-costs-of-context-windows-optimizing-token-budgets-for-scalable-ai-products/)
- [Context Engineering Best Practices 2025](https://www.kubiya.ai/blog/context-engineering-best-practices)
- [Context Window Management Strategies](https://www.getmaxim.ai/articles/context-window-management-strategies-for-long-context-ai-agents-and-chatbots/)

---

### Pitfall 3: Side Panel That Breaks AppShell Layout or Page Scrolling

**What goes wrong:** Adding a side panel to the existing `SidebarProvider > AppSidebar + SidebarInset` layout causes: (a) the main content area to shrink and reflow, breaking existing page layouts; (b) double-scroll issues where both the panel and the page scroll independently and confusingly; (c) the AI panel overlapping with the existing left sidebar or header; (d) full-bleed pages (properties, chat) that use `h-[calc(100dvh-4rem)]` breaking when a right-side panel appears.

**Why it happens:** REOS uses shadcn/ui's SidebarProvider which manages a left navigation sidebar with specific width calculations. Adding a RIGHT-side panel is not part of this component's design. The existing full-bleed layout calculates heights based on `100dvh - header(4rem) - optionalTabBar(5rem)`. A slide-in panel that takes 30-40% width changes the available content width, causing grid layouts and responsive breakpoints to shift.

**REOS-specific layout (from AppShell.tsx):**
```
Current AppShell structure:
SidebarProvider
  AppSidebar (left, collapsible, ~256px)
  SidebarInset
    header (sticky top-0, h-16, z-50)
    main (content, pb-20 on mobile for tab bar)
      full-bleed: h-[calc(100dvh-4rem)] / h-[calc(100dvh-4rem-5rem)] mobile
      normal: children with no padding wrapper

MobileBottomNav (fixed bottom-0, z-50, md:hidden, safe-area-bottom)
```

**Consequences:**
- Property grid layouts (currently 1/2/3 columns) reflow incorrectly when content area narrows
- Chat page's quad-layout (dnd-kit drag-and-drop) breaks at unexpected widths
- Double scrollbars appear (page scroll + panel scroll)
- Sticky header z-index conflicts with panel overlay
- Users on 1024px screens see cramped content + cramped panel (both unusable)

**Prevention:**
1. **Overlay pattern, not push pattern** -- On desktop, the AI panel should OVERLAY the content (position absolute/fixed on the right) rather than pushing/shrinking the content area. This avoids ALL content reflow issues
2. **Minimum screen width for side-by-side** -- Only show panel as a side panel on screens >= 1280px (xl breakpoint). On 768-1279px, use a sheet/drawer overlay. On <768px, use the mobile full-screen bottom sheet
3. **Independent scroll contexts** -- The panel must have its own `overflow-y: auto` container. The main content scroll must remain independent. Use `overscroll-behavior: contain` on both to prevent scroll chaining
4. **z-index audit** -- Current z-indexes: header=z-50, MobileBottomNav=z-50. The AI panel must be z-40 (below header) or z-50 with proper stacking context. The panel's backdrop (if any) must not block header interactions
5. **Do NOT modify SidebarInset width** -- The AI panel should be a sibling or child of `SidebarInset`, not a modification of it. Avoid fighting shadcn's sidebar width calculations

**Detection (warning signs):**
- Any CSS that modifies `SidebarInset` width when AI panel is open
- Content reflow visible on 1024px screens
- Scroll position resets when opening/closing the panel
- Property cards changing column count when panel opens
- `ResizeObserver` errors in console

**Which phase should address it:** Phase 1 (panel shell). The layout integration must be resolved before any AI functionality is wired up.

**Confidence:** HIGH -- verified against the actual AppShell.tsx, SidebarProvider patterns, and full-bleed height calculations in the codebase.

---

### Pitfall 4: Mobile AI Panel Conflicting with Bottom Tab Navigation

**What goes wrong:** On mobile, the AI assistant opens as a full-screen bottom sheet, but: (a) the bottom sheet's drag handle conflicts with MobileBottomNav's z-50 fixed position; (b) the AI input field is obscured by the bottom tab bar or iOS keyboard; (c) closing the sheet with a swipe-down gesture conflicts with pull-to-refresh on feed pages; (d) there is no room for a 6th tab (AI) when the existing 5-tab navigation already fills the tab bar.

**Why it happens:** REOS has a carefully designed 5-tab bottom navigation per role (defined in `getMobileTabsForRole`), with a fixed `bottom-0 z-50` nav bar and `safe-area-bottom` padding. The AI trigger needs to coexist with this without displacing any existing tabs. Bottom sheets that extend behind the tab bar or virtual keyboard create overlapping touch targets.

**REOS-specific mobile constraints (from MobileBottomNav.tsx and AppShell.tsx):**
```
- MobileBottomNav: fixed bottom-0 inset-x-0 z-50, 5 tabs per role via getMobileTabsForRole()
- Content: pb-20 (80px padding for tab bar)
- Full-bleed pages: h-[calc(100dvh-4rem-5rem)]
- safe-area-bottom class on nav
- 44px minimum touch targets everywhere
- Pull-to-refresh on feed pages
- Framer Motion activeTab layoutId animation
```

**Consequences:**
- AI input hidden behind keyboard + tab bar (can not type)
- AI panel's close gesture triggers page pull-to-refresh
- Users cannot reach the AI toggle without adding a 6th tab or removing an existing one
- Sheet backdrop does not cover the tab bar, creating a visual gap (known iOS Safari issue)

**Prevention:**
1. **Floating action button (FAB) for AI trigger** -- Not a 6th tab. Place a fixed FAB above the tab bar (bottom: ~90px + safe-area). This is a proven pattern that does not displace existing navigation
2. **Full-screen sheet, not partial** -- On mobile, the AI panel should be a true full-screen overlay (100dvh) that covers the tab bar entirely. Hide MobileBottomNav when AI sheet is open (set a global state/context)
3. **Input above keyboard** -- Use `visualViewport` API or CSS `env(keyboard-inset-height)` to position the AI input. Test with `interactive-widget=resizes-content` viewport meta tag. The existing `100dvh` patterns already account for this
4. **Prevent gesture conflicts** -- On the AI sheet, disable pull-to-refresh by setting `overscroll-behavior-y: contain` on the sheet container. Use sheet's own drag handle area (top 40px) for close gesture
5. **Test with iOS safe areas** -- Ensure `env(safe-area-inset-bottom)` is applied to the AI input container. Be aware of the Next.js known issue where safe-area-inset resets to 0 after client-side navigation

**Detection (warning signs):**
- Users reporting they cannot type in the AI on mobile (input hidden)
- AI panel leaving a gap at the bottom (safe-area issue)
- Pull-to-refresh triggering when scrolling AI chat
- Users asking how to access AI on mobile (cannot find trigger)
- Touch targets overlapping between panel and tab bar

**Which phase should address it:** Phase 1 (mobile shell). Mobile layout must be prototyped and tested before any AI features are connected.

**Confidence:** HIGH -- verified against MobileBottomNav.tsx, AppShell.tsx mobile calculations, and known iOS Safari safe-area issues.

**Sources:**
- [iOS Safe Area Drawer Gap - MUI Issue #46953](https://github.com/mui/material-ui/issues/46953)
- [Next.js safe-area-inset-bottom Bug](https://github.com/vercel/next.js/discussions/81264)
- [Safari iOS Bottom Tab Bars](https://samuelkraft.com/blog/safari-15-bottom-tab-bars-web)

---

### Pitfall 5: Replacing the Investor AI Without Breaking the Summary Page

**What goes wrong:** The v1.6 investor AI assistant is tightly coupled to the investor summary page (`/profile/investor/summary`). It uses `AIChatPanel` with `autoGreet={true}`, custom `QuickReplyButtons`, and role-specific tool calls (`searchProperties`, `searchProviders`). Simply removing this and pointing to the new platform-wide assistant breaks: (a) the auto-greeting flow that recommends properties on first visit; (b) the two-panel layout (profile left, AI right); (c) the `MobileInvestorSummary` tabbed interface; (d) any users who have active conversation threads in the old format.

**Why it happens:** "Replace" sounds simple but the old AI is embedded in multiple places. The new platform-wide assistant will likely have different thread management, different context injection, and different tool sets.

**REOS-specific coupling points (verified in codebase):**
```
1. /profile/investor/summary/page.tsx:
   - Imports AIChatPanel directly
   - Renders in 50% width grid (lg:grid-cols-2)
   - Passes autoGreet={true}
   - Renders QuickReplyButtons inline

2. MobileInvestorSummary.tsx:
   - Tabbed "Profile / AI Assistant" interface
   - Embeds same AIChatPanel

3. src/components/ai/hooks/useAIChat.ts:
   - Manages local message state via useState
   - Optimistic updates for user messages
   - Refetch-on-send pattern (action-based, not reactive)

4. convex/ai/agent.ts:
   - investorAssistant with investor-only instructions + 2 tools
   - System prompt hardcoded for investor role
   - maxSteps: 5, contextOptions: recentMessages: 10

5. convex/ai/chat.ts:
   - sendMessage action with auto-greeting detection
   - Keyword-based tool forcing (wantsProperties, wantsProviders)
   - In-memory AbortController map for stop capability

6. convex/ai/threads.ts:
   - Single thread per user (aiThreads table, indexed by userId, unique)
   - getOrCreateThread returns existing or creates new

7. convex/ai/summarization.ts:
   - Haiku-based summarization with 15-message threshold
   - 500 max_tokens per summarization call
   - Single summary field, no cap on growth

8. convex/ai/messages.ts:
   - listMessages action (not query) with tool result pairing
   - Fetches up to 100 messages per call
```

**Consequences:**
- Removing the old AI breaks the summary page layout (50% of the page goes blank)
- Existing aiThreads data becomes orphaned or incompatible
- Auto-greeting flow is specific to investor role -- new assistant needs to handle all roles
- Users who rely on the summary page AI lose their workflow
- Mobile tabbed interface needs redesign without the embedded AI tab

**Prevention:**
1. **Parallel operation first** -- Keep the old investor AI working on the summary page while building the new platform-wide panel. Do not remove the old one until the new one can fully replace its functionality
2. **Feature flag the transition** -- Use a feature flag to switch between old (embedded AI) and new (side panel AI). This allows gradual rollout and quick rollback
3. **Migrate threads, do not delete** -- When transitioning a user to the new assistant, preserve their conversation history by migrating `aiThreads` data to the new thread format. Or start fresh but keep old data accessible
4. **Preserve auto-greeting for investors** -- The new platform-wide assistant must detect when an investor first visits the summary page and trigger the same auto-greeting behavior (property + provider recommendations). This is role-specific context injection, not generic
5. **Redesign summary page layout** -- The summary page should become full-width profile view (no embedded AI). The AI is now accessible from the global side panel. Add a prominent "Ask AI about your profile" CTA that opens the side panel with profile context pre-loaded

**Detection (warning signs):**
- `/profile/investor/summary` rendering differently after changes
- `useAIChat` hook being imported in both old and new components simultaneously (dual instance)
- Auto-greeting messages not appearing for new investors
- Old thread data being queried but returning null/incompatible format

**Which phase should address it:** Phase 2 (after the new panel shell works). The old AI should keep running until a later phase when the new assistant has feature parity for investors.

**Confidence:** HIGH -- every coupling point verified against the actual codebase files.

**Sources:**
- [SaaS Roadmaps 2026: Prioritizing AI Features](https://itidoltechnologies.com/blog/saas-roadmaps-2026-prioritising-ai-features-without-breaking-product/)

---

## Moderate Pitfalls

Mistakes that cause significant UX degradation or technical debt.

---

### Pitfall 6: Streaming UX That Feels Broken (No True Streaming to UI)

**What goes wrong:** The existing `useAIChat` hook uses an action-based approach (not real-time subscriptions) where messages are refetched AFTER the entire response completes. This means the user sends a message and sees nothing until the full response arrives (3-10 seconds for tool-calling responses). The current `isStreaming` flag triggers a typing indicator, but no actual streamed text appears because the `saveStreamDeltas` feature in the agent writes to internal tables that the frontend does not subscribe to.

**Why it happens:** The current architecture uses Convex `actions` for chat (which do not support reactive subscriptions). The `streamText` with `saveStreamDeltas: true` writes deltas to agent component tables, but `useAIChat` fetches messages via `listMessagesAction` (also an action), creating a non-reactive architecture. The "streaming" label is aspirational -- users see an animated dots indicator but no actual streaming text.

**REOS-specific issue (verified in useAIChat.ts and chat.ts):**
```
Current flow:
1. User sends message -> setIsStreaming(true) -> optimistic user message added
2. sendMessageAction fires (Convex action) -> investorAssistant.streamText()
3. streamText saves deltas to agent internal tables (user never sees them)
4. streamText completes fully (3-10 seconds for tool calls)
5. sendMessageAction returns { success, threadId, response }
6. fetchMessages() refetches all messages via listMessages action
7. setIsStreaming(false) -> show complete response all at once

What users experience: 3-10 seconds of animated dots, then FULL response appears instantly
```

**Consequences:**
- Users think the AI is broken when waiting 5+ seconds with only a typing indicator
- Tool-calling responses (property search + provider search) take 8-15 seconds total
- No way to see partial output or know if the AI is making progress
- Users may retry/refresh, causing duplicate requests
- The `stopGeneration` feature works server-side (AbortController) but the client still blocks on the action call

**Prevention:**
1. **Subscribe to stream deltas** -- The `@convex-dev/agent` stores stream deltas in its internal tables. Use Convex `useQuery` to subscribe to the agent thread's messages, which update reactively as deltas arrive. This is the intended pattern per Convex agent docs
2. **Replace action-based fetching with reactive queries** -- Instead of `listMessagesAction` (action), use a query that reads from the agent component's message table. This enables real-time updates
3. **Show tool execution feedback** -- When the AI calls `searchProperties`, show a "Searching properties..." UI card before results arrive. When `searchProviders` fires, show "Finding providers...". This fills the wait time with meaningful progress
4. **Implement true stop behavior** -- The `AbortController` pattern in `chat.ts` works server-side, but the client needs to also stop waiting on the action. Consider switching to a streaming transport or using Convex's reactive message watching
5. **Skeleton loading for tool results** -- Show property card skeletons while tool calls execute, then populate with real data

**Detection (warning signs):**
- Time from send to first visible AI text exceeds 2 seconds
- Users sending duplicate messages (retry behavior)
- AI responses appearing as one large block (no streaming chunks)
- `isStreaming` flag active for long periods with no visible text change

**Which phase should address it:** Phase 1 (streaming infrastructure). True streaming must be implemented before adding more tools (which make responses even slower).

**Confidence:** HIGH -- verified against the actual `useAIChat.ts` and `chat.ts` implementation. The current architecture demonstrably does not stream text to the UI.

**Sources:**
- [Vercel AI SDK Streaming](https://ai-sdk.dev/docs/ai-sdk-rsc/streaming-react-components)
- [AI SDK Stopping Streams](https://ai-sdk.dev/docs/advanced/stopping-streams)
- [AI SDK Error Handling](https://ai-sdk.dev/docs/ai-sdk-core/error-handling)
- [Vercel AI SDK Abort Signal Issues](https://github.com/vercel/ai/issues/6823)

---

### Pitfall 7: Memory That Grows Unbounded Across Sessions

**What goes wrong:** The current summarization system (`summarization.ts`) uses a threshold of 15 messages before summarizing, keeping 10 recent. But in a platform-wide assistant used across multiple pages and sessions, users could accumulate hundreds of messages per week. The summary itself grows without bound -- each summarization REPLACES the previous summary with a new one covering more messages, but the summary text itself has no cap. After months of use, the summary could be thousands of tokens, defeating its purpose.

**Why it happens:** The current pattern stores a single `summary` string on the `aiThreads` table with a `summarizedMessageCount` number. Each summarization overwrites the previous summary. But there is no: (a) maximum summary length enforcement; (b) periodic cleanup of very old summaries; (c) session-based thread separation (PROJECT.md says "session-based with memory" but current implementation is one thread per user forever).

**REOS-specific issue (verified in threads.ts and summarization.ts):**
```
Current memory model:
- One thread per user (aiThreads, indexed by userId, unique)
- Single summary field (string, no length limit)
- summarizedMessageCount grows monotonically
- Haiku summarization: 500 max_tokens per call, but previous summary NOT included in input
- No session boundaries -- thread persists forever
- clearMemory deletes the entire thread (nuclear option)

PROJECT.md v1.10 spec says:
- "Session-based with memory -- fresh conversation each session"
- "AI remembers preferences from past chats"
```

**Consequences:**
- Summary grows to 1000+ tokens after heavy use, consuming context window budget
- Old, irrelevant context persists (investor discussed Haifa 3 months ago but now prefers Tel Aviv)
- Token costs creep up as summary bloats
- If summary includes outdated preferences, AI gives stale recommendations
- No natural "fresh start" mechanism per session

**Prevention:**
1. **Session-based threads** -- Create a new thread per session (define "session" as a configurable window, e.g., 24 hours of inactivity). Cross-session memory is stored as a separate "preferences" record, not the full summary
2. **Cap summary length** -- Enforce a maximum summary token count (e.g., 500 tokens). When summarizing, include the previous summary in the input and ask the model to produce a CONDENSED version, not an additive one
3. **Separate preferences from conversation memory** -- Extract durable user preferences (preferred cities, budget changes, provider preferences) into a structured `aiUserPreferences` table. These persist across sessions. Conversation summaries only cover the current session
4. **TTL on old threads** -- Archive or delete threads older than 30 days. Users can start fresh but preferences persist
5. **Monitor summary size** -- Track summary token count per user. Alert when any user's summary exceeds threshold

**Detection (warning signs):**
- `summary` field on aiThreads growing beyond 500 words
- AI referencing outdated preferences from months ago
- Input token count per request trending upward over time
- Users complaining AI "remembers wrong things"

**Which phase should address it:** Phase 2 (memory architecture). Session model must be redesigned before launch, as the v1.6 "single thread forever" model does not match the v1.10 spec.

**Confidence:** HIGH -- verified against summarization.ts (500 max_tokens per call, single summary field) and threads.ts (one thread per user, no session boundaries).

**Sources:**
- [LLM Chat History Summarization Guide 2025](https://mem0.ai/blog/llm-chat-history-summarization-guide-2025)
- [Context Window Management Strategies](https://www.getmaxim.ai/articles/context-window-management-strategies-for-long-context-ai-agents-and-chatbots/)
- [The Context Window Problem](https://factory.ai/news/context-window-problem)

---

### Pitfall 8: Proactive Nudges That Annoy Rather Than Help

**What goes wrong:** The AI assistant proactively notifies users about deal stage changes, suggests actions, and surfaces insights -- but these nudges arrive at the wrong time, repeat too frequently, interrupt focused work, or are irrelevant to the user's current task. Studies show that 10% of users turn off apps entirely when notifications are excessive, and 6% uninstall.

**Why it happens:** Developers implement nudges as simple event-driven triggers: "deal stage changed -> show nudge." Without frequency capping, relevance scoring, user preference controls, or timing intelligence, every nudge fires immediately regardless of context.

**REOS-specific risk:** REOS already has a real-time notification system (real-time Convex subscriptions, `getTotalUnreadCount` displayed on chat tab badge). Adding AI-powered proactive nudges creates a SECOND notification channel that can conflict with existing notifications. Example: a deal moves to "mortgage" stage -> existing notification says "Deal moved to mortgage stage" -> AI nudge says "Your deal moved to mortgage stage! Would you like me to suggest mortgage advisors?" -> user gets the same information twice in different formats.

**Consequences:**
- Notification fatigue causes users to disable/ignore AI nudges entirely
- Nudges during focused work (filling out forms, reviewing deals) feel intrusive
- Duplicate information across notification system and AI nudges
- Users perceive AI as "annoying" rather than "helpful"
- Loss of trust in the AI's judgment

**Prevention:**
1. **Frequency cap** -- Maximum 3 proactive nudges per day per user. Reset at midnight
2. **Deduplication with existing notifications** -- Before showing an AI nudge, check if the same event already triggered a notification. If so, suppress the AI nudge or merge it into the notification
3. **Context-aware suppression** -- Do not show nudges when: user is actively typing, user is in the middle of a form, user is on the chat page (already in a conversation), or user has dismissed the last nudge within 5 minutes
4. **User preference controls** -- Allow users to configure nudge types: deal updates, suggestions, insights. Include an "off" option. Default to conservative (fewer nudges)
5. **Nudge as unread badge, not popup** -- Instead of interrupting with a popup, show a dot/badge on the AI FAB indicating "I have something to tell you." User opens panel when ready. This is pull, not push
6. **Start with zero nudges** -- Launch v1.10 with ZERO proactive nudges. Add them one at a time after observing how users interact with the assistant. Measure engagement before adding more

**Detection (warning signs):**
- Users dismissing nudges without reading (click-away rate > 80%)
- AI panel open rate declining after nudge feature launches
- User settings showing most users have disabled nudges
- Support tickets about "too many notifications"

**Which phase should address it:** Phase 3 or later. Proactive nudges should be the LAST feature added, not the first. Get the on-demand assistant working well before adding proactive behavior.

**Confidence:** MEDIUM-HIGH -- general notification research is strong; specific REOS notification deduplication risk is inferred from codebase.

**Sources:**
- [Push Notifications Best Practices 2025](https://upshot-ai.medium.com/push-notifications-best-practices-for-2025-dos-and-don-ts-34f99de4273d)
- [AI-Powered Notifications Design](https://medium.com/design-bootcamp/designing-for-ai-powered-notifications-why-relevance-not-reach-will-win-in-2025-1b1e51fd923e)
- [Proactive AI Nudges Guide](https://www.everafter.ai/glossary/proactive-ai-nudges)
- [Why Users Ignore Notifications](https://blog.logrocket.com/ux-design/notification-blindness-ux-strategies/)

---

### Pitfall 9: Role-Aware Context Leaking Across Role Boundaries

**What goes wrong:** An admin using "View as Broker" sees broker-scoped AI responses, then switches to "View as Investor" and the AI's context still contains broker data from the previous role view. Or worse: the AI assistant's thread contains cross-role context that leaks when a summary includes data from a different role session.

**Why it happens:** REOS has a `viewingAsRole` mechanism for admins (`setViewingAsRole` mutation in `users.ts`). The AI thread is per-user, not per-role. If an admin interacts with the AI as a broker, then switches to investor, the same thread (with broker context in its history/summary) serves the investor view.

**REOS-specific risk (verified in AppShell.tsx):**
```
Admin role-switching flow:
1. Admin sets viewingAsRole = "broker" (via ProviderHeaderContent dropdown)
2. Opens AI, asks about client deals -> AI loads broker context
3. Admin sets viewingAsRole = "investor" (same dropdown)
4. Opens AI -> same thread (single thread per user), summary mentions broker clients
5. Summary leaks broker-specific data into investor context

Also: currentUser?.viewingAsRole ?? currentUser?.role determines effectiveRole
The AI system has no awareness of viewingAsRole currently
```

**Consequences:**
- Data that should be role-scoped appears in wrong context
- AI recommendations corrupted by cross-role context
- In multi-tenant scenarios (if added later), actual data leakage between entities
- Confusing AI behavior when context does not match current role

**Prevention:**
1. **Thread per role** -- Instead of one thread per user, use one thread per (userId, effectiveRole) pair. When role changes, switch to a different thread
2. **Clear context on role switch** -- When `viewingAsRole` changes, reset the AI panel's active context (not the persisted thread, but the runtime system prompt)
3. **Role-scope all tool queries** -- Every tool handler must respect the current `effectiveRole`, not just the user's base role. If `effectiveRole = investor`, tool queries should only return investor-accessible data
4. **Audit admin mode** -- When in admin mode, clearly label AI responses as "Admin View" and warn that context may span roles

**Detection (warning signs):**
- AI mentioning clients or deals from a different role context
- Admin role-switch not clearing AI panel
- Tools returning data that the current effective role should not see

**Which phase should address it:** Phase 1 (thread architecture). The thread-per-role decision must be made before thread creation logic is built.

**Confidence:** HIGH -- verified `viewingAsRole` mechanism in AppShell.tsx and threads.ts (single thread per user).

---

## Minor Pitfalls

Mistakes that cause friction but are fixable post-launch.

---

### Pitfall 10: i18n Not Applied to AI Responses

**What goes wrong:** REOS fully supports Hebrew/RTL via `next-intl`, but the AI responds in English regardless of locale. The AI panel's UI chrome (buttons, headers) is translated but the AI's actual responses are not.

**Why it happens:** The system prompt is written in English. Claude defaults to responding in the language of the prompt. Without explicit locale injection, the AI ignores the user's language preference.

**REOS-specific evidence:** The `investorAssistant` system prompt in `convex/ai/agent.ts` is entirely in English with no locale parameter.

**Prevention:**
1. **Inject locale into system prompt** -- `"Respond in ${locale === 'he' ? 'Hebrew' : 'English'}. Use the same language as the user."`
2. **RTL-safe message bubbles** -- Ensure chat message components use `dir="auto"` or detect RTL content
3. **Tool result labels** -- Property/provider data from tools should be displayed in the UI's locale, not raw from the AI

**Which phase should address it:** Phase 2 (context injection). Easy to add once the system prompt is parameterized.

**Confidence:** HIGH -- verified English-only system prompt in `agent.ts` and `next-intl` usage throughout the codebase.

---

### Pitfall 11: AI Panel State Lost on Navigation

**What goes wrong:** User opens the AI panel, starts a conversation, navigates to a different page, and the panel resets (closes, loses scroll position, re-renders). This happens because the AI panel component unmounts and remounts on route change if it is rendered inside per-page components.

**Why it happens:** If the AI panel is rendered inside `{children}` of the AppShell (per-page), it unmounts on navigation. It must be rendered in the AppShell itself (layout-level) to persist across routes.

**REOS-specific risk:** The current `AIChatPanel` is rendered inside the investor summary page component, not at the layout level. The new platform-wide panel must be a child of `AppShell`, not of individual page components.

**Prevention:**
1. **Render at layout level** -- The AI panel must be a child of `AppShell` (inside `SidebarInset` but outside `{children}`), not of individual pages. This ensures it persists across route changes
2. **Preserve scroll and input state** -- Use a React context or ref to maintain panel open/closed state, scroll position, and draft input across navigations
3. **Do not re-fetch messages on navigation** -- Use a stable Convex query subscription that does not reset when the route changes

**Which phase should address it:** Phase 1 (panel shell). This is an architectural decision that must be correct from the start.

**Confidence:** HIGH -- standard React/Next.js layout pattern, verified against AppShell.tsx structure.

---

### Pitfall 12: Token Cost Surprise from Multi-Tool Responses

**What goes wrong:** The AI auto-greeting currently calls `searchProperties` + `searchProviders` (2 tool calls, 5 max steps). The new platform-wide assistant with more tools (deal lookup, client search, stats query, navigation) could chain 3-5 tool calls per response. Each tool call adds input tokens (tool definition + args + result) to the context. A single "What's happening with my deals?" response could cost 10-20x a simple text response.

**Why it happens:** Tool definitions are included in every API call (adding approximately 200-500 tokens per tool). Tool results are injected back into context for the model to interpret. With 10+ tools defined, the baseline token cost per request increases significantly even before any user message.

**REOS-specific risk:** The current agent has 2 tools (searchProperties, searchProviders). The v1.10 spec calls for tools spanning: deal lookups, client search, statistics, navigation, property save, deal creation, message sending. This could easily be 10-15 tools, each adding 200-500 tokens of definition overhead per request.

**Prevention:**
1. **Dynamic tool loading** -- Only include tool definitions relevant to the current page/role. On the dashboard, include stats tools. On property pages, include property tools. Do not send all 15 tools with every request
2. **Set maxSteps conservatively** -- The current `maxSteps: 5` is already reasonable. For the platform-wide assistant, keep it at 5 or lower. More steps = more API calls per response
3. **Monitor cost per response** -- Track token usage per AI interaction. Set up alerts for responses exceeding cost thresholds
4. **Compress tool results** -- Tool handlers should return minimal data. The current `propertyQueries.ts` already selects specific fields -- maintain this discipline for all new tools

**Which phase should address it:** Phase 2 (tool expansion). Cost monitoring must be in place before adding tools beyond the existing 2.

**Confidence:** MEDIUM -- token cost specifics depend on Claude pricing at time of implementation. General pattern is well-established.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Severity | Mitigation |
|---|---|---|---|
| Panel shell / layout | Breaks AppShell scrolling (P3) | CRITICAL | Overlay pattern, not push; independent scroll contexts |
| Panel shell / mobile | Conflicts with bottom tabs (P4) | CRITICAL | FAB trigger, full-screen sheet, hide tab bar when open |
| Tool architecture | Mutations without auth (P1) | CRITICAL | Server-side auth in every tool handler, confirm-first for writes |
| Context injection | Expensive queries on every page (P2) | CRITICAL | Lazy loading, route-based registry, tiered injection |
| Streaming infrastructure | No actual streaming to UI (P6) | MODERATE | Subscribe to agent deltas, show tool execution feedback |
| Old AI replacement | Investor summary page breaks (P5) | MODERATE | Parallel operation, feature flag, migrate threads |
| Memory / threads | Unbounded summary growth (P7) | MODERATE | Session-based threads, cap summary length, separate preferences |
| Role awareness | Context leak across roles (P9) | MODERATE | Thread per role, clear context on role switch |
| Proactive nudges | Annoying users (P8) | MODERATE | Start with zero nudges, frequency cap, badge not popup |
| i18n | English-only responses (P10) | MINOR | Inject locale into system prompt |
| Navigation | Panel state lost (P11) | MINOR | Render at layout level in AppShell |
| Cost | Token cost explosion (P12) | MINOR | Dynamic tool loading, monitor costs per route |

---

## Pre-Implementation Checklist

Before starting v1.10 development:

- [ ] Decide overlay vs push layout pattern for desktop side panel
- [ ] Decide FAB vs other trigger mechanism for mobile
- [ ] Audit all existing AI files for migration plan (8 files in convex/ai/, 12 in src/components/ai/)
- [ ] Design thread schema: per-user vs per-role vs per-session
- [ ] Design tool auth pattern: how tools verify calling user's identity and role
- [ ] Define confirm-first UX pattern for write tools
- [ ] Plan context registry: which routes provide which context
- [ ] Decide on streaming approach: reactive queries vs action-based polling
- [ ] Define feature flag strategy for old-to-new AI transition
- [ ] Audit z-index layers: header(50), tab bar(50), sidebar, panel
- [ ] Test iOS safe area behavior with Next.js client-side navigation

---

## Sources

**Security and Authorization:**
- [OWASP Top 10 for LLMs and Agentic AI 2025](https://www.confident-ai.com/blog/the-comprehensive-guide-to-llm-security)
- [Convex Authorization Best Practices](https://stack.convex.dev/authorization)
- [Agentic AI Security Threats 2025](https://www.lasso.security/blog/agentic-ai-security-threats-2025)
- [LLM Security Risks 2026](https://sombrainc.com/blog/llm-security-risks-2026)
- [AI Agent Security Best Practices 2025](https://www.glean.com/perspectives/best-practices-for-ai-agent-security-in-2025)

**Context and Cost Management:**
- [Hidden Costs of Context Windows](https://brimlabs.ai/blog/the-hidden-costs-of-context-windows-optimizing-token-budgets-for-scalable-ai-products/)
- [Context Engineering Best Practices](https://www.kubiya.ai/blog/context-engineering-best-practices)
- [Context Window Management Strategies](https://www.getmaxim.ai/articles/context-window-management-strategies-for-long-context-ai-agents-and-chatbots/)
- [LLM Chat History Summarization Guide](https://mem0.ai/blog/llm-chat-history-summarization-guide-2025)

**Streaming and UI:**
- [Vercel AI SDK Stopping Streams](https://ai-sdk.dev/docs/advanced/stopping-streams)
- [AI SDK Streaming React Components](https://ai-sdk.dev/docs/ai-sdk-rsc/streaming-react-components)
- [AI SDK Error Handling](https://ai-sdk.dev/docs/ai-sdk-core/error-handling)
- [Vercel AI SDK Abort Signal Issues](https://github.com/vercel/ai/issues/6823)
- [AI SDK Resume Streams](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-resume-streams)

**Mobile and Layout:**
- [iOS Safe Area Drawer Gap - MUI Issue](https://github.com/mui/material-ui/issues/46953)
- [Next.js safe-area-inset-bottom Bug](https://github.com/vercel/next.js/discussions/81264)
- [Safari iOS Bottom Tab Bars](https://samuelkraft.com/blog/safari-15-bottom-tab-bars-web)

**Notifications and UX:**
- [Push Notifications Best Practices 2025](https://upshot-ai.medium.com/push-notifications-best-practices-for-2025-dos-and-don-ts-34f99de4273d)
- [AI-Powered Notifications Design](https://medium.com/design-bootcamp/designing-for-ai-powered-notifications-why-relevance-not-reach-will-win-in-2025-1b1e51fd923e)
- [Proactive AI Nudges](https://www.everafter.ai/glossary/proactive-ai-nudges)
- [How to Design an AI Assistant That Actually Helps](https://medium.muz.li/how-to-design-an-ai-assistant-users-actually-use-81b0fc7dc0ec)

**Feature Migration:**
- [SaaS Roadmaps 2026: Prioritizing AI Features](https://itidoltechnologies.com/blog/saas-roadmaps-2026-prioritising-ai-features-without-breaking-product/)
- [Why Most SaaS AI Features Fail](https://verycreatives.com/blog/why-most-saas-ai-features-fail)
