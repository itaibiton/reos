"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { QuestionBubble } from "../QuestionBubble";
import { AnswerArea } from "../AnswerArea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface FinancingStepProps {
  value: string | undefined;
  onChange: (value: string) => void;
}

const FINANCING_IDS = ["cash", "mortgage", "exploring"] as const;

export function FinancingStep({ value, onChange }: FinancingStepProps) {
  const t = useTranslations("onboarding.questions.financing");
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
            {FINANCING_IDS.map((financingId) => (
              <label
                key={financingId}
                htmlFor={financingId}
                className="flex items-start space-x-3 rtl:space-x-reverse rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <RadioGroupItem value={financingId} id={financingId} className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor={financingId} className="cursor-pointer font-medium">
                    {t(`options.${financingId}.label`)}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t(`options.${financingId}.description`)}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </RadioGroup>
      </AnswerArea>
      )}
    </div>
  );
}
