"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { RefreshIcon, Home01Icon } from "@hugeicons/core-free-icons";
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

// Format price as compact USD ($1.5M, $500K)
function formatCompactPrice(price: number): string {
  if (price >= 1_000_000) {
    return `$${(price / 1_000_000).toFixed(1)}M`;
  }
  if (price >= 1_000) {
    return `$${(price / 1_000).toFixed(0)}K`;
  }
  return `$${price}`;
}

// Get initials from name
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Extended enriched post type for reposts
type EnrichedRepost = EnrichedPost & {
  originalPost?: EnrichedPost | null;
};

interface RepostCardProps {
  post: EnrichedRepost;
}

export function RepostCard({ post }: RepostCardProps) {
  // Query current user to check if this is own post
  const currentUser = useQuery(api.users.getCurrentUser);
  const isOwnPost = currentUser?._id === post.authorId;

  const roleLabel = post.authorRole
    ? ROLE_LABELS[post.authorRole] || post.authorRole
    : undefined;

  const originalPost = post.originalPost;

  return (
    <Card className="overflow-hidden p-0">
      <CardContent className="p-4 space-y-3">
        {/* Repost Header */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <HugeiconsIcon icon={RefreshIcon} size={14} strokeWidth={1.5} />
          <Link
            href={`/profile/${post.authorId}`}
            className="hover:underline font-medium"
          >
            {post.authorName}
          </Link>
          <span>reposted</span>
          <span className="text-xs">
            {formatDistanceToNow(post.createdAt, { addSuffix: true })}
          </span>
        </div>

        {/* Reposter's comment if provided */}
        {post.repostComment && (
          <p className="text-sm">{post.repostComment}</p>
        )}

        {/* Embedded Original Post Preview */}
        {originalPost ? (
          <Link
            href={`/feed?post=${originalPost._id}`}
            className="block"
          >
            <div className="border rounded-lg p-3 bg-muted/30 hover:bg-muted/50 transition-colors space-y-3">
              {/* Original post property image if applicable */}
              {originalPost.postType === "property_listing" && originalPost.property && (
                <div className="h-32 bg-muted relative rounded-md overflow-hidden">
                  {originalPost.property.featuredImage ? (
                    <img
                      src={originalPost.property.featuredImage}
                      alt={originalPost.property.title}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <HugeiconsIcon icon={Home01Icon} size={32} strokeWidth={1.5} />
                    </div>
                  )}
                  {/* Property info overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <h4 className="font-medium text-white text-sm truncate">
                      {originalPost.property.title}
                    </h4>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/80">{originalPost.property.city}</span>
                      <span className="text-white font-bold">
                        {formatCompactPrice(originalPost.property.priceUsd)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Original Author Header */}
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={originalPost.authorImageUrl} alt={originalPost.authorName} />
                  <AvatarFallback className="text-xs">
                    {getInitials(originalPost.authorName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-medium text-sm truncate">
                    {originalPost.authorName}
                  </span>
                  {originalPost.authorRole && (
                    <Badge variant="outline" className="text-xs px-1.5 py-0">
                      {ROLE_LABELS[originalPost.authorRole] || originalPost.authorRole}
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground ms-auto">
                  {formatDistanceToNow(originalPost.createdAt, { addSuffix: true })}
                </span>
              </div>

              {/* Original Post Type Indicator */}
              {originalPost.postType === "service_request" && (
                <Badge variant="secondary" className="text-xs">
                  Service Request
                </Badge>
              )}

              {/* Original Post Content (truncated) */}
              <p className="text-sm text-muted-foreground line-clamp-3">
                {originalPost.content}
              </p>
            </div>
          </Link>
        ) : (
          <div className="border rounded-lg p-3 bg-muted/30 text-center text-muted-foreground text-sm">
            Original post is no longer available
          </div>
        )}

        {/* Reposter info bar with follow button */}
        <div className="flex items-center gap-3 pt-2">
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
          </div>
          <FollowButton userId={post.authorId} isOwnPost={isOwnPost} />
        </div>

        {/* Engagement Footer */}
        <EngagementFooter
          postId={post._id}
          likeCount={post.likeCount}
          commentCount={post.commentCount}
          saveCount={post.saveCount}
          shareCount={post.shareCount}
          isRepost={true}
        />
      </CardContent>
    </Card>
  );
}
