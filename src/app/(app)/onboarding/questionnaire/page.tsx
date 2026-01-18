"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import {
  QuestionnaireWizard,
  QuestionBubble,
  AnswerArea,
  type WizardStep,
} from "@/components/questionnaire";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// Placeholder step 1: Welcome with citizenship preview
function WelcomeStep() {
  return (
    <div className="space-y-6">
      <QuestionBubble
        question="Welcome! Let's get to know you better."
        description="This brief questionnaire will help us personalize your experience and match you with the right properties and service providers."
      />
      <AnswerArea>
        <div className="space-y-4">
          <p className="text-sm font-medium text-foreground">
            Are you an Israeli citizen?
          </p>
          <RadioGroup defaultValue="israeli">
            <div className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value="israeli" id="israeli" />
              <Label htmlFor="israeli" className="cursor-pointer flex-1">
                Yes, I am an Israeli citizen
              </Label>
            </div>
            <div className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value="non_israeli" id="non_israeli" />
              <Label htmlFor="non_israeli" className="cursor-pointer flex-1">
                No, I am not an Israeli citizen
              </Label>
            </div>
          </RadioGroup>
          <p className="text-xs text-muted-foreground">
            This helps us understand tax implications and legal requirements.
          </p>
        </div>
      </AnswerArea>
    </div>
  );
}

// Placeholder step 2: Coming soon message
function PlaceholderStep() {
  return (
    <div className="space-y-6">
      <QuestionBubble
        question="Great progress! More questions coming soon."
        description="We're building out the full questionnaire experience. In the next update, you'll be able to share more about your investment preferences."
      />
      <AnswerArea>
        <div className="rounded-lg border border-dashed border-muted-foreground/25 bg-muted/20 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Additional questions about your experience level, investment goals, and property preferences will appear here.
          </p>
        </div>
      </AnswerArea>
    </div>
  );
}

export default function QuestionnairePage() {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useCurrentUser();
  const questionnaire = useQuery(api.investorQuestionnaires.getByUser);
  const completeOnboarding = useMutation(api.users.completeOnboarding);
  const updateStep = useMutation(api.investorQuestionnaires.updateStep);
  const markComplete = useMutation(api.investorQuestionnaires.markComplete);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Define wizard steps
  const steps: WizardStep[] = useMemo(
    () => [
      {
        id: "welcome",
        title: "Welcome",
        component: <WelcomeStep />,
      },
      {
        id: "placeholder",
        title: "Almost done",
        component: <PlaceholderStep />,
      },
    ],
    []
  );

  // Get current step from questionnaire (default to 1)
  const currentStep = questionnaire?.currentStep ?? 1;

  // Redirect to dashboard if already onboarded
  useEffect(() => {
    if (!isUserLoading && user?.onboardingComplete) {
      router.push("/dashboard");
    }
  }, [isUserLoading, user, router]);

  // Redirect to role selection if no role
  useEffect(() => {
    if (!isUserLoading && user && !user.role) {
      router.push("/onboarding");
    }
  }, [isUserLoading, user, router]);

  // Handle step change
  const handleStepChange = async (step: number) => {
    try {
      await updateStep({ step });
    } catch (error) {
      console.error("Failed to update step:", error);
      toast.error("Failed to save progress. Please try again.");
    }
  };

  // Handle questionnaire completion
  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await markComplete();
      await completeOnboarding();
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to complete questionnaire:", error);
      toast.error("Failed to complete questionnaire. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Handle skip
  const handleSkip = async () => {
    setIsSubmitting(true);
    try {
      await completeOnboarding();
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to skip onboarding:", error);
      toast.error("Failed to skip. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Loading states
  const isLoading = isUserLoading || questionnaire === undefined;

  // Show loading while data loads or if already onboarded (redirecting)
  if (isLoading || !user || user.onboardingComplete) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  // Handle case where questionnaire doesn't exist
  // This shouldn't happen due to Phase 9 gate, but handle gracefully
  if (!questionnaire) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">
            Something went wrong. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <QuestionnaireWizard
      steps={steps}
      currentStep={currentStep}
      onStepChange={handleStepChange}
      onComplete={handleComplete}
      onSkip={handleSkip}
      isLoading={isSubmitting}
    />
  );
}
