"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  content: string;
  senderName: string;
  senderImage?: string;
  timestamp: number;
  isOwn: boolean;
  status?: "sent" | "delivered" | "read";
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

// Format timestamp
function formatMessageTime(timestamp: number) {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday =
    new Date(now.getTime() - 86400000).toDateString() === date.toDateString();

  if (isToday) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  } else if (isYesterday) {
    return `Yesterday ${date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })}`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }
}

export function ChatMessage({
  content,
  senderName,
  senderImage,
  timestamp,
  isOwn,
  status,
}: ChatMessageProps) {
  return (
    <div
      className={cn(
        "flex gap-2 max-w-[70%]",
        isOwn ? "ml-auto flex-row-reverse" : "mr-auto"
      )}
    >
      {/* Avatar for other's messages only */}
      {!isOwn && (
        <Avatar className="h-6 w-6 flex-shrink-0">
          <AvatarImage src={senderImage} alt={senderName} />
          <AvatarFallback className="text-xs">
            {getInitials(senderName)}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn("flex flex-col", isOwn ? "items-end" : "items-start")}>
        {/* Message bubble */}
        <div
          className={cn(
            "px-3 py-2 text-sm",
            isOwn
              ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm"
              : "bg-muted rounded-2xl rounded-bl-sm"
          )}
        >
          <p className="whitespace-pre-wrap break-words">{content}</p>
        </div>

        {/* Timestamp and status */}
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs text-muted-foreground">
            {formatMessageTime(timestamp)}
          </span>
          {isOwn && status && (
            <span className="text-xs text-muted-foreground">
              {status === "read" && " - Read"}
              {status === "delivered" && " - Delivered"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
