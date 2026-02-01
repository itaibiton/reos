# Phase 62: Context Awareness + Help Guidance - Research

**Researched:** 2026-02-01
**Domain:** AI assistant page-context injection, contextual suggestions, help guidance
**Confidence:** HIGH

## Summary

Phase 62 adds page-context awareness to the existing REOS AI Assistant. The assistant currently operates without knowledge of what the user is viewing -- it has profile context and conversation history but zero page context. The goal is straightforward: when the user opens the AI panel on `/properties/abc123`, the assistant knows they are looking at that specific property and adapts accordingly.

The existing architecture is well-suited for this change. The `sendMessage` action already accepts extensible args (currently `message` + `role`), the `buildProfileContext` pattern in `convex/ai/context.ts` is the exact pattern to replicate for page context, and the `AIAssistantProvider` already wraps the entire app shell. The frontend can detect the current route via `usePathname()` from `@/i18n/navigation` and `useParams()` from `next/navigation` -- both already used extensively in the codebase.

**Primary recommendation:** Add `pageContext` (optional object: `{ pageType, entityType?, entityId? }`) to the `sendMessage` args, resolve entity data server-side via new `buildPageContext` internalQuery in `convex/ai/context.ts`, inject the result into the system prompt alongside the existing profile context. On the frontend, create a `usePageContext()` hook that reads pathname/params, and store the result in the `AIAssistantProvider` state so the chat hook can include it with each message. Suggested prompts are defined as a static map on the frontend keyed by `pageType`.

## Route Inventory

### Entity Detail Pages (context includes specific entity)

| Route Pattern | pageType | entityType | entityId Source | Existing Query |
|---|---|---|---|---|
| `/properties/[id]` | `property_detail` | `property` | `params.id` | `api.properties.getById` |
| `/properties/[id]/edit` | `property_edit` | `property` | `params.id` | `api.properties.getById` |
| `/deals/[id]` | `deal_detail` | `deal` | `params.id` | `api.deals.get` |
| `/providers/[id]` | `provider_detail` | `provider` | `params.id` | `api.serviceProviderProfiles.getPublicProfile` |
| `/clients/[id]` | `client_detail` | `client` | `params.id` | `api.clients.getClientDetails` |
| `/profile/[id]` | `profile_detail` | `user` | `params.id` | `api.users.getUserProfile` |
| `/dashboard/clients/[clientId]` | `client_detail` | `client` | `params.clientId` | `api.clientManagement.getClientDeals` |

### List/Index Pages (context is the page section, no specific entity)

| Route Pattern | pageType | Notes |
|---|---|---|
| `/dashboard` | `dashboard` | Main dashboard |
| `/properties` | `property_browse` | Marketplace browse |
| `/properties/saved` | `property_saved` | Saved properties |
| `/properties/listings` | `property_listings` | My listings (provider) |
| `/properties/new` | `property_create` | Create new property |
| `/deals` | `deals_list` | My deals |
| `/providers` | `providers_browse` | Provider directory |
| `/clients` | `clients_list` | My clients (provider) |
| `/feed` | `social_feed` | Social feed |
| `/chat` | `messaging` | Direct messaging |
| `/search` | `search` | Search results |
| `/analytics` | `analytics` | Analytics dashboard |
| `/settings` | `settings` | User settings |

### Onboarding / Profile Pages

| Route Pattern | pageType | Notes |
|---|---|---|
| `/onboarding` | `onboarding` | Initial onboarding |
| `/onboarding/questionnaire` | `onboarding_questionnaire` | Investor questionnaire |
| `/onboarding/vendor-profile` | `onboarding_vendor` | Vendor profile setup |
| `/profile/investor` | `profile_investor` | Investor profile view |
| `/profile/investor/summary` | `profile_summary` | Investor summary |
| `/profile/provider` | `profile_provider` | Provider profile view |

### Service-Specific Pages (lower priority, future)

| Route Pattern | pageType |
|---|---|
| `/mortgage/*` | `mortgage_*` |
| `/legal/*` | `legal_*` |
| `/accounting/*` | `accounting_*` |
| `/tax/*` | `tax_*` |
| `/notary/*` | `notary_*` |
| `/appraisal/*` | `appraisal_*` |

## Architecture Patterns

### Pattern 1: Frontend Page Context Detection

**What:** A `usePageContext()` hook that parses the current URL into a structured context object.
**When to use:** Called once in the AI provider or panel, not on every render of every page.

```typescript
// src/components/ai/hooks/usePageContext.ts
import { usePathname } from "@/i18n/navigation";
import { useParams } from "next/navigation";

export interface PageContext {
  pageType: string;
  entityType?: "property" | "deal" | "provider" | "client" | "user";
  entityId?: string;
}

export function usePageContext(): PageContext {
  const pathname = usePathname();
  const params = useParams();

  // Properties
  if (pathname.startsWith("/properties/") && params.id) {
    if (pathname.endsWith("/edit")) {
      return { pageType: "property_edit", entityType: "property", entityId: params.id as string };
    }
    return { pageType: "property_detail", entityType: "property", entityId: params.id as string };
  }
  if (pathname === "/properties") return { pageType: "property_browse" };
  if (pathname === "/properties/saved") return { pageType: "property_saved" };
  if (pathname === "/properties/listings") return { pageType: "property_listings" };
  if (pathname === "/properties/new") return { pageType: "property_create" };

  // Deals
  if (pathname.startsWith("/deals/") && params.id) {
    return { pageType: "deal_detail", entityType: "deal", entityId: params.id as string };
  }
  if (pathname === "/deals") return { pageType: "deals_list" };

  // Providers
  if (pathname.startsWith("/providers/") && params.id) {
    return { pageType: "provider_detail", entityType: "provider", entityId: params.id as string };
  }
  if (pathname === "/providers") return { pageType: "providers_browse" };

  // Clients
  if (pathname.startsWith("/clients/") && params.id) {
    return { pageType: "client_detail", entityType: "client", entityId: params.id as string };
  }
  if (pathname.startsWith("/dashboard/clients/") && params.clientId) {
    return { pageType: "client_detail", entityType: "client", entityId: params.clientId as string };
  }

  // Dashboard
  if (pathname === "/dashboard") return { pageType: "dashboard" };

  // Profile
  if (pathname.startsWith("/profile/") && params.id) {
    return { pageType: "profile_detail", entityType: "user", entityId: params.id as string };
  }

  // Fallback
  const segment = pathname.split("/").filter(Boolean)[0] || "dashboard";
  return { pageType: segment };
}
```

**Key insight:** `usePathname()` from `@/i18n/navigation` already strips the locale prefix (returns `/properties/abc123` not `/en/properties/abc123`). This is already used in `AppShell.tsx` for breadcrumb generation.

### Pattern 2: Backend Context Resolution

**What:** A new `buildPageContext` internalQuery in `convex/ai/context.ts` that resolves entity data from `entityType` + `entityId`.
**When to use:** Called in `sendMessage` action alongside existing `buildProfileContext`.

```typescript
// convex/ai/context.ts - new function alongside buildProfileContext
export const buildPageContext = internalQuery({
  args: {
    userId: v.id("users"),
    pageType: v.string(),
    entityType: v.optional(v.string()),
    entityId: v.optional(v.string()),
  },
  handler: async (ctx, { userId, pageType, entityType, entityId }) => {
    if (!entityType || !entityId) {
      // List pages: return page-level context only
      return buildListPageContext(pageType);
    }

    // Entity detail pages: resolve the entity
    switch (entityType) {
      case "property":
        return await buildPropertyContext(ctx, entityId);
      case "deal":
        return await buildDealContext(ctx, userId, entityId);
      case "provider":
        return await buildProviderContext(ctx, entityId);
      case "client":
        return await buildClientContext(ctx, userId, entityId);
      default:
        return null;
    }
  },
});
```

**Entity resolution uses existing queries internally** (not via `ctx.runQuery` but direct `ctx.db` access since this is an internalQuery):
- Property: `ctx.db.get(propertyId)` -- returns title, city, price, type, status, bedrooms, etc.
- Deal: `ctx.db.get(dealId)` + `ctx.db.get(deal.propertyId)` -- returns stage, property info, provider assignments
- Provider: `ctx.db.query("serviceProviderProfiles").withIndex(...)` + user info -- returns name, type, areas, reviews
- Client: Get deals where investor matches -- returns deal count, stages, properties involved

### Pattern 3: System Prompt Injection

**What:** Page context is appended to the existing system prompt after profile context.
**When to use:** In `chat.ts sendMessage`, after building rolePrompt and profileContext.

```typescript
// In sendMessage handler, after existing profileContext
if (pageContext) {
  systemContext += `\n\n## Current Page Context\n\n${pageContext}\n\n`;
}
```

The page context string format is human-readable markdown, following the same pattern as `buildProfileContext`:

```
## Current Page Context

The user is currently viewing a property listing:
- Property: "Modern 3BR Apartment in Tel Aviv"
- Location: Tel Aviv, 14 Rothschild Blvd
- Price: $450,000
- Type: Residential, 3 bedrooms, 2 bathrooms, 95 sqm
- Status: Available
- Investment: Expected ROI 6.2%, Cap Rate 4.8%

Tailor your responses to this property. If they ask general questions, relate answers to this property when relevant.
```

### Pattern 4: Suggested Prompts (Frontend Static Map)

**What:** Contextual quick-action buttons shown above the chat input when the thread is new or after context changes.
**When to use:** Shown in `AssistantChatContent` when messages are empty or on context change.

```typescript
// src/components/ai/hooks/useSuggestedPrompts.ts
const PROMPTS_BY_PAGE_TYPE: Record<string, string[]> = {
  property_detail: [
    "What do you think of this property as an investment?",
    "How does this compare to similar properties?",
    "What should I know before starting a deal?",
  ],
  deal_detail: [
    "What's the next step in this deal?",
    "Help me understand the current stage",
    "What documents do I need?",
  ],
  property_browse: [
    "Help me find properties matching my profile",
    "What areas have the best investment potential?",
    "Explain the property types available",
  ],
  deals_list: [
    "Show me a summary of my active deals",
    "Which deal needs my attention?",
    "Explain the deal stages",
  ],
  dashboard: [
    "Give me a summary of my portfolio",
    "What should I do next?",
    "Help me understand my dashboard",
  ],
  providers_browse: [
    "Help me find a broker for my area",
    "What should I look for in a mortgage advisor?",
    "Recommend providers for my investment team",
  ],
  // ... more page types
};
```

### Anti-Patterns to Avoid

- **DO NOT fetch entity data on the frontend to send to the backend.** The frontend sends only `pageType`, `entityType`, `entityId`. All entity resolution happens server-side. This prevents spoofing and keeps the payload tiny.
- **DO NOT send page context on every navigation.** Context is only sent with chat messages. The `usePageContext()` hook is reactive but only consumed when `sendMessage` fires.
- **DO NOT add a new Convex table for page context.** This is ephemeral, per-message context. It lives in the system prompt, not persisted separately.
- **DO NOT make context resolution blocking.** If the entity lookup fails (deleted property, no access), the assistant should work gracefully without context rather than throwing.
- **DO NOT inject entity data into the user message.** Entity context goes in the system prompt, not the user message. The user message is what the user typed.

### Recommended Project Structure

```
convex/ai/
  context.ts            # ADD: buildPageContext alongside existing buildProfileContext
  chat.ts               # MODIFY: accept pageContext args, call buildPageContext
  (agent.ts)            # NO CHANGE
  (threads.ts)          # NO CHANGE

src/components/ai/
  hooks/
    usePageContext.ts    # NEW: detects current page/entity from URL
    useSuggestedPrompts.ts  # NEW: returns prompts based on pageType
    useAIAssistantChat.ts   # MODIFY: includes pageContext in sendMessage call
  SuggestedPrompts.tsx  # NEW: renders prompt chips above input
  AIAssistantPanel.tsx  # MODIFY: adds SuggestedPrompts component
  AIChatInput.tsx       # NO CHANGE

src/providers/
  AIAssistantProvider.tsx  # MODIFY: stores pageContext in state
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Route parsing | Custom regex parser | `usePathname()` + `useParams()` from Next.js | Already used in the codebase, handles locale stripping, SSR-safe |
| Entity data formatting | Complex serialization | Simple template strings in `buildPageContext` | The AI model consumes markdown naturally, no need for structured output |
| Context caching | LRU cache for entity lookups | Direct `ctx.db.get()` per message | Convex queries are already cached/reactive; adding manual caching creates staleness bugs |
| User preferences storage | New "AI preferences" table | Rely on existing `investorQuestionnaires` + `serviceProviderProfiles` | Profile data is already there and used by `buildProfileContext` |

## Common Pitfalls

### Pitfall 1: Context Staleness on Navigation

**What goes wrong:** User navigates from `/properties/abc` to `/properties/xyz`, opens AI panel, and the context still reflects the old property.
**Why it happens:** `usePageContext()` re-renders on pathname change, but if the page context is captured at panel-open time and never updated, it goes stale.
**How to avoid:** `usePageContext()` should be reactive -- read pathname/params on every render. The chat hook reads the current context at send time, not at mount time. Store context in a ref that updates on navigation, read it fresh on each `sendMessage`.
**Warning signs:** AI references the wrong property name after the user navigated.

### Pitfall 2: Convex ID Validation on Malformed Entity IDs

**What goes wrong:** Frontend sends `entityId: "not-a-real-id"` and `ctx.db.get()` throws.
**Why it happens:** The URL params might contain slugs, malformed IDs, or IDs from old/deleted entities.
**How to avoid:** Wrap entity resolution in try/catch. Return `null` context on failure -- the assistant works without it (graceful degradation). Validate that entityId looks like a Convex ID before calling `ctx.db.get()`.
**Warning signs:** `sendMessage` action crashes with "Invalid ID" error.

### Pitfall 3: System Prompt Token Bloat

**What goes wrong:** Injecting full entity data (property description, all amenities, all deal history) makes the system prompt enormous, eating into context window.
**Why it happens:** Eagerness to provide "all the context."
**How to avoid:** Keep entity context to 10-15 lines maximum. Include only: name/title, key facts (price, location, type, status), and 2-3 investment metrics. The AI can use tools to get more details if needed.
**Warning signs:** System prompt exceeds 2000 tokens, response quality drops because model runs out of context.

### Pitfall 4: Suggested Prompts Firing sendMessage with Context

**What goes wrong:** User clicks a suggested prompt chip, but the page context is not included in that sendMessage call.
**Why it happens:** Suggested prompts bypass the normal input flow and call `sendMessage` directly without the context-enriched path.
**How to avoid:** The `sendMessage` function in `useAIAssistantChat` should always include the current page context automatically. The caller should not need to pass it explicitly.
**Warning signs:** Clicking suggested prompt on property page produces generic response without property awareness.

### Pitfall 5: Access Control in Context Resolution

**What goes wrong:** The AI reveals data about a deal/client that the user should not have access to.
**Why it happens:** `buildPageContext` does not check whether the user is authorized to view the entity.
**How to avoid:** Use `userId` in `buildPageContext` to verify access. For deals, check that user is a participant. For clients, check that user is their assigned provider. Return `null` for unauthorized entities.
**Warning signs:** User spoofs entityId in devtools and gets context about another user's deal.

## Code Examples

### Example 1: sendMessage Args Extension

```typescript
// convex/ai/chat.ts - Modified args
export const sendMessage = action({
  args: {
    message: v.string(),
    role: v.optional(v.string()),
    // NEW: Page context (lightweight, resolved server-side)
    pageContext: v.optional(v.object({
      pageType: v.string(),
      entityType: v.optional(v.string()),
      entityId: v.optional(v.string()),
    })),
  },
  handler: async (ctx, { message, role, pageContext }) => {
    // ... existing auth + thread logic ...

    // Load profile context (existing)
    const profileContext = await ctx.runQuery(
      internal.ai.context.buildProfileContext,
      { userId: user._id }
    );

    // Load page context (NEW)
    let pageContextString: string | null = null;
    if (pageContext) {
      pageContextString = await ctx.runQuery(
        internal.ai.context.buildPageContext,
        {
          userId: user._id,
          pageType: pageContext.pageType,
          entityType: pageContext.entityType,
          entityId: pageContext.entityId,
        }
      );
    }

    // Build system prompt (modified to include page context)
    let systemContext = rolePrompt;
    if (profileContext) {
      systemContext += profileContext + "\n\n";
    }
    if (pageContextString) {
      systemContext += pageContextString + "\n\n";
    }
    // ... rest of existing logic ...
  },
});
```

### Example 2: Property Context Builder

```typescript
// convex/ai/context.ts - entity resolver
async function buildPropertyContext(
  ctx: { db: any },
  entityId: string
): Promise<string | null> {
  try {
    const property = await ctx.db.get(entityId as Id<"properties">);
    if (!property) return null;

    const lines: string[] = [
      `## Current Page Context`,
      ``,
      `The user is viewing a property listing:`,
      `- Title: "${property.title}"`,
      `- Location: ${property.city}, ${property.address}`,
      `- Price: $${property.priceUsd.toLocaleString()}`,
      `- Type: ${property.propertyType}`,
      `- Status: ${property.status}`,
    ];

    if (property.bedrooms) lines.push(`- Bedrooms: ${property.bedrooms}`);
    if (property.bathrooms) lines.push(`- Bathrooms: ${property.bathrooms}`);
    if (property.squareMeters) lines.push(`- Area: ${property.squareMeters} sqm`);
    if (property.expectedRoi) lines.push(`- Expected ROI: ${property.expectedRoi}%`);
    if (property.capRate) lines.push(`- Cap Rate: ${property.capRate}%`);
    if (property.monthlyRent) lines.push(`- Monthly Rent: $${property.monthlyRent}`);

    lines.push(``);
    lines.push(`Tailor responses to this property. Offer investment analysis, comparisons, or next steps when relevant.`);

    return lines.join("\n");
  } catch {
    return null;
  }
}
```

### Example 3: Deal Context Builder

```typescript
async function buildDealContext(
  ctx: { db: any },
  userId: Id<"users">,
  entityId: string
): Promise<string | null> {
  try {
    const deal = await ctx.db.get(entityId as Id<"deals">);
    if (!deal) return null;

    // Access check
    const isParticipant =
      deal.investorId === userId ||
      deal.brokerId === userId ||
      deal.mortgageAdvisorId === userId ||
      deal.lawyerId === userId;
    if (!isParticipant) return null;

    const property = await ctx.db.get(deal.propertyId);
    const propertyTitle = property?.title || "Unknown property";

    const lines: string[] = [
      `## Current Page Context`,
      ``,
      `The user is viewing a deal:`,
      `- Property: "${propertyTitle}"`,
      `- Stage: ${deal.stage}`,
      `- Started: ${new Date(deal.createdAt).toLocaleDateString()}`,
    ];

    if (deal.brokerId) lines.push(`- Broker: assigned`);
    else lines.push(`- Broker: not yet assigned`);
    if (deal.mortgageAdvisorId) lines.push(`- Mortgage Advisor: assigned`);
    else lines.push(`- Mortgage Advisor: not yet assigned`);
    if (deal.lawyerId) lines.push(`- Lawyer: assigned`);
    else lines.push(`- Lawyer: not yet assigned`);

    lines.push(``);
    lines.push(`Help with deal progression, explain next steps, or answer questions about the ${deal.stage} stage.`);

    return lines.join("\n");
  } catch {
    return null;
  }
}
```

### Example 4: Frontend SuggestedPrompts Component

```typescript
// src/components/ai/SuggestedPrompts.tsx
interface SuggestedPromptsProps {
  pageType: string;
  onSelect: (prompt: string) => void;
}

export function SuggestedPrompts({ pageType, onSelect }: SuggestedPromptsProps) {
  const prompts = PROMPTS_BY_PAGE_TYPE[pageType] ?? PROMPTS_BY_PAGE_TYPE["default"];
  if (!prompts || prompts.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 px-4 py-3">
      {prompts.map((prompt) => (
        <button
          key={prompt}
          onClick={() => onSelect(prompt)}
          className="text-xs px-3 py-1.5 rounded-full border bg-muted/50
                     hover:bg-muted text-muted-foreground hover:text-foreground
                     transition-colors"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
```

### Example 5: List Page Context (No Entity)

```typescript
function buildListPageContext(pageType: string): string | null {
  const contextMap: Record<string, string> = {
    property_browse: `## Current Page Context\n\nThe user is browsing the property marketplace. Help them search, filter, or understand available properties.`,
    deals_list: `## Current Page Context\n\nThe user is viewing their deals list. Help with deal status, next steps, or comparisons between deals.`,
    dashboard: `## Current Page Context\n\nThe user is on the main dashboard. Give portfolio overviews, highlight important updates, or suggest actions.`,
    providers_browse: `## Current Page Context\n\nThe user is browsing service providers. Help them find the right broker, mortgage advisor, or lawyer.`,
    settings: `## Current Page Context\n\nThe user is on the settings page. Help with account settings, preferences, or platform features.`,
    onboarding_questionnaire: `## Current Page Context\n\nThe user is filling out their investor questionnaire. Help them understand each question and why it matters.`,
    property_create: `## Current Page Context\n\nThe user is creating a new property listing. Help with listing best practices, pricing, and required information.`,
  };

  return contextMap[pageType] ?? null;
}
```

## Standard Stack

### Core (No New Libraries)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next` | 16.1.1 | `usePathname`, `useParams` for route detection | Already in use, no new dependency |
| `convex` | ^1.31.3 | `internalQuery` for entity resolution | Already the backend framework |
| `@convex-dev/agent` | ^0.3.2 | Agent system prompt injection | Already used for platformAssistant |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `next-intl` | (current) | Translating suggested prompt strings | Only if prompts need i18n |

### No New Dependencies

This phase requires ZERO new npm packages. Everything is built with existing Next.js routing APIs, existing Convex patterns, and existing React state management.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|---|---|---|---|
| No page context | Profile context only | Current state | AI has no idea what user is looking at |
| Generic greeting | Auto-greeting with profile | Phase 40-44 | Greeting references profile but not current page |
| No suggested prompts | Static prompt list | Current state | Users must know what to ask |

**What changes with Phase 62:**
- AI knows the current page type and specific entity
- System prompt includes entity facts for intelligent responses
- Suggested prompts adapt per page type
- Help guidance varies based on onboarding state and current feature

## Help Guidance Strategy

### ACT-04: Feature Explanation and Onboarding Tips

Help guidance should be injected into the system prompt based on **pageType** and **user state**:

1. **First-time on a feature page**: If user has never visited deals page and asks for help, the AI explains what deals are and how they work. Detection: check if user has any deals (0 deals = new to deals).

2. **Feature explanation in context**: When on `/properties/[id]`, the AI can explain: "You can start a deal on this property by clicking 'Start Deal'. This will begin the interest stage..."

3. **Workflow guidance**: The system prompt includes stage-appropriate next-step guidance. On a deal in `broker_assigned` stage, the AI proactively mentions: "Your deal is with the broker. Once broker work is done, you'll move to mortgage stage."

**Implementation approach:** Add a `## Help Guidance` section to the system prompt that varies by pageType. This is a static string map, NOT a database lookup. Keep it simple.

```typescript
const HELP_GUIDANCE: Record<string, string> = {
  property_detail: `If the user asks for help:
- Explain how to save properties, start deals, and use the mortgage calculator
- Mention they can compare this with other properties by asking you`,
  deal_detail: `If the user asks for help:
- Explain the deal stages: interest -> broker -> mortgage -> legal -> closing -> completed
- Explain what each provider role does
- Guide them on uploading documents and requesting providers`,
  // ... etc
};
```

## Frontend -> Backend Protocol

### Current Protocol

```
sendMessage({ message: string, role?: string })
```

### New Protocol

```
sendMessage({
  message: string,
  role?: string,
  pageContext?: {
    pageType: string,          // e.g., "property_detail", "deals_list"
    entityType?: string,       // e.g., "property", "deal", "provider", "client"
    entityId?: string,         // e.g., Convex document ID
  }
})
```

### Security Considerations

- **Entity ID validation:** The backend MUST validate that `entityId` is a syntactically valid Convex ID before using it in `ctx.db.get()`. Invalid IDs cause runtime errors.
- **Access control:** The backend MUST check that the authenticated user has access to the referenced entity. Use the same access patterns as the existing queries (e.g., deal participant check in `deals.get`).
- **No data leakage through prompts:** Even if a user sends a spoofed `entityId` for an entity they don't own, `buildPageContext` returns `null` for unauthorized entities, so no data leaks into the prompt.
- **pageType is informational only:** The `pageType` string is not used for access control. It only determines which help guidance text and suggested prompts to show. The `entityType`/`entityId` pair drives actual data resolution, which is access-controlled.

## Auto-Greeting Enhancement

The existing auto-greeting in `chat.ts` (lines 123-148) should be enhanced to include page context:

```
Current: "Welcome! Based on your profile..."
Enhanced: "Welcome! I see you're looking at [Property Title] in [City].
  Based on your profile, here's what I think..."
```

The auto-greeting system prompt should reference the page context when available. If the panel opens for the first time on a property detail page, the greeting should be property-aware.

## Open Questions

1. **Should context be sent only on first message or every message?**
   - Recommendation: Send on every message. The user might navigate to a different page and then send another message from the panel. Sending context each time ensures freshness. The payload is tiny (3 fields).
   - Confidence: HIGH -- this is the simplest correct approach.

2. **Should suggested prompts be translated (i18n)?**
   - Recommendation: Yes, use translation keys like `aiSuggestions.propertyDetail.investmentAnalysis`. The existing `next-intl` infrastructure supports this.
   - Confidence: MEDIUM -- depends on whether the codebase is actively used in Hebrew; both `en.json` and `he.json` exist.

3. **How to handle the "lazy load on panel open" requirement?**
   - The requirement says context is "lazy-loaded on panel open only." This means: the `usePageContext()` hook runs continuously (it reads URL, which is always available), but the context is only SENT to the backend when a message is dispatched. There is no separate "load context" API call on panel open. The context just travels with the next `sendMessage`.
   - Confidence: HIGH -- this is the simplest approach that meets the requirement.

4. **Provider detail context: use user ID or profile ID?**
   - The provider detail page at `/providers/[id]` uses `params.id`. Need to verify whether this is the `users._id` or `serviceProviderProfiles._id`. Looking at the route, it appears to be `users._id` based on the pattern in `getPublicProfile`.
   - Confidence: MEDIUM -- needs verification during implementation.

## Sources

### Primary (HIGH confidence)
- Direct codebase examination of all files listed in Key Files section
- `convex/ai/chat.ts` -- current sendMessage flow, system prompt construction
- `convex/ai/context.ts` -- buildProfileContext pattern to replicate
- `convex/ai/agent.ts` -- platformAssistant configuration
- `convex/schema.ts` -- all table schemas for entity types
- `convex/properties.ts`, `convex/deals.ts` -- existing entity queries
- `src/components/ai/hooks/useAIAssistantChat.ts` -- current frontend hook
- `src/providers/AIAssistantProvider.tsx` -- current state management
- `src/components/layout/AppShell.tsx` -- current layout integration with AI panel
- All route `page.tsx` files examined for params usage patterns

### Secondary (MEDIUM confidence)
- Next.js 16 `usePathname()` and `useParams()` behavior -- based on codebase usage patterns seen in `AppShell.tsx` and route pages

### Tertiary (LOW confidence)
- None -- all findings are based on direct codebase examination

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies, all patterns verified in existing code
- Architecture: HIGH -- follows established patterns (buildProfileContext, sendMessage args)
- Route inventory: HIGH -- enumerated from filesystem and verified against page.tsx files
- Entity resolution: HIGH -- existing queries identified for all entity types
- Suggested prompts: MEDIUM -- content is a design decision, patterns are proven
- Help guidance: MEDIUM -- strategy is sound, specific guidance text needs iteration
- Security: HIGH -- follows existing access control patterns in the codebase

**Research date:** 2026-02-01
**Valid until:** 2026-03-01 (stable -- no external dependency changes expected)
