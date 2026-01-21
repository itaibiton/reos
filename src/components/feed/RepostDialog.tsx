"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  ResponsiveDialog,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";
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

// Role key mapping for translations
const roleKeyMap: Record<string, string> = {
  investor: "investor",
  broker: "broker",
  mortgage_advisor: "mortgageAdvisor",
  lawyer: "lawyer",
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
  const t = useTranslations("feed.repost");
  const tRoles = useTranslations("common.roles");
  const tActions = useTranslations("common.actions");
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
    ? tRoles(roleKeyMap[post.authorRole] || post.authorRole)
    : undefined;

  return (
    <ResponsiveDialog open={open} onOpenChange={handleClose}>
      <ResponsiveDialogHeader>
        <ResponsiveDialogTitle>{t("title")}</ResponsiveDialogTitle>
      </ResponsiveDialogHeader>

        <div className="space-y-4">
          {/* Optional Comment */}
          <div className="space-y-2">
            <Label htmlFor="repost-comment">{t("addComment")}</Label>
            <Textarea
              id="repost-comment"
              placeholder={t("addThoughts")}
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
            <Label>{t("whoCanSee")}</Label>
            <Select value={visibility} onValueChange={(v) => setVisibility(v as typeof visibility)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">{t("publicEveryone")}</SelectItem>
                <SelectItem value="followers_only">{t("followersOnly")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Original Post Preview */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">{t("originalPost")}</Label>
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
                  {t("serviceRequest")}
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

        <ResponsiveDialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            {tActions("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? t("reposting") : t("repost")}
          </Button>
        </ResponsiveDialogFooter>
    </ResponsiveDialog>
  );
}
