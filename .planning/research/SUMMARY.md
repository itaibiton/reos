# Project Research Summary

**Project:** REOS v1.6 - AI-Powered Investor Experience
**Domain:** AI assistant integration for real estate investment platform
**Researched:** 2026-01-22
**Confidence:** HIGH

## Executive Summary

The AI Assistant milestone for REOS is a well-scoped integration project, not a greenfield AI build. The existing stack (Next.js 15, Convex, Claude via Anthropic SDK) provides a solid foundation that requires only three additional packages: `@convex-dev/agent` for thread-based memory persistence, `@ai-sdk/anthropic` as the Claude provider, and `ai` (Vercel AI SDK) for streaming UI hooks. The proven pattern in `/convex/search.ts` for Claude integration directly extends to conversational AI without architectural changes.

The recommended approach emphasizes **streaming-first implementation** and **RAG-grounded recommendations**. Users in 2025-2026 expect immediate feedback during AI generation, persistent memory across sessions, and transparent recommendations that explain why properties or providers match their profile. The "dream team builder" concept is a genuine differentiator with no direct competitor implementation, positioning REOS beyond property-only platforms like Zillow and Redfin.

Key risks center on hallucination (AI fabricating property/provider facts), context window mismanagement (degraded responses as conversations grow), and mobile UX (chat interfaces designed desktop-first). All three are preventable with day-one architectural decisions: mandatory database grounding for all factual claims, sliding window plus summarization for memory, and mobile-first component design. The existing Convex real-time subscription pattern directly supports the optimistic update + streaming response flow required for excellent chat UX.

## Key Findings

### Recommended Stack

REOS already has Claude integration via `@anthropic-ai/sdk` ^0.71.2 for search parsing. The addition is minimal: Convex Agent for persistence plus Vercel AI SDK for streaming UI.

**Core technologies:**
- `@convex-dev/agent` (^0.3.2): Thread-based conversation persistence with built-in vector search, WebSocket streaming, automatic retry handling
- `@ai-sdk/anthropic` (^3.0.13): Claude provider for Vercel AI SDK, enables `streamText`/`streamObject` with latest Claude Sonnet 4.5
- `ai` (^6.0.0): Core AI SDK with `useChat` hook for token-by-token streaming UI, framework-agnostic React integration

**What NOT to add:**
- LangChain (overkill, obscures Convex capabilities)
- External vector stores like Pinecone (Convex Agent has built-in vector search)
- Redis/caching layers (Convex handles real-time natively)

### Expected Features

**Must have (table stakes):**
- Profile-based property recommendations with match explanations
- Batch "save all" action for recommended properties
- Conversational interface with natural language Q&A
- Persistent memory across sessions (via Convex)
- Typing indicator and streaming responses
- Mobile tabbed interface (Profile / AI Assistant)

**Should have (differentiators):**
- Dream team builder: 2-3 providers per role with explanations
- Quick reply buttons for common queries
- Inline profile edit from summary view

**Defer (v2+):**
- Proactive new property alerts
- Preference contradiction detection
- Market insights and predictions
- Conversation summarization/search

### Architecture Approach

The architecture follows existing REOS patterns: Convex actions for AI generation (matching `parseSearchQuery`), new tables for conversation persistence (`aiConversations`, `aiMessages`), and queries that combine investor questionnaire data with property/provider matching. Frontend orchestrates action calls after mutations; UI subscribes to real-time message updates.

**Major components:**
1. **Convex Backend** (`/convex/aiAssistant.ts`): Mutations for message handling, actions for AI generation, queries for conversation history
2. **AI Chat Components** (`/components/ai-assistant/`): Chat container, message bubbles, input with streaming, typing indicator, inline property/provider cards
3. **Memory Layer**: Thread-per-user persistence with `aiThreads` table mapping users to Convex Agent threads

### Critical Pitfalls

1. **Dead air during AI response** — Implement streaming from day one. Show typing indicator within 200ms, stream tokens as generated. Time to first visible response must be under 1 second.

2. **Context window explosion** — Use sliding window (last 10-15 messages) plus AI-generated summaries for older context. Treat context as finite resource to budget, not infinite storage.

3. **Hallucinated property facts** — Mandatory RAG grounding: every property/provider statement must cite database records. Validate entity IDs exist before mentioning. Configure Claude to refuse when data unavailable.

4. **Generic recommendations ignoring profile** — Always inject user profile (budget, locations, property types, timeline) into context. Every recommendation query starts with questionnaire fetch.

5. **Mobile chat UX failures** — Design mobile-first: 44px+ touch targets, keyboard-aware layout, voice input option, suggested reply buttons to reduce typing.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: AI Infrastructure Foundation
**Rationale:** Memory architecture and streaming must be designed from day one per pitfall research. Context management patterns are foundational.
**Delivers:** Convex Agent setup, `aiConversations`/`aiMessages` tables, basic thread persistence, streaming action pattern
**Addresses:** Persistent memory, typing indicator (table stakes)
**Avoids:** Dead air pitfall, context window explosion pitfall

### Phase 2: Conversational AI Core
**Rationale:** Basic chat must work before adding recommendations. Establishes streaming UI, error handling, and conversation flow.
**Delivers:** Chat UI components, `useChat` integration, basic Q&A about investor profile and general questions
**Uses:** AI SDK hooks, Convex real-time subscriptions
**Implements:** AiAssistantChat, AiChatMessage, AiChatInput, AiTypingIndicator components

### Phase 3: Property Recommendations
**Rationale:** Recommendations depend on working chat. Profile integration and RAG grounding are prerequisites.
**Delivers:** AI-powered property matching with explanations, inline property cards, "save all" batch action
**Addresses:** Profile-based recommendations, match explanations, batch save (table stakes)
**Avoids:** Hallucination pitfall, generic recommendations pitfall

### Phase 4: Dream Team Builder
**Rationale:** Provider matching builds on property recommendation patterns. Requires chat UI established.
**Delivers:** Role-based provider suggestions (broker, mortgage, lawyer), provider comparison, team composition preview
**Addresses:** Dream team builder (differentiator)
**Avoids:** Provider recommendations without context pitfall

### Phase 5: Investor Summary Page
**Rationale:** Two-panel layout requires all AI components complete. Integration phase.
**Delivers:** Desktop two-panel layout (profile + AI assistant), profile summary with edit access, completeness indicator
**Addresses:** Profile summary display, edit access (table stakes)

### Phase 6: Mobile Experience
**Rationale:** Mobile requires specific interaction patterns after desktop UX validated.
**Delivers:** Tabbed interface (Profile / AI Assistant), keyboard-aware chat input, touch targets, quick reply buttons
**Addresses:** Mobile tabbed interface (table stakes)
**Avoids:** Mobile UX pitfall

### Phase Ordering Rationale

- **Infrastructure before features:** Streaming and memory patterns are referenced by all subsequent phases. Retrofitting is expensive.
- **Chat before recommendations:** Recommendation responses flow through chat UI. Chat must be stable first.
- **Properties before providers:** Provider matching is a variation of property matching with different data. Same pattern, different query.
- **Desktop before mobile:** Validate core UX on desktop where debugging is easier, then adapt mobile-specific patterns.
- **Grouping by dependency:** Each phase produces components used by subsequent phases. No orphan features.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 4 (Dream Team):** Novel feature with no direct competitor reference. May need iteration on matching algorithm and UI presentation.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Infrastructure):** Convex Agent documentation is comprehensive. Verified patterns.
- **Phase 2 (Chat Core):** AI SDK `useChat` is well-documented. Standard streaming pattern.
- **Phase 3 (Property Recommendations):** RAG pattern is established. Existing property data schema is sufficient.
- **Phase 5 (Summary Page):** Standard two-panel responsive layout. Existing Shadcn components.
- **Phase 6 (Mobile):** REOS v1.5 established mobile patterns. Apply to chat components.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Convex Agent and AI SDK versions verified, official docs reviewed, packages actively maintained |
| Features | MEDIUM-HIGH | Industry expectations well-documented; dream team builder is novel but logical extension |
| Architecture | HIGH | Patterns match existing REOS codebase (parseSearchQuery, directMessages), Convex official AI guidance |
| Pitfalls | HIGH | Multiple authoritative sources confirm all critical pitfalls; prevention strategies are established |

**Overall confidence:** HIGH

### Gaps to Address

- **Provider matching algorithm specifics:** Research establishes what to match (service areas, languages, availability) but not optimal ranking/weighting. Address during Phase 4 planning with real provider data.
- **Conversation summarization strategy:** Known as needed for long conversations but exact trigger (message count, token count) and summary format need experimentation. Defer to Phase 1 implementation.
- **Claude model selection:** Sonnet 4.5 recommended for conversation, but may need A/B testing against Haiku for cost optimization. Instrument from day one.

## Sources

### Primary (HIGH confidence)
- [Convex Agents Documentation](https://docs.convex.dev/agents) — Thread memory, streaming, agent setup
- [Convex Agent Getting Started](https://docs.convex.dev/agents/getting-started) — Installation, convex.config.ts
- [Vercel AI SDK](https://ai-sdk.dev/docs/introduction) — useChat, streamText, provider integration
- [AI SDK Anthropic Provider](https://ai-sdk.dev/providers/ai-sdk-providers/anthropic) — Claude model support
- [Claude Platform Docs - Reducing Latency](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-latency) — Streaming best practices

### Secondary (MEDIUM confidence)
- [Convex AI Streaming Patterns](https://stack.convex.dev/gpt-streaming-with-persistent-reactivity) — Dual streaming strategy
- [The Context Window Problem](https://factory.ai/news/context-window-problem) — Memory management patterns
- [LLM Hallucinations Guide 2025](https://www.lakera.ai/blog/guide-to-hallucinations-in-large-language-models) — RAG grounding requirements
- [Ascendix Tech - AI Recommendation System](https://ascendixtech.com/ai-recommendation-system-real-estate/) — Real estate AI expectations
- [ChatBot.com - Real Estate Chatbot](https://www.chatbot.com/blog/real-estate-chatbot/) — Conversational AI best practices

### Tertiary (for reference)
- [AI UI Patterns - patterns.dev](https://www.patterns.dev/react/ai-ui-patterns/) — Streaming UI patterns
- [ParallelHQ - UX for AI Chatbots 2025](https://www.parallelhq.com/blog/ux-ai-chatbots) — Mobile chat design
- [Google PAIR - Explainability & Trust](https://pair.withgoogle.com/chapter/explainability-trust) — Recommendation transparency

---
*Research completed: 2026-01-22*
*Ready for roadmap: yes*
