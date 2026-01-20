"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations, useFormatter } from "next-intl";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { USD_TO_ILS_RATE } from "@/lib/constants";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  Bathtub01Icon,
  Square01Icon,
  ArrowLeft01Icon,
  Calendar01Icon,
  Building02Icon,
  Location01Icon,
  Agreement01Icon,
} from "@hugeicons/core-free-icons";
import { Link } from "@/i18n/navigation";
import { SaveButton } from "@/components/properties/SaveButton";
import { PropertyImageCarousel } from "@/components/properties/PropertyImageCarousel";
import { PropertyMap } from "@/components/properties/PropertyMap";
import { PropertyAmenities } from "@/components/properties/PropertyAmenities";
import { MortgageCalculator } from "@/components/properties/MortgageCalculator";
import { ValueHistoryChart } from "@/components/properties/ValueHistoryChart";
import { NeighborhoodInfo } from "@/components/properties/NeighborhoodInfo";
import { SoldPropertiesTable } from "@/components/properties/SoldPropertiesTable";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { toast } from "sonner";

// Percentage formatter (simple display, doesn't need locale-specific formatting for MVP)
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

// Loading skeleton for the detail page
function DetailPageSkeleton() {
  return (
    <div className="p-6 ">
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
function PropertyNotFound({ t }: { t: (key: string) => string }) {
  return (
    <div className="p-6">
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="rounded-full bg-muted p-4 mb-4 text-muted-foreground">
          <HugeiconsIcon icon={Building02Icon} size={48} strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-semibold mb-2">{t("empty.notFound")}</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          {t("empty.notFoundDescription")}
        </p>
        <Link href="/properties">
          <Button>{t("details.backToMarketplace")}</Button>
        </Link>
      </div>
    </div>
  );
}

export default function PropertyDetailPage() {
  const t = useTranslations("properties");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;
  const { effectiveRole } = useCurrentUser();
  const [isCreatingDeal, setIsCreatingDeal] = useState(false);

  const property = useQuery(api.properties.getById, {
    id: propertyId as Id<"properties">,
  });

  // Check if user already has a deal on this property
  const existingDeals = useQuery(api.deals.getByProperty, {
    propertyId: propertyId as Id<"properties">,
  });

  const createDeal = useMutation(api.deals.create);

  // Check if user already has an active deal
  const hasActiveDeal = existingDeals?.some(
    (deal) => deal.stage !== "completed" && deal.stage !== "cancelled"
  );

  const handleStartDeal = async () => {
    setIsCreatingDeal(true);
    try {
      const dealId = await createDeal({
        propertyId: propertyId as Id<"properties">,
      });
      toast.success("Deal created! Redirecting...");
      router.push(`/deals/${dealId}`);
    } catch (error) {
      console.error("Error creating deal:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create deal");
    } finally {
      setIsCreatingDeal(false);
    }
  };

  // Loading state
  if (property === undefined) {
    return <DetailPageSkeleton />;
  }

  // Not found state
  if (property === null) {
    return <PropertyNotFound t={t} />;
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
    <div className="p-6 ">
      {/* Header Section */}
      <div className="mb-6">
        {/* Back button */}
        <Link
          href="/properties"
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-4 text-sm"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={2} className="rtl:-scale-x-100" />
          {t("details.backToMarketplace")}
        </Link>

        {/* Title, Address, Price */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">{title}</h1>
              <Badge variant={getStatusBadgeVariant(status)}>
                {tCommon(`propertyStatus.${status}`)}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <HugeiconsIcon icon={Location01Icon} size={16} strokeWidth={1.5} />
              <span>
                {address}, {city}
              </span>
            </div>
          </div>
          <div className="text-start sm:text-end">
            <p className="text-2xl font-bold">{format.number(priceUsd, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}</p>
            <p className="text-muted-foreground text-sm">
              {format.number(priceIls || priceUsd * USD_TO_ILS_RATE, { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 })}
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
            className="absolute top-4 start-4 bg-background/90 backdrop-blur-sm z-10"
          >
            {tCommon(`propertyTypes.${propertyType === "mixed_use" ? "mixedUse" : propertyType}`)}
          </Badge>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-8">
        <SaveButton propertyId={property._id} variant="default" className="w-auto" />
        {effectiveRole === "investor" && status === "available" && (
          hasActiveDeal ? (
            <Link href={`/deals/${existingDeals?.find(d => d.stage !== "completed" && d.stage !== "cancelled")?._id}`}>
              <Button variant="secondary">
                <HugeiconsIcon icon={Agreement01Icon} size={16} className="me-2" />
                {t("details.viewMyDeal")}
              </Button>
            </Link>
          ) : (
            <Button onClick={handleStartDeal} disabled={isCreatingDeal}>
              <HugeiconsIcon icon={Agreement01Icon} size={16} className="me-2" />
              {isCreatingDeal ? t("details.creatingDeal") : t("details.startDeal")}
            </Button>
          )
        )}
      </div>

      {/* Property Details */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">{t("details.propertyDetails")}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <HugeiconsIcon
              icon={Home01Icon}
              size={20}
              strokeWidth={1.5}
              className="text-muted-foreground"
            />
            <div>
              <p className="text-xs text-muted-foreground">{t("details.bedrooms")}</p>
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
              <p className="text-xs text-muted-foreground">{t("details.bathrooms")}</p>
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
              <p className="text-xs text-muted-foreground">{t("details.size")}</p>
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
              <p className="text-xs text-muted-foreground">{t("details.yearBuilt")}</p>
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
              <p className="text-xs text-muted-foreground">{t("details.type")}</p>
              <p className="font-medium">{tCommon(`propertyTypes.${propertyType === "mixed_use" ? "mixedUse" : propertyType}`)}</p>
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
              <p className="text-xs text-muted-foreground">{t("details.city")}</p>
              <p className="font-medium">{city}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">{t("details.description")}</h2>
        <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
          {description || t("details.noDescription")}
        </p>
      </section>

      {/* Amenities */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">{t("details.amenities")}</h2>
        <PropertyAmenities amenities={amenities} />
      </section>

      {/* Investment Metrics */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">{t("details.investment")}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <p className="text-xs text-muted-foreground mb-1">{t("details.expectedRoi")}</p>
            <p className="text-xl font-semibold">
              {expectedRoi !== undefined && expectedRoi !== null
                ? formatPercent(expectedRoi)
                : "N/A"}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <p className="text-xs text-muted-foreground mb-1">{t("details.capRate")}</p>
            <p className="text-xl font-semibold">
              {capRate !== undefined && capRate !== null ? formatPercent(capRate) : "N/A"}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <p className="text-xs text-muted-foreground mb-1">{t("details.cashOnCash")}</p>
            <p className="text-xl font-semibold">
              {cashOnCash !== undefined && cashOnCash !== null
                ? formatPercent(cashOnCash)
                : "N/A"}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <p className="text-xs text-muted-foreground mb-1">{t("details.monthlyRent")}</p>
            <p className="text-xl font-semibold">
              {monthlyRent !== undefined && monthlyRent !== null
                ? format.number(monthlyRent, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
                : "N/A"}
            </p>
          </div>
        </div>
        <MortgageCalculator defaultPrice={priceUsd} />
      </section>

      {/* Map */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">{t("details.location")}</h2>
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
        <h2 className="text-lg font-semibold mb-4">{t("details.aboutCity", { city })}</h2>
        <div className="space-y-6">
          <NeighborhoodInfo city={city} />
          <ValueHistoryChart city={city} />
          <SoldPropertiesTable city={city} />
        </div>
      </section>
    </div>
  );
}
