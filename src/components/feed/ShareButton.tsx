"use client";

import { useState } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import { HugeiconsIcon } from "@hugeicons/react";
import { Share01Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";

interface ShareButtonProps {
  postId: Id<"posts">;
  shareCount: number;
}

export function ShareButton({ postId, shareCount }: ShareButtonProps) {
  const [localCount, setLocalCount] = useState(shareCount);
  const [hasShared, setHasShared] = useState(false);

  const handleShare = async () => {
    // Build the share URL
    const url = `${window.location.origin}/feed/post/${postId}`;

    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");

      // Only increment once per session to avoid spam
      if (!hasShared) {
        setLocalCount((prev) => prev + 1);
        setHasShared(true);
        // Note: We don't have a server-side incrementShareCount mutation
        // because share tracking is less critical than likes/saves.
        // Could add later if analytics needed.
      }
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      toast.error("Failed to copy link");
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1 hover:text-foreground transition-colors"
      aria-label="Share post"
    >
      <HugeiconsIcon icon={Share01Icon} size={16} strokeWidth={1.5} />
      <span>{localCount}</span>
    </button>
  );
}
