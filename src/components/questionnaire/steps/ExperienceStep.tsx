"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { QuestionBubble } from "../QuestionBubble";
import { AnswerArea } from "../AnswerArea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface ExperienceStepProps {
  value: string | undefined;
  onChange: (value: string) => void;
}

export function ExperienceStep({ value, onChange }: ExperienceStepProps) {
  const t = useTranslations("onboarding.questions.experience");
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
              htmlFor="none"
              className="flex items-center space-x-3 rtl:space-x-reverse rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <RadioGroupItem value="none" id="none" />
              <div className="flex-1">
                <Label htmlFor="none" className="cursor-pointer font-medium">
                  {t("options.none.label")}
                </Label>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {t("options.none.description")}
                </p>
              </div>
            </label>
            <label
              htmlFor="some"
              className="flex items-center space-x-3 rtl:space-x-reverse rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <RadioGroupItem value="some" id="some" />
              <div className="flex-1">
                <Label htmlFor="some" className="cursor-pointer font-medium">
                  {t("options.some.label")}
                </Label>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {t("options.some.description")}
                </p>
              </div>
            </label>
            <label
              htmlFor="experienced"
              className="flex items-center space-x-3 rtl:space-x-reverse rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <RadioGroupItem value="experienced" id="experienced" />
              <div className="flex-1">
                <Label htmlFor="experienced" className="cursor-pointer font-medium">
                  {t("options.experienced.label")}
                </Label>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {t("options.experienced.description")}
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
