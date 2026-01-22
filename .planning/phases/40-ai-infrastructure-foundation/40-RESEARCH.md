# Phase 40: AI Infrastructure Foundation - Research

**Researched:** 2026-01-22
**Domain:** AI streaming, memory persistence, context management with Convex
**Confidence:** HIGH

## Summary

This phase establishes the foundational AI infrastructure for the REOS investor assistant. The locked technology decisions from v1.6 research specify `@convex-dev/agent` for thread-based memory persistence and Vercel AI SDK (`ai` + `@ai-sdk/anthropic`) for streaming. Research confirms these are current, well-documented, and integrate well together.

The key technical challenges are:
1. **Streaming Architecture**: Convex Agent supports websocket-based delta streaming (`saveStreamDeltas`) that persists streaming state, enabling resilient multi-client updates without HTTP streaming limitations
2. **Context Management**: Convex Agent provides `recentMessages` (default 100) and hybrid vector/text search, but explicit summarization must be custom-implemented for INFRA-04
3. **Profile Grounding**: The existing `investorQuestionnaires` table contains all investor profile data that needs injection into AI context

**Primary recommendation:** Use `@convex-dev/agent` with `saveStreamDeltas: true` for persistent streaming, implement custom summarization logic triggered when message count exceeds threshold, and inject questionnaire data as system prompt context.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@convex-dev/agent` | ^0.3.2 | Thread-based AI memory, message persistence | Official Convex AI component, handles threads/messages/streaming |
| `ai` | ^6.0.39 | Vercel AI SDK core - streamText, generateText | Industry standard, unified provider interface |
| `@ai-sdk/anthropic` | latest | Claude model provider | Direct Anthropic integration with tool support |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@ai-sdk/react` | latest | useChat hook, React bindings | Phase 41 (chat UI) |
| `zod` | ^4.3.5 (existing) | Schema validation | Already in project, use for tool inputs |

### Already Installed
| Library | Version | Notes |
|---------|---------|-------|
| `@anthropic-ai/sdk` | ^0.71.2 | Direct SDK - can be replaced by `@ai-sdk/anthropic` |
| `convex` | ^1.31.3 | Core Convex - compatible with agent component |

**Installation:**
```bash
npm install @convex-dev/agent ai @ai-sdk/anthropic
```

## Architecture Patterns

### Recommended Project Structure
```
convex/
  convex.config.ts        # Register agent component
  ai/
    agent.ts              # Agent definition with instructions
    threads.ts            # Thread management mutations/queries
    context.ts            # Custom context handlers (profile injection)
    summarization.ts      # Message summarization logic
src/
  lib/
    ai/
      profile-context.ts  # Build profile context from questionnaire
      types.ts            # AI-related TypeScript types
```

### Pattern 1: Agent Definition with Convex
**What:** Define AI agent with model, instructions, and tools in Convex
**When to use:** All AI interactions
**Example:**
```typescript
// convex/ai/agent.ts
import { Agent } from "@convex-dev/agent";
import { anthropic } from "@ai-sdk/anthropic";
import { components } from "../_generated/api";

export const investorAssistant = new Agent(components.agent, {
  name: "Investor Assistant",
  chat: anthropic.chat("claude-sonnet-4-20250514"),
  instructions: `You are a helpful real estate investment assistant for Israeli properties.
You have access to the investor's profile and preferences.
Always be accurate - never make up properties or providers.
Reference the investor's profile when relevant, but don't repeat it unnecessarily.`,
  tools: {}, // Phase 42+ will add property/provider tools
  maxSteps: 5,
});
```

### Pattern 2: Persistent Streaming with Delta Saving
**What:** Stream AI responses while persisting chunks to database
**When to use:** All AI response generation
**Example:**
```typescript
// convex/ai/threads.ts
import { action } from "../_generated/server";
import { v } from "convex/values";
import { investorAssistant } from "./agent";

export const sendMessage = action({
  args: {
    threadId: v.optional(v.string()),
    prompt: v.string(),
  },
  handler: async (ctx, { threadId, prompt }) => {
    // Create or continue thread
    const thread = threadId
      ? await investorAssistant.continueThread(ctx, { threadId })
      : await investorAssistant.createThread(ctx);

    // Stream with delta saving for persistent real-time updates
    const result = await thread.thread.streamText(
      { prompt },
      {
        saveStreamDeltas: {
          chunking: "word",  // Buffer by word for smoother display
          throttleMs: 50,    // Update every 50ms
        }
      }
    );

    return { threadId: thread.threadId, messageId: result.messageId };
  },
});
```

### Pattern 3: Profile Context Injection
**What:** Include investor profile in AI context without it being saved as a message
**When to use:** Every AI call for an investor
**Example:**
```typescript
// convex/ai/context.ts
import { internalQuery } from "../_generated/server";
import { v } from "convex/values";

export const getProfileContext = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const questionnaire = await ctx.db
      .query("investorQuestionnaires")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!questionnaire) return null;

    // Build structured profile context
    return `## Investor Profile
- Citizenship: ${questionnaire.citizenship || "Not specified"}
- Residency: ${questionnaire.residencyStatus || "Not specified"}
- Experience: ${questionnaire.experienceLevel || "Not specified"}
- Owns property in Israel: ${questionnaire.ownsPropertyInIsrael ?? "Not specified"}
- Investment type: ${questionnaire.investmentType || "Not specified"}

## Financial Context
- Budget: $${questionnaire.budgetMin?.toLocaleString() || "?"} - $${questionnaire.budgetMax?.toLocaleString() || "?"}
- Investment horizon: ${questionnaire.investmentHorizon || "Not specified"}
- Goals: ${questionnaire.investmentGoals?.join(", ") || "Not specified"}
- Yield preference: ${questionnaire.yieldPreference || "Not specified"}
- Financing: ${questionnaire.financingApproach || "Not specified"}

## Property Preferences
- Types: ${questionnaire.preferredPropertyTypes?.join(", ") || "Not specified"}
- Locations: ${questionnaire.preferredLocations?.join(", ") || "Not specified"}
- Bedrooms: ${questionnaire.minBedrooms || "?"} - ${questionnaire.maxBedrooms || "?"}
- Area: ${questionnaire.minArea || "?"}sqm - ${questionnaire.maxArea || "?"}sqm
- Amenities: ${questionnaire.preferredAmenities?.join(", ") || "Not specified"}

## Timeline & Services
- Purchase timeline: ${questionnaire.purchaseTimeline || "Not specified"}
- Services needed: ${questionnaire.servicesNeeded?.join(", ") || "Not specified"}
- Additional notes: ${questionnaire.additionalPreferences || "None"}`;
  },
});
```

### Pattern 4: Custom Context Handler for Long Conversations
**What:** Implement summarization when messages exceed threshold
**When to use:** INFRA-04 compliance - maintaining coherent context in 20+ message conversations
**Example:**
```typescript
// convex/ai/agent.ts with contextHandler
export const investorAssistant = new Agent(components.agent, {
  name: "Investor Assistant",
  chat: anthropic.chat("claude-sonnet-4-20250514"),
  instructions: "...",
  contextOptions: {
    recentMessages: 20,  // Keep last 20 verbatim
    // Custom context handler for summarization
  },
  contextHandler: async (ctx, { threadId, messages }) => {
    // If messages exceed threshold, summarize older ones
    const SUMMARIZE_THRESHOLD = 15;
    const KEEP_RECENT = 10;

    if (messages.length <= SUMMARIZE_THRESHOLD) {
      return { messages }; // No summarization needed
    }

    // Get or generate summary of older messages
    const olderMessages = messages.slice(0, -KEEP_RECENT);
    const recentMessages = messages.slice(-KEEP_RECENT);

    const summary = await generateSummary(ctx, olderMessages);

    // Return summary + recent messages
    return {
      messages: [
        { role: "system", content: `Previous conversation summary:\n${summary}` },
        ...recentMessages,
      ],
    };
  },
});
```

### Anti-Patterns to Avoid
- **Saving profile as message:** Profile context should be system prompt injection, not saved messages
- **HTTP streaming without persistence:** Use `saveStreamDeltas` instead of raw HTTP streaming for resilience
- **Token-per-token database writes:** Use chunking/throttling to batch delta saves
- **Ignoring context limits:** Must implement summarization for INFRA-04 compliance
- **Hardcoding model names:** Use constants for easy model switching

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Message persistence | Custom message tables | `@convex-dev/agent` threads | Handles ordering, threading, search, user association |
| Streaming to multiple clients | Custom WebSocket | Agent delta streaming | Websocket sync built-in, handles reconnection |
| AI provider abstraction | Direct Anthropic SDK | Vercel AI SDK | Unified interface, easy provider switching |
| Token counting | Manual estimation | AI SDK tokenization | Accurate counting for context management |
| Message search | Custom full-text | Agent hybrid search | Vector + text search built-in |

**Key insight:** The @convex-dev/agent component solves the hard problems of persistent chat state, multi-client sync, and message search. Focus custom code on business logic (profile injection, summarization strategy) not infrastructure.

## Common Pitfalls

### Pitfall 1: Streaming Without Persistence
**What goes wrong:** Using standard HTTP streaming loses state if connection drops
**Why it happens:** HTTP streaming is familiar from other frameworks
**How to avoid:** Always use `saveStreamDeltas: true` with Convex Agent
**Warning signs:** Client shows partial response after refresh

### Pitfall 2: Context Window Exhaustion
**What goes wrong:** Long conversations fail or lose coherence
**Why it happens:** No summarization implemented, raw message history grows unbounded
**How to avoid:** Implement contextHandler with summarization at ~15 messages
**Warning signs:** Responses become generic, lose earlier context, or API errors

### Pitfall 3: Profile Data in Message History
**What goes wrong:** Profile saved as messages, inflates history, becomes stale
**Why it happens:** Easiest path is adding profile as first message
**How to avoid:** Use contextHandler to inject fresh profile data each call
**Warning signs:** AI references outdated profile info, message count inflated

### Pitfall 4: Missing Convex Config Registration
**What goes wrong:** Agent component doesn't work, cryptic errors
**Why it happens:** Forgot to register component in convex.config.ts
**How to avoid:** Must run `npx convex dev` after config changes
**Warning signs:** "components.agent is undefined" errors

### Pitfall 5: Blocking on Stream Completion
**What goes wrong:** Slow response, typing indicator never shows
**Why it happens:** Awaiting full stream before returning
**How to avoid:** Return immediately, let delta streaming handle updates
**Warning signs:** No progressive text display, all-at-once appearance

## Code Examples

Verified patterns from official sources:

### Convex Config Registration
```typescript
// convex/convex.config.ts
// Source: https://docs.convex.dev/agents/getting-started
import { defineApp } from "convex/server";
import agent from "@convex-dev/agent/convex.config";

const app = defineApp();
app.use(agent);
export default app;
```

### Thread Creation and Message Generation
```typescript
// Source: https://docs.convex.dev/agents/threads
import { createThread, listMessages } from "@convex-dev/agent";
import { components } from "./_generated/api";

// Create thread with user association
const threadId = await createThread(ctx, components.agent, {
  userId: currentUserId,
  title: "Investment Discussion",
});

// List messages with pagination
const messages = await listMessages(ctx, components.agent, {
  threadId,
  paginationOpts: { cursor: null, numItems: 50 },
});
```

### React Hook for Streaming Messages
```typescript
// Source: https://docs.convex.dev/agents/streaming
import { useUIMessages } from "@convex-dev/agent/react";

function ChatMessages({ threadId }: { threadId: string }) {
  const { messages, status } = useUIMessages(threadId, {
    stream: true, // Enable live streaming updates
  });

  return (
    <div>
      {messages.map((msg) => (
        <div key={msg.id}>{msg.content}</div>
      ))}
      {status === "streaming" && <TypingIndicator />}
    </div>
  );
}
```

### API Route for AI SDK (if using Next.js route)
```typescript
// app/api/ai/chat/route.ts - Alternative to Convex action
// Source: https://ai-sdk.dev/docs/getting-started/nextjs-app-router
import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";

export async function POST(req: Request) {
  const { messages, profileContext } = await req.json();

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: `You are an investor assistant.\n\n${profileContext}`,
    messages,
  });

  return result.toDataStreamResponse();
}
```

### Summarization Function
```typescript
// convex/ai/summarization.ts
// Pattern from: https://mem0.ai/blog/llm-chat-history-summarization-guide-2025
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

export async function generateConversationSummary(
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  const { text } = await generateText({
    model: anthropic("claude-3-haiku-20240307"), // Fast model for summarization
    system: `Summarize this conversation, preserving:
- Key decisions made by the investor
- Properties or providers discussed
- Stated preferences and constraints
- Action items or next steps
Keep summary under 500 words.`,
    messages: [
      {
        role: "user",
        content: `Summarize this conversation:\n\n${messages
          .map((m) => `${m.role}: ${m.content}`)
          .join("\n\n")}`,
      },
    ],
  });

  return text;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| HTTP streaming | WebSocket delta streaming | 2025 | Resilient multi-client sync |
| Manual message tables | @convex-dev/agent threads | 2025 | Built-in search, pagination, user association |
| OpenAI-specific code | Vercel AI SDK unified interface | AI SDK 5/6 | Easy provider switching |
| Raw context truncation | Hybrid search + summarization | 2025 | Better long-conversation handling |

**Deprecated/outdated:**
- Direct `@anthropic-ai/sdk` usage - prefer `@ai-sdk/anthropic` for unified interface
- `useChat` internal state management - AI SDK 5+ uses transport-based architecture
- HTTP streaming for persistent chat - use delta streaming for resilience

## Open Questions

Things that couldn't be fully resolved:

1. **Optimal Summarization Threshold**
   - What we know: 15-20 messages before summarization is common practice
   - What's unclear: Optimal threshold for this specific use case with profile injection
   - Recommendation: Start with 15 messages, test with real conversations, adjust based on coherence

2. **Summary Storage Strategy**
   - What we know: Summary can be stored as thread metadata or separate table
   - What's unclear: Whether to re-summarize incrementally or full re-generation
   - Recommendation: Store summary in thread metadata, regenerate when crossing threshold

3. **Profile Update Detection**
   - What we know: User may update profile between conversations
   - What's unclear: Whether to proactively mention changes or wait for relevance
   - Recommendation: Compare profile timestamps, mention if significantly changed (per CONTEXT.md)

## Sources

### Primary (HIGH confidence)
- [Convex AI Agents Docs](https://docs.convex.dev/agents) - Agent setup, threads, streaming, context
- [Convex Agent Getting Started](https://docs.convex.dev/agents/getting-started) - Installation, configuration
- [Convex Agent Streaming](https://docs.convex.dev/agents/streaming) - Delta streaming, saveStreamDeltas
- [Convex Agent Threads](https://docs.convex.dev/agents/threads) - Thread management, persistence
- [Convex Agent Context](https://docs.convex.dev/agents/context) - Context options, recentMessages
- [AI SDK Docs](https://ai-sdk.dev/docs/introduction) - Core concepts, streamText
- [AI SDK Anthropic Provider](https://ai-sdk.dev/providers/ai-sdk-providers/anthropic) - Claude integration
- [AI SDK Next.js Getting Started](https://ai-sdk.dev/docs/getting-started/nextjs-app-router) - Route setup

### Secondary (MEDIUM confidence)
- [AI Chat with HTTP Streaming](https://stack.convex.dev/ai-chat-with-http-streaming) - HTTP streaming pattern
- [AI Agents with Built-in Memory](https://stack.convex.dev/ai-agents) - Memory architecture
- [GitHub: get-convex/agent](https://github.com/get-convex/agent) - README, examples

### Tertiary (LOW confidence)
- Context window management best practices from various blog posts
- Summarization implementation patterns from community resources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official docs, version numbers verified
- Architecture: HIGH - Patterns from official documentation
- Pitfalls: MEDIUM - Mix of docs and community experience
- Summarization: MEDIUM - Pattern validated but threshold needs testing

**Research date:** 2026-01-22
**Valid until:** 2026-02-22 (30 days - stable libraries)
