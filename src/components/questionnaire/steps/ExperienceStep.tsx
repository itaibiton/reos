"use client";

import { QuestionBubble } from "../QuestionBubble";
import { AnswerArea } from "../AnswerArea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface ExperienceStepProps {
  value: string | undefined;
  onChange: (value: string) => void;
}

export function ExperienceStep({ value, onChange }: ExperienceStepProps) {
  return (
    <div className="space-y-6">
      <QuestionBubble
        question="How much experience do you have with Israeli real estate?"
        description="This helps us tailor our recommendations and guidance to your knowledge level."
      />
      <AnswerArea>
        <RadioGroup value={value} onValueChange={onChange}>
          <div className="space-y-3">
            <label
              htmlFor="none"
              className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <RadioGroupItem value="none" id="none" />
              <div className="flex-1">
                <Label htmlFor="none" className="cursor-pointer font-medium">
                  No experience
                </Label>
                <p className="text-sm text-muted-foreground mt-0.5">
                  This would be my first investment in Israeli real estate
                </p>
              </div>
            </label>
            <label
              htmlFor="some"
              className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <RadioGroupItem value="some" id="some" />
              <div className="flex-1">
                <Label htmlFor="some" className="cursor-pointer font-medium">
                  Some experience
                </Label>
                <p className="text-sm text-muted-foreground mt-0.5">
                  I&apos;ve researched or made 1-2 investments
                </p>
              </div>
            </label>
            <label
              htmlFor="experienced"
              className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <RadioGroupItem value="experienced" id="experienced" />
              <div className="flex-1">
                <Label htmlFor="experienced" className="cursor-pointer font-medium">
                  Experienced investor
                </Label>
                <p className="text-sm text-muted-foreground mt-0.5">
                  I&apos;ve made multiple investments in Israeli real estate
                </p>
              </div>
            </label>
          </div>
        </RadioGroup>
      </AnswerArea>
    </div>
  );
}
