"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { Comment01Icon } from "@hugeicons/core-free-icons";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import type { EnrichedPost } from "./PostCard";
import { EngagementFooter } from "./EngagementFooter";
import { FollowButton } from "./FollowButton";

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
  // Query current user to check if this is own post
  const currentUser = useQuery(api.users.getCurrentUser);
  const isOwnPost = currentUser?._id === post.authorId;

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
          <Link href={`/profile/${post.authorId}`}>
            <Avatar className="h-8 w-8 hover:opacity-80 transition-opacity">
              <AvatarImage src={post.authorImageUrl} alt={post.authorName} />
              <AvatarFallback className="text-xs">
                {getInitials(post.authorName)}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link
                href={`/profile/${post.authorId}`}
                className="font-medium text-sm truncate hover:underline"
              >
                {post.authorName}
              </Link>
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
          <FollowButton userId={post.authorId} isOwnPost={isOwnPost} />
        </div>

        {/* Post Content */}
        <p className="text-sm">{post.content}</p>

        {/* Engagement Footer */}
        <EngagementFooter
          postId={post._id}
          likeCount={post.likeCount}
          commentCount={post.commentCount}
          saveCount={post.saveCount}
          shareCount={post.shareCount}
        />
      </CardContent>
    </Card>
  );
}
