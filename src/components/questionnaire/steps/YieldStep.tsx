"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { QuestionBubble } from "../QuestionBubble";
import { AnswerArea } from "../AnswerArea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface YieldStepProps {
  value: string | undefined;
  onChange: (value: string) => void;
}

// Map snake_case DB values to camelCase translation keys
const yieldKeyMap: Record<string, string> = {
  rental_yield: "rentalYield",
  appreciation: "appreciation",
  balanced: "balanced",
};

const YIELD_IDS = ["rental_yield", "appreciation", "balanced"] as const;

export function YieldStep({ value, onChange }: YieldStepProps) {
  const t = useTranslations("onboarding.questions.yield");
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
            {YIELD_IDS.map((yieldId) => {
              const key = yieldKeyMap[yieldId];
              return (
                <label
                  key={yieldId}
                  htmlFor={yieldId}
                  className="flex items-start space-x-3 rtl:space-x-reverse rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <RadioGroupItem value={yieldId} id={yieldId} className="mt-0.5" />
                  <div className="flex-1">
                    <Label htmlFor={yieldId} className="cursor-pointer font-medium">
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
