"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { QuestionBubble } from "../QuestionBubble";
import { AnswerArea } from "../AnswerArea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ServicesStepProps {
  value: string[] | undefined;
  onChange: (value: string[]) => void;
}

// Service IDs as stored in DB
const SERVICE_IDS = ["broker", "mortgage_advisor", "lawyer"] as const;

// Map DB values to translation keys
const SERVICE_KEY_MAP: Record<string, string> = {
  broker: "broker",
  mortgage_advisor: "mortgageAdvisor",
  lawyer: "lawyer",
};

export function ServicesStep({ value = [], onChange }: ServicesStepProps) {
  const t = useTranslations("onboarding.questions.services");
  const [showAnswer, setShowAnswer] = useState(false);

  // Stable callback to prevent QuestionBubble re-renders
  const handleTypingComplete = useCallback(() => {
    setShowAnswer(true);
  }, []);

  const handleToggle = (serviceId: string, checked: boolean) => {
    if (checked) {
      onChange([...value, serviceId]);
    } else {
      onChange(value.filter((id) => id !== serviceId));
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
          {SERVICE_IDS.map((serviceId) => {
            const key = SERVICE_KEY_MAP[serviceId];
            return (
              <label
                key={serviceId}
                htmlFor={serviceId}
                className="flex items-start space-x-3 rtl:space-x-reverse rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <Checkbox
                  id={serviceId}
                  checked={value.includes(serviceId)}
                  onCheckedChange={(checked) => handleToggle(serviceId, checked === true)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <Label htmlFor={serviceId} className="cursor-pointer font-medium">
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
