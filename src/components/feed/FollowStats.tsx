"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { FollowListDialog } from "./FollowListDialog";

interface FollowStatsProps {
  userId: Id<"users">;
}

export function FollowStats({ userId }: FollowStatsProps) {
  const counts = useQuery(api.userFollows.getFollowCounts, { userId });
  const [dialogType, setDialogType] = useState<"followers" | "following" | null>(null);

  if (counts === undefined) {
    return (
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span>-- followers</span>
        <span>|</span>
        <span>-- following</span>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3 text-sm">
        <button
          onClick={() => setDialogType("followers")}
          className="hover:underline"
        >
          <span className="font-semibold">{counts.followerCount}</span>{" "}
          <span className="text-muted-foreground">followers</span>
        </button>
        <span className="text-muted-foreground">|</span>
        <button
          onClick={() => setDialogType("following")}
          className="hover:underline"
        >
          <span className="font-semibold">{counts.followingCount}</span>{" "}
          <span className="text-muted-foreground">following</span>
        </button>
      </div>

      <FollowListDialog
        userId={userId}
        type={dialogType}
        open={dialogType !== null}
        onOpenChange={(open) => !open && setDialogType(null)}
      />
    </>
  );
}
