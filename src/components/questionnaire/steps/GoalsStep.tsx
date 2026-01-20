"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { QuestionBubble } from "../QuestionBubble";
import { AnswerArea } from "../AnswerArea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface GoalsStepProps {
  value: string[] | undefined;
  onChange: (value: string[]) => void;
}

// Map snake_case DB values to camelCase translation keys
const goalKeyMap: Record<string, string> = {
  appreciation: "appreciation",
  rental_income: "rentalIncome",
  diversification: "diversification",
  tax_benefits: "taxBenefits",
};

const GOAL_IDS = ["appreciation", "rental_income", "diversification", "tax_benefits"] as const;

export function GoalsStep({ value = [], onChange }: GoalsStepProps) {
  const t = useTranslations("onboarding.questions.goals");
  const [showAnswer, setShowAnswer] = useState(false);

  // Stable callback to prevent QuestionBubble re-renders
  const handleTypingComplete = useCallback(() => {
    setShowAnswer(true);
  }, []);

  const handleToggle = (goalId: string, checked: boolean) => {
    if (checked) {
      onChange([...value, goalId]);
    } else {
      onChange(value.filter((id) => id !== goalId));
    }
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
        <div className="space-y-3">
          {GOAL_IDS.map((goalId) => {
            const key = goalKeyMap[goalId];
            return (
              <label
                key={goalId}
                htmlFor={goalId}
                className="flex items-start space-x-3 rtl:space-x-reverse rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <Checkbox
                  id={goalId}
                  checked={value.includes(goalId)}
                  onCheckedChange={(checked) => handleToggle(goalId, checked === true)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <Label htmlFor={goalId} className="cursor-pointer font-medium">
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
      </AnswerArea>
      )}
    </div>
  );
}
