"use client";

import { useState, useCallback } from "react";
import { QuestionBubble } from "../QuestionBubble";
import { AnswerArea } from "../AnswerArea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PROPERTY_AMENITIES } from "@/lib/constants";

interface AmenitiesStepProps {
  value: string[] | undefined;
  onChange: (value: string[]) => void;
}

export function AmenitiesStep({ value = [], onChange }: AmenitiesStepProps) {
  const [showAnswer, setShowAnswer] = useState(false);

  // Stable callback to prevent QuestionBubble re-renders
  const handleTypingComplete = useCallback(() => {
    setShowAnswer(true);
  }, []);

  const handleToggle = (amenity: string, checked: boolean) => {
    if (checked) {
      onChange([...value, amenity]);
    } else {
      onChange(value.filter((v) => v !== amenity));
    }
  };

  return (
    <div className="space-y-6">
      <QuestionBubble
        question="What amenities are important to you?"
        description="Select all amenities you'd like in your investment property."
        onTypingComplete={handleTypingComplete}
      />
      {showAnswer && (
      <AnswerArea>
        <div className="grid grid-cols-3 gap-3">
          {PROPERTY_AMENITIES.map((amenity) => (
            <label
              key={amenity.value}
              htmlFor={amenity.value}
              className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <Checkbox
                id={amenity.value}
                checked={value.includes(amenity.value)}
                onCheckedChange={(checked) => handleToggle(amenity.value, checked === true)}
              />
              <Label htmlFor={amenity.value} className="cursor-pointer font-medium text-xs">
                {amenity.label}
              </Label>
            </label>
          ))}
        </div>
      </AnswerArea>
      )}
    </div>
  );
}
