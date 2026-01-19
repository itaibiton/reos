import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Get current user's availability settings
 * Returns acceptingNewClients status and list of unavailable dates
 */
export const getMyAvailability = query({
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

    // Get unavailable dates
    const unavailableDates = await ctx.db
      .query("providerUnavailableDates")
      .withIndex("by_provider", (q) => q.eq("providerId", user._id))
      .collect();

    return {
      acceptingNewClients: profile?.acceptingNewClients ?? true, // Default to accepting
      unavailableDates: unavailableDates.map((d) => ({
        _id: d._id,
        date: d.date,
        reason: d.reason,
      })),
    };
  },
});

/**
 * Get unavailable dates for a specific provider (public)
 * Used for displaying on public profile
 */
export const getUnavailableDates = query({
  args: { providerId: v.id("users") },
  handler: async (ctx, args) => {
    const unavailableDates = await ctx.db
      .query("providerUnavailableDates")
      .withIndex("by_provider", (q) => q.eq("providerId", args.providerId))
      .collect();

    return unavailableDates.map((d) => ({
      _id: d._id,
      date: d.date,
    }));
  },
});

/**
 * Toggle accepting new clients status
 */
export const setAcceptingNewClients = mutation({
  args: { accepting: v.boolean() },
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
      throw new Error("Only service providers can update availability");
    }

    // Get or create provider profile
    const profile = await ctx.db
      .query("serviceProviderProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (profile) {
      await ctx.db.patch(profile._id, {
        acceptingNewClients: args.accepting,
        updatedAt: Date.now(),
      });
    } else {
      // Create minimal profile with availability setting
      const providerType = user.role as "broker" | "mortgage_advisor" | "lawyer";
      await ctx.db.insert("serviceProviderProfiles", {
        userId: user._id,
        providerType,
        specializations: [],
        serviceAreas: [],
        languages: [],
        acceptingNewClients: args.accepting,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

/**
 * Add an unavailable date
 */
export const addUnavailableDate = mutation({
  args: {
    date: v.number(), // Start-of-day timestamp (midnight UTC)
    reason: v.optional(v.string()),
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
      throw new Error("Only service providers can manage unavailable dates");
    }

    // Check for duplicate date
    const existing = await ctx.db
      .query("providerUnavailableDates")
      .withIndex("by_provider_and_date", (q) =>
        q.eq("providerId", user._id).eq("date", args.date)
      )
      .unique();

    if (existing) {
      // Already blocked, just return the existing one
      return { _id: existing._id, alreadyExists: true };
    }

    // Add the unavailable date
    const id = await ctx.db.insert("providerUnavailableDates", {
      providerId: user._id,
      date: args.date,
      reason: args.reason,
      createdAt: Date.now(),
    });

    return { _id: id, alreadyExists: false };
  },
});

/**
 * Remove an unavailable date
 */
export const removeUnavailableDate = mutation({
  args: { dateId: v.id("providerUnavailableDates") },
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

    // Get the date record
    const dateRecord = await ctx.db.get(args.dateId);
    if (!dateRecord) {
      throw new Error("Unavailable date not found");
    }

    // Verify ownership
    if (dateRecord.providerId !== user._id) {
      throw new Error("Cannot remove another provider's unavailable date");
    }

    await ctx.db.delete(args.dateId);

    return { success: true };
  },
});

/**
 * Bulk add unavailable dates
 */
export const bulkAddUnavailableDates = mutation({
  args: { dates: v.array(v.number()) },
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
      throw new Error("Only service providers can manage unavailable dates");
    }

    // Get existing dates to avoid duplicates
    const existingDates = await ctx.db
      .query("providerUnavailableDates")
      .withIndex("by_provider", (q) => q.eq("providerId", user._id))
      .collect();

    const existingDateSet = new Set(existingDates.map((d) => d.date));

    // Add new dates that don't already exist
    const addedIds: Id<"providerUnavailableDates">[] = [];
    for (const date of args.dates) {
      if (!existingDateSet.has(date)) {
        const id = await ctx.db.insert("providerUnavailableDates", {
          providerId: user._id,
          date,
          createdAt: Date.now(),
        });
        addedIds.push(id);
      }
    }

    return { addedCount: addedIds.length, addedIds };
  },
});
