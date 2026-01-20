"use client";

import { useFormatter, useTranslations } from "next-intl";
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

// Helper to check if timestamp is today
function isToday(date: Date, now: Date): boolean {
  return date.toDateString() === now.toDateString();
}

// Helper to check if timestamp is yesterday
function isYesterday(date: Date, now: Date): boolean {
  const yesterday = new Date(now.getTime() - 86400000);
  return date.toDateString() === yesterday.toDateString();
}

export function ChatMessage({
  content,
  senderName,
  senderImage,
  timestamp,
  isOwn,
  status,
}: ChatMessageProps) {
  const format = useFormatter();
  const t = useTranslations("chat");
  const now = new Date();
  const date = new Date(timestamp);

  // Format time based on when the message was sent
  const formatMessageTime = () => {
    if (isToday(date, now)) {
      return format.dateTime(date, { hour: 'numeric', minute: '2-digit' });
    } else if (isYesterday(date, now)) {
      return `${t('time.yesterday')} ${format.dateTime(date, { hour: 'numeric', minute: '2-digit' })}`;
    } else {
      return format.dateTime(date, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
    }
  };

  return (
    <div
      className={cn(
        "flex gap-2 max-w-[70%]",
        isOwn ? "ms-auto flex-row-reverse" : "me-auto"
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
              ? "bg-primary text-primary-foreground rounded-2xl rounded-ee-sm"
              : "bg-muted rounded-2xl rounded-es-sm"
          )}
        >
          <p className="whitespace-pre-wrap break-words">{content}</p>
        </div>

        {/* Timestamp and status */}
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs text-muted-foreground">
            {formatMessageTime()}
          </span>
          {isOwn && status && (
            <span className="text-xs text-muted-foreground">
              {status === "read" && ` - ${t("message.statusRead")}`}
              {status === "delivered" && ` - ${t("message.statusDelivered")}`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
