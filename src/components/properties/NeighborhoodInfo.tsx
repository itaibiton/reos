"use client";

import { useQuery } from "convex/react";
import { useTranslations, useFormatter } from "next-intl";
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

// Format percentage change (kept as-is: percentage formatting with sign prefix is specialized logic)
const formatPercentChange = (change: number) => {
  const prefix = change >= 0 ? "+" : "";
  return `${prefix}${change.toFixed(1)}%`;
};


interface NeighborhoodInfoProps {
  city: string;
}

export function NeighborhoodInfo({ city }: NeighborhoodInfoProps) {
  const t = useTranslations("properties");
  const format = useFormatter();
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
        {t("neighborhood.noData")}
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
              <span className="text-xs">{t("neighborhood.population")}</span>
            </div>
            <p className="font-semibold">{format.number(population)}</p>
          </div>
        )}

        {/* Avg Price per m2 */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <HugeiconsIcon icon={Money01Icon} size={16} strokeWidth={1.5} />
            <span className="text-xs">{t("neighborhood.avgPricePerSqm")}</span>
          </div>
          <p className="font-semibold">{format.number(avgPricePerSqm, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}</p>
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
              <span className="text-xs">{t("neighborhood.yearChange")}</span>
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
          <p className="text-sm text-muted-foreground">{t("neighborhood.nearbyAmenities")}</p>
          <div className="flex flex-wrap gap-2">
            {nearbyAmenities.map((amenity) => (
              <Badge key={amenity} variant="secondary">
                {t(`neighborhood.${amenity}`)}
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
