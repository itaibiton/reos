"use client";

import { QuestionBubble } from "../QuestionBubble";
import { AnswerArea } from "../AnswerArea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface CitizenshipStepProps {
  value: string | undefined;
  onChange: (value: string) => void;
}

export function CitizenshipStep({ value, onChange }: CitizenshipStepProps) {
  return (
    <div className="space-y-6">
      <QuestionBubble
        question="Are you an Israeli citizen?"
        description="This helps us understand the tax implications and legal requirements that may apply to your property purchase."
      />
      <AnswerArea>
        <RadioGroup value={value} onValueChange={onChange}>
          <div className="space-y-3">
            <label
              htmlFor="israeli"
              className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <RadioGroupItem value="israeli" id="israeli" />
              <Label htmlFor="israeli" className="cursor-pointer flex-1">
                Yes, I am an Israeli citizen
              </Label>
            </label>
            <label
              htmlFor="non_israeli"
              className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <RadioGroupItem value="non_israeli" id="non_israeli" />
              <Label htmlFor="non_israeli" className="cursor-pointer flex-1">
                No, I am not an Israeli citizen
              </Label>
            </label>
          </div>
        </RadioGroup>
      </AnswerArea>
    </div>
  );
}
