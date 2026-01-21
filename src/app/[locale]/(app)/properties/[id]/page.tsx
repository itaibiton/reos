"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useTranslations, useFormatter } from "next-intl";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Share01Icon,
  FavouriteIcon,
} from "@hugeicons/core-free-icons";
import { Link } from "@/i18n/navigation";
import { SaveButton } from "@/components/properties/SaveButton";
import { PropertyGallery } from "@/components/properties/PropertyGallery";
import { PropertyMap } from "@/components/properties/PropertyMap";
import { PropertyAmenities } from "@/components/properties/PropertyAmenities";
import { PropertyFactsCard } from "@/components/properties/PropertyFactsCard";
import { PropertyHighlights } from "@/components/properties/PropertyHighlights";
import { NearbyProperties } from "@/components/properties/NearbyProperties";
import { MortgageCalculator } from "@/components/properties/MortgageCalculator";
import { ValueHistoryChart } from "@/components/properties/ValueHistoryChart";
import { NeighborhoodInfo } from "@/components/properties/NeighborhoodInfo";
import { SoldPropertiesTable } from "@/components/properties/SoldPropertiesTable";
import { InvestmentMetricsChart } from "@/components/properties/InvestmentMetricsChart";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { toast } from "sonner";

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
    <div className="min-h-dvh">
      {/* Gallery skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-1 h-[420px] rounded-xl overflow-hidden">
          <Skeleton className="lg:col-span-3 h-full" />
          <div className="lg:col-span-2 grid grid-cols-2 gap-1">
            <Skeleton className="h-full" />
            <Skeleton className="h-full" />
            <Skeleton className="h-full" />
            <Skeleton className="h-full" />
          </div>
        </div>

        {/* Header skeleton */}
        <div className="mt-8 flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-48" />
          </div>
          <div className="text-end space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>

        {/* Content skeleton */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Not found component
function PropertyNotFound({ t }: { t: (key: string) => string }) {
  return (
    <div className="min-h-dvh flex items-center justify-center p-6">
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="rounded-full bg-muted p-6 mb-6 text-muted-foreground">
          <HugeiconsIcon icon={Building02Icon} size={64} strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-semibold mb-3">{t("empty.notFound")}</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          {t("empty.notFoundDescription")}
        </p>
        <Link href="/properties">
          <Button size="lg">{t("details.backToMarketplace")}</Button>
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

  const handleShare = async () => {
    try {
      await navigator.share({
        title: property?.title,
        text: property?.description,
        url: window.location.href,
      });
    } catch {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast.success(t("details.linkCopied"));
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
    // Zillow-style fields
    floors,
    lotSize,
    parkingSpaces,
    parkingType,
    heatingType,
    coolingType,
    flooringType,
    laundryType,
    hoaFees,
    propertyTax,
    constructionMaterials,
    appliances,
    exteriorFeatures,
    view,
  } = property;

  const allImages = images && images.length > 0 ? images : featuredImage ? [featuredImage] : [];

  return (
    <div className="min-h-dvh bg-background">
      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back button */}
        <div className="mb-4">
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={2} className="rtl:-scale-x-100" />
            {t("details.backToMarketplace")}
          </Link>
        </div>

        {/* Row 1: Hollywood-style Image Gallery */}
        <section className="mb-8">
          <PropertyGallery
            images={allImages}
            title={title}
            className="h-[420px]"
          />
        </section>

        {/* Row 2: Property Header + Sticky Action Bar */}
        <section className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Left: Title, Address, Badges */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
                <Badge variant={getStatusBadgeVariant(status)} className="text-sm">
                  {tCommon(`propertyStatus.${status}`)}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <HugeiconsIcon icon={Location01Icon} size={18} strokeWidth={1.5} />
                <span className="text-base">{address}, {city}</span>
              </div>
              {/* Quick Stats */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {bedrooms && (
                  <span className="flex items-center gap-1.5">
                    <HugeiconsIcon icon={Home01Icon} size={16} className="text-muted-foreground" />
                    <strong>{bedrooms}</strong> {t("card.bedrooms", { count: bedrooms })}
                  </span>
                )}
                {bathrooms && (
                  <span className="flex items-center gap-1.5">
                    <HugeiconsIcon icon={Bathtub01Icon} size={16} className="text-muted-foreground" />
                    <strong>{bathrooms}</strong> {t("card.bathrooms", { count: bathrooms })}
                  </span>
                )}
                {squareMeters && (
                  <span className="flex items-center gap-1.5">
                    <HugeiconsIcon icon={Square01Icon} size={16} className="text-muted-foreground" />
                    <strong>{squareMeters}</strong> m²
                  </span>
                )}
                <Badge variant="outline" className="text-sm">
                  {tCommon(`propertyTypes.${propertyType === "mixed_use" ? "mixedUse" : propertyType}`)}
                </Badge>
              </div>
            </div>

            {/* Right: Price + Actions */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-4">
              <div className="text-start sm:text-end lg:text-end">
                <p className="text-3xl font-bold">
                  {format.number(priceUsd, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
                </p>
                <p className="text-muted-foreground">
                  {format.number(priceIls || priceUsd * USD_TO_ILS_RATE, { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="flex gap-2">
                <SaveButton propertyId={property._id} className="w-auto" />
                <Button variant="outline" size="icon" onClick={handleShare}>
                  <HugeiconsIcon icon={Share01Icon} size={18} />
                </Button>
                {effectiveRole === "investor" && status === "available" && (
                  hasActiveDeal ? (
                    <Link href={`/deals/${existingDeals?.find(d => d.stage !== "completed" && d.stage !== "cancelled")?._id}`}>
                      <Button variant="secondary" size="lg">
                        <HugeiconsIcon icon={Agreement01Icon} size={18} className="me-2" />
                        {t("details.viewMyDeal")}
                      </Button>
                    </Link>
                  ) : (
                    <Button onClick={handleStartDeal} disabled={isCreatingDeal} size="lg">
                      <HugeiconsIcon icon={Agreement01Icon} size={18} className="me-2" />
                      {isCreatingDeal ? t("details.creatingDeal") : t("details.startDeal")}
                    </Button>
                  )
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Main Content: 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Property Details (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            {/* What's Special - Highlights */}
            <PropertyHighlights
              bedrooms={bedrooms}
              bathrooms={bathrooms}
              squareMeters={squareMeters}
              yearBuilt={yearBuilt}
              priceUsd={priceUsd}
              expectedRoi={expectedRoi}
              floors={floors}
              lotSize={lotSize}
              parkingSpaces={parkingSpaces}
              parkingType={parkingType}
              heatingType={heatingType}
              coolingType={coolingType}
              laundryType={laundryType}
              exteriorFeatures={exteriorFeatures}
              view={view}
              amenities={amenities}
            />

            {/* Description */}
            {description && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("details.description")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Facts & Features */}
            <PropertyFactsCard
              bedrooms={bedrooms}
              bathrooms={bathrooms}
              squareMeters={squareMeters}
              yearBuilt={yearBuilt}
              propertyType={propertyType}
              city={city}
              floors={floors}
              lotSize={lotSize}
              parkingSpaces={parkingSpaces}
              parkingType={parkingType}
              heatingType={heatingType}
              coolingType={coolingType}
              flooringType={flooringType}
              laundryType={laundryType}
              hoaFees={hoaFees}
              propertyTax={propertyTax}
              constructionMaterials={constructionMaterials}
              appliances={appliances}
              exteriorFeatures={exteriorFeatures}
              view={view}
            />

            {/* Amenities */}
            {amenities && amenities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("details.amenities")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <PropertyAmenities amenities={amenities} />
                </CardContent>
              </Card>
            )}

            {/* Investment Dashboard */}
            <Card className="overflow-hidden">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="text-xl">{t("details.investment")}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* Radial Gauge Metrics */}
                <InvestmentMetricsChart
                  expectedRoi={expectedRoi}
                  capRate={capRate}
                  cashOnCash={cashOnCash}
                  monthlyRent={monthlyRent}
                />

                {/* Price History Chart */}
                <div className="mt-6 pt-6 border-t">
                  <ValueHistoryChart city={city} />
                </div>
              </CardContent>
            </Card>

            {/* Map */}
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>{t("details.location")}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <PropertyMap
                  latitude={latitude}
                  longitude={longitude}
                  title={title}
                  address={`${address}, ${city}`}
                  featuredImage={featuredImage}
                  variant="inline"
                  className="h-[300px]"
                />
              </CardContent>
            </Card>

            {/* Area Information */}
            <Card>
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="text-xl">{t("details.aboutCity", { city })}</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                {/* Neighborhood Stats */}
                <NeighborhoodInfo city={city} />

                {/* Recent Sales */}
                <div className="pt-6 border-t">
                  <h3 className="font-semibold mb-4">{t("details.recentSales")}</h3>
                  <SoldPropertiesTable city={city} />
                </div>
              </CardContent>
            </Card>

            {/* Nearby Properties */}
            <NearbyProperties
              city={city}
              currentPropertyId={property._id}
              propertyType={propertyType}
            />
          </div>

          {/* Right Column: Sticky Sidebar (1/3) */}
          <div className="space-y-6">
            {/* Mortgage Calculator - Sticky */}
            <div className="lg:sticky lg:top-6">
              <MortgageCalculator defaultPrice={priceUsd} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
