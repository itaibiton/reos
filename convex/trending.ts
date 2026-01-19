import { query, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Calculate trending score using Hacker News time-decay formula
// HN formula: (P-1) / (T+2)^G
// P = engagement points, T = hours since creation, G = gravity factor
function calculateTrendingScore(
  engagementCount: number,
  createdAt: number,
  gravity: number = 1.8
): number {
  const hoursSinceCreation = (Date.now() - createdAt) / (1000 * 60 * 60);
  // Using max(0, ...) to prevent negative scores from 0-engagement posts
  return Math.max(0, engagementCount - 1) / Math.pow(hoursSinceCreation + 2, gravity);
}

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
// TRENDING QUERIES
// ============================================================================

// Get trending posts - sorted by engagement velocity with time decay
export const getTrendingPosts = query({
  args: {
    timeWindow: v.union(v.literal("today"), v.literal("week")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    const limit = args.limit ?? 10;
    const now = Date.now();

    // Calculate cutoff time based on window
    const cutoffTime =
      args.timeWindow === "today"
        ? now - 24 * 60 * 60 * 1000 // 24 hours
        : now - 7 * 24 * 60 * 60 * 1000; // 7 days

    // Query public posts - over-fetch to have enough for scoring
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_visibility_and_time", (q) => q.eq("visibility", "public"))
      .order("desc")
      .take(100);

    // Filter to posts within time window
    const recentPosts = posts.filter((post) => post.createdAt >= cutoffTime);

    // Calculate trending score for each post
    const scoredPosts = recentPosts.map((post) => {
      const engagementCount = post.likeCount + post.commentCount + post.saveCount;
      const score = calculateTrendingScore(engagementCount, post.createdAt);
      return { post, score };
    });

    // Sort by score descending
    scoredPosts.sort((a, b) => b.score - a.score);

    // Take top N
    const topPosts = scoredPosts.slice(0, limit);

    // Enrich with author info
    const enrichedPosts = await Promise.all(
      topPosts.map(({ post }) => enrichPost(ctx, post))
    );

    return enrichedPosts;
  },
});

// Get trending properties - based on favorites and deal activity
export const getTrendingProperties = query({
  args: {
    timeWindow: v.union(v.literal("today"), v.literal("week")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    const limit = args.limit ?? 10;
    const now = Date.now();

    // Calculate cutoff time based on window
    const cutoffTime =
      args.timeWindow === "today"
        ? now - 24 * 60 * 60 * 1000 // 24 hours
        : now - 7 * 24 * 60 * 60 * 1000; // 7 days

    // Query available properties
    const properties = await ctx.db
      .query("properties")
      .withIndex("by_status", (q) => q.eq("status", "available"))
      .collect();

    // Filter to properties created within time window
    const recentProperties = properties.filter(
      (prop) => prop.createdAt >= cutoffTime
    );

    // Score each property based on favorites and deals
    const scoredProperties = await Promise.all(
      recentProperties.map(async (property) => {
        // Get favorites count for this property
        const favorites = await ctx.db
          .query("favorites")
          .withIndex("by_property", (q) => q.eq("propertyId", property._id))
          .collect();
        const favoritesCount = favorites.length;

        // Get deals count for this property
        const deals = await ctx.db
          .query("deals")
          .withIndex("by_property", (q) => q.eq("propertyId", property._id))
          .collect();
        const dealsCount = deals.length;

        // Score: favorites + (deals * 2) with time decay
        const engagementCount = favoritesCount + dealsCount * 2;
        const score = calculateTrendingScore(engagementCount, property.createdAt);

        return { property, score };
      })
    );

    // Sort by score descending
    scoredProperties.sort((a, b) => b.score - a.score);

    // Take top N
    const topProperties = scoredProperties.slice(0, limit);

    // Return enriched property data
    return topProperties.map(({ property }) => ({
      _id: property._id,
      title: property.title,
      city: property.city,
      priceUsd: property.priceUsd,
      priceIls: property.priceIls,
      featuredImage: property.featuredImage,
      propertyType: property.propertyType,
      status: property.status,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      squareMeters: property.squareMeters,
      expectedRoi: property.expectedRoi,
      createdAt: property.createdAt,
    }));
  },
});
