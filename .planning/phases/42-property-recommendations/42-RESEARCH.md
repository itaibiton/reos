# Phase 42: Property Recommendations - Research

**Researched:** 2026-01-22
**Domain:** AI-powered property recommendations with RAG grounding, tool calling, inline cards
**Confidence:** HIGH

## Summary

Phase 42 extends the AI assistant (Phase 40-41) to recommend properties matching investor profiles. The key technical challenge is preventing hallucinations: every property mentioned must exist in the database. This requires RAG (Retrieval-Augmented Generation) grounding through AI SDK tool calling.

The established approach uses Vercel AI SDK's `tool()` function to define property search tools that the AI agent calls to retrieve real properties from Convex. Properties are displayed as inline cards embedded in chat messages (like ChatGPT's link previews), not as separate components. The agent's tool execution provides database results that ground responses in facts.

Phase 40's infrastructure already supports tools (empty `tools: {}` object in agent.ts). We extend this with property search tools using Zod schemas, Convex database queries with multi-criteria filtering, and React components for inline property cards within messages. Phase 41's chat UI handles message rendering with react-markdown; we add custom components for property card rendering.

**Primary recommendation:** Define property search tool with `tool()` from Vercel AI SDK, implement Convex queries with composite indexes for budget/location/type filtering, render property cards as custom markdown components within ChatMessage, use Sonner for toast notifications, and leverage shadcn/ui Dialog for property detail modals.

## Standard Stack

The established libraries/tools for AI property recommendations:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `ai` (Vercel AI SDK) | ^6.0.39 | Tool definition via `tool()` helper | Already in use (Phase 40), native Claude tool calling support |
| `@ai-sdk/anthropic` | latest | Claude Sonnet 4 provider with tool streaming | Already in use, full tool calling support |
| `zod` | ^4.3.5 | Tool input schema validation | Already in use, required by AI SDK tools |
| `sonner` | latest | Toast notifications for "Saved" feedback | Modern replacement for shadcn toast, copy-paste installation |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `react-markdown` | 9.x | Custom components for inline cards | Already installed (Phase 41), extensible component system |
| shadcn/ui Dialog | latest | Property detail modal overlay | Already in use, accessible modal primitives |
| Convex indexes | 1.31.3+ | Multi-criteria property filtering | Already in use, composite index support |

### Already Installed
| Library | Version | Notes |
|---------|---------|-------|
| `@convex-dev/agent` | ^0.3.2 | Agent.tools property accepts tool objects |
| `date-fns` | 4.x | Already installed, use for any date formatting |
| All shadcn/ui components | latest | Button, Badge, Card already exist |

**Installation:**
```bash
npx shadcn@latest add sonner dialog
```

No new AI libraries needed - Phase 40/41 stack complete.

## Architecture Patterns

### Recommended Project Structure
```
convex/
  ai/
    agent.ts                    # Add tools: { searchProperties }
    tools/
      propertySearch.ts         # Property search tool definition
      propertyQueries.ts        # Convex query helpers
src/
  components/
    ai/
      ChatMessage.tsx           # Add components prop for property cards
      PropertyRecommendationCard.tsx  # Inline card for properties
      PropertyDetailModal.tsx   # Modal overlay for full details
      hooks/
        usePropertySave.ts      # Save favorite mutations
```

### Pattern 1: Tool Definition with Zod Schema
**What:** Define AI tool that searches properties based on investor criteria
**When to use:** Any AI function that needs database access for grounding

**Example:**
```typescript
// convex/ai/tools/propertySearch.ts
// Source: AI SDK tool calling documentation
// https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling

import { tool } from "ai";
import { z } from "zod";
import { api } from "../../_generated/api";

export const searchPropertiesTool = tool({
  description: `Search for properties matching investor criteria.
Use this when the investor asks for property recommendations or wants to see specific properties.
Always use the investor's profile preferences (budget, locations, property types) from context.`,

  inputSchema: z.object({
    budgetMin: z.number().optional().describe("Minimum price in USD"),
    budgetMax: z.number().optional().describe("Maximum price in USD"),
    cities: z.array(z.string()).optional().describe("Israeli cities to search in"),
    propertyTypes: z.array(z.enum(["residential", "commercial", "mixed_use", "land"]))
      .optional()
      .describe("Types of properties to include"),
    minBedrooms: z.number().optional().describe("Minimum number of bedrooms"),
    maxResults: z.number().default(3).describe("Maximum number of properties to return (default 3)"),
  }),

  // Execute function receives ActionCtx from agent
  execute: async ({ budgetMin, budgetMax, cities, propertyTypes, minBedrooms, maxResults }, ctx) => {
    // ctx is the action context from agent
    const results = await ctx.runQuery(api.ai.tools.propertyQueries.searchProperties, {
      budgetMin,
      budgetMax,
      cities,
      propertyTypes,
      minBedrooms,
      limit: maxResults,
    });

    return {
      properties: results,
      count: results.length,
      message: results.length > 0
        ? `Found ${results.length} matching properties`
        : "No properties found matching these criteria",
    };
  },
});
```

### Pattern 2: Convex Multi-Criteria Property Filtering
**What:** Query properties with multiple optional filters efficiently
**When to use:** Property search with budget, location, type, bedrooms filters

**Example:**
```typescript
// convex/ai/tools/propertyQueries.ts
// Source: Convex filtering best practices
// https://docs.convex.dev/database/reading-data/filters

import { query } from "../../_generated/server";
import { v } from "convex/values";

export const searchProperties = query({
  args: {
    budgetMin: v.optional(v.number()),
    budgetMax: v.optional(v.number()),
    cities: v.optional(v.array(v.string())),
    propertyTypes: v.optional(v.array(v.string())),
    minBedrooms: v.optional(v.number()),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    // Start with all available properties
    let results = await ctx.db
      .query("properties")
      .withIndex("by_status", (q) => q.eq("status", "available"))
      .collect();

    // Apply filters in TypeScript (efficient for moderate result sets)
    if (args.budgetMin !== undefined) {
      results = results.filter(p => p.priceUsd >= args.budgetMin!);
    }
    if (args.budgetMax !== undefined) {
      results = results.filter(p => p.priceUsd <= args.budgetMax!);
    }
    if (args.cities && args.cities.length > 0) {
      results = results.filter(p => args.cities!.includes(p.city));
    }
    if (args.propertyTypes && args.propertyTypes.length > 0) {
      results = results.filter(p => args.propertyTypes!.includes(p.propertyType));
    }
    if (args.minBedrooms !== undefined && args.minBedrooms > 0) {
      results = results.filter(p =>
        p.bedrooms !== undefined && p.bedrooms >= args.minBedrooms!
      );
    }

    // Limit results and return essential fields
    return results.slice(0, args.limit).map(property => ({
      _id: property._id,
      title: property.title,
      city: property.city,
      address: property.address,
      priceUsd: property.priceUsd,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      squareMeters: property.squareMeters,
      propertyType: property.propertyType,
      featuredImage: property.featuredImage,
      expectedRoi: property.expectedRoi,
      capRate: property.capRate,
    }));
  },
});
```

**Note on performance:** For <1000 properties, filter in TypeScript is efficient and flexible. For larger datasets, create composite indexes: `by_city_and_type`, `by_price_range`. Schema already has `by_city`, `by_property_type`, `by_status` indexes.

### Pattern 3: Registering Tools with Agent
**What:** Add property search tool to investorAssistant agent
**When to use:** Extend agent capabilities with new tools

**Example:**
```typescript
// convex/ai/agent.ts
// Source: AI SDK tool registration
// https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling

import { Agent } from "@convex-dev/agent";
import { anthropic } from "@ai-sdk/anthropic";
import { components } from "../_generated/api";
import { searchPropertiesTool } from "./tools/propertySearch";

export const investorAssistant = new Agent(components.agent, {
  name: "Investor Assistant",
  languageModel: anthropic("claude-sonnet-4-20250514"),
  instructions: `You are a helpful real estate investment assistant for REOS...

When recommending properties:
- Use the searchProperties tool to find real properties from the database
- NEVER invent or hallucinate properties - only mention properties returned by tools
- Consider the investor's profile (budget, locations, property types) when searching
- Recommend 3 properties unless user asks for more/less
- Explain why each property matches (budget fit, location preference, property type match)
- Format property recommendations clearly with all key details`,

  tools: {
    searchProperties: searchPropertiesTool,
    // Future tools: searchProviders, getPropertyDetails, etc.
  },

  maxSteps: 5,
  contextOptions: { recentMessages: 10 },
});
```

### Pattern 4: Inline Property Cards in Chat Messages
**What:** Render property data as rich cards embedded in AI messages
**When to use:** Display property recommendations within chat flow

**Example:**
```typescript
// src/components/ai/ChatMessage.tsx
// Source: react-markdown custom components
// https://github.com/remarkjs/react-markdown#components

import ReactMarkdown from "react-markdown";
import { PropertyRecommendationCard } from "./PropertyRecommendationCard";

interface ChatMessageProps {
  content: string;
  isAI: boolean;
  toolResults?: Array<{ toolName: string; result: any }>;
}

export function ChatMessage({ content, isAI, toolResults }: ChatMessageProps) {
  // Find property search results in tool calls
  const propertyResults = toolResults?.find(
    t => t.toolName === "searchProperties"
  )?.result?.properties;

  return (
    <div className={cn("flex gap-3", isAI ? "justify-start" : "justify-end")}>
      <div className={cn("rounded-lg px-4 py-2", isAI ? "bg-muted" : "bg-primary")}>
        <ReactMarkdown>{content}</ReactMarkdown>

        {/* Render property cards inline after message text */}
        {propertyResults && propertyResults.length > 0 && (
          <div className="mt-4 space-y-3">
            {propertyResults.map((property: any) => (
              <PropertyRecommendationCard
                key={property._id}
                property={property}
              />
            ))}
            {propertyResults.length > 1 && (
              <SaveAllButton properties={propertyResults} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

### Pattern 5: Compact Property Card for Chat Context
**What:** Condensed property card optimized for inline display
**When to use:** Show properties within chat messages (not full listings)

**Example:**
```typescript
// src/components/ai/PropertyRecommendationCard.tsx
// Inspired by existing PropertyCard.tsx but optimized for chat

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PropertyDetailModal } from "./PropertyDetailModal";
import { HeartIcon } from "@hugeicons/core-free-icons";

interface PropertyRecommendationCardProps {
  property: {
    _id: string;
    title: string;
    city: string;
    priceUsd: number;
    bedrooms?: number;
    squareMeters?: number;
    propertyType: string;
    featuredImage?: string;
  };
}

export function PropertyRecommendationCard({ property }: PropertyRecommendationCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  return (
    <>
      <Card
        className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setModalOpen(true)}
      >
        <div className="flex gap-3 p-3">
          {/* Image thumbnail */}
          <div className="w-24 h-24 rounded bg-muted flex-shrink-0">
            {property.featuredImage && (
              <img
                src={property.featuredImage}
                alt={property.title}
                className="w-full h-full object-cover rounded"
              />
            )}
          </div>

          {/* Property info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm truncate">{property.title}</h4>
            <p className="text-xs text-muted-foreground">{property.city}</p>
            <p className="font-bold text-base mt-1">
              ${property.priceUsd.toLocaleString()}
            </p>
            <div className="flex gap-2 mt-1">
              {property.bedrooms && (
                <span className="text-xs text-muted-foreground">
                  {property.bedrooms} bed
                </span>
              )}
              {property.squareMeters && (
                <span className="text-xs text-muted-foreground">
                  {property.squareMeters} sqm
                </span>
              )}
            </div>
          </div>

          {/* Save button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              // Handle save
            }}
          >
            <HeartIcon size={16} />
          </Button>
        </div>

        {/* Match badges */}
        <div className="flex gap-1 px-3 pb-3">
          <Badge variant="secondary" className="text-xs">Budget Match</Badge>
          <Badge variant="secondary" className="text-xs">{property.city}</Badge>
          <Badge variant="secondary" className="text-xs">{property.propertyType}</Badge>
        </div>
      </Card>

      <PropertyDetailModal
        propertyId={property._id}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}
```

### Pattern 6: Batch Save with Toast Notification
**What:** Save multiple properties at once with user feedback
**When to use:** "Save All" action after property recommendations

**Example:**
```typescript
// src/components/ai/SaveAllButton.tsx
// Source: Sonner toast API
// https://ui.shadcn.com/docs/components/sonner

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface SaveAllButtonProps {
  properties: Array<{ _id: string }>;
}

export function SaveAllButton({ properties }: SaveAllButtonProps) {
  const [saved, setSaved] = useState(false);
  const saveFavorite = useMutation(api.favorites.addFavorite);

  const handleSaveAll = async () => {
    try {
      // Save all properties (silently handles duplicates)
      await Promise.all(
        properties.map(p =>
          saveFavorite({ propertyId: p._id })
            .catch(() => {}) // Ignore duplicate errors
        )
      );

      setSaved(true);
      toast.success(`${properties.length} properties saved`, {
        description: "View your saved properties in the Favorites page"
      });
    } catch (error) {
      toast.error("Failed to save properties");
    }
  };

  if (saved) {
    return (
      <Button variant="outline" disabled className="w-full">
        Saved ✓
      </Button>
    );
  }

  return (
    <Button
      variant="default"
      onClick={handleSaveAll}
      className="w-full"
    >
      Save All {properties.length} Properties
    </Button>
  );
}
```

### Pattern 7: Property Detail Modal with Dialog
**What:** Full property details overlay that keeps chat context
**When to use:** User taps property card to see more details

**Example:**
```typescript
// src/components/ai/PropertyDetailModal.tsx
// Source: shadcn Dialog component
// https://ui.shadcn.com/docs/components/dialog

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

interface PropertyDetailModalProps {
  propertyId: Id<"properties">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PropertyDetailModal({
  propertyId,
  open,
  onOpenChange
}: PropertyDetailModalProps) {
  const property = useQuery(api.properties.getPropertyById, {
    id: propertyId
  });

  if (!property) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{property.title}</DialogTitle>
        </DialogHeader>

        {/* Reuse existing PropertyGallery, PropertyFactsCard, etc. */}
        <div className="space-y-4">
          {property.featuredImage && (
            <img
              src={property.featuredImage}
              alt={property.title}
              className="w-full rounded-lg"
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Price</p>
              <p className="text-2xl font-bold">
                ${property.priceUsd.toLocaleString()}
              </p>
            </div>
            {/* More property details... */}
          </div>

          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-sm text-muted-foreground">{property.description}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### Anti-Patterns to Avoid

- **Returning property objects in AI text:** Tool results should render as cards, not JSON in message content
- **Inventing properties:** Never let AI generate property data - only reference tool results
- **Full property cards in chat:** Chat cards should be compact (thumbnail + key facts), not full PropertyCard
- **Blocking on save:** Use optimistic UI and background saves to keep chat responsive
- **Missing tool descriptions:** Detailed descriptions help Claude choose when to call tools
- **Overloading tool schema:** Limit to essential search criteria; AI can make multiple calls if needed

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Tool definition and validation | Custom tool registry | AI SDK `tool()` helper | Type inference, Zod validation, provider compatibility |
| Property filtering logic | String concatenation in WHERE clauses | Convex query filters | Type-safe, indexed queries, optimized performance |
| Toast notifications | Custom toast component | Sonner (via shadcn) | Accessibility, queue management, auto-dismiss, mobile-optimized |
| Modal overlays | Custom backdrop + portal | shadcn Dialog (Radix primitive) | Focus trap, scroll lock, ESC handling, ARIA labels |
| Save duplicates handling | Manual existence checks | Unique index constraint + catch | Race condition handling, atomic operations |
| Match explanation generation | Hardcoded template strings | Let AI explain from tool results | More natural, context-aware, adapts to edge cases |

**Key insight:** The AI SDK's tool calling architecture handles the hardest problems: schema validation, tool selection, multi-step execution, streaming tool results. Focus implementation on business logic (Convex queries, UI components) not infrastructure.

## Common Pitfalls

### Pitfall 1: AI Hallucinating Properties Despite Tools
**What goes wrong:** AI invents property details not returned by tool, mixing real IDs with fake data
**Why it happens:** AI fills gaps when tool results lack fields or when instructions unclear
**How to avoid:**
- Explicit instructions: "NEVER mention properties not in tool results"
- Return complete property objects from tool (not just IDs)
- Include "Based on these search results:" prefix in tool response
- Use `onStepFinish` callback to validate property IDs in response
**Warning signs:** Property details don't match database, IDs in message not in tool results

**Source:** RAG hallucination prevention best practices from research

### Pitfall 2: Tool Execution Context Mismatch
**What goes wrong:** Tool `execute` function receives wrong context, can't access Convex queries
**Why it happens:** Agent tools execute in action context, not query context
**How to avoid:**
```typescript
// In tool definition, execute receives ActionCtx
execute: async (args, ctx) => {
  // ctx is ActionCtx - use runQuery to call Convex queries
  const results = await ctx.runQuery(api.ai.tools.propertyQueries.searchProperties, args);
  return results;
}
```
**Warning signs:** "db is undefined" errors, can't access ctx.runQuery

**Source:** Convex Agent documentation on tool execution context

### Pitfall 3: Property Cards Not Rendering
**What goes wrong:** Tool executes successfully but cards don't appear in UI
**Why it happens:** Tool results not passed to ChatMessage component
**How to avoid:**
- Agent returns tool results in step messages
- Extract tool results from message object: `message.toolResults`
- Pass to ChatMessage: `<ChatMessage toolResults={message.toolResults} />`
- Check tool result structure matches expected format
**Warning signs:** Tool executes (visible in logs) but no cards render

**Source:** Phase 41 streaming architecture patterns

### Pitfall 4: Modal Opens But No Data Loads
**What goes wrong:** Property detail modal opens empty or shows "loading" forever
**Why it happens:** PropertyId type mismatch or query not triggered
**How to avoid:**
- Ensure propertyId is proper `Id<"properties">` type
- Use `useQuery` with proper typing: `api.properties.getPropertyById`
- Check query args match function signature exactly
- Handle loading state: `if (!property) return <Skeleton />`
**Warning signs:** Modal opens but blank, no network requests in DevTools

**Source:** Convex React hooks type safety patterns

### Pitfall 5: Search Returns No Results for Valid Criteria
**What goes wrong:** Tool returns empty array despite matching properties existing
**Why it happens:** Filter logic too strict, null handling, type mismatches
**How to avoid:**
- Make all filters optional: `if (args.budgetMin !== undefined)`
- Handle null/undefined property fields: `p.bedrooms !== undefined && p.bedrooms >= args.minBedrooms`
- Test with single filter first, add incrementally
- Log intermediate filter results to find where properties drop out
**Warning signs:** AI says "no properties found" but properties exist in database

**Source:** Convex filtering best practices documentation

### Pitfall 6: Toast Notifications Stack Infinitely
**What goes wrong:** Multiple "Saved" toasts appear, overlapping and blocking UI
**Why it happens:** Button clicked multiple times before async save completes
**How to avoid:**
- Disable button immediately: `const [isSaving, setIsSaving] = useState(false)`
- Set loading state before async call: `setIsSaving(true)`
- Handle errors properly: `finally { setIsSaving(false) }`
- Use Sonner's built-in queue management (handles multiple toasts)
**Warning signs:** Multiple identical toasts, button clickable during save

**Source:** React async button patterns and Sonner queue management

### Pitfall 7: Match Badges Don't Reflect Actual Match Logic
**What goes wrong:** All properties show "Budget Match" badge even if out of range
**Why it happens:** Badges hardcoded, not computed from actual criteria
**How to avoid:**
- Compute badges from actual property values vs. search criteria
- Pass search criteria to PropertyRecommendationCard
- Conditionally render badges: `{property.priceUsd <= budgetMax && <Badge>Budget Match</Badge>}`
- Or let AI explain matches in text (more flexible)
**Warning signs:** User questions why property with "Budget Match" exceeds their budget

**Source:** UI consistency and user trust patterns

## Code Examples

Verified patterns from official sources:

### Tool Result Extraction from Agent Messages
```typescript
// Source: @convex-dev/agent tool execution
// Agent stores tool results in message metadata

// In useAIChat hook or component consuming messages
const messagesWithTools = messages.map(msg => {
  // Extract tool results from agent message format
  const toolResults = msg.toolCalls?.map(call => ({
    toolName: call.toolName,
    result: call.result,
  })) || [];

  return {
    ...msg,
    toolResults,
  };
});
```

### Convex Query with Optional Multi-Criteria Filters
```typescript
// Source: Convex filtering patterns
// https://stack.convex.dev/complex-filters-in-convex

import { query } from "./_generated/server";
import { v } from "convex/values";

export const searchProperties = query({
  args: {
    budgetMin: v.optional(v.number()),
    budgetMax: v.optional(v.number()),
    cities: v.optional(v.array(v.string())),
    propertyTypes: v.optional(v.array(v.string())),
    minBedrooms: v.optional(v.number()),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    // Start with indexed query for available properties
    let results = await ctx.db
      .query("properties")
      .withIndex("by_status", (q) => q.eq("status", "available"))
      .collect();

    // Apply filters in order of selectivity (most to least)
    if (args.cities && args.cities.length > 0) {
      results = results.filter(p => args.cities!.includes(p.city));
    }
    if (args.propertyTypes && args.propertyTypes.length > 0) {
      results = results.filter(p => args.propertyTypes!.includes(p.propertyType));
    }
    if (args.budgetMin !== undefined) {
      results = results.filter(p => p.priceUsd >= args.budgetMin!);
    }
    if (args.budgetMax !== undefined) {
      results = results.filter(p => p.priceUsd <= args.budgetMax!);
    }
    if (args.minBedrooms !== undefined) {
      results = results.filter(p =>
        p.bedrooms !== undefined && p.bedrooms >= args.minBedrooms!
      );
    }

    return results.slice(0, args.limit);
  },
});
```

### Sonner Toast Installation and Setup
```typescript
// Source: shadcn/ui Sonner component
// https://ui.shadcn.com/docs/components/sonner

// 1. Install
// npx shadcn@latest add sonner

// 2. Add to root layout (app/layout.tsx or similar)
import { Toaster } from "@/components/ui/sonner"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}

// 3. Use in components
import { toast } from "sonner"

toast.success("3 properties saved")
toast.error("Failed to save")
toast("Property bookmarked", {
  description: "View in your Favorites",
  action: {
    label: "View",
    onClick: () => router.push("/favorites")
  }
})
```

### Save Favorite with Duplicate Handling
```typescript
// Source: Convex unique constraint pattern
// Schema has .index("by_user_and_property", ["userId", "propertyId"])

// convex/favorites.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const addFavorite = mutation({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, { propertyId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    // Check if already exists
    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user_and_property", (q) =>
        q.eq("userId", user._id).eq("propertyId", propertyId)
      )
      .unique();

    // Silently return if already saved (idempotent)
    if (existing) return existing._id;

    // Create new favorite
    return await ctx.db.insert("favorites", {
      userId: user._id,
      propertyId,
      createdAt: Date.now(),
    });
  },
});
```

### Property Detail Modal with shadcn Dialog
```typescript
// Source: shadcn/ui Dialog patterns
// https://ui.shadcn.com/docs/components/dialog

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function PropertyDetailModal({ propertyId, open, onOpenChange }) {
  const property = useQuery(api.properties.getPropertyById, { id: propertyId });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{property?.title}</DialogTitle>
        </DialogHeader>

        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[70vh]">
          {/* Property details... */}
        </div>

        {/* Sticky footer actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
          <Button variant="default">Contact Agent</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| RAG via manual vector search | AI SDK tool calling with structured queries | AI SDK 5/6 (2024-2025) | Simpler implementation, better type safety, streaming support |
| JSON in message content | Custom markdown components | react-markdown 9.x (2024) | Better UX, interactive cards, no parsing |
| react-toastify | Sonner | shadcn adoption (2025) | Smaller bundle, better mobile UX, queue management |
| Custom modal portals | Radix Dialog primitives | Radix UI maturity (2024) | Accessibility, focus management, keyboard nav |
| Sequential property saves | Promise.all batch operations | JavaScript best practices | Faster bulk operations, better UX |
| Hardcoded match explanations | AI-generated explanations from tool results | LLM context understanding (2025) | More natural, adapts to edge cases |

**Deprecated/outdated:**
- **Direct Anthropic SDK for tools:** Prefer AI SDK `tool()` helper for type safety and provider abstraction
- **shadcn Toast component:** Officially deprecated in favor of Sonner
- **react-modal:** Community library superseded by Radix/shadcn Dialog with better accessibility
- **Custom property embedding logic:** AI SDK handles tool result formatting and streaming natively

## Open Questions

Things that couldn't be fully resolved:

1. **Tool Result Structure in Agent Messages**
   - What we know: `@convex-dev/agent` stores tool calls and results in message metadata
   - What's unclear: Exact structure of `message.toolCalls` array after streaming completes
   - Recommendation: Inspect actual message object in Phase 42-01, may need to call `investorAssistant.listMessages` to get full tool result data

2. **Optimal Property Result Count**
   - What we know: Context says "3 properties per recommendation (focused)"
   - What's unclear: Whether AI should always return exactly 3 or adapt based on query specificity
   - Recommendation: Default to 3 in tool schema, let AI decide via `maxResults` parameter if user asks for more/fewer

3. **Match Badge Computation Location**
   - What we know: Badges should show why property matches (Budget, Location, Property Type)
   - What's unclear: Whether to compute badges in component or pass search criteria from tool
   - Recommendation: Let AI explain matches in text (more flexible), use simple badges for key criteria (city, type)

4. **Property Modal Content Reuse**
   - What we know: Existing PropertyCard, PropertyGallery, PropertyFactsCard components exist
   - What's unclear: Whether to reuse these directly or create chat-optimized versions
   - Recommendation: Reuse existing components in modal for consistency, create compact PropertyRecommendationCard for inline display

## Sources

### Primary (HIGH confidence)
- [AI SDK Tool Calling Documentation](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling) - Tool definition, registration, execution patterns
- [AI SDK Anthropic Provider](https://ai-sdk.dev/providers/ai-sdk-providers/anthropic) - Claude Sonnet 4 tool support, streaming with tools
- [Convex Reading Data Filters](https://docs.convex.dev/database/reading-data/filters) - Multi-criteria filtering patterns
- [Convex Best Practices](https://docs.convex.dev/understanding/best-practices/) - Query optimization, index usage
- [shadcn/ui Sonner Component](https://ui.shadcn.com/docs/components/sonner) - Toast installation, API, examples
- [shadcn/ui Dialog Component](https://ui.shadcn.com/docs/components/dialog) - Modal patterns, accessibility
- [react-markdown GitHub](https://github.com/remarkjs/react-markdown) - Custom components API

### Secondary (MEDIUM confidence)
- [AI Grounding with Agentic RAG](https://www.moveworks.com/us/en/resources/blog/improved-ai-grounding-with-agentic-rag) - RAG best practices for hallucination prevention
- [Hallucination Mitigation Strategies](https://www.voiceflow.com/blog/prevent-llm-hallucinations) - 5 proven strategies including RAG grounding
- [Using TypeScript to Write Complex Query Filters](https://stack.convex.dev/complex-filters-in-convex) - Convex filtering patterns
- [React Modal Best Practices 2026](https://www.patterns.dev/react/react-2026/) - Modal architecture patterns
- [Top 9 React Notification Libraries 2026](https://knock.app/blog/the-top-notification-libraries-for-react) - Toast library comparison
- [React Toastify Complete Guide 2026](https://deadsimplechat.com/blog/react-toastify-the-complete-guide/) - Toast patterns (though shadcn uses Sonner now)

### Tertiary (LOW confidence)
- Phase 40/41 RESEARCH.md files - Existing codebase patterns (verified via file reads)
- convex/schema.ts - Database structure (verified via file read)
- src/components/properties/PropertyCard.tsx - Existing UI patterns (verified via file read)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified as current (AI SDK 6, Sonner 2026, shadcn latest)
- Architecture: HIGH - Patterns from official docs (AI SDK tools, Convex queries, shadcn components)
- RAG grounding: HIGH - Tool calling approach confirmed in AI SDK and Anthropic documentation
- Pitfalls: MEDIUM - Based on common patterns and documentation, not all verified in this codebase
- Tool result structure: MEDIUM - Agent documentation clear but exact message format needs verification in implementation

**Research date:** 2026-01-22
**Valid until:** ~30 days (AI SDK and Convex stable, React patterns mature)

**Note:** Phase 42 builds directly on Phase 40-41 infrastructure. No backend architecture changes needed - only extending agent with tools and adding UI components for property display. Focus is on tool definition, property queries, and inline card rendering.
