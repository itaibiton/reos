import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get or create user from Clerk identity
// Called automatically when user accesses authenticated content
export const getOrCreateUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (existingUser) {
      // Update last seen / any changed fields
      await ctx.db.patch(existingUser._id, {
        email: identity.email ?? existingUser.email,
        name: identity.name ?? existingUser.name,
        imageUrl: identity.pictureUrl ?? existingUser.imageUrl,
        updatedAt: Date.now(),
      });
      return existingUser._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      clerkId: identity.subject,
      email: identity.email ?? "",
      name: identity.name,
      imageUrl: identity.pictureUrl,
      role: undefined, // Role selected during onboarding
      onboardingComplete: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return userId;
  },
});

// Get current authenticated user
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});

// Update user's role (used during onboarding and admin role-switching)
// For investors: sets onboardingComplete = false, onboardingStep = 1 (questionnaire pending)
// For service providers: sets onboardingComplete = true (fully onboarded)
export const setUserRole = mutation({
  args: {
    role: v.union(
      v.literal("investor"),
      v.literal("broker"),
      v.literal("mortgage_advisor"),
      v.literal("lawyer"),
      v.literal("admin")
    ),
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

    const isInvestor = args.role === "investor";
    const isServiceProvider =
      args.role === "broker" ||
      args.role === "mortgage_advisor" ||
      args.role === "lawyer";

    // Service providers complete onboarding after role selection
    // Investors need to complete the questionnaire first
    await ctx.db.patch(user._id, {
      role: args.role,
      onboardingComplete: isServiceProvider || args.role === "admin",
      onboardingStep: isInvestor ? 1 : undefined, // 1 = role selected, questionnaire pending
      updatedAt: Date.now(),
    });

    // For investors, initialize their questionnaire draft
    if (isInvestor) {
      // Check if questionnaire already exists
      const existing = await ctx.db
        .query("investorQuestionnaires")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .unique();

      if (!existing) {
        await ctx.db.insert("investorQuestionnaires", {
          userId: user._id,
          status: "draft",
          currentStep: 1,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    }
  },
});

// Complete onboarding for the current user
// Used when investor finishes the questionnaire
export const completeOnboarding = mutation({
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

    await ctx.db.patch(user._id, {
      onboardingComplete: true,
      updatedAt: Date.now(),
    });

    // If investor, mark questionnaire as complete
    if (user.role === "investor") {
      const questionnaire = await ctx.db
        .query("investorQuestionnaires")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .unique();

      if (questionnaire) {
        await ctx.db.patch(questionnaire._id, {
          status: "complete",
          updatedAt: Date.now(),
        });
      }
    }
  },
});

// Get onboarding status for gate logic
export const getOnboardingStatus = query({
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

    // Get questionnaire status for investors
    let questionnaireStatus: "draft" | "complete" | null = null;
    if (user.role === "investor") {
      const questionnaire = await ctx.db
        .query("investorQuestionnaires")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .unique();
      questionnaireStatus = questionnaire?.status ?? null;
    }

    return {
      role: user.role,
      onboardingComplete: user.onboardingComplete,
      onboardingStep: user.onboardingStep,
      questionnaireStatus,
    };
  },
});

// Update clerkId for a user (internal/admin use for migrating seed data)
export const updateClerkId = mutation({
  args: {
    oldClerkId: v.string(),
    newClerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.oldClerkId))
      .unique();

    if (!user) {
      throw new Error(`User with clerkId ${args.oldClerkId} not found`);
    }

    await ctx.db.patch(user._id, {
      clerkId: args.newClerkId,
      updatedAt: Date.now(),
    });

    return { success: true, userId: user._id };
  },
});

// Reset onboarding for testing (dev only)
// Sets onboardingComplete to false and resets questionnaire
export const resetOnboarding = mutation({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    let user;

    // If userId provided directly, use it (for internal testing)
    if (args.userId) {
      user = await ctx.db.get(args.userId);
    } else {
      // Otherwise, use authenticated user
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new Error("Not authenticated");
      }

      user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .unique();
    }

    if (!user) {
      throw new Error("User not found");
    }

    // Reset user onboarding status
    await ctx.db.patch(user._id, {
      onboardingComplete: false,
      onboardingStep: 1,
      updatedAt: Date.now(),
    });

    // Reset questionnaire if exists
    const questionnaire = await ctx.db
      .query("investorQuestionnaires")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (questionnaire) {
      await ctx.db.patch(questionnaire._id, {
        status: "draft",
        currentStep: 1,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// Set the role an admin is viewing as (for testing different perspectives)
// Admin's actual role stays "admin", but viewingAsRole affects what they see
export const setViewingAsRole = mutation({
  args: {
    viewingAsRole: v.union(
      v.literal("investor"),
      v.literal("broker"),
      v.literal("mortgage_advisor"),
      v.literal("lawyer"),
      v.literal("admin")
    ),
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

    // Only admins can use this feature
    if (user.role !== "admin") {
      throw new Error("Only admins can switch viewing role");
    }

    await ctx.db.patch(user._id, {
      viewingAsRole: args.viewingAsRole,
      updatedAt: Date.now(),
    });
  },
});
