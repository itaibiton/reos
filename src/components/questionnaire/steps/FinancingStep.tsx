"use client";

import { QuestionBubble } from "../QuestionBubble";
import { AnswerArea } from "../AnswerArea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface FinancingStepProps {
  value: string | undefined;
  onChange: (value: string) => void;
}

export function FinancingStep({ value, onChange }: FinancingStepProps) {
  return (
    <div className="space-y-6">
      <QuestionBubble
        question="How do you plan to finance your investment?"
        description="Understanding your financing approach helps us connect you with the right mortgage advisors."
      />
      <AnswerArea>
        <RadioGroup value={value} onValueChange={onChange}>
          <div className="space-y-3">
            <label
              htmlFor="cash"
              className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <RadioGroupItem value="cash" id="cash" className="mt-0.5" />
              <div className="flex-1">
                <Label htmlFor="cash" className="cursor-pointer font-medium">
                  All cash
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  No financing needed
                </p>
              </div>
            </label>
            <label
              htmlFor="mortgage"
              className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <RadioGroupItem value="mortgage" id="mortgage" className="mt-0.5" />
              <div className="flex-1">
                <Label htmlFor="mortgage" className="cursor-pointer font-medium">
                  Mortgage/Financing
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Will need mortgage advisor
                </p>
              </div>
            </label>
            <label
              htmlFor="exploring"
              className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <RadioGroupItem value="exploring" id="exploring" className="mt-0.5" />
              <div className="flex-1">
                <Label htmlFor="exploring" className="cursor-pointer font-medium">
                  Still exploring options
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Not sure yet
                </p>
              </div>
            </label>
          </div>
        </RadioGroup>
      </AnswerArea>
    </div>
  );
}
