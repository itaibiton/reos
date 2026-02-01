# Project Research Summary

**Project:** REOS v1.10 — Platform-Wide Super AI Assistant
**Domain:** Context-aware AI assistant side panel for multi-role real estate investment SaaS
**Researched:** 2026-02-01
**Confidence:** HIGH

## Executive Summary

REOS v1.10 transforms an existing investor-only AI chat (embedded on a single page, action-based polling, 2 read-only tools) into a platform-wide context-aware assistant side panel serving all 5 roles (investor, broker, mortgage advisor, lawyer, admin). The critical finding across all four research dimensions is that **zero new npm packages are required**. The existing stack -- `@convex-dev/agent@0.3.2`, `ai@5.0.123`, `@ai-sdk/anthropic@2.0.57`, Shadcn Sheet/Drawer, and Convex scheduled functions -- provides everything needed. The work is entirely architectural: generalizing the single-role agent into a role-aware agent with dynamic tool sets, migrating from action-based polling to real-time streaming via `useUIMessages`, building a responsive side panel in the AppShell layout, and adding page-context injection and write-capable mutation tools.

The recommended approach is a phased build starting with the panel shell and streaming infrastructure (no backend changes needed to get the panel rendering), then layering in context awareness and multi-role support, followed by mutation tools and differentiating features. This order is dictated by a clear dependency chain: the global panel must exist before context can be injected, context must work before page-specific actions make sense, and multi-role support must be in place before role-specific tools are added. The architecture uses a single `platformAssistant` agent with role-specific system prompts and conditional tool sets injected at call time, rather than separate agents per role -- this preserves conversation continuity and simplifies maintenance.

The top risks are: (1) **tool-use mutations without server-side auth** -- every write tool must independently verify user identity and role via `ctx.auth`, never trust the LLM to enforce authorization; (2) **context injection that queries on every page load** -- page context must be lazy-loaded only when the panel opens, not on navigation; (3) **side panel breaking the existing AppShell layout** -- use an overlay (Sheet) pattern, not a push pattern that would reflow content; (4) **mobile panel conflicting with the 5-tab bottom navigation** -- use a FAB trigger and full-screen drawer that hides the tab bar. A hard version constraint exists: `@convex-dev/agent@0.3.2` requires `ai@^5.0.29` and does NOT support AI SDK 6 (tracked in GitHub issue #202). Upgrading to `ai@6.x` will produce 53+ build errors.

## Key Findings

### Recommended Stack

**No new packages. No version upgrades (except optional Convex patch bump).** The entire feature set builds on what is already installed and working. The existing `@convex-dev/agent` provides agent definition, thread management, tool calling (`createTool` with `ActionCtx` including `runMutation`), real-time streaming (`saveStreamDeltas` + `useUIMessages` + `syncStreams`), and memory persistence. The existing Shadcn Sheet and Vaul Drawer handle the responsive panel UI. Convex `ctx.scheduler.runAfter()` handles proactive nudge scheduling. See [STACK.md](./STACK.md) for complete analysis.

**Core technologies (all existing):**
- `@convex-dev/agent@0.3.2`: Agent framework -- multi-role agent, tool calling, streaming, thread memory
- `ai@5.0.123`: AI SDK core -- DO NOT upgrade to 6.x (breaks build)
- `@ai-sdk/anthropic@2.0.57`: Claude Sonnet 4 for conversations, Haiku for summarization
- Shadcn `Sheet` + Vaul `Drawer`: Side panel UI (desktop overlay / mobile full-screen)
- Convex scheduled functions: Event-driven proactive nudges via existing notification system

**Critical version constraint:** Stay on `ai@5.0.123`. The `@convex-dev/agent` peer dependency is `ai@^5.0.29`. AI SDK 6 support is not yet available.

### Expected Features

See [FEATURES-AI-SIDEPANEL.md](./FEATURES-AI-SIDEPANEL.md) for detailed feature landscape.

**Must have (table stakes):**
- TS-01: Global side panel (Sheet desktop, Drawer mobile) -- foundational, everything depends on it
- TS-02: Context awareness (current page/entity injected at send-time) -- transforms generic chatbot into smart assistant
- TS-03: Multi-role support (5 roles with role-specific prompts, tools, context) -- without this only investors benefit
- TS-04/05/06: Streaming, memory, rich responses -- already built, carry forward
- TS-07: Quick actions / suggested prompts -- reduces blank-prompt paralysis, 70% of queries are contextual
- TS-08/09: Error handling + accessibility -- production readiness
- TS-10: Mobile-responsive design -- FAB trigger, full-screen drawer, keyboard handling

**Should have (differentiators):**
- DIFF-01: Page-specific quick actions (save property, start deal from context) -- the "wow" moment
- DIFF-06: Multilingual (English + Hebrew) -- fundamental for US-Israel investment platform
- DIFF-07: AI-powered navigation ("take me to my deals") -- quick win, high utility
- DIFF-08: Feedback loop (thumbs up/down, regenerate) -- low effort, high signal

**Defer (post-milestone):**
- DIFF-02: Proactive nudges -- requires UX tuning, risk of notification fatigue; launch with zero nudges
- DIFF-03: Slash commands -- nice-to-have for power users
- DIFF-04: Cross-entity intelligence -- requires many new tools, add incrementally
- DIFF-05: Conversation threading -- single thread is fine for MVP

**Anti-features (do NOT build):**
- Autonomous agent actions without user confirmation (liability risk, Air Canada lawsuit precedent)
- General-purpose chatbot (domain-constrained to REOS and real estate)
- AI settings page with model selection (engineering vanity feature)
- Pre-fetched AI responses on page load (wastes tokens, annoys users)
- Voice input (marginal ROI for this domain)

### Architecture Approach

The platform-wide assistant integrates into the existing AppShell as a Sheet/Drawer overlay managed by a dedicated `AIAssistantProvider` React Context, rendering at the layout level (not per-page) to persist across route changes. The backend evolves from a single `investorAssistant` to a `platformAssistant` with role-specific instruction configs and conditional tool sets. Context flows from client to backend as `{ entityType, entityId }` -- the backend resolves full entity data from Convex, preventing client-side data spoofing. Streaming upgrades from action-based polling to reactive `useUIMessages` subscriptions for real-time token-by-token display. See [ARCHITECTURE-PLATFORM-AI.md](./ARCHITECTURE-PLATFORM-AI.md) for component tree, data flows, and build order.

**Major components:**
1. `AIAssistantProvider` -- React Context managing panel state, page context tracking, keyboard shortcuts; split into state/dispatch contexts to prevent re-renders
2. `AIAssistantPanel` -- Responsive panel (Sheet desktop, Drawer mobile) wrapping chat UI with context chip, suggested prompts, and message list
3. `platformAssistant` agent -- Single Convex Agent with role-injected system prompts and conditional tool sets per invocation
4. `convex/ai/contextResolvers/` -- Route-based registry mapping URL patterns to entity data fetchers (lazy-loaded on panel open only)
5. `convex/ai/streaming.ts` -- Backend query wrapping `listUIMessages` + `syncStreams` for real-time subscriptions
6. Mutation tools -- Write-capable tools (`saveProperty`, `createDeal`, `navigateTo`) with server-side auth enforcement and confirm-first UX

### Critical Pitfalls

See [PITFALLS-SUPER-AI-ASSISTANT.md](./PITFALLS-SUPER-AI-ASSISTANT.md) for all 12 pitfalls with prevention strategies.

1. **Tool mutations without server-side auth (CRITICAL)** -- Never trust LLM to enforce authorization. Every tool handler must call `ctx.auth.getUserIdentity()` independently. Write tools require explicit user confirmation in UI before execution. Log all tool invocations to audit table.
2. **Context injection querying everything on every page (CRITICAL)** -- Lazy-load page context only when panel opens. Use route-based registry for targeted queries. Tiered injection: role always, entity on panel open, deep data on first message.
3. **Side panel breaking AppShell layout (CRITICAL)** -- Use overlay Sheet pattern, not content-pushing. Independent scroll contexts with `overscroll-behavior: contain`. No modifications to SidebarInset width calculations.
4. **Mobile panel conflicting with bottom tabs (CRITICAL)** -- FAB trigger above tab bar, full-screen drawer that hides MobileBottomNav, `env(safe-area-inset-bottom)` on AI input container.
5. **Replacing investor AI without breaking summary page (MODERATE)** -- Run old and new AI in parallel during transition. Feature flag the switch. Preserve auto-greeting flow for investors. Redesign summary page to full-width with "Open AI" CTA.

## Implications for Roadmap

Based on combined research, the dependency chain dictates a 6-phase structure. The first four phases are the core milestone; the latter two are extensions.

### Phase 1: Panel Shell + Streaming Infrastructure

**Rationale:** The global panel is the foundation everything depends on (every feature, every pitfall mitigation requires the panel to exist). Streaming must be fixed early because the current implementation has no true token streaming to the UI -- users see animated dots for 3-10 seconds then the full response appears. Adding more tools later will make this worse. These are independent of backend role/context changes and can ship as a pure upgrade.

**Delivers:** AI assistant accessible from any page via header button and Cmd+J shortcut. Desktop Sheet overlay, mobile full-screen Drawer with FAB trigger. Real-time token-by-token streaming via `useUIMessages`. Panel persists across route changes (layout-level rendering).

**Features addressed:** TS-01 (Global Panel), TS-04 (Streaming upgrade), TS-05 (Memory carry-forward), TS-06 (Rich Responses carry-forward), TS-10 (Mobile Responsive)

**Pitfalls mitigated:** P3 (layout breaking -- overlay pattern), P4 (mobile tab conflicts -- FAB + full-screen), P6 (no true streaming -- useUIMessages), P11 (panel state lost -- layout-level render)

**Stack elements:** Shadcn Sheet, Vaul Drawer, `useUIMessages` from `@convex-dev/agent/react`, `syncStreams`, `useSmoothText`

### Phase 2: Context Awareness + Suggested Prompts

**Rationale:** Context transforms the assistant from a generic chatbot into a smart copilot. Research shows 70% of user queries are contextual questions about what they are looking at. This phase makes the assistant genuinely useful before expanding to multiple roles or adding write tools.

**Delivers:** Assistant knows which page/entity the user is viewing. Context chip in panel header shows current context. Role+page-aware suggested prompts appear on empty state. Locale-aware responses (Hebrew/English). Feedback thumbs up/down on messages.

**Features addressed:** TS-02 (Context Awareness), TS-07 (Quick Actions / Suggested Prompts), TS-08 (Error Handling), TS-09 (Accessibility), DIFF-08 (Feedback Loop)

**Pitfalls mitigated:** P2 (expensive context queries -- lazy loading + route registry), P10 (i18n -- locale in system prompt)

**Stack elements:** `usePathname()`, `convex/ai/contextResolvers/`, extended `buildPageContext()`, `next-intl` locale injection

### Phase 3: Multi-Role Agent + Role-Specific Tools

**Rationale:** With the panel and context working for investors, extend to all 5 roles. This is high complexity because each role needs its own instruction set, tool palette, and context builder. Must be done before mutation tools because write permissions are role-dependent.

**Delivers:** Broker, mortgage advisor, lawyer, and admin roles each get tailored AI experience. Role-specific system prompts, tool sets, and context injection. Admin `viewingAsRole` properly scoped.

**Features addressed:** TS-03 (Multi-Role Support), DIFF-06 (Multilingual per-role prompts)

**Pitfalls mitigated:** P9 (role context leaking -- thread-per-role or context clearing on switch), P12 (token cost -- dynamic tool loading per role)

**Stack elements:** Role-specific instruction configs in `convex/ai/agents/`, conditional tool registration, `effectiveRole` from `useCurrentUser()`

### Phase 4: Mutation Tools + Action Execution

**Rationale:** With roles and context in place, the assistant can now execute actions. This is the "wow" moment -- "Save this property" actually saves it. Requires careful auth enforcement (Pitfall 1) and confirm-first UX pattern.

**Delivers:** Write-capable tools (save property, create deal, navigate to page). Confirmation cards in chat UI. Tool invocation audit logging. Navigation tool returns clickable links.

**Features addressed:** DIFF-01 (Page-Specific Actions), DIFF-07 (AI Navigation)

**Pitfalls mitigated:** P1 (tool auth -- server-side enforcement in every handler, confirm-first UX)

**Stack elements:** `createTool` with `ctx.runMutation`, `AIMutationConfirmation` component, `AINavigationCard` component

### Phase 5: Investor Summary Page Migration

**Rationale:** Only after the new assistant has full feature parity for investors (panel + context + tools + streaming) should the old embedded AI be removed. This avoids breaking the existing investor experience during development.

**Delivers:** Investor summary page redesigned to full-width profile view. "Open AI Assistant" CTA opens the global panel with investor context pre-loaded. Auto-greeting preserved via panel. Old `useAIChat` hook and `AIChatPanel` embedding removed.

**Features addressed:** Migration from v1.6 to v1.10 AI

**Pitfalls mitigated:** P5 (breaking summary page -- parallel operation, feature flag, graceful transition)

### Phase 6: Proactive Nudges (Post-Core)

**Rationale:** Research is unanimous: launch with zero proactive nudges. Get the on-demand assistant working well first. Nudges are high risk for notification fatigue and require careful UX tuning. Add only after observing real user interaction patterns.

**Delivers:** Event-driven nudges via `ctx.scheduler.runAfter()` writing to notifications table. Badge indicator on AI toggle button. Frequency capping (max 3/day). Deduplication with existing notification system.

**Features addressed:** DIFF-02 (Proactive Nudges)

**Pitfalls mitigated:** P8 (annoying users -- badge not popup, frequency cap, start conservative)

### Phase Ordering Rationale

- **Dependency chain is deterministic:** Panel must exist (Phase 1) before context can be injected (Phase 2). Context must work before role-specific tools make sense (Phase 3). Auth patterns must be established before mutation tools (Phase 4). Feature parity must be proven before removing old AI (Phase 5).
- **Streaming first, not last:** The current non-streaming UX gets worse with each new tool added (more tool calls = longer wait with no feedback). Fixing this in Phase 1 prevents compounding UX debt.
- **Multi-role before mutations:** Write permissions are role-dependent. The auth enforcement pattern must be designed with roles in mind, not retrofitted.
- **Migration last:** Parallel operation of old and new AI avoids breaking the investor workflow during the entire development cycle.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3 (Multi-Role Agent):** Needs research on optimal instruction design per role, tool selection strategy, and how to handle admin `viewingAsRole` thread isolation. The single-agent-with-role-injection pattern is documented but not commonly used at 5-role scale.
- **Phase 4 (Mutation Tools):** Needs research on confirm-first UX patterns for chat-based actions. The tool auth enforcement pattern needs a concrete design before implementation.
- **Phase 6 (Proactive Nudges):** Needs research on nudge trigger conditions, deduplication with existing notifications, and frequency tuning. Sparse documentation for real estate-specific nudge design.

Phases with standard patterns (skip deep research):
- **Phase 1 (Panel Shell + Streaming):** Well-documented patterns -- Shadcn Sheet, `useUIMessages`, responsive panel layout. The Convex Agent streaming docs cover the exact migration path.
- **Phase 2 (Context Awareness):** Straightforward extension of existing `buildProfileContext` pattern. Route-based context registry is a standard React pattern.
- **Phase 5 (Migration):** Standard component refactoring -- remove embedding, add CTA button, feature flag.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Zero new packages needed. All versions verified against installed `package.json` and npm peer deps. AI SDK 6 incompatibility confirmed via GitHub issue #202. |
| Features | HIGH | Feature landscape validated against Microsoft Copilot, AppFolio Realm-X, GitHub Copilot, Notion AI, and 20+ SaaS AI assistant references. Anti-features backed by failure case studies. |
| Architecture | HIGH | Component tree, data flows, and integration points verified against actual REOS codebase (AppShell.tsx, convex/ai/, src/components/ai/). Patterns confirmed in Convex Agent official docs. |
| Pitfalls | HIGH | 4 critical pitfalls verified against codebase (auth gaps in existing tools, AppShell layout calculations, MobileBottomNav constraints, investor page coupling). Security pitfalls backed by OWASP Agentic AI Top 10. |

**Overall confidence:** HIGH

### Gaps to Address

- **Thread model for role switching:** Research identifies the problem (admin `viewingAsRole` leaking context) but the optimal solution (thread-per-role vs. context-clearing vs. role-scoped summaries) needs design validation during Phase 3 planning.
- **Session vs. persistent threads:** PROJECT.md specifies "session-based with memory" but current implementation is single-thread-forever. The exact session boundary definition (time-based? explicit? per-login?) needs product decision.
- **`useSmoothText` integration:** Documented in Convex Agent docs but not yet used in this codebase. Needs integration testing during Phase 1.
- **Confirm-first UX for mutation tools:** The pattern is clear (show preview, require confirmation) but the exact UI component design needs prototyping during Phase 4.
- **Token cost monitoring:** No current infrastructure for tracking per-request token costs. Needs instrumentation during Phase 3 when tool count increases.

## Sources

### Primary (HIGH confidence)
- [Convex Agent Documentation](https://docs.convex.dev/agents) -- Agent definition, streaming, tools, context, threads
- [Convex Agent Streaming](https://docs.convex.dev/agents/streaming) -- `useUIMessages`, `syncStreams`, `saveStreamDeltas`, `useSmoothText`
- [Convex Agent GitHub](https://github.com/get-convex/agent) -- Issue #202 (AI SDK 6 incompatibility), multi-agent patterns
- [@convex-dev/agent@0.3.2 npm](https://www.npmjs.com/package/@convex-dev/agent) -- Peer dependency verification
- [OWASP Top 10 for Agentic AI 2025](https://www.confident-ai.com/blog/the-comprehensive-guide-to-llm-security) -- Tool misuse, privilege compromise
- REOS Codebase: `convex/ai/`, `src/components/ai/`, `src/components/layout/AppShell.tsx` -- Verified integration points

### Secondary (MEDIUM-HIGH confidence)
- [Microsoft Copilot Architecture](https://learn.microsoft.com/en-us/copilot/overview) -- Context-aware side panel patterns
- [AppFolio Realm-X](https://www.appfolio.com) -- PropTech AI copilot reference (500K messages in 30 days)
- [AI Assistant UX Patterns 2026](https://www.orbix.studio/blogs/ai-driven-ux-patterns-saas-2026) -- Side panel, proactive nudges, contextual prompts
- [Hidden Costs of Context Windows](https://brimlabs.ai/blog/the-hidden-costs-of-context-windows-optimizing-token-budgets-for-scalable-ai-products/) -- Token budget optimization
- [Agentic AI Security Threats 2025](https://www.lasso.security/blog/agentic-ai-security-threats-2025) -- Tool auth enforcement patterns

### Tertiary (MEDIUM confidence)
- [Push Notifications Best Practices 2025](https://upshot-ai.medium.com/push-notifications-best-practices-for-2025-dos-and-don-ts-34f99de4273d) -- Nudge frequency capping
- [iOS Safe Area Drawer Issues](https://github.com/mui/material-ui/issues/46953) -- Mobile panel edge cases
- [AI Chatbot Failures](https://research.aimultiple.com/chatbot-fail/) -- Anti-feature validation

---
*Research completed: 2026-02-01*
*Ready for roadmap: yes*
