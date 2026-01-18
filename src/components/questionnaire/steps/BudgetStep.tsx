"use client";

import { QuestionBubble } from "../QuestionBubble";
import { AnswerArea } from "../AnswerArea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BudgetStepProps {
  budgetMin: number | undefined;
  budgetMax: number | undefined;
  onBudgetMinChange: (value: number | undefined) => void;
  onBudgetMaxChange: (value: number | undefined) => void;
}

export function BudgetStep({
  budgetMin,
  budgetMax,
  onBudgetMinChange,
  onBudgetMaxChange,
}: BudgetStepProps) {
  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return "";
    return value.toLocaleString("en-US");
  };

  const parseCurrency = (value: string): number | undefined => {
    const cleaned = value.replace(/[^0-9]/g, "");
    if (cleaned === "") return undefined;
    return parseInt(cleaned, 10);
  };

  return (
    <div className="space-y-6">
      <QuestionBubble
        question="What's your investment budget range?"
        description="This helps us show properties that match your financial capacity. All amounts are in USD."
      />
      <AnswerArea>
        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <Label htmlFor="budgetMin" className="text-sm font-medium">
              Minimum Budget (USD)
            </Label>
            <div className="mt-2 flex items-center">
              <span className="mr-2 text-muted-foreground">$</span>
              <Input
                id="budgetMin"
                type="text"
                inputMode="numeric"
                placeholder="e.g., 100,000"
                value={formatCurrency(budgetMin)}
                onChange={(e) => onBudgetMinChange(parseCurrency(e.target.value))}
                className="flex-1"
              />
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <Label htmlFor="budgetMax" className="text-sm font-medium">
              Maximum Budget (USD)
            </Label>
            <div className="mt-2 flex items-center">
              <span className="mr-2 text-muted-foreground">$</span>
              <Input
                id="budgetMax"
                type="text"
                inputMode="numeric"
                placeholder="e.g., 500,000"
                value={formatCurrency(budgetMax)}
                onChange={(e) => onBudgetMaxChange(parseCurrency(e.target.value))}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </AnswerArea>
    </div>
  );
}
