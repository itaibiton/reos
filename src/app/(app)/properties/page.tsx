"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";

export default function PropertiesPage() {
  const properties = useQuery(api.properties.list, {});

  // Loading state
  if (properties === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Properties</h1>
          <p className="text-muted-foreground mt-1">
            {properties.length} {properties.length === 1 ? "property" : "properties"} available
          </p>
        </div>
        <Link href="/properties/new">
          <Button>Add Property</Button>
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No properties yet.</p>
          <Link href="/properties/new">
            <Button className="mt-4">Add Your First Property</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div
              key={property._id}
              className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              {property.featuredImage && (
                <div className="aspect-video bg-muted relative">
                  <img
                    src={property.featuredImage}
                    alt={property.title}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold truncate">{property.title}</h3>
                <p className="text-sm text-muted-foreground">{property.city}</p>
                <p className="text-lg font-bold mt-2">
                  ${property.priceUsd.toLocaleString()}
                </p>
                {property.bedrooms && property.bathrooms && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {property.bedrooms} bed, {property.bathrooms} bath
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
