"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

interface InvestorQuestionnaireCardProps {
  investorId: Id<"users">;
}

// Label mappings for questionnaire values
const QUESTIONNAIRE_LABELS: Record<string, Record<string, string>> = {
  citizenship: {
    israeli: "Israeli Citizen",
    non_israeli: "Non-Israeli Citizen",
  },
  residencyStatus: {
    resident: "Israeli Resident",
    returning_resident: "Returning Resident",
    non_resident: "Non-Resident",
    unsure: "Unsure",
  },
  experienceLevel: {
    none: "No experience",
    some: "Some experience",
    experienced: "Experienced investor",
  },
  investmentType: {
    residential: "Residential (for living)",
    investment: "Investment property",
  },
  investmentHorizon: {
    short_term: "Short-term (< 2 years)",
    medium_term: "Medium-term (2-5 years)",
    long_term: "Long-term (5+ years)",
  },
  yieldPreference: {
    rental_yield: "Rental yield focus",
    appreciation: "Appreciation focus",
    balanced: "Balanced approach",
  },
  financingApproach: {
    cash: "Cash purchase",
    mortgage: "Mortgage financing",
    exploring: "Still exploring",
  },
  purchaseTimeline: {
    "3_months": "Within 3 months",
    "6_months": "Within 6 months",
    "1_year": "Within 1 year",
    exploring: "Just exploring",
  },
  locationFlexibility: {
    flexible: "Flexible on location",
    specific: "Specific locations only",
    nearby_cities: "Open to nearby cities",
  },
  // Goals (array items)
  goals: {
    appreciation: "Capital appreciation",
    rental_income: "Rental income",
    diversification: "Portfolio diversification",
    tax_benefits: "Tax benefits",
  },
  // Services (array items)
  services: {
    broker: "Real Estate Broker",
    mortgage_advisor: "Mortgage Advisor",
    lawyer: "Lawyer",
  },
  // Property types (array items)
  propertyTypes: {
    residential: "Residential",
    commercial: "Commercial",
    mixed_use: "Mixed Use",
    land: "Land",
  },
  // Amenities (array items)
  amenities: {
    parking: "Parking",
    elevator: "Elevator",
    balcony: "Balcony",
    garden: "Garden",
    pool: "Pool",
    gym: "Gym",
    storage: "Storage Room",
    security: "24/7 Security",
    mamad: "Safe Room (Mamad)",
    central_ac: "Central A/C",
    renovated: "Newly Renovated",
    furnished: "Furnished",
  },
};

// Helper to get label or return raw value
function getLabel(category: string, value: string): string {
  return QUESTIONNAIRE_LABELS[category]?.[value] || value;
}

// Format currency
function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format array values with labels
function formatArray(
  values: string[] | undefined,
  category: string
): string {
  if (!values || values.length === 0) return "Not specified";
  return values.map((v) => getLabel(category, v)).join(", ");
}

// Field display component
function Field({
  label,
  value,
}: {
  label: string;
  value: string | React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value || "Not specified"}</p>
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
  const questionnaire = useQuery(api.investorQuestionnaires.getByInvestorId, {
    investorId,
  });

  // Loading state
  if (questionnaire === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Investor Profile</CardTitle>
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
          <CardTitle>Investor Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No profile available</p>
        </CardContent>
      </Card>
    );
  }

  // Format budget range
  const budgetRange =
    questionnaire.budgetMin && questionnaire.budgetMax
      ? `${formatUSD(questionnaire.budgetMin)} - ${formatUSD(questionnaire.budgetMax)}`
      : questionnaire.budgetMin
        ? `From ${formatUSD(questionnaire.budgetMin)}`
        : questionnaire.budgetMax
          ? `Up to ${formatUSD(questionnaire.budgetMax)}`
          : "Not specified";

  // Format size range
  const bedroomRange =
    questionnaire.minBedrooms !== undefined &&
    questionnaire.maxBedrooms !== undefined
      ? `${questionnaire.minBedrooms} - ${questionnaire.maxBedrooms} bedrooms`
      : questionnaire.minBedrooms !== undefined
        ? `${questionnaire.minBedrooms}+ bedrooms`
        : questionnaire.maxBedrooms !== undefined
          ? `Up to ${questionnaire.maxBedrooms} bedrooms`
          : null;

  const areaRange =
    questionnaire.minArea !== undefined && questionnaire.maxArea !== undefined
      ? `${questionnaire.minArea} - ${questionnaire.maxArea} sqm`
      : questionnaire.minArea !== undefined
        ? `${questionnaire.minArea}+ sqm`
        : questionnaire.maxArea !== undefined
          ? `Up to ${questionnaire.maxArea} sqm`
          : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Investor Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Background Section */}
        <Section title="Background">
          <Field
            label="Citizenship"
            value={getLabel("citizenship", questionnaire.citizenship || "")}
          />
          <Field
            label="Residency Status"
            value={getLabel(
              "residencyStatus",
              questionnaire.residencyStatus || ""
            )}
          />
          <Field
            label="Investment Experience"
            value={getLabel(
              "experienceLevel",
              questionnaire.experienceLevel || ""
            )}
          />
          <Field
            label="Owns Property in Israel"
            value={
              questionnaire.ownsPropertyInIsrael !== undefined
                ? questionnaire.ownsPropertyInIsrael
                  ? "Yes"
                  : "No"
                : "Not specified"
            }
          />
        </Section>

        <Separator />

        {/* Investment Preferences Section */}
        <Section title="Investment Preferences">
          <Field
            label="Investment Type"
            value={getLabel(
              "investmentType",
              questionnaire.investmentType || ""
            )}
          />
          <Field label="Budget Range" value={budgetRange} />
          <Field
            label="Investment Horizon"
            value={getLabel(
              "investmentHorizon",
              questionnaire.investmentHorizon || ""
            )}
          />
          <Field
            label="Goals"
            value={formatArray(questionnaire.investmentGoals, "goals")}
          />
          <Field
            label="Yield Preference"
            value={getLabel(
              "yieldPreference",
              questionnaire.yieldPreference || ""
            )}
          />
          <Field
            label="Financing Approach"
            value={getLabel(
              "financingApproach",
              questionnaire.financingApproach || ""
            )}
          />
        </Section>

        <Separator />

        {/* Property Preferences Section */}
        <Section title="Property Preferences">
          <Field
            label="Property Types"
            value={formatArray(
              questionnaire.preferredPropertyTypes,
              "propertyTypes"
            )}
          />
          <Field
            label="Locations"
            value={
              questionnaire.preferredLocations?.length
                ? questionnaire.preferredLocations.join(", ")
                : "Not specified"
            }
          />
          {(bedroomRange || areaRange) && (
            <Field
              label="Size"
              value={[bedroomRange, areaRange].filter(Boolean).join(", ")}
            />
          )}
          <Field
            label="Amenities"
            value={formatArray(questionnaire.preferredAmenities, "amenities")}
          />
          {questionnaire.locationFlexibility && (
            <Field
              label="Location Flexibility"
              value={getLabel(
                "locationFlexibility",
                questionnaire.locationFlexibility
              )}
            />
          )}
        </Section>

        <Separator />

        {/* Timeline & Services Section */}
        <Section title="Timeline & Services">
          <Field
            label="Purchase Timeline"
            value={getLabel(
              "purchaseTimeline",
              questionnaire.purchaseTimeline || ""
            )}
          />
          <Field
            label="Services Needed"
            value={formatArray(questionnaire.servicesNeeded, "services")}
          />
          {questionnaire.additionalPreferences && (
            <div className="col-span-full">
              <Field
                label="Additional Preferences"
                value={questionnaire.additionalPreferences}
              />
            </div>
          )}
        </Section>
      </CardContent>
    </Card>
  );
}
