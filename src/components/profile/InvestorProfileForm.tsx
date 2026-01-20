"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useTranslations } from "next-intl";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { MultiSelectPopover } from "@/components/ui/multi-select-popover";
import {
  PROPERTY_TYPES,
  ISRAELI_LOCATIONS,
  RISK_TOLERANCE_OPTIONS,
  INVESTMENT_TIMELINE_OPTIONS,
} from "@/lib/constants";

type PropertyType = "residential" | "commercial" | "mixed_use" | "land";
type RiskTolerance = "conservative" | "moderate" | "aggressive";
type InvestmentTimeline = "short_term" | "medium_term" | "long_term";

// Convert locations to options format
const locationOptions = ISRAELI_LOCATIONS.map((loc) => ({
  value: loc,
  label: loc,
}));

export function InvestorProfileForm() {
  const t = useTranslations("profile.investorForm");
  const tPropertyTypes = useTranslations("common.propertyTypes");
  const tRisk = useTranslations("common.riskTolerance");
  const tTimeline = useTranslations("common.investmentTimeline");
  const profile = useQuery(api.investorProfiles.getMyProfile);
  const upsertProfile = useMutation(api.investorProfiles.upsertProfile);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get translated property type options
  const propertyTypeOptions = PROPERTY_TYPES.map((type) => ({
    value: type.value,
    label: type.value === "residential" ? tPropertyTypes("residential") :
           type.value === "commercial" ? tPropertyTypes("commercial") :
           type.value === "mixed_use" ? tPropertyTypes("mixedUse") :
           tPropertyTypes("land"),
  }));

  // Get translated risk tolerance options
  const riskToleranceOptions = RISK_TOLERANCE_OPTIONS.map((option) => ({
    value: option.value,
    label: option.value === "conservative" ? tRisk("conservative.label") :
           option.value === "moderate" ? tRisk("moderate.label") :
           tRisk("aggressive.label"),
    description: option.value === "conservative" ? tRisk("conservative.description") :
                 option.value === "moderate" ? tRisk("moderate.description") :
                 tRisk("aggressive.description"),
  }));

  // Get translated investment timeline options
  const investmentTimelineOptions = INVESTMENT_TIMELINE_OPTIONS.map((option) => ({
    value: option.value,
    label: option.value === "short_term" ? tTimeline("shortTerm.label") :
           option.value === "medium_term" ? tTimeline("mediumTerm.label") :
           tTimeline("longTerm.label"),
    description: option.value === "short_term" ? tTimeline("shortTerm.description") :
                 option.value === "medium_term" ? tTimeline("mediumTerm.description") :
                 tTimeline("longTerm.description"),
  }));

  // Form state
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [targetLocations, setTargetLocations] = useState<string[]>([]);
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>("moderate");
  const [targetRoiMin, setTargetRoiMin] = useState("");
  const [investmentTimeline, setInvestmentTimeline] = useState<InvestmentTimeline | "">("");
  const [notes, setNotes] = useState("");

  // Pre-fill form when profile loads
  useEffect(() => {
    if (profile) {
      setPropertyTypes(profile.propertyTypes);
      setTargetLocations(profile.targetLocations);
      setBudgetMin(profile.budgetMin.toString());
      setBudgetMax(profile.budgetMax.toString());
      setRiskTolerance(profile.riskTolerance as RiskTolerance);
      setTargetRoiMin(profile.targetRoiMin?.toString() ?? "");
      setInvestmentTimeline((profile.investmentTimeline as InvestmentTimeline) ?? "");
      setNotes(profile.notes ?? "");
    }
  }, [profile]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (propertyTypes.length === 0) {
      newErrors.propertyTypes = t("errors.selectPropertyType");
    }

    if (targetLocations.length === 0) {
      newErrors.targetLocations = t("errors.selectLocation");
    }

    const minBudget = parseFloat(budgetMin);
    const maxBudget = parseFloat(budgetMax);

    if (!budgetMin || isNaN(minBudget) || minBudget < 0) {
      newErrors.budgetMin = t("errors.validMinBudget");
    }

    if (!budgetMax || isNaN(maxBudget) || maxBudget < 0) {
      newErrors.budgetMax = t("errors.validMaxBudget");
    }

    if (minBudget >= maxBudget) {
      newErrors.budgetMax = t("errors.maxGreaterThanMin");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await upsertProfile({
        propertyTypes: propertyTypes as PropertyType[],
        targetLocations,
        budgetMin: parseFloat(budgetMin),
        budgetMax: parseFloat(budgetMax),
        riskTolerance,
        targetRoiMin: targetRoiMin ? parseFloat(targetRoiMin) : undefined,
        investmentTimeline: investmentTimeline || undefined,
        notes: notes || undefined,
      });
      toast.success(t("toast.saved"));
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast.error(t("toast.saveFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (profile === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Property Types */}
            <div className="space-y-2">
              <Label className="text-base font-medium">{t("labels.propertyTypes")}</Label>
              <MultiSelectPopover
                options={propertyTypeOptions}
                selected={propertyTypes}
                onChange={(selected) => {
                  setPropertyTypes(selected);
                  setErrors((prev) => ({ ...prev, propertyTypes: "" }));
                }}
                placeholder={t("placeholders.selectPropertyTypes")}
              />
              {errors.propertyTypes && (
                <p className="text-sm text-destructive">{errors.propertyTypes}</p>
              )}
            </div>

            {/* Target Locations */}
            <div className="space-y-2">
              <Label className="text-base font-medium">{t("labels.targetLocations")}</Label>
              <MultiSelectPopover
                options={locationOptions}
                selected={targetLocations}
                onChange={(selected) => {
                  setTargetLocations(selected);
                  setErrors((prev) => ({ ...prev, targetLocations: "" }));
                }}
                placeholder={t("placeholders.selectLocations")}
              />
              {errors.targetLocations && (
                <p className="text-sm text-destructive">{errors.targetLocations}</p>
              )}
            </div>

            {/* Budget Range */}
            <div className="space-y-3">
              <Label className="text-base font-medium">{t("labels.budgetRange")}</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budgetMin">{t("labels.minimum")}</Label>
                  <Input
                    id="budgetMin"
                    type="number"
                    placeholder="100,000"
                    value={budgetMin}
                    onChange={(e) => {
                      setBudgetMin(e.target.value);
                      setErrors((prev) => ({ ...prev, budgetMin: "" }));
                    }}
                  />
                  {errors.budgetMin && (
                    <p className="text-sm text-destructive">{errors.budgetMin}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budgetMax">{t("labels.maximum")}</Label>
                  <Input
                    id="budgetMax"
                    type="number"
                    placeholder="500,000"
                    value={budgetMax}
                    onChange={(e) => {
                      setBudgetMax(e.target.value);
                      setErrors((prev) => ({ ...prev, budgetMax: "" }));
                    }}
                  />
                  {errors.budgetMax && (
                    <p className="text-sm text-destructive">{errors.budgetMax}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Target ROI */}
            <div className="space-y-2">
              <Label htmlFor="targetRoiMin" className="text-base font-medium">
                {t("labels.targetRoi")}
              </Label>
              <Input
                id="targetRoiMin"
                type="number"
                placeholder="8"
                value={targetRoiMin}
                onChange={(e) => setTargetRoiMin(e.target.value)}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6">
            {/* Risk Tolerance */}
            <div className="space-y-3">
              <Label className="text-base font-medium">{t("labels.riskTolerance")}</Label>
              <RadioGroup
                value={riskTolerance}
                onValueChange={(value) => setRiskTolerance(value as RiskTolerance)}
              >
                {riskToleranceOptions.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-start space-x-3 rtl:space-x-reverse rounded-lg border p-3 hover:bg-muted/50 cursor-pointer"
                    onClick={() => setRiskTolerance(option.value as RiskTolerance)}
                  >
                    <RadioGroupItem value={option.value} id={option.value} className="mt-0.5" />
                    <div>
                      <Label htmlFor={option.value} className="cursor-pointer font-medium">
                        {option.label}
                      </Label>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Investment Timeline */}
            <div className="space-y-3">
              <Label className="text-base font-medium">{t("labels.investmentTimeline")}</Label>
              <RadioGroup
                value={investmentTimeline}
                onValueChange={(value) => setInvestmentTimeline(value as InvestmentTimeline)}
              >
                {investmentTimelineOptions.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-start space-x-3 rtl:space-x-reverse rounded-lg border p-3 hover:bg-muted/50 cursor-pointer"
                    onClick={() => setInvestmentTimeline(option.value as InvestmentTimeline)}
                  >
                    <RadioGroupItem value={option.value} id={`timeline-${option.value}`} className="mt-0.5" />
                    <div>
                      <Label htmlFor={`timeline-${option.value}`} className="cursor-pointer font-medium">
                        {option.label}
                      </Label>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Notes */}
            <div className="flex-1 flex flex-col gap-2">
              <Label htmlFor="notes" className="text-base font-medium">
                {t("labels.notes")}
              </Label>
              <Textarea
                id="notes"
                placeholder={t("placeholders.notes")}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="flex-1 min-h-[100px] resize-none"
              />
            </div>
          </div>
        </div>

        {/* Submit - Full Width */}
        <div className="mt-8">
          <Button type="submit" disabled={isSubmitting} size="lg">
            {isSubmitting ? (
              <>
                <Spinner className="me-2 h-4 w-4" />
                {t("buttons.saving")}
              </>
            ) : (
              t("buttons.saveProfile")
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
