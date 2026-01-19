import { query, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Get current user from auth context
async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();
}

// Enrich post with author and property info (same pattern as posts.ts)
async function enrichPost(ctx: QueryCtx, post: Doc<"posts">) {
  const author = await ctx.db.get(post.authorId);

  let property = null;
  if (post.postType === "property_listing" && post.propertyId) {
    const prop = await ctx.db.get(post.propertyId);
    if (prop) {
      property = {
        _id: prop._id,
        title: prop.title,
        city: prop.city,
        priceUsd: prop.priceUsd,
        featuredImage: prop.featuredImage,
      };
    }
  }

  return {
    ...post,
    authorName: author?.name || author?.email || "Unknown",
    authorImageUrl: author?.imageUrl,
    authorRole: author?.role,
    property,
  };
}

// ============================================================================
// RECOMMENDATION QUERIES
// ============================================================================

// Suggested users to follow (People to follow)
// Strategy: Friends-of-friends (+2 score) + same role (+1 score)
// Filter out: self, already following, users without onboardingComplete
export const suggestedUsers = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    const limit = args.limit ?? 5;

    // Get current user's follows
    const userFollows = await ctx.db
      .query("userFollows")
      .withIndex("by_follower", (q) => q.eq("followerId", user._id))
      .collect();

    const followingIds = new Set(userFollows.map((f) => f.followingId.toString()));

    // Score map for candidates: userId -> score
    const candidateScores = new Map<string, number>();

    // Strategy 1: Friends-of-friends (+2 score)
    // Find users followed by people the current user follows
    for (const follow of userFollows) {
      const friendFollows = await ctx.db
        .query("userFollows")
        .withIndex("by_follower", (q) => q.eq("followerId", follow.followingId))
        .collect();

      for (const ff of friendFollows) {
        const candidateId = ff.followingId.toString();
        // Skip self and already following
        if (candidateId === user._id.toString()) continue;
        if (followingIds.has(candidateId)) continue;

        const currentScore = candidateScores.get(candidateId) || 0;
        candidateScores.set(candidateId, currentScore + 2);
      }
    }

    // Strategy 2: Same role (+1 score)
    if (user.role) {
      const sameRoleUsers = await ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", user.role))
        .collect();

      for (const sameRoleUser of sameRoleUsers) {
        const candidateId = sameRoleUser._id.toString();
        // Skip self and already following
        if (candidateId === user._id.toString()) continue;
        if (followingIds.has(candidateId)) continue;

        const currentScore = candidateScores.get(candidateId) || 0;
        candidateScores.set(candidateId, currentScore + 1);
      }
    }

    // Convert to array and sort by score
    const sortedCandidates = Array.from(candidateScores.entries())
      .sort((a, b) => b[1] - a[1]);

    // Fetch and filter candidates
    const results = [];
    for (const [candidateId] of sortedCandidates) {
      if (results.length >= limit) break;

      const candidate = await ctx.db.get(candidateId as Id<"users">);
      if (!candidate) continue;

      // Filter out users who haven't completed onboarding
      if (!candidate.onboardingComplete) continue;

      results.push({
        _id: candidate._id,
        name: candidate.name || candidate.email || "Unknown",
        imageUrl: candidate.imageUrl,
        role: candidate.role,
      });
    }

    return results;
  },
});

// Suggested posts (Posts you might like)
// Strategy: Recent popular posts from same-role users
export const suggestedPosts = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    const limit = args.limit ?? 5;
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

    // Get users with the same role (if user has a role)
    let sameRoleUserIds = new Set<string>();
    if (user.role) {
      const sameRoleUsers = await ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", user.role))
        .collect();

      sameRoleUserIds = new Set(sameRoleUsers.map((u) => u._id.toString()));
    }

    // Query recent public posts (last 7 days)
    const recentPosts = await ctx.db
      .query("posts")
      .withIndex("by_visibility_and_time", (q) => q.eq("visibility", "public"))
      .order("desc")
      .take(100);

    // Filter to posts within last week
    const weekPosts = recentPosts.filter((post) => post.createdAt >= weekAgo);

    // Filter to posts by same-role users (if user has a role)
    // If user has no role, include all posts
    const filteredPosts = user.role
      ? weekPosts.filter((post) => sameRoleUserIds.has(post.authorId.toString()))
      : weekPosts;

    // Sort by engagement (likeCount + commentCount)
    const sortedPosts = filteredPosts
      .map((post) => ({
        post,
        engagement: post.likeCount + post.commentCount,
      }))
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, limit)
      .map(({ post }) => post);

    // Enrich with author info
    const enrichedPosts = await Promise.all(
      sortedPosts.map((post) => enrichPost(ctx, post))
    );

    return enrichedPosts;
  },
});
