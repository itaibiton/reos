"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { QuestionBubble } from "../QuestionBubble";
import { AnswerArea } from "../AnswerArea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PropertySizeStepProps {
  minBedrooms: number | undefined;
  maxBedrooms: number | undefined;
  minArea: number | undefined;
  maxArea: number | undefined;
  onMinBedroomsChange: (value: number | undefined) => void;
  onMaxBedroomsChange: (value: number | undefined) => void;
  onMinAreaChange: (value: number | undefined) => void;
  onMaxAreaChange: (value: number | undefined) => void;
}

export function PropertySizeStep({
  minBedrooms,
  maxBedrooms,
  minArea,
  maxArea,
  onMinBedroomsChange,
  onMaxBedroomsChange,
  onMinAreaChange,
  onMaxAreaChange,
}: PropertySizeStepProps) {
  const t = useTranslations("onboarding.questions.propertySize");
  const tOptions = useTranslations("onboarding.options");
  const [showAnswer, setShowAnswer] = useState(false);

  // Stable callback to prevent QuestionBubble re-renders
  const handleTypingComplete = useCallback(() => {
    setShowAnswer(true);
  }, []);

  const parseNumber = (value: string): number | undefined => {
    const cleaned = value.replace(/[^0-9]/g, "");
    if (cleaned === "") return undefined;
    return parseInt(cleaned, 10);
  };

  const formatNumber = (value: number | undefined): string => {
    if (value === undefined) return "";
    return value.toLocaleString("en-US");
  };

  return (
    <div className="space-y-6">
      <QuestionBubble
        question={t("title")}
        description={t("description")}
        onTypingComplete={handleTypingComplete}
      />
      {showAnswer && (
      <AnswerArea>
        <div className="space-y-6">
          {/* Bedrooms section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">{tOptions("bedrooms")}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-4">
                <Label htmlFor="minBedrooms" className="text-sm font-medium">
                  {tOptions("minimum")}
                </Label>
                <Input
                  id="minBedrooms"
                  type="text"
                  inputMode="numeric"
                  placeholder={t("placeholder.minBedrooms")}
                  value={minBedrooms ?? ""}
                  onChange={(e) => onMinBedroomsChange(parseNumber(e.target.value))}
                  className="mt-2"
                />
              </div>
              <div className="rounded-lg border p-4">
                <Label htmlFor="maxBedrooms" className="text-sm font-medium">
                  {tOptions("maximum")}
                </Label>
                <Input
                  id="maxBedrooms"
                  type="text"
                  inputMode="numeric"
                  placeholder={t("placeholder.maxBedrooms")}
                  value={maxBedrooms ?? ""}
                  onChange={(e) => onMaxBedroomsChange(parseNumber(e.target.value))}
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          {/* Area section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">{tOptions("area")}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-4">
                <Label htmlFor="minArea" className="text-sm font-medium">
                  {tOptions("minimum")}
                </Label>
                <Input
                  id="minArea"
                  type="text"
                  inputMode="numeric"
                  placeholder={t("placeholder.minArea")}
                  value={formatNumber(minArea)}
                  onChange={(e) => onMinAreaChange(parseNumber(e.target.value))}
                  className="mt-2"
                />
              </div>
              <div className="rounded-lg border p-4">
                <Label htmlFor="maxArea" className="text-sm font-medium">
                  {tOptions("maximum")}
                </Label>
                <Input
                  id="maxArea"
                  type="text"
                  inputMode="numeric"
                  placeholder={t("placeholder.maxArea")}
                  value={formatNumber(maxArea)}
                  onChange={(e) => onMaxAreaChange(parseNumber(e.target.value))}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        </div>
      </AnswerArea>
      )}
    </div>
  );
}
