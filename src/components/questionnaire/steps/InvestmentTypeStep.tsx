"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { QuestionBubble } from "../QuestionBubble";
import { AnswerArea } from "../AnswerArea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface InvestmentTypeStepProps {
  value: string | undefined;
  onChange: (value: string) => void;
}

export function InvestmentTypeStep({ value, onChange }: InvestmentTypeStepProps) {
  const t = useTranslations("onboarding.questions.investmentType");
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
              htmlFor="residential"
              className="flex items-center space-x-3 rtl:space-x-reverse rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <RadioGroupItem value="residential" id="residential" />
              <div className="flex-1">
                <Label htmlFor="residential" className="cursor-pointer font-medium">
                  {t("options.residential.label")}
                </Label>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {t("options.residential.description")}
                </p>
              </div>
            </label>
            <label
              htmlFor="investment"
              className="flex items-center space-x-3 rtl:space-x-reverse rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <RadioGroupItem value="investment" id="investment" />
              <div className="flex-1">
                <Label htmlFor="investment" className="cursor-pointer font-medium">
                  {t("options.investment.label")}
                </Label>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {t("options.investment.description")}
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
