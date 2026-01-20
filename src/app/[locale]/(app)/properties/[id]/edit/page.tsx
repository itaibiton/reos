"use client";

import { useQuery } from "convex/react";
import { useTranslations } from "next-intl";
import { api } from "../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import { PropertyForm } from "@/components/properties/PropertyForm";
import { Spinner } from "@/components/ui/spinner";
import { Link } from "@/i18n/navigation";
import { use } from "react";

interface EditPropertyPageProps {
  params: Promise<{ id: string }>;
}

export default function EditPropertyPage({ params }: EditPropertyPageProps) {
  const t = useTranslations("properties");
  const resolvedParams = use(params);
  const propertyId = resolvedParams.id as Id<"properties">;

  const property = useQuery(api.properties.getById, { id: propertyId });

  // Loading state
  if (property === undefined) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  // Not found state
  if (property === null) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-destructive">
            {t("empty.notFound")}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t("empty.notFoundDescription")}
          </p>
          <Link
            href="/properties"
            className="text-primary hover:underline mt-4 inline-block"
          >
            {t("empty.backToProperties")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t("editTitle")}</h1>
        <p className="text-muted-foreground">
          {t("editDescription")}
        </p>
      </div>
      <PropertyForm
        mode="edit"
        propertyId={property._id}
        initialData={{
          title: property.title,
          description: property.description,
          address: property.address,
          city: property.city,
          propertyType: property.propertyType,
          status: property.status,
          priceUsd: property.priceUsd,
          priceIls: property.priceIls,
          expectedRoi: property.expectedRoi,
          cashOnCash: property.cashOnCash,
          capRate: property.capRate,
          monthlyRent: property.monthlyRent,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          squareMeters: property.squareMeters,
          yearBuilt: property.yearBuilt,
          images: property.images,
          featuredImage: property.featuredImage,
        }}
      />
    </div>
  );
}
