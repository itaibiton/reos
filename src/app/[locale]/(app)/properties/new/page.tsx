"use client";

import { PropertyForm } from "@/components/properties/PropertyForm";

export default function NewPropertyPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Add New Property</h1>
        <p className="text-muted-foreground">
          Create a new property listing for investors to browse.
        </p>
      </div>
      <PropertyForm />
    </div>
  );
}
