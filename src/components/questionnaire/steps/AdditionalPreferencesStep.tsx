"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { QuestionBubble } from "../QuestionBubble";
import { AnswerArea } from "../AnswerArea";
import { Textarea } from "@/components/ui/textarea";

interface AdditionalPreferencesStepProps {
  value: string | undefined;
  onChange: (value: string) => void;
}

const MAX_LENGTH = 2000;

export function AdditionalPreferencesStep({ value = "", onChange }: AdditionalPreferencesStepProps) {
  const t = useTranslations("onboarding.questions.additional");
  const [showAnswer, setShowAnswer] = useState(false);

  // Stable callback to prevent QuestionBubble re-renders
  const handleTypingComplete = useCallback(() => {
    setShowAnswer(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= MAX_LENGTH) {
      onChange(newValue);
    }
  };

  const charCount = value?.length ?? 0;

  return (
    <div className="space-y-6">
      <QuestionBubble
        question={t("title")}
        description={t("description")}
        onTypingComplete={handleTypingComplete}
      />
      {showAnswer && (
      <AnswerArea>
        <div className="space-y-2">
          <Textarea
            value={value}
            onChange={handleChange}
            placeholder={t("placeholder")}
            className="min-h-[150px] resize-none"
          />
          <div className="flex justify-end">
            <span className="text-xs text-muted-foreground">
              {t("charCount", { count: charCount, max: MAX_LENGTH })}
            </span>
          </div>
        </div>
      </AnswerArea>
      )}
    </div>
  );
}
