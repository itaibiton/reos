"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FollowStats, FollowButton } from "@/components/feed";
import { Id } from "../../../convex/_generated/dataModel";
import { Briefcase } from "lucide-react";
import { useTranslations } from "next-intl";

// Role key mapping for translations
const ROLE_KEY_MAP: Record<string, string> = {
  investor: "investor",
  broker: "broker",
  mortgage_advisor: "mortgageAdvisor",
  lawyer: "lawyer",
  admin: "admin",
};

// Get initials from name
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface ProfileHeaderProps {
  profile: {
    _id: Id<"users">;
    name?: string;
    email?: string;
    imageUrl?: string;
    role?: string;
    isFollowing: boolean;
    isOwnProfile: boolean;
    providerProfile?: {
      companyName?: string;
      bio?: string;
    } | null;
  };
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const tCommon = useTranslations("common");
  const displayName = profile.name || profile.email || "Unknown User";
  const roleKey = profile.role ? ROLE_KEY_MAP[profile.role] || profile.role : null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
      {/* Avatar */}
      <Avatar className="h-20 w-20 flex-shrink-0">
        <AvatarImage src={profile.imageUrl} />
        <AvatarFallback className="text-2xl">
          {getInitials(displayName)}
        </AvatarFallback>
      </Avatar>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold">{displayName}</h1>
          {roleKey && (
            <Badge variant="secondary">
              {tCommon(`roles.${roleKey}`)}
            </Badge>
          )}
        </div>

        {/* Company name for providers */}
        {profile.providerProfile?.companyName && (
          <p className="text-muted-foreground flex items-center gap-1 mt-1">
            <Briefcase size={14} />
            {profile.providerProfile.companyName}
          </p>
        )}

        {/* Bio preview */}
        {profile.providerProfile?.bio && (
          <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
            {profile.providerProfile.bio}
          </p>
        )}

        {/* Follow stats */}
        <div className="mt-3">
          <FollowStats userId={profile._id} />
        </div>
      </div>

      {/* Follow button */}
      <div className="sm:flex-shrink-0">
        <FollowButton userId={profile._id} isOwnPost={profile.isOwnProfile} />
      </div>
    </div>
  );
}
