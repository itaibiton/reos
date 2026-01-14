"use client";

import { PROPERTY_AMENITIES } from "@/lib/constants";
import { HugeiconsIcon, IconSvgElement } from "@hugeicons/react";
import {
  Fan01Icon,
  Stairs01Icon,
  Car01Icon,
  Package01Icon,
  Door01Icon,
  Shield01Icon,
  Dumbbell01Icon,
  SwimmingIcon,
  Tree01Icon,
  PaintBrush01Icon,
  Sofa01Icon,
  Leaf01Icon,
  WheelchairIcon,
  SafeIcon,
  Sun01Icon,
} from "@hugeicons/core-free-icons";

// Map amenity values to their corresponding Hugeicons
const AMENITY_ICONS: Record<string, IconSvgElement> = {
  airConditioning: Fan01Icon,
  elevator: Stairs01Icon,
  parking: Car01Icon,
  storage: Package01Icon,
  balcony: Door01Icon,
  security: Shield01Icon,
  gym: Dumbbell01Icon,
  pool: SwimmingIcon,
  garden: Tree01Icon,
  renovated: PaintBrush01Icon,
  furnished: Sofa01Icon,
  petFriendly: Leaf01Icon,
  accessible: WheelchairIcon,
  safeRoom: SafeIcon,
  solar: Sun01Icon,
};

interface PropertyAmenitiesProps {
  amenities?: string[];
}

export function PropertyAmenities({ amenities }: PropertyAmenitiesProps) {
  // Handle empty amenities
  if (!amenities || amenities.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">No amenities listed</p>
    );
  }

  // Map amenity keys to their details
  const amenityDetails = amenities
    .map((amenityKey) => {
      const amenityInfo = PROPERTY_AMENITIES.find((a) => a.value === amenityKey);
      const icon = AMENITY_ICONS[amenityKey];
      return amenityInfo && icon
        ? { key: amenityKey, label: amenityInfo.label, icon }
        : null;
    })
    .filter(Boolean) as Array<{
      key: string;
      label: string;
      icon: IconSvgElement;
    }>;

  // If no valid amenities found after mapping
  if (amenityDetails.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">No amenities listed</p>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {amenityDetails.map((amenity) => (
        <div
          key={amenity.key}
          className="flex items-center gap-2 p-2 rounded-md bg-muted/50"
        >
          <HugeiconsIcon
            icon={amenity.icon}
            size={18}
            strokeWidth={1.5}
            className="text-muted-foreground shrink-0"
          />
          <span className="text-sm">{amenity.label}</span>
        </div>
      ))}
    </div>
  );
}
