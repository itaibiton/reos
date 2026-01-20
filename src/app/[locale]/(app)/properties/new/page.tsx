"use client";

import { useTranslations } from "next-intl";
import { PropertyForm } from "@/components/properties/PropertyForm";

export default function NewPropertyPage() {
  const t = useTranslations("properties");

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t("newTitle")}</h1>
        <p className="text-muted-foreground">
          {t("newDescription")}
        </p>
      </div>
      <PropertyForm />
    </div>
  );
}
