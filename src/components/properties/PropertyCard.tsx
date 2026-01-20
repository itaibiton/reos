"use client";

import { useTranslations } from "next-intl";
import { Doc } from "../../../convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { USD_TO_ILS_RATE } from "@/lib/constants";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  Bathtub01Icon,
  Square01Icon,
} from "@hugeicons/core-free-icons";
import { SaveButton } from "./SaveButton";

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

// Percentage formatter
const formatPercent = (value: number) => {
  return `${value.toFixed(1)}%`;
};

// Get status badge variant
const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "available":
      return "default";
    case "pending":
      return "secondary";
    case "sold":
      return "destructive";
    default:
      return "outline";
  }
};

interface PropertyCardProps {
  property: Doc<"properties">;
  onClick?: () => void;
}

export function PropertyCard({ property, onClick }: PropertyCardProps) {
  const t = useTranslations("properties");
  const tCommon = useTranslations("common");

  const {
    title,
    city,
    address,
    propertyType,
    status,
    priceUsd,
    priceIls,
    expectedRoi,
    capRate,
    monthlyRent,
    bedrooms,
    bathrooms,
    squareMeters,
    featuredImage,
  } = property;

  return (
    <Card
      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow p-0"
      onClick={onClick}
    >
      {/* Image Section */}
      <div className="h-48 bg-muted relative">
        {featuredImage ? (
          <img
            src={featuredImage}
            alt={title}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <HugeiconsIcon icon={Home01Icon} size={48} strokeWidth={1.5} />
          </div>
        )}

        {/* Property Type Badge - top-start */}
        <Badge
          variant="secondary"
          className="absolute top-2 start-2 bg-background/90 backdrop-blur-sm"
        >
          {tCommon(`propertyTypes.${propertyType === "mixed_use" ? "mixedUse" : propertyType}`)}
        </Badge>

        {/* Top-end area: Save button and status badge */}
        <div className="absolute top-2 end-2 flex items-center gap-2">
          {status !== "available" && (
            <Badge variant={getStatusBadgeVariant(status)}>
              {tCommon(`propertyStatus.${status}`)}
            </Badge>
          )}
          <SaveButton propertyId={property._id} variant="overlay" />
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Title and Location */}
        <div>
          <h3 className="font-semibold truncate text-base">{title}</h3>
          <p className="text-sm text-muted-foreground truncate">
            {city}, {address}
          </p>
        </div>

        {/* Price Section */}
        <div>
          <p className="text-xl font-bold">{formatUSD(priceUsd)}</p>
          <p className="text-sm text-muted-foreground">
            {formatILS(priceIls || priceUsd * USD_TO_ILS_RATE)}
          </p>
        </div>

        {/* Investment Metrics Row */}
        <div className="flex items-center gap-4 text-sm">
          {expectedRoi !== undefined && expectedRoi !== null && (
            <div>
              <span className="text-muted-foreground">{t("card.roi")}: </span>
              <span className="font-medium">{formatPercent(expectedRoi)}</span>
            </div>
          )}
          {capRate !== undefined && capRate !== null && (
            <div>
              <span className="text-muted-foreground">{t("card.cap")}: </span>
              <span className="font-medium">{formatPercent(capRate)}</span>
            </div>
          )}
          {monthlyRent !== undefined && monthlyRent !== null && (
            <div>
              <span className="text-muted-foreground">{t("card.rent")}: </span>
              <span className="font-medium">{formatUSD(monthlyRent)}{t("card.perMonth")}</span>
            </div>
          )}
        </div>

        {/* Property Details Footer */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground border-t pt-3">
          {bedrooms !== undefined && bedrooms !== null && (
            <div className="flex items-center gap-1">
              <HugeiconsIcon icon={Home01Icon} size={16} strokeWidth={1.5} />
              <span>{t("card.bedrooms", { count: bedrooms })}</span>
            </div>
          )}
          {bathrooms !== undefined && bathrooms !== null && (
            <div className="flex items-center gap-1">
              <HugeiconsIcon icon={Bathtub01Icon} size={16} strokeWidth={1.5} />
              <span>{t("card.bathrooms", { count: bathrooms })}</span>
            </div>
          )}
          {squareMeters !== undefined && squareMeters !== null && (
            <div className="flex items-center gap-1">
              <HugeiconsIcon icon={Square01Icon} size={16} strokeWidth={1.5} />
              <span>{t("card.size", { size: squareMeters })}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
