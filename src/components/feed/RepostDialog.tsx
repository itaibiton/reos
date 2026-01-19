"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { Home01Icon } from "@hugeicons/core-free-icons";
import { formatDistanceToNow } from "date-fns";
import type { EnrichedPost } from "./PostCard";

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

interface RepostDialogProps {
  post: EnrichedPost;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RepostDialog({ post, open, onOpenChange }: RepostDialogProps) {
  const [comment, setComment] = useState("");
  const [visibility, setVisibility] = useState<"public" | "followers_only">("public");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRepost = useMutation(api.posts.createRepost);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      await createRepost({
        originalPostId: post._id as Id<"posts">,
        repostComment: comment.trim() || undefined,
        visibility,
      });
      onOpenChange(false);
      setComment("");
      setVisibility("public");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create repost");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setComment("");
    setError(null);
  };

  const roleLabel = post.authorRole
    ? ROLE_LABELS[post.authorRole] || post.authorRole
    : undefined;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Repost</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Optional Comment */}
          <div className="space-y-2">
            <Label htmlFor="repost-comment">Add a comment (optional)</Label>
            <Textarea
              id="repost-comment"
              placeholder="Add your thoughts..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={500}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-end">
              {comment.length}/500
            </p>
          </div>

          {/* Visibility Selector */}
          <div className="space-y-2">
            <Label>Who can see this repost?</Label>
            <Select value={visibility} onValueChange={(v) => setVisibility(v as typeof visibility)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public - Everyone</SelectItem>
                <SelectItem value="followers_only">Followers Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Original Post Preview */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Original post</Label>
            <div className="border rounded-lg p-3 bg-muted/30 space-y-3">
              {/* Property image for property_listing */}
              {post.postType === "property_listing" && post.property && (
                <div className="h-24 bg-muted relative rounded-md overflow-hidden">
                  {post.property.featuredImage ? (
                    <img
                      src={post.property.featuredImage}
                      alt={post.property.title}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <HugeiconsIcon icon={Home01Icon} size={24} strokeWidth={1.5} />
                    </div>
                  )}
                  {/* Property info overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <h4 className="font-medium text-white text-xs truncate">
                      {post.property.title}
                    </h4>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/80">{post.property.city}</span>
                      <span className="text-white font-bold">
                        {formatCompactPrice(post.property.priceUsd)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Author Header */}
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={post.authorImageUrl} alt={post.authorName} />
                  <AvatarFallback className="text-xs">
                    {getInitials(post.authorName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-medium text-sm truncate">{post.authorName}</span>
                  {roleLabel && (
                    <Badge variant="outline" className="text-xs px-1.5 py-0">
                      {roleLabel}
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground ms-auto">
                  {formatDistanceToNow(post.createdAt, { addSuffix: true })}
                </span>
              </div>

              {/* Post Type Indicator */}
              {post.postType === "service_request" && (
                <Badge variant="secondary" className="text-xs">
                  Service Request
                </Badge>
              )}

              {/* Content (truncated) */}
              <p className="text-sm text-muted-foreground line-clamp-3">
                {post.content}
              </p>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Reposting..." : "Repost"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
