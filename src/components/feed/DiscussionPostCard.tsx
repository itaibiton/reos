"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  FavouriteIcon,
  Comment01Icon,
  BookmarkAdd01Icon,
} from "@hugeicons/core-free-icons";
import { formatDistanceToNow } from "date-fns";
import type { EnrichedPost } from "./PostCard";

// Role label mapping
const ROLE_LABELS: Record<string, string> = {
  investor: "Investor",
  broker: "Broker",
  mortgage_advisor: "Mortgage Advisor",
  lawyer: "Lawyer",
};

// Get initials from name
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface DiscussionPostCardProps {
  post: EnrichedPost;
}

export function DiscussionPostCard({ post }: DiscussionPostCardProps) {
  const roleLabel = post.authorRole
    ? ROLE_LABELS[post.authorRole] || post.authorRole
    : undefined;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        {/* Discussion indicator (muted icon) */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <HugeiconsIcon icon={Comment01Icon} size={14} strokeWidth={1.5} />
          <span className="text-xs">Discussion</span>
        </div>

        {/* Author Header */}
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={post.authorImageUrl} alt={post.authorName} />
            <AvatarFallback className="text-xs">
              {getInitials(post.authorName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm truncate">
                {post.authorName}
              </span>
              {roleLabel && (
                <Badge variant="secondary" className="text-xs">
                  {roleLabel}
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(post.createdAt, { addSuffix: true })}
            </span>
          </div>
        </div>

        {/* Post Content */}
        <p className="text-sm">{post.content}</p>

        {/* Engagement Footer */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground pt-3 border-t">
          <div className="flex items-center gap-1">
            <HugeiconsIcon icon={FavouriteIcon} size={16} strokeWidth={1.5} />
            <span>{post.likeCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <HugeiconsIcon icon={Comment01Icon} size={16} strokeWidth={1.5} />
            <span>{post.commentCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <HugeiconsIcon icon={BookmarkAdd01Icon} size={16} strokeWidth={1.5} />
            <span>{post.saveCount}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
