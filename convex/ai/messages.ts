import { action } from "../_generated/server";
import { api } from "../_generated/api";
import { investorAssistant } from "./agent";

/**
 * List messages for the current user's AI thread.
 * Returns messages in descending order (newest first).
 *
 * Note: This is an action (not a query) because investorAssistant.listMessages
 * requires action context. Frontend should refetch after sendMessage completes.
 */
export const listMessages = action({
  args: {},
  handler: async (ctx): Promise<Array<{
    _id: string;
    role: "user" | "assistant";
    content: string;
    _creationTime: number;
  }>> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // Get user's thread
    const thread = await ctx.runQuery(api.ai.threads.getThreadForUser, {});
    if (!thread || !thread.agentThreadId) {
      return [];
    }

    // List messages using agent API (requires action context)
    // Messages are returned in descending order (newest first) by default
    const messagesResult = await investorAssistant.listMessages(ctx, {
      threadId: thread.agentThreadId,
      paginationOpts: { numItems: 50, cursor: null },
      excludeToolMessages: true,
      statuses: ["success"],
    });

    // Transform to simplified format for frontend
    return messagesResult.page
      .filter(msg => msg.message && (msg.message.role === "user" || msg.message.role === "assistant"))
      .map(msg => ({
        _id: msg._id,
        role: msg.message!.role as "user" | "assistant",
        content: extractTextFromContent(msg.message!.content),
        _creationTime: msg._creationTime,
      }))
      .filter(msg => msg.content.length > 0);
  },
});

/**
 * Helper: Extract text from message content (handles both string and array content)
 */
function extractTextFromContent(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }
  if (Array.isArray(content)) {
    return content
      .filter((part): part is { type: "text"; text: string } =>
        part && typeof part === "object" && part.type === "text" && typeof part.text === "string"
      )
      .map(part => part.text)
      .join(" ");
  }
  return "";
}
