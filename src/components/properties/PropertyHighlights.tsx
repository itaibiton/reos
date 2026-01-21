"use client";

import { useTranslations, useFormatter } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  CheckmarkBadge01Icon,
  Home01Icon,
  Car01Icon,
  Sun01Icon,
  AirplaneModeIcon,
  ViewIcon,
  DropletIcon,
  FlowerIcon,
  Building02Icon,
  Square01Icon,
  Calendar01Icon,
  Dollar02Icon,
  CheckmarkCircle01Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";

interface PropertyHighlightsProps {
  // Basic details
  bedrooms?: number;
  bathrooms?: number;
  squareMeters?: number;
  yearBuilt?: number;
  priceUsd?: number;
  expectedRoi?: number;
  // Zillow-style fields
  floors?: number;
  lotSize?: number;
  parkingSpaces?: number;
  parkingType?: string;
  heatingType?: string;
  coolingType?: string;
  laundryType?: string;
  exteriorFeatures?: string[];
  view?: string[];
  amenities?: string[];
  className?: string;
}

interface HighlightItem {
  icon: IconSvgElement;
  text: string;
  priority: number;
}

export function PropertyHighlights({
  bedrooms,
  bathrooms,
  squareMeters,
  yearBuilt,
  priceUsd,
  expectedRoi,
  floors,
  lotSize,
  parkingSpaces,
  parkingType,
  heatingType,
  coolingType,
  laundryType,
  exteriorFeatures,
  view,
  amenities,
  className,
}: PropertyHighlightsProps) {
  const t = useTranslations("properties.highlights");
  const format = useFormatter();

  // Build highlights based on available data
  const highlights: HighlightItem[] = [];

  // Large property highlight
  if (squareMeters && squareMeters >= 150) {
    highlights.push({
      icon: Square01Icon,
      text: t("spaciousLiving", { sqm: squareMeters }),
      priority: 1,
    });
  }

  // New construction
  const currentYear = new Date().getFullYear();
  if (yearBuilt && currentYear - yearBuilt <= 5) {
    highlights.push({
      icon: Building02Icon,
      text: t("newConstruction", { year: yearBuilt }),
      priority: 1,
    });
  }

  // Recently renovated (if in amenities)
  if (amenities?.includes("renovated")) {
    highlights.push({
      icon: SparklesIcon,
      text: t("recentlyRenovated"),
      priority: 2,
    });
  }

  // Good ROI
  if (expectedRoi && expectedRoi >= 7) {
    highlights.push({
      icon: Dollar02Icon,
      text: t("strongRoi", { roi: expectedRoi.toFixed(1) }),
      priority: 1,
    });
  }

  // Parking
  if (parkingSpaces && parkingSpaces >= 2) {
    highlights.push({
      icon: Car01Icon,
      text: t("ampleParkingSpaces", { count: parkingSpaces }),
      priority: 3,
    });
  } else if (parkingType === "garage") {
    highlights.push({
      icon: Car01Icon,
      text: t("garageParking"),
      priority: 3,
    });
  }

  // Central AC
  if (coolingType === "central_ac") {
    highlights.push({
      icon: AirplaneModeIcon,
      text: t("centralAC"),
      priority: 3,
    });
  }

  // Central heating
  if (heatingType === "central") {
    highlights.push({
      icon: Sun01Icon,
      text: t("centralHeating"),
      priority: 3,
    });
  }

  // In-unit laundry
  if (laundryType === "in_unit") {
    highlights.push({
      icon: Home01Icon,
      text: t("inUnitLaundry"),
      priority: 4,
    });
  }

  // Views
  if (view && view.length > 0) {
    const viewText = view.includes("sea")
      ? t("seaView")
      : view.includes("city")
        ? t("cityView")
        : view.includes("mountain")
          ? t("mountainView")
          : view.includes("garden")
            ? t("gardenView")
            : view.includes("park")
              ? t("parkView")
              : null;
    if (viewText) {
      highlights.push({
        icon: ViewIcon,
        text: viewText,
        priority: 2,
      });
    }
  }

  // Pool
  if (exteriorFeatures?.includes("pool") || amenities?.includes("pool")) {
    highlights.push({
      icon: DropletIcon,
      text: t("privatePool"),
      priority: 2,
    });
  }

  // Garden
  if (exteriorFeatures?.includes("garden") || amenities?.includes("garden")) {
    highlights.push({
      icon: FlowerIcon,
      text: t("privateGarden"),
      priority: 3,
    });
  }

  // Balcony
  if (exteriorFeatures?.includes("balcony") || amenities?.includes("balcony")) {
    highlights.push({
      icon: ViewIcon,
      text: t("balcony"),
      priority: 4,
    });
  }

  // Large lot
  if (lotSize && lotSize >= 500) {
    highlights.push({
      icon: Square01Icon,
      text: t("largeLot", { sqm: lotSize }),
      priority: 3,
    });
  }

  // Multiple floors
  if (floors && floors >= 3) {
    highlights.push({
      icon: Building02Icon,
      text: t("multipleFloors", { floors }),
      priority: 4,
    });
  }

  // Security
  if (amenities?.includes("security")) {
    highlights.push({
      icon: CheckmarkCircle01Icon,
      text: t("security"),
      priority: 4,
    });
  }

  // Safe room
  if (amenities?.includes("safeRoom")) {
    highlights.push({
      icon: Home01Icon,
      text: t("safeRoom"),
      priority: 3,
    });
  }

  // Sort by priority and take top 6
  const sortedHighlights = highlights
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 6);

  // Don't render if no highlights
  if (sortedHighlights.length === 0) {
    return null;
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <HugeiconsIcon icon={CheckmarkBadge01Icon} size={20} className="text-primary" />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sortedHighlights.map((highlight, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/10"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <HugeiconsIcon
                  icon={highlight.icon}
                  size={20}
                  strokeWidth={1.5}
                  className="text-primary"
                />
              </div>
              <p className="text-sm font-medium leading-relaxed pt-2">
                {highlight.text}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
