"use client";

import { useState, useCallback } from "react";
import { QuestionBubble } from "../QuestionBubble";
import { AnswerArea } from "../AnswerArea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PROPERTY_TYPES } from "@/lib/constants";

interface PropertyTypeStepProps {
  value: string[] | undefined;
  onChange: (value: string[]) => void;
}

export function PropertyTypeStep({ value = [], onChange }: PropertyTypeStepProps) {
  const [showAnswer, setShowAnswer] = useState(false);

  // Stable callback to prevent QuestionBubble re-renders
  const handleTypingComplete = useCallback(() => {
    setShowAnswer(true);
  }, []);

  const handleToggle = (typeValue: string, checked: boolean) => {
    if (checked) {
      onChange([...value, typeValue]);
    } else {
      onChange(value.filter((v) => v !== typeValue));
    }
  };

  return (
    <div className="space-y-6">
      <QuestionBubble
        question="What types of properties interest you?"
        description="Select all that apply - this helps us match you with relevant listings."
        onTypingComplete={handleTypingComplete}
      />
      {showAnswer && (
      <AnswerArea>
        <div className="space-y-3">
          {PROPERTY_TYPES.map((type) => (
            <label
              key={type.value}
              htmlFor={type.value}
              className="flex items-start space-x-3 rtl:space-x-reverse rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <Checkbox
                id={type.value}
                checked={value.includes(type.value)}
                onCheckedChange={(checked) => handleToggle(type.value, checked === true)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <Label htmlFor={type.value} className="cursor-pointer font-medium">
                  {type.label}
                </Label>
              </div>
            </label>
          ))}
        </div>
      </AnswerArea>
      )}
    </div>
  );
}
