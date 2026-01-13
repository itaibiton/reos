import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Check if the current user has saved a specific property
export const isSaved = query({
  args: {
    propertyId: v.id("properties"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }

    // Get user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return false;
    }

    // Check if favorite exists
    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_user_and_property", (q) =>
        q.eq("userId", user._id).eq("propertyId", args.propertyId)
      )
      .unique();

    return favorite !== null;
  },
});

// Toggle save/unsave for a property
export const toggle = mutation({
  args: {
    propertyId: v.id("properties"),
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

    // Check if property exists
    const property = await ctx.db.get(args.propertyId);
    if (!property) {
      throw new Error("Property not found");
    }

    // Check if favorite already exists
    const existingFavorite = await ctx.db
      .query("favorites")
      .withIndex("by_user_and_property", (q) =>
        q.eq("userId", user._id).eq("propertyId", args.propertyId)
      )
      .unique();

    if (existingFavorite) {
      // Remove favorite
      await ctx.db.delete(existingFavorite._id);
      return { saved: false };
    } else {
      // Add favorite
      await ctx.db.insert("favorites", {
        userId: user._id,
        propertyId: args.propertyId,
        createdAt: Date.now(),
      });
      return { saved: true };
    }
  },
});

// List all saved properties for the current user
export const listMyFavorites = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // Get user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    // Get all favorites for this user
    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Fetch all properties for favorites
    const properties = await Promise.all(
      favorites.map(async (fav) => {
        const property = await ctx.db.get(fav.propertyId);
        if (property) {
          return {
            ...property,
            savedAt: fav.createdAt,
          };
        }
        return null;
      })
    );

    // Filter out any null values (deleted properties) and sort by savedAt
    return properties
      .filter((p) => p !== null)
      .sort((a, b) => b.savedAt - a.savedAt);
  },
});
