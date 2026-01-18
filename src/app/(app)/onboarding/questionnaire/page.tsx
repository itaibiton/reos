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
  type WizardStep,
} from "@/components/questionnaire";
import {
  CitizenshipStep,
  ResidencyStep,
  ExperienceStep,
  OwnershipStep,
  InvestmentTypeStep,
} from "@/components/questionnaire/steps";

export default function QuestionnairePage() {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useCurrentUser();
  const questionnaire = useQuery(api.investorQuestionnaires.getByUser);
  const completeOnboarding = useMutation(api.users.completeOnboarding);
  const updateStep = useMutation(api.investorQuestionnaires.updateStep);
  const markComplete = useMutation(api.investorQuestionnaires.markComplete);
  const saveAnswers = useMutation(api.investorQuestionnaires.saveAnswers);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Local state for each answer
  const [citizenship, setCitizenship] = useState<string | undefined>();
  const [residencyStatus, setResidencyStatus] = useState<string | undefined>();
  const [experienceLevel, setExperienceLevel] = useState<string | undefined>();
  const [ownsPropertyInIsrael, setOwnsPropertyInIsrael] = useState<boolean | undefined>();
  const [investmentType, setInvestmentType] = useState<string | undefined>();

  // Initialize state from questionnaire data (for draft restoration)
  useEffect(() => {
    if (questionnaire) {
      setCitizenship(questionnaire.citizenship);
      setResidencyStatus(questionnaire.residencyStatus);
      setExperienceLevel(questionnaire.experienceLevel);
      setOwnsPropertyInIsrael(questionnaire.ownsPropertyInIsrael);
      setInvestmentType(questionnaire.investmentType);
    }
  }, [questionnaire]);

  // Define wizard steps with real components
  const steps: WizardStep[] = useMemo(
    () => [
      {
        id: "citizenship",
        title: "Citizenship",
        component: <CitizenshipStep value={citizenship} onChange={setCitizenship} />,
      },
      {
        id: "residency",
        title: "Residency",
        component: <ResidencyStep value={residencyStatus} onChange={setResidencyStatus} />,
      },
      {
        id: "experience",
        title: "Experience",
        component: <ExperienceStep value={experienceLevel} onChange={setExperienceLevel} />,
      },
      {
        id: "ownership",
        title: "Ownership",
        component: <OwnershipStep value={ownsPropertyInIsrael} onChange={setOwnsPropertyInIsrael} />,
      },
      {
        id: "investment-type",
        title: "Investment Type",
        component: <InvestmentTypeStep value={investmentType} onChange={setInvestmentType} />,
      },
    ],
    [citizenship, residencyStatus, experienceLevel, ownsPropertyInIsrael, investmentType]
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

  // Save current answers to Convex
  const saveProgress = async () => {
    try {
      await saveAnswers({
        citizenship,
        residencyStatus,
        experienceLevel,
        ownsPropertyInIsrael,
        investmentType,
      });
    } catch (error) {
      console.error("Failed to save answers:", error);
    }
  };

  // Handle step change - save before navigating
  const handleStepChange = async (step: number) => {
    try {
      await saveProgress();
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
      await saveProgress();
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
      await saveProgress();
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
