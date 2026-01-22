# Technology Stack: AI Assistant & Recommendations

**Project:** REOS AI Chat Assistant & Property/Provider Recommendations
**Researched:** 2026-01-22
**Overall Confidence:** HIGH

## Executive Summary

REOS already has a solid foundation with `@anthropic-ai/sdk` ^0.71.2 for Claude integration used in search parsing. For the AI chat assistant with persistent memory, the recommended approach is to use the **Convex Agent component** (`@convex-dev/agent`) which provides thread-based memory persistence, streaming via WebSockets, and seamless integration with your existing Convex backend. For richer streaming UI experiences, add the **Vercel AI SDK** with `@ai-sdk/anthropic` provider.

**Key decision:** Use Convex Agent for persistence layer + AI SDK for streaming UI, not either/or.

---

## What You Already Have (DO NOT RE-ADD)

| Technology | Version | Current Use | Ready For AI Assistant |
|------------|---------|-------------|------------------------|
| `@anthropic-ai/sdk` | ^0.71.2 | Search query parsing | YES - direct Claude API calls |
| `convex` | ^1.31.3 | Backend, real-time | YES - will host Agent component |
| `zod` | ^4.3.5 | Schema validation | YES - for AI tool definitions |
| `framer-motion` | ^12.26.2 | Animations | YES - typing indicators, message animations |

**Existing Claude integration (convex/search.ts):**
- Uses `claude-3-haiku-20240307` for NLP search parsing
- Pattern: Convex action calls Anthropic SDK directly
- No streaming, simple request/response

---

## Recommended Stack Additions

### Core AI Infrastructure

| Package | Version | Purpose | Rationale |
|---------|---------|---------|-----------|
| `@convex-dev/agent` | ^0.3.2 | Thread & message persistence, agent orchestration | Native Convex integration, handles memory automatically, WebSocket streaming to all clients, vector search for context retrieval |
| `@ai-sdk/anthropic` | ^3.0.13 | Vercel AI SDK provider for Claude | Unified streaming API, works with `streamText`/`streamObject`, integrates with React hooks |
| `ai` | ^6.0.0 | Vercel AI SDK core | Framework-agnostic hooks (`useChat`, `useCompletion`), seamless streaming UI |

### Why These Versions (Verified 2026-01-22)

- **@convex-dev/agent 0.3.2**: Latest stable, published ~2 months ago. Includes WebSocket delta streaming, thread persistence, vector search.
- **@ai-sdk/anthropic 3.0.13**: Latest, published hours ago. Supports Claude Sonnet 4.5 and reasoning models.
- **ai 6.0.0**: Major version with ToolLoopAgent, human-in-the-loop control, improved streaming.

---

## What NOT to Add (and Why)

| Package | Why NOT |
|---------|---------|
| `langchain` / `@langchain/anthropic` | Overkill. Convex Agent + AI SDK provides everything needed without the complexity. LangChain adds abstraction layers that obscure Convex's native capabilities. |
| `pinecone` / `weaviate` / `chromadb` | Unnecessary. Convex Agent has built-in vector search. Your data is already in Convex - no need for external vector store sync complexity. |
| `@convex-dev/persistent-text-streaming` | Redundant. Convex Agent includes persistent streaming. Adding both creates duplication. |
| `redis` / `memcached` | No external caching needed. Convex handles real-time subscriptions natively. |
| `@anthropic-ai/claude-agent-sdk` | Different purpose - that's for building autonomous code agents (like Claude Code). Your use case is conversational assistant, not code execution agent. |
| `openai` | You're already using Claude. Switching or dual-provider adds complexity without benefit. |

---

## Integration Architecture

### How Components Work Together

```
Frontend (React)                    Backend (Convex)
    |                                    |
    | useChat() from AI SDK              |
    |--------------------------------->  | HTTP Action (streaming)
    |                                    |    |
    | WebSocket subscription             |    v
    |<-------------------------------    | Agent.generateText()
    |                                    |    |
    | Real-time message updates          |    v
    |<-------------------------------    | Thread persistence
                                         | (automatic via Convex Agent)
```

### Dual Streaming Strategy

1. **HTTP Streaming (initial response)**: AI SDK `streamText` for immediate token-by-token display
2. **WebSocket Streaming (persistence)**: Convex Agent saves deltas, syncs to all clients
3. **Persistence**: Messages automatically stored in threads, available after page reload

**Why dual?**
- HTTP streaming: Best latency for initial response
- WebSocket: Multi-device sync, page reload resilience, other tabs see updates

---

## Convex Agent Setup

### Step 1: Install Packages

```bash
npm install @convex-dev/agent @ai-sdk/anthropic ai
```

### Step 2: Create convex.config.ts

```typescript
// convex/convex.config.ts (NEW FILE)
import { defineApp } from "convex/server";
import agent from "@convex-dev/agent/convex.config";

const app = defineApp();
app.use(agent);

export default app;
```

### Step 3: Generate Component Types

```bash
npx convex dev
```

This generates types for `components.agent` before defining Agents.

### Step 4: Define the Investor Assistant Agent

```typescript
// convex/aiAssistant.ts (NEW FILE)
import { Agent, createTool } from "@convex-dev/agent";
import { anthropic } from "@ai-sdk/anthropic";
import { components, internal } from "./_generated/api";
import { z } from "zod";

export const investorAssistant = new Agent(components.agent, {
  name: "REOS Investor Assistant",
  model: anthropic("claude-sonnet-4-5-20250929"),
  instructions: `You are a helpful real estate investment assistant for REOS, a platform
connecting international investors with Israeli real estate opportunities.

Your capabilities:
- Answer questions about the Israeli real estate market
- Help investors find properties matching their criteria
- Recommend service providers (brokers, mortgage advisors, lawyers)
- Explain the investment process and requirements

Always be helpful, accurate, and considerate of the investor's preferences stored
in their questionnaire. If you don't know something, say so.`,
  tools: {
    searchProperties: createTool({
      description: "Search properties matching investor criteria",
      parameters: z.object({
        city: z.string().optional().describe("Israeli city name"),
        priceMin: z.number().optional().describe("Minimum price in USD"),
        priceMax: z.number().optional().describe("Maximum price in USD"),
        propertyType: z.enum(["residential", "commercial", "mixed_use", "land"]).optional(),
        bedroomsMin: z.number().optional(),
      }),
      handler: async (ctx, params) => {
        return await ctx.runQuery(internal.properties.list, params);
      },
    }),

    getInvestorProfile: createTool({
      description: "Get the current investor's preferences and questionnaire data",
      parameters: z.object({}),
      handler: async (ctx) => {
        // ctx.userId is available from Agent context
        return await ctx.runQuery(internal.investorQuestionnaires.getByUser);
      },
    }),

    findProviders: createTool({
      description: "Find service providers matching criteria",
      parameters: z.object({
        providerType: z.enum(["broker", "mortgage_advisor", "lawyer"]),
        serviceArea: z.string().optional().describe("City/area they should cover"),
        languages: z.array(z.string()).optional(),
      }),
      handler: async (ctx, params) => {
        return await ctx.runQuery(internal.serviceProviderProfiles.search, params);
      },
    }),

    getPropertyDetails: createTool({
      description: "Get full details about a specific property",
      parameters: z.object({
        propertyId: z.string().describe("The property ID"),
      }),
      handler: async (ctx, { propertyId }) => {
        return await ctx.runQuery(internal.properties.get, { id: propertyId });
      },
    }),
  },
  maxSteps: 5, // Limit tool call iterations for cost control
});
```

---

## Memory Persistence Pattern

### Thread-Based Memory (Convex Agent's Approach)

Convex Agent's thread system maps perfectly to your use case:

| Concept | Implementation |
|---------|----------------|
| User session | One thread per user (stored by `userId`) |
| Conversation context | Messages automatically included in LLM calls |
| Cross-session memory | Thread persists indefinitely, load on app open |
| Memory search | Vector search across thread messages |
| Failed retries | Automatic: marks previous attempts as failed, doesn't duplicate |

### Schema Addition for Thread Mapping

Add to your existing schema to map users to their AI threads:

```typescript
// convex/schema.ts (ADDITION)

// AI Assistant thread mapping
aiThreads: defineTable({
  userId: v.id("users"),
  threadId: v.string(), // Convex Agent's internal thread ID
  title: v.optional(v.string()), // Optional conversation title
  createdAt: v.number(),
  lastActiveAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_last_active", ["lastActiveAt"]),
```

### Memory Features Included

- **Automatic context inclusion**: Previous messages fed to LLM automatically
- **Vector search**: Semantic search over past messages (configure embedding model)
- **Streaming deltas**: Real-time updates via WebSocket to all clients
- **Multi-user threads**: Share conversations between investor and agents
- **File support**: Attach documents with automatic ref-counting

---

## Recommendation Engine Pattern

### No ML Libraries Needed

Use Claude's reasoning with your existing Convex data:

```typescript
// Pattern: AI-powered recommendations via tool calls

// The AI assistant will:
// 1. Call getInvestorProfile to understand preferences
// 2. Call searchProperties with criteria from profile
// 3. Reason about which properties best match
// 4. Explain recommendations in natural language

// Example conversation:
// User: "What properties would you recommend for me?"
// AI: [calls getInvestorProfile] -> gets budget, location prefs, property types
// AI: [calls searchProperties] -> finds matching listings
// AI: "Based on your preference for Tel Aviv residential properties
//      in the $400-600K range, I found 3 great options: [explains each]"
```

### Why This Approach Works

1. **No training required**: Claude reasons over your data in real-time
2. **Always current**: Uses live Convex data, not stale embeddings
3. **Explainable**: AI can explain WHY it recommended something
4. **Personalized**: Pulls investor questionnaire for context automatically
5. **Adaptive**: Works immediately with new data, no retraining

### Provider Matching Pattern

```typescript
// Provider matching tool example
findProviders: createTool({
  description: "Find service providers matching investor needs",
  parameters: z.object({
    providerType: z.enum(["broker", "mortgage_advisor", "lawyer"]),
    serviceArea: z.string().optional(),
    languages: z.array(z.string()).optional(),
    specializations: z.array(z.string()).optional(),
  }),
  handler: async (ctx, params) => {
    // Query serviceProviderProfiles with filters
    // Include: reviews, availability, years of experience
    // Sort by: relevance to investor needs
  },
});
```

---

## Model Selection

### Recommended Models by Use Case

| Use Case | Model | Rationale |
|----------|-------|-----------|
| **Conversational assistant** | `claude-sonnet-4-5-20250929` | Best balance of capability/cost for chat, reasoning |
| **Search parsing** (existing) | `claude-3-haiku-20240307` | Keep current - fast, cheap for simple NLP |
| **Complex recommendations** | `claude-sonnet-4-5-20250929` | Multi-step tool calling, nuanced reasoning |

### Model Aliases (Simpler)

```typescript
// AI SDK supports aliases
anthropic("claude-sonnet-4-5")  // Latest Sonnet
anthropic("claude-haiku-4-5")   // Latest Haiku (when available)
```

### Cost Optimization Strategies

1. **Use Haiku for simple tasks**: Search parsing, classification
2. **Use Sonnet for conversation**: Multi-turn chat, tool calling
3. **Set `maxSteps: 5`**: Limit tool call iterations
4. **Cache repeated queries**: Convex queries are already cached
5. **Summarize long conversations**: Before hitting context limits

---

## Frontend Integration

### useChat Hook Setup

```typescript
// hooks/useAIAssistant.ts (NEW FILE)
"use client";

import { useChat } from "ai/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useAIAssistant() {
  // Get or create user's AI thread
  const thread = useQuery(api.aiThreads.getOrCreate);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    append,
  } = useChat({
    api: "/api/ai/chat", // Next.js route handler
    body: { threadId: thread?.threadId },
    onError: (error) => {
      console.error("AI chat error:", error);
    },
  });

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    append,
    threadId: thread?.threadId,
  };
}
```

### Streaming API Route

```typescript
// app/api/ai/chat/route.ts (NEW FILE)
import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  const { messages, threadId } = await req.json();

  // Get auth token from request headers for Convex
  const authToken = req.headers.get("Authorization")?.replace("Bearer ", "");

  const result = streamText({
    model: anthropic("claude-sonnet-4-5-20250929"),
    system: `You are a helpful real estate investment assistant...`,
    messages,
    tools: {
      // Define tools here that call Convex
    },
    onFinish: async ({ text }) => {
      // Persist to Convex after streaming completes
      if (threadId) {
        await convex.mutation(api.aiThreads.saveMessage, {
          threadId,
          role: "assistant",
          content: text,
        });
      }
    },
  });

  return result.toDataStreamResponse();
}
```

### Chat UI Component Pattern

```typescript
// components/ai/AIChat.tsx (structure)
"use client";

import { useAIAssistant } from "@/hooks/useAIAssistant";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AIChat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useAIAssistant();

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isLoading && <TypingIndicator />}
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about properties, investments..."
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}
```

---

## Environment Variables

### Already Configured

```bash
# In Convex Dashboard environment variables
ANTHROPIC_API_KEY=sk-ant-...
```

### No New Variables Needed

Convex Agent uses the same `ANTHROPIC_API_KEY` - no additional configuration.

---

## Installation Commands Summary

```bash
# Install AI packages
npm install @convex-dev/agent @ai-sdk/anthropic ai

# Generate Convex component types (REQUIRED before defining agents)
npx convex dev
```

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not Alternative |
|----------|-------------|-------------|---------------------|
| Memory persistence | Convex Agent | Custom tables + manual context | Agent handles edge cases (failures, retries, streaming) automatically |
| Streaming | AI SDK + WebSocket | HTTP streaming only | WebSocket enables multi-device sync, page reload resilience |
| Vector search | Convex Agent built-in | Pinecone/Weaviate | Data already in Convex, no sync complexity |
| LLM framework | AI SDK | LangChain | Simpler, better TS support, direct Claude integration |
| Recommendations | Claude tool calling | Custom ML model | No training needed, always uses current data, explainable |

---

## Implementation Phases

### Phase 1: Basic Chat (Foundation)
- Install packages, create convex.config.ts
- Define basic Agent without tools
- Create chat UI with streaming
- Test basic conversation

### Phase 2: Tool Integration (Recommendations)
- Add property search tool
- Add investor profile tool
- Add provider matching tool
- Test tool calling flow

### Phase 3: Memory & Context (Persistence)
- Configure thread persistence
- Add vector search for context
- Implement conversation history UI
- Test cross-session memory

### Phase 4: Polish (UX)
- Typing indicators with Framer Motion
- Error handling and retry UI
- Mobile-optimized chat interface
- Suggested prompts/quick actions

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Convex Agent integration | HIGH | Official Convex component, well-documented, verified version |
| AI SDK streaming | HIGH | Verified current version (6.0), widely adopted, good docs |
| Memory persistence pattern | HIGH | Thread-based approach is standard for Convex Agent |
| Model recommendations | HIGH | Sonnet 4.5 verified current, well-suited for this use case |
| Recommendation via tools | MEDIUM | Pattern is sound, but tool design needs iteration with real data |
| Frontend hooks | MEDIUM | Standard AI SDK patterns, but may need adjustment for Convex auth |

---

## Sources

### Official Documentation (HIGH Confidence)
- [Convex Agents Documentation](https://docs.convex.dev/agents) - Thread memory, streaming, tools
- [Convex Agent Getting Started](https://docs.convex.dev/agents/getting-started) - Installation steps
- [Vercel AI SDK](https://ai-sdk.dev/docs/introduction) - Streaming, hooks, providers
- [AI SDK Anthropic Provider](https://ai-sdk.dev/providers/ai-sdk-providers/anthropic) - Claude integration
- [Anthropic Claude Models](https://docs.anthropic.com/) - Model capabilities

### Package Versions (Verified 2026-01-22)
- [@convex-dev/agent](https://www.npmjs.com/package/@convex-dev/agent) - v0.3.2
- [@ai-sdk/anthropic](https://www.npmjs.com/package/@ai-sdk/anthropic) - v3.0.13
- [ai (Vercel AI SDK)](https://www.npmjs.com/package/ai) - v6.0.0
- [@anthropic-ai/sdk](https://www.npmjs.com/package/@anthropic-ai/sdk) - v0.71.2 (existing)

### Architecture References (MEDIUM Confidence)
- [Convex AI Streaming Patterns](https://stack.convex.dev/gpt-streaming-with-persistent-reactivity)
- [Convex Agent GitHub](https://github.com/get-convex/agent)
- [AI SDK Streaming Guide](https://www.9.agency/blog/streaming-ai-responses-vercel-ai-sdk)
- [Unbreakable AI Chat: Convex + Vercel AI SDK](https://www.arhamhumayun.com/blog/streamed-ai-response)

---

## Summary

**Three packages to add:**
1. `@convex-dev/agent` - Memory persistence, thread management, WebSocket streaming
2. `@ai-sdk/anthropic` - Claude provider for Vercel AI SDK
3. `ai` - Core AI SDK with React hooks

**Integration pattern:**
- Convex Agent for backend (persistence, tools, context)
- AI SDK for frontend (streaming UI, hooks)
- Existing Anthropic SDK continues for search parsing (no change)

**Memory solution:**
- Thread-based: one thread per user
- Automatic context: previous messages included in LLM calls
- Built-in vector search: semantic memory retrieval
- WebSocket sync: real-time updates across devices

**Recommendation engine:**
- Tool-based: Claude calls Convex queries to get data
- No ML training: uses live data with LLM reasoning
- Explainable: AI explains why it recommended something
