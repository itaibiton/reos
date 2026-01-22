"use client";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useCallback, useMemo } from "react";

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

interface ProfileCompletenessBarProps {
  questionnaire: QuestionnaireData | null;
  onJumpToIncomplete?: (sectionId: string) => void;
}

// Field keys for completeness calculation
const COMPLETENESS_FIELDS: {
  key: keyof QuestionnaireData;
  labelKey: string;
  sectionId: string;
}[] = [
  { key: "citizenship", labelKey: "citizenship", sectionId: "basics" },
  { key: "residencyStatus", labelKey: "residencyStatus", sectionId: "basics" },
  {
    key: "experienceLevel",
    labelKey: "experienceLevel",
    sectionId: "basics",
  },
  {
    key: "ownsPropertyInIsrael",
    labelKey: "propertyOwnership",
    sectionId: "basics",
  },
  { key: "investmentType", labelKey: "investmentType", sectionId: "basics" },
  { key: "budgetMin", labelKey: "budget", sectionId: "financial" },
  { key: "budgetMax", labelKey: "budget", sectionId: "financial" },
  {
    key: "investmentHorizon",
    labelKey: "investmentHorizon",
    sectionId: "financial",
  },
  {
    key: "investmentGoals",
    labelKey: "investmentGoals",
    sectionId: "financial",
  },
  {
    key: "yieldPreference",
    labelKey: "yieldPreference",
    sectionId: "financial",
  },
  {
    key: "financingApproach",
    labelKey: "financingApproach",
    sectionId: "financial",
  },
  {
    key: "preferredPropertyTypes",
    labelKey: "propertyTypes",
    sectionId: "preferences",
  },
  {
    key: "preferredLocations",
    labelKey: "preferredLocations",
    sectionId: "preferences",
  },
  {
    key: "purchaseTimeline",
    labelKey: "purchaseTimeline",
    sectionId: "timeline",
  },
  {
    key: "servicesNeeded",
    labelKey: "servicesNeeded",
    sectionId: "timeline",
  },
];

function calculateCompleteness(
  q: QuestionnaireData | null,
  t: (key: string) => string
): { percent: number; missingFields: string[]; firstIncompleteSectionId?: string } {
  if (!q)
    return { percent: 0, missingFields: [t("fields.notSet")] };

  const missingFields: string[] = [];
  let filled = 0;
  let firstIncompleteSectionId: string | undefined;

  for (const { key, labelKey, sectionId } of COMPLETENESS_FIELDS) {
    const value = q[key];
    const isFilled =
      value !== undefined &&
      value !== null &&
      (Array.isArray(value) ? value.length > 0 : true);
    const label = t(`fields.${labelKey}`);

    if (isFilled) {
      filled++;
    } else {
      if (!missingFields.some(existing => existing === label)) {
        missingFields.push(label);
      }
      if (!firstIncompleteSectionId) {
        firstIncompleteSectionId = sectionId;
      }
    }
  }

  return {
    percent: Math.round((filled / COMPLETENESS_FIELDS.length) * 100),
    missingFields,
    firstIncompleteSectionId,
  };
}

export function ProfileCompletenessBar({
  questionnaire,
  onJumpToIncomplete,
}: ProfileCompletenessBarProps) {
  const t = useTranslations("profileSummary");

  const { percent, missingFields, firstIncompleteSectionId } = useMemo(
    () => calculateCompleteness(questionnaire, t),
    [questionnaire, t]
  );

  const isComplete = percent === 100;

  const handleClick = useCallback(() => {
    if (!isComplete && onJumpToIncomplete && firstIncompleteSectionId) {
      onJumpToIncomplete(firstIncompleteSectionId);
    }
  }, [isComplete, onJumpToIncomplete, firstIncompleteSectionId]);

  return (
    <div
      className={cn(
        "sticky top-0 bg-background z-10 p-4 border-b",
        !isComplete && "cursor-pointer hover:bg-muted/50 transition-colors"
      )}
      onClick={handleClick}
      role={!isComplete ? "button" : undefined}
      tabIndex={!isComplete ? 0 : undefined}
      onKeyDown={(e) => {
        if (!isComplete && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">
            {t("completeness.title")}
          </span>
          <span className="text-sm text-muted-foreground">{percent}%</span>
        </div>

        <Progress value={percent} className="h-2" />

        {!isComplete && missingFields.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {t("completeness.missingPrefix")}{" "}
            {missingFields.slice(0, 3).join(", ")}
            {missingFields.length > 3 &&
              t("completeness.moreItems", { count: missingFields.length - 3 })}
          </p>
        )}

        {isComplete && (
          <div className="flex items-center gap-2">
            <Badge variant="default" className="text-xs bg-green-600">
              ✓
            </Badge>
            <span className="text-xs text-green-600">{t("completeness.complete")}</span>
          </div>
        )}
      </div>
    </div>
  );
}
