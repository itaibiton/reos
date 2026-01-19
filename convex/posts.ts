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

// Enrich post with author and property info (and original post for reposts)
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

  // For reposts, fetch and enrich the original post
  let originalPost = null;
  if (post.postType === "repost" && post.originalPostId) {
    const original = await ctx.db.get(post.originalPostId);
    if (original) {
      const originalAuthor = await ctx.db.get(original.authorId);
      let originalProperty = null;
      if (original.postType === "property_listing" && original.propertyId) {
        const prop = await ctx.db.get(original.propertyId);
        if (prop) {
          originalProperty = {
            _id: prop._id,
            title: prop.title,
            city: prop.city,
            priceUsd: prop.priceUsd,
            featuredImage: prop.featuredImage,
          };
        }
      }
      originalPost = {
        ...original,
        authorName: originalAuthor?.name || originalAuthor?.email || "Unknown",
        authorImageUrl: originalAuthor?.imageUrl,
        authorRole: originalAuthor?.role,
        property: originalProperty,
      };
    }
  }

  return {
    ...post,
    authorName: author?.name || author?.email || "Unknown",
    authorImageUrl: author?.imageUrl,
    authorRole: author?.role,
    property,
    originalPost, // Will be null for non-repost posts
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

// ============================================================================
// COMMENT MUTATIONS AND QUERIES
// ============================================================================

// Add a comment to a post
export const addComment = mutation({
  args: {
    postId: v.id("posts"),
    content: v.string(),
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

    // Validate content is not empty
    const trimmedContent = args.content.trim();
    if (!trimmedContent) {
      throw new Error("Comment cannot be empty");
    }

    // Limit comment length (1000 chars)
    if (trimmedContent.length > 1000) {
      throw new Error("Comment too long (max 1000 characters)");
    }

    // Insert comment
    const commentId = await ctx.db.insert("postComments", {
      postId: args.postId,
      authorId: user._id,
      content: trimmedContent,
      createdAt: Date.now(),
    });

    // Increment commentCount on post
    await ctx.db.patch(args.postId, {
      commentCount: post.commentCount + 1,
    });

    return commentId;
  },
});

// Get comments for a post (paginated, newest first)
export const getComments = query({
  args: {
    postId: v.id("posts"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    // Get comments with pagination, newest first
    const results = await ctx.db
      .query("postComments")
      .withIndex("by_post_and_time", (q) => q.eq("postId", args.postId))
      .order("desc")
      .paginate(args.paginationOpts);

    // Enrich with author info
    const enrichedPage = await Promise.all(
      results.page.map(async (comment) => {
        const author = await ctx.db.get(comment.authorId);
        return {
          ...comment,
          authorName: author?.name || author?.email || "Unknown",
          authorImageUrl: author?.imageUrl,
          authorRole: author?.role,
        };
      })
    );

    return {
      ...results,
      page: enrichedPage,
    };
  },
});

// ============================================================================
// REPOST MUTATIONS AND QUERIES
// ============================================================================

// Create a repost of an existing post
export const createRepost = mutation({
  args: {
    originalPostId: v.id("posts"),
    repostComment: v.optional(v.string()),
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

    // Validate original post exists
    const originalPost = await ctx.db.get(args.originalPostId);
    if (!originalPost) {
      throw new Error("Original post not found");
    }

    // Cannot repost a repost
    if (originalPost.postType === "repost") {
      throw new Error("Cannot repost a repost");
    }

    // Check if user already reposted this post
    const existingRepost = await ctx.db
      .query("postReposts")
      .withIndex("by_original_and_user", (q) =>
        q.eq("originalPostId", args.originalPostId).eq("userId", user._id)
      )
      .unique();

    if (existingRepost) {
      throw new Error("You have already reposted this post");
    }

    // Validate repost comment length if provided
    const repostComment = args.repostComment?.trim();
    if (repostComment && repostComment.length > 500) {
      throw new Error("Repost comment too long (max 500 characters)");
    }

    const now = Date.now();

    // Create the repost post entry
    const repostId = await ctx.db.insert("posts", {
      authorId: user._id,
      postType: "repost",
      content: repostComment || "", // Use comment as content, or empty string
      visibility: args.visibility,
      originalPostId: args.originalPostId,
      repostComment: repostComment || undefined,
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
      saveCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    // Create tracking record
    await ctx.db.insert("postReposts", {
      originalPostId: args.originalPostId,
      userId: user._id,
      repostId,
      createdAt: now,
    });

    // Increment shareCount on original post (shareCount doubles as repost count)
    await ctx.db.patch(args.originalPostId, {
      shareCount: originalPost.shareCount + 1,
    });

    return repostId;
  },
});

// Remove a repost
export const removeRepost = mutation({
  args: {
    repostId: v.id("posts"),
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

    // Get the repost
    const repost = await ctx.db.get(args.repostId);
    if (!repost) {
      throw new Error("Repost not found");
    }

    // Verify it's a repost and the user owns it
    if (repost.postType !== "repost") {
      throw new Error("Not a repost");
    }

    if (repost.authorId !== user._id) {
      throw new Error("You can only remove your own reposts");
    }

    // Find and delete the tracking record
    const repostRecord = await ctx.db
      .query("postReposts")
      .withIndex("by_original_and_user", (q) =>
        q.eq("originalPostId", repost.originalPostId!).eq("userId", user._id)
      )
      .unique();

    if (repostRecord) {
      await ctx.db.delete(repostRecord._id);
    }

    // Decrement shareCount on original post
    if (repost.originalPostId) {
      const originalPost = await ctx.db.get(repost.originalPostId);
      if (originalPost) {
        await ctx.db.patch(repost.originalPostId, {
          shareCount: Math.max(0, originalPost.shareCount - 1),
        });
      }
    }

    // Delete the repost
    await ctx.db.delete(args.repostId);

    return { success: true };
  },
});

// Check if current user has reposted a post
export const isRepostedByUser = query({
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
    const repost = await ctx.db
      .query("postReposts")
      .withIndex("by_original_and_user", (q) =>
        q.eq("originalPostId", args.postId).eq("userId", user._id)
      )
      .unique();

    return repost !== null;
  },
});

// Get reposts of a post
export const getReposts = query({
  args: {
    postId: v.id("posts"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    // Get repost records for this post
    const results = await ctx.db
      .query("postReposts")
      .withIndex("by_original", (q) => q.eq("originalPostId", args.postId))
      .order("desc")
      .paginate(args.paginationOpts);

    // Fetch and enrich each repost
    const enrichedPage = await Promise.all(
      results.page.map(async (record) => {
        const repost = await ctx.db.get(record.repostId);
        if (!repost) return null;
        return enrichPost(ctx, repost);
      })
    );

    // Filter out nulls
    const filteredPage = enrichedPage.filter((p) => p !== null);

    return {
      ...results,
      page: filteredPage,
    };
  },
});

// Get user's reposts (for profile page)
export const getUserReposts = query({
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

    // Query user's reposts, newest first
    const results = await ctx.db
      .query("posts")
      .withIndex("by_author_and_time", (q) => q.eq("authorId", args.userId))
      .order("desc")
      .paginate(args.paginationOpts);

    // Filter to only reposts
    const reposts = results.page.filter((p) => p.postType === "repost");

    // Check visibility permissions
    const isOwnProfile = currentUser._id === args.userId;
    const follows = await ctx.db
      .query("userFollows")
      .withIndex("by_follower_and_following", (q) =>
        q.eq("followerId", currentUser._id).eq("followingId", args.userId)
      )
      .unique();
    const isFollowing = follows !== null;

    // Filter posts based on visibility
    const visibleReposts = reposts.filter((post) => {
      if (isOwnProfile) return true;
      if (post.visibility === "public") return true;
      if (post.visibility === "followers_only" && isFollowing) return true;
      return false;
    });

    // Enrich with author and original post info
    const enrichedPage = await Promise.all(
      visibleReposts.map((post) => enrichPost(ctx, post))
    );

    return {
      ...results,
      page: enrichedPage,
    };
  },
});
