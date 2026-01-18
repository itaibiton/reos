"use client";

import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
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

  // For smooth height animation
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(400);
  const [isAnimating, setIsAnimating] = useState(false);

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

  // Measure height helper
  const measureHeight = useCallback(() => {
    if (contentRef.current) {
      const newHeight = contentRef.current.scrollHeight;
      // Add small buffer to prevent cut-off
      setContentHeight(newHeight + 8);
    }
  }, []);

  // Animate height on step change
  useEffect(() => {
    if (!contentRef.current) return;

    setIsAnimating(true);

    // Wait for new content to render, then measure and animate
    const frameId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        measureHeight();
        setTimeout(() => setIsAnimating(false), 350);
      });
    });

    return () => cancelAnimationFrame(frameId);
  }, [currentStep, measureHeight]);

  // ResizeObserver for within-step content changes (like description appearing)
  useEffect(() => {
    if (!contentRef.current) return;

    const observer = new ResizeObserver(() => {
      measureHeight();
    });

    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [measureHeight]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
        <CardContent className="p-8">
          {/* Progress indicator */}
          <QuestionnaireProgress
            steps={steps.map(({ id, title }) => ({ id, title }))}
            currentStep={currentStep}
          />

          {/* Animated height container */}
          <div
            className="mt-8"
            style={{
              height: contentHeight,
              overflow: "hidden",
              transition: "height 300ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {/* Content wrapper for measurement */}
            <div ref={contentRef} key={currentStepData?.id} className="pb-4">
              {currentStepData?.component}
            </div>
          </div>

          {/* Navigation controls */}
          <div className="flex items-center justify-between pt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isFirstStep || isLoading || isAnimating}
              className="min-w-[100px]"
            >
              Back
            </Button>

            <Button
              onClick={handleContinue}
              disabled={isLoading || isAnimating}
              className="min-w-[120px]"
            >
              {isLastStep ? "Complete" : "Continue"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Skip link - outside the card */}
      <div className="mt-6 text-center">
        <button
          onClick={onSkip}
          disabled={isLoading}
          className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors disabled:opacity-50"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
