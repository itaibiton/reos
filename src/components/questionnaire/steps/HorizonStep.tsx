"use client";

import { useState, useCallback } from "react";
import { QuestionBubble } from "../QuestionBubble";
import { AnswerArea } from "../AnswerArea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface HorizonStepProps {
  value: string | undefined;
  onChange: (value: string) => void;
}

export function HorizonStep({ value, onChange }: HorizonStepProps) {
  const [showAnswer, setShowAnswer] = useState(false);

  // Stable callback to prevent QuestionBubble re-renders
  const handleTypingComplete = useCallback(() => {
    setShowAnswer(true);
  }, []);

  return (
    <div className="space-y-6">
      <QuestionBubble
        question="What's your investment timeline?"
        description="Your timeline helps us recommend appropriate investment strategies."
        onTypingComplete={handleTypingComplete}
      />
      {showAnswer && (
      <AnswerArea>
        <RadioGroup value={value} onValueChange={onChange}>
          <div className="space-y-3">
            <label
              htmlFor="short_term"
              className="flex items-start space-x-3 rtl:space-x-reverse rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <RadioGroupItem value="short_term" id="short_term" className="mt-0.5" />
              <div className="flex-1">
                <Label htmlFor="short_term" className="cursor-pointer font-medium">
                  Short-term (under 2 years)
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Quick flip or short-term rental
                </p>
              </div>
            </label>
            <label
              htmlFor="medium_term"
              className="flex items-start space-x-3 rtl:space-x-reverse rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <RadioGroupItem value="medium_term" id="medium_term" className="mt-0.5" />
              <div className="flex-1">
                <Label htmlFor="medium_term" className="cursor-pointer font-medium">
                  Medium-term (2-5 years)
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Hold for appreciation
                </p>
              </div>
            </label>
            <label
              htmlFor="long_term"
              className="flex items-start space-x-3 rtl:space-x-reverse rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <RadioGroupItem value="long_term" id="long_term" className="mt-0.5" />
              <div className="flex-1">
                <Label htmlFor="long_term" className="cursor-pointer font-medium">
                  Long-term (5+ years)
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Long-term wealth building
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
