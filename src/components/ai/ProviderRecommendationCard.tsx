"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserIcon,
  StarIcon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Id } from "../../../convex/_generated/dataModel";
import { ProviderDetailModal } from "./ProviderDetailModal";
import { useProviderAdd } from "./hooks/useProviderAdd";

export interface ProviderData {
  _id: Id<"users">;
  name: string;
  imageUrl?: string;
  providerType: "broker" | "mortgage_advisor" | "lawyer";
  companyName?: string;
  yearsExperience: number;
  specializations: string[];
  serviceAreas: string[];
  languages: string[];
  avgRating: number;
  totalReviews: number;
  completedDeals: number;
  acceptingNewClients: boolean;
}

export interface ProviderSearchCriteria {
  roles?: string[];
  serviceAreas?: string[];
  languages?: string[];
}

interface ProviderRecommendationCardProps {
  provider: ProviderData;
  searchCriteria?: ProviderSearchCriteria;
}

export function ProviderRecommendationCard({
  provider,
  searchCriteria,
}: ProviderRecommendationCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { isOnTeam, isAdding, addToTeam } = useProviderAdd(
    provider._id,
    provider.providerType
  );

  // Format role display: "mortgage_advisor" -> "Mortgage Advisor"
  const roleDisplay = provider.providerType
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // Availability text
  const availabilityText = provider.acceptingNewClients
    ? "Available now"
    : "Not accepting clients";

  // Handle Add button click
  const handleAddClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await addToTeam();
  };

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
          size={12}
          strokeWidth={1.5}
          className={isFilled ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}
        />
      );
    }

    return stars;
  };

  return (
    <>
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setModalOpen(true)}
      >
        <CardContent className="p-4">
          <div className="flex gap-3">
            {/* Profile Photo */}
            <div className="shrink-0">
              {provider.imageUrl ? (
                <img
                  src={provider.imageUrl}
                  alt={provider.name}
                  className="w-12 h-12 object-cover rounded-full"
                />
              ) : (
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <HugeiconsIcon
                    icon={UserIcon}
                    size={24}
                    strokeWidth={1.5}
                    className="text-muted-foreground"
                  />
                </div>
              )}
            </div>

            {/* Provider Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-sm truncate">
                    {provider.name}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate">
                    {provider.companyName
                      ? `${provider.companyName} - ${roleDisplay}`
                      : roleDisplay}
                  </p>
                </div>

                {/* On Team Badge or Add Button */}
                <div className="shrink-0">
                  {isOnTeam ? (
                    <Badge
                      variant="secondary"
                      className="text-xs flex items-center gap-1"
                    >
                      <HugeiconsIcon
                        icon={CheckmarkCircle02Icon}
                        size={12}
                        strokeWidth={1.5}
                      />
                      On Team
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={handleAddClick}
                      disabled={isAdding}
                    >
                      {isAdding ? "Adding..." : "Add"}
                    </Button>
                  )}
                </div>
              </div>

              {/* Rating and Availability Row */}
              <div className="flex items-center gap-3 mb-1.5">
                <div className="flex items-center gap-1">
                  <div className="flex">{renderStars(provider.avgRating)}</div>
                  <span className="text-xs text-muted-foreground">
                    {provider.avgRating.toFixed(1)} ({provider.totalReviews})
                  </span>
                </div>
                <span
                  className={`text-xs ${
                    provider.acceptingNewClients
                      ? "text-green-600"
                      : "text-muted-foreground"
                  }`}
                >
                  {availabilityText}
                </span>
              </div>

              {/* Stats Line */}
              <div className="flex gap-2 text-xs text-muted-foreground">
                <span>{provider.yearsExperience} years exp</span>
                <span>|</span>
                <span>{provider.completedDeals} deals</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ProviderDetailModal
        providerId={provider._id}
        providerType={provider.providerType}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}
