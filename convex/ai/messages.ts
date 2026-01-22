import { action } from "../_generated/server";
import { api } from "../_generated/api";
import { investorAssistant } from "./agent";

/**
 * Tool call data extracted from assistant message content
 */
interface ToolCall {
  toolCallId: string;
  toolName: string;
  args: any;
  result?: any;
}

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
    toolCalls?: ToolCall[];
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
      .map(msg => {
        const toolCalls = extractToolCalls(msg.message!.content);
        return {
          _id: msg._id,
          role: msg.message!.role as "user" | "assistant",
          content: extractTextFromContent(msg.message!.content),
          toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
          _creationTime: msg._creationTime,
        };
      })
      .filter(msg => msg.content.length > 0)
      .reverse(); // Reverse to chronological order (oldest first) for chat display
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

/**
 * Helper: Extract tool calls from message content and pair with results
 *
 * Assistant messages with tools have content arrays containing:
 * - { type: "tool-call", toolCallId, toolName, args } - tool invocations
 * - { type: "tool-result", toolCallId, result } - tool results
 */
function extractToolCalls(content: unknown): ToolCall[] {
  if (!Array.isArray(content)) {
    return [];
  }

  // Extract tool-call parts
  const toolCallParts = content.filter(
    (part): part is { type: "tool-call"; toolCallId: string; toolName: string; args: any } =>
      part &&
      typeof part === "object" &&
      part.type === "tool-call" &&
      typeof part.toolCallId === "string" &&
      typeof part.toolName === "string"
  );

  // Extract tool-result parts
  const toolResultParts = content.filter(
    (part): part is { type: "tool-result"; toolCallId: string; result: any } =>
      part &&
      typeof part === "object" &&
      part.type === "tool-result" &&
      typeof part.toolCallId === "string"
  );

  // Build a map of results by toolCallId
  const resultMap = new Map(
    toolResultParts.map((r) => [r.toolCallId, r.result])
  );

  // Pair tool calls with their results
  return toolCallParts.map((call) => ({
    toolCallId: call.toolCallId,
    toolName: call.toolName,
    args: call.args,
    result: resultMap.get(call.toolCallId),
  }));
}
