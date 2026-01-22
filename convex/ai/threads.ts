import { query, mutation, internalMutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Get the AI thread for the current user, or null if none exists.
 */
export const getThreadForUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;

    return await ctx.db
      .query("aiThreads")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();
  },
});

/**
 * Get or create an AI thread for the current user.
 * Returns the thread ID for use with the agent.
 */
export const getOrCreateThread = mutation({
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

    // Check for existing thread
    const existing = await ctx.db
      .query("aiThreads")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (existing) {
      // Update last activity
      await ctx.db.patch(existing._id, {
        lastActivityAt: Date.now(),
        updatedAt: Date.now(),
      });
      return {
        threadId: existing._id,
        agentThreadId: existing.agentThreadId,
        isNew: false,
      };
    }

    // Create new thread
    const now = Date.now();
    const threadId = await ctx.db.insert("aiThreads", {
      userId: user._id,
      lastActivityAt: now,
      createdAt: now,
      updatedAt: now,
    });

    return {
      threadId,
      agentThreadId: undefined,
      isNew: true,
    };
  },
});

/**
 * Update the thread with the agent's internal thread ID.
 * Called after first message creates the agent thread.
 */
export const linkAgentThread = internalMutation({
  args: {
    threadId: v.id("aiThreads"),
    agentThreadId: v.string(),
  },
  handler: async (ctx, { threadId, agentThreadId }) => {
    await ctx.db.patch(threadId, {
      agentThreadId,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Update thread's summary (called by summarization process).
 */
export const updateSummary = internalMutation({
  args: {
    threadId: v.id("aiThreads"),
    summary: v.string(),
    summarizedMessageCount: v.number(),
  },
  handler: async (ctx, { threadId, summary, summarizedMessageCount }) => {
    await ctx.db.patch(threadId, {
      summary,
      summarizedMessageCount,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Clear AI memory for current user (per CONTEXT.md: explicit "clear memory" option).
 */
export const clearMemory = mutation({
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

    // Find and delete the thread
    const thread = await ctx.db
      .query("aiThreads")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (thread) {
      await ctx.db.delete(thread._id);
    }

    return { cleared: true };
  },
});
