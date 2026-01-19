"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Notification01Icon,
  Message02Icon,
  Agreement01Icon,
  File02Icon,
  UserAdd01Icon,
  CheckmarkCircle01Icon,
  Cancel01Icon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

// Notification type from backend
type NotificationType =
  | "new_message"
  | "deal_stage_change"
  | "file_uploaded"
  | "request_received"
  | "request_accepted"
  | "request_declined";

// Format relative time (same pattern as ProviderDashboard)
function formatRelativeTime(timestamp: number) {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// Get icon for notification type
function getNotificationIcon(type: NotificationType): IconSvgElement {
  switch (type) {
    case "new_message":
      return Message02Icon;
    case "deal_stage_change":
      return Agreement01Icon;
    case "file_uploaded":
      return File02Icon;
    case "request_received":
      return UserAdd01Icon;
    case "request_accepted":
      return CheckmarkCircle01Icon;
    case "request_declined":
      return Cancel01Icon;
    default:
      return Notification01Icon;
  }
}

// Get icon color for notification type
function getNotificationIconColor(type: NotificationType): string {
  switch (type) {
    case "new_message":
      return "text-blue-500";
    case "deal_stage_change":
      return "text-purple-500";
    case "file_uploaded":
      return "text-green-500";
    case "request_received":
      return "text-yellow-500";
    case "request_accepted":
      return "text-green-500";
    case "request_declined":
      return "text-red-500";
    default:
      return "text-muted-foreground";
  }
}

// Notification item component
interface NotificationItemProps {
  notification: {
    _id: Id<"notifications">;
    type: NotificationType;
    title: string;
    message: string;
    read: boolean;
    link?: string;
    createdAt: number;
  };
  onMarkAsRead: (id: Id<"notifications">) => void;
  onNavigate: (link: string) => void;
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onNavigate,
}: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification._id);
    }
    if (notification.link) {
      onNavigate(notification.link);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full text-left p-3 hover:bg-muted/50 transition-colors border-b last:border-b-0 ${
        !notification.read ? "bg-muted/30" : ""
      }`}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div
          className={`p-2 rounded-lg bg-muted shrink-0 self-start ${getNotificationIconColor(notification.type)}`}
        >
          <HugeiconsIcon
            icon={getNotificationIcon(notification.type)}
            size={16}
            strokeWidth={1.5}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p
              className={`text-sm font-medium truncate ${
                !notification.read ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {notification.title}
            </p>
            {/* Unread indicator */}
            {!notification.read && (
              <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatRelativeTime(notification.createdAt)}
          </p>
        </div>
      </div>
    </button>
  );
}

export function NotificationCenter() {
  const router = useRouter();

  // Queries
  const notifications = useQuery(api.notifications.list, { limit: 20 });
  const unreadCount = useQuery(api.notifications.getUnreadCount);

  // Mutations
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  // Scroll indicator state
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Check if content is scrollable and not at bottom
  useEffect(() => {
    const scrollEl = scrollRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    );
    if (!scrollEl) return;

    const checkScroll = () => {
      const { scrollHeight, clientHeight, scrollTop } = scrollEl;
      const isScrollable = scrollHeight > clientHeight;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
      setShowScrollIndicator(isScrollable && !isAtBottom);
    };

    checkScroll();
    scrollEl.addEventListener("scroll", checkScroll);
    return () => scrollEl.removeEventListener("scroll", checkScroll);
  }, [notifications]);

  const handleMarkAsRead = async (notificationId: Id<"notifications">) => {
    try {
      await markAsRead({ notificationId });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const handleNavigate = (link: string) => {
    router.push(link);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8">
          <HugeiconsIcon
            icon={Notification01Icon}
            size={20}
            strokeWidth={1.5}
          />
          {/* Unread badge */}
          {unreadCount !== undefined && unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -end-1 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount !== undefined && unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto py-1 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={handleMarkAllAsRead}
            >
              Mark all read
            </Button>
          )}
        </div>

        {/* Notification list */}
        <div className="relative" ref={scrollRef}>
          <ScrollArea className="h-80">
            {notifications === undefined ? (
              // Loading state
              <div className="p-4 text-center text-sm text-muted-foreground">
                Loading...
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification._id}
                  notification={
                    notification as NotificationItemProps["notification"]
                  }
                  onMarkAsRead={handleMarkAsRead}
                  onNavigate={handleNavigate}
                />
              ))
            ) : (
              // Empty state
              <div className="py-8 px-4 text-center">
                <HugeiconsIcon
                  icon={Notification01Icon}
                  size={32}
                  strokeWidth={1.5}
                  className="mx-auto mb-2 text-muted-foreground opacity-50"
                />
                <p className="text-sm text-muted-foreground">
                  No notifications
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  You&apos;re all caught up!
                </p>
              </div>
            )}
          </ScrollArea>

          {/* Scroll indicator */}
          {showScrollIndicator && (
            <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-1 pt-4 bg-gradient-to-t from-background to-transparent pointer-events-none">
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                size={16}
                className="text-muted-foreground animate-bounce"
              />
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
