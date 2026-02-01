import { listUIMessages, syncStreams } from "@convex-dev/agent";
import { query } from "../_generated/server";
import { components } from "../_generated/api";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";

/**
 * Real-time streaming query for AI messages.
 *
 * This query wraps @convex-dev/agent's listUIMessages and syncStreams
 * to provide reactive subscriptions for the AI chat panel.
 *
 * Usage: Subscribe via useQuery hook for live updates as messages stream.
 */
export const listMessages = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    const messages = await listUIMessages(ctx, components.agent, {
      threadId: args.threadId,
      paginationOpts: args.paginationOpts,
    });

    const streams = await syncStreams(ctx, components.agent, {
      threadId: args.threadId,
    });

    return { ...messages, ...streams };
  },
});
