"use client";

import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { USD_TO_ILS_RATE, PROPERTY_TYPES, PROPERTY_STATUS } from "@/lib/constants";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  Bathtub01Icon,
  Square01Icon,
  ArrowLeft01Icon,
  Calendar01Icon,
  Building02Icon,
  Location01Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { SaveButton } from "@/components/properties/SaveButton";
import { PropertyImageCarousel } from "@/components/properties/PropertyImageCarousel";
import { PropertyMap } from "@/components/properties/PropertyMap";
import { PropertyAmenities } from "@/components/properties/PropertyAmenities";
import { MortgageCalculator } from "@/components/properties/MortgageCalculator";
import { ValueHistoryChart } from "@/components/properties/ValueHistoryChart";
import { NeighborhoodInfo } from "@/components/properties/NeighborhoodInfo";
import { SoldPropertiesTable } from "@/components/properties/SoldPropertiesTable";

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

// Loading skeleton for the detail page
function DetailPageSkeleton() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header skeleton */}
      <div className="mb-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-8 w-3/4 mb-2" />
        <Skeleton className="h-5 w-1/2" />
      </div>

      {/* Image skeleton */}
      <Skeleton className="aspect-video w-full rounded-lg mb-6" />

      {/* Content skeleton */}
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    </div>
  );
}

// Not found component
function PropertyNotFound() {
  return (
    <div className="p-6">
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="rounded-full bg-muted p-4 mb-4 text-muted-foreground">
          <HugeiconsIcon icon={Building02Icon} size={48} strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-semibold mb-2">Property not found</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          The property you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link href="/properties">
          <Button>Back to Marketplace</Button>
        </Link>
      </div>
    </div>
  );
}

export default function PropertyDetailPage() {
  const params = useParams();
  const propertyId = params.id as string;

  const property = useQuery(api.properties.getById, {
    id: propertyId as Id<"properties">,
  });

  // Loading state
  if (property === undefined) {
    return <DetailPageSkeleton />;
  }

  // Not found state
  if (property === null) {
    return <PropertyNotFound />;
  }

  const {
    title,
    description,
    city,
    address,
    propertyType,
    status,
    priceUsd,
    priceIls,
    expectedRoi,
    cashOnCash,
    capRate,
    monthlyRent,
    bedrooms,
    bathrooms,
    squareMeters,
    yearBuilt,
    images,
    featuredImage,
    latitude,
    longitude,
    amenities,
  } = property;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="mb-6">
        {/* Back button */}
        <Link
          href="/properties"
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-4 text-sm"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={2} />
          Back to Marketplace
        </Link>

        {/* Title, Address, Price */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">{title}</h1>
              <Badge variant={getStatusBadgeVariant(status)}>
                {getStatusLabel(status)}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <HugeiconsIcon icon={Location01Icon} size={16} strokeWidth={1.5} />
              <span>
                {address}, {city}
              </span>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-2xl font-bold">{formatUSD(priceUsd)}</p>
            <p className="text-muted-foreground text-sm">
              {formatILS(priceIls || priceUsd * USD_TO_ILS_RATE)}
            </p>
          </div>
        </div>
      </div>

      {/* Image Carousel */}
      <div className="mb-8">
        <div className="relative">
          <PropertyImageCarousel
            images={images && images.length > 0 ? images : featuredImage ? [featuredImage] : []}
            title={title}
          />
          {/* Property Type Badge */}
          <Badge
            variant="secondary"
            className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm z-10"
          >
            {getPropertyTypeLabel(propertyType)}
          </Badge>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-8">
        <SaveButton propertyId={property._id} variant="default" className="w-auto" />
        <Button asChild>
          <a href="#">Contact Broker</a>
        </Button>
      </div>

      {/* Property Details */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Property Details</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <HugeiconsIcon
              icon={Home01Icon}
              size={20}
              strokeWidth={1.5}
              className="text-muted-foreground"
            />
            <div>
              <p className="text-xs text-muted-foreground">Bedrooms</p>
              <p className="font-medium">
                {bedrooms !== undefined && bedrooms !== null ? bedrooms : "N/A"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <HugeiconsIcon
              icon={Bathtub01Icon}
              size={20}
              strokeWidth={1.5}
              className="text-muted-foreground"
            />
            <div>
              <p className="text-xs text-muted-foreground">Bathrooms</p>
              <p className="font-medium">
                {bathrooms !== undefined && bathrooms !== null ? bathrooms : "N/A"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <HugeiconsIcon
              icon={Square01Icon}
              size={20}
              strokeWidth={1.5}
              className="text-muted-foreground"
            />
            <div>
              <p className="text-xs text-muted-foreground">Size</p>
              <p className="font-medium">
                {squareMeters !== undefined && squareMeters !== null
                  ? `${squareMeters} m²`
                  : "N/A"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <HugeiconsIcon
              icon={Calendar01Icon}
              size={20}
              strokeWidth={1.5}
              className="text-muted-foreground"
            />
            <div>
              <p className="text-xs text-muted-foreground">Year Built</p>
              <p className="font-medium">
                {yearBuilt !== undefined && yearBuilt !== null ? yearBuilt : "N/A"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <HugeiconsIcon
              icon={Building02Icon}
              size={20}
              strokeWidth={1.5}
              className="text-muted-foreground"
            />
            <div>
              <p className="text-xs text-muted-foreground">Type</p>
              <p className="font-medium">{getPropertyTypeLabel(propertyType)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <HugeiconsIcon
              icon={Location01Icon}
              size={20}
              strokeWidth={1.5}
              className="text-muted-foreground"
            />
            <div>
              <p className="text-xs text-muted-foreground">City</p>
              <p className="font-medium">{city}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Description</h2>
        <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
          {description || "No description available."}
        </p>
      </section>

      {/* Amenities */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Amenities</h2>
        <PropertyAmenities amenities={amenities} />
      </section>

      {/* Investment Metrics */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Investment</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <p className="text-xs text-muted-foreground mb-1">Expected ROI</p>
            <p className="text-xl font-semibold">
              {expectedRoi !== undefined && expectedRoi !== null
                ? formatPercent(expectedRoi)
                : "N/A"}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <p className="text-xs text-muted-foreground mb-1">Cap Rate</p>
            <p className="text-xl font-semibold">
              {capRate !== undefined && capRate !== null ? formatPercent(capRate) : "N/A"}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <p className="text-xs text-muted-foreground mb-1">Cash-on-Cash</p>
            <p className="text-xl font-semibold">
              {cashOnCash !== undefined && cashOnCash !== null
                ? formatPercent(cashOnCash)
                : "N/A"}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <p className="text-xs text-muted-foreground mb-1">Monthly Rent</p>
            <p className="text-xl font-semibold">
              {monthlyRent !== undefined && monthlyRent !== null
                ? formatUSD(monthlyRent)
                : "N/A"}
            </p>
          </div>
        </div>
        <MortgageCalculator defaultPrice={priceUsd} />
      </section>

      {/* Map */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Location</h2>
        <PropertyMap
          latitude={latitude}
          longitude={longitude}
          title={title}
          address={`${address}, ${city}`}
          featuredImage={featuredImage}
          variant="inline"
          className="h-64 rounded-lg overflow-hidden"
        />
      </section>

      {/* Area Info */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">About {city}</h2>
        <div className="space-y-6">
          <NeighborhoodInfo city={city} />
          <ValueHistoryChart city={city} />
          <SoldPropertiesTable city={city} />
        </div>
      </section>
    </div>
  );
}
