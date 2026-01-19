"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, UserMultipleIcon, Settings01Icon } from "@hugeicons/core-free-icons";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { StackedAvatars } from "./StackedAvatars";
import { GroupSettingsDialog } from "./GroupSettingsDialog";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { toast } from "sonner";

interface DirectChatThreadProps {
  conversationId: Id<"conversations">;
  onBack?: () => void;
  onConversationLeft?: () => void;
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

export function DirectChatThread({
  conversationId,
  onBack,
  onConversationLeft,
}: DirectChatThreadProps) {
  const { user } = useCurrentUser();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Fetch conversation details
  const conversation = useQuery(api.conversations.get, { conversationId });

  // Fetch messages
  const messages = useQuery(api.directMessages.list, { conversationId });

  // Mutations
  const sendMessage = useMutation(api.directMessages.send);
  const markAsRead = useMutation(api.directMessages.markAsRead);

  // Mark messages as read when thread opens or new messages arrive
  useEffect(() => {
    if (messages && messages.length > 0) {
      markAsRead({ conversationId }).catch(() => {
        // Silently fail - not critical
      });
    }
  }, [messages?.length, conversationId, markAsRead]);

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
        conversationId,
        content,
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    }
  };

  const isLoading = messages === undefined || conversation === undefined;

  // Get other participants for header display
  const otherParticipants = conversation?.participants?.filter(
    (p) => p?._id !== user?._id
  );
  const isGroup = conversation?.type === "group";

  // Display name for header
  const displayName = isGroup
    ? conversation?.name || `Group (${conversation?.participants?.length || 0})`
    : otherParticipants?.[0]?.name || "Unknown";

  // First other participant for direct chat avatar
  const firstParticipant = otherParticipants?.[0];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
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
        {isGroup ? (
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex items-center gap-3 flex-1 min-w-0 hover:bg-muted/50 -ms-2 ps-2 pe-2 py-1 rounded-md transition-colors"
          >
            <StackedAvatars
              participants={(conversation?.participants || []).filter((p): p is NonNullable<typeof p> => p !== null)}
              max={3}
              size="sm"
            />
            <div className="flex-1 min-w-0 text-start">
              <p className="font-medium truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground">
                {conversation?.participants?.length} participants - Tap for settings
              </p>
            </div>
          </button>
        ) : (
          <>
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={firstParticipant?.imageUrl}
                alt={firstParticipant?.name || ""}
              />
              <AvatarFallback>{getInitials(firstParticipant?.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{displayName}</p>
              {firstParticipant?.role && (
                <Badge variant="secondary" className="text-xs">
                  {formatRole(firstParticipant.role)}
                </Badge>
              )}
            </div>
          </>
        )}
        {isGroup && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSettingsOpen(true)}
          >
            <HugeiconsIcon icon={Settings01Icon} size={18} />
          </Button>
        )}
      </div>

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
      <ChatInput onSend={handleSend} placeholder={`Message ${displayName}...`} />

      {/* Group Settings Dialog */}
      {isGroup && conversation && (
        <GroupSettingsDialog
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          conversationId={conversationId}
          name={conversation.name}
          participants={(conversation.participants || []).filter((p): p is NonNullable<typeof p> => p !== null)}
          createdBy={conversation.createdBy}
          onLeft={() => {
            onConversationLeft?.();
          }}
          onDeleted={() => {
            onConversationLeft?.();
          }}
        />
      )}
    </div>
  );
}
