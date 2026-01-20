"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { useFormatter, useNow } from "next-intl";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, Add01Icon, UserMultipleIcon, UserIcon } from "@hugeicons/core-free-icons";
import { StackedAvatars } from "./StackedAvatars";

interface ConversationSelectorProps {
  selectedConversationId: Id<"conversations"> | null;
  onSelect: (conversationId: Id<"conversations">) => void;
  onNewChat: () => void;
  onNewGroup: () => void;
}

// Format role for display
function formatRole(role?: string | null) {
  if (!role) return null;
  const labels: Record<string, string> = {
    investor: "Investor",
    broker: "Broker",
    mortgage_advisor: "Mortgage",
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

export function ConversationSelector({
  selectedConversationId,
  onSelect,
  onNewChat,
  onNewGroup,
}: ConversationSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const format = useFormatter();
  const now = useNow({ updateInterval: 1000 * 60 }); // Update every minute

  // Fetch conversations
  const conversations = useQuery(api.conversations.list, {});

  // Filter by search query
  const filteredConversations = useMemo(() => {
    if (!conversations) return [];
    if (!searchQuery.trim()) return conversations;

    const query = searchQuery.toLowerCase();
    return conversations.filter((conv) => {
      // Search in participant names
      const participantMatch = conv.participants?.some(
        (p) =>
          p?.name?.toLowerCase().includes(query) ||
          p?.email?.toLowerCase().includes(query)
      );
      // Search in group name
      const nameMatch = conv.name?.toLowerCase().includes(query);
      return participantMatch || nameMatch;
    });
  }, [conversations, searchQuery]);

  if (conversations === undefined) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-3 space-y-2">
          <div className="h-9 bg-muted rounded-md animate-pulse" />
          <div className="h-9 bg-muted rounded-md animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search input */}
      <div className="p-3 space-y-2 flex-shrink-0">
        <div className="relative">
          <HugeiconsIcon
            icon={Search01Icon}
            size={16}
            className="absolute start-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-8 h-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 justify-start gap-2"
            onClick={onNewChat}
          >
            <HugeiconsIcon icon={UserIcon} size={16} />
            New Chat
          </Button>
          <Button
            variant="outline"
            className="flex-1 justify-start gap-2"
            onClick={onNewGroup}
          >
            <HugeiconsIcon icon={UserMultipleIcon} size={16} />
            New Group
          </Button>
        </div>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto px-3 space-y-1.5">
        {filteredConversations.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {conversations.length === 0
              ? "No conversations yet"
              : "No conversations match your search"}
          </p>
        ) : (
          filteredConversations.map((conv) => {
            const isSelected = selectedConversationId === conv._id;
            const isGroup = conv.type === "group";
            const firstParticipant = conv.participants?.[0];
            const displayName = isGroup
              ? conv.name || `Group (${conv.participants?.length || 0})`
              : firstParticipant?.name || "Unknown";

            return (
              <button
                key={conv._id}
                onClick={() => onSelect(conv._id)}
                className={cn(
                  "w-full flex items-start gap-2.5 p-2 rounded-lg text-start transition-colors",
                  isSelected
                    ? "bg-primary/10 ring-1 ring-primary/20"
                    : "hover:bg-muted/50"
                )}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {isGroup ? (
                    <div className="relative">
                      <StackedAvatars
                        participants={(conv.participants || []).filter((p): p is NonNullable<typeof p> => p !== null)}
                        max={3}
                        size="sm"
                      />
                      {/* Group indicator badge */}
                      <div className="absolute -bottom-0.5 -end-0.5 h-4 w-4 rounded-full bg-muted ring-2 ring-background flex items-center justify-center">
                        <HugeiconsIcon
                          icon={UserMultipleIcon}
                          size={10}
                          className="text-muted-foreground"
                        />
                      </div>
                    </div>
                  ) : (
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={firstParticipant?.imageUrl}
                        alt={firstParticipant?.name || ""}
                      />
                      <AvatarFallback>
                        {getInitials(firstParticipant?.name)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  {/* Unread badge */}
                  {conv.unreadCount > 0 && (
                    <span className="absolute -top-1 -end-1 h-5 min-w-5 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-medium flex items-center justify-center">
                      {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                    </span>
                  )}
                </div>

                {/* Conversation info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <p className="font-medium text-sm truncate">{displayName}</p>
                      {isGroup && conv.participants && (
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          ({conv.participants.length + 1})
                        </span>
                      )}
                    </div>
                    {conv.lastMessageTime && (
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {format.relativeTime(new Date(conv.lastMessageTime), now)}
                      </span>
                    )}
                  </div>
                  {conv.lastMessagePreview ? (
                    <p className="text-xs text-muted-foreground truncate">
                      {conv.lastMessageSenderName && (
                        <span className="font-medium">
                          {conv.lastMessageSenderName}:{" "}
                        </span>
                      )}
                      {conv.lastMessagePreview}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      No messages yet
                    </p>
                  )}
                  {!isGroup && firstParticipant?.role && (
                    <Badge variant="secondary" className="mt-1 text-[10px] px-1.5 py-0">
                      {formatRole(firstParticipant.role)}
                    </Badge>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
