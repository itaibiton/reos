import { query, mutation, QueryCtx } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Enrich post with author and property info
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

// Post visibility types
const postVisibilityType = v.union(
  v.literal("public"),
  v.literal("followers_only")
);

// Post type filter
const postTypeFilter = v.optional(
  v.union(
    v.literal("property_listing"),
    v.literal("service_request"),
    v.literal("discussion")
  )
);

// Service type for service requests
const serviceTypeArg = v.union(
  v.literal("broker"),
  v.literal("mortgage_advisor"),
  v.literal("lawyer")
);

// ============================================================================
// POST CREATION MUTATIONS
// ============================================================================

// Create a property listing post
export const createPropertyPost = mutation({
  args: {
    propertyId: v.id("properties"),
    content: v.string(),
    visibility: postVisibilityType,
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

    // Validate property exists
    const property = await ctx.db.get(args.propertyId);
    if (!property) {
      throw new Error("Property not found");
    }

    // Validate content is not empty
    const trimmedContent = args.content.trim();
    if (!trimmedContent) {
      throw new Error("Post content cannot be empty");
    }

    const now = Date.now();
    return await ctx.db.insert("posts", {
      authorId: user._id,
      postType: "property_listing",
      content: trimmedContent,
      visibility: args.visibility,
      propertyId: args.propertyId,
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
      saveCount: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Create a service request post
export const createServiceRequestPost = mutation({
  args: {
    content: v.string(),
    serviceType: serviceTypeArg,
    visibility: postVisibilityType,
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

    // Validate content is not empty
    const trimmedContent = args.content.trim();
    if (!trimmedContent) {
      throw new Error("Post content cannot be empty");
    }

    const now = Date.now();
    return await ctx.db.insert("posts", {
      authorId: user._id,
      postType: "service_request",
      content: trimmedContent,
      visibility: args.visibility,
      serviceType: args.serviceType,
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
      saveCount: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Create a discussion post
export const createDiscussionPost = mutation({
  args: {
    content: v.string(),
    visibility: postVisibilityType,
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

    // Validate content is not empty
    const trimmedContent = args.content.trim();
    if (!trimmedContent) {
      throw new Error("Post content cannot be empty");
    }

    const now = Date.now();
    return await ctx.db.insert("posts", {
      authorId: user._id,
      postType: "discussion",
      content: trimmedContent,
      visibility: args.visibility,
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
      saveCount: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// ============================================================================
// FEED QUERIES
// ============================================================================

// Global feed - public posts, newest first
export const globalFeed = query({
  args: {
    paginationOpts: paginationOptsValidator,
    postType: postTypeFilter,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    // Query public posts, newest first
    const results = await ctx.db
      .query("posts")
      .withIndex("by_visibility_and_time", (q) => q.eq("visibility", "public"))
      .order("desc")
      .paginate(args.paginationOpts);

    // Filter by post type if specified (in memory)
    let filteredPage = results.page;
    if (args.postType) {
      filteredPage = filteredPage.filter((p) => p.postType === args.postType);
    }

    // Enrich with author and property info
    const enrichedPage = await Promise.all(
      filteredPage.map((post) => enrichPost(ctx, post))
    );

    return {
      ...results,
      page: enrichedPage,
    };
  },
});

// User feed - posts by a specific user
export const userFeed = query({
  args: {
    userId: v.id("users"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    // Get current user
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    // Query posts by the target user, newest first
    const results = await ctx.db
      .query("posts")
      .withIndex("by_author_and_time", (q) => q.eq("authorId", args.userId))
      .order("desc")
      .paginate(args.paginationOpts);

    // Check if current user follows the target user
    const follows = await ctx.db
      .query("userFollows")
      .withIndex("by_follower_and_following", (q) =>
        q.eq("followerId", currentUser._id).eq("followingId", args.userId)
      )
      .unique();

    const isFollowing = follows !== null;
    const isOwnProfile = currentUser._id === args.userId;

    // Filter posts based on visibility
    const visiblePosts = results.page.filter((post) => {
      // Own posts always visible
      if (isOwnProfile) return true;
      // Public posts always visible
      if (post.visibility === "public") return true;
      // Followers-only posts visible if following
      if (post.visibility === "followers_only" && isFollowing) return true;
      // deal_participants visibility not supported in user feed context
      return false;
    });

    // Enrich with author and property info
    const enrichedPage = await Promise.all(
      visiblePosts.map((post) => enrichPost(ctx, post))
    );

    return {
      ...results,
      page: enrichedPage,
    };
  },
});
