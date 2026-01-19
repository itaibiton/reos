"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { Home01Icon } from "@hugeicons/core-free-icons";
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

interface PropertyPostCardProps {
  post: EnrichedPost;
}

export function PropertyPostCard({ post }: PropertyPostCardProps) {
  // Query current user to check if this is own post
  const currentUser = useQuery(api.users.getCurrentUser);
  const isOwnPost = currentUser?._id === post.authorId;

  const roleLabel = post.authorRole
    ? ROLE_LABELS[post.authorRole] || post.authorRole
    : undefined;

  return (
    <Card className="overflow-hidden p-0">
      {/* Property Image */}
      <div className="h-48 bg-muted relative">
        {post.property?.featuredImage ? (
          <img
            src={post.property.featuredImage}
            alt={post.property.title}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <HugeiconsIcon icon={Home01Icon} size={48} strokeWidth={1.5} />
          </div>
        )}
        {/* Property info overlay at bottom */}
        {post.property && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <h3 className="font-semibold text-white truncate">
              {post.property.title}
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-white/80 text-sm">{post.property.city}</span>
              <span className="text-white font-bold">
                {formatCompactPrice(post.property.priceUsd)}
              </span>
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
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

        {/* Post Content (caption) */}
        {post.content && (
          <p className="text-sm text-muted-foreground">{post.content}</p>
        )}

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
