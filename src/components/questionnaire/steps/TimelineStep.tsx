"use client";

import { useState, useCallback } from "react";
import { QuestionBubble } from "../QuestionBubble";
import { AnswerArea } from "../AnswerArea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface TimelineStepProps {
  value: string | undefined;
  onChange: (value: string) => void;
}

export function TimelineStep({ value, onChange }: TimelineStepProps) {
  const [showAnswer, setShowAnswer] = useState(false);

  // Stable callback to prevent QuestionBubble re-renders
  const handleTypingComplete = useCallback(() => {
    setShowAnswer(true);
  }, []);

  return (
    <div className="space-y-6">
      <QuestionBubble
        question="When are you looking to purchase?"
        description="This helps us prioritize your matches."
        onTypingComplete={handleTypingComplete}
      />
      {showAnswer && (
      <AnswerArea>
        <RadioGroup value={value} onValueChange={onChange}>
          <div className="space-y-3">
            <label
              htmlFor="3_months"
              className="flex items-start space-x-3 rtl:space-x-reverse rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <RadioGroupItem value="3_months" id="3_months" className="mt-0.5" />
              <div className="flex-1">
                <Label htmlFor="3_months" className="cursor-pointer font-medium">
                  Within 3 months
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Ready to move quickly on the right property
                </p>
              </div>
            </label>
            <label
              htmlFor="6_months"
              className="flex items-start space-x-3 rtl:space-x-reverse rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <RadioGroupItem value="6_months" id="6_months" className="mt-0.5" />
              <div className="flex-1">
                <Label htmlFor="6_months" className="cursor-pointer font-medium">
                  Within 6 months
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Actively searching and comparing options
                </p>
              </div>
            </label>
            <label
              htmlFor="1_year"
              className="flex items-start space-x-3 rtl:space-x-reverse rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <RadioGroupItem value="1_year" id="1_year" className="mt-0.5" />
              <div className="flex-1">
                <Label htmlFor="1_year" className="cursor-pointer font-medium">
                  Within 1 year
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Planning ahead for the right opportunity
                </p>
              </div>
            </label>
            <label
              htmlFor="exploring"
              className="flex items-start space-x-3 rtl:space-x-reverse rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <RadioGroupItem value="exploring" id="exploring" className="mt-0.5" />
              <div className="flex-1">
                <Label htmlFor="exploring" className="cursor-pointer font-medium">
                  Just exploring
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Learning about the market, no timeline yet
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
