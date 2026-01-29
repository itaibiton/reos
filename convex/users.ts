import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Get user by Clerk ID (for internal use by AI actions)
 */
export const getByClerkId = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, { clerkId }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();
  },
});

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

    // Service providers now go through vendor onboarding (v1.9)
    // Investors need to complete the questionnaire first
    // Only admins are fully onboarded after role selection
    await ctx.db.patch(user._id, {
      role: args.role,
      onboardingComplete: args.role === "admin",
      onboardingStep: isInvestor || isServiceProvider ? 1 : undefined, // 1 = role selected, onboarding pending
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

// List all users (for direct messaging user selection)
// Returns all users except the current user, sorted by name
export const listAll = query({
  args: {
    searchQuery: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) {
      return [];
    }

    // Get all users
    let users = await ctx.db.query("users").collect();

    // Filter out current user and users without roles (incomplete onboarding)
    users = users.filter(
      (user) => user._id !== currentUser._id && user.role && user.onboardingComplete
    );

    // Filter by search query if provided
    if (args.searchQuery?.trim()) {
      const query = args.searchQuery.toLowerCase();
      users = users.filter(
        (user) =>
          user.name?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query)
      );
    }

    // Sort by name
    users.sort((a, b) => {
      const nameA = a.name || a.email || "";
      const nameB = b.name || b.email || "";
      return nameA.localeCompare(nameB);
    });

    // Return simplified user info
    return users.map((user) => ({
      _id: user._id,
      name: user.name || user.email || "Unknown",
      email: user.email,
      imageUrl: user.imageUrl,
      role: user.role,
    }));
  },
});

// Get user profile with follow status and provider info
// Used for /profile/[id] page - aggregates all data in single call
export const getUserProfile = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Get current user
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) {
      return null;
    }

    // Get target user
    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      return null;
    }

    // Check if current user follows this user
    const follows = await ctx.db
      .query("userFollows")
      .withIndex("by_follower_and_following", (q) =>
        q.eq("followerId", currentUser._id).eq("followingId", args.userId)
      )
      .unique();

    const isFollowing = follows !== null;
    const isOwnProfile = currentUser._id === args.userId;

    // Check if target is a service provider
    const isProvider =
      targetUser.role === "broker" ||
      targetUser.role === "mortgage_advisor" ||
      targetUser.role === "lawyer";

    let providerProfile = null;
    let stats = null;
    let portfolio = null;

    if (isProvider) {
      // Get service provider profile
      const profile = await ctx.db
        .query("serviceProviderProfiles")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .unique();

      if (profile) {
        providerProfile = {
          companyName: profile.companyName,
          licenseNumber: profile.licenseNumber,
          yearsExperience: profile.yearsExperience,
          specializations: profile.specializations,
          serviceAreas: profile.serviceAreas,
          languages: profile.languages,
          bio: profile.bio,
          phoneNumber: profile.phoneNumber,
          preferredContact: profile.preferredContact,
        };

        // Get reviews for stats calculation
        const allReviews = await ctx.db
          .query("providerReviews")
          .withIndex("by_provider", (q) => q.eq("providerId", args.userId))
          .collect();

        const totalReviews = allReviews.length;
        const averageRating =
          totalReviews > 0
            ? Math.round(
                (allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) *
                  10
              ) / 10
            : 0;

        // Count completed deals where this provider was assigned
        const allCompletedDeals = await ctx.db
          .query("deals")
          .withIndex("by_stage", (q) => q.eq("stage", "completed"))
          .collect();

        const providerCompletedDeals = allCompletedDeals.filter(
          (deal) =>
            deal.brokerId === args.userId ||
            deal.mortgageAdvisorId === args.userId ||
            deal.lawyerId === args.userId
        );

        stats = {
          averageRating,
          totalReviews,
          completedDeals: providerCompletedDeals.length,
          yearsExperience: profile.yearsExperience ?? 0,
        };

        // Get last 5 completed deals for portfolio
        const portfolioDeals = providerCompletedDeals
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .slice(0, 5);

        // Enrich portfolio with property info
        portfolio = await Promise.all(
          portfolioDeals.map(async (deal) => {
            const property = await ctx.db.get(deal.propertyId);

            return {
              dealId: deal._id,
              propertyId: deal.propertyId,
              propertyTitle: property?.title,
              propertyCity: property?.city,
              propertyImage: property?.featuredImage ?? property?.images[0],
              soldPrice: property?.soldPrice ?? deal.offerPrice ?? property?.priceUsd,
              completedAt: deal.updatedAt,
            };
          })
        );
      }
    }

    return {
      // User info
      _id: targetUser._id,
      name: targetUser.name,
      email: targetUser.email,
      imageUrl: targetUser.imageUrl,
      role: targetUser.role,

      // Follow state
      isFollowing,
      isOwnProfile,

      // Provider-specific data (null for investors)
      providerProfile,
      stats,
      portfolio,
    };
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

// ============================================================================
// PROFILE PHOTO UPLOAD (v1.9)
// ============================================================================

// Generate upload URL for custom profile photo
export const generateProfilePhotoUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    return await ctx.storage.generateUploadUrl();
  },
});

// Save uploaded profile photo
export const saveProfilePhoto = mutation({
  args: {
    storageId: v.id("_storage"),
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

    // Delete old photo if exists
    if (user.customImageStorageId) {
      await ctx.storage.delete(user.customImageStorageId);
    }

    // Save new photo
    await ctx.db.patch(user._id, {
      customImageStorageId: args.storageId,
      updatedAt: Date.now(),
    });

    // Get public URL
    const url = await ctx.storage.getUrl(args.storageId);

    return {
      url,
      storageId: args.storageId,
    };
  },
});

// Get profile photo URL for a user
export const getProfilePhotoUrl = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return null;
    }

    // Return custom photo if exists, otherwise Clerk photo
    if (user.customImageStorageId) {
      return await ctx.storage.getUrl(user.customImageStorageId);
    }

    return user.imageUrl;
  },
});
