import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ============================================================================
// FOLLOW/UNFOLLOW MUTATIONS
// ============================================================================

// Follow a user (idempotent - following twice has no additional effect)
export const followUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) {
      throw new Error("User not found");
    }

    // Cannot follow yourself
    if (currentUser._id === args.userId) {
      throw new Error("Cannot follow yourself");
    }

    // Validate target user exists
    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("Target user not found");
    }

    // Check if already following using compound index
    const existing = await ctx.db
      .query("userFollows")
      .withIndex("by_follower_and_following", (q) =>
        q.eq("followerId", currentUser._id).eq("followingId", args.userId)
      )
      .unique();

    // Idempotent: if already following, return early
    if (existing) {
      return { success: true, alreadyFollowing: true };
    }

    // Insert follow record
    await ctx.db.insert("userFollows", {
      followerId: currentUser._id,
      followingId: args.userId,
      createdAt: Date.now(),
    });

    return { success: true, alreadyFollowing: false };
  },
});

// Unfollow a user (idempotent - unfollowing a non-followed user has no effect)
export const unfollowUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) {
      throw new Error("User not found");
    }

    // Find existing follow using compound index
    const existing = await ctx.db
      .query("userFollows")
      .withIndex("by_follower_and_following", (q) =>
        q.eq("followerId", currentUser._id).eq("followingId", args.userId)
      )
      .unique();

    // Idempotent: if not following, return early
    if (!existing) {
      return { success: true, wasFollowing: false };
    }

    // Delete follow record
    await ctx.db.delete(existing._id);

    return { success: true, wasFollowing: true };
  },
});

// ============================================================================
// FOLLOW STATUS QUERIES
// ============================================================================

// Check if current user is following a specific user
export const isFollowing = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) {
      return false;
    }

    // Query using compound index
    const follow = await ctx.db
      .query("userFollows")
      .withIndex("by_follower_and_following", (q) =>
        q.eq("followerId", currentUser._id).eq("followingId", args.userId)
      )
      .unique();

    return follow !== null;
  },
});

// Get followers of a user (users who follow them)
export const getFollowers = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // Query followers using by_following index
    const follows = await ctx.db
      .query("userFollows")
      .withIndex("by_following", (q) => q.eq("followingId", args.userId))
      .collect();

    // Enrich with follower user info
    const followers = await Promise.all(
      follows.map(async (follow) => {
        const user = await ctx.db.get(follow.followerId);
        if (!user) return null;

        return {
          _id: user._id,
          name: user.name || user.email || "Unknown",
          imageUrl: user.imageUrl,
          role: user.role,
          followedAt: follow.createdAt,
        };
      })
    );

    // Filter out null entries (deleted users)
    return followers.filter((f) => f !== null);
  },
});

// Get users that a user is following
export const getFollowing = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // Query following using by_follower index
    const follows = await ctx.db
      .query("userFollows")
      .withIndex("by_follower", (q) => q.eq("followerId", args.userId))
      .collect();

    // Enrich with following user info
    const following = await Promise.all(
      follows.map(async (follow) => {
        const user = await ctx.db.get(follow.followingId);
        if (!user) return null;

        return {
          _id: user._id,
          name: user.name || user.email || "Unknown",
          imageUrl: user.imageUrl,
          role: user.role,
          followedAt: follow.createdAt,
        };
      })
    );

    // Filter out null entries (deleted users)
    return following.filter((f) => f !== null);
  },
});

// Get follower and following counts for a user
export const getFollowCounts = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { followerCount: 0, followingCount: 0 };
    }

    // Count followers (users who follow this user)
    const followers = await ctx.db
      .query("userFollows")
      .withIndex("by_following", (q) => q.eq("followingId", args.userId))
      .collect();

    // Count following (users this user follows)
    const following = await ctx.db
      .query("userFollows")
      .withIndex("by_follower", (q) => q.eq("followerId", args.userId))
      .collect();

    return {
      followerCount: followers.length,
      followingCount: following.length,
    };
  },
});
