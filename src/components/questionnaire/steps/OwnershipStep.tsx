"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { QuestionBubble } from "../QuestionBubble";
import { AnswerArea } from "../AnswerArea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface OwnershipStepProps {
  value: boolean | undefined;
  onChange: (value: boolean) => void;
}

export function OwnershipStep({ value, onChange }: OwnershipStepProps) {
  const t = useTranslations("onboarding.questions.ownsProperty");
  const [showAnswer, setShowAnswer] = useState(false);

  // Stable callback to prevent QuestionBubble re-renders
  const handleTypingComplete = useCallback(() => {
    setShowAnswer(true);
  }, []);

  // Convert boolean to string for RadioGroup, and back on change
  const stringValue = value === undefined ? undefined : value ? "yes" : "no";

  const handleChange = (val: string) => {
    onChange(val === "yes");
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
        <RadioGroup value={stringValue} onValueChange={handleChange}>
          <div className="space-y-3">
            <label
              htmlFor="owns-yes"
              className="flex items-center space-x-3 rtl:space-x-reverse rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <RadioGroupItem value="yes" id="owns-yes" />
              <Label htmlFor="owns-yes" className="cursor-pointer flex-1">
                {t("options.yes")}
              </Label>
            </label>
            <label
              htmlFor="owns-no"
              className="flex items-center space-x-3 rtl:space-x-reverse rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <RadioGroupItem value="no" id="owns-no" />
              <Label htmlFor="owns-no" className="cursor-pointer flex-1">
                {t("options.no")}
              </Label>
            </label>
          </div>
        </RadioGroup>
      </AnswerArea>
      )}
    </div>
  );
}
