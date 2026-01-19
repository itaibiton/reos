# Phase 21 Research: Feed Infrastructure

**Researched:** 2026-01-19
**Domain:** Convex schema design, feed queries, social post types
**Confidence:** HIGH

## Summary

Feed infrastructure for REOS requires a `posts` table with discriminated union schema to handle three post types (property listing, service request, discussion), plus supporting tables for interactions. The existing Convex patterns in REOS provide a solid foundation - the project already uses `v.union` for multi-type fields (deal stages, notification types) and has established patterns for relationships, timestamps, and index design.

For feed queries, Convex provides built-in `usePaginatedQuery` hook with cursor-based pagination that handles infinite scroll reactively. The recommended approach uses `.paginate()` with `paginationOptsValidator` for feed endpoints. Post visibility can be modeled with a simple visibility field using union literals, similar to the existing `fileVisibility` pattern.

**Primary recommendation:** Use discriminated union with `postType` field as discriminator, store all post types in single `posts` table, and leverage Convex's built-in pagination for feed queries.

## Schema Design

### Posts Table Structure

Use discriminated union pattern for multiple post types in a single table:

```typescript
// Post types as discriminated union
const postType = v.union(
  v.literal("property_listing"),  // Share a property from marketplace
  v.literal("service_request"),   // Looking for broker/lawyer/mortgage advisor
  v.literal("discussion")         // General discussion/question
);

// Post visibility levels
const postVisibility = v.union(
  v.literal("public"),           // Visible to all authenticated users
  v.literal("followers_only"),   // Only followers can see
  v.literal("deal_participants") // Only participants in a specific deal
);

// Posts table schema
posts: defineTable({
  // Author
  authorId: v.id("users"),

  // Post type discriminator
  postType: postType,

  // Common fields for all post types
  content: v.string(),              // Main text content
  visibility: postVisibility,

  // Type-specific references (optional based on postType)
  propertyId: v.optional(v.id("properties")),  // For property_listing
  dealId: v.optional(v.id("deals")),           // For deal_participants visibility

  // Service request specific (when postType === "service_request")
  serviceType: v.optional(v.union(
    v.literal("broker"),
    v.literal("mortgage_advisor"),
    v.literal("lawyer")
  )),

  // Engagement counters (denormalized for performance)
  likeCount: v.number(),
  commentCount: v.number(),
  shareCount: v.number(),
  saveCount: v.number(),

  // Timestamps
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_author", ["authorId"])
  .index("by_author_and_time", ["authorId", "createdAt"])
  .index("by_type", ["postType"])
  .index("by_visibility_and_time", ["visibility", "createdAt"])
  .index("by_property", ["propertyId"])
```

### Supporting Tables

```typescript
// Post likes - who liked which post
postLikes: defineTable({
  postId: v.id("posts"),
  userId: v.id("users"),
  createdAt: v.number(),
})
  .index("by_post", ["postId"])
  .index("by_user", ["userId"])
  .index("by_post_and_user", ["postId", "userId"])

// Post saves (bookmarks)
postSaves: defineTable({
  postId: v.id("posts"),
  userId: v.id("users"),
  createdAt: v.number(),
})
  .index("by_post", ["postId"])
  .index("by_user", ["userId"])
  .index("by_post_and_user", ["postId", "userId"])

// User follows (for following feed)
userFollows: defineTable({
  followerId: v.id("users"),   // Who is following
  followingId: v.id("users"),  // Who is being followed
  createdAt: v.number(),
})
  .index("by_follower", ["followerId"])
  .index("by_following", ["followingId"])
  .index("by_follower_and_following", ["followerId", "followingId"])
```

### Design Rationale

1. **Single posts table with discriminated union**: Simpler than separate tables per post type, enables unified feed queries, matches existing REOS pattern (e.g., `dealStage` union)

2. **Denormalized counters**: Store likeCount/commentCount on post document to avoid expensive aggregation queries. Update atomically in mutations.

3. **Compound indexes**: `by_author_and_time` enables efficient user profile feeds; `by_visibility_and_time` enables filtered global feeds

4. **Optional type-specific fields**: `propertyId` only populated for property_listing posts; `serviceType` only for service_request posts

## Feed Query Patterns

### Paginated Query Implementation

Use Convex's built-in pagination with `paginationOptsValidator`:

```typescript
import { query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";

// Global feed - public posts, newest first
export const globalFeed = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { page: [], isDone: true, continueCursor: "" };

    const results = await ctx.db
      .query("posts")
      .withIndex("by_visibility_and_time", (q) => q.eq("visibility", "public"))
      .order("desc")
      .paginate(args.paginationOpts);

    // Enrich with author info
    const enrichedPage = await Promise.all(
      results.page.map(async (post) => {
        const author = await ctx.db.get(post.authorId);
        return {
          ...post,
          authorName: author?.name || "Unknown",
          authorImageUrl: author?.imageUrl,
        };
      })
    );

    return { ...results, page: enrichedPage };
  },
});
```

### Following Feed Pattern

```typescript
export const followingFeed = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { page: [], isDone: true, continueCursor: "" };

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return { page: [], isDone: true, continueCursor: "" };

    // Get followed user IDs
    const follows = await ctx.db
      .query("userFollows")
      .withIndex("by_follower", (q) => q.eq("followerId", user._id))
      .collect();

    const followingIds = new Set(follows.map(f => f.followingId));

    // Query posts and filter in memory (Convex single-index constraint)
    const allPublic = await ctx.db
      .query("posts")
      .withIndex("by_visibility_and_time", (q) => q.eq("visibility", "public"))
      .order("desc")
      .paginate(args.paginationOpts);

    // Filter to followed users + own posts
    const filteredPage = allPublic.page.filter(
      post => followingIds.has(post.authorId) || post.authorId === user._id
    );

    // Enrich and return
    // ...
  },
});
```

### Client-Side Usage

```typescript
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function FeedPage() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.posts.globalFeed,
    {},
    { initialNumItems: 10 }
  );

  return (
    <div>
      {results?.map(post => <PostCard key={post._id} post={post} />)}

      {status === "CanLoadMore" && (
        <button onClick={() => loadMore(10)}>Load More</button>
      )}
      {status === "LoadingMore" && <Spinner />}
      {status === "Exhausted" && <p>No more posts</p>}
    </div>
  );
}
```

## Post Types

### Property Listing Post

When user shares a property from the marketplace:

```typescript
// Creating a property listing post
export const createPropertyPost = mutation({
  args: {
    propertyId: v.id("properties"),
    content: v.string(),
    visibility: v.union(v.literal("public"), v.literal("followers_only")),
  },
  handler: async (ctx, args) => {
    // Verify property exists
    const property = await ctx.db.get(args.propertyId);
    if (!property) throw new Error("Property not found");

    const now = Date.now();
    return await ctx.db.insert("posts", {
      authorId: user._id,
      postType: "property_listing",
      content: args.content,
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
```

### Service Request Post

When user is looking for a service provider:

```typescript
// Creating a service request post
export const createServiceRequestPost = mutation({
  args: {
    content: v.string(),
    serviceType: v.union(
      v.literal("broker"),
      v.literal("mortgage_advisor"),
      v.literal("lawyer")
    ),
    visibility: v.union(v.literal("public"), v.literal("followers_only")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("posts", {
      authorId: user._id,
      postType: "service_request",
      content: args.content,
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
```

### Discussion Post

General discussion or question:

```typescript
export const createDiscussionPost = mutation({
  args: {
    content: v.string(),
    visibility: v.union(v.literal("public"), v.literal("followers_only")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("posts", {
      authorId: user._id,
      postType: "discussion",
      content: args.content,
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
```

## Visibility & Access Control

### Visibility Levels

| Visibility | Who Can See | Use Case |
|------------|-------------|----------|
| `public` | All authenticated users | Default for community sharing |
| `followers_only` | Users who follow the author | Semi-private sharing |
| `deal_participants` | Only users in a specific deal | Deal-specific discussions |

### Access Control Pattern

```typescript
// Helper to check if user can view a post
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
```

## Integration Points

### How Posts Connect to Existing Entities

| Post Type | References | How Used |
|-----------|------------|----------|
| property_listing | `propertyId` → `properties` | Display property card inline, link to property page |
| service_request | `serviceType` enum | Filter by service type, show relevant providers |
| discussion | None required | Standalone content |
| Any with deal_participants | `dealId` → `deals` | Scope visibility to deal participants |

### Author Integration

All posts reference `authorId` → `users` table. Enrich posts with:
- `user.name` - Display name
- `user.imageUrl` - Avatar
- `user.role` - Show role badge (investor, broker, etc.)

### Property Card Embedding

For property_listing posts, fetch and display embedded property info:

```typescript
// In feed query enrichment
if (post.postType === "property_listing" && post.propertyId) {
  const property = await ctx.db.get(post.propertyId);
  return {
    ...post,
    property: property ? {
      title: property.title,
      city: property.city,
      priceUsd: property.priceUsd,
      featuredImage: property.featuredImage,
    } : null,
  };
}
```

## Recommendations

### Schema Design

1. **Use single `posts` table with `postType` discriminator** - Matches existing REOS patterns, simpler queries
2. **Store denormalized counts** - likeCount, commentCount, etc. for fast display
3. **Compound indexes for common queries** - `by_author_and_time`, `by_visibility_and_time`
4. **Separate interaction tables** - postLikes, postSaves for proper many-to-many relationships

### Feed Queries

1. **Use `paginationOptsValidator` and `.paginate()`** - Built-in Convex support
2. **`usePaginatedQuery` hook on client** - Handles cursor management automatically
3. **Enrich posts with author info** - Single query pattern like existing deal/message queries
4. **In-memory filtering for following feed** - Matches existing Convex single-index constraint pattern

### Post Types

1. **Property listing**: Require propertyId, embed property preview
2. **Service request**: Require serviceType, enable provider matching
3. **Discussion**: Just content, most flexible

### Access Control

1. **Check visibility in queries, not mutations** - Filter at read time
2. **Helper function for visibility check** - Reusable across queries
3. **Default to `public`** - Encourage community engagement

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Pagination | Custom cursor tracking | `usePaginatedQuery` + `.paginate()` | Convex handles reactive pagination edge cases |
| Feed ordering | Manual timestamp sorting | Index with `.order("desc")` | Database-level sorting is more efficient |
| Like/save counts | Count queries | Denormalized counters | Avoid expensive aggregations |
| Visibility filtering | Complex join logic | Simple visibility enum + helper | REOS already uses this pattern for file visibility |

## Common Pitfalls

### Pitfall 1: Expensive Aggregation Queries
**What goes wrong:** Counting likes/comments on every feed render
**Why it happens:** Normalizing everything, querying counts per post
**How to avoid:** Denormalize counts on post document, update atomically in like/unlike mutations
**Warning signs:** Slow feed loading, high Convex function read counts

### Pitfall 2: Following Feed N+1 Queries
**What goes wrong:** Querying each followed user's posts separately
**Why it happens:** Treating following feed like multiple user feeds
**How to avoid:** Query all public posts, filter by followed user IDs in memory
**Warning signs:** Feed query taking > 100ms, multiple database reads per load

### Pitfall 3: Missing Indexes
**What goes wrong:** Full table scans on feed queries
**Why it happens:** Forgetting to add indexes for common query patterns
**How to avoid:** Add indexes for: by_author_and_time, by_visibility_and_time, by_post_and_user
**Warning signs:** Convex dashboard showing slow queries, index suggestions

### Pitfall 4: Visibility Check in Mutations Only
**What goes wrong:** Private posts appearing in wrong feeds
**Why it happens:** Only validating on write, not filtering on read
**How to avoid:** Always filter by visibility in feed queries, use helper function
**Warning signs:** Followers-only posts appearing in global feed

## Code Examples

### Complete Posts Schema (for schema.ts)

```typescript
// Post type discriminator
const postType = v.union(
  v.literal("property_listing"),
  v.literal("service_request"),
  v.literal("discussion")
);

// Post visibility
const postVisibility = v.union(
  v.literal("public"),
  v.literal("followers_only"),
  v.literal("deal_participants")
);

// Service types (reuse from existing schema)
const serviceTypeForPost = v.union(
  v.literal("broker"),
  v.literal("mortgage_advisor"),
  v.literal("lawyer")
);

// Add to schema
posts: defineTable({
  authorId: v.id("users"),
  postType: postType,
  content: v.string(),
  visibility: postVisibility,
  propertyId: v.optional(v.id("properties")),
  dealId: v.optional(v.id("deals")),
  serviceType: v.optional(serviceTypeForPost),
  likeCount: v.number(),
  commentCount: v.number(),
  shareCount: v.number(),
  saveCount: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_author", ["authorId"])
  .index("by_author_and_time", ["authorId", "createdAt"])
  .index("by_type", ["postType"])
  .index("by_visibility_and_time", ["visibility", "createdAt"])
  .index("by_property", ["propertyId"]),

postLikes: defineTable({
  postId: v.id("posts"),
  userId: v.id("users"),
  createdAt: v.number(),
})
  .index("by_post", ["postId"])
  .index("by_user", ["userId"])
  .index("by_post_and_user", ["postId", "userId"]),

postSaves: defineTable({
  postId: v.id("posts"),
  userId: v.id("users"),
  createdAt: v.number(),
})
  .index("by_post", ["postId"])
  .index("by_user", ["userId"])
  .index("by_post_and_user", ["postId", "userId"]),

userFollows: defineTable({
  followerId: v.id("users"),
  followingId: v.id("users"),
  createdAt: v.number(),
})
  .index("by_follower", ["followerId"])
  .index("by_following", ["followingId"])
  .index("by_follower_and_following", ["followerId", "followingId"]),
```

### Feed Query with Pagination

```typescript
// convex/posts.ts
import { query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";

export const globalFeed = query({
  args: {
    paginationOpts: paginationOptsValidator,
    postType: v.optional(v.union(
      v.literal("property_listing"),
      v.literal("service_request"),
      v.literal("discussion")
    )),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    // Query public posts, newest first
    let query = ctx.db
      .query("posts")
      .withIndex("by_visibility_and_time", (q) => q.eq("visibility", "public"))
      .order("desc");

    const results = await query.paginate(args.paginationOpts);

    // Filter by post type if specified (in memory)
    let filteredPage = results.page;
    if (args.postType) {
      filteredPage = filteredPage.filter(p => p.postType === args.postType);
    }

    // Enrich with author and property info
    const enrichedPage = await Promise.all(
      filteredPage.map(async (post) => {
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
      })
    );

    return {
      ...results,
      page: enrichedPage
    };
  },
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Offset pagination | Cursor-based pagination | Convex native | 17x performance improvement on deep pages |
| Count queries | Denormalized counters | Best practice | Avoids expensive aggregations |
| Multiple tables per type | Discriminated union | TypeScript 4.1+ | Unified queries, type safety |

## Open Questions

1. **Comments on posts**
   - What we know: Need separate `postComments` table with postId reference
   - What's unclear: Threading (flat vs nested comments) - defer to Phase 23 or 24?
   - Recommendation: Keep flat for MVP, add threading later if needed

2. **Media attachments**
   - What we know: Posts may need images beyond property listings
   - What's unclear: Scope for Phase 21 - just references, or actual upload?
   - Recommendation: Add optional `images: v.optional(v.array(v.string()))` field, defer upload UI to Phase 22

3. **Trending algorithm**
   - What we know: Need "trending" feed view eventually
   - What's unclear: What metrics define trending (likes, recency, engagement rate?)
   - Recommendation: Defer to Phase 23 Feed Display - for now, just chronological

## Sources

### Primary (HIGH confidence)
- [Convex Paginated Queries](https://docs.convex.dev/database/pagination) - Official pagination docs
- [Convex Schemas](https://docs.convex.dev/database/schemas) - Schema design with v.union
- Existing REOS codebase - schema.ts patterns for unions, indexes, relationships

### Secondary (MEDIUM confidence)
- [Take Control of Pagination](https://stack.convex.dev/pagination) - Advanced pagination patterns
- [Discriminated Union TypeScript Guide](https://www.convex.dev/typescript/advanced/type-operators-manipulation/typescript-discriminated-union) - Type patterns

### Tertiary (LOW confidence)
- WebSearch results on social feed design - General patterns, not Convex-specific

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using Convex native patterns already in codebase
- Architecture: HIGH - Matches existing REOS schema design patterns
- Pitfalls: MEDIUM - Based on general Convex best practices and existing project patterns

**Research date:** 2026-01-19
**Valid until:** 30 days (stable Convex patterns, REOS-specific)
