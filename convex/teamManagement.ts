import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Provider type validator
const providerTypeValidator = v.union(
  v.literal("broker"),
  v.literal("mortgage_advisor"),
  v.literal("lawyer")
);

/**
 * Add a service provider to the investor's team (on their active deal)
 * - Finds the investor's first active deal (not completed, not cancelled)
 * - Assigns the provider to the appropriate role field
 * - Logs activity for audit trail
 */
export const addProviderToTeam = mutation({
  args: {
    providerId: v.id("users"),
    providerType: providerTypeValidator,
    dealId: v.optional(v.id("deals")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get authenticated user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Verify investor role (or admin viewing as investor)
    const effectiveRole =
      user.role === "admin" && user.viewingAsRole
        ? user.viewingAsRole
        : user.role;

    if (effectiveRole !== "investor") {
      throw new Error("Only investors can add providers to their team");
    }

    // Find target deal
    let deal;
    if (args.dealId) {
      // Use provided deal ID
      deal = await ctx.db.get(args.dealId);
      if (!deal) {
        throw new Error("Deal not found");
      }
      // Verify ownership
      if (deal.investorId !== user._id) {
        throw new Error("You can only add providers to your own deals");
      }
    } else {
      // Find first active deal for investor
      const allDeals = await ctx.db
        .query("deals")
        .withIndex("by_investor", (q) => q.eq("investorId", user._id))
        .collect();

      deal = allDeals.find(
        (d) => d.stage !== "completed" && d.stage !== "cancelled"
      );

      if (!deal) {
        throw new Error(
          "No active deal. Please save a property first to start building your team."
        );
      }
    }

    // Map providerType to deal field
    const fieldMap: Record<string, "brokerId" | "mortgageAdvisorId" | "lawyerId"> = {
      broker: "brokerId",
      mortgage_advisor: "mortgageAdvisorId",
      lawyer: "lawyerId",
    };

    const field = fieldMap[args.providerType];

    // Format role for display
    const roleDisplay = args.providerType.split("_").join(" ");

    // Check if role already filled
    if (deal[field]) {
      throw new Error(`A ${roleDisplay} is already assigned to this deal`);
    }

    // Verify provider exists and has correct role
    const provider = await ctx.db.get(args.providerId);
    if (!provider) {
      throw new Error("Provider not found");
    }

    if (provider.role !== args.providerType) {
      throw new Error(`Provider is not a ${roleDisplay}`);
    }

    const now = Date.now();

    // Patch deal with provider assignment
    await ctx.db.patch(deal._id, {
      [field]: args.providerId,
      updatedAt: now,
    });

    // Insert dealActivity record
    await ctx.db.insert("dealActivity", {
      dealId: deal._id,
      actorId: user._id,
      activityType: "provider_assigned",
      details: {
        providerId: args.providerId,
        providerType: args.providerType,
      },
      createdAt: now,
    });

    return { success: true, dealId: deal._id };
  },
});

/**
 * Check if a specific provider is on any of the investor's active deals
 */
export const isProviderOnTeam = query({
  args: {
    providerId: v.id("users"),
    providerType: providerTypeValidator,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return false;
    }

    // Get all active deals for investor
    const allDeals = await ctx.db
      .query("deals")
      .withIndex("by_investor", (q) => q.eq("investorId", user._id))
      .collect();

    const activeDeals = allDeals.filter(
      (d) => d.stage !== "completed" && d.stage !== "cancelled"
    );

    // Check if providerId matches the relevant field on any deal
    return activeDeals.some((deal) => {
      if (args.providerType === "broker") return deal.brokerId === args.providerId;
      if (args.providerType === "mortgage_advisor")
        return deal.mortgageAdvisorId === args.providerId;
      if (args.providerType === "lawyer") return deal.lawyerId === args.providerId;
      return false;
    });
  },
});

/**
 * Get all active deals with provider assignments
 * Used by UI to check "On Team" status across multiple providers
 */
export const getActiveDealsWithProviders = query({
  args: {},
  handler: async (ctx) => {
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

    // Get all deals for investor
    const allDeals = await ctx.db
      .query("deals")
      .withIndex("by_investor", (q) => q.eq("investorId", user._id))
      .collect();

    // Filter to active deals and return provider assignments
    const activeDeals = allDeals.filter(
      (d) => d.stage !== "completed" && d.stage !== "cancelled"
    );

    return activeDeals.map((deal) => ({
      _id: deal._id,
      brokerId: deal.brokerId,
      mortgageAdvisorId: deal.mortgageAdvisorId,
      lawyerId: deal.lawyerId,
    }));
  },
});
