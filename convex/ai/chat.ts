import { action } from "../_generated/server";
import { internal, api } from "../_generated/api";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { platformAssistant } from "./agent";
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
 * 3. Build role-specific system prompt
 * 4. Stream response using agent with saveStreamDeltas
 * 5. Trigger summarization if message count exceeds threshold
 * 6. Update thread role
 *
 * Uses saveStreamDeltas for persistent real-time updates with word chunking.
 */
export const sendMessage = action({
  args: {
    message: v.string(),
    role: v.optional(v.string()),
    pageContext: v.optional(v.object({
      pageType: v.string(),
      entityType: v.optional(v.string()),
      entityId: v.optional(v.string()),
    })),
  },
  handler: async (ctx, { message, role, pageContext }): Promise<{
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

      // Load page context (if provided)
      let pageContextString: string | null = null;
      if (pageContext) {
        try {
          pageContextString = await ctx.runQuery(
            internal.ai.context.buildPageContext,
            {
              userId: user._id,
              pageType: pageContext.pageType,
              entityType: pageContext.entityType,
              entityId: pageContext.entityId,
            }
          );
        } catch {
          // Graceful degradation: assistant works without page context
          pageContextString = null;
        }
      }

      // Load thread for summary check
      const thread = await ctx.runQuery(api.ai.threads.getThreadForUser, {});
      const summary = thread?.summary;

      // Build role-specific system prompt
      const userRole = role ?? "investor";
      let rolePrompt = "";
      if (userRole === "investor") {
        rolePrompt = `## Your Role

You are assisting an investor looking to invest in Israeli real estate.
Focus on: property discovery, investment analysis, provider recommendations, and deal guidance.

`;
      } else {
        rolePrompt = `## Your Role

You are assisting a ${userRole} on the REOS platform.
Help them with their specific needs and tasks.

`;
      }

      // Build system context with role, profile, page context, and summary
      let systemContext = rolePrompt;
      if (profileContext) {
        systemContext += profileContext + "\n\n";
      }
      if (pageContextString) {
        systemContext += pageContextString + "\n\n";
      }
      if (summary) {
        systemContext += `## Previous Conversation Summary\n\n${summary}\n\n---\nNote: I'm focusing on our recent discussion. The above summarizes our earlier conversation.\n\n`;
      }
      // If continuing from previous summary (new session), prepend it
      if (threadResult.previousSummary && !summary) {
        systemContext = `## Previous Session Summary\n\n${threadResult.previousSummary}\n\n---\n\n` + systemContext;
      }

      // For a new thread, create it first using the agent
      let currentThreadId = agentThreadId;
      if (isNew || !currentThreadId) {
        const { threadId: newAgentThreadId } = await platformAssistant.createThread(ctx, {
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
      const { thread: agentThread } = await platformAssistant.continueThread(ctx, {
        threadId: currentThreadId,
        userId: identity.subject,
      });

      // Detect auto-greeting scenario: empty message + new/empty thread
      // Get message count from agent thread to check if it's empty
      const messagesCheck = await platformAssistant.listMessages(ctx, {
        threadId: currentThreadId,
        paginationOpts: { numItems: 1, cursor: null },
        excludeToolMessages: true,
        statuses: ["success"],
      });
      const existingMessageCount = messagesCheck.page.length;
      const isAutoGreeting = message.trim() === "" && (isNew || existingMessageCount === 0);

      // Append auto-greeting instructions if this is a first interaction
      if (isAutoGreeting) {
        systemContext += `\n\n## Auto-Greeting Instructions

You're meeting this investor for the first time after they completed their investment profile questionnaire.

Your sequence:
1. Send a warm, personalized greeting (2-3 sentences) referencing their budget range and target cities from their profile
2. Immediately call the searchProperties tool with criteria matching their profile (3 properties)
3. After showing properties, immediately call the searchProviders tool (2-3 providers per role: broker, mortgage_advisor, lawyer)
4. After showing providers, mention the quick reply buttons for follow-up questions

CRITICAL: Execute BOTH tool calls automatically in this response. Do NOT wait for user prompts.
Start with "Welcome! Based on your profile..." then show properties, then providers.`;
      }

      // Enhance auto-greeting with page awareness when context is available
      if (pageContextString && isAutoGreeting) {
        systemContext += `\nIMPORTANT: Your greeting should reference the page context above. If the user is viewing a specific property or deal, mention it in your greeting instead of jumping straight to generic recommendations.\n`;
      }

      // Detect if user is asking for properties or providers
      const lowerMessage = message.toLowerCase();
      const wantsProperties = lowerMessage.includes("propert") ||
                              lowerMessage.includes("show me") ||
                              lowerMessage.includes("find me") ||
                              lowerMessage.includes("recommend");
      const wantsProviders = lowerMessage.includes("provider") ||
                             lowerMessage.includes("team") ||
                             lowerMessage.includes("broker") ||
                             lowerMessage.includes("lawyer") ||
                             lowerMessage.includes("mortgage");

      // Force tool usage for auto-greeting or explicit property/provider requests
      const shouldForceToolUse = isAutoGreeting || wantsProperties || wantsProviders;

      // Stream text with the user's message
      const result = await agentThread.streamText(
        {
          prompt: message || "Begin our conversation",
          system: systemContext || undefined,
          abortSignal: abortController.signal,
          // Force tool usage when appropriate to prevent hallucination
          toolChoice: shouldForceToolUse ? "required" : "auto",
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
        const messagesResult = await platformAssistant.listMessages(ctx, {
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

      // Update thread role
      void ctx.runMutation(internal.ai.threads.updateThreadRole, {
        threadId,
        role: role ?? "investor",
      });

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
