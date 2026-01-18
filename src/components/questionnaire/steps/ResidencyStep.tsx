"use client";

import { useState, useCallback } from "react";
import { QuestionBubble } from "../QuestionBubble";
import { AnswerArea } from "../AnswerArea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface ResidencyStepProps {
  value: string | undefined;
  onChange: (value: string) => void;
}

export function ResidencyStep({ value, onChange }: ResidencyStepProps) {
  const [showAnswer, setShowAnswer] = useState(false);

  // Stable callback to prevent QuestionBubble re-renders
  const handleTypingComplete = useCallback(() => {
    setShowAnswer(true);
  }, []);

  return (
    <div className="space-y-6">
      <QuestionBubble
        question="What is your residency status in Israel?"
        description="Your residency status determines applicable tax benefits and affects the property purchase process."
        onTypingComplete={handleTypingComplete}
      />
      {showAnswer && (
      <AnswerArea>
        <RadioGroup value={value} onValueChange={onChange}>
          <div className="space-y-3">
            <label
              htmlFor="resident"
              className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <RadioGroupItem value="resident" id="resident" />
              <div className="flex-1">
                <Label htmlFor="resident" className="cursor-pointer font-medium">
                  Israeli resident
                </Label>
                <p className="text-sm text-muted-foreground mt-0.5">
                  I live in Israel full-time
                </p>
              </div>
            </label>
            <label
              htmlFor="returning_resident"
              className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <RadioGroupItem value="returning_resident" id="returning_resident" />
              <div className="flex-1">
                <Label htmlFor="returning_resident" className="cursor-pointer font-medium">
                  Returning resident (Toshav Chozer)
                </Label>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Planning to return or returned within the last 10 years
                </p>
              </div>
            </label>
            <label
              htmlFor="non_resident"
              className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <RadioGroupItem value="non_resident" id="non_resident" />
              <div className="flex-1">
                <Label htmlFor="non_resident" className="cursor-pointer font-medium">
                  Non-resident
                </Label>
                <p className="text-sm text-muted-foreground mt-0.5">
                  I do not live in Israel
                </p>
              </div>
            </label>
            <label
              htmlFor="unsure"
              className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <RadioGroupItem value="unsure" id="unsure" />
              <div className="flex-1">
                <Label htmlFor="unsure" className="cursor-pointer font-medium">
                  I&apos;m not sure
                </Label>
                <p className="text-sm text-muted-foreground mt-0.5">
                  I need guidance on this
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
