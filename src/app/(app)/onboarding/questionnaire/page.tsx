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
  BudgetStep,
  HorizonStep,
  GoalsStep,
  YieldStep,
  FinancingStep,
  PropertyTypeStep,
  PropertySizeStep,
  LocationStep,
  AmenitiesStep,
  TimelineStep,
  AdditionalPreferencesStep,
  ServicesStep,
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
  // Phase 12 fields
  const [budgetMin, setBudgetMin] = useState<number | undefined>();
  const [budgetMax, setBudgetMax] = useState<number | undefined>();
  const [investmentHorizon, setInvestmentHorizon] = useState<string | undefined>();
  const [investmentGoals, setInvestmentGoals] = useState<string[]>([]);
  const [yieldPreference, setYieldPreference] = useState<string | undefined>();
  const [financingApproach, setFinancingApproach] = useState<string | undefined>();
  // Phase 13 fields
  const [preferredPropertyTypes, setPreferredPropertyTypes] = useState<string[]>([]);
  const [preferredLocations, setPreferredLocations] = useState<string[]>([]);
  const [minBedrooms, setMinBedrooms] = useState<number | undefined>();
  const [maxBedrooms, setMaxBedrooms] = useState<number | undefined>();
  const [minArea, setMinArea] = useState<number | undefined>();
  const [maxArea, setMaxArea] = useState<number | undefined>();
  const [preferredAmenities, setPreferredAmenities] = useState<string[]>([]);
  // Phase 14 fields
  const [purchaseTimeline, setPurchaseTimeline] = useState<string | undefined>();
  const [additionalPreferences, setAdditionalPreferences] = useState<string | undefined>();
  const [servicesNeeded, setServicesNeeded] = useState<string[]>([]);

  // Initialize state from questionnaire data (for draft restoration)
  useEffect(() => {
    if (questionnaire) {
      setCitizenship(questionnaire.citizenship);
      setResidencyStatus(questionnaire.residencyStatus);
      setExperienceLevel(questionnaire.experienceLevel);
      setOwnsPropertyInIsrael(questionnaire.ownsPropertyInIsrael);
      setInvestmentType(questionnaire.investmentType);
      // Phase 12 fields
      setBudgetMin(questionnaire.budgetMin);
      setBudgetMax(questionnaire.budgetMax);
      setInvestmentHorizon(questionnaire.investmentHorizon);
      setInvestmentGoals(questionnaire.investmentGoals ?? []);
      setYieldPreference(questionnaire.yieldPreference);
      setFinancingApproach(questionnaire.financingApproach);
      // Phase 13 fields
      setPreferredPropertyTypes(questionnaire.preferredPropertyTypes ?? []);
      setPreferredLocations(questionnaire.preferredLocations ?? []);
      setMinBedrooms(questionnaire.minBedrooms);
      setMaxBedrooms(questionnaire.maxBedrooms);
      setMinArea(questionnaire.minArea);
      setMaxArea(questionnaire.maxArea);
      setPreferredAmenities(questionnaire.preferredAmenities ?? []);
      // Phase 14 fields
      setPurchaseTimeline(questionnaire.purchaseTimeline);
      setAdditionalPreferences(questionnaire.additionalPreferences);
      setServicesNeeded(questionnaire.servicesNeeded ?? []);
    }
  }, [questionnaire]);

  // Define wizard steps with real components
  // Each component has a key to ensure proper remounting when step changes
  const steps: WizardStep[] = useMemo(
    () => [
      {
        id: "citizenship",
        title: "Citizenship",
        component: <CitizenshipStep key="citizenship" value={citizenship} onChange={setCitizenship} />,
      },
      {
        id: "residency",
        title: "Residency",
        component: <ResidencyStep key="residency" value={residencyStatus} onChange={setResidencyStatus} />,
      },
      {
        id: "experience",
        title: "Experience",
        component: <ExperienceStep key="experience" value={experienceLevel} onChange={setExperienceLevel} />,
      },
      {
        id: "ownership",
        title: "Ownership",
        component: <OwnershipStep key="ownership" value={ownsPropertyInIsrael} onChange={setOwnsPropertyInIsrael} />,
      },
      {
        id: "investment-type",
        title: "Investment Type",
        component: <InvestmentTypeStep key="investment-type" value={investmentType} onChange={setInvestmentType} />,
      },
      {
        id: "budget",
        title: "Budget",
        component: (
          <BudgetStep
            key="budget"
            budgetMin={budgetMin}
            budgetMax={budgetMax}
            onBudgetMinChange={setBudgetMin}
            onBudgetMaxChange={setBudgetMax}
          />
        ),
      },
      {
        id: "horizon",
        title: "Timeline",
        component: <HorizonStep key="horizon" value={investmentHorizon} onChange={setInvestmentHorizon} />,
      },
      {
        id: "goals",
        title: "Goals",
        component: <GoalsStep key="goals" value={investmentGoals} onChange={setInvestmentGoals} />,
      },
      {
        id: "yield",
        title: "Yield",
        component: <YieldStep key="yield" value={yieldPreference} onChange={setYieldPreference} />,
      },
      {
        id: "financing",
        title: "Financing",
        component: <FinancingStep key="financing" value={financingApproach} onChange={setFinancingApproach} />,
      },
      {
        id: "property-type",
        title: "Property Type",
        component: <PropertyTypeStep key="property-type" value={preferredPropertyTypes} onChange={setPreferredPropertyTypes} />,
      },
      {
        id: "property-size",
        title: "Property Size",
        component: (
          <PropertySizeStep
            key="property-size"
            minBedrooms={minBedrooms}
            maxBedrooms={maxBedrooms}
            minArea={minArea}
            maxArea={maxArea}
            onMinBedroomsChange={setMinBedrooms}
            onMaxBedroomsChange={setMaxBedrooms}
            onMinAreaChange={setMinArea}
            onMaxAreaChange={setMaxArea}
          />
        ),
      },
      {
        id: "location",
        title: "Location",
        component: <LocationStep key="location" value={preferredLocations} onChange={setPreferredLocations} />,
      },
      {
        id: "amenities",
        title: "Amenities",
        component: <AmenitiesStep key="amenities" value={preferredAmenities} onChange={setPreferredAmenities} />,
      },
      {
        id: "timeline",
        title: "Timeline",
        component: <TimelineStep key="timeline" value={purchaseTimeline} onChange={setPurchaseTimeline} />,
      },
      {
        id: "additional-preferences",
        title: "Preferences",
        component: <AdditionalPreferencesStep key="additional-preferences" value={additionalPreferences} onChange={setAdditionalPreferences} />,
      },
      {
        id: "services",
        title: "Services",
        component: <ServicesStep key="services" value={servicesNeeded} onChange={setServicesNeeded} />,
      },
    ],
    [citizenship, residencyStatus, experienceLevel, ownsPropertyInIsrael, investmentType, budgetMin, budgetMax, investmentHorizon, investmentGoals, yieldPreference, financingApproach, preferredPropertyTypes, preferredLocations, minBedrooms, maxBedrooms, minArea, maxArea, preferredAmenities, purchaseTimeline, additionalPreferences, servicesNeeded]
  );

  // Get current step from questionnaire (default to 1)
  const currentStep = questionnaire?.currentStep ?? 1;

  // Redirect to properties if questionnaire already complete
  useEffect(() => {
    if (!isUserLoading && questionnaire?.status === "complete") {
      router.push("/properties");
    }
  }, [isUserLoading, questionnaire, router]);

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
        // Phase 12 fields
        budgetMin,
        budgetMax,
        investmentHorizon,
        investmentGoals,
        yieldPreference,
        financingApproach,
        // Phase 13 fields
        preferredPropertyTypes,
        preferredLocations,
        minBedrooms,
        maxBedrooms,
        minArea,
        maxArea,
        preferredAmenities,
        // Phase 14 fields
        purchaseTimeline,
        additionalPreferences,
        servicesNeeded,
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

  // Handle skip - saves progress but does NOT complete onboarding
  // User can access app but will see reminder to complete profile
  const handleSkip = async () => {
    setIsSubmitting(true);
    try {
      await saveProgress();
      // Don't call completeOnboarding - user skipped, not completed
      router.push("/properties");
    } catch (error) {
      console.error("Failed to skip onboarding:", error);
      toast.error("Failed to skip. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Loading states
  const isLoading = isUserLoading || questionnaire === undefined;

  // Show loading while data loads
  if (isLoading || !user) {
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
