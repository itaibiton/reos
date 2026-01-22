import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";
import Anthropic from "@anthropic-ai/sdk";

/**
 * Summarization thresholds (from RESEARCH.md)
 */
const SUMMARIZE_THRESHOLD = 15; // Start summarizing at 15 messages
const KEEP_RECENT = 10; // Always keep last 10 messages verbatim

/**
 * Summarize older messages to maintain context in long conversations.
 *
 * Per CONTEXT.md decisions:
 * - Profile data + explicit decisions are NEVER summarized
 * - Proactive transparency: Let user know when compressing ("I'm focusing on our recent discussion")
 * - Memory gaps: Check memory first before admitting missing info
 *
 * Called after each AI response when message count exceeds threshold.
 */
export const summarizeOldMessages = internalAction({
  args: {
    threadId: v.id("aiThreads"),
    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
      })
    ),
  },
  handler: async (ctx, { threadId, messages }) => {
    // Don't summarize if under threshold
    if (messages.length <= SUMMARIZE_THRESHOLD) {
      return { summarized: false };
    }

    // Split messages: older to summarize, recent to keep
    const olderMessages = messages.slice(0, -KEEP_RECENT);
    const recentMessages = messages.slice(-KEEP_RECENT);

    // Skip if nothing to summarize
    if (olderMessages.length === 0) {
      return { summarized: false };
    }

    try {
      // Build conversation text for summarization
      const conversationText = olderMessages
        .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
        .join("\n\n");

      // Call Claude to generate summary
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      const response = await anthropic.messages.create({
        model: "claude-3-haiku-20240307", // Use Haiku for cost-effective summarization
        max_tokens: 500,
        system: `You are summarizing a conversation between an investor and a real estate assistant.

Create a concise summary that captures:
1. Key topics discussed
2. Any specific property/location interests mentioned
3. Important decisions or preferences stated
4. Questions asked and answers given

Important:
- Focus on ACTIONABLE information the assistant needs to remember
- Exclude pleasantries and filler
- Keep it under 300 words
- Use bullet points for clarity`,
        messages: [
          {
            role: "user",
            content: `Summarize this conversation:\n\n${conversationText}`,
          },
        ],
      });

      // Extract summary text
      const textBlock = response.content.find((block) => block.type === "text");
      if (!textBlock || textBlock.type !== "text") {
        console.error("No text response from summarization");
        return { summarized: false };
      }

      const summary = textBlock.text;

      // Store summary in thread
      await ctx.runMutation(internal.ai.threads.updateSummary, {
        threadId,
        summary,
        summarizedMessageCount: olderMessages.length,
      });

      return {
        summarized: true,
        olderCount: olderMessages.length,
        recentCount: recentMessages.length,
      };
    } catch (error) {
      console.error("Error summarizing messages:", error);
      return { summarized: false, error: String(error) };
    }
  },
});

/**
 * Build context messages array with summary + recent messages.
 * Used by the agent when preparing context for AI calls.
 */
export function buildContextMessages(
  summary: string | undefined,
  recentMessages: Array<{ role: "user" | "assistant"; content: string }>
): Array<{ role: "user" | "assistant" | "system"; content: string }> {
  const messages: Array<{ role: "user" | "assistant" | "system"; content: string }> = [];

  // Add summary as system context if exists
  if (summary) {
    messages.push({
      role: "system",
      content: `## Previous Conversation Summary\n\n${summary}\n\n---\nNote: I'm focusing on our recent discussion. The above summarizes our earlier conversation.`,
    });
  }

  // Add recent messages
  messages.push(...recentMessages);

  return messages;
}

/**
 * Check if summarization is needed based on message count.
 */
export function shouldSummarize(messageCount: number): boolean {
  return messageCount > SUMMARIZE_THRESHOLD;
}

/**
 * Export thresholds for use in other modules.
 */
export const THRESHOLDS = {
  SUMMARIZE_THRESHOLD,
  KEEP_RECENT,
};
