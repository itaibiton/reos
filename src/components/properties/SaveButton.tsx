"use client";

import { useQuery, useMutation } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { FavouriteIcon } from "@hugeicons/core-free-icons";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SaveButtonProps {
  propertyId: Id<"properties">;
  variant?: "default" | "overlay";
  className?: string;
}

export function SaveButton({
  propertyId,
  variant = "default",
  className,
}: SaveButtonProps) {
  const { isSignedIn } = useAuth();
  const isSaved = useQuery(api.favorites.isSaved, { propertyId });
  const toggleFavorite = useMutation(api.favorites.toggle);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    // Prevent card click when clicking the save button
    e.stopPropagation();
    e.preventDefault();

    if (!isSignedIn) {
      // User is not signed in - could redirect to sign in or show toast
      return;
    }

    setIsLoading(true);
    try {
      await toggleFavorite({ propertyId });
    } finally {
      setIsLoading(false);
    }
  };

  // Still loading the initial state
  if (isSaved === undefined) {
    if (variant === "overlay") {
      return (
        <button
          className={cn(
            "rounded-full p-2 bg-background/80 backdrop-blur-sm text-muted-foreground",
            className
          )}
          disabled
        >
          <HugeiconsIcon icon={FavouriteIcon} size={18} strokeWidth={1.5} />
        </button>
      );
    }
    return (
      <Button variant="outline" className={className} disabled>
        <HugeiconsIcon icon={FavouriteIcon} size={18} strokeWidth={1.5} />
        Save Property
      </Button>
    );
  }

  // User not signed in
  if (!isSignedIn) {
    if (variant === "overlay") {
      return (
        <button
          className={cn(
            "rounded-full p-2 bg-background/80 backdrop-blur-sm text-muted-foreground cursor-not-allowed opacity-50",
            className
          )}
          disabled
          title="Sign in to save properties"
        >
          <HugeiconsIcon icon={FavouriteIcon} size={18} strokeWidth={1.5} />
        </button>
      );
    }
    return (
      <Button
        variant="outline"
        className={className}
        disabled
        title="Sign in to save properties"
      >
        <HugeiconsIcon icon={FavouriteIcon} size={18} strokeWidth={1.5} />
        Sign in to Save
      </Button>
    );
  }

  // Overlay variant (for PropertyCard)
  if (variant === "overlay") {
    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={cn(
          "rounded-full p-2 bg-background/80 backdrop-blur-sm transition-colors",
          isSaved
            ? "text-red-500 hover:text-red-600"
            : "text-muted-foreground hover:text-foreground",
          isLoading && "opacity-50 cursor-not-allowed",
          className
        )}
        title={isSaved ? "Remove from saved" : "Save property"}
      >
        <HugeiconsIcon
          icon={FavouriteIcon}
          size={18}
          strokeWidth={1.5}
          fill={isSaved ? "currentColor" : "none"}
        />
      </button>
    );
  }

  // Default variant (for detail page)
  return (
    <Button
      variant="outline"
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        isSaved && "text-red-500 border-red-200 hover:text-red-600 hover:border-red-300",
        className
      )}
    >
      <HugeiconsIcon
        icon={FavouriteIcon}
        size={18}
        strokeWidth={1.5}
        fill={isSaved ? "currentColor" : "none"}
      />
      {isSaved ? "Saved" : "Save Property"}
    </Button>
  );
}
