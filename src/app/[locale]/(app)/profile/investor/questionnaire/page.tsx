"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
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

export default function EditQuestionnairePage() {
  const { user, isLoading: isUserLoading, effectiveRole } = useCurrentUser();
  const router = useRouter();
  const questionnaire = useQuery(api.investorQuestionnaires.getByUser);
  const updateStep = useMutation(api.investorQuestionnaires.updateStep);
  const saveAnswers = useMutation(api.investorQuestionnaires.saveAnswers);

  // Redirect non-investors away from this page
  useEffect(() => {
    if (!isUserLoading && effectiveRole && effectiveRole !== "investor") {
      router.push("/dashboard");
    }
  }, [isUserLoading, effectiveRole, router]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Local state for each answer
  const [citizenship, setCitizenship] = useState<string | undefined>();
  const [residencyStatus, setResidencyStatus] = useState<string | undefined>();
  const [experienceLevel, setExperienceLevel] = useState<string | undefined>();
  const [ownsPropertyInIsrael, setOwnsPropertyInIsrael] = useState<boolean | undefined>();
  const [investmentType, setInvestmentType] = useState<string | undefined>();
  const [budgetMin, setBudgetMin] = useState<number | undefined>();
  const [budgetMax, setBudgetMax] = useState<number | undefined>();
  const [investmentHorizon, setInvestmentHorizon] = useState<string | undefined>();
  const [investmentGoals, setInvestmentGoals] = useState<string[]>([]);
  const [yieldPreference, setYieldPreference] = useState<string | undefined>();
  const [financingApproach, setFinancingApproach] = useState<string | undefined>();
  const [preferredPropertyTypes, setPreferredPropertyTypes] = useState<string[]>([]);
  const [preferredLocations, setPreferredLocations] = useState<string[]>([]);
  const [minBedrooms, setMinBedrooms] = useState<number | undefined>();
  const [maxBedrooms, setMaxBedrooms] = useState<number | undefined>();
  const [minArea, setMinArea] = useState<number | undefined>();
  const [maxArea, setMaxArea] = useState<number | undefined>();
  const [preferredAmenities, setPreferredAmenities] = useState<string[]>([]);
  const [purchaseTimeline, setPurchaseTimeline] = useState<string | undefined>();
  const [additionalPreferences, setAdditionalPreferences] = useState<string | undefined>();
  const [servicesNeeded, setServicesNeeded] = useState<string[]>([]);

  // Initialize state from questionnaire data
  useEffect(() => {
    if (questionnaire) {
      setCitizenship(questionnaire.citizenship);
      setResidencyStatus(questionnaire.residencyStatus);
      setExperienceLevel(questionnaire.experienceLevel);
      setOwnsPropertyInIsrael(questionnaire.ownsPropertyInIsrael);
      setInvestmentType(questionnaire.investmentType);
      setBudgetMin(questionnaire.budgetMin);
      setBudgetMax(questionnaire.budgetMax);
      setInvestmentHorizon(questionnaire.investmentHorizon);
      setInvestmentGoals(questionnaire.investmentGoals ?? []);
      setYieldPreference(questionnaire.yieldPreference);
      setFinancingApproach(questionnaire.financingApproach);
      setPreferredPropertyTypes(questionnaire.preferredPropertyTypes ?? []);
      setPreferredLocations(questionnaire.preferredLocations ?? []);
      setMinBedrooms(questionnaire.minBedrooms);
      setMaxBedrooms(questionnaire.maxBedrooms);
      setMinArea(questionnaire.minArea);
      setMaxArea(questionnaire.maxArea);
      setPreferredAmenities(questionnaire.preferredAmenities ?? []);
      setPurchaseTimeline(questionnaire.purchaseTimeline);
      setAdditionalPreferences(questionnaire.additionalPreferences);
      setServicesNeeded(questionnaire.servicesNeeded ?? []);
    }
  }, [questionnaire]);

  // Define wizard steps
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

  // Track current step locally for edit mode (start at 1, don't use questionnaire's currentStep)
  const [currentStep, setCurrentStep] = useState(1);

  // Save current answers to Convex
  const saveProgress = async () => {
    try {
      await saveAnswers({
        citizenship,
        residencyStatus,
        experienceLevel,
        ownsPropertyInIsrael,
        investmentType,
        budgetMin,
        budgetMax,
        investmentHorizon,
        investmentGoals,
        yieldPreference,
        financingApproach,
        preferredPropertyTypes,
        preferredLocations,
        minBedrooms,
        maxBedrooms,
        minArea,
        maxArea,
        preferredAmenities,
        purchaseTimeline,
        additionalPreferences,
        servicesNeeded,
      });
    } catch (error) {
      console.error("Failed to save answers:", error);
      throw error;
    }
  };

  // Handle step change - save before navigating
  const handleStepChange = async (step: number) => {
    try {
      await saveProgress();
      await updateStep({ step });
      setCurrentStep(step);
    } catch (error) {
      console.error("Failed to update step:", error);
      toast.error("Failed to save progress. Please try again.");
    }
  };

  // Handle save completion (edit mode)
  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await saveProgress();
      toast.success("Profile updated successfully!");
      setIsSubmitting(false);
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast.error("Failed to save profile. Please try again.");
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
  if (!questionnaire) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">
            No questionnaire found. Please complete onboarding first.
          </p>
          <Link href="/onboarding" className="text-primary hover:underline mt-2 inline-block">
            Go to Onboarding
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with back link */}
      <div className="mb-6 max-w-[600px] mx-auto">
        <Link
          href="/profile/investor"
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          Back to Profile
        </Link>
        <h1 className="text-2xl font-bold mt-2">Edit Investment Profile</h1>
      </div>

      {/* Questionnaire Wizard in edit mode */}
      <QuestionnaireWizard
        steps={steps}
        currentStep={currentStep}
        onStepChange={handleStepChange}
        onComplete={handleComplete}
        isLoading={isSubmitting}
        editMode={true}
        className="min-h-0 p-0"
      />
    </div>
  );
}
