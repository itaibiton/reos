"use client";

import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import { Doc } from "../../../convex/_generated/dataModel";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  Bathtub01Icon,
  Square01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { SaveButton } from "@/components/properties/SaveButton";
import { USD_TO_ILS_RATE, PROPERTY_TYPES } from "@/lib/constants";

// Property with match score from recommendations query
type RecommendedProperty = Doc<"properties"> & { matchScore: number };

// Currency formatter for USD
const formatUSD = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
};

// Currency formatter for ILS
const formatILS = (amount: number) => {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(amount);
};

// Get property type label
const getPropertyTypeLabel = (value: string) => {
  const type = PROPERTY_TYPES.find((t) => t.value === value);
  return type?.label || value;
};

// Get match score color class
function getMatchScoreColor(score: number) {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  return "bg-orange-500";
}

interface RecommendedPropertyCardProps {
  property: RecommendedProperty;
  onClick: () => void;
}

function RecommendedPropertyCard({ property, onClick }: RecommendedPropertyCardProps) {
  const {
    title,
    city,
    address,
    propertyType,
    priceUsd,
    priceIls,
    expectedRoi,
    bedrooms,
    bathrooms,
    squareMeters,
    featuredImage,
    matchScore,
  } = property;

  return (
    <Card
      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow p-0"
      onClick={onClick}
    >
      {/* Image Section */}
      <div className="h-40 bg-muted relative">
        {featuredImage ? (
          <img
            src={featuredImage}
            alt={title}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <HugeiconsIcon icon={Home01Icon} size={40} strokeWidth={1.5} />
          </div>
        )}

        {/* Property Type Badge - top-start */}
        <Badge
          variant="secondary"
          className="absolute top-2 start-2 bg-background/90 backdrop-blur-sm"
        >
          {getPropertyTypeLabel(propertyType)}
        </Badge>

        {/* Match Score Badge - top-end (before save button) */}
        <Badge
          className={`absolute top-2 end-10 ${getMatchScoreColor(matchScore)} text-white`}
        >
          {matchScore}% match
        </Badge>

        {/* Save button - top-end */}
        <div className="absolute top-2 end-2">
          <SaveButton propertyId={property._id} variant="overlay" />
        </div>
      </div>

      <CardContent className="p-3 space-y-2">
        {/* Title and Location */}
        <div>
          <h3 className="font-semibold truncate text-sm">{title}</h3>
          <p className="text-xs text-muted-foreground truncate">
            {city}, {address}
          </p>
        </div>

        {/* Price Section */}
        <div>
          <p className="text-lg font-bold">{formatUSD(priceUsd)}</p>
          <p className="text-xs text-muted-foreground">
            {formatILS(priceIls || priceUsd * USD_TO_ILS_RATE)}
          </p>
        </div>

        {/* ROI if available */}
        {expectedRoi !== undefined && expectedRoi !== null && (
          <div className="text-xs">
            <span className="text-muted-foreground">ROI: </span>
            <span className="font-medium">{expectedRoi.toFixed(1)}%</span>
          </div>
        )}

        {/* Property Details Footer */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground border-t pt-2">
          {bedrooms !== undefined && bedrooms !== null && (
            <div className="flex items-center gap-1">
              <HugeiconsIcon icon={Home01Icon} size={12} strokeWidth={1.5} />
              <span>{bedrooms} bed</span>
            </div>
          )}
          {bathrooms !== undefined && bathrooms !== null && (
            <div className="flex items-center gap-1">
              <HugeiconsIcon icon={Bathtub01Icon} size={12} strokeWidth={1.5} />
              <span>{bathrooms} bath</span>
            </div>
          )}
          {squareMeters !== undefined && squareMeters !== null && (
            <div className="flex items-center gap-1">
              <HugeiconsIcon icon={Square01Icon} size={12} strokeWidth={1.5} />
              <span>{squareMeters} m<sup>2</sup></span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Skeleton for property card
function PropertyCardSkeleton() {
  return (
    <Card className="overflow-hidden p-0">
      <Skeleton className="h-40 w-full" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-3 w-16" />
        <div className="flex gap-3 pt-2 border-t">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </Card>
  );
}

export function RecommendedProperties() {
  const router = useRouter();
  const recommendations = useQuery(api.dashboard.getRecommendedProperties);

  const isLoading = recommendations === undefined;

  // Check if recommendations have low match scores (likely no profile)
  const hasProfile = recommendations?.some((p) => p.matchScore > 50);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Recommended Properties</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          // Loading state: 3 skeleton cards
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <PropertyCardSkeleton />
            <PropertyCardSkeleton />
            <PropertyCardSkeleton />
          </div>
        ) : recommendations && recommendations.length > 0 ? (
          <>
            {/* Show profile prompt if scores are low */}
            {!hasProfile && (
              <div className="mb-4 p-3 bg-muted rounded-lg flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <HugeiconsIcon
                    icon={UserIcon}
                    size={16}
                    className="text-primary"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Complete your investor profile for personalized recommendations
                  </p>
                  <Link
                    href="/settings"
                    className="text-xs text-primary hover:underline"
                  >
                    Update profile
                  </Link>
                </div>
              </div>
            )}

            {/* Property grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((property) => (
                <RecommendedPropertyCard
                  key={property._id}
                  property={property}
                  onClick={() => router.push(`/properties/${property._id}`)}
                />
              ))}
            </div>
          </>
        ) : (
          // Empty state
          <div className="text-center py-8 text-muted-foreground">
            <HugeiconsIcon
              icon={Home01Icon}
              size={40}
              className="mx-auto mb-3 opacity-50"
            />
            <p className="text-sm font-medium">No recommendations yet</p>
            <p className="text-xs mt-1 mb-3">
              Complete your investor profile for personalized recommendations
            </p>
            <Link
              href="/settings"
              className="text-sm text-primary hover:underline"
            >
              Complete your profile
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
