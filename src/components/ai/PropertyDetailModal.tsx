"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { HugeiconsIcon } from "@hugeicons/react";
import { FavouriteIcon } from "@hugeicons/core-free-icons";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { usePropertySave } from "./hooks/usePropertySave";

interface PropertyDetailModalProps {
  propertyId: Id<"properties">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PropertyDetailModal({
  propertyId,
  open,
  onOpenChange,
}: PropertyDetailModalProps) {
  // Only load property details when modal is open (skip pattern)
  const property = useQuery(
    api.properties.getById,
    open ? { id: propertyId } : "skip"
  );

  const { isSaved, isLoading: isSaveLoading, toggleSave } = usePropertySave(propertyId);

  // Show loading state
  if (open && property === undefined) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              <Skeleton className="h-6 w-48" />
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Property not found or not loaded
  if (!property) {
    return null;
  }

  // Format property type for display
  const propertyTypeLabel = property.propertyType
    .split("_")
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-start justify-between gap-4">
            <span className="flex-1">{property.title}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 shrink-0"
              onClick={toggleSave}
              disabled={isSaveLoading}
            >
              <HugeiconsIcon
                icon={FavouriteIcon}
                size={20}
                strokeWidth={1.5}
                className={isSaved ? "fill-red-500 text-red-500" : "text-muted-foreground"}
              />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Featured Image */}
          {property.featuredImage ? (
            <img
              src={property.featuredImage}
              alt={property.title}
              className="w-full h-64 object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
              No image available
            </div>
          )}

          {/* Price and Location */}
          <div>
            <div className="text-3xl font-bold mb-2">
              ${property.priceUsd.toLocaleString()}
            </div>
            <div className="text-muted-foreground">
              {property.address}, {property.city}
            </div>
            <div className="mt-2">
              <Badge variant="secondary">{propertyTypeLabel}</Badge>
            </div>
          </div>

          {/* Quick Facts */}
          <div>
            <h3 className="font-semibold mb-3">Quick Facts</h3>
            <div className="grid grid-cols-2 gap-4">
              {property.bedrooms !== undefined && (
                <div>
                  <div className="text-sm text-muted-foreground">Bedrooms</div>
                  <div className="font-medium">{property.bedrooms}</div>
                </div>
              )}
              {property.bathrooms !== undefined && (
                <div>
                  <div className="text-sm text-muted-foreground">Bathrooms</div>
                  <div className="font-medium">{property.bathrooms}</div>
                </div>
              )}
              {property.squareMeters !== undefined && (
                <div>
                  <div className="text-sm text-muted-foreground">Size</div>
                  <div className="font-medium">{property.squareMeters} m²</div>
                </div>
              )}
              {property.yearBuilt !== undefined && (
                <div>
                  <div className="text-sm text-muted-foreground">Year Built</div>
                  <div className="font-medium">{property.yearBuilt}</div>
                </div>
              )}
            </div>
          </div>

          {/* Investment Metrics */}
          {(property.expectedRoi !== undefined ||
            property.capRate !== undefined ||
            property.monthlyRent !== undefined) && (
            <div>
              <h3 className="font-semibold mb-3">Investment Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                {property.expectedRoi !== undefined && (
                  <div>
                    <div className="text-sm text-muted-foreground">Expected ROI</div>
                    <div className="font-medium">{property.expectedRoi}%</div>
                  </div>
                )}
                {property.capRate !== undefined && (
                  <div>
                    <div className="text-sm text-muted-foreground">Cap Rate</div>
                    <div className="font-medium">{property.capRate}%</div>
                  </div>
                )}
                {property.monthlyRent !== undefined && (
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Monthly Rent
                    </div>
                    <div className="font-medium">
                      ${property.monthlyRent.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          {property.description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {property.description}
              </p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Link href={`/properties/${property._id}`}>
              <Button>View Full Details</Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
