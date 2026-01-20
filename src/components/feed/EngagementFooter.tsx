"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { useTranslations } from "next-intl";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  FavouriteIcon,
  Comment01Icon,
  BookmarkAdd01Icon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";
import { ShareButton } from "./ShareButton";
import { CommentSection } from "./CommentSection";
import { RepostDialog } from "./RepostDialog";
import type { EnrichedPost } from "./PostCard";

interface EngagementFooterProps {
  postId: Id<"posts">;
  likeCount: number;
  commentCount: number;
  saveCount: number;
  shareCount: number;
  // For repost dialog - pass the full post if available
  post?: EnrichedPost;
  // Whether this is a repost (reposts shouldn't have repost button)
  isRepost?: boolean;
}

export function EngagementFooter({
  postId,
  likeCount,
  commentCount,
  saveCount,
  shareCount,
  post,
  isRepost = false,
}: EngagementFooterProps) {
  const t = useTranslations("feed");

  // Query current user's like/save/repost status
  const isLikedByUser = useQuery(api.posts.isLikedByUser, { postId });
  const isSavedByUser = useQuery(api.posts.isSavedByUser, { postId });
  const isRepostedByUser = useQuery(api.posts.isRepostedByUser, { postId });

  // Mutations for toggle actions
  const likePost = useMutation(api.posts.likePost);
  const unlikePost = useMutation(api.posts.unlikePost);
  const savePost = useMutation(api.posts.savePost);
  const unsavePost = useMutation(api.posts.unsavePost);

  // Local state for optimistic UI
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isReposted, setIsReposted] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(likeCount);
  const [localSaveCount, setLocalSaveCount] = useState(saveCount);
  const [localShareCount, setLocalShareCount] = useState(shareCount);

  // Pending states for disabling buttons during mutation
  const [isLikePending, setIsLikePending] = useState(false);
  const [isSavePending, setIsSavePending] = useState(false);

  // Comment section visibility toggle
  const [showComments, setShowComments] = useState(false);

  // Repost dialog visibility
  const [showRepostDialog, setShowRepostDialog] = useState(false);

  // Sync local state with server state when queries update
  useEffect(() => {
    if (isLikedByUser !== undefined) {
      setIsLiked(isLikedByUser);
    }
  }, [isLikedByUser]);

  useEffect(() => {
    if (isSavedByUser !== undefined) {
      setIsSaved(isSavedByUser);
    }
  }, [isSavedByUser]);

  // Sync reposted state with server
  useEffect(() => {
    if (isRepostedByUser !== undefined) {
      setIsReposted(isRepostedByUser);
    }
  }, [isRepostedByUser]);

  // Sync counts with props (in case they update from server)
  useEffect(() => {
    setLocalLikeCount(likeCount);
  }, [likeCount]);

  useEffect(() => {
    setLocalSaveCount(saveCount);
  }, [saveCount]);

  useEffect(() => {
    setLocalShareCount(shareCount);
  }, [shareCount]);

  // Handle like toggle
  const handleLikeToggle = async () => {
    if (isLikePending) return;

    setIsLikePending(true);

    // Optimistic update
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLocalLikeCount((prev) => (newIsLiked ? prev + 1 : Math.max(0, prev - 1)));

    try {
      if (newIsLiked) {
        await likePost({ postId });
      } else {
        await unlikePost({ postId });
      }
    } catch (error) {
      // Revert on error
      setIsLiked(!newIsLiked);
      setLocalLikeCount((prev) =>
        newIsLiked ? Math.max(0, prev - 1) : prev + 1
      );
      console.error("Failed to toggle like:", error);
    } finally {
      setIsLikePending(false);
    }
  };

  // Handle save toggle
  const handleSaveToggle = async () => {
    if (isSavePending) return;

    setIsSavePending(true);

    // Optimistic update
    const newIsSaved = !isSaved;
    setIsSaved(newIsSaved);
    setLocalSaveCount((prev) => (newIsSaved ? prev + 1 : Math.max(0, prev - 1)));

    try {
      if (newIsSaved) {
        await savePost({ postId });
      } else {
        await unsavePost({ postId });
      }
    } catch (error) {
      // Revert on error
      setIsSaved(!newIsSaved);
      setLocalSaveCount((prev) =>
        newIsSaved ? Math.max(0, prev - 1) : prev + 1
      );
      console.error("Failed to toggle save:", error);
    } finally {
      setIsSavePending(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 text-sm text-muted-foreground pt-3 border-t">
        {/* Like Button */}
        <button
          onClick={handleLikeToggle}
          disabled={isLikePending}
          className="flex items-center gap-1 hover:text-foreground transition-colors disabled:opacity-50"
          aria-label={isLiked ? t("engagement.unlikePost") : t("engagement.likePost")}
        >
          <HugeiconsIcon
            icon={FavouriteIcon}
            size={16}
            strokeWidth={1.5}
            fill={isLiked ? "currentColor" : "none"}
            className={isLiked ? "text-red-500" : ""}
          />
          <span>{localLikeCount}</span>
        </button>

        {/* Comment Button - toggles comment section visibility */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1 hover:text-foreground transition-colors"
          aria-label={showComments ? t("engagement.hideComments") : t("engagement.showComments")}
        >
          <HugeiconsIcon icon={Comment01Icon} size={16} strokeWidth={1.5} />
          <span>{commentCount}</span>
        </button>

        {/* Save Button */}
        <button
          onClick={handleSaveToggle}
          disabled={isSavePending}
          className="flex items-center gap-1 hover:text-foreground transition-colors disabled:opacity-50"
          aria-label={isSaved ? t("engagement.unsavePost") : t("engagement.savePost")}
        >
          <HugeiconsIcon
            icon={BookmarkAdd01Icon}
            size={16}
            strokeWidth={1.5}
            fill={isSaved ? "currentColor" : "none"}
            className={isSaved ? "text-primary" : ""}
          />
          <span>{localSaveCount}</span>
        </button>

        {/* Repost Button - only show if not a repost and post data is available */}
        {!isRepost && post && (
          <button
            onClick={() => setShowRepostDialog(true)}
            disabled={isReposted}
            className={`flex items-center gap-1 hover:text-foreground transition-colors ${
              isReposted ? "text-green-500" : ""
            }`}
            aria-label={isReposted ? t("engagement.alreadyReposted") : t("engagement.repost")}
            title={isReposted ? t("engagement.repostedTooltip") : t("engagement.repost")}
          >
            <HugeiconsIcon
              icon={RefreshIcon}
              size={16}
              strokeWidth={1.5}
              className={isReposted ? "text-green-500" : ""}
            />
            <span>{localShareCount}</span>
          </button>
        )}

        {/* Share Button */}
        <ShareButton postId={postId} shareCount={isRepost ? shareCount : 0} />
      </div>

      {/* Comment Section - conditionally rendered */}
      {showComments && <CommentSection postId={postId} />}

      {/* Repost Dialog */}
      {post && (
        <RepostDialog
          post={post}
          open={showRepostDialog}
          onOpenChange={setShowRepostDialog}
        />
      )}
    </div>
  );
}
