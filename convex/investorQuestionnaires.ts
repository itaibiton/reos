import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get questionnaire for current user
export const getByUser = query({
  args: {},
  handler: async (ctx) => {
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

    return await ctx.db
      .query("investorQuestionnaires")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();
  },
});

// Initialize a draft questionnaire for investor
// Called when investor selects their role
export const initializeDraft = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if questionnaire already exists
    const existing = await ctx.db
      .query("investorQuestionnaires")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (existing) {
      return existing._id;
    }

    // Create new draft questionnaire
    const questionnaireId = await ctx.db.insert("investorQuestionnaires", {
      userId: args.userId,
      status: "draft",
      currentStep: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return questionnaireId;
  },
});

// Update current step in questionnaire
export const updateStep = mutation({
  args: {
    step: v.number(),
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

    const questionnaire = await ctx.db
      .query("investorQuestionnaires")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!questionnaire) {
      throw new Error("Questionnaire not found");
    }

    await ctx.db.patch(questionnaire._id, {
      currentStep: args.step,
      updatedAt: Date.now(),
    });

    // Also update user's onboarding step
    await ctx.db.patch(user._id, {
      onboardingStep: args.step + 1, // +1 because step 1 was role selection
      updatedAt: Date.now(),
    });
  },
});

// Save partial answers to questionnaire (for draft persistence)
export const saveAnswers = mutation({
  args: {
    citizenship: v.optional(v.string()),
    residencyStatus: v.optional(v.string()),
    experienceLevel: v.optional(v.string()),
    ownsPropertyInIsrael: v.optional(v.boolean()),
    investmentType: v.optional(v.string()),
    // Phase 12 fields
    budgetMin: v.optional(v.number()),
    budgetMax: v.optional(v.number()),
    investmentHorizon: v.optional(v.string()),
    investmentGoals: v.optional(v.array(v.string())),
    yieldPreference: v.optional(v.string()),
    financingApproach: v.optional(v.string()),
    // Phase 13 fields
    preferredPropertyTypes: v.optional(v.array(v.string())),
    preferredLocations: v.optional(v.array(v.string())),
    minBedrooms: v.optional(v.number()),
    maxBedrooms: v.optional(v.number()),
    minArea: v.optional(v.number()),
    maxArea: v.optional(v.number()),
    preferredAmenities: v.optional(v.array(v.string())),
    locationFlexibility: v.optional(v.string()),
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

    const questionnaire = await ctx.db
      .query("investorQuestionnaires")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!questionnaire) {
      throw new Error("Questionnaire not found");
    }

    // Build update object with only provided fields
    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.citizenship !== undefined) {
      updates.citizenship = args.citizenship;
    }
    if (args.residencyStatus !== undefined) {
      updates.residencyStatus = args.residencyStatus;
    }
    if (args.experienceLevel !== undefined) {
      updates.experienceLevel = args.experienceLevel;
    }
    if (args.ownsPropertyInIsrael !== undefined) {
      updates.ownsPropertyInIsrael = args.ownsPropertyInIsrael;
    }
    if (args.investmentType !== undefined) {
      updates.investmentType = args.investmentType;
    }
    // Phase 12 fields
    if (args.budgetMin !== undefined) {
      updates.budgetMin = args.budgetMin;
    }
    if (args.budgetMax !== undefined) {
      updates.budgetMax = args.budgetMax;
    }
    if (args.investmentHorizon !== undefined) {
      updates.investmentHorizon = args.investmentHorizon;
    }
    if (args.investmentGoals !== undefined) {
      updates.investmentGoals = args.investmentGoals;
    }
    if (args.yieldPreference !== undefined) {
      updates.yieldPreference = args.yieldPreference;
    }
    if (args.financingApproach !== undefined) {
      updates.financingApproach = args.financingApproach;
    }
    // Phase 13 fields
    if (args.preferredPropertyTypes !== undefined) {
      updates.preferredPropertyTypes = args.preferredPropertyTypes;
    }
    if (args.preferredLocations !== undefined) {
      updates.preferredLocations = args.preferredLocations;
    }
    if (args.minBedrooms !== undefined) {
      updates.minBedrooms = args.minBedrooms;
    }
    if (args.maxBedrooms !== undefined) {
      updates.maxBedrooms = args.maxBedrooms;
    }
    if (args.minArea !== undefined) {
      updates.minArea = args.minArea;
    }
    if (args.maxArea !== undefined) {
      updates.maxArea = args.maxArea;
    }
    if (args.preferredAmenities !== undefined) {
      updates.preferredAmenities = args.preferredAmenities;
    }
    if (args.locationFlexibility !== undefined) {
      updates.locationFlexibility = args.locationFlexibility;
    }

    await ctx.db.patch(questionnaire._id, updates);
  },
});

// Mark questionnaire as complete
export const markComplete = mutation({
  args: {},
  handler: async (ctx) => {
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

    const questionnaire = await ctx.db
      .query("investorQuestionnaires")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!questionnaire) {
      throw new Error("Questionnaire not found");
    }

    await ctx.db.patch(questionnaire._id, {
      status: "complete",
      updatedAt: Date.now(),
    });
  },
});
