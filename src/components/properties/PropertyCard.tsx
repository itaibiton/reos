"use client";

import { Doc } from "../../../convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { USD_TO_ILS_RATE, PROPERTY_TYPES, PROPERTY_STATUS } from "@/lib/constants";
import {
  Home01Icon,
  BathtubIcon,
  SquareIcon,
} from "hugeicons-react";

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

// Get property type label
const getPropertyTypeLabel = (value: string) => {
  const type = PROPERTY_TYPES.find((t) => t.value === value);
  return type?.label || value;
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

// Get status label
const getStatusLabel = (value: string) => {
  const status = PROPERTY_STATUS.find((s) => s.value === value);
  return status?.label || value;
};

interface PropertyCardProps {
  property: Doc<"properties">;
  onClick?: () => void;
}

export function PropertyCard({ property, onClick }: PropertyCardProps) {
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
      <div className="aspect-video bg-muted relative">
        {featuredImage ? (
          <img
            src={featuredImage}
            alt={title}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <Home01Icon className="h-12 w-12" />
          </div>
        )}

        {/* Property Type Badge - top-left */}
        <Badge
          variant="secondary"
          className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm"
        >
          {getPropertyTypeLabel(propertyType)}
        </Badge>

        {/* Status Badge - top-right (only if not available) */}
        {status !== "available" && (
          <Badge
            variant={getStatusBadgeVariant(status)}
            className="absolute top-2 right-2"
          >
            {getStatusLabel(status)}
          </Badge>
        )}
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
              <span className="text-muted-foreground">ROI: </span>
              <span className="font-medium">{formatPercent(expectedRoi)}</span>
            </div>
          )}
          {capRate !== undefined && capRate !== null && (
            <div>
              <span className="text-muted-foreground">Cap: </span>
              <span className="font-medium">{formatPercent(capRate)}</span>
            </div>
          )}
          {monthlyRent !== undefined && monthlyRent !== null && (
            <div>
              <span className="text-muted-foreground">Rent: </span>
              <span className="font-medium">{formatUSD(monthlyRent)}/mo</span>
            </div>
          )}
        </div>

        {/* Property Details Footer */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground border-t pt-3">
          {bedrooms !== undefined && bedrooms !== null && (
            <div className="flex items-center gap-1">
              <Home01Icon className="h-4 w-4" />
              <span>{bedrooms} bed</span>
            </div>
          )}
          {bathrooms !== undefined && bathrooms !== null && (
            <div className="flex items-center gap-1">
              <BathtubIcon className="h-4 w-4" />
              <span>{bathrooms} bath</span>
            </div>
          )}
          {squareMeters !== undefined && squareMeters !== null && (
            <div className="flex items-center gap-1">
              <SquareIcon className="h-4 w-4" />
              <span>{squareMeters} m<sup>2</sup></span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
