"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { FavouriteIcon } from "@hugeicons/core-free-icons";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Id } from "../../../convex/_generated/dataModel";
import { PropertyDetailModal } from "./PropertyDetailModal";
import { usePropertySave } from "./hooks/usePropertySave";

export interface PropertyData {
  _id: Id<"properties">;
  title: string;
  city: string;
  address: string;
  priceUsd: number;
  bedrooms?: number;
  bathrooms?: number;
  squareMeters?: number;
  propertyType: "residential" | "commercial" | "mixed_use" | "land";
  featuredImage?: string;
}

export interface SearchCriteria {
  budgetMin?: number;
  budgetMax?: number;
  cities?: string[];
  propertyTypes?: ("residential" | "commercial" | "mixed_use" | "land")[];
  minBedrooms?: number;
}

interface PropertyRecommendationCardProps {
  property: PropertyData;
  searchCriteria?: SearchCriteria;
}

export function PropertyRecommendationCard({
  property,
  searchCriteria,
}: PropertyRecommendationCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { isSaved, isLoading, toggleSave } = usePropertySave(property._id);

  // Compute match badges based on search criteria
  const badges: string[] = [];

  if (searchCriteria) {
    // Budget match
    if (
      searchCriteria.budgetMin !== undefined &&
      searchCriteria.budgetMax !== undefined
    ) {
      if (
        property.priceUsd >= searchCriteria.budgetMin &&
        property.priceUsd <= searchCriteria.budgetMax
      ) {
        badges.push("Budget");
      }
    }

    // Location match
    if (searchCriteria.cities && searchCriteria.cities.includes(property.city)) {
      badges.push("Location");
    }

    // Property type match
    if (
      searchCriteria.propertyTypes &&
      searchCriteria.propertyTypes.includes(property.propertyType)
    ) {
      badges.push("Property Type");
    }
  } else {
    // Fallback: show city and property type if no search criteria
    badges.push(property.city);
    badges.push(
      property.propertyType
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    );
  }

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleSave();
  };

  return (
    <>
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setModalOpen(true)}
      >
        <CardContent className="p-4">
          <div className="flex gap-3">
            {/* Thumbnail */}
            <div className="shrink-0">
              {property.featuredImage ? (
                <img
                  src={property.featuredImage}
                  alt={property.title}
                  className="w-20 h-20 object-cover rounded"
                />
              ) : (
                <div className="w-20 h-20 bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">
                  No image
                </div>
              )}
            </div>

            {/* Property info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-semibold text-sm truncate">
                  {property.title}
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 shrink-0"
                  onClick={handleSaveClick}
                  disabled={isLoading}
                >
                  <HugeiconsIcon
                    icon={FavouriteIcon}
                    size={16}
                    strokeWidth={1.5}
                    className={isSaved ? "fill-red-500 text-red-500" : "text-muted-foreground"}
                  />
                </Button>
              </div>

              <p className="text-xs text-muted-foreground truncate mb-2">
                {property.address}
              </p>

              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-bold text-sm">
                  ${property.priceUsd.toLocaleString()}
                </span>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  {property.bedrooms !== undefined && (
                    <span>{property.bedrooms} bed</span>
                  )}
                  {property.bathrooms !== undefined && (
                    <span>{property.bathrooms} bath</span>
                  )}
                  {property.squareMeters !== undefined && (
                    <span>{property.squareMeters} m²</span>
                  )}
                </div>
              </div>

              {/* Match badges */}
              <div className="flex gap-1 flex-wrap">
                {badges.map((badge) => (
                  <Badge
                    key={badge}
                    variant="secondary"
                    className="text-xs px-1.5 py-0"
                  >
                    {badge}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <PropertyDetailModal
        propertyId={property._id}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}
