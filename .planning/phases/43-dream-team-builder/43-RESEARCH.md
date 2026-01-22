# Phase 43: Dream Team Builder - Research

**Researched:** 2026-01-22
**Domain:** AI-powered service provider recommendation with match explanations
**Confidence:** HIGH

## Summary

Phase 43 builds on Phase 42's AI recommendation architecture to suggest service providers (brokers, mortgage advisors, lawyers) with personalized match explanations. The technical foundation exists: `@convex-dev/agent` with tool calling (Phase 40-42), provider profiles with ratings/reviews (schema complete), and inline card rendering patterns (PropertyRecommendationCard).

The established approach mirrors Phase 42: define provider search tool using `createTool()` from `@convex-dev/agent`, implement Convex queries with multi-criteria filtering (budget, location, service areas, specializations), render compact provider cards as custom components within chat messages, and use accordion sections for role-based grouping. The AI agent generates natural match explanations from tool results, grounding recommendations in actual profile data.

Key difference from Phase 42: multiple role types require structured presentation. User decisions specify accordion layout with all sections expanded initially, compact cards with availability status and star ratings, and direct "Add" buttons with optimistic UI feedback. Provider infrastructure already exists (profiles, reviews, analytics) — this phase adds discovery layer.

**Primary recommendation:** Define searchProviders tool with role-based filtering, implement Convex query with profile+user joins and availability checks, create ProviderRecommendationCard matching PropertyRecommendationCard patterns, use shadcn Accordion (already installed) for role grouping, add team management mutations for provider selection, and let AI generate personalized match explanations from investor profile data.

## Standard Stack

The established libraries/tools for AI provider recommendations:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@convex-dev/agent` | ^0.3.2 | Tool definition via `createTool()` | Already in use (Phase 40-42), native Claude tool calling |
| `@ai-sdk/anthropic` | latest | Claude Sonnet 4 provider with tool streaming | Already in use, full tool calling support |
| `zod` | ^4.3.5 | Tool input schema validation | Already in use, required by agent tools |
| `sonner` | latest | Toast notifications for "Added to team" feedback | Already installed (Phase 42), modern toast solution |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn/ui Accordion | latest | Collapsible role sections (Brokers, Advisors, Lawyers) | Already installed, accessible Radix primitives |
| shadcn/ui Dialog | latest | Provider detail modal (full profile view) | Already installed (Phase 42), accessible overlay |
| shadcn/ui Badge | latest | Match reason badges, availability status | Already in use throughout codebase |

### Already Installed
| Library | Version | Notes |
|---------|---------|-------|
| All shadcn/ui components | latest | Button, Card, Badge, Dialog, Accordion exist |
| `@hugeicons/react` | latest | Used for icons in property cards, reuse for providers |
| Convex indexes | 1.31.3+ | `by_provider_type`, `by_user` indexes exist on serviceProviderProfiles |

**Installation:**
```bash
# No new installations needed - Phase 40-42 stack complete
# Accordion already installed, verify with: ls src/components/ui/accordion.tsx
```

Phase 42's AI infrastructure handles provider recommendations without new dependencies.

## Architecture Patterns

### Recommended Project Structure
```
convex/
  ai/
    agent.ts                    # Add searchProviders to tools
    tools/
      providerSearch.ts         # Provider search tool definition
      providerQueries.ts        # Convex query helpers for providers
  teamManagement.ts             # Mutations for adding/removing team members
src/
  components/
    ai/
      ChatMessage.tsx           # Already handles tool results, extend for providers
      ProviderCardRenderer.tsx  # Extract & render provider cards from tool results
      ProviderRecommendationCard.tsx  # Compact inline card for providers
      ProviderDetailModal.tsx   # Modal overlay for full provider profile
      hooks/
        useProviderAdd.ts       # Add provider to team mutation hook
```

### Pattern 1: Multi-Role Provider Search Tool
**What:** Define AI tool that searches providers across multiple roles with filtering
**When to use:** AI needs to recommend brokers, mortgage advisors, lawyers based on investor needs

**Example:**
```typescript
// convex/ai/tools/providerSearch.ts
// Source: Phase 42 propertySearch.ts pattern + Phase 43 requirements

import { createTool } from "@convex-dev/agent";
import { z } from "zod";
import { api } from "../../_generated/api";

export const searchProvidersTool = createTool({
  description: `Search for service providers (brokers, mortgage advisors, lawyers) based on investor needs.
Use this tool when:
- Investor asks for provider recommendations or wants to build a team
- Investor specifies budget, location, or provider preferences
- After showing properties, prompt investor to build their team

This tool searches real provider profiles with ratings, experience, and availability.
NEVER invent providers - only mention providers returned by this tool.`,

  args: z.object({
    roles: z
      .array(z.enum(["broker", "mortgage_advisor", "lawyer"]))
      .describe("Provider roles to search for (e.g., ['broker', 'mortgage_advisor', 'lawyer'])"),

    serviceAreas: z
      .array(z.string())
      .optional()
      .describe("Israeli cities where provider must offer services (from investor's target locations)"),

    budgetRange: z
      .object({
        min: z.number(),
        max: z.number(),
      })
      .optional()
      .describe("Investor's budget range (for context, some providers specialize in certain price points)"),

    languages: z
      .array(z.enum(["english", "hebrew", "russian", "french", "spanish"]))
      .optional()
      .describe("Languages investor prefers (e.g., ['english', 'hebrew'])"),

    maxPerRole: z
      .number()
      .default(3)
      .describe("Maximum providers per role to return (default: 3, max: 5)"),
  }),

  handler: async (ctx, args) => {
    const limit = Math.min(args.maxPerRole, 5);

    // Search providers for each requested role
    const providersByRole: Record<string, any[]> = {};

    for (const role of args.roles) {
      const providers = await ctx.runQuery(
        api.ai.tools.providerQueries.searchProviders,
        {
          providerType: role,
          serviceAreas: args.serviceAreas,
          languages: args.languages,
          limit,
        }
      );

      providersByRole[role] = providers;
    }

    // Calculate total count
    const totalCount = Object.values(providersByRole).reduce(
      (sum, providers) => sum + providers.length,
      0
    );

    return {
      providersByRole,
      totalCount,
      searchCriteria: {
        roles: args.roles,
        serviceAreas: args.serviceAreas,
        budgetRange: args.budgetRange,
        languages: args.languages,
      },
      message:
        totalCount > 0
          ? `Found ${totalCount} providers: ${Object.entries(providersByRole)
              .map(([role, providers]) => `${providers.length} ${role}${providers.length !== 1 ? 's' : ''}`)
              .join(", ")}`
          : "No providers found matching criteria",
    };
  },
});
```

### Pattern 2: Provider Query with Profile Enrichment
**What:** Query providers with user info, reviews, and availability data
**When to use:** Search providers with all data needed for cards and match explanations

**Example:**
```typescript
// convex/ai/tools/providerQueries.ts
// Source: Convex query patterns + existing serviceProviderProfiles.ts

import { query } from "../../_generated/server";
import { v } from "convex/values";

export const searchProviders = query({
  args: {
    providerType: v.union(
      v.literal("broker"),
      v.literal("mortgage_advisor"),
      v.literal("lawyer")
    ),
    serviceAreas: v.optional(v.array(v.string())),
    languages: v.optional(v.array(v.string())),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    // Get all profiles for this role
    let profiles = await ctx.db
      .query("serviceProviderProfiles")
      .withIndex("by_provider_type", (q) =>
        q.eq("providerType", args.providerType)
      )
      .collect();

    // Filter by service areas (location match)
    if (args.serviceAreas && args.serviceAreas.length > 0) {
      profiles = profiles.filter((p) =>
        args.serviceAreas!.some((area) =>
          p.serviceAreas.some((sa) =>
            sa.toLowerCase() === area.toLowerCase()
          )
        )
      );
    }

    // Filter by languages
    if (args.languages && args.languages.length > 0) {
      profiles = profiles.filter((p) =>
        args.languages!.some((lang) => p.languages.includes(lang as any))
      );
    }

    // Enrich with user info, reviews, and availability
    const enrichedProfiles = await Promise.all(
      profiles.map(async (profile) => {
        // Get user info
        const user = await ctx.db.get(profile.userId);

        // Get reviews for rating calculation
        const reviews = await ctx.db
          .query("providerReviews")
          .withIndex("by_provider", (q) => q.eq("providerId", profile.userId))
          .collect();

        const avgRating =
          reviews.length > 0
            ? Math.round(
                (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10
              ) / 10
            : 0;

        // Get availability status
        const acceptingNewClients = profile.acceptingNewClients ?? true;

        // Count completed deals
        const allDeals = await ctx.db
          .query("deals")
          .withIndex("by_stage", (q) => q.eq("stage", "completed"))
          .collect();

        const completedDeals = allDeals.filter(
          (deal) =>
            deal.brokerId === profile.userId ||
            deal.mortgageAdvisorId === profile.userId ||
            deal.lawyerId === profile.userId
        ).length;

        return {
          _id: profile.userId,
          name: user?.name ?? "Unknown",
          imageUrl: user?.imageUrl,
          providerType: profile.providerType,
          companyName: profile.companyName,
          yearsExperience: profile.yearsExperience ?? 0,
          specializations: profile.specializations,
          serviceAreas: profile.serviceAreas,
          languages: profile.languages,
          bio: profile.bio,
          avgRating,
          totalReviews: reviews.length,
          completedDeals,
          acceptingNewClients,
        };
      })
    );

    // Sort by rating, then experience, then completed deals
    enrichedProfiles.sort((a, b) => {
      if (b.avgRating !== a.avgRating) return b.avgRating - a.avgRating;
      if (b.yearsExperience !== a.yearsExperience)
        return b.yearsExperience - a.yearsExperience;
      return b.completedDeals - a.completedDeals;
    });

    return enrichedProfiles.slice(0, args.limit);
  },
});
```

### Pattern 3: Registering Provider Tool with Agent
**What:** Add searchProviders tool to investorAssistant agent
**When to use:** Extend agent with team-building capabilities

**Example:**
```typescript
// convex/ai/agent.ts
// Source: Existing agent.ts + Phase 43 requirements

import { Agent } from "@convex-dev/agent";
import { anthropic } from "@ai-sdk/anthropic";
import { components } from "../_generated/api";
import { searchPropertiesTool } from "./tools/propertySearch";
import { searchProvidersTool } from "./tools/providerSearch";

export const investorAssistant = new Agent(components.agent, {
  name: "Investor Assistant",
  languageModel: anthropic("claude-sonnet-4-20250514"),
  instructions: `You are a helpful real estate investment assistant for REOS...

When recommending properties:
[existing property instructions...]

When recommending service providers:
- Use the searchProviders tool to find real providers from the database
- NEVER invent providers - only mention providers returned by the tool
- Recommend 2-3 providers per role (broker, mortgage_advisor, lawyer)
- Consider investor's target locations, budget range, and language preferences
- For EACH provider, explain 2-3 specific reasons why they match

Match explanation style for providers:
"[Provider Name] is a strong match because:
1. Covers [City] where you're looking to invest
2. Specializes in [specialization] properties
3. [X] years experience with [Y] completed deals"

"I recommend [Provider Name] because:
1. Speaks [language], matching your language preference
2. Average rating of [X.X] stars from [Y] investors
3. Currently accepting new clients, available now"

When to suggest building a team:
- After showing properties: "Ready to move forward? Let me suggest brokers, mortgage advisors, and lawyers for your target areas."
- When investor asks about next steps
- When investor expresses interest in a property

Guidelines:
- Present all roles in one message (Brokers, Mortgage Advisors, Lawyers sections)
- Reference investor profile data in match explanations (specific cities, budget, languages)
- If provider has no reviews yet: mention experience and specializations instead
- Never rank/compare providers - present as equally valid options`,

  tools: {
    searchProperties: searchPropertiesTool,
    searchProviders: searchProvidersTool,
  },

  maxSteps: 5,
  contextOptions: CONTEXT_OPTIONS,
});
```

### Pattern 4: Accordion-Based Role Grouping
**What:** Group provider cards by role using collapsible accordion sections
**When to use:** Display multiple provider roles in organized, scannable layout

**Example:**
```typescript
// src/components/ai/ProviderCardRenderer.tsx
// Source: Phase 42 PropertyCardRenderer + shadcn Accordion patterns

import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ProviderRecommendationCard } from "./ProviderRecommendationCard";

interface ToolCall {
  toolCallId: string;
  toolName: string;
  args: any;
  result?: any;
}

export function ProviderCardRenderer({
  toolCalls,
  isExecuting,
}: {
  toolCalls?: ToolCall[];
  isExecuting?: boolean;
}) {
  if (isExecuting) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
        <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin" />
        <span>Searching providers...</span>
      </div>
    );
  }

  if (!toolCalls || toolCalls.length === 0) return null;

  const searchTool = toolCalls.find((t) => t.toolName === "searchProviders");
  if (!searchTool?.result) return null;

  const { providersByRole, totalCount, searchCriteria } = searchTool.result;

  if (!providersByRole || totalCount === 0) return null;

  // Map role names to display labels
  const roleLabels: Record<string, string> = {
    broker: "Brokers",
    mortgage_advisor: "Mortgage Advisors",
    lawyer: "Lawyers",
  };

  // Get all roles that have providers
  const rolesWithProviders = Object.entries(providersByRole)
    .filter(([_, providers]) => providers.length > 0)
    .map(([role]) => role);

  // Summary count
  const summary = Object.entries(providersByRole)
    .filter(([_, providers]) => providers.length > 0)
    .map(([role, providers]) =>
      `${providers.length} ${roleLabels[role]?.toLowerCase() || role}`
    )
    .join(", ");

  return (
    <div className="flex flex-col gap-2 mt-2">
      {/* Summary */}
      <p className="text-sm text-muted-foreground">
        Found {totalCount} providers: {summary}
      </p>

      {/* Accordion for role sections - all start expanded */}
      <Accordion
        type="multiple"
        defaultValue={rolesWithProviders}
        className="w-full"
      >
        {Object.entries(providersByRole).map(([role, providers]) => {
          if (providers.length === 0) return null;

          return (
            <AccordionItem key={role} value={role}>
              <AccordionTrigger className="text-base font-semibold">
                {roleLabels[role] || role} ({providers.length})
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {providers.map((provider: any) => (
                    <ProviderRecommendationCard
                      key={provider._id}
                      provider={provider}
                      searchCriteria={searchCriteria}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
```

### Pattern 5: Compact Provider Card with Add Button
**What:** Condensed provider card with photo, name, role, match reason, rating, availability
**When to use:** Display providers inline within chat messages

**Example:**
```typescript
// src/components/ai/ProviderRecommendationCard.tsx
// Source: Phase 42 PropertyRecommendationCard pattern + Phase 43 decisions

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserIcon, StarIcon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Id } from "../../../convex/_generated/dataModel";
import { ProviderDetailModal } from "./ProviderDetailModal";
import { useProviderAdd } from "./hooks/useProviderAdd";

interface ProviderData {
  _id: Id<"users">;
  name: string;
  imageUrl?: string;
  providerType: "broker" | "mortgage_advisor" | "lawyer";
  companyName?: string;
  yearsExperience: number;
  specializations: string[];
  serviceAreas: string[];
  languages: string[];
  avgRating: number;
  totalReviews: number;
  completedDeals: number;
  acceptingNewClients: boolean;
}

export function ProviderRecommendationCard({
  provider,
  searchCriteria,
}: {
  provider: ProviderData;
  searchCriteria?: any;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const { isOnTeam, isAdding, addToTeam } = useProviderAdd(
    provider._id,
    provider.providerType
  );

  // Compute availability status text
  const availabilityText = provider.acceptingNewClients
    ? "Available now"
    : "Not accepting clients";

  const handleAddClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await addToTeam();
  };

  return (
    <>
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setModalOpen(true)}
      >
        <CardContent className="p-3">
          <div className="flex gap-3">
            {/* Photo */}
            <div className="shrink-0">
              {provider.imageUrl ? (
                <img
                  src={provider.imageUrl}
                  alt={provider.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <HugeiconsIcon
                    icon={UserIcon}
                    size={20}
                    className="text-muted-foreground"
                  />
                </div>
              )}
            </div>

            {/* Provider info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">
                    {provider.name}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate">
                    {provider.companyName ||
                     provider.providerType.split("_").map(w =>
                       w.charAt(0).toUpperCase() + w.slice(1)
                     ).join(" ")}
                  </p>
                </div>

                {/* Add/On Team button */}
                {isOnTeam ? (
                  <Badge variant="secondary" className="shrink-0">
                    <HugeiconsIcon
                      icon={CheckmarkCircle02Icon}
                      size={12}
                      className="mr-1"
                    />
                    On Team
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    variant="default"
                    className="h-7 px-3 text-xs shrink-0"
                    onClick={handleAddClick}
                    disabled={isAdding}
                  >
                    {isAdding ? "Adding..." : "Add"}
                  </Button>
                )}
              </div>

              {/* Rating and availability */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                {provider.totalReviews > 0 && (
                  <div className="flex items-center gap-1">
                    <HugeiconsIcon icon={StarIcon} size={12} className="text-yellow-500 fill-yellow-500" />
                    <span className="font-medium text-foreground">
                      {provider.avgRating.toFixed(1)}
                    </span>
                    <span>({provider.totalReviews})</span>
                  </div>
                )}
                <span>•</span>
                <span className={provider.acceptingNewClients ? "text-green-600" : ""}>
                  {availabilityText}
                </span>
              </div>

              {/* 1-line match reason (populated by AI or computed) */}
              <p className="text-xs text-muted-foreground line-clamp-1">
                {provider.yearsExperience} years experience, {provider.completedDeals} deals
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ProviderDetailModal
        providerId={provider._id}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}
```

### Pattern 6: Add Provider to Team with Toast Feedback
**What:** Mutation to add provider to investor's deal with optimistic UI
**When to use:** User clicks "Add" button on provider card

**Example:**
```typescript
// convex/teamManagement.ts
// New file for team management mutations

import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const addProviderToTeam = mutation({
  args: {
    providerId: v.id("users"),
    providerType: v.union(
      v.literal("broker"),
      v.literal("mortgage_advisor"),
      v.literal("lawyer")
    ),
    dealId: v.optional(v.id("deals")), // Optional: specific deal or "default team"
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");
    if (user.role !== "investor") throw new Error("Only investors can add team members");

    // Get or create an active deal for this investor
    // For Phase 43: we need a "team building" deal context
    let deal = args.dealId
      ? await ctx.db.get(args.dealId)
      : await ctx.db
          .query("deals")
          .withIndex("by_investor", (q) => q.eq("investorId", user._id))
          .filter((q) => q.neq(q.field("stage"), "completed"))
          .filter((q) => q.neq(q.field("stage"), "cancelled"))
          .first();

    // If no active deal, create a placeholder (or return error if deal required)
    if (!deal) {
      // Option: Create pending deal for team building
      // For now, throw error - investor should have viewed properties first
      throw new Error("No active deal. Please view properties before building team.");
    }

    // Check if provider already assigned
    const fieldMap = {
      broker: "brokerId",
      mortgage_advisor: "mortgageAdvisorId",
      lawyer: "lawyerId",
    } as const;

    const field = fieldMap[args.providerType];
    if (deal[field]) {
      throw new Error(`${args.providerType} already assigned to this deal`);
    }

    // Assign provider to deal
    await ctx.db.patch(deal._id, {
      [field]: args.providerId,
      updatedAt: Date.now(),
    });

    // Log activity
    await ctx.db.insert("dealActivity", {
      dealId: deal._id,
      actorId: user._id,
      activityType: "provider_assigned",
      details: {
        providerId: args.providerId,
        providerType: args.providerType,
      },
      createdAt: Date.now(),
    });

    return { success: true, dealId: deal._id };
  },
});

export const removeProviderFromTeam = mutation({
  args: {
    dealId: v.id("deals"),
    providerType: v.union(
      v.literal("broker"),
      v.literal("mortgage_advisor"),
      v.literal("lawyer")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    const deal = await ctx.db.get(args.dealId);
    if (!deal) throw new Error("Deal not found");
    if (deal.investorId !== user._id) throw new Error("Not authorized");

    // Remove provider
    const fieldMap = {
      broker: "brokerId",
      mortgage_advisor: "mortgageAdvisorId",
      lawyer: "lawyerId",
    } as const;

    const field = fieldMap[args.providerType];
    const providerId = deal[field];

    await ctx.db.patch(deal._id, {
      [field]: undefined,
      updatedAt: Date.now(),
    });

    // Log activity
    await ctx.db.insert("dealActivity", {
      dealId: deal._id,
      actorId: user._id,
      activityType: "provider_removed",
      details: {
        providerId,
        providerType: args.providerType,
      },
      createdAt: Date.now(),
    });

    return { success: true };
  },
});
```

```typescript
// src/components/ai/hooks/useProviderAdd.ts
// Source: Phase 42 usePropertySave.ts pattern

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { toast } from "sonner";

export function useProviderAdd(
  providerId: Id<"users">,
  providerType: "broker" | "mortgage_advisor" | "lawyer"
) {
  const [isAdding, setIsAdding] = useState(false);
  const addProvider = useMutation(api.teamManagement.addProviderToTeam);

  // Check if provider is already on team (query active deals)
  const deals = useQuery(api.deals.getMyDeals);
  const isOnTeam =
    deals?.some((deal) => {
      if (providerType === "broker") return deal.brokerId === providerId;
      if (providerType === "mortgage_advisor") return deal.mortgageAdvisorId === providerId;
      if (providerType === "lawyer") return deal.lawyerId === providerId;
      return false;
    }) ?? false;

  const addToTeam = async () => {
    if (isOnTeam) return;

    setIsAdding(true);
    try {
      await addProvider({ providerId, providerType });

      toast.success("Added to your team", {
        description: "You can now contact this provider about your deal",
      });
    } catch (error) {
      toast.error("Failed to add provider", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return { isOnTeam, isAdding, addToTeam };
}
```

### Anti-Patterns to Avoid

- **Returning provider objects in AI text:** Tool results should render as cards, not JSON in messages
- **Inventing providers:** Never let AI generate provider data - only reference tool results
- **Full provider profiles in cards:** Chat cards should be compact (photo + name + 1-line), not full profiles
- **Single role per message:** Present all roles (brokers, advisors, lawyers) in one accordion, not separate messages
- **Comparing providers:** Don't rank or compare (e.g., "X is better than Y") - present as equally valid options
- **Generic match reasons:** Use investor's actual data ("Covers Tel Aviv" not just "Location match")
- **Missing availability:** Always show accepting/not accepting status - critical for user decisions

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Collapsible sections | Custom expand/collapse logic | shadcn Accordion (Radix primitive) | Accessibility (keyboard nav, ARIA), animation, focus management |
| Provider filtering | String matching in JavaScript | Convex query filters with indexes | Performance, type safety, indexed lookups |
| Team management state | Local React state tracking | Convex mutations with dealActivity log | Persistence, audit trail, multi-device sync |
| Match explanation generation | Hardcoded templates | Let AI explain from tool results + profile | More natural, adapts to edge cases, references actual data |
| Availability status | Real-time polling | Convex reactive queries | Automatic updates, no polling overhead |
| Rating display | Custom star components | Badge with StarIcon from @hugeicons | Consistent with property cards, simpler |

**Key insight:** Phase 42's architecture (tool calling, card rendering, modal overlays) transfers directly to providers. The hard problems (tool execution, streaming results, UI state management) are solved. Focus on business logic: provider queries, match criteria, team mutations.

## Common Pitfalls

### Pitfall 1: AI Inventing Providers Despite Tool
**What goes wrong:** AI mentions providers not returned by tool, mixing real names with fake data
**Why it happens:** AI fills gaps when tool returns empty or when instructions unclear
**How to avoid:**
- Explicit instructions: "NEVER mention providers not in tool results"
- Return complete provider objects (name, image, ratings) from tool
- Include "Based on these providers:" prefix in tool response
- Let AI generate match explanations from returned data, not from training
**Warning signs:** Provider names don't match database, details in message not in tool result

**Source:** Phase 42 RAG hallucination prevention patterns

### Pitfall 2: Missing Provider When Already on Team
**What goes wrong:** "Add" button appears even though provider already assigned to active deal
**Why it happens:** Query doesn't check all deals, or role field mismatch (broker vs brokerId)
**How to avoid:**
- Query ALL active deals (not completed/cancelled) for current investor
- Check correct field per role: `broker -> brokerId`, `mortgage_advisor -> mortgageAdvisorId`, `lawyer -> lawyerId`
- Use computed `isOnTeam` from hook, not local state
**Warning signs:** User can add same provider twice, "Already assigned" errors

**Source:** Convex query patterns and schema analysis

### Pitfall 3: Accordion Sections Don't Start Expanded
**What goes wrong:** User sees closed sections, must click to expand each role
**Why it happens:** Accordion defaultValue not set, or type="single" instead of "multiple"
**How to avoid:**
```typescript
<Accordion
  type="multiple"  // NOT "single" - allows multiple open
  defaultValue={["broker", "mortgage_advisor", "lawyer"]}  // All roles start open
>
```
**Warning signs:** Only one section expands at a time, no sections open by default

**Source:** shadcn Accordion component API and Phase 43 user decisions

### Pitfall 4: Match Explanations Too Generic
**What goes wrong:** AI says "Budget match" without specific amounts, "Location match" without cities
**Why it happens:** Tool result doesn't include search criteria, or AI instructions don't emphasize specificity
**How to avoid:**
- Return `searchCriteria` in tool result with investor's actual values
- Agent instructions: "Reference specific data (e.g., 'Covers Tel Aviv, your target city' not just 'Location match')"
- Pass investor profile to AI via context, not just to tool
**Warning signs:** User sees generic badges/text, can't tell WHY provider matches

**Source:** AI explanation quality from research

### Pitfall 5: No Deal Context for Team Building
**What goes wrong:** User can't add providers because no active deal exists
**Why it happens:** Team management requires dealId, but investor hasn't started a deal yet
**How to avoid:**
- Option A: Create "team building" placeholder deal when investor first views properties
- Option B: Allow adding to "wishlist team" (stored separately), attach to deal when created
- Option C: Prompt user to favorite a property first (creates deal context)
- Clear error message: "View properties first to start building your team"
**Warning signs:** "No active deal" errors after provider recommendations

**Source:** Schema analysis - team stored on deals table

### Pitfall 6: Provider Cards Render But No Data Shows
**What goes wrong:** Tool executes, cards render, but names/images/ratings blank
**Why it happens:** Provider query doesn't join user info, or enrichment Promise.all fails
**How to avoid:**
- Enrich providers with `await ctx.db.get(profile.userId)` for user info
- Calculate `avgRating` from reviews query within same query handler
- Handle missing data: `user?.name ?? "Unknown Provider"`
- Test with providers who have no reviews, no profile image
**Warning signs:** Empty cards, "Unknown" showing, console errors about null

**Source:** Convex query patterns and existing serviceProviderProfiles.ts

### Pitfall 7: Multiple Providers Per Role Without Clarity
**What goes wrong:** User confused about whether they can/should add multiple brokers
**Why it happens:** Phase 43 decisions say "Claude's discretion" on multiple per role
**How to avoid:**
- Schema allows only ONE provider per role per deal (`brokerId` not `brokerIds`)
- If adding second provider of same role: prompt "Replace current broker?"
- Or: show "Already have a broker for this deal" and disable Add
- Clear in UI: one provider per role per deal (different deals can have different providers)
**Warning signs:** User adds multiple brokers, second one replaces first silently

**Source:** Schema analysis and Phase 43 context decisions

## Code Examples

Verified patterns from official sources:

### Accordion with Multiple Sections Expanded
```typescript
// Source: shadcn/ui Accordion API
// https://ui.shadcn.com/docs/components/accordion

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Multiple sections open at once
<Accordion
  type="multiple"  // Key: "multiple" not "single"
  defaultValue={["brokers", "advisors", "lawyers"]}  // All start expanded
  className="w-full"
>
  <AccordionItem value="brokers">
    <AccordionTrigger>Brokers (3)</AccordionTrigger>
    <AccordionContent>
      {/* Broker cards */}
    </AccordionContent>
  </AccordionItem>

  <AccordionItem value="advisors">
    <AccordionTrigger>Mortgage Advisors (2)</AccordionTrigger>
    <AccordionContent>
      {/* Advisor cards */}
    </AccordionContent>
  </AccordionItem>

  <AccordionItem value="lawyers">
    <AccordionTrigger>Lawyers (2)</AccordionTrigger>
    <AccordionContent>
      {/* Lawyer cards */}
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

### Provider Query with Multi-Criteria Filtering
```typescript
// Source: Convex filtering patterns (Phase 42 propertyQueries.ts)
// https://docs.convex.dev/database/reading-data/filters

import { query } from "./_generated/server";
import { v } from "convex/values";

export const searchProviders = query({
  args: {
    providerType: v.union(v.literal("broker"), v.literal("mortgage_advisor"), v.literal("lawyer")),
    serviceAreas: v.optional(v.array(v.string())),
    languages: v.optional(v.array(v.string())),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    // Start with indexed query
    let profiles = await ctx.db
      .query("serviceProviderProfiles")
      .withIndex("by_provider_type", (q) => q.eq("providerType", args.providerType))
      .collect();

    // Apply filters in TypeScript (efficient for moderate result sets)
    if (args.serviceAreas && args.serviceAreas.length > 0) {
      profiles = profiles.filter((p) =>
        args.serviceAreas!.some((area) => p.serviceAreas.includes(area))
      );
    }

    if (args.languages && args.languages.length > 0) {
      profiles = profiles.filter((p) =>
        args.languages!.some((lang) => p.languages.includes(lang as any))
      );
    }

    return profiles.slice(0, args.limit);
  },
});
```

### Toast Notification with Action
```typescript
// Source: shadcn/ui Sonner (already installed in Phase 42)
// https://ui.shadcn.com/docs/components/sonner

import { toast } from "sonner";

// Success toast with description
toast.success("Added to your team", {
  description: "You can now contact this provider about your deal",
});

// Error toast with error message
toast.error("Failed to add provider", {
  description: error instanceof Error ? error.message : "Please try again",
});

// Toast with action button
toast("Provider added", {
  description: "View your team to see all providers",
  action: {
    label: "View Team",
    onClick: () => router.push("/team"),
  },
});
```

### Optimistic UI with Mutation Hook
```typescript
// Source: React mutation patterns + Convex useMutation
// Similar to Phase 42 usePropertySave.ts

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { toast } from "sonner";

export function useProviderAdd(providerId, providerType) {
  const [isAdding, setIsAdding] = useState(false);
  const addProvider = useMutation(api.teamManagement.addProviderToTeam);

  const addToTeam = async () => {
    setIsAdding(true);  // Optimistic: disable button immediately

    try {
      await addProvider({ providerId, providerType });
      toast.success("Added to your team");
    } catch (error) {
      toast.error("Failed to add provider");
    } finally {
      setIsAdding(false);  // Re-enable button
    }
  };

  return { isAdding, addToTeam };
}
```

### Badge with Star Icon for Ratings
```typescript
// Source: @hugeicons/react (already in use) + shadcn Badge
// Consistent with property card patterns

import { HugeiconsIcon } from "@hugeicons/react";
import { StarIcon } from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";

// Rating display
<div className="flex items-center gap-1">
  <HugeiconsIcon
    icon={StarIcon}
    size={12}
    className="text-yellow-500 fill-yellow-500"
  />
  <span className="font-medium">{avgRating.toFixed(1)}</span>
  <span className="text-muted-foreground">({totalReviews})</span>
</div>

// Availability badge
<Badge variant={acceptingNewClients ? "default" : "secondary"}>
  {acceptingNewClients ? "Available now" : "Not accepting clients"}
</Badge>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual provider browsing | AI-powered recommendations with match explanations | AI SDK tool calling maturity (2025) | Personalized discovery, explains WHY each provider matches |
| Form-based provider search | Natural language tool parameters from conversation | LLM context understanding (2025) | Smoother UX, no explicit filtering UI needed |
| Separate pages per role | Accordion-grouped single view | Modern component libraries (2025) | Faster comparison, less navigation |
| Static provider cards | Real-time availability status | Convex reactive queries (2024) | Always current, no stale data |
| Multi-step team building | Direct "Add" buttons with optimistic UI | React best practices (2025) | Faster workflow, immediate feedback |

**Deprecated/outdated:**
- **Separate provider directory pages:** AI recommendations replace browsing UX (still available as fallback)
- **Manual provider comparison:** AI explanations replace side-by-side comparison tables
- **Request-to-connect flow:** Direct team addition with immediate contact capability
- **Hardcoded match logic:** AI generates explanations from tool results dynamically

## Open Questions

Things that couldn't be fully resolved:

1. **Deal Creation Timing for Team Building**
   - What we know: Team stored on deals table (`brokerId`, `mortgageAdvisorId`, `lawyerId` fields)
   - What's unclear: When to create deal if investor builds team before favoriting property
   - Recommendation: Require investor to view/favorite properties first (creates deal context), or create "team wishlist" separate from deals

2. **Multiple Providers Per Role Behavior**
   - What we know: Schema allows ONE provider per role per deal
   - What's unclear: Whether investor should have multiple brokers across different deals vs. one primary broker
   - Recommendation: One provider per role per deal, but investor can have different providers for different properties/deals

3. **Provider Ranking/Sorting Logic**
   - What we know: Sort by rating → experience → completed deals (implemented in query)
   - What's unclear: Whether to expose this ranking or present as "equally good options"
   - Recommendation: Use smart sorting but don't show "Ranked #1" labels - present as curated matches, not ranked list

4. **Match Explanation Generation Location**
   - What we know: AI generates match reasons from tool results
   - What's unclear: Whether to also compute client-side badges (like PropertyRecommendationCard does)
   - Recommendation: Let AI generate text explanations, use simple computed badges for visual scanning (location, availability)

5. **Empty State Handling**
   - What we know: AI should explain why no providers found and suggest broadening criteria
   - What's unclear: Fallback behavior if zero providers exist for a role in database
   - Recommendation: AI should acknowledge limitation ("We're building our [role] network for [city]") and suggest alternatives

## Sources

### Primary (HIGH confidence)
- [Convex Schema](file:///Users/Kohelet/Code/REOS/convex/schema.ts) - serviceProviderProfiles, providerReviews, deals structure
- [Existing serviceProviderProfiles.ts](file:///Users/Kohelet/Code/REOS/convex/serviceProviderProfiles.ts) - Provider queries with enrichment patterns
- [Phase 42 RESEARCH.md](file:///Users/Kohelet/Code/REOS/.planning/phases/42-property-recommendations/42-RESEARCH.md) - Tool calling architecture, card patterns
- [Phase 42 PropertyCardRenderer](file:///Users/Kohelet/Code/REOS/src/components/ai/PropertyCardRenderer.tsx) - Tool result extraction and card rendering
- [Phase 42 PropertyRecommendationCard](file:///Users/Kohelet/Code/REOS/src/components/ai/PropertyRecommendationCard.tsx) - Compact card layout patterns
- [shadcn/ui Accordion](file:///Users/Kohelet/Code/REOS/src/components/ui/accordion.tsx) - Already installed, Radix primitive with animations
- [@convex-dev/agent Documentation](https://www.npmjs.com/package/@convex-dev/agent) - createTool API and tool registration
- [AI SDK Tool Calling Guide 2026](https://composio.dev/blog/ai-agent-tool-calling-guide) - Best practices for tool management (< 20 tools recommended)
- [Auth0 GenAI Tool Calling Security](https://auth0.com/blog/genai-tool-calling-intro/) - Security best practices for tool execution

### Secondary (MEDIUM confidence)
- [Recommendation System Architecture - Alibaba Cloud](https://www.alibabacloud.com/blog/recommendation-system-matching-algorithms-and-architecture_596645) - Matching algorithms with candidate filtering + ranking stages
- [Material UI Accordion Best Practices](https://mui.com/material-ui/react-accordion/) - Controlled/uncontrolled components, single vs multiple selection
- [Card UI Design Best Practices 2026](https://www.eleken.co/blog-posts/card-ui-examples-and-best-practices-for-product-owners) - Compact layouts, 200-word content limits
- [Dual-Triangular Recommendation Systems 2025](https://link.springer.com/article/10.1007/s41019-025-00310-0) - Supply-demand matching with heterogeneous networks
- [Meta Reels RecSys Architecture 2026](https://engineering.fb.com/2026/01/14/ml-applications/adapting-the-facebook-reels-recsys-ai-model-based-on-user-feedback/) - Perception layer for interpretable matching

### Tertiary (LOW confidence)
- Phase 43 CONTEXT.md decisions - User preferences for card layout, accordion sections, match explanations

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed (Phase 40-42), no new dependencies
- Architecture: HIGH - Direct extension of Phase 42 patterns (tool calling, card rendering, modals)
- Provider queries: HIGH - Existing serviceProviderProfiles.ts provides proven patterns
- Match explanations: MEDIUM - AI generation approach verified, but specific output quality needs validation
- Team management: MEDIUM - Schema supports it, but deal creation timing needs Phase 43-01 decision
- Accordion UI: HIGH - Component exists, API well-documented, Phase 43 context specifies behavior

**Research date:** 2026-01-22
**Valid until:** ~30 days (AI SDK and Convex stable, React patterns mature, provider recommendation systems well-established)

**Note:** Phase 43 reuses 90% of Phase 42 infrastructure. The research focused on provider-specific patterns (multi-role filtering, team management, availability status) that differ from property recommendations. Tool calling architecture, card rendering, and modal overlays transfer directly without modification.
