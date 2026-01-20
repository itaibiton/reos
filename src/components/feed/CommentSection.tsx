"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { usePaginatedQuery } from "convex/react";
import { useTranslations } from "next-intl";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CommentSectionProps {
  postId: Id<"posts">;
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

export function CommentSection({ postId }: CommentSectionProps) {
  const t = useTranslations("feed");
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addComment = useMutation(api.posts.addComment);

  // Paginated comments, newest first
  const { results: comments, status, loadMore } = usePaginatedQuery(
    api.posts.getComments,
    { postId },
    { initialNumItems: 5 }
  );

  const handleSubmit = async () => {
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    try {
      await addComment({ postId, content: commentText });
      setCommentText("");
      toast.success(t("comments.addedSuccess"));
    } catch (error) {
      toast.error(t("comments.addedError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Enter to submit, Shift+Enter for newline
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="pt-3 space-y-4">
      {/* Comment Input */}
      <div className="flex gap-3">
        <Textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("comments.placeholder")}
          className="min-h-[80px] resize-none"
          maxLength={1000}
        />
        <Button
          onClick={handleSubmit}
          disabled={!commentText.trim() || isSubmitting}
          className="self-end"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            t("comments.post")
          )}
        </Button>
      </div>

      {/* Comments List */}
      {status === "LoadingFirstPage" && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {comments.length > 0 && (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment._id} className="flex gap-3">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={comment.authorImageUrl} alt={comment.authorName} />
                <AvatarFallback className="text-xs">
                  {getInitials(comment.authorName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{comment.authorName}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm mt-1">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load more */}
      {status === "CanLoadMore" && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground"
          onClick={() => loadMore(5)}
        >
          {t("comments.loadMore")}
        </Button>
      )}

      {status === "LoadingMore" && (
        <div className="flex justify-center py-2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty state */}
      {status !== "LoadingFirstPage" && comments.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-2">
          {t("comments.noComments")}
        </p>
      )}
    </div>
  );
}
