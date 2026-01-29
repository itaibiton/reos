"use client";

import { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Edit, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { VendorOnboardingFormData } from "@/lib/validations/vendor-onboarding";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Image from "next/image";

interface ReviewSubmitStepProps {
  form: UseFormReturn<VendorOnboardingFormData>;
  onEdit: (step: number) => void;
}

export function ReviewSubmitStep({ form, onEdit }: ReviewSubmitStepProps) {
  const t = useTranslations("vendorOnboarding");
  const { user } = useCurrentUser();
  const values = form.getValues();

  const Section = ({
    title,
    step,
    children,
  }: {
    title: string;
    step: number;
    children: React.ReactNode;
  }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onEdit(step)}
        >
          <Edit className="w-4 h-4 me-2" />
          {t("actions.edit")}
        </Button>
      </div>
      <div className="space-y-2 text-sm">{children}</div>
      <Separator />
    </div>
  );

  const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex flex-col space-y-1">
      <span className="font-medium text-muted-foreground">{label}</span>
      <span className="text-foreground">{value || "—"}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">
          {t("steps.review.title")}
        </h2>
        <p className="text-muted-foreground">
          {t("steps.review.description")}
        </p>
      </div>

      {/* Profile Photo */}
      {user?.imageUrl && (
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full border-4 border-border overflow-hidden">
            <Image
              src={user.imageUrl}
              alt="Profile"
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Basic Information */}
      <Section title={t("steps.basicInfo.title")} step={1}>
        <Field label={t("fields.fullName.label")} value={values.fullName} />
        <Field label={t("fields.email.label")} value={values.email} />
        <Field
          label={t("fields.phoneNumber.label")}
          value={values.phoneNumber}
        />
        <Field
          label={t("fields.providerType.label")}
          value={
            values.providerType
              ? t(`providerTypes.${values.providerType === "mortgage_advisor" ? "mortgageAdvisor" : values.providerType}`)
              : "—"
          }
        />
      </Section>

      {/* Professional Details */}
      <Section title={t("steps.professionalDetails.title")} step={2}>
        <Field
          label={t("fields.companyName.label")}
          value={values.companyName || t("notProvided")}
        />
        <Field
          label={t("fields.licenseNumber.label")}
          value={values.licenseNumber}
        />
        <Field
          label={t("fields.yearsExperience.label")}
          value={values.yearsExperience}
        />
        <Field
          label={t("fields.specializations.label")}
          value={
            values.specializations && values.specializations.length > 0
              ? values.specializations
                  .map((spec) =>
                    t(
                      `specializations.${values.providerType}.${spec}`
                    )
                  )
                  .join(", ")
              : "—"
          }
        />
      </Section>

      {/* Service Area & Bio */}
      <Section title={t("steps.serviceArea.title")} step={3}>
        <Field
          label={t("fields.serviceAreas.label")}
          value={
            values.serviceAreas && values.serviceAreas.length > 0
              ? values.serviceAreas.join(", ")
              : "—"
          }
        />
        <Field
          label={t("fields.languages.label")}
          value={
            values.languages && values.languages.length > 0
              ? values.languages
                  .map((lang) => {
                    const labels: Record<string, string> = {
                      english: "English",
                      hebrew: "Hebrew",
                      russian: "Russian",
                      french: "French",
                      spanish: "Spanish",
                    };
                    return labels[lang] || lang;
                  })
                  .join(", ")
              : "—"
          }
        />
        <Field label={t("fields.bio.label")} value={values.bio} />
        <Field
          label={t("fields.websiteUrl.label")}
          value={values.websiteUrl || t("notProvided")}
        />
        <Field
          label={t("fields.externalRecommendations.label")}
          value={values.externalRecommendations || t("notProvided")}
        />
      </Section>

      {/* Submission note */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start space-x-3 rtl:space-x-reverse">
        <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-900 dark:text-blue-100">
          {t("steps.review.note")}
        </p>
      </div>
    </div>
  );
}
