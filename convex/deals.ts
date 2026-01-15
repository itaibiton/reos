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

    return args.dealId;
  },
});
