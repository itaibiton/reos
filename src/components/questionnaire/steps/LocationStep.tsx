"use client";

import { QuestionBubble } from "../QuestionBubble";
import { AnswerArea } from "../AnswerArea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ISRAELI_LOCATIONS } from "@/lib/constants";

interface LocationStepProps {
  value: string[] | undefined;
  onChange: (value: string[]) => void;
}

export function LocationStep({ value = [], onChange }: LocationStepProps) {
  const handleToggle = (location: string, checked: boolean) => {
    if (checked) {
      onChange([...value, location]);
    } else {
      onChange(value.filter((v) => v !== location));
    }
  };

  return (
    <div className="space-y-6">
      <QuestionBubble
        question="Which cities or areas interest you?"
        description="Select all locations you'd consider for investment."
      />
      <AnswerArea>
        <div className="grid grid-cols-2 gap-3">
          {ISRAELI_LOCATIONS.map((location) => (
            <label
              key={location}
              htmlFor={location}
              className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <Checkbox
                id={location}
                checked={value.includes(location)}
                onCheckedChange={(checked) => handleToggle(location, checked === true)}
              />
              <Label htmlFor={location} className="cursor-pointer font-medium text-sm">
                {location}
              </Label>
            </label>
          ))}
        </div>
      </AnswerArea>
    </div>
  );
}
