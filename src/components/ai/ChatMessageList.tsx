"use client";

import { useUser } from "@clerk/nextjs";
import { ChatMessage } from "./ChatMessage";
import { TypingIndicator } from "./TypingIndicator";
import { useSmartScroll } from "./hooks/useSmartScroll";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";

interface Message {
  _id: string;
  role: "user" | "assistant";
  content: string;
  _creationTime: number;
}

interface ChatMessageListProps {
  messages: Message[];
  isStreaming: boolean;
  isLoading?: boolean;
}

export function ChatMessageList({ messages, isStreaming, isLoading = false }: ChatMessageListProps) {
  const { user } = useUser();
  const { scrollRef, bottomRef, isNearBottom, scrollToBottom } = useSmartScroll(messages);

  // Get the last message to check if it's still streaming
  const lastMessage = messages[messages.length - 1];
  const isLastMessageStreaming = isStreaming && lastMessage?.role === "assistant";

  return (
    <div className="relative flex-1 overflow-hidden">
      <ScrollArea className="h-full" ref={scrollRef}>
        <div
          className="flex flex-col gap-4 p-4"
          role="log"
          aria-live="polite"
          aria-relevant="additions"
        >
          {/* Loading state */}
          {isLoading && messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <p className="text-sm">Loading conversation...</p>
            </div>
          )}

          {/* Welcome message if no messages and not loading */}
          {!isLoading && messages.length === 0 && !isStreaming && (
            <div className="text-center text-muted-foreground py-8">
              <p className="text-lg font-medium">Welcome to your AI Assistant</p>
              <p className="text-sm mt-1">
                Ask me anything about real estate investing in Israel.
              </p>
            </div>
          )}

          {/* Message list - shows immediately when available */}
          {messages.map((message, index) => (
            <ChatMessage
              key={message._id}
              role={message.role}
              content={message.content}
              timestamp={message._creationTime}
              isStreaming={isLastMessageStreaming && index === messages.length - 1}
              userImage={user?.imageUrl}
              userName={user?.fullName ?? user?.firstName ?? undefined}
            />
          ))}

          {/* Typing indicator when waiting for AI response */}
          {isStreaming && (!lastMessage || lastMessage.role === "user") && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs flex-shrink-0">
                AI
              </div>
              <div className="bg-muted rounded-2xl rounded-es-sm">
                <TypingIndicator />
              </div>
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={bottomRef} className="h-px" />
        </div>
      </ScrollArea>

      {/* Scroll to bottom button (shown when not near bottom) */}
      {!isNearBottom && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute bottom-4 right-4 rounded-full shadow-lg"
          onClick={scrollToBottom}
          aria-label="Scroll to bottom"
        >
          <HugeiconsIcon icon={ArrowDown01Icon} size={18} />
        </Button>
      )}
    </div>
  );
}
