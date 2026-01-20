"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { QuestionBubble } from "../QuestionBubble";
import { AnswerArea } from "../AnswerArea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// Map DB values to translation keys
const OPTION_KEY_MAP: Record<string, string> = {
  resident: "resident",
  returning_resident: "returningResident",
  non_resident: "nonResident",
  unsure: "unsure",
};

interface ResidencyStepProps {
  value: string | undefined;
  onChange: (value: string) => void;
}

export function ResidencyStep({ value, onChange }: ResidencyStepProps) {
  const t = useTranslations("onboarding.questions.residency");
  const [showAnswer, setShowAnswer] = useState(false);

  // Stable callback to prevent QuestionBubble re-renders
  const handleTypingComplete = useCallback(() => {
    setShowAnswer(true);
  }, []);

  return (
    <div className="space-y-6">
      <QuestionBubble
        question={t("title")}
        description={t("description")}
        onTypingComplete={handleTypingComplete}
      />
      {showAnswer && (
      <AnswerArea>
        <RadioGroup value={value} onValueChange={onChange}>
          <div className="space-y-3">
            <label
              htmlFor="resident"
              className="flex items-center space-x-3 rtl:space-x-reverse rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <RadioGroupItem value="resident" id="resident" />
              <div className="flex-1">
                <Label htmlFor="resident" className="cursor-pointer font-medium">
                  {t(`options.${OPTION_KEY_MAP["resident"]}.label`)}
                </Label>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {t(`options.${OPTION_KEY_MAP["resident"]}.description`)}
                </p>
              </div>
            </label>
            <label
              htmlFor="returning_resident"
              className="flex items-center space-x-3 rtl:space-x-reverse rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <RadioGroupItem value="returning_resident" id="returning_resident" />
              <div className="flex-1">
                <Label htmlFor="returning_resident" className="cursor-pointer font-medium">
                  {t(`options.${OPTION_KEY_MAP["returning_resident"]}.label`)}
                </Label>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {t(`options.${OPTION_KEY_MAP["returning_resident"]}.description`)}
                </p>
              </div>
            </label>
            <label
              htmlFor="non_resident"
              className="flex items-center space-x-3 rtl:space-x-reverse rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <RadioGroupItem value="non_resident" id="non_resident" />
              <div className="flex-1">
                <Label htmlFor="non_resident" className="cursor-pointer font-medium">
                  {t(`options.${OPTION_KEY_MAP["non_resident"]}.label`)}
                </Label>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {t(`options.${OPTION_KEY_MAP["non_resident"]}.description`)}
                </p>
              </div>
            </label>
            <label
              htmlFor="unsure"
              className="flex items-center space-x-3 rtl:space-x-reverse rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <RadioGroupItem value="unsure" id="unsure" />
              <div className="flex-1">
                <Label htmlFor="unsure" className="cursor-pointer font-medium">
                  {t(`options.${OPTION_KEY_MAP["unsure"]}.label`)}
                </Label>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {t(`options.${OPTION_KEY_MAP["unsure"]}.description`)}
                </p>
              </div>
            </label>
          </div>
        </RadioGroup>
      </AnswerArea>
      )}
    </div>
  );
}
