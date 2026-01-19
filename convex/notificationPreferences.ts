import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Default notification preferences (all enabled)
const DEFAULT_NOTIFICATION_PREFERENCES = {
  emailNotifications: true,
  inAppNotifications: true,
  newMessageNotify: true,
  dealStageNotify: true,
  fileUploadedNotify: true,
  requestReceivedNotify: true,
};

/**
 * Get current user's notification preferences
 * Returns default values if not set
 */
export const getMyNotificationPreferences = query({
  args: {},
  handler: async (ctx) => {
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

    // Get provider profile
    const profile = await ctx.db
      .query("serviceProviderProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    // Return preferences or defaults
    return profile?.notificationPreferences ?? DEFAULT_NOTIFICATION_PREFERENCES;
  },
});

/**
 * Update notification preferences
 * Accepts partial updates and merges with existing preferences
 */
export const updateNotificationPreferences = mutation({
  args: {
    preferences: v.object({
      emailNotifications: v.optional(v.boolean()),
      inAppNotifications: v.optional(v.boolean()),
      newMessageNotify: v.optional(v.boolean()),
      dealStageNotify: v.optional(v.boolean()),
      fileUploadedNotify: v.optional(v.boolean()),
      requestReceivedNotify: v.optional(v.boolean()),
    }),
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

    // Check user is a provider
    const providerRoles = ["broker", "mortgage_advisor", "lawyer"];
    if (!user.role || !providerRoles.includes(user.role)) {
      throw new Error("Only service providers can update notification preferences");
    }

    // Get or create provider profile
    const profile = await ctx.db
      .query("serviceProviderProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    // Merge with existing or default preferences
    const currentPreferences = profile?.notificationPreferences ?? DEFAULT_NOTIFICATION_PREFERENCES;
    const updatedPreferences = {
      emailNotifications: args.preferences.emailNotifications ?? currentPreferences.emailNotifications,
      inAppNotifications: args.preferences.inAppNotifications ?? currentPreferences.inAppNotifications,
      newMessageNotify: args.preferences.newMessageNotify ?? currentPreferences.newMessageNotify,
      dealStageNotify: args.preferences.dealStageNotify ?? currentPreferences.dealStageNotify,
      fileUploadedNotify: args.preferences.fileUploadedNotify ?? currentPreferences.fileUploadedNotify,
      requestReceivedNotify: args.preferences.requestReceivedNotify ?? currentPreferences.requestReceivedNotify,
    };

    if (profile) {
      await ctx.db.patch(profile._id, {
        notificationPreferences: updatedPreferences,
        updatedAt: Date.now(),
      });
    } else {
      // Create minimal profile with notification preferences
      const providerType = user.role as "broker" | "mortgage_advisor" | "lawyer";
      await ctx.db.insert("serviceProviderProfiles", {
        userId: user._id,
        providerType,
        specializations: [],
        serviceAreas: [],
        languages: [],
        notificationPreferences: updatedPreferences,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return { success: true, preferences: updatedPreferences };
  },
});
