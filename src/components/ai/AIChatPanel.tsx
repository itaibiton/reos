"use client";

import { useState, ReactNode } from "react";
import { useAIChat } from "./hooks/useAIChat";
import { useAutoGreeting } from "./hooks/useAutoGreeting";
import { ChatMessageList } from "./ChatMessageList";
import { AIChatInput } from "./AIChatInput";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

interface AIChatPanelProps {
  className?: string;
  renderQuickReplies?: (sendMessage: (text: string) => void) => ReactNode;
  autoGreet?: boolean;
}

export function AIChatPanel({ className, renderQuickReplies, autoGreet }: AIChatPanelProps) {
  const {
    messages,
    isStreaming,
    isLoading,
    error,
    sendMessage,
    stopGeneration,
    clearMemory,
  } = useAIChat();

  // Auto-greeting trigger (uses same useAIChat instance - no race condition)
  useAutoGreeting(autoGreet ? {
    sendMessage,
    messages,
    isLoading,
  } : {
    sendMessage: async () => {},  // no-op when disabled
    messages: [],
    isLoading: false,
  });

  const [isClearing, setIsClearing] = useState(false);

  const handleClearMemory = async () => {
    setIsClearing(true);
    try {
      await clearMemory();
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header with clear button */}
      <div className="flex items-center justify-between px-4 py-2 border-b flex-shrink-0">
        <h2 className="font-semibold text-sm">AI Assistant</h2>

        {/* Clear memory with confirmation */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={messages.length === 0 || isClearing}
              className="text-muted-foreground hover:text-destructive"
            >
              <HugeiconsIcon icon={Delete02Icon} size={16} className="me-1" />
              Clear
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear conversation?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all messages and reset the AI&apos;s memory.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleClearMemory}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Clear conversation
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Error display */}
      {error && (
        <div className="px-4 py-2 bg-destructive/10 text-destructive text-sm flex-shrink-0">
          {error}
        </div>
      )}

      {/* Message list */}
      <ChatMessageList
        messages={messages}
        isStreaming={isStreaming}
        isLoading={isLoading}
      />

      {/* Quick reply slot (above input) */}
      {renderQuickReplies && renderQuickReplies(sendMessage)}

      {/* Input */}
      <AIChatInput
        onSend={sendMessage}
        onStop={stopGeneration}
        isStreaming={isStreaming}
        disabled={false}
      />
    </div>
  );
}
