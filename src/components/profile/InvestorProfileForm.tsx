"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
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
  const profile = useQuery(api.investorProfiles.getMyProfile);
  const upsertProfile = useMutation(api.investorProfiles.upsertProfile);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      newErrors.propertyTypes = "Select at least one property type";
    }

    if (targetLocations.length === 0) {
      newErrors.targetLocations = "Select at least one location";
    }

    const minBudget = parseFloat(budgetMin);
    const maxBudget = parseFloat(budgetMax);

    if (!budgetMin || isNaN(minBudget) || minBudget < 0) {
      newErrors.budgetMin = "Enter a valid minimum budget";
    }

    if (!budgetMax || isNaN(maxBudget) || maxBudget < 0) {
      newErrors.budgetMax = "Enter a valid maximum budget";
    }

    if (minBudget >= maxBudget) {
      newErrors.budgetMax = "Maximum must be greater than minimum";
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
      toast.success("Profile saved successfully!");
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast.error("Failed to save profile. Please try again.");
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
              <Label className="text-base font-medium">Property Types</Label>
              <MultiSelectPopover
                options={PROPERTY_TYPES.map((t) => ({ value: t.value, label: t.label }))}
                selected={propertyTypes}
                onChange={(selected) => {
                  setPropertyTypes(selected);
                  setErrors((prev) => ({ ...prev, propertyTypes: "" }));
                }}
                placeholder="Select property types..."
              />
              {errors.propertyTypes && (
                <p className="text-sm text-destructive">{errors.propertyTypes}</p>
              )}
            </div>

            {/* Target Locations */}
            <div className="space-y-2">
              <Label className="text-base font-medium">Target Locations</Label>
              <MultiSelectPopover
                options={locationOptions}
                selected={targetLocations}
                onChange={(selected) => {
                  setTargetLocations(selected);
                  setErrors((prev) => ({ ...prev, targetLocations: "" }));
                }}
                placeholder="Select locations..."
              />
              {errors.targetLocations && (
                <p className="text-sm text-destructive">{errors.targetLocations}</p>
              )}
            </div>

            {/* Budget Range */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Budget Range (USD)</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budgetMin">Minimum</Label>
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
                  <Label htmlFor="budgetMax">Maximum</Label>
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
                Minimum Target ROI % (Optional)
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
              <Label className="text-base font-medium">Risk Tolerance</Label>
              <RadioGroup
                value={riskTolerance}
                onValueChange={(value) => setRiskTolerance(value as RiskTolerance)}
              >
                {RISK_TOLERANCE_OPTIONS.map((option) => (
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
              <Label className="text-base font-medium">Investment Timeline (Optional)</Label>
              <RadioGroup
                value={investmentTimeline}
                onValueChange={(value) => setInvestmentTimeline(value as InvestmentTimeline)}
              >
                {INVESTMENT_TIMELINE_OPTIONS.map((option) => (
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
                Additional Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Any specific requirements or preferences..."
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
                Saving...
              </>
            ) : (
              "Save Profile"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
