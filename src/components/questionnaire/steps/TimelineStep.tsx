"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { QuestionBubble } from "../QuestionBubble";
import { AnswerArea } from "../AnswerArea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface TimelineStepProps {
  value: string | undefined;
  onChange: (value: string) => void;
}

// Map DB values to translation keys
const TIMELINE_KEY_MAP: Record<string, string> = {
  "3_months": "3months",
  "6_months": "6months",
  "1_year": "1year",
  exploring: "exploring",
};

const TIMELINE_OPTIONS = ["3_months", "6_months", "1_year", "exploring"] as const;

export function TimelineStep({ value, onChange }: TimelineStepProps) {
  const t = useTranslations("onboarding.questions.timeline");
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
            {TIMELINE_OPTIONS.map((optionValue) => {
              const key = TIMELINE_KEY_MAP[optionValue];
              return (
                <label
                  key={optionValue}
                  htmlFor={optionValue}
                  className="flex items-start space-x-3 rtl:space-x-reverse rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <RadioGroupItem value={optionValue} id={optionValue} className="mt-0.5" />
                  <div className="flex-1">
                    <Label htmlFor={optionValue} className="cursor-pointer font-medium">
                      {t(`options.${key}.label`)}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t(`options.${key}.description`)}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </RadioGroup>
      </AnswerArea>
      )}
    </div>
  );
}
