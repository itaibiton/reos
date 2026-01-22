# Phase 40: AI Infrastructure Foundation - Context

**Gathered:** 2026-01-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish streaming AI responses with persistent memory and profile-aware context. This is infrastructure — the foundation that Phases 41-45 build upon. No chat UI here (that's Phase 41); this phase creates the underlying AI capabilities: streaming responses, memory persistence across sessions, context management for long conversations, and profile grounding.

</domain>

<decisions>
## Implementation Decisions

### Memory behavior
- Fresh start visual + persistent memory: User sees empty chat on return, but AI remembers past discussions
- Acknowledge past context only when directly relevant — no "As we discussed before..." for everything
- Explicit "clear memory" option available for users who want true reset
- History visibility: Claude's discretion on whether/how to expose conversation archive

### Context handling
- Profile data AND explicit decisions (saved properties, selected providers, stated preferences) are NEVER summarized — always in context
- Summarization of other content: Claude's discretion based on relevance
- Proactive transparency: Let user know when older context is being compressed ("I'm focusing on our recent discussion")
- Memory gaps: Always check memory/profile first before admitting something is missing; query storage before saying "I don't remember"

### Streaming feel
- Typing indicator while waiting for first token (animated dots or similar)
- Visible stop button during streaming — user can interrupt immediately
- Streaming speed/smoothing: Claude's discretion on buffering for visual flow
- Structured content (cards, lists) streams progressively with text — everything builds up, not popping in at end

### Profile grounding
- Reference profile when relevant — not for everything, but when it adds value to the response
- Proactively suggest profile updates when data seems outdated or incomplete ("Your budget was set 6 months ago — still accurate?")
- Source citation: Mix based on context — cite explicitly when clarifying, integrate naturally otherwise
- Conflicts: When chat contradicts profile, ask to clarify which is current rather than silently overriding

### Claude's Discretion
- History visibility implementation details
- What specifically gets summarized when context limits approach
- Streaming smoothing/buffering approach
- Exact typing indicator design

</decisions>

<specifics>
## Specific Ideas

- Fresh-start-with-memory model similar to how a good assistant remembers you without showing you transcripts
- Transparency about context management — users should feel informed, not confused when AI seems to forget
- Stop button for streaming is essential — borrowed from ChatGPT/Claude.ai interaction patterns

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 40-ai-infrastructure-foundation*
*Context gathered: 2026-01-22*
