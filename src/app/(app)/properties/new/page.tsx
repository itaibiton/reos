"use client";

import { PropertyForm } from "@/components/properties/PropertyForm";

export default function NewPropertyPage() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Add New Property</h1>
        <p className="text-muted-foreground mt-1">
          Create a new property listing for investors to browse.
        </p>
      </div>
      <PropertyForm />
    </div>
  );
}
