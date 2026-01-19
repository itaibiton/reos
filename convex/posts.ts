import { query, mutation, QueryCtx } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Check if user can view a post based on visibility rules
async function canViewPost(
  ctx: QueryCtx,
  post: Doc<"posts">,
  viewerId: Id<"users">
): Promise<boolean> {
  // Author can always see own posts
  if (post.authorId === viewerId) return true;

  switch (post.visibility) {
    case "public":
      return true;

    case "followers_only":
      const follows = await ctx.db
        .query("userFollows")
        .withIndex("by_follower_and_following", (q) =>
          q.eq("followerId", viewerId).eq("followingId", post.authorId)
        )
        .unique();
      return follows !== null;

    case "deal_participants":
      if (!post.dealId) return false;
      const deal = await ctx.db.get(post.dealId);
      if (!deal) return false;
      return (
        deal.investorId === viewerId ||
        deal.brokerId === viewerId ||
        deal.mortgageAdvisorId === viewerId ||
        deal.lawyerId === viewerId
      );

    default:
      return false;
  }
}

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

// Following feed - posts from users the current user follows
export const followingFeed = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    // Get list of users the current user follows
    const follows = await ctx.db
      .query("userFollows")
      .withIndex("by_follower", (q) => q.eq("followerId", user._id))
      .collect();

    const followingIds = new Set(follows.map((f) => f.followingId.toString()));

    // Query public posts, paginate
    // Note: In-memory filtering after pagination is acceptable per research
    // (Convex single-index constraint). Over-fetch slightly to account for filtering.
    const results = await ctx.db
      .query("posts")
      .withIndex("by_visibility_and_time", (q) => q.eq("visibility", "public"))
      .order("desc")
      .paginate(args.paginationOpts);

    // Filter to posts from followed users + own posts
    const filteredPage = results.page.filter(
      (post) =>
        followingIds.has(post.authorId.toString()) || post.authorId === user._id
    );

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

// Get a single post by ID with visibility check
export const getPost = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
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

    // Get the post
    const post = await ctx.db.get(args.postId);
    if (!post) {
      return null;
    }

    // Check if current user can view this post
    const canView = await canViewPost(ctx, post, user._id);
    if (!canView) {
      return null;
    }

    // Enrich and return
    return enrichPost(ctx, post);
  },
});

// ============================================================================
// LIKE/UNLIKE MUTATIONS
// ============================================================================

// Like a post (idempotent - liking twice has no additional effect)
export const likePost = mutation({
  args: {
    postId: v.id("posts"),
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

    // Validate post exists
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    // Check if already liked using compound index
    const existing = await ctx.db
      .query("postLikes")
      .withIndex("by_post_and_user", (q) =>
        q.eq("postId", args.postId).eq("userId", user._id)
      )
      .unique();

    // Idempotent: if already liked, return early
    if (existing) {
      return { success: true, alreadyLiked: true };
    }

    // Insert like record
    await ctx.db.insert("postLikes", {
      postId: args.postId,
      userId: user._id,
      createdAt: Date.now(),
    });

    // Atomically increment likeCount on post
    await ctx.db.patch(args.postId, {
      likeCount: post.likeCount + 1,
    });

    return { success: true, alreadyLiked: false };
  },
});

// Unlike a post (idempotent - unliking a non-liked post has no effect)
export const unlikePost = mutation({
  args: {
    postId: v.id("posts"),
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

    // Validate post exists
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    // Find existing like using compound index
    const existing = await ctx.db
      .query("postLikes")
      .withIndex("by_post_and_user", (q) =>
        q.eq("postId", args.postId).eq("userId", user._id)
      )
      .unique();

    // Idempotent: if not liked, return early
    if (!existing) {
      return { success: true, wasLiked: false };
    }

    // Delete like record
    await ctx.db.delete(existing._id);

    // Atomically decrement likeCount (prevent negative)
    await ctx.db.patch(args.postId, {
      likeCount: Math.max(0, post.likeCount - 1),
    });

    return { success: true, wasLiked: true };
  },
});

// Check if current user has liked a post
export const isLikedByUser = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return false;
    }

    // Query using compound index
    const like = await ctx.db
      .query("postLikes")
      .withIndex("by_post_and_user", (q) =>
        q.eq("postId", args.postId).eq("userId", user._id)
      )
      .unique();

    return like !== null;
  },
});

// ============================================================================
// SAVE/UNSAVE MUTATIONS
// ============================================================================

// Save a post (bookmark) - idempotent
export const savePost = mutation({
  args: {
    postId: v.id("posts"),
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

    // Validate post exists
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    // Check if already saved using compound index
    const existing = await ctx.db
      .query("postSaves")
      .withIndex("by_post_and_user", (q) =>
        q.eq("postId", args.postId).eq("userId", user._id)
      )
      .unique();

    // Idempotent: if already saved, return early
    if (existing) {
      return { success: true, alreadySaved: true };
    }

    // Insert save record
    await ctx.db.insert("postSaves", {
      postId: args.postId,
      userId: user._id,
      createdAt: Date.now(),
    });

    // Atomically increment saveCount on post
    await ctx.db.patch(args.postId, {
      saveCount: post.saveCount + 1,
    });

    return { success: true, alreadySaved: false };
  },
});

// Unsave a post (remove bookmark) - idempotent
export const unsavePost = mutation({
  args: {
    postId: v.id("posts"),
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

    // Validate post exists
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    // Find existing save using compound index
    const existing = await ctx.db
      .query("postSaves")
      .withIndex("by_post_and_user", (q) =>
        q.eq("postId", args.postId).eq("userId", user._id)
      )
      .unique();

    // Idempotent: if not saved, return early
    if (!existing) {
      return { success: true, wasSaved: false };
    }

    // Delete save record
    await ctx.db.delete(existing._id);

    // Atomically decrement saveCount (prevent negative)
    await ctx.db.patch(args.postId, {
      saveCount: Math.max(0, post.saveCount - 1),
    });

    return { success: true, wasSaved: true };
  },
});

// Check if current user has saved a post
export const isSavedByUser = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return false;
    }

    // Query using compound index
    const save = await ctx.db
      .query("postSaves")
      .withIndex("by_post_and_user", (q) =>
        q.eq("postId", args.postId).eq("userId", user._id)
      )
      .unique();

    return save !== null;
  },
});

// Get all saved posts for current user (paginated)
export const getSavedPosts = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    // Query user's saved posts, newest first
    const savedResults = await ctx.db
      .query("postSaves")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .paginate(args.paginationOpts);

    // Fetch and enrich each saved post
    const enrichedPage = await Promise.all(
      savedResults.page.map(async (save) => {
        const post = await ctx.db.get(save.postId);
        if (!post) return null;

        // Check visibility
        const canView = await canViewPost(ctx, post, user._id);
        if (!canView) return null;

        return enrichPost(ctx, post);
      })
    );

    // Filter out null entries (deleted posts or no access)
    const filteredPage = enrichedPage.filter((p) => p !== null);

    return {
      ...savedResults,
      page: filteredPage,
    };
  },
});
