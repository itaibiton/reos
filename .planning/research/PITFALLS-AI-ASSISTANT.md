# Domain Pitfalls: AI Assistant for REOS

**Domain:** AI chat assistant with property/provider recommendations for real estate platform
**Researched:** 2026-01-22
**Confidence:** HIGH (research based on multiple authoritative sources)

## Critical Pitfalls

Mistakes that cause rewrites, user trust erosion, or major issues.

### Pitfall 1: Showing "Dead Air" During AI Response Generation

**What goes wrong:** Users see an empty chat bubble or no feedback while waiting 2-10 seconds for Claude to generate a response. The interface feels frozen or broken.

**Why it happens:** Developers treat AI responses like synchronous API calls instead of implementing streaming. For most applications, aim for response times under 1 second, but LLM responses routinely take 3-8 seconds for substantive answers.

**Consequences:**
- Users abandon the chat thinking it's broken
- Perceived latency feels 2-3x longer than actual latency
- Poor first impression destroys trust in AI features
- Users don't wait for valuable responses

**Prevention:**
1. **Enable Claude streaming** - Use the streaming option so UI displays response token-by-token
2. **Show "AI is typing..." indicator immediately** - Within 200ms of user sending message
3. **Display partial results** - Stream responses character-by-character as generated
4. **Set expectations** - For complex queries, show "This may take a moment to think through"

**Detection (warning signs):**
- Time to first visible response > 1 second
- User abandonment spikes after message submission
- Support tickets about "frozen" or "stuck" chat

**Phase to address:** First AI integration phase - streaming must be implemented from day one

**Sources:**
- [Reducing latency - Claude Docs](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-latency)
- [AI UI Patterns - patterns.dev](https://www.patterns.dev/react/ai-ui-patterns/)
- [Cloudscape Generative AI Loading States](https://cloudscape.design/patterns/genai/genai-loading-states/)

---

### Pitfall 2: Dumping Full Chat History Into Context Window

**What goes wrong:** Every AI request includes the entire conversation history (potentially thousands of messages), causing degraded output quality, slower responses, and eventually hitting token limits.

**Why it happens:** Developers treat context windows as infinite and assume "more context = better responses." Reality: larger windows do not eliminate the need for disciplined context management. Model attention is not uniform across long sequences.

**Consequences:**
- Response quality degrades as context grows (attention dilution)
- Latency increases linearly with context size
- Token costs explode ($$$)
- Eventually hit hard limits (1-2M tokens max)
- AI loses track of important early context ("Lost in the Middle" problem)

**Prevention:**
1. **Implement sliding window** - Keep only last N messages (e.g., last 20)
2. **Summarize older context** - Periodically compress old messages into summaries
3. **Use semantic retrieval** - Store messages in vector DB, retrieve only relevant context
4. **Budget context like memory** - Treat context as finite resource to be budgeted and paged

**REOS-specific strategy:**
```
Short-term: Last 10-15 messages (direct conversation)
Session summary: AI-generated summary of key points discussed
User profile context: Pre-fetched investor preferences, budget, locations
Query-specific retrieval: Vector search for relevant property/provider data
```

**Detection (warning signs):**
- AI starts repeating questions already answered
- Response latency grows over conversation length
- Token usage per request climbing
- AI contradicts earlier statements

**Phase to address:** Memory architecture must be designed in first phase, not retrofitted

**Sources:**
- [The Context Window Problem - Factory.ai](https://factory.ai/news/context-window-problem)
- [Why Most Chatbots Fail at Memory - Medium](https://deeflect.medium.com/why-most-chatbots-fail-at-memory-and-how-to-fix-it-cdc40d219fee)
- [LLM Chat History Summarization Guide - Mem0](https://mem0.ai/blog/llm-chat-history-summarization-guide-2025)

---

### Pitfall 3: AI Making Up Property/Provider Facts (Hallucination)

**What goes wrong:** Claude confidently states incorrect property prices, fabricated amenities, non-existent provider credentials, or made-up market statistics. Users make financial decisions based on hallucinated data.

**Why it happens:** LLMs generate plausible-sounding text based on patterns, not facts. Without grounding in actual database records, the AI "fills in gaps" with confident fabrications. Industry reports indicate financial losses exceeding $250M annually from hallucination-related incidents.

**Consequences:**
- Users trust fabricated property details (legal liability)
- Providers incorrectly represented (reputation damage)
- Investment decisions based on false ROI projections
- Platform credibility destroyed after single bad incident
- Potential legal exposure for misrepresentation

**Prevention:**
1. **Mandatory RAG for all factual claims** - Every property/provider statement must cite database records
2. **Validate entity IDs exist** - Before mentioning any property/provider, verify it exists in Convex
3. **Citation enforcement** - AI must prefix factual claims with source ("According to the listing...")
4. **Refuse when uncertain** - Configure Claude to explicitly refuse when confidence is insufficient
5. **Post-generation validation** - Check that all mentioned entities/prices match database

**REOS-specific implementation:**
```typescript
// REQUIRED: Inject verified context into prompt
const property = await ctx.db.get(propertyId);
const systemPrompt = `
You are helping an investor. ONLY state facts from the provided property data.
If asked about something not in the data, say "I don't have that information."

VERIFIED PROPERTY DATA:
${JSON.stringify(property, null, 2)}
`;
```

**Detection (warning signs):**
- AI mentions properties not in database
- Price/ROI figures don't match records
- Provider credentials that can't be verified
- User reports of incorrect information

**Phase to address:** RAG architecture is foundational - must be in first AI phase

**Sources:**
- [LLM Hallucinations Guide 2025 - Lakera](https://www.lakera.ai/blog/guide-to-hallucinations-in-large-language-models)
- [8 Ways to Prevent LLM Hallucinations - Airbyte](https://airbyte.com/agentic-data/prevent-llm-hallucinations)
- [Token-Level Truth - vLLM Blog](https://blog.vllm.ai/2025/12/14/halugate.html)

---

### Pitfall 4: Generic Recommendations That Ignore User Profile

**What goes wrong:** AI recommends Tel Aviv luxury apartments to a user who specified conservative budget and Haifa preference in their questionnaire. Recommendations feel random, not personalized.

**Why it happens:** The recommendation logic doesn't incorporate the rich investor profile data already collected (questionnaire, preferences, saved properties). AI treats each user as identical.

**Consequences:**
- Users feel the "AI" is just keyword matching
- Valuable questionnaire data goes unused
- Users lose trust in recommendation quality
- Higher friction to useful properties (manual filtering)

**Prevention:**
1. **Always inject user profile into context** - Budget, locations, property types, risk tolerance
2. **Weight recommendations by profile match** - Score properties against stated preferences
3. **Explain reasoning** - "Based on your preference for Haifa and budget of $300-400K..."
4. **Track feedback loops** - Learn from what users save/dismiss

**REOS-specific implementation:**
```typescript
// Fetch and inject profile BEFORE every recommendation query
const questionnaire = await ctx.db
  .query("investorQuestionnaires")
  .withIndex("by_user", (q) => q.eq("userId", userId))
  .unique();

const profile = await ctx.db
  .query("investorProfiles")
  .withIndex("by_user", (q) => q.eq("userId", userId))
  .unique();

// Include in system prompt
const userContext = `
USER INVESTMENT PROFILE:
- Budget: $${questionnaire.budgetMin} - $${questionnaire.budgetMax}
- Preferred locations: ${questionnaire.preferredLocations.join(", ")}
- Property types: ${questionnaire.preferredPropertyTypes.join(", ")}
- Investment goal: ${questionnaire.yieldPreference}
- Timeline: ${questionnaire.purchaseTimeline}
`;
```

**Detection (warning signs):**
- Recommendations outside stated budget
- Properties in non-preferred cities
- Users immediately dismissing AI suggestions
- Manual search queries contradict AI recommendations

**Phase to address:** Recommendation engine phase - profile integration is core requirement

**Sources:**
- [AI Recommendation System Pitfalls - Reapit](https://www.reapit.com/content-hub/the-hidden-risks-of-ai-in-real-estate-and-how-to-avoid-them)
- [How Real Estate Agents Use AI 2025 - KapRE](https://www.kapre.com/resources/real-estate/ai-for-real-estate-agents)

---

## Moderate Pitfalls

Mistakes that cause delays, degraded UX, or technical debt.

### Pitfall 5: Stateless Conversations (No Memory Between Sessions)

**What goes wrong:** User discusses property preferences in one session, returns the next day, and AI has no memory of the conversation. User must repeat everything.

**Why it happens:** Chat history stored only in client state or session storage. No persistent memory layer.

**Consequences:**
- Repetitive interactions frustrate users
- AI asks same questions repeatedly
- Long-term preferences never accumulated
- Feels like talking to a new person each time

**Prevention:**
1. **Persist conversation threads in Convex** - Already have `conversations` and `directMessages` tables
2. **Store key facts as "memories"** - Extract and persist important user statements
3. **Load recent context on session start** - Fetch last N messages when user opens chat
4. **Consider Convex Agent component** - Purpose-built for persistent AI chat threads

**REOS implementation pattern:**
```typescript
// convex/aiThreads.ts
export const aiThreads = defineTable({
  userId: v.id("users"),
  messages: v.array(v.object({
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    timestamp: v.number(),
  })),
  summary: v.optional(v.string()), // Compressed older history
  updatedAt: v.number(),
}).index("by_user", ["userId"]);
```

**Detection (warning signs):**
- AI re-asks questions answered in previous sessions
- Users explicitly remind AI of prior conversations
- No conversation continuity after page refresh

**Phase to address:** Memory persistence in AI storage phase

**Sources:**
- [AI Agents with Built-in Memory - Convex Stack](https://stack.convex.dev/ai-agents)
- [Convex Chat Memory - LangChain](https://js.langchain.com/docs/integrations/memory/convex/)

---

### Pitfall 6: Mobile Chat UX Treating It Like Desktop

**What goes wrong:** Chat interface designed for desktop doesn't adapt to mobile. Tiny touch targets, text input hidden by keyboard, no voice input, poor thumb-zone ergonomics.

**Why it happens:** Developers build desktop-first and assume CSS media queries handle mobile. Chat UX requires mobile-specific interaction patterns.

**Consequences:**
- 90% of users abandon apps with poor UX
- Typing on mobile is friction-heavy
- Users can't see responses while typing
- Frustration leads to feature abandonment

**Prevention:**
1. **Large touch targets** - Minimum 44x44px for all interactive elements
2. **Keyboard-aware layout** - Chat input stays visible above keyboard
3. **Voice input option** - Microphone button for hands-free queries
4. **Suggested replies** - Pre-built response buttons reduce typing
5. **Design for interruptions** - Auto-save drafts, smart re-entry

**Mobile-specific requirements:**
```
- Input area pinned above keyboard
- Send button large enough for thumb
- Streaming responses visible while keyboard open
- Quick action buttons: "Show me similar", "Save this", "More details"
- Voice-to-text option
```

**Detection (warning signs):**
- Mobile users sending fewer messages than desktop
- High abandonment rate on mobile chat
- Support tickets about keyboard issues
- Very short mobile sessions

**Phase to address:** Mobile UI phase - chat components need mobile-first design

**Sources:**
- [UX for AI Chatbots 2025 - ParallelHQ](https://www.parallelhq.com/blog/ux-ai-chatbots)
- [16 Chat UI Design Patterns - BricxLabs](https://bricxlabs.com/blogs/message-screen-ui-deisgn)
- [Top Chatbot UX Tips 2025 - Netguru](https://www.netguru.com/blog/chatbot-ux-tips)

---

### Pitfall 7: Not Handling Claude API Failures Gracefully

**What goes wrong:** Claude API times out or returns an error, and the UI shows a generic error or breaks completely. User loses their message and trust.

**Why it happens:** Happy-path development without error handling. External API dependencies treated as always-available.

**Consequences:**
- Lost user messages (rage-inducing)
- Broken UI states
- No feedback on what went wrong
- Users don't know if they should retry

**Prevention:**
1. **Implement retry with exponential backoff** - 3 retries with increasing delays
2. **Preserve user input on failure** - Never lose what user typed
3. **Show specific error states** - "AI is busy, please try again" vs "Something went wrong"
4. **Timeout handling** - Cancel and inform after reasonable wait (30s max)
5. **Fallback responses** - "I'm having trouble right now. Meanwhile, here are properties matching your criteria..."

**Implementation pattern:**
```typescript
try {
  const response = await anthropic.messages.create({...});
} catch (error) {
  if (error.status === 529) { // Overloaded
    return { error: "AI is busy", retryAfter: 5000 };
  }
  if (error.status === 408) { // Timeout
    return { error: "Request took too long", canRetry: true };
  }
  // Log for monitoring, return graceful fallback
}
```

**Detection (warning signs):**
- User complaints about lost messages
- Spikes in API errors without corresponding UI feedback
- Users repeatedly sending same message (retry attempts)

**Phase to address:** Core AI integration phase - error handling is foundational

---

### Pitfall 8: Recommending Outdated or Sold Properties

**What goes wrong:** AI enthusiastically recommends a property that was sold last week, or quotes prices from before a price change. User contacts seller only to learn it's unavailable.

**Why it happens:** Vector embeddings or cached recommendations not updated when property status changes. AI context includes stale data.

**Consequences:**
- Wasted user effort
- Frustration and distrust
- Embarrassment for platform
- Users question all recommendations

**Prevention:**
1. **Real-time status checks** - Verify property.status === "available" before recommending
2. **Invalidate embeddings on update** - Re-embed when price/status changes
3. **Include "as of" timestamps** - "This property was listed at $350K as of January 15"
4. **Filter before RAG retrieval** - Only retrieve available properties

**REOS implementation:**
```typescript
// In recommendation query - ALWAYS filter by status
const availableProperties = await ctx.db
  .query("properties")
  .withIndex("by_status", (q) => q.eq("status", "available"))
  .collect();

// Include only these in AI context
```

**Detection (warning signs):**
- Users clicking recommended properties that show "Sold"
- AI recommendations for properties with old prices
- Support tickets about availability discrepancies

**Phase to address:** Recommendation engine phase - freshness is core requirement

---

## Minor Pitfalls

Mistakes that cause annoyance but are recoverable.

### Pitfall 9: Overly Verbose AI Responses

**What goes wrong:** User asks "What's the price?" and AI responds with 3 paragraphs about the property, market conditions, and investment considerations before mentioning the price.

**Why it happens:** LLMs default to verbose, helpful responses. Without explicit brevity instructions, Claude errs on the side of thoroughness.

**Prevention:**
1. **System prompt brevity instructions** - "Be concise. Answer the specific question first."
2. **Set max_tokens appropriately** - Limit response length for simple queries
3. **Classify query complexity** - Short queries get short answers
4. **"Ask for more" pattern** - End with "Would you like more details?"

**Detection (warning signs):**
- Users scrolling past AI responses without reading
- Follow-up questions repeating what AI should have answered first
- User feedback about "too chatty"

**Phase to address:** Prompt engineering phase

---

### Pitfall 10: No Quick Actions for Common Intents

**What goes wrong:** User wants to save a property the AI mentioned, but must navigate away from chat to find and save it. Breaking flow destroys momentum.

**Why it happens:** Chat treated as separate from main app actions. No integration between AI responses and platform functionality.

**Prevention:**
1. **Inline action buttons** - "Save", "Show Details", "Contact Broker" in AI responses
2. **Deep linking** - Property mentions are clickable links
3. **Function calling** - AI can trigger actions directly (save, request info)

**Implementation pattern:**
```typescript
// AI response includes structured actions
{
  message: "Here's a great match in Haifa...",
  actions: [
    { type: "save_property", propertyId: "xyz", label: "Save" },
    { type: "view_details", propertyId: "xyz", label: "View Details" },
    { type: "request_broker", propertyId: "xyz", label: "Contact Broker" }
  ]
}
```

**Detection (warning signs):**
- Users copy-pasting property names to search
- High chat-to-property-page navigation abandonment
- Users asking "how do I save this?"

**Phase to address:** Chat UI enhancement phase

---

### Pitfall 11: Provider Recommendations Without Context

**What goes wrong:** AI recommends a mortgage advisor without considering: user's timeline, property location, language preferences, or whether the provider is even accepting new clients.

**Why it happens:** Simple "list providers" query without joining against relevant criteria.

**Prevention:**
1. **Match provider service areas** - Provider.serviceAreas includes property city
2. **Check availability** - acceptingNewClients === true
3. **Language matching** - Provider speaks user's preferred language
4. **Specialization matching** - Provider specializes in relevant property type

**REOS-specific query:**
```typescript
// Find matching providers with full context
const providers = await ctx.db
  .query("serviceProviderProfiles")
  .withIndex("by_provider_type", (q) => q.eq("providerType", "broker"))
  .filter((q) =>
    q.and(
      q.eq(q.field("acceptingNewClients"), true),
      // Service area includes property city
      // Languages includes user preference
    )
  )
  .collect();
```

**Detection (warning signs):**
- Recommended providers decline requests (mismatched area)
- Users complaining about language barriers
- Provider recommendations in wrong cities

**Phase to address:** Provider recommendation phase

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Core AI Chat | Dead air during generation | Streaming from day one |
| Memory/Storage | Context window explosion | Sliding window + summarization design |
| RAG Integration | Hallucinated property facts | Mandatory database grounding |
| Recommendations | Ignoring user profile | Profile injection in every query |
| Mobile UI | Desktop-centric chat | Mobile-first component design |
| Provider Matching | Generic recommendations | Multi-criteria matching query |

## Integration Pitfalls (Adding AI to Existing REOS)

### Existing Data Compatibility

**Risk:** Current `investorQuestionnaires` schema may need expansion for AI context
**Mitigation:** Audit existing schema fields for AI usefulness, plan migrations

### Performance Impact

**Risk:** AI queries add latency to existing fast Convex queries
**Mitigation:** Isolate AI calls to dedicated endpoints, don't block UI on AI

### UI Consistency

**Risk:** AI chat looks/feels different from existing REOS components
**Mitigation:** Use existing Shadcn components, match design system

### Authentication Flow

**Risk:** AI features accessible to incomplete profiles
**Mitigation:** Gate AI features behind onboardingComplete check (existing pattern)

---

## Sources

**Latency and UX:**
- [Reducing latency - Claude Docs](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-latency)
- [AI UI Patterns - patterns.dev](https://www.patterns.dev/react/ai-ui-patterns/)
- [Generative AI Loading States - Cloudscape](https://cloudscape.design/patterns/genai/genai-loading-states/)

**Memory Management:**
- [The Context Window Problem - Factory.ai](https://factory.ai/news/context-window-problem)
- [AI Agents with Built-in Memory - Convex Stack](https://stack.convex.dev/ai-agents)
- [LLM Chat History Summarization - Mem0](https://mem0.ai/blog/llm-chat-history-summarization-guide-2025)

**Hallucination Prevention:**
- [LLM Hallucinations Guide 2025 - Lakera](https://www.lakera.ai/blog/guide-to-hallucinations-in-large-language-models)
- [8 Ways to Prevent LLM Hallucinations - Airbyte](https://airbyte.com/agentic-data/prevent-llm-hallucinations)

**Real Estate AI:**
- [Hidden Risks of AI in Real Estate - Reapit](https://www.reapit.com/content-hub/the-hidden-risks-of-ai-in-real-estate-and-how-to-avoid-them)
- [AI for Real Estate Agents - KapRE](https://www.kapre.com/resources/real-estate/ai-for-real-estate-agents)

**Mobile Chat UX:**
- [UX for AI Chatbots 2025 - ParallelHQ](https://www.parallelhq.com/blog/ux-ai-chatbots)
- [Chat UI Design Patterns - BricxLabs](https://bricxlabs.com/blogs/message-screen-ui-deisgn)
