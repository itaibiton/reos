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
 * Raw message from agent API with flexible content types
 */
interface RawAgentMessage {
  _id: string;
  _creationTime: number;
  message?: {
    role: string;
    content: unknown;
  };
}

/**
 * List messages for the current user's AI thread.
 * Returns messages in chronological order (oldest first) for chat display.
 *
 * Note: This is an action (not a query) because investorAssistant.listMessages
 * requires action context. Frontend should refetch after sendMessage completes.
 *
 * Tool results can come from:
 * 1. Assistant message content array (type: "tool-result" parts alongside "tool-call")
 * 2. Separate "tool" role messages (when excludeToolMessages: false)
 *
 * We include tool messages to capture results from either source.
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
    // Include tool messages to capture tool results
    const messagesResult = await investorAssistant.listMessages(ctx, {
      threadId: thread.agentThreadId,
      paginationOpts: { numItems: 100, cursor: null },
      excludeToolMessages: false, // Include tool messages to get tool results
      statuses: ["success"],
    });

    const rawMessages = messagesResult.page as RawAgentMessage[];

    // Build a global map of tool results from ALL messages
    // Tool results can be in assistant message content OR separate "tool" role messages
    const globalToolResultMap = new Map<string, any>();

    for (const msg of rawMessages) {
      if (!msg.message) continue;

      const content = msg.message.content;
      if (!Array.isArray(content)) continue;

      // Extract tool-result parts from any message
      for (const part of content) {
        if (
          part &&
          typeof part === "object" &&
          part.type === "tool-result" &&
          typeof part.toolCallId === "string"
        ) {
          // Prefer result field, fallback to output.value
          const resultValue = part.result ?? (part.output?.value);
          if (resultValue !== undefined) {
            globalToolResultMap.set(part.toolCallId, resultValue);
          }
        }
      }
    }

    // Transform to simplified format for frontend (user and assistant only)
    return rawMessages
      .filter(msg => msg.message && (msg.message.role === "user" || msg.message.role === "assistant"))
      .map(msg => {
        // Extract tool calls from assistant messages and pair with global results
        const toolCalls = extractToolCalls(msg.message!.content, globalToolResultMap);
        return {
          _id: msg._id,
          role: msg.message!.role as "user" | "assistant",
          content: extractTextFromContent(msg.message!.content),
          toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
          _creationTime: msg._creationTime,
        };
      })
      .filter(msg => msg.content.length > 0 || (msg.toolCalls && msg.toolCalls.length > 0))
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
 * Tool calls are in assistant message content as { type: "tool-call", ... }
 * Tool results can come from:
 * 1. Same message content (type: "tool-result" parts)
 * 2. Separate "tool" role messages (passed via globalResultMap)
 *
 * @param content - Message content (string or array)
 * @param globalResultMap - Results from all messages (for cross-message pairing)
 */
function extractToolCalls(content: unknown, globalResultMap: Map<string, any>): ToolCall[] {
  if (!Array.isArray(content)) {
    return [];
  }

  // Extract tool-call parts from this message
  const toolCallParts = content.filter(
    (part): part is { type: "tool-call"; toolCallId: string; toolName: string; args: any } =>
      part &&
      typeof part === "object" &&
      part.type === "tool-call" &&
      typeof part.toolCallId === "string" &&
      typeof part.toolName === "string"
  );

  // Also check for tool-result parts in this same message (fallback)
  // In case results are embedded in assistant message alongside calls
  const localResultMap = new Map<string, any>();
  for (const part of content) {
    if (
      part &&
      typeof part === "object" &&
      part.type === "tool-result" &&
      typeof part.toolCallId === "string"
    ) {
      const resultValue = part.result ?? (part.output?.value);
      if (resultValue !== undefined) {
        localResultMap.set(part.toolCallId, resultValue);
      }
    }
  }

  // Pair tool calls with their results
  // Check global map first (from "tool" messages), then local (same message)
  return toolCallParts.map((call) => ({
    toolCallId: call.toolCallId,
    toolName: call.toolName,
    args: call.args,
    result: globalResultMap.get(call.toolCallId) ?? localResultMap.get(call.toolCallId),
  }));
}
