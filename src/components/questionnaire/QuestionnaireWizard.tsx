"use client";

import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
  onSkip?: () => void;
  isLoading?: boolean;
  className?: string;
  /** Edit mode hides skip button and changes "Complete" to "Save Changes" */
  editMode?: boolean;
}

export function QuestionnaireWizard({
  steps,
  currentStep,
  onStepChange,
  onComplete,
  onSkip,
  isLoading = false,
  className,
  editMode = false,
}: QuestionnaireWizardProps) {
  const totalSteps = steps.length;
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;
  const currentStepData = steps[currentStep - 1];

  // Height animation state
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | "auto">("auto");

  // Observe content height changes for smooth animation
  useEffect(() => {
    const element = contentRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.contentRect.height;
        if (height > 0) {
          setContentHeight(height);
        }
      }
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

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
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "Enter" && !isLoading) {
        e.preventDefault();
        handleContinue();
      } else if (e.key === "Escape" && onSkip && !editMode) {
        e.preventDefault();
        onSkip();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleContinue, onSkip, isLoading, editMode]);

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

          {/* Content wrapper - animates height smoothly */}
          <motion.div
            className="mt-8 overflow-hidden"
            animate={{ height: contentHeight }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div ref={contentRef}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={currentStepData?.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {currentStepData?.component}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Navigation controls */}
          <div className="flex items-center justify-between pt-6">
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
              {isLastStep ? (editMode ? "Save Changes" : "Complete") : "Continue"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Skip link - outside the card (hidden in edit mode) */}
      {!editMode && onSkip && (
        <div className="mt-6 text-center">
          <button
            onClick={onSkip}
            disabled={isLoading}
            className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors disabled:opacity-50"
          >
            Skip for now
          </button>
        </div>
      )}
    </div>
  );
}
