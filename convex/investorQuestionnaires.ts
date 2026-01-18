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
