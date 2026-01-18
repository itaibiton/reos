"use client";

import { ReactNode, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuestionnaireProgress, StepConfig } from "./QuestionnaireProgress";
import { cn } from "@/lib/utils";

export interface WizardStep extends StepConfig {
  component: ReactNode;
}

interface QuestionnaireWizardProps {
  steps: WizardStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onComplete: () => void;
  onSkip: () => void;
  isLoading?: boolean;
  className?: string;
}

export function QuestionnaireWizard({
  steps,
  currentStep,
  onStepChange,
  onComplete,
  onSkip,
  isLoading = false,
  className,
}: QuestionnaireWizardProps) {
  const totalSteps = steps.length;
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;
  const currentStepData = steps[currentStep - 1];

  const handleBack = useCallback(() => {
    if (!isFirstStep) {
      onStepChange(currentStep - 1);
    }
  }, [isFirstStep, currentStep, onStepChange]);

  const handleContinue = useCallback(() => {
    if (isLastStep) {
      onComplete();
    } else {
      onStepChange(currentStep + 1);
    }
  }, [isLastStep, currentStep, onStepChange, onComplete]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "Enter" && !isLoading) {
        e.preventDefault();
        handleContinue();
      } else if (e.key === "Escape") {
        e.preventDefault();
        // Could show a confirmation dialog here
        onSkip();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleContinue, onSkip, isLoading]);

  return (
    <div
      className={cn(
        "flex min-h-[80vh] flex-col items-center justify-center p-6",
        className
      )}
    >
      <Card className="w-full max-w-[600px]">
        <CardContent className="space-y-8 p-8">
          {/* Progress indicator */}
          <QuestionnaireProgress
            steps={steps.map(({ id, title }) => ({ id, title }))}
            currentStep={currentStep}
          />

          {/* Current step content */}
          <div className="min-h-[300px] py-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {currentStepData?.component}
          </div>

          {/* Navigation controls */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isFirstStep || isLoading}
              className="min-w-[100px]"
            >
              Back
            </Button>

            <Button
              onClick={handleContinue}
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLastStep ? "Complete" : "Continue"}
            </Button>
          </div>

          {/* Skip link */}
          <div className="text-center">
            <button
              onClick={onSkip}
              disabled={isLoading}
              className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors disabled:opacity-50"
            >
              Skip for now
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
