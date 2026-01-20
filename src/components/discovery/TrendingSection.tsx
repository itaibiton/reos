"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { useTranslations } from "next-intl";
import { api } from "../../../convex/_generated/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Flame } from "lucide-react";

export function TrendingSection() {
  const [timeWindow, setTimeWindow] = useState<"today" | "week">("today");
  const t = useTranslations("search");

  const trendingPosts = useQuery(api.trending.getTrendingPosts, {
    timeWindow,
    limit: 5,
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            {t("trending.title")}
          </CardTitle>
          <Tabs value={timeWindow} onValueChange={(v) => setTimeWindow(v as "today" | "week")}>
            <TabsList className="h-7">
              <TabsTrigger value="today" className="text-xs px-2 py-1">
                {t("trending.today")}
              </TabsTrigger>
              <TabsTrigger value="week" className="text-xs px-2 py-1">
                {t("trending.thisWeek")}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Loading state */}
        {trendingPosts === undefined && (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-6 w-6 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {trendingPosts !== undefined && trendingPosts.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">
            {t("trending.noPosts")}
          </p>
        )}

        {/* Trending posts list */}
        {trendingPosts !== undefined && trendingPosts.length > 0 && (
          <div className="space-y-1">
            {trendingPosts.map((post, index) => (
              <Link
                key={post._id}
                href={`/feed/post/${post._id}`}
                className="flex items-start gap-3 py-2 hover:bg-muted/50 rounded-md px-2 -mx-2 transition-colors"
              >
                {/* Rank number */}
                <span className="text-sm font-bold text-muted-foreground w-5 text-center mt-0.5">
                  #{index + 1}
                </span>

                {/* Author avatar */}
                <Avatar className="h-6 w-6 mt-0.5">
                  <AvatarImage src={post.authorImageUrl} />
                  <AvatarFallback className="text-xs">
                    {post.authorName?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">{post.authorName}</p>
                  <p className="text-sm truncate">
                    {post.postType === "property_listing" && post.property
                      ? post.property.title
                      : post.content?.slice(0, 60) || "Post"}
                  </p>
                </div>

                {/* Engagement indicator */}
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Flame className="h-3 w-3" />
                  <span className="text-xs">
                    {post.likeCount + post.commentCount + post.saveCount}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
