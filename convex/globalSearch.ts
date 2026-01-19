import { query } from "./_generated/server";
import { v } from "convex/values";

// ============================================================================
// UNIFIED GLOBAL SEARCH QUERIES
// ============================================================================

// Search result type filter
const searchResultType = v.optional(
  v.union(v.literal("post"), v.literal("user"), v.literal("property"))
);

// Autocomplete search - limited results for dropdown suggestions
export const search = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { posts: [], users: [], properties: [] };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return { posts: [], users: [], properties: [] };
    }

    const searchQuery = args.query.trim();
    if (!searchQuery) {
      return { posts: [], users: [], properties: [] };
    }

    const limit = args.limit ?? 5;

    // Search all three tables in parallel
    const [posts, users, properties] = await Promise.all([
      // Search posts - only public posts
      ctx.db
        .query("posts")
        .withSearchIndex("search_content", (q) =>
          q.search("content", searchQuery).eq("visibility", "public")
        )
        .take(limit),

      // Search users - only onboarded users
      ctx.db
        .query("users")
        .withSearchIndex("search_name", (q) =>
          q.search("name", searchQuery).eq("onboardingComplete", true)
        )
        .take(limit),

      // Search properties - only available properties
      ctx.db
        .query("properties")
        .withSearchIndex("search_title", (q) =>
          q.search("title", searchQuery).eq("status", "available")
        )
        .take(limit),
    ]);

    return {
      posts: posts.map((p) => ({
        _id: p._id,
        content: p.content.slice(0, 100), // Preview
        postType: p.postType,
        resultType: "post" as const,
      })),
      users: users.map((u) => ({
        _id: u._id,
        name: u.name,
        imageUrl: u.imageUrl,
        role: u.role,
        resultType: "user" as const,
      })),
      properties: properties.map((p) => ({
        _id: p._id,
        title: p.title,
        city: p.city,
        priceUsd: p.priceUsd,
        featuredImage: p.featuredImage,
        resultType: "property" as const,
      })),
    };
  },
});

// Full search results page - paginated with enriched data
export const searchFull = query({
  args: {
    query: v.string(),
    type: searchResultType,
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { posts: [], users: [], properties: [], totalCount: 0 };
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) {
      return { posts: [], users: [], properties: [], totalCount: 0 };
    }

    const searchQuery = args.query.trim();
    if (!searchQuery) {
      return { posts: [], users: [], properties: [], totalCount: 0 };
    }

    const limit = args.limit ?? 20;
    const searchType = args.type;

    // Search based on type filter (or all if no filter)
    const searchPosts = !searchType || searchType === "post";
    const searchUsers = !searchType || searchType === "user";
    const searchProperties = !searchType || searchType === "property";

    // Run searches in parallel
    const [postsRaw, usersRaw, propertiesRaw] = await Promise.all([
      searchPosts
        ? ctx.db
            .query("posts")
            .withSearchIndex("search_content", (q) =>
              q.search("content", searchQuery).eq("visibility", "public")
            )
            .take(limit)
        : Promise.resolve([]),

      searchUsers
        ? ctx.db
            .query("users")
            .withSearchIndex("search_name", (q) =>
              q.search("name", searchQuery).eq("onboardingComplete", true)
            )
            .take(limit)
        : Promise.resolve([]),

      searchProperties
        ? ctx.db
            .query("properties")
            .withSearchIndex("search_title", (q) =>
              q.search("title", searchQuery).eq("status", "available")
            )
            .take(limit)
        : Promise.resolve([]),
    ]);

    // Enrich posts with author info (like globalFeed does)
    const posts = await Promise.all(
      postsRaw.map(async (post) => {
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
          resultType: "post" as const,
        };
      })
    );

    // Enrich users with follower status
    const users = await Promise.all(
      usersRaw.map(async (u) => {
        // Check if current user follows this user
        const follows = await ctx.db
          .query("userFollows")
          .withIndex("by_follower_and_following", (q) =>
            q.eq("followerId", currentUser._id).eq("followingId", u._id)
          )
          .unique();

        // Get service provider profile if applicable
        let providerProfile = null;
        if (
          u.role === "broker" ||
          u.role === "mortgage_advisor" ||
          u.role === "lawyer"
        ) {
          providerProfile = await ctx.db
            .query("serviceProviderProfiles")
            .withIndex("by_user", (q) => q.eq("userId", u._id))
            .unique();
        }

        return {
          _id: u._id,
          name: u.name,
          email: u.email,
          imageUrl: u.imageUrl,
          role: u.role,
          isFollowing: follows !== null,
          isCurrentUser: u._id === currentUser._id,
          specializations: providerProfile?.specializations || [],
          serviceAreas: providerProfile?.serviceAreas || [],
          resultType: "user" as const,
        };
      })
    );

    // Enrich properties with full details for cards
    const properties = propertiesRaw.map((p) => ({
      _id: p._id,
      title: p.title,
      description: p.description,
      city: p.city,
      address: p.address,
      priceUsd: p.priceUsd,
      priceIls: p.priceIls,
      propertyType: p.propertyType,
      status: p.status,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      squareMeters: p.squareMeters,
      featuredImage: p.featuredImage,
      expectedRoi: p.expectedRoi,
      capRate: p.capRate,
      resultType: "property" as const,
    }));

    const totalCount = posts.length + users.length + properties.length;

    return {
      posts,
      users,
      properties,
      totalCount,
    };
  },
});
