"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserMultiple02Icon,
  Money01Icon,
  AnalyticsUpIcon,
  AnalyticsDownIcon,
} from "@hugeicons/core-free-icons";

// Format population with commas
const formatPopulation = (population: number) => {
  return new Intl.NumberFormat("en-US").format(population);
};

// Format price per square meter
const formatPricePerSqm = (price: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
};

// Format percentage change
const formatPercentChange = (change: number) => {
  const prefix = change >= 0 ? "+" : "";
  return `${prefix}${change.toFixed(1)}%`;
};

// Map amenity keys to display labels
const AMENITY_LABELS: Record<string, string> = {
  schools: "Schools",
  parks: "Parks",
  shopping: "Shopping",
  transit: "Transit",
  beaches: "Beaches",
  hospitals: "Hospitals",
  restaurants: "Restaurants",
  nightlife: "Nightlife",
  universities: "Universities",
};

interface NeighborhoodInfoProps {
  city: string;
}

export function NeighborhoodInfo({ city }: NeighborhoodInfoProps) {
  const neighborhood = useQuery(api.neighborhoods.getByCity, { city });

  // Loading state
  if (neighborhood === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  // No data state
  if (neighborhood === null) {
    return (
      <p className="text-muted-foreground text-sm">
        No neighborhood data available for this city
      </p>
    );
  }

  const {
    population,
    avgPricePerSqm,
    priceChange1Year,
    nearbyAmenities,
    description,
  } = neighborhood;

  return (
    <div className="space-y-6">
      {/* Statistics Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Population */}
        {population !== undefined && (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <HugeiconsIcon
                icon={UserMultiple02Icon}
                size={16}
                strokeWidth={1.5}
              />
              <span className="text-xs">Population</span>
            </div>
            <p className="font-semibold">{formatPopulation(population)}</p>
          </div>
        )}

        {/* Avg Price per m2 */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <HugeiconsIcon icon={Money01Icon} size={16} strokeWidth={1.5} />
            <span className="text-xs">Avg Price/m&sup2;</span>
          </div>
          <p className="font-semibold">{formatPricePerSqm(avgPricePerSqm)}</p>
        </div>

        {/* 1-Year Price Change */}
        {priceChange1Year !== undefined && (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <HugeiconsIcon
                icon={priceChange1Year >= 0 ? AnalyticsUpIcon : AnalyticsDownIcon}
                size={16}
                strokeWidth={1.5}
                className={
                  priceChange1Year >= 0 ? "text-green-600" : "text-red-600"
                }
              />
              <span className="text-xs">1-Year Change</span>
            </div>
            <p
              className={`font-semibold ${
                priceChange1Year >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatPercentChange(priceChange1Year)}
            </p>
          </div>
        )}
      </div>

      {/* Nearby Amenities */}
      {nearbyAmenities && nearbyAmenities.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Nearby Amenities</p>
          <div className="flex flex-wrap gap-2">
            {nearbyAmenities.map((amenity) => (
              <Badge key={amenity} variant="secondary">
                {AMENITY_LABELS[amenity] || amenity}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {description && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
