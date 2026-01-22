import { action } from "../_generated/server";
import { internal, api } from "../_generated/api";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { investorAssistant } from "./agent";
import { shouldSummarize } from "./summarization";

/**
 * Active generation tracking for stop capability.
 * In-memory Map of threadId -> AbortController
 */
const activeGenerations = new Map<string, AbortController>();

/**
 * Streaming chat action - main entry point for AI conversations.
 *
 * Flow:
 * 1. Get or create thread for user
 * 2. Load profile context from questionnaire
 * 3. Stream response using agent with saveStreamDeltas
 * 4. Trigger summarization if message count exceeds threshold
 *
 * Uses saveStreamDeltas for persistent real-time updates with word chunking.
 */
export const sendMessage = action({
  args: {
    message: v.string(),
  },
  handler: async (ctx, { message }): Promise<{
    success: boolean;
    threadId: Id<"aiThreads">;
    response: string;
  }> => {
    // Get the authenticated user's identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the user record
    const user = await ctx.runQuery(api.users.getByClerkId, {
      clerkId: identity.subject,
    });
    if (!user) {
      throw new Error("User not found");
    }

    // Get or create thread
    const threadResult = await ctx.runMutation(api.ai.threads.getOrCreateThread, {});
    const { threadId, agentThreadId, isNew } = threadResult;

    // Create abort controller for stop capability
    const abortController = new AbortController();
    activeGenerations.set(threadId as string, abortController);

    try {
      // Load profile context
      const profileContext = await ctx.runQuery(
        internal.ai.context.buildProfileContext,
        { userId: user._id }
      );

      // Load thread for summary check
      const thread = await ctx.runQuery(api.ai.threads.getThreadForUser, {});
      const summary = thread?.summary;

      // Build system context with profile and summary
      let systemContext = "";
      if (profileContext) {
        systemContext += profileContext + "\n\n";
      }
      if (summary) {
        systemContext += `## Previous Conversation Summary\n\n${summary}\n\n---\nNote: I'm focusing on our recent discussion. The above summarizes our earlier conversation.\n\n`;
      }

      // For a new thread, create it first using the agent
      let currentThreadId = agentThreadId;
      if (isNew || !currentThreadId) {
        const { threadId: newAgentThreadId } = await investorAssistant.createThread(ctx, {
          userId: identity.subject,
        });
        currentThreadId = newAgentThreadId;

        // Link agent thread to our wrapper thread
        await ctx.runMutation(internal.ai.threads.linkAgentThread, {
          threadId,
          agentThreadId: newAgentThreadId,
        });
      }

      // Continue the thread and stream the response
      const { thread: agentThread } = await investorAssistant.continueThread(ctx, {
        threadId: currentThreadId,
        userId: identity.subject,
      });

      // Stream text with the user's message
      const result = await agentThread.streamText(
        {
          prompt: message,
          system: systemContext || undefined,
          abortSignal: abortController.signal,
        },
        {
          saveStreamDeltas: true,
          contextOptions: {
            recentMessages: 10, // Match KEEP_RECENT threshold
          },
        }
      );

      // Wait for the stream to complete and get the final text
      const finalText = await result.text;

      // Check if summarization is needed
      // Calculate approximate message count from thread metadata
      const summarizedCount = thread?.summarizedMessageCount ?? 0;
      const estimatedRecent = 10; // Assume 10 recent messages max
      const messageCount = summarizedCount + estimatedRecent;

      if (shouldSummarize(messageCount)) {
        // Get messages for summarization from agent thread
        const messagesResult = await investorAssistant.listMessages(ctx, {
          threadId: currentThreadId,
          paginationOpts: { numItems: 50, cursor: null },
          excludeToolMessages: true,
          statuses: ["success"],
        });

        // Convert to summarization format
        const messages = messagesResult.page
          .filter(msg => msg.message && (msg.message.role === "user" || msg.message.role === "assistant"))
          .map(msg => ({
            role: msg.message!.role as "user" | "assistant",
            content: typeof msg.message!.content === "string"
              ? msg.message!.content
              : extractTextFromContent(msg.message!.content),
          }))
          .filter(msg => msg.content.length > 0);

        if (messages.length > 0) {
          // Trigger summarization in background (non-blocking)
          void ctx.runAction(internal.ai.summarization.summarizeOldMessages, {
            threadId,
            messages,
          }).catch((error: unknown) => {
            console.error("Summarization failed:", error);
          });
        }
      }

      return {
        success: true,
        threadId,
        response: finalText,
      };
    } finally {
      // Clean up abort controller
      activeGenerations.delete(threadId as string);
    }
  },
});

/**
 * Stop an active generation.
 * Called when user clicks stop button during streaming.
 */
export const stopGeneration = action({
  args: {
    threadId: v.id("aiThreads"),
  },
  handler: async (ctx, { threadId }): Promise<{ stopped: boolean; reason?: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const controller = activeGenerations.get(threadId as string);
    if (controller) {
      controller.abort();
      activeGenerations.delete(threadId as string);
      return { stopped: true };
    }

    return { stopped: false, reason: "No active generation found" };
  },
});

/**
 * Check if there's an active generation for a thread.
 */
export const getStreamingStatus = action({
  args: {
    threadId: v.id("aiThreads"),
  },
  handler: async (ctx, { threadId }): Promise<{ isStreaming: boolean }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const isStreaming = activeGenerations.has(threadId as string);
    return { isStreaming };
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
