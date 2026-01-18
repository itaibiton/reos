"use client";

import { QuestionBubble } from "../QuestionBubble";
import { AnswerArea } from "../AnswerArea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface InvestmentTypeStepProps {
  value: string | undefined;
  onChange: (value: string) => void;
}

export function InvestmentTypeStep({ value, onChange }: InvestmentTypeStepProps) {
  return (
    <div className="space-y-6">
      <QuestionBubble
        question="What type of investment are you looking for?"
        description="Understanding your goals helps us match you with the right properties and service providers."
      />
      <AnswerArea>
        <RadioGroup value={value} onValueChange={onChange}>
          <div className="space-y-3">
            <label
              htmlFor="residential"
              className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <RadioGroupItem value="residential" id="residential" />
              <div className="flex-1">
                <Label htmlFor="residential" className="cursor-pointer font-medium">
                  Primary residence
                </Label>
                <p className="text-sm text-muted-foreground mt-0.5">
                  I plan to live in the property
                </p>
              </div>
            </label>
            <label
              htmlFor="investment"
              className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <RadioGroupItem value="investment" id="investment" />
              <div className="flex-1">
                <Label htmlFor="investment" className="cursor-pointer font-medium">
                  Investment property
                </Label>
                <p className="text-sm text-muted-foreground mt-0.5">
                  For rental income or appreciation
                </p>
              </div>
            </label>
          </div>
        </RadioGroup>
      </AnswerArea>
    </div>
  );
}
