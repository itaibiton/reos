import { query, mutation, internalMutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Session timeout: 24 hours in milliseconds.
 * After this period of inactivity, a new session (and thread) will be created.
 */
const SESSION_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get the AI thread for the current user, or null if none exists.
 * Returns the most recent thread by lastActivityAt.
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

    // Get all threads for user and return most recent
    const threads = await ctx.db
      .query("aiThreads")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    if (threads.length === 0) return null;

    // Sort by lastActivityAt descending and return most recent
    return threads.sort((a, b) => b.lastActivityAt - a.lastActivityAt)[0];
  },
});

/**
 * Get or create an AI thread for the current user.
 * Implements 24-hour session management:
 * - If most recent thread is <24h old: reuse it
 * - If most recent thread is >24h old: create new thread, preserve summary
 * - If no threads exist: create new thread
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

    // Get all threads for user
    const threads = await ctx.db
      .query("aiThreads")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const now = Date.now();

    // Sort by lastActivityAt descending to find most recent
    const mostRecent = threads.length > 0
      ? threads.sort((a, b) => b.lastActivityAt - a.lastActivityAt)[0]
      : null;

    // If most recent thread exists and is within session timeout, reuse it
    if (mostRecent && (now - mostRecent.lastActivityAt) < SESSION_TIMEOUT_MS) {
      await ctx.db.patch(mostRecent._id, {
        lastActivityAt: now,
        updatedAt: now,
      });
      return {
        threadId: mostRecent._id,
        agentThreadId: mostRecent.agentThreadId,
        isNew: false,
      };
    }

    // Thread is stale (>24h) or doesn't exist - create new thread
    // Preserve summary from previous session if it exists
    const previousSummary = mostRecent?.summary;
    const sessionId = crypto.randomUUID();

    const threadId = await ctx.db.insert("aiThreads", {
      userId: user._id,
      sessionId,
      summary: previousSummary,
      lastActivityAt: now,
      createdAt: now,
      updatedAt: now,
    });

    return {
      threadId,
      agentThreadId: undefined,
      isNew: true,
      previousSummary,
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
 * Deletes ALL threads for the user across all sessions.
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

    // Find and delete ALL threads for this user
    const threads = await ctx.db
      .query("aiThreads")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const thread of threads) {
      await ctx.db.delete(thread._id);
    }

    return { cleared: true };
  },
});

/**
 * Update the role used in this thread.
 * Called by chat.ts to track which role context was used.
 */
export const updateThreadRole = internalMutation({
  args: {
    threadId: v.id("aiThreads"),
    role: v.string(),
  },
  handler: async (ctx, { threadId, role }) => {
    await ctx.db.patch(threadId, {
      lastRole: role,
      updatedAt: Date.now(),
    });
  },
});
