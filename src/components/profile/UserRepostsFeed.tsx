"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { PostCard, PostCardSkeleton } from "@/components/feed";
import { Button } from "@/components/ui/button";

interface UserRepostsFeedProps {
  userId: Id<"users">;
}

export function UserRepostsFeed({ userId }: UserRepostsFeedProps) {
  const { results, status, loadMore } = usePaginatedQuery(
    api.posts.getUserReposts,
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
        No reposts yet.
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
            Load more
          </Button>
        </div>
      )}

      {/* Loading more indicator */}
      {status === "LoadingMore" && (
        <div className="flex justify-center pt-4">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      )}
    </div>
  );
}
