"use client";

import { useQuery } from "convex/react";
import { useTranslations } from "next-intl";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { Comment01Icon } from "@hugeicons/core-free-icons";
import { formatDistanceToNow } from "date-fns";
import { Link } from "@/i18n/navigation";
import type { EnrichedPost } from "./PostCard";
import { EngagementFooter } from "./EngagementFooter";
import { FollowButton } from "./FollowButton";

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
  const t = useTranslations("feed");
  const tCommon = useTranslations("common");

  // Query current user to check if this is own post
  const currentUser = useQuery(api.users.getCurrentUser);
  const isOwnPost = currentUser?._id === post.authorId;

  // Map role values to translation keys
  const roleKeyMap: Record<string, string> = {
    investor: "investor",
    broker: "broker",
    mortgage_advisor: "mortgageAdvisor",
    lawyer: "lawyer",
  };

  const roleLabel = post.authorRole
    ? tCommon(`roles.${roleKeyMap[post.authorRole] || post.authorRole}`)
    : undefined;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        {/* Discussion indicator (muted icon) */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <HugeiconsIcon icon={Comment01Icon} size={14} strokeWidth={1.5} />
          <span className="text-xs">{t("card.discussion")}</span>
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
          post={post}
        />
      </CardContent>
    </Card>
  );
}
