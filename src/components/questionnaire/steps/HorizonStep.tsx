"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { QuestionBubble } from "../QuestionBubble";
import { AnswerArea } from "../AnswerArea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface HorizonStepProps {
  value: string | undefined;
  onChange: (value: string) => void;
}

// Map snake_case DB values to camelCase translation keys
const horizonKeyMap: Record<string, string> = {
  short_term: "shortTerm",
  medium_term: "mediumTerm",
  long_term: "longTerm",
};

const HORIZON_IDS = ["short_term", "medium_term", "long_term"] as const;

export function HorizonStep({ value, onChange }: HorizonStepProps) {
  const t = useTranslations("onboarding.questions.horizon");
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
            {HORIZON_IDS.map((horizonId) => {
              const key = horizonKeyMap[horizonId];
              return (
                <label
                  key={horizonId}
                  htmlFor={horizonId}
                  className="flex items-start space-x-3 rtl:space-x-reverse rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <RadioGroupItem value={horizonId} id={horizonId} className="mt-0.5" />
                  <div className="flex-1">
                    <Label htmlFor={horizonId} className="cursor-pointer font-medium">
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
