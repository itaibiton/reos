"use client";

import { useQuery } from "convex/react";
import { useTranslations, useFormatter } from "next-intl";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

interface InvestorQuestionnaireCardProps {
  investorId: Id<"users">;
}

// Key mappings from snake_case database values to camelCase translation keys
// Format currency helper (using useFormatter inside the component)
// We define this interface to match the Intl.NumberFormat options used

const VALUE_KEY_MAPPINGS: Record<string, Record<string, string>> = {
  citizenship: {
    israeli: "israeli",
    non_israeli: "nonIsraeli",
  },
  residencyStatus: {
    resident: "resident",
    returning_resident: "returningResident",
    non_resident: "nonResident",
    unsure: "unsure",
  },
  experienceLevel: {
    none: "none",
    some: "some",
    experienced: "experienced",
  },
  investmentType: {
    residential: "residential",
    investment: "investment",
  },
  investmentHorizon: {
    short_term: "shortTerm",
    medium_term: "mediumTerm",
    long_term: "longTerm",
  },
  yieldPreference: {
    rental_yield: "rentalYield",
    appreciation: "appreciation",
    balanced: "balanced",
  },
  financingApproach: {
    cash: "cash",
    mortgage: "mortgage",
    exploring: "exploring",
  },
  purchaseTimeline: {
    "3_months": "threeMonths",
    "6_months": "sixMonths",
    "1_year": "oneYear",
    exploring: "exploring",
  },
  locationFlexibility: {
    flexible: "flexible",
    specific: "specific",
    nearby_cities: "nearbyCities",
  },
  goals: {
    appreciation: "appreciation",
    rental_income: "rentalIncome",
    diversification: "diversification",
    tax_benefits: "taxBenefits",
  },
  services: {
    broker: "broker",
    mortgage_advisor: "mortgageAdvisor",
    lawyer: "lawyer",
  },
  propertyTypes: {
    residential: "residential",
    commercial: "commercial",
    mixed_use: "mixedUse",
    land: "land",
  },
  amenities: {
    parking: "parking",
    elevator: "elevator",
    balcony: "balcony",
    garden: "garden",
    pool: "pool",
    gym: "gym",
    storage: "storage",
    security: "security",
    mamad: "mamad",
    central_ac: "centralAc",
    renovated: "renovated",
    furnished: "furnished",
  },
};

// Field display component
function Field({
  label,
  value,
  fallback,
}: {
  label: string;
  value: string | React.ReactNode;
  fallback: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value || fallback}</p>
    </div>
  );
}

// Section component
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-primary">{title}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

export function InvestorQuestionnaireCard({
  investorId,
}: InvestorQuestionnaireCardProps) {
  const t = useTranslations("deals.questionnaire");
  const format = useFormatter();
  const questionnaire = useQuery(api.investorQuestionnaires.getByInvestorId, {
    investorId,
  });

  // Helper function to format currency using the locale-aware formatter
  const formatUSD = (amount: number): string => {
    return format.number(amount, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  };

  // Helper to get translated label for a value
  const getLabel = (category: string, value: string): string => {
    if (!value) return t("values.notSpecified");
    const keyMapping = VALUE_KEY_MAPPINGS[category];
    const key = keyMapping?.[value] || value;
    // Try to get translation, fallback to value itself
    const translationKey = `${category}.${key}`;
    try {
      return t(translationKey);
    } catch {
      return value;
    }
  };

  // Format array values with labels
  const formatArray = (values: string[] | undefined, category: string): string => {
    if (!values || values.length === 0) return t("values.notSpecified");
    return values.map((v) => getLabel(category, v)).join(", ");
  };

  // Loading state
  if (questionnaire === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // No profile or unauthorized
  if (questionnaire === null) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t("noProfile")}</p>
        </CardContent>
      </Card>
    );
  }

  // Format budget range using translations
  const getBudgetRange = () => {
    if (questionnaire.budgetMin && questionnaire.budgetMax) {
      return t("values.range", {
        min: formatUSD(questionnaire.budgetMin),
        max: formatUSD(questionnaire.budgetMax)
      });
    }
    if (questionnaire.budgetMin) {
      return t("values.from", { amount: formatUSD(questionnaire.budgetMin) });
    }
    if (questionnaire.budgetMax) {
      return t("values.upTo", { amount: formatUSD(questionnaire.budgetMax) });
    }
    return t("values.notSpecified");
  };

  // Format bedroom range using translations
  const getBedroomRange = () => {
    if (questionnaire.minBedrooms !== undefined && questionnaire.maxBedrooms !== undefined) {
      return t("values.bedroomsRange", { min: questionnaire.minBedrooms, max: questionnaire.maxBedrooms });
    }
    if (questionnaire.minBedrooms !== undefined) {
      return t("values.bedroomsMin", { min: questionnaire.minBedrooms });
    }
    if (questionnaire.maxBedrooms !== undefined) {
      return t("values.bedroomsMax", { max: questionnaire.maxBedrooms });
    }
    return null;
  };

  // Format area range using translations
  const getAreaRange = () => {
    if (questionnaire.minArea !== undefined && questionnaire.maxArea !== undefined) {
      return t("values.areaRange", { min: questionnaire.minArea, max: questionnaire.maxArea });
    }
    if (questionnaire.minArea !== undefined) {
      return t("values.areaMin", { min: questionnaire.minArea });
    }
    if (questionnaire.maxArea !== undefined) {
      return t("values.areaMax", { max: questionnaire.maxArea });
    }
    return null;
  };

  const budgetRange = getBudgetRange();
  const bedroomRange = getBedroomRange();
  const areaRange = getAreaRange();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Background Section */}
        <Section title={t("sections.background")}>
          <Field
            label={t("fields.citizenship")}
            value={getLabel("citizenship", questionnaire.citizenship || "")}
            fallback={t("values.notSpecified")}
          />
          <Field
            label={t("fields.residencyStatus")}
            value={getLabel("residencyStatus", questionnaire.residencyStatus || "")}
            fallback={t("values.notSpecified")}
          />
          <Field
            label={t("fields.investmentExperience")}
            value={getLabel("experienceLevel", questionnaire.experienceLevel || "")}
            fallback={t("values.notSpecified")}
          />
          <Field
            label={t("fields.ownsProperty")}
            value={
              questionnaire.ownsPropertyInIsrael !== undefined
                ? questionnaire.ownsPropertyInIsrael
                  ? t("values.yes")
                  : t("values.no")
                : t("values.notSpecified")
            }
            fallback={t("values.notSpecified")}
          />
        </Section>

        <Separator />

        {/* Investment Preferences Section */}
        <Section title={t("sections.investmentPreferences")}>
          <Field
            label={t("fields.investmentType")}
            value={getLabel("investmentType", questionnaire.investmentType || "")}
            fallback={t("values.notSpecified")}
          />
          <Field
            label={t("fields.budgetRange")}
            value={budgetRange}
            fallback={t("values.notSpecified")}
          />
          <Field
            label={t("fields.investmentHorizon")}
            value={getLabel("investmentHorizon", questionnaire.investmentHorizon || "")}
            fallback={t("values.notSpecified")}
          />
          <Field
            label={t("fields.goals")}
            value={formatArray(questionnaire.investmentGoals, "goals")}
            fallback={t("values.notSpecified")}
          />
          <Field
            label={t("fields.yieldPreference")}
            value={getLabel("yieldPreference", questionnaire.yieldPreference || "")}
            fallback={t("values.notSpecified")}
          />
          <Field
            label={t("fields.financingApproach")}
            value={getLabel("financingApproach", questionnaire.financingApproach || "")}
            fallback={t("values.notSpecified")}
          />
        </Section>

        <Separator />

        {/* Property Preferences Section */}
        <Section title={t("sections.propertyPreferences")}>
          <Field
            label={t("fields.propertyTypes")}
            value={formatArray(questionnaire.preferredPropertyTypes, "propertyTypes")}
            fallback={t("values.notSpecified")}
          />
          <Field
            label={t("fields.locations")}
            value={
              questionnaire.preferredLocations?.length
                ? questionnaire.preferredLocations.join(", ")
                : t("values.notSpecified")
            }
            fallback={t("values.notSpecified")}
          />
          {(bedroomRange || areaRange) && (
            <Field
              label={t("fields.size")}
              value={[bedroomRange, areaRange].filter(Boolean).join(", ")}
              fallback={t("values.notSpecified")}
            />
          )}
          <Field
            label={t("fields.amenities")}
            value={formatArray(questionnaire.preferredAmenities, "amenities")}
            fallback={t("values.notSpecified")}
          />
          {questionnaire.locationFlexibility && (
            <Field
              label={t("fields.locationFlexibility")}
              value={getLabel("locationFlexibility", questionnaire.locationFlexibility)}
              fallback={t("values.notSpecified")}
            />
          )}
        </Section>

        <Separator />

        {/* Timeline & Services Section */}
        <Section title={t("sections.timelineServices")}>
          <Field
            label={t("fields.purchaseTimeline")}
            value={getLabel("purchaseTimeline", questionnaire.purchaseTimeline || "")}
            fallback={t("values.notSpecified")}
          />
          <Field
            label={t("fields.servicesNeeded")}
            value={formatArray(questionnaire.servicesNeeded, "services")}
            fallback={t("values.notSpecified")}
          />
          {questionnaire.additionalPreferences && (
            <div className="col-span-full">
              <Field
                label={t("fields.additionalPreferences")}
                value={questionnaire.additionalPreferences}
                fallback={t("values.notSpecified")}
              />
            </div>
          )}
        </Section>
      </CardContent>
    </Card>
  );
}
