"use client";

import { useQuery } from "convex/react";
import { useTranslations } from "next-intl";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface ProfileCompletenessCardProps {
  className?: string;
}

type QuestionnaireData = {
  citizenship?: string;
  residencyStatus?: string;
  experienceLevel?: string;
  ownsPropertyInIsrael?: boolean;
  investmentType?: string;
  budgetMin?: number;
  budgetMax?: number;
  investmentHorizon?: string;
  investmentGoals?: string[];
  yieldPreference?: string;
  financingApproach?: string;
  preferredPropertyTypes?: string[];
  preferredLocations?: string[];
  purchaseTimeline?: string;
  servicesNeeded?: string[];
};

// Field keys for completeness calculation
const COMPLETENESS_FIELDS: { key: keyof QuestionnaireData; labelKey: string }[] = [
  { key: "citizenship", labelKey: "citizenship" },
  { key: "residencyStatus", labelKey: "residencyStatus" },
  { key: "experienceLevel", labelKey: "experienceLevel" },
  { key: "ownsPropertyInIsrael", labelKey: "propertyOwnership" },
  { key: "investmentType", labelKey: "investmentType" },
  { key: "budgetMin", labelKey: "budget" },
  { key: "budgetMax", labelKey: "budget" },
  { key: "investmentHorizon", labelKey: "investmentHorizon" },
  { key: "investmentGoals", labelKey: "investmentGoals" },
  { key: "yieldPreference", labelKey: "yieldPreference" },
  { key: "financingApproach", labelKey: "financingApproach" },
  { key: "preferredPropertyTypes", labelKey: "propertyTypes" },
  { key: "preferredLocations", labelKey: "preferredLocations" },
  { key: "purchaseTimeline", labelKey: "purchaseTimeline" },
  { key: "servicesNeeded", labelKey: "servicesNeeded" },
];

function calculateCompleteness(
  q: QuestionnaireData | null,
  t: (key: string) => string
): { percent: number; missing: string[] } {
  if (!q) return { percent: 0, missing: [t("fields.notStarted")] };

  const missing: string[] = [];
  let filled = 0;

  for (const { key, labelKey } of COMPLETENESS_FIELDS) {
    const value = q[key];
    const isFilled = value !== undefined && value !== null &&
      (Array.isArray(value) ? value.length > 0 : true);
    const label = t(`fields.${labelKey}`);
    if (isFilled) {
      filled++;
    } else if (!missing.includes(label)) {
      missing.push(label);
    }
  }

  return { percent: Math.round((filled / COMPLETENESS_FIELDS.length) * 100), missing };
}

export function ProfileCompletenessCard({ className }: ProfileCompletenessCardProps) {
  const t = useTranslations("settings.profile");
  const tCompleteness = useTranslations("profile.completeness");
  const questionnaire = useQuery(api.investorQuestionnaires.getByUser);

  // Loading state
  if (questionnaire === undefined) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle>{t("completeness")}</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-4">
          <Spinner className="h-6 w-6" />
        </CardContent>
      </Card>
    );
  }

  const { percent, missing } = calculateCompleteness(questionnaire, tCompleteness);
  const isComplete = percent === 100;

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle>{t("completeness")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-2">
          <Progress value={percent} className="h-2" />
          <p className="text-sm font-medium">
            {percent}{t("complete")}
          </p>
        </div>

        {/* Missing fields list */}
        {!isComplete && missing.length > 0 && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">{t("missing")} </span>
            {missing.join(", ")}
          </div>
        )}

        {/* Edit link */}
        <Button asChild variant={isComplete ? "outline" : "default"} className="w-full">
          <Link href="/onboarding/questionnaire">
            {isComplete ? t("reviewProfile") : t("completeProfile")}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
