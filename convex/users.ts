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

    await ctx.db.patch(user._id, {
      role: args.role,
      onboardingComplete: true,
      updatedAt: Date.now(),
    });
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
