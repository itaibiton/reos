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

function calculateCompleteness(q: QuestionnaireData | null): { percent: number; missing: string[] } {
  if (!q) return { percent: 0, missing: ["Not started"] };

  // Required fields for completeness calculation
  const fields: { key: keyof QuestionnaireData; label: string }[] = [
    { key: "citizenship", label: "Citizenship" },
    { key: "residencyStatus", label: "Residency Status" },
    { key: "experienceLevel", label: "Experience Level" },
    { key: "ownsPropertyInIsrael", label: "Property Ownership" },
    { key: "investmentType", label: "Investment Type" },
    { key: "budgetMin", label: "Budget" },
    { key: "budgetMax", label: "Budget" },
    { key: "investmentHorizon", label: "Investment Horizon" },
    { key: "investmentGoals", label: "Investment Goals" },
    { key: "yieldPreference", label: "Yield Preference" },
    { key: "financingApproach", label: "Financing Approach" },
    { key: "preferredPropertyTypes", label: "Property Types" },
    { key: "preferredLocations", label: "Preferred Locations" },
    { key: "purchaseTimeline", label: "Purchase Timeline" },
    { key: "servicesNeeded", label: "Services Needed" },
  ];

  const missing: string[] = [];
  let filled = 0;

  for (const { key, label } of fields) {
    const value = q[key];
    const isFilled = value !== undefined && value !== null &&
      (Array.isArray(value) ? value.length > 0 : true);
    if (isFilled) {
      filled++;
    } else if (!missing.includes(label)) {
      missing.push(label);
    }
  }

  return { percent: Math.round((filled / fields.length) * 100), missing };
}

export function ProfileCompletenessCard({ className }: ProfileCompletenessCardProps) {
  const t = useTranslations("settings.profile");
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

  const { percent, missing } = calculateCompleteness(questionnaire);
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
          <Link href="/profile/investor/questionnaire">
            {isComplete ? t("reviewProfile") : t("completeProfile")}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
