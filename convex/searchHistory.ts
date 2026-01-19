import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ============================================================================
// SEARCH HISTORY MUTATIONS AND QUERIES
// ============================================================================

// Maximum number of search history entries per user
const MAX_HISTORY_ENTRIES = 20;

// Save a search query (upsert pattern - update timestamp if exists)
export const saveSearch = mutation({
  args: {
    query: v.string(),
    resultCount: v.number(),
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

    const trimmedQuery = args.query.trim();
    if (!trimmedQuery) {
      throw new Error("Search query cannot be empty");
    }

    // Normalize query for deduplication (lowercase)
    const normalizedQuery = trimmedQuery.toLowerCase();

    // Check if same query already exists for user
    const existingSearches = await ctx.db
      .query("searchHistory")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const existing = existingSearches.find(
      (s) => s.query.toLowerCase() === normalizedQuery
    );

    const now = Date.now();

    if (existing) {
      // Update existing entry with new timestamp and result count
      await ctx.db.patch(existing._id, {
        query: trimmedQuery, // Keep original casing from latest search
        resultCount: args.resultCount,
        createdAt: now,
      });
      return existing._id;
    }

    // Insert new record
    const newId = await ctx.db.insert("searchHistory", {
      userId: user._id,
      query: trimmedQuery,
      resultCount: args.resultCount,
      createdAt: now,
    });

    // Check if we need to prune old entries
    const allSearches = await ctx.db
      .query("searchHistory")
      .withIndex("by_user_and_time", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    if (allSearches.length > MAX_HISTORY_ENTRIES) {
      // Delete oldest entries beyond limit
      const toDelete = allSearches.slice(MAX_HISTORY_ENTRIES);
      for (const search of toDelete) {
        await ctx.db.delete(search._id);
      }
    }

    return newId;
  },
});

// Get recent searches for current user
export const getRecentSearches = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    const limit = args.limit ?? 5;

    // Get recent searches, newest first
    const searches = await ctx.db
      .query("searchHistory")
      .withIndex("by_user_and_time", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(limit);

    return searches.map((s) => ({
      _id: s._id,
      query: s.query,
      resultCount: s.resultCount,
      createdAt: s.createdAt,
    }));
  },
});

// Delete a specific search from history
export const deleteSearch = mutation({
  args: {
    searchId: v.id("searchHistory"),
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

    // Get the search record
    const search = await ctx.db.get(args.searchId);
    if (!search) {
      throw new Error("Search not found");
    }

    // Verify ownership
    if (search.userId !== user._id) {
      throw new Error("Not authorized to delete this search");
    }

    await ctx.db.delete(args.searchId);
    return { success: true };
  },
});

// Clear all search history for current user
export const clearSearchHistory = mutation({
  args: {},
  handler: async (ctx) => {
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

    // Get all search history for user
    const searches = await ctx.db
      .query("searchHistory")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Delete all entries
    for (const search of searches) {
      await ctx.db.delete(search._id);
    }

    return { success: true, deletedCount: searches.length };
  },
});
