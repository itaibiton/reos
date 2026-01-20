"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { useTranslations } from "next-intl";
import { api } from "../../../convex/_generated/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPlus } from "lucide-react";
import { FollowButton } from "@/components/feed";

// Role key mapping for translations
const ROLE_KEY_MAP: Record<string, string> = {
  investor: "investor",
  broker: "broker",
  mortgage_advisor: "mortgageAdvisor",
  lawyer: "lawyer",
  accountant: "accountant",
  notary: "notary",
  tax_consultant: "taxConsultant",
  appraiser: "appraiser",
};

export function PeopleToFollow() {
  const t = useTranslations("search");
  const tCommon = useTranslations("common");
  const suggestedUsers = useQuery(api.recommendations.suggestedUsers, {
    limit: 3,
  });

  const formatRole = (role?: string) => {
    const key = role ? ROLE_KEY_MAP[role] : null;
    return key ? tCommon(`roles.${key}`) : tCommon("roles.investor");
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          {t("suggestions.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Loading state */}
        {suggestedUsers === undefined && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {suggestedUsers !== undefined && suggestedUsers.length === 0 && (
          <div className="py-4 text-center">
            <p className="text-sm text-muted-foreground">
              {t("suggestions.noSuggestions")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("suggestions.checkBack")}
            </p>
          </div>
        )}

        {/* Suggested users list */}
        {suggestedUsers !== undefined && suggestedUsers.length > 0 && (
          <div className="space-y-1">
            {suggestedUsers.map((user) => (
              <div key={user._id} className="flex items-center justify-between py-2">
                <Link
                  href={`/profile/${user._id}`}
                  className="flex items-center gap-3 group"
                >
                  <Avatar className="h-10 w-10 group-hover:opacity-80 transition-opacity">
                    <AvatarImage src={user.imageUrl} />
                    <AvatarFallback>{user.name?.[0] || "?"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm group-hover:underline">
                      {user.name}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {formatRole(user.role)}
                    </Badge>
                  </div>
                </Link>
                <FollowButton userId={user._id} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
