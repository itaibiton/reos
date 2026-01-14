"use client";

import { useQuery } from "convex/react";
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
import { PROPERTY_TYPES } from "@/lib/constants";
import Link from "next/link";

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

// Get property type label
const getPropertyTypeLabel = (value: string) => {
  const type = PROPERTY_TYPES.find((t) => t.value === value);
  return type?.label || value;
};

interface SoldPropertiesTableProps {
  city: string;
}

export function SoldPropertiesTable({ city }: SoldPropertiesTableProps) {
  const soldProperties = useQuery(api.properties.getSoldInCity, { city, limit: 5 });

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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Address</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Size (m&sup2;)</TableHead>
          <TableHead className="text-right">Price (USD)</TableHead>
          <TableHead className="text-right">Sold Date</TableHead>
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
            <TableCell className="text-right">
              {property.squareMeters !== undefined
                ? property.squareMeters
                : "N/A"}
            </TableCell>
            <TableCell className="text-right">
              {formatUSD(property.soldPrice ?? property.priceUsd)}
            </TableCell>
            <TableCell className="text-right">
              {formatDate(property.soldDate ?? property.updatedAt)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
