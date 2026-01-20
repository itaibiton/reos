"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { useTranslations } from "next-intl";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";

interface FollowButtonProps {
  userId: Id<"users">;
  isOwnPost?: boolean;
}

export function FollowButton({ userId, isOwnPost }: FollowButtonProps) {
  const t = useTranslations("feed");

  // Don't show follow button for own posts
  if (isOwnPost) return null;

  // Query server state for follow status
  const serverIsFollowing = useQuery(api.userFollows.isFollowing, { userId });

  // Mutations for follow/unfollow
  const follow = useMutation(api.userFollows.followUser);
  const unfollow = useMutation(api.userFollows.unfollowUser);

  // Local state for optimistic UI
  const [isFollowing, setIsFollowing] = useState(false);
  const [isPending, setIsPending] = useState(false);

  // Sync local state with server state
  useEffect(() => {
    if (serverIsFollowing !== undefined) {
      setIsFollowing(serverIsFollowing);
    }
  }, [serverIsFollowing]);

  // Handle follow/unfollow toggle
  const handleToggle = async () => {
    if (isPending) return;

    setIsPending(true);

    // Optimistic update
    const newIsFollowing = !isFollowing;
    setIsFollowing(newIsFollowing);

    try {
      if (newIsFollowing) {
        await follow({ userId });
      } else {
        await unfollow({ userId });
      }
    } catch (error) {
      // Revert on error
      setIsFollowing(!newIsFollowing);
      console.error("Failed to toggle follow:", error);
    } finally {
      setIsPending(false);
    }
  };

  // Don't render until we know the initial state
  if (serverIsFollowing === undefined) return null;

  return (
    <Button
      variant={isFollowing ? "secondary" : "default"}
      size="sm"
      onClick={handleToggle}
      disabled={isPending}
    >
      {isFollowing ? t("follow.following") : t("follow.follow")}
    </Button>
  );
}
