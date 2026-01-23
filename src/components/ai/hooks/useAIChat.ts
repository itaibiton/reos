"use client";

import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState, useCallback, useEffect } from "react";

interface ToolCall {
  toolCallId: string;
  toolName: string;
  args: any;
  result?: any;
}

interface Message {
  _id: string;
  role: "user" | "assistant";
  content: string;
  toolCalls?: ToolCall[];
  _creationTime: number;
}

/**
 * Hook for managing AI chat state and actions.
 * Provides: messages, sendMessage, isStreaming, stopGeneration, clearMemory
 *
 * Note: Messages are fetched via action (not query) because the agent component
 * stores messages in internal tables. We refetch after sending messages since
 * actions don't support real-time subscriptions.
 */
export function useAIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get user's thread (for stopGeneration)
  const thread = useQuery(api.ai.threads.getThreadForUser);

  // Actions
  const listMessagesAction = useAction(api.ai.messages.listMessages);
  const sendMessageAction = useAction(api.ai.chat.sendMessage);
  const stopGenerationAction = useAction(api.ai.chat.stopGeneration);
  const clearMemoryMutation = useMutation(api.ai.threads.clearMemory);

  // Fetch messages function
  const fetchMessages = useCallback(async () => {
    try {
      const result = await listMessagesAction();
      setMessages(result);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setIsLoading(false);
    }
  }, [listMessagesAction]);

  // Initial load and refetch when thread changes
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages, thread?.agentThreadId]);

  const sendMessage = useCallback(async (text: string, options?: { allowEmpty?: boolean }) => {
    // Guard: skip empty messages unless explicitly allowed (for auto-greeting)
    if (!text.trim() && !options?.allowEmpty) return;
    setError(null);
    setIsStreaming(true);

    // Optimistically add user message to UI (skip for empty auto-greeting messages)
    const optimisticUserMessage: Message = {
      _id: `temp-${Date.now()}`,
      role: "user",
      content: text,
      _creationTime: Date.now(),
    };
    if (text.trim()) {
      setMessages(prev => [...prev, optimisticUserMessage]);
    }

    try {
      await sendMessageAction({ message: text });
      // Refetch messages to get the real user message and AI response
      await fetchMessages();
    } catch (err) {
      // Handle abort vs real error
      if (err instanceof Error && err.message.includes("abort")) {
        // User stopped generation - still refetch to get partial response
        await fetchMessages();
      } else {
        setError(err instanceof Error ? err.message : "Failed to send message");
        // Remove optimistic message on error (only if one was added)
        if (text.trim()) {
          setMessages(prev => prev.filter(m => m._id !== optimisticUserMessage._id));
        }
      }
    } finally {
      setIsStreaming(false);
    }
  }, [sendMessageAction, fetchMessages]);

  const stopGeneration = useCallback(async () => {
    if (!thread?._id) return;
    try {
      await stopGenerationAction({ threadId: thread._id });
    } catch (err) {
      console.error("Failed to stop generation:", err);
    }
  }, [thread?._id, stopGenerationAction]);

  const clearMemory = useCallback(async () => {
    try {
      await clearMemoryMutation({});
      setMessages([]); // Clear local state immediately
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clear memory");
    }
  }, [clearMemoryMutation]);

  return {
    messages,
    isStreaming,
    isLoading,
    error,
    threadId: thread?._id,
    sendMessage,
    stopGeneration,
    clearMemory,
    refetchMessages: fetchMessages,
  };
}
