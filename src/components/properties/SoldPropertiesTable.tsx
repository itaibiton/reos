"use client";

import { useQuery } from "convex/react";
import { useTranslations } from "next-intl";
import { api } from "../../../convex/_generated/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";

// Format price for display
const formatUSD = (price: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
};

// Format date for display
const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

interface SoldPropertiesTableProps {
  city: string;
}

export function SoldPropertiesTable({ city }: SoldPropertiesTableProps) {
  const t = useTranslations("common.propertyTypes");
  const soldProperties = useQuery(api.properties.getSoldInCity, { city, limit: 5 });

  // Get property type label using translations
  const getPropertyTypeLabel = (value: string) => {
    const labelMap: Record<string, string> = {
      residential: t("residential"),
      commercial: t("commercial"),
      mixed_use: t("mixedUse"),
      land: t("land"),
    };
    return labelMap[value] || value;
  };

  // Loading state
  if (soldProperties === undefined) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  // Empty data state
  if (soldProperties.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        No recent sales data available for this area
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <h3 className="font-semibold p-4 pb-0">Recently Sold</h3>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Address</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-end">Size (m&sup2;)</TableHead>
          <TableHead className="text-end">Price (USD)</TableHead>
          <TableHead className="text-end">Sold Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {soldProperties.map((property) => (
          <TableRow key={property._id}>
            <TableCell>
              <Link
                href={`/properties/${property._id}`}
                className="hover:underline text-foreground"
              >
                {property.address}
              </Link>
            </TableCell>
            <TableCell>{getPropertyTypeLabel(property.propertyType)}</TableCell>
            <TableCell className="text-end">
              {property.squareMeters !== undefined
                ? property.squareMeters
                : "N/A"}
            </TableCell>
            <TableCell className="text-end">
              {formatUSD(property.soldPrice ?? property.priceUsd)}
            </TableCell>
            <TableCell className="text-end">
              {formatDate(property.soldDate ?? property.updatedAt)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    </div>
  );
}
