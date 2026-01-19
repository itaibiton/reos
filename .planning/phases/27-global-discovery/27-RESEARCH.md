# Phase 27: Global Discovery - Research

**Researched:** 2026-01-19
**Domain:** Full-text search, trending algorithms, recommendation systems
**Confidence:** HIGH

## Summary

Global Discovery requires three interconnected systems: unified search (posts, users, properties), trending content detection, and personalized recommendations. The good news is Convex has native full-text search support built on Tantivy, making search implementation straightforward.

The existing codebase already has patterns for search (AI-powered property search in `convex/search.ts`), paginated feeds (`posts.ts`), and user listings (`users.ts`). This phase extends these patterns to support global search across multiple tables with unified results and adds computed trending/recommendation data.

**Primary recommendation:** Use Convex native search indexes for full-text search (posts, users, properties), implement trending as a computed query using time-decay scoring (Hacker News formula), and build recommendations using simple rule-based logic based on user role and engagement history.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Convex search indexes | native | Full-text search | Built into Convex, uses Tantivy (Rust-based, high-performance) |
| lodash.debounce | ^4.0.8 | Search debouncing | Already in project, proven pattern |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| cmdk | existing | Command palette | Optional: for keyboard-driven search experience |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Convex search | Algolia/Typesense | External service = more complex, but more features. Not needed at MVP scale. |
| Time-decay formula | ML ranking | ML is overkill for MVP; simple formula works well for small-medium scale |
| Rule-based recommendations | Collaborative filtering | CF needs critical mass of users; rule-based works with sparse data |

**Installation:**
No new packages needed. Convex search is native, lodash.debounce already installed.

## Architecture Patterns

### Recommended Project Structure
```
convex/
├── search/
│   └── globalSearch.ts   # Unified search across tables
├── trending.ts           # Trending score calculations
├── recommendations.ts    # Personalized suggestions
├── searchHistory.ts      # User search history

src/
├── app/(app)/
│   └── search/
│       └── page.tsx      # Full search results page
├── components/
│   └── search/
│       ├── GlobalSearchBar.tsx      # Header search input
│       ├── SearchAutocomplete.tsx   # Dropdown with suggestions
│       ├── SearchResults.tsx        # Full results page content
│       ├── SearchResultCard.tsx     # Individual result rendering
│       └── index.ts
│   └── discovery/
│       ├── TrendingSection.tsx      # Trending posts/properties widget
│       ├── PeopleToFollow.tsx       # Suggested users widget
│       ├── RecommendedPosts.tsx     # Post suggestions
│       └── index.ts
```

### Pattern 1: Convex Full-Text Search Index
**What:** Define search indexes in schema for each searchable table
**When to use:** Any table with text fields that need keyword search

**Schema definition:**
```typescript
// convex/schema.ts additions
posts: defineTable({
  // ... existing fields
})
  .searchIndex("search_content", {
    searchField: "content",
    filterFields: ["postType", "visibility"],
  }),

users: defineTable({
  // ... existing fields
})
  .searchIndex("search_name", {
    searchField: "name",
    filterFields: ["role", "onboardingComplete"],
  }),

properties: defineTable({
  // ... existing fields
})
  .searchIndex("search_title", {
    searchField: "title",
    filterFields: ["status", "city"],
  })
  .searchIndex("search_address", {
    searchField: "address",
    filterFields: ["status", "city"],
  }),
```

**Query pattern:**
```typescript
// Source: https://docs.convex.dev/search/text-search
const results = await ctx.db
  .query("posts")
  .withSearchIndex("search_content", (q) =>
    q.search("content", searchQuery).eq("visibility", "public")
  )
  .take(10);
```

### Pattern 2: Unified Search Results
**What:** Single query endpoint that searches multiple tables and merges results
**When to use:** Autocomplete dropdown showing mixed results

```typescript
// convex/search/globalSearch.ts
export const search = query({
  args: { query: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 5;

    // Search in parallel
    const [posts, users, properties] = await Promise.all([
      ctx.db
        .query("posts")
        .withSearchIndex("search_content", (q) =>
          q.search("content", args.query).eq("visibility", "public")
        )
        .take(limit),
      ctx.db
        .query("users")
        .withSearchIndex("search_name", (q) =>
          q.search("name", args.query).eq("onboardingComplete", true)
        )
        .take(limit),
      ctx.db
        .query("properties")
        .withSearchIndex("search_title", (q) =>
          q.search("title", args.query).eq("status", "available")
        )
        .take(limit),
    ]);

    return {
      posts: posts.map(p => ({ ...p, resultType: "post" as const })),
      users: users.map(u => ({ _id: u._id, name: u.name, imageUrl: u.imageUrl, role: u.role, resultType: "user" as const })),
      properties: properties.map(p => ({ ...p, resultType: "property" as const })),
    };
  },
});
```

### Pattern 3: Time-Decay Trending Score (Hacker News Formula)
**What:** Calculate trending score using engagement and time decay
**When to use:** Sorting content by "what's hot now"

```typescript
// Source: https://medium.com/hacking-and-gonzo/how-hacker-news-ranking-algorithm-works-1d9b0cf2c08d
function calculateTrendingScore(
  engagementCount: number,  // likes + comments + saves
  createdAt: number,        // timestamp
  gravity: number = 1.8     // decay rate
): number {
  const hoursSinceCreation = (Date.now() - createdAt) / (1000 * 60 * 60);
  // HN formula: (P-1) / (T+2)^G
  return (engagementCount - 1) / Math.pow(hoursSinceCreation + 2, gravity);
}

// For "Today" section: filter to last 24 hours
// For "This Week" section: filter to last 7 days
```

### Pattern 4: Autocomplete with Debounce
**What:** Debounced search input with dropdown results
**When to use:** Header search bar with suggestions as user types

```typescript
// Source: https://www.freecodecamp.org/news/deboucing-in-react-autocomplete-example/
"use client";

import { useState, useCallback, useMemo } from "react";
import debounce from "lodash.debounce";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function GlobalSearchBar() {
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Debounced query trigger (300ms as per CONTEXT.md)
  const debouncedSearch = useMemo(
    () => debounce((value: string) => setSearchQuery(value), 300),
    []
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (value.length >= 1) {  // Min 1 char per CONTEXT.md
      debouncedSearch(value);
    } else {
      setSearchQuery("");
    }
  }, [debouncedSearch]);

  // Skip query if empty
  const results = useQuery(
    api.search.globalSearch.search,
    searchQuery ? { query: searchQuery } : "skip"
  );

  // ... render input + dropdown
}
```

### Pattern 5: Rule-Based Recommendations
**What:** Simple recommendation logic based on user profile and behavior
**When to use:** "People to follow", "Posts you might like" sections

```typescript
// People to follow: users with same role OR followed by people you follow
export const suggestedUsers = query({
  args: {},
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    // Get users current user follows
    const following = await ctx.db
      .query("userFollows")
      .withIndex("by_follower", (q) => q.eq("followerId", user._id))
      .collect();
    const followingIds = new Set(following.map(f => f.followingId.toString()));

    // Get users followed by people user follows (friends of friends)
    const friendsOfFriends = await Promise.all(
      following.slice(0, 10).map(f =>
        ctx.db
          .query("userFollows")
          .withIndex("by_follower", (q) => q.eq("followerId", f.followingId))
          .take(5)
      )
    );

    // Also get users with same role
    const sameRoleUsers = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", user.role))
      .take(20);

    // Score and dedupe
    const candidates = new Map();
    // ... scoring logic: +2 for friends of friends, +1 for same role
    // Filter out self and already following

    return Array.from(candidates.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  },
});
```

### Anti-Patterns to Avoid
- **Searching without indexes:** Never use `.filter()` after `.collect()` for text search - always use `.withSearchIndex()`
- **Real-time trending recalculation:** Don't compute trending scores on every page load - cache or compute periodically
- **Complex ML models for MVP:** Rule-based recommendations work fine for small user bases
- **Blocking search on mount:** Use "skip" pattern for conditional queries, don't block page render

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Text tokenization | Custom word splitting | Convex search index | Handles edge cases (punctuation, case, prefixes) |
| Relevance ranking | Custom scoring | Convex BM25 | Industry-standard algorithm, handles TF-IDF |
| Debounce logic | setTimeout patterns | lodash.debounce | Handles edge cases, memory cleanup |
| Search history deduplication | Manual dedup | Compound index + upsert | Database handles race conditions |

**Key insight:** Convex's native search is surprisingly capable - BM25 scoring, prefix matching for typeahead, filter fields for faceted search. No need for external search services at MVP scale.

## Common Pitfalls

### Pitfall 1: Search Index Field Limits
**What goes wrong:** Trying to search multiple fields with one index
**Why it happens:** Convex search indexes support exactly 1 search field
**How to avoid:** Create separate indexes for each searchable field, OR concatenate fields into a single searchable field
**Warning signs:** Error "Search indexes support exactly 1 search field"

### Pitfall 2: Query Result Limits
**What goes wrong:** `.collect()` throws exception on large result sets
**Why it happens:** Convex search queries can scan up to 1024 results
**How to avoid:** Always use `.take(n)` or `.paginate()` instead of `.collect()`
**Warning signs:** Runtime error about exceeding document limits

### Pitfall 3: Stale Debounced Callbacks
**What goes wrong:** Debounced function captures stale closure values
**Why it happens:** Creating new debounce function on each render
**How to avoid:** Use `useMemo` to memoize the debounced function
**Warning signs:** Search results lag behind input, weird state issues

### Pitfall 4: Over-Fetching in Autocomplete
**What goes wrong:** Searching all tables for every keystroke
**Why it happens:** Not limiting results or using "skip" pattern
**How to avoid:** Limit autocomplete to 5-10 results per category, use conditional queries
**Warning signs:** Slow autocomplete, excessive database reads

### Pitfall 5: Trending Score Overflow
**What goes wrong:** Posts with 0 engagement get very high scores
**Why it happens:** Not handling edge cases in score calculation
**How to avoid:** Use `Math.max(0, engagementCount - 1)` and check for division by zero
**Warning signs:** Empty posts appearing in trending

## Code Examples

Verified patterns from official sources and existing codebase:

### Search Index Definition
```typescript
// Source: https://docs.convex.dev/search/text-search
// Add to convex/schema.ts

posts: defineTable({
  authorId: v.id("users"),
  postType: postType,
  content: v.string(),
  visibility: postVisibility,
  // ... other fields
})
  // Existing indexes
  .index("by_author", ["authorId"])
  .index("by_visibility_and_time", ["visibility", "createdAt"])
  // NEW: Search index
  .searchIndex("search_content", {
    searchField: "content",
    filterFields: ["postType", "visibility"],
  }),
```

### Search Query with Pagination
```typescript
// Source: https://docs.convex.dev/search/text-search
export const searchPosts = query({
  args: {
    query: v.string(),
    postType: v.optional(postTypeValidator),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    let searchBuilder = ctx.db
      .query("posts")
      .withSearchIndex("search_content", (q) => {
        let search = q.search("content", args.query).eq("visibility", "public");
        if (args.postType) {
          search = search.eq("postType", args.postType);
        }
        return search;
      });

    return await searchBuilder.paginate(args.paginationOpts);
  },
});
```

### Search History Table
```typescript
// New table for search history (server-side per CONTEXT.md)
searchHistory: defineTable({
  userId: v.id("users"),
  query: v.string(),
  resultCount: v.number(),
  createdAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_user_and_time", ["userId", "createdAt"]),

// Mutation to save search
export const saveSearch = mutation({
  args: { query: v.string(), resultCount: v.number() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return;

    // Deduplicate: update timestamp if same query exists
    const existing = await ctx.db
      .query("searchHistory")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("query"), args.query))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        resultCount: args.resultCount,
        createdAt: Date.now()
      });
    } else {
      await ctx.db.insert("searchHistory", {
        userId: user._id,
        query: args.query,
        resultCount: args.resultCount,
        createdAt: Date.now(),
      });
    }
  },
});
```

### Trending Posts Query
```typescript
// convex/trending.ts
export const getTrendingPosts = query({
  args: {
    timeWindow: v.union(v.literal("today"), v.literal("week")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    const now = Date.now();
    const windowMs = args.timeWindow === "today"
      ? 24 * 60 * 60 * 1000
      : 7 * 24 * 60 * 60 * 1000;
    const cutoff = now - windowMs;

    // Get public posts within time window
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_visibility_and_time", (q) =>
        q.eq("visibility", "public").gte("createdAt", cutoff)
      )
      .order("desc")
      .take(100);  // Over-fetch for scoring

    // Calculate trending scores
    const scored = posts.map(post => {
      const engagement = post.likeCount + post.commentCount + post.saveCount;
      const hoursSinceCreation = (now - post.createdAt) / (1000 * 60 * 60);
      const score = Math.max(0, engagement - 1) / Math.pow(hoursSinceCreation + 2, 1.8);
      return { ...post, trendingScore: score };
    });

    // Sort by score and return top N
    return scored
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, limit);
  },
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| External search (Algolia) | Convex native search | 2024 | Simplified architecture, no external dependency |
| Complex ML recommendations | Rule-based + engagement signals | N/A | Appropriate for MVP scale |
| Fuzzy search in Convex | Prefix search only | Jan 2025 | Typo tolerance removed, use prefix matching |

**Deprecated/outdated:**
- Fuzzy search in Convex: Deprecated as of January 15, 2025. Use prefix matching instead.
- Client-side search filtering: With native Convex search, no need to `.collect()` and filter in memory for text search.

## Open Questions

Things that couldn't be fully resolved:

1. **Property search field priority**
   - What we know: Can search title, address, city, description
   - What's unclear: Should we create multiple indexes or concatenate into one searchable field?
   - Recommendation: Start with title search index, add more if needed

2. **Trending score caching**
   - What we know: Real-time computation works but may be slow at scale
   - What's unclear: At what scale does caching become necessary?
   - Recommendation: Start with real-time, monitor performance, add caching if needed

3. **Search result ranking across types**
   - What we know: Each table has its own BM25 ranking
   - What's unclear: How to merge and rank results from different tables?
   - Recommendation: Show results grouped by type (not mixed), let UI handle ordering

## Sources

### Primary (HIGH confidence)
- [Convex Full-Text Search Documentation](https://docs.convex.dev/search/text-search) - Schema definition, query patterns, limits
- Existing codebase patterns: `convex/posts.ts`, `convex/search.ts`, `convex/users.ts`

### Secondary (MEDIUM confidence)
- [Hacker News Ranking Algorithm](https://medium.com/hacking-and-gonzo/how-hacker-news-ranking-algorithm-works-1d9b0cf2c08d) - Time decay formula
- [FreeCodeCamp Debouncing in React](https://www.freecodecamp.org/news/deboucing-in-react-autocomplete-example/) - Debounce patterns
- [Facebook PYMK Transparency](https://transparency.meta.com/features/explaining-ranking/fb-people-you-may-know/) - Recommendation signals

### Tertiary (LOW confidence)
- Social media algorithm articles - General patterns, platform-specific details may not apply

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Convex native search is well-documented
- Architecture: HIGH - Patterns match existing codebase conventions
- Trending algorithm: MEDIUM - Formula is standard, tuning may need adjustment
- Recommendations: MEDIUM - Rule-based approach is appropriate but untested at scale

**Research date:** 2026-01-19
**Valid until:** 2026-02-19 (30 days - Convex search is stable)
