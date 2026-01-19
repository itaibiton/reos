"use client";

import { useState, useCallback } from "react";
import { QuestionBubble } from "../QuestionBubble";
import { AnswerArea } from "../AnswerArea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface GoalsStepProps {
  value: string[] | undefined;
  onChange: (value: string[]) => void;
}

const GOALS = [
  {
    id: "appreciation",
    label: "Capital appreciation",
    description: "Property value growth over time",
  },
  {
    id: "rental_income",
    label: "Rental income",
    description: "Regular cash flow from tenants",
  },
  {
    id: "diversification",
    label: "Portfolio diversification",
    description: "Spreading investment risk across asset classes",
  },
  {
    id: "tax_benefits",
    label: "Tax benefits",
    description: "Tax advantages from real estate ownership",
  },
];

export function GoalsStep({ value = [], onChange }: GoalsStepProps) {
  const [showAnswer, setShowAnswer] = useState(false);

  // Stable callback to prevent QuestionBubble re-renders
  const handleTypingComplete = useCallback(() => {
    setShowAnswer(true);
  }, []);

  const handleToggle = (goalId: string, checked: boolean) => {
    if (checked) {
      onChange([...value, goalId]);
    } else {
      onChange(value.filter((id) => id !== goalId));
    }
  };

  return (
    <div className="space-y-6">
      <QuestionBubble
        question="What are your investment goals?"
        description="Select all that apply - this helps us understand your priorities."
        onTypingComplete={handleTypingComplete}
      />
      {showAnswer && (
      <AnswerArea>
        <div className="space-y-3">
          {GOALS.map((goal) => (
            <label
              key={goal.id}
              htmlFor={goal.id}
              className="flex items-start space-x-3 rtl:space-x-reverse rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <Checkbox
                id={goal.id}
                checked={value.includes(goal.id)}
                onCheckedChange={(checked) => handleToggle(goal.id, checked === true)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <Label htmlFor={goal.id} className="cursor-pointer font-medium">
                  {goal.label}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {goal.description}
                </p>
              </div>
            </label>
          ))}
        </div>
      </AnswerArea>
      )}
    </div>
  );
}
