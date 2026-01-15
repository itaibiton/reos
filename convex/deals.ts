import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { dealStage } from "./schema";

// Valid stage transitions - defines which stages can transition to which
const VALID_TRANSITIONS: Record<string, string[]> = {
  interest: ["broker_assigned", "cancelled"],
  broker_assigned: ["mortgage", "cancelled"],
  mortgage: ["legal", "cancelled"],
  legal: ["closing", "cancelled"],
  closing: ["completed", "cancelled"],
  completed: [], // Terminal state
  cancelled: [], // Terminal state
};

// List deals for the authenticated user (based on their role)
export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    const effectiveRole = user.role === "admin" && user.viewingAsRole
      ? user.viewingAsRole
      : user.role;

    let deals;

    switch (effectiveRole) {
      case "investor":
        deals = await ctx.db
          .query("deals")
          .withIndex("by_investor", (q) => q.eq("investorId", user._id))
          .collect();
        break;

      case "broker":
        deals = await ctx.db
          .query("deals")
          .withIndex("by_broker", (q) => q.eq("brokerId", user._id))
          .collect();
        break;

      case "mortgage_advisor":
        deals = await ctx.db
          .query("deals")
          .withIndex("by_mortgage_advisor", (q) => q.eq("mortgageAdvisorId", user._id))
          .collect();
        break;

      case "lawyer":
        deals = await ctx.db
          .query("deals")
          .withIndex("by_lawyer", (q) => q.eq("lawyerId", user._id))
          .collect();
        break;

      case "admin":
        // Admins see all deals
        deals = await ctx.db.query("deals").collect();
        break;

      default:
        return [];
    }

    // Sort by most recent first
    deals.sort((a, b) => b.createdAt - a.createdAt);

    // Apply limit if specified
    if (args.limit) {
      deals = deals.slice(0, args.limit);
    }

    return deals;
  },
});

// Get a single deal by ID (with access check)
export const get = query({
  args: {
    dealId: v.id("deals"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return null;
    }

    const deal = await ctx.db.get(args.dealId);
    if (!deal) {
      return null;
    }

    // Check access - user must be a participant or admin
    const isParticipant =
      deal.investorId === user._id ||
      deal.brokerId === user._id ||
      deal.mortgageAdvisorId === user._id ||
      deal.lawyerId === user._id;

    if (!isParticipant && user.role !== "admin") {
      return null;
    }

    return deal;
  },
});

// Get all deals for a property (for property detail page)
export const getByProperty = query({
  args: {
    propertyId: v.id("properties"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    const deals = await ctx.db
      .query("deals")
      .withIndex("by_property", (q) => q.eq("propertyId", args.propertyId))
      .collect();

    // For non-admins, filter to only their deals
    if (user.role !== "admin") {
      return deals.filter(
        (deal) =>
          deal.investorId === user._id ||
          deal.brokerId === user._id ||
          deal.mortgageAdvisorId === user._id ||
          deal.lawyerId === user._id
      );
    }

    return deals;
  },
});

// Create a new deal (investors only)
export const create = mutation({
  args: {
    propertyId: v.id("properties"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Only investors can create deals
    const effectiveRole = user.role === "admin" && user.viewingAsRole
      ? user.viewingAsRole
      : user.role;

    if (effectiveRole !== "investor") {
      throw new Error("Only investors can create deals");
    }

    // Verify property exists
    const property = await ctx.db.get(args.propertyId);
    if (!property) {
      throw new Error("Property not found");
    }

    // Check if investor already has an active deal on this property
    const existingDeals = await ctx.db
      .query("deals")
      .withIndex("by_investor", (q) => q.eq("investorId", user._id))
      .collect();

    const hasActiveDeal = existingDeals.some(
      (deal) =>
        deal.propertyId === args.propertyId &&
        deal.stage !== "completed" &&
        deal.stage !== "cancelled"
    );

    if (hasActiveDeal) {
      throw new Error("You already have an active deal on this property");
    }

    const now = Date.now();

    const dealId = await ctx.db.insert("deals", {
      propertyId: args.propertyId,
      investorId: user._id,
      stage: "interest",
      notes: args.notes,
      stageHistory: [
        {
          stage: "interest",
          timestamp: now,
          notes: args.notes || "Deal initiated",
        },
      ],
      createdAt: now,
      updatedAt: now,
    });

    return dealId;
  },
});

// Update deal stage
export const updateStage = mutation({
  args: {
    dealId: v.id("deals"),
    newStage: dealStage,
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const deal = await ctx.db.get(args.dealId);
    if (!deal) {
      throw new Error("Deal not found");
    }

    // Check access
    const isParticipant =
      deal.investorId === user._id ||
      deal.brokerId === user._id ||
      deal.mortgageAdvisorId === user._id ||
      deal.lawyerId === user._id;

    if (!isParticipant && user.role !== "admin") {
      throw new Error("Not authorized to update this deal");
    }

    // Validate stage transition
    const validNextStages = VALID_TRANSITIONS[deal.stage];
    if (!validNextStages || !validNextStages.includes(args.newStage)) {
      throw new Error(
        `Invalid stage transition from "${deal.stage}" to "${args.newStage}"`
      );
    }

    const now = Date.now();

    await ctx.db.patch(args.dealId, {
      stage: args.newStage,
      stageHistory: [
        ...deal.stageHistory,
        {
          stage: args.newStage,
          timestamp: now,
          notes: args.notes,
        },
      ],
      updatedAt: now,
    });

    // Log activity
    await ctx.db.insert("dealActivity", {
      dealId: args.dealId,
      actorId: user._id,
      activityType: "stage_change",
      details: {
        fromStage: deal.stage,
        toStage: args.newStage,
        note: args.notes,
      },
      createdAt: now,
    });

    return args.dealId;
  },
});

// Cancel a deal
export const cancel = mutation({
  args: {
    dealId: v.id("deals"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const deal = await ctx.db.get(args.dealId);
    if (!deal) {
      throw new Error("Deal not found");
    }

    // Check access
    const isParticipant =
      deal.investorId === user._id ||
      deal.brokerId === user._id ||
      deal.mortgageAdvisorId === user._id ||
      deal.lawyerId === user._id;

    if (!isParticipant && user.role !== "admin") {
      throw new Error("Not authorized to cancel this deal");
    }

    // Cannot cancel already terminal deals
    if (deal.stage === "completed" || deal.stage === "cancelled") {
      throw new Error("Deal is already in a terminal state");
    }

    const now = Date.now();

    await ctx.db.patch(args.dealId, {
      stage: "cancelled",
      stageHistory: [
        ...deal.stageHistory,
        {
          stage: "cancelled",
          timestamp: now,
          notes: args.reason || "Deal cancelled",
        },
      ],
      updatedAt: now,
    });

    // Log activity
    await ctx.db.insert("dealActivity", {
      dealId: args.dealId,
      actorId: user._id,
      activityType: "stage_change",
      details: {
        fromStage: deal.stage,
        toStage: "cancelled",
        note: args.reason || "Deal cancelled",
      },
      createdAt: now,
    });

    return args.dealId;
  },
});

// Map stage to which provider is active at that stage
const STAGE_TO_PROVIDER: Record<string, string | null> = {
  interest: null,
  broker_assigned: "broker",
  mortgage: "mortgage_advisor",
  legal: "lawyer",
  closing: "lawyer",
  completed: null,
  cancelled: null,
};

// Map stage to next stage for handoffs
const HANDOFF_NEXT_STAGE: Record<string, string | null> = {
  broker_assigned: "mortgage",
  mortgage: "legal",
  legal: "closing",
  closing: "completed",
};

// Map stage to required provider role for next stage
const NEXT_PROVIDER_ROLE: Record<string, string | null> = {
  broker_assigned: "mortgage_advisor",
  mortgage: "lawyer",
  legal: null, // Lawyer completes deal
  closing: null, // Final stage
};

// Handoff to next provider in chain
export const handoffToNextProvider = mutation({
  args: {
    dealId: v.id("deals"),
    nextProviderId: v.id("users"),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const deal = await ctx.db.get(args.dealId);
    if (!deal) {
      throw new Error("Deal not found");
    }

    // Verify caller is current stage's provider
    const currentProviderRole = STAGE_TO_PROVIDER[deal.stage];
    if (!currentProviderRole) {
      throw new Error("No provider assigned at current stage");
    }

    let isCurrentProvider = false;
    if (currentProviderRole === "broker" && deal.brokerId === user._id) {
      isCurrentProvider = true;
    } else if (currentProviderRole === "mortgage_advisor" && deal.mortgageAdvisorId === user._id) {
      isCurrentProvider = true;
    } else if (currentProviderRole === "lawyer" && deal.lawyerId === user._id) {
      isCurrentProvider = true;
    }

    if (!isCurrentProvider && user.role !== "admin") {
      throw new Error("Only the current stage provider can initiate a handoff");
    }

    // Get next stage and required role
    const nextStage = HANDOFF_NEXT_STAGE[deal.stage];
    const requiredRole = NEXT_PROVIDER_ROLE[deal.stage];

    if (!nextStage) {
      throw new Error("No handoff available from current stage");
    }

    if (!requiredRole) {
      throw new Error("This stage does not require a handoff to another provider");
    }

    // Verify the next provider has the correct role
    const nextProvider = await ctx.db.get(args.nextProviderId);
    if (!nextProvider) {
      throw new Error("Next provider not found");
    }

    if (nextProvider.role !== requiredRole) {
      throw new Error(`Next provider must have role "${requiredRole}"`);
    }

    // Create service request for the next provider
    const now = Date.now();
    const requestId = await ctx.db.insert("serviceRequests", {
      dealId: args.dealId,
      investorId: deal.investorId,
      providerId: args.nextProviderId,
      providerType: requiredRole as "broker" | "mortgage_advisor" | "lawyer",
      status: "pending",
      investorMessage: args.message || `Handoff from ${currentProviderRole}`,
      createdAt: now,
    });

    // Log handoff initiated
    await ctx.db.insert("dealActivity", {
      dealId: args.dealId,
      actorId: user._id,
      activityType: "handoff_initiated",
      details: {
        providerId: args.nextProviderId,
        providerType: requiredRole,
        fromStage: deal.stage,
        toStage: nextStage,
        note: args.message,
      },
      createdAt: now,
    });

    return requestId;
  },
});

// Accept a handoff request
export const acceptHandoff = mutation({
  args: {
    requestId: v.id("serviceRequests"),
    response: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Get the request
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Request not found");
    }

    // Verify responder is the provider
    if (request.providerId !== user._id) {
      throw new Error("Only the requested provider can accept the handoff");
    }

    // Verify request is pending
    if (request.status !== "pending") {
      throw new Error("Request is no longer pending");
    }

    const deal = await ctx.db.get(request.dealId);
    if (!deal) {
      throw new Error("Deal not found");
    }

    const now = Date.now();

    // Update request status
    await ctx.db.patch(args.requestId, {
      status: "accepted",
      providerResponse: args.response,
      respondedAt: now,
    });

    // Determine which field to update and what new stage
    const updateFields: Record<string, unknown> = {
      updatedAt: now,
    };

    const nextStage = HANDOFF_NEXT_STAGE[deal.stage];

    switch (request.providerType) {
      case "mortgage_advisor":
        updateFields.mortgageAdvisorId = user._id;
        if (nextStage) {
          updateFields.stage = nextStage;
          updateFields.stageHistory = [
            ...deal.stageHistory,
            {
              stage: nextStage as typeof deal.stage,
              timestamp: now,
              notes: "Mortgage advisor accepted handoff",
            },
          ];
        }
        break;
      case "lawyer":
        updateFields.lawyerId = user._id;
        if (nextStage) {
          updateFields.stage = nextStage;
          updateFields.stageHistory = [
            ...deal.stageHistory,
            {
              stage: nextStage as typeof deal.stage,
              timestamp: now,
              notes: "Lawyer accepted handoff",
            },
          ];
        }
        break;
    }

    await ctx.db.patch(request.dealId, updateFields);

    // Log handoff completed and provider assigned
    await ctx.db.insert("dealActivity", {
      dealId: request.dealId,
      actorId: user._id,
      activityType: "handoff_completed",
      details: {
        providerId: user._id,
        providerType: request.providerType,
        fromStage: deal.stage,
        toStage: nextStage || deal.stage,
      },
      createdAt: now,
    });

    await ctx.db.insert("dealActivity", {
      dealId: request.dealId,
      actorId: user._id,
      activityType: "provider_assigned",
      details: {
        providerId: user._id,
        providerType: request.providerType,
      },
      createdAt: now,
    });

    return request.dealId;
  },
});

// Get activity log for a deal
export const getActivityLog = query({
  args: {
    dealId: v.id("deals"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    const deal = await ctx.db.get(args.dealId);
    if (!deal) {
      return [];
    }

    // Check access - user must be participant or admin
    const isParticipant =
      deal.investorId === user._id ||
      deal.brokerId === user._id ||
      deal.mortgageAdvisorId === user._id ||
      deal.lawyerId === user._id;

    if (!isParticipant && user.role !== "admin") {
      return [];
    }

    // Get activities
    const activities = await ctx.db
      .query("dealActivity")
      .withIndex("by_deal", (q) => q.eq("dealId", args.dealId))
      .collect();

    // Sort by createdAt descending
    activities.sort((a, b) => b.createdAt - a.createdAt);

    // Apply limit
    const limited = args.limit ? activities.slice(0, args.limit) : activities;

    // Enrich with actor info
    const enriched = await Promise.all(
      limited.map(async (activity) => {
        const actor = await ctx.db.get(activity.actorId);
        return {
          ...activity,
          actorName: actor?.name || actor?.email || "Unknown",
          actorImageUrl: actor?.imageUrl,
        };
      })
    );

    return enriched;
  },
});
