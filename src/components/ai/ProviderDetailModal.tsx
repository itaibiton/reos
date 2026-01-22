"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserIcon,
  StarIcon,
  Location01Icon,
  LanguageSkillIcon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useProviderAdd } from "./hooks/useProviderAdd";

interface ProviderDetailModalProps {
  providerId: Id<"users">;
  providerType: "broker" | "mortgage_advisor" | "lawyer";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProviderDetailModal({
  providerId,
  providerType,
  open,
  onOpenChange,
}: ProviderDetailModalProps) {
  // Only load provider details when modal is open (skip pattern)
  const profile = useQuery(
    api.serviceProviderProfiles.getPublicProfile,
    open ? { providerId } : "skip"
  );

  const { isOnTeam, isAdding, addToTeam } = useProviderAdd(
    providerId,
    providerType
  );

  // Format role display
  const roleDisplay = providerType
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // Format language for display
  const formatLanguage = (lang: string) =>
    lang.charAt(0).toUpperCase() + lang.slice(1);

  // Render rating stars
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    const stars = [];

    for (let i = 0; i < 5; i++) {
      const isFilled = i < fullStars || (i === fullStars && hasHalfStar);
      stars.push(
        <HugeiconsIcon
          key={i}
          icon={StarIcon}
          size={16}
          strokeWidth={1.5}
          className={isFilled ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}
        />
      );
    }

    return stars;
  };

  // Loading state
  if (open && profile === undefined) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              <Skeleton className="h-6 w-48" />
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Profile not found or not loaded
  if (!profile) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">{profile.name || "Provider Profile"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header: Photo, Name, Company, Role */}
          <div className="flex items-start gap-4">
            {profile.imageUrl ? (
              <img
                src={profile.imageUrl}
                alt={profile.name || "Provider"}
                className="w-20 h-20 object-cover rounded-full"
              />
            ) : (
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                <HugeiconsIcon
                  icon={UserIcon}
                  size={40}
                  strokeWidth={1.5}
                  className="text-muted-foreground"
                />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold truncate">
                {profile.name || "Unknown Provider"}
              </h2>
              {profile.companyName && (
                <p className="text-sm text-muted-foreground truncate">
                  {profile.companyName}
                </p>
              )}
              <Badge variant="secondary" className="mt-2">
                {roleDisplay}
              </Badge>
            </div>
          </div>

          {/* Rating Section */}
          <div className="flex items-center gap-3">
            <div className="flex">{renderStars(profile.stats.averageRating)}</div>
            <span className="text-sm">
              {profile.stats.averageRating.toFixed(1)} ({profile.stats.totalReviews}{" "}
              {profile.stats.totalReviews === 1 ? "review" : "reviews"})
            </span>
          </div>

          {/* Availability Status */}
          <div
            className={`text-sm font-medium ${
              profile.companyName ? "" : ""
            } flex items-center gap-2`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                true ? "bg-green-500" : "bg-gray-400"
              }`}
            />
            Available now
          </div>

          {/* Service Areas */}
          {profile.serviceAreas && profile.serviceAreas.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <HugeiconsIcon
                  icon={Location01Icon}
                  size={16}
                  strokeWidth={1.5}
                  className="text-muted-foreground"
                />
                <h3 className="text-sm font-medium">Service Areas</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {profile.serviceAreas.map((area) => (
                  <Badge key={area} variant="outline" className="text-xs">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {profile.languages && profile.languages.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <HugeiconsIcon
                  icon={LanguageSkillIcon}
                  size={16}
                  strokeWidth={1.5}
                  className="text-muted-foreground"
                />
                <h3 className="text-sm font-medium">Languages</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {profile.languages.map((lang) => (
                  <Badge key={lang} variant="outline" className="text-xs">
                    {formatLanguage(lang)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Specializations */}
          {profile.specializations && profile.specializations.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Specializations</h3>
              <div className="flex flex-wrap gap-1.5">
                {profile.specializations.map((spec) => (
                  <Badge key={spec} variant="secondary" className="text-xs">
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          <div className="flex gap-6">
            <div>
              <div className="text-2xl font-bold">
                {profile.stats.yearsExperience}
              </div>
              <div className="text-xs text-muted-foreground">Years Experience</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {profile.stats.completedDeals}
              </div>
              <div className="text-xs text-muted-foreground">Completed Deals</div>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div>
              <h3 className="text-sm font-medium mb-2">About</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {profile.bio}
              </p>
            </div>
          )}

          {/* Footer: Add to Team button or On Your Team badge */}
          <div className="pt-4 border-t">
            {isOnTeam ? (
              <div className="flex items-center justify-center gap-2 py-2">
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  size={20}
                  strokeWidth={1.5}
                  className="text-green-600"
                />
                <span className="font-medium text-green-600">On Your Team</span>
              </div>
            ) : (
              <Button
                className="w-full"
                onClick={addToTeam}
                disabled={isAdding}
              >
                {isAdding ? "Adding..." : "Add to Team"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
