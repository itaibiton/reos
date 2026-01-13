import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Validators for reuse
const propertyTypeValidator = v.union(
  v.literal("residential"),
  v.literal("commercial"),
  v.literal("mixed_use"),
  v.literal("land")
);

const riskToleranceValidator = v.union(
  v.literal("conservative"),
  v.literal("moderate"),
  v.literal("aggressive")
);

const investmentTimelineValidator = v.union(
  v.literal("short_term"),
  v.literal("medium_term"),
  v.literal("long_term")
);

// Get current user's investor profile
export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Get user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "investor") {
      return null;
    }

    // Get investor profile
    return await ctx.db
      .query("investorProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();
  },
});

// Create or update investor profile
export const upsertProfile = mutation({
  args: {
    propertyTypes: v.array(propertyTypeValidator),
    targetLocations: v.array(v.string()),
    budgetMin: v.number(),
    budgetMax: v.number(),
    riskTolerance: riskToleranceValidator,
    targetRoiMin: v.optional(v.number()),
    investmentTimeline: v.optional(investmentTimelineValidator),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    if (user.role !== "investor") {
      throw new Error("Only investors can create investor profiles");
    }

    // Validation
    if (args.propertyTypes.length === 0) {
      throw new Error("At least one property type is required");
    }

    if (args.targetLocations.length === 0) {
      throw new Error("At least one target location is required");
    }

    if (args.budgetMin >= args.budgetMax) {
      throw new Error("Minimum budget must be less than maximum budget");
    }

    // Check for existing profile
    const existingProfile = await ctx.db
      .query("investorProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    const now = Date.now();

    if (existingProfile) {
      // Update existing profile
      await ctx.db.patch(existingProfile._id, {
        ...args,
        updatedAt: now,
      });
      return existingProfile._id;
    } else {
      // Create new profile
      return await ctx.db.insert("investorProfiles", {
        userId: user._id,
        ...args,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});
