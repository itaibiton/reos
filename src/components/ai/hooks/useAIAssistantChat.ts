"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUIMessages, type UIMessage } from "@convex-dev/agent/react";
import { type PageContext } from "./usePageContext";

// Re-export UIMessage type for components
export type { UIMessage };

/**
 * Hook for the global AI Assistant panel with real-time streaming.
 *
 * Uses @convex-dev/agent's useUIMessages for token-by-token updates.
 * Replaces the old useAIChat hook which was polling-based.
 *
 * Flow:
 * 1. Get current thread from getThreadForUser
 * 2. Subscribe to streaming messages via useUIMessages
 * 3. Send messages via sendMessage action
 * 4. Track local streaming state during send
 */
export function useAIAssistantChat(pageContext?: PageContext) {
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Ref keeps pageContext fresh without destabilizing the sendMessage callback
  const pageContextRef = useRef(pageContext);
  useEffect(() => {
    pageContextRef.current = pageContext;
  }, [pageContext]);

  // Get current thread
  const thread = useQuery(api.ai.threads.getThreadForUser);
  const agentThreadId = thread?.agentThreadId;

  // Subscribe to real-time streaming messages
  const {
    results: messages,
    loadMore,
    status,
    isLoading: messagesLoading,
  } = useUIMessages(
    api.ai.streaming.listMessages as any,
    agentThreadId ? { threadId: agentThreadId } : "skip",
    {
      initialNumItems: 50,
      stream: true as any,
    }
  );

  // Actions and mutations
  const sendMessageAction = useAction(api.ai.chat.sendMessage);
  const stopGenerationAction = useAction(api.ai.chat.stopGeneration);
  const clearMemoryMutation = useMutation(api.ai.threads.clearMemory);

  // Send message handler
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      setError(null);
      setIsSending(true);

      try {
        const ctx = pageContextRef.current;
        await sendMessageAction({
          message: text,
          ...(ctx && {
            pageContext: {
              pageType: ctx.pageType,
              ...(ctx.entityType && { entityType: ctx.entityType }),
              ...(ctx.entityId && { entityId: ctx.entityId }),
            },
          }),
        });
      } catch (err) {
        // Ignore abort errors (user stopped generation)
        if (err instanceof Error && !err.message.includes("abort")) {
          setError(err.message);
        }
      } finally {
        setIsSending(false);
      }
    },
    [sendMessageAction]
  );

  // Stop generation handler
  const stopGeneration = useCallback(async () => {
    if (!thread?._id) return;

    try {
      await stopGenerationAction({ threadId: thread._id });
    } catch (err) {
      console.error("Failed to stop generation:", err);
    } finally {
      setIsSending(false);
    }
  }, [stopGenerationAction, thread?._id]);

  // Clear memory handler
  const clearMemory = useCallback(async () => {
    setError(null);
    try {
      await clearMemoryMutation();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  }, [clearMemoryMutation]);

  return {
    messages: (messages ?? []) as UIMessage[],
    isStreaming: isSending,
    isLoading: messagesLoading,
    error,
    sendMessage,
    stopGeneration,
    clearMemory,
    loadMore,
    status,
  };
}
