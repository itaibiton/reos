"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

interface UseAutoGreetingOptions {
  sendMessage: (text: string, options?: { allowEmpty?: boolean }) => Promise<void>;
  messages: Array<{ _id: string }>;
  isLoading: boolean;
}

/**
 * Hook to trigger AI auto-greeting on first visit after questionnaire completion.
 *
 * Fires when:
 * 1. Questionnaire status is "complete"
 * 2. No messages exist in the thread (first visit)
 * 3. Messages have finished loading
 *
 * Prevents re-triggering via ref tracking.
 */
export function useAutoGreeting({
  sendMessage,
  messages,
  isLoading,
}: UseAutoGreetingOptions) {
  const questionnaire = useQuery(api.investorQuestionnaires.getByUser);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    // Guard: Don't trigger if already triggered this session
    if (hasTriggeredRef.current) return;

    // Guard: Wait for data to load
    if (isLoading) return;
    if (questionnaire === undefined) return;

    // Guard: Only trigger for complete questionnaire
    if (questionnaire?.status !== "complete") return;

    // Guard: Only trigger if thread is empty (first visit)
    if (messages.length > 0) return;

    // Trigger auto-greeting
    hasTriggeredRef.current = true;
    sendMessage("", { allowEmpty: true });
  }, [questionnaire?.status, messages.length, isLoading, sendMessage]);
}
