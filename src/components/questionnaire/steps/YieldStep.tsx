"use client";

import { useState, useCallback } from "react";
import { QuestionBubble } from "../QuestionBubble";
import { AnswerArea } from "../AnswerArea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface YieldStepProps {
  value: string | undefined;
  onChange: (value: string) => void;
}

export function YieldStep({ value, onChange }: YieldStepProps) {
  const [showAnswer, setShowAnswer] = useState(false);

  // Stable callback to prevent QuestionBubble re-renders
  const handleTypingComplete = useCallback(() => {
    setShowAnswer(true);
  }, []);

  return (
    <div className="space-y-6">
      <QuestionBubble
        question="What's your yield preference?"
        description="This affects which properties we prioritize in recommendations."
        onTypingComplete={handleTypingComplete}
      />
      {showAnswer && (
      <AnswerArea>
        <RadioGroup value={value} onValueChange={onChange}>
          <div className="space-y-3">
            <label
              htmlFor="rental_yield"
              className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <RadioGroupItem value="rental_yield" id="rental_yield" className="mt-0.5" />
              <div className="flex-1">
                <Label htmlFor="rental_yield" className="cursor-pointer font-medium">
                  Rental yield focus
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Prioritize cash flow
                </p>
              </div>
            </label>
            <label
              htmlFor="appreciation"
              className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <RadioGroupItem value="appreciation" id="appreciation" className="mt-0.5" />
              <div className="flex-1">
                <Label htmlFor="appreciation" className="cursor-pointer font-medium">
                  Appreciation focus
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Prioritize value growth
                </p>
              </div>
            </label>
            <label
              htmlFor="balanced"
              className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <RadioGroupItem value="balanced" id="balanced" className="mt-0.5" />
              <div className="flex-1">
                <Label htmlFor="balanced" className="cursor-pointer font-medium">
                  Balanced approach
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Both matter equally
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
