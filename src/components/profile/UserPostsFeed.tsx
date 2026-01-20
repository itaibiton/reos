"use client";

import { usePaginatedQuery } from "convex/react";
import { useTranslations } from "next-intl";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { PostCard, PostCardSkeleton } from "@/components/feed";
import { Button } from "@/components/ui/button";

interface UserPostsFeedProps {
  userId: Id<"users">;
}

export function UserPostsFeed({ userId }: UserPostsFeedProps) {
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");
  const { results, status, loadMore } = usePaginatedQuery(
    api.posts.userFeed,
    { userId },
    { initialNumItems: 10 }
  );

  // Loading state
  if (status === "LoadingFirstPage") {
    return (
      <div className="space-y-4">
        <PostCardSkeleton />
        <PostCardSkeleton />
        <PostCardSkeleton />
      </div>
    );
  }

  // Empty state
  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {t("empty.noPosts")}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {results.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}

      {/* Load more */}
      {status === "CanLoadMore" && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={() => loadMore(10)}>
            {tCommon("actions.loadMore")}
          </Button>
        </div>
      )}

      {/* Loading more indicator */}
      {status === "LoadingMore" && (
        <div className="flex justify-center pt-4">
          <div className="text-sm text-muted-foreground">{tCommon("status.loading")}...</div>
        </div>
      )}
    </div>
  );
}
