# AI Assistant Architecture

**Project:** REOS AI Chat Assistant
**Scope:** Architecture patterns for AI assistant integration
**Researched:** 2026-01-22
**Confidence:** HIGH (verified with Convex official docs and existing codebase patterns)

## Executive Summary

The AI assistant integrates with REOS's existing Convex/Next.js architecture using established patterns from both the codebase (parseSearchQuery action) and Convex's official AI chat recommendations. The architecture leverages Convex actions for AI generation, new tables for conversation persistence, and queries that combine investor questionnaire data with property/provider matching.

---

## System Overview

```
+--------------------+     +---------------------+     +------------------+
|   Investor UI      |     |   Convex Backend    |     |   Claude API     |
| (Summary Page)     |     |                     |     |                  |
+--------------------+     +---------------------+     +------------------+
         |                          |                          |
    [1] Send message           [2] Action                 [3] Stream
         |                    generates                   response
         v                    AI response                     |
+--------------------+             |                          v
| aiAssistant.send   |             v                 +------------------+
| (mutation)         |------> aiAssistant.generate   | Anthropic SDK    |
+--------------------+        (action)               +------------------+
         |                          |                          |
         v                          |                     [4] Response
+--------------------+              v                          |
| aiConversations    |      +----------------+                 |
| aiMessages         |      | Internal Query |<----------------+
| (tables)           |      | - questionnaire|
+--------------------+      | - properties   |
         |                  | - providers    |
    [5] Real-time           +----------------+
    subscription
         |
         v
+--------------------+
| UI Updates         |
| (optimistic +      |
|  real-time)        |
+--------------------+
```

---

## Integration Points with Existing Components

### 1. Existing Claude Integration (HIGH Confidence)

**Verified Pattern in `/convex/search.ts`:**

```typescript
// Existing pattern for AI actions in REOS
export const parseSearchQuery = action({
  args: { query: v.string() },
  handler: async (_, args): Promise<PropertyFilters> => {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 256,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: args.query }],
    });
    // ... process response
  },
});
```

**Integration Point:** The new AI assistant action follows this exact pattern but with:
- Longer context window (conversation history)
- Different system prompt (investment advisor)
- Database queries for context (questionnaire, properties)

### 2. Existing Data Tables (HIGH Confidence)

**Tables the AI assistant queries:**

| Table | Fields Used | Purpose |
|-------|-------------|---------|
| `investorQuestionnaires` | All fields | Build investor profile context |
| `properties` | title, city, priceUsd, propertyType, expectedRoi, etc. | Property recommendations |
| `serviceProviderProfiles` | providerType, serviceAreas, languages, yearsExperience | Team recommendations |
| `providerReviews` | rating, reviewText | Provider quality context |

### 3. Existing Chat Patterns (HIGH Confidence)

**Reusable patterns from `/convex/directMessages.ts` and `/convex/conversations.ts`:**

- Message structure: `senderId`, `content`, `status`, `createdAt`
- Conversation model: `participantIds`, `type`, `updatedAt`
- Real-time via Convex queries with `withIndex`
- Message enrichment pattern (sender info)

---

## New Convex Tables

### aiConversations Table

```typescript
// New table for AI assistant conversations
aiConversations: defineTable({
  // Owner
  userId: v.id("users"),

  // Conversation metadata
  title: v.optional(v.string()),  // Auto-generated from first message

  // Context snapshot at conversation start (for consistency)
  contextSnapshot: v.optional(v.object({
    questionnaireId: v.optional(v.id("investorQuestionnaires")),
    snapshotAt: v.number(),
  })),

  // Timestamps
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_user_and_updated", ["userId", "updatedAt"]),
```

### aiMessages Table

```typescript
// Messages within AI conversations
aiMessages: defineTable({
  // Conversation reference
  conversationId: v.id("aiConversations"),

  // Message role
  role: v.union(v.literal("user"), v.literal("assistant")),

  // Content
  content: v.string(),

  // For streaming responses (optional enhancement)
  isComplete: v.boolean(),  // true when response fully generated

  // Metadata for assistant messages
  metadata: v.optional(v.object({
    // Properties mentioned/recommended
    propertyIds: v.optional(v.array(v.id("properties"))),
    // Providers mentioned/recommended
    providerIds: v.optional(v.array(v.id("users"))),
    // Model used
    model: v.optional(v.string()),
    // Tokens used (for cost tracking)
    tokensUsed: v.optional(v.number()),
  })),

  // Timestamp
  createdAt: v.number(),
})
  .index("by_conversation", ["conversationId"])
  .index("by_conversation_and_time", ["conversationId", "createdAt"]),
```

---

## New Convex Functions

### File: `/convex/aiAssistant.ts`

```typescript
// QUERIES

// Get or create conversation for user
export const getActiveConversation = query({
  args: {},
  handler: async (ctx) => {
    // Get current user
    // Find most recent conversation or return null
    // Return conversation with recent messages
  },
});

// List messages in conversation
export const listMessages = query({
  args: { conversationId: v.id("aiConversations") },
  handler: async (ctx, args) => {
    // Verify ownership
    // Return messages ordered by time
  },
});

// List user's conversation history
export const listConversations = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    // Return recent conversations with preview
  },
});

// MUTATIONS

// Create new conversation
export const createConversation = mutation({
  args: {},
  handler: async (ctx) => {
    // Create conversation
    // Optionally snapshot current questionnaire state
  },
});

// Send user message (does NOT call AI - that's the action)
export const sendMessage = mutation({
  args: {
    conversationId: v.id("aiConversations"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // Create user message
    // Update conversation timestamp
    // Return message ID
  },
});

// Save AI response (called by action after generation)
export const saveAssistantMessage = mutation({
  args: {
    conversationId: v.id("aiConversations"),
    content: v.string(),
    metadata: v.optional(/* metadata schema */),
  },
  handler: async (ctx, args) => {
    // Create assistant message
    // Update conversation
  },
});

// ACTIONS

// Generate AI response (the main AI integration point)
export const generateResponse = action({
  args: {
    conversationId: v.id("aiConversations"),
    userMessage: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Get conversation history
    const messages = await ctx.runQuery(
      api.aiAssistant.listMessages,
      { conversationId: args.conversationId }
    );

    // 2. Get investor context
    const questionnaire = await ctx.runQuery(
      api.investorQuestionnaires.getByUser
    );

    // 3. Get relevant properties (based on questionnaire)
    const properties = await ctx.runQuery(
      api.properties.list,
      buildFiltersFromQuestionnaire(questionnaire)
    );

    // 4. Get relevant providers (based on questionnaire)
    const providers = await ctx.runQuery(
      api.serviceProviderProfiles.listByType,
      { providerType: "broker", city: questionnaire?.preferredLocations?.[0] }
    );

    // 5. Build context-aware prompt
    const systemPrompt = buildSystemPrompt(questionnaire, properties, providers);

    // 6. Call Claude
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514", // Or claude-3-haiku for speed
      max_tokens: 1024,
      system: systemPrompt,
      messages: formatConversationHistory(messages, args.userMessage),
    });

    // 7. Extract response and metadata
    const assistantMessage = extractResponse(response);
    const metadata = extractMetadata(response, properties, providers);

    // 8. Save to database
    await ctx.runMutation(api.aiAssistant.saveAssistantMessage, {
      conversationId: args.conversationId,
      content: assistantMessage,
      metadata,
    });

    return { success: true };
  },
});
```

---

## Data Flow Diagrams

### Flow 1: User Sends Message

```
1. User types message in ChatInput
   |
2. Frontend calls mutation: sendMessage
   |-- Creates user message in aiMessages
   |-- Updates conversation timestamp
   |-- Returns optimistically to UI
   |
3. Frontend calls action: generateResponse
   |-- Runs in background
   |-- Queries context (questionnaire, properties, providers)
   |-- Calls Claude API
   |-- Saves assistant response via mutation
   |
4. UI subscribes to listMessages query
   |-- Real-time update shows assistant response
```

### Flow 2: Property Recommendation

```
User: "What properties match my preferences?"
                    |
                    v
+-------------------------------------------+
| Action: generateResponse                  |
|                                           |
| 1. Query investorQuestionnaires           |
|    - budgetMin: 300000                    |
|    - budgetMax: 600000                    |
|    - preferredLocations: ["Tel Aviv"]     |
|    - preferredPropertyTypes: ["residential"]
|                                           |
| 2. Query properties.list with filters     |
|    - priceMin: 300000                     |
|    - priceMax: 600000                     |
|    - city: "Tel Aviv"                     |
|    - propertyType: "residential"          |
|                                           |
| 3. Build system prompt with:              |
|    - Investor profile summary             |
|    - Top 5 matching properties            |
|    - Property details (price, ROI, etc.)  |
|                                           |
| 4. Claude generates personalized response |
+-------------------------------------------+
                    |
                    v
"Based on your investment profile, I found 3 properties
that match your criteria in Tel Aviv..."
```

### Flow 3: Provider Team Recommendation

```
User: "Help me build my investment team"
                    |
                    v
+-------------------------------------------+
| Action: generateResponse                  |
|                                           |
| 1. Query investorQuestionnaires           |
|    - servicesNeeded: ["broker", "lawyer"] |
|    - preferredLocations: ["Tel Aviv"]     |
|    - languages: (from user profile)       |
|                                           |
| 2. Query serviceProviderProfiles          |
|    For each needed service type:          |
|    - Filter by serviceAreas               |
|    - Filter by languages match            |
|    - Include yearsExperience, ratings     |
|                                           |
| 3. Query providerReviews for top matches  |
|                                           |
| 4. Build prompt with provider context     |
+-------------------------------------------+
                    |
                    v
"For your Tel Aviv investment, I recommend:
- Broker: Sarah Cohen (5 years exp, 4.8 rating)
- Lawyer: David Levy (10 years exp, 4.9 rating)..."
```

---

## Component Architecture

### New Components

```
src/components/ai-assistant/
  |-- AiAssistantChat.tsx        # Main container component
  |-- AiChatMessage.tsx          # Individual message bubble
  |-- AiChatInput.tsx            # Input with send button
  |-- AiTypingIndicator.tsx      # "Assistant is typing..."
  |-- AiPropertyCard.tsx         # Inline property recommendation
  |-- AiProviderCard.tsx         # Inline provider recommendation
  |-- AiConversationHistory.tsx  # Sidebar with past conversations
```

### Integration with Existing UI

```typescript
// In InvestorDashboard.tsx or new dedicated page
import { AiAssistantChat } from "@/components/ai-assistant/AiAssistantChat";

export function InvestorSummaryPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Profile Summary Card */}
      <ProfileCompletenessCard />

      {/* AI Assistant Chat */}
      <Card className="h-[600px]">
        <CardHeader>
          <CardTitle>AI Investment Assistant</CardTitle>
        </CardHeader>
        <CardContent className="h-full">
          <AiAssistantChat />
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## System Prompt Design

### Base System Prompt

```typescript
const BASE_SYSTEM_PROMPT = `You are an AI investment assistant for REOS, a real estate investment platform focused on Israeli properties.

Your role is to help investors:
1. Understand their investment profile and preferences
2. Recommend properties that match their criteria
3. Suggest service providers (brokers, lawyers, mortgage advisors)
4. Answer questions about the Israeli real estate market
5. Guide them through the investment process

GUIDELINES:
- Be helpful, professional, and concise
- Always base recommendations on the investor's actual profile data
- When recommending properties, explain WHY they match the investor's criteria
- When recommending providers, highlight relevant experience and ratings
- If information is missing, ask clarifying questions
- Never make up data - only reference actual properties and providers from the platform
- Amounts are in USD unless otherwise specified

INVESTOR PROFILE:
{investorProfileContext}

AVAILABLE PROPERTIES (matching criteria):
{propertiesContext}

AVAILABLE PROVIDERS:
{providersContext}
`;
```

### Context Building Functions

```typescript
function buildInvestorContext(questionnaire: InvestorQuestionnaire | null): string {
  if (!questionnaire) {
    return "Investor has not completed their profile yet.";
  }

  return `
- Budget: $${questionnaire.budgetMin?.toLocaleString()} - $${questionnaire.budgetMax?.toLocaleString()}
- Investment Horizon: ${questionnaire.investmentHorizon}
- Goals: ${questionnaire.investmentGoals?.join(", ")}
- Yield Preference: ${questionnaire.yieldPreference}
- Preferred Locations: ${questionnaire.preferredLocations?.join(", ")}
- Property Types: ${questionnaire.preferredPropertyTypes?.join(", ")}
- Size: ${questionnaire.minArea}-${questionnaire.maxArea} sqm
- Services Needed: ${questionnaire.servicesNeeded?.join(", ")}
`;
}

function buildPropertiesContext(properties: Property[]): string {
  if (!properties.length) {
    return "No matching properties found.";
  }

  return properties.slice(0, 5).map(p => `
- ${p.title} (ID: ${p._id})
  Location: ${p.city}
  Price: $${p.priceUsd.toLocaleString()}
  Type: ${p.propertyType}
  Size: ${p.squareMeters} sqm
  Expected ROI: ${p.expectedRoi}%
`).join("\n");
}
```

---

## Build Order (Based on Dependencies)

### Phase 1: Database Foundation
1. Add `aiConversations` table to schema
2. Add `aiMessages` table to schema
3. Run `npx convex dev` to generate types
4. **Dependency:** None, can start immediately

### Phase 2: Core Backend Functions
1. Create `/convex/aiAssistant.ts`
2. Implement `createConversation` mutation
3. Implement `sendMessage` mutation
4. Implement `listMessages` query
5. Implement `saveAssistantMessage` mutation
6. **Dependency:** Phase 1 complete

### Phase 3: AI Generation Action
1. Implement `generateResponse` action
2. Build context query functions
3. Implement system prompt builder
4. Test with curl/Convex dashboard
5. **Dependency:** Phase 2 complete

### Phase 4: Basic UI Components
1. Create `AiAssistantChat` container
2. Create `AiChatMessage` component
3. Create `AiChatInput` component
4. Wire up to Convex queries/mutations
5. **Dependency:** Phase 3 complete

### Phase 5: Enhanced Features
1. Add `AiTypingIndicator`
2. Add `AiPropertyCard` for inline recommendations
3. Add `AiProviderCard` for inline provider display
4. Add conversation history sidebar
5. **Dependency:** Phase 4 complete

### Phase 6: Integration
1. Add AI assistant to investor summary page
2. Test full flow with real data
3. Add error handling and edge cases
4. **Dependency:** Phase 5 complete

---

## Technical Considerations

### Model Selection

| Use Case | Recommended Model | Rationale |
|----------|------------------|-----------|
| General conversation | claude-3-haiku | Fast, cheap, good for simple Q&A |
| Complex recommendations | claude-sonnet-4 | Better reasoning for matching logic |
| Existing pattern | claude-3-haiku-20240307 | Already used in parseSearchQuery |

**Recommendation:** Start with Haiku for consistency with existing code. Upgrade to Sonnet if recommendation quality needs improvement.

### Token/Cost Management

```typescript
// Track tokens in message metadata
metadata: {
  tokensUsed: response.usage?.input_tokens + response.usage?.output_tokens,
  model: "claude-3-haiku-20240307",
}

// Optional: Rate limit by user
// Consider convex-helpers rate limiting
```

### Context Window Management

```typescript
// Limit conversation history to prevent context overflow
const MAX_HISTORY_MESSAGES = 20;

function formatConversationHistory(messages: AiMessage[], newMessage: string) {
  const recentMessages = messages.slice(-MAX_HISTORY_MESSAGES);
  return [
    ...recentMessages.map(m => ({
      role: m.role,
      content: m.content,
    })),
    { role: "user", content: newMessage },
  ];
}
```

### Error Handling

```typescript
// In generateResponse action
try {
  const response = await anthropic.messages.create(/* ... */);
  // ... process
} catch (error) {
  // Log error
  console.error("AI generation failed:", error);

  // Save error message to conversation
  await ctx.runMutation(api.aiAssistant.saveAssistantMessage, {
    conversationId: args.conversationId,
    content: "I'm sorry, I encountered an error processing your request. Please try again.",
    metadata: { error: true },
  });
}
```

---

## Anti-Patterns to Avoid

### 1. Calling Actions from Queries
**Wrong:**
```typescript
export const getResponseWithAI = query({
  handler: async (ctx) => {
    // ERROR: Queries cannot call actions
    await ctx.runAction(api.aiAssistant.generateResponse);
  }
});
```

**Right:** Frontend orchestrates action after query (existing REOS pattern).

### 2. Blocking UI on AI Response
**Wrong:**
```typescript
// Wait for AI before showing anything
const response = await generateResponse.mutate();
setMessages([...messages, response]);
```

**Right:** Optimistic update + subscription pattern.

### 3. No Context Limits
**Wrong:**
```typescript
// Pass entire conversation history (could be huge)
messages: allMessages.map(m => ({ role: m.role, content: m.content }))
```

**Right:** Limit history and consider summarization for long conversations.

---

## Sources

- [Convex AI Agents Documentation](https://docs.convex.dev/agents) - Official AI patterns
- [Convex Streaming Chat Tutorial](https://stack.convex.dev/build-streaming-chat-app-with-persistent-text-streaming-component) - Streaming patterns
- [Convex LangChain Integration](https://stack.convex.dev/ai-chat-using-langchain-and-convex) - RAG patterns
- REOS codebase: `/convex/search.ts` - Existing Claude integration
- REOS codebase: `/convex/directMessages.ts` - Existing chat patterns
- REOS codebase: `/convex/conversations.ts` - Conversation model patterns
