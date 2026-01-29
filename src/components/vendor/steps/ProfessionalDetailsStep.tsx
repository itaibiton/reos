"use client";

import { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Building2, FileText, Clock, Tag } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { VendorOnboardingFormData } from "@/lib/validations/vendor-onboarding";

interface ProfessionalDetailsStepProps {
  form: UseFormReturn<VendorOnboardingFormData>;
}

const SPECIALIZATION_OPTIONS: Record<string, string[]> = {
  broker: [
    "residential",
    "commercial",
    "luxury",
    "newConstruction",
    "investmentProperties",
    "land",
  ],
  mortgage_advisor: [
    "firstTimeBuyers",
    "investmentLoans",
    "refinancing",
    "commercialMortgages",
    "internationalBuyers",
  ],
  lawyer: [
    "realEstateTransactions",
    "propertyLaw",
    "commercialRealEstate",
    "landlordTenant",
    "zoningLandUse",
  ],
};

export function ProfessionalDetailsStep({ form }: ProfessionalDetailsStepProps) {
  const t = useTranslations("vendorOnboarding");
  const providerType = form.watch("providerType");

  const specializationOptions =
    SPECIALIZATION_OPTIONS[providerType || "broker"] || [];

  const handleSpecializationToggle = (
    value: string,
    checked: boolean | "indeterminate"
  ) => {
    const current = form.getValues("specializations") || [];
    if (checked === true) {
      form.setValue("specializations", [...current, value]);
    } else {
      form.setValue(
        "specializations",
        current.filter((v) => v !== value)
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">
          {t("steps.professionalDetails.title")}
        </h2>
        <p className="text-muted-foreground">
          {t("steps.professionalDetails.description")}
        </p>
      </div>

      {/* Company Name */}
      <FormField
        control={form.control}
        name="companyName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              {t("fields.companyName.label")}
              <span className="text-muted-foreground text-xs">
                ({t("optional")})
              </span>
            </FormLabel>
            <FormControl>
              <Input
                placeholder={t("fields.companyName.placeholder")}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* License Number */}
      <FormField
        control={form.control}
        name="licenseNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              {t("fields.licenseNumber.label")}
            </FormLabel>
            <FormControl>
              <Input
                placeholder={t("fields.licenseNumber.placeholder")}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Years Experience */}
      <FormField
        control={form.control}
        name="yearsExperience"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              {t("fields.yearsExperience.label")}
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                min="0"
                max="50"
                placeholder="0"
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Specializations */}
      <FormField
        control={form.control}
        name="specializations"
        render={() => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              {t("fields.specializations.label")}
            </FormLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              {specializationOptions.map((spec) => (
                <div key={spec} className="flex items-start space-x-2 rtl:space-x-reverse">
                  <Checkbox
                    id={spec}
                    checked={form.watch("specializations")?.includes(spec)}
                    onCheckedChange={(checked) =>
                      handleSpecializationToggle(spec, checked)
                    }
                  />
                  <label
                    htmlFor={spec}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {t(`specializations.${providerType}.${spec}`)}
                  </label>
                </div>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
