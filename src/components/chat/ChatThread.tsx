"use client";

import { useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { toast } from "sonner";

interface ChatThreadProps {
  dealId: Id<"deals">;
  participantId: Id<"users">;
  participantName: string;
  participantImage?: string;
  participantRole?: string;
  onBack?: () => void;
  hideHeader?: boolean;
}

// Format role for display
function formatRole(role?: string) {
  if (!role) return null;
  const labels: Record<string, string> = {
    investor: "Investor",
    broker: "Broker",
    mortgage_advisor: "Mortgage Advisor",
    lawyer: "Lawyer",
    admin: "Admin",
  };
  return labels[role] || role;
}

// Get initials from name
function getInitials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ChatThread({
  dealId,
  participantId,
  participantName,
  participantImage,
  participantRole,
  onBack,
  hideHeader = false,
}: ChatThreadProps) {
  const { user } = useCurrentUser();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch messages for this conversation
  const messages = useQuery(api.messages.listConversation, {
    dealId,
    participantId,
  });

  // Mutations
  const sendMessage = useMutation(api.messages.send);
  const markAsRead = useMutation(api.messages.markAsRead);

  // Mark messages as read when thread opens or new messages arrive
  useEffect(() => {
    if (messages && messages.length > 0) {
      markAsRead({ dealId, senderId: participantId }).catch(() => {
        // Silently fail - not critical
      });
    }
  }, [messages?.length, dealId, participantId, markAsRead]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages?.length]);

  // Handle send message
  const handleSend = async (content: string) => {
    try {
      await sendMessage({
        dealId,
        recipientId: participantId,
        content,
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    }
  };

  const isLoading = messages === undefined;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      {!hideHeader && (
        <div className="flex items-center gap-3 px-4 h-14 border-b flex-shrink-0">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="lg:hidden"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={20} />
            </Button>
          )}
          <Avatar className="h-8 w-8">
            <AvatarImage src={participantImage} alt={participantName} />
            <AvatarFallback>{getInitials(participantName)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{participantName}</p>
            {participantRole && (
              <Badge variant="secondary" className="text-xs">
                {formatRole(participantRole)}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Messages area */}
      <ScrollArea className="flex-1 min-h-0" ref={scrollRef}>
        <div className="p-4 space-y-4">
          {isLoading ? (
            // Loading skeleton
            <>
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex gap-2 ${i % 2 === 0 ? "" : "justify-end"}`}
                >
                  {i % 2 === 0 && <Skeleton className="h-6 w-6 rounded-full" />}
                  <Skeleton
                    className={`h-12 ${i % 2 === 0 ? "w-48" : "w-40"} rounded-lg`}
                  />
                </div>
              ))}
            </>
          ) : messages.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">No messages yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Send a message to start the conversation
              </p>
            </div>
          ) : (
            // Messages list
            messages.map((message) => (
              <ChatMessage
                key={message._id}
                content={message.content}
                senderName={message.senderName}
                senderImage={message.senderImageUrl}
                timestamp={message.createdAt}
                isOwn={message.senderId === user?._id}
                status={message.status}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Input area */}
      <ChatInput onSend={handleSend} placeholder={`Message ${participantName}...`} />
    </div>
  );
}
