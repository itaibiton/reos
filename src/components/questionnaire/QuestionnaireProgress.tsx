"use client";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export interface StepConfig {
  id: string;
  title: string;
}

interface QuestionnaireProgressProps {
  steps: StepConfig[];
  currentStep: number;
  className?: string;
}

export function QuestionnaireProgress({
  steps,
  currentStep,
  className,
}: QuestionnaireProgressProps) {
  const totalSteps = steps.length;
  const progressPercent = ((currentStep - 1) / (totalSteps - 1)) * 100;
  const currentStepConfig = steps[currentStep - 1];
  const nextStepConfig = steps[currentStep];

  return (
    <div className={cn("space-y-3 transition-all duration-300", className)}>
      {/* Step counter */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">
          Step {currentStep} of {totalSteps}
        </span>
        {currentStepConfig && (
          <span className="text-muted-foreground transition-opacity duration-200">
            {currentStepConfig.title}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <Progress
        value={progressPercent}
        className="h-2 transition-all duration-300"
      />

      {/* Next step preview */}
      {nextStepConfig && (
        <p className="text-xs text-muted-foreground transition-opacity duration-200">
          Up next: {nextStepConfig.title}
        </p>
      )}
    </div>
  );
}
