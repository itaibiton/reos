"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "@/i18n/navigation";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "convex/react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  step1Schema,
  step2Schema,
  step3Schema,
  combinedVendorSchema,
  type VendorOnboardingFormData,
} from "@/lib/validations/vendor-onboarding";
import { BasicInfoStep } from "./steps/BasicInfoStep";
import { ProfessionalDetailsStep } from "./steps/ProfessionalDetailsStep";
import { ServiceAreaStep } from "./steps/ServiceAreaStep";
import { ReviewSubmitStep } from "./steps/ReviewSubmitStep";
import { useCurrentUser } from "@/hooks/useCurrentUser";

// ============================================================================
// Types
// ============================================================================

const STEPS = [
  { id: 1, name: "Basic Information", schema: step1Schema },
  { id: 2, name: "Professional Details", schema: step2Schema },
  { id: 3, name: "Service Area & Bio", schema: step3Schema },
  { id: 4, name: "Review & Submit", schema: combinedVendorSchema },
] as const;

const DRAFT_KEY = "vendor-onboarding-draft";
const DRAFT_EXPIRY_DAYS = 7;

interface DraftData {
  formData: Partial<VendorOnboardingFormData>;
  currentStep: number;
  savedAt: number;
}

// ============================================================================
// VendorOnboardingWizard Component
// ============================================================================

export function VendorOnboardingWizard() {
  const router = useRouter();
  const t = useTranslations("vendorOnboarding");
  const { user } = useCurrentUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);

  // Convex mutations and queries
  const upsertProfile = useMutation(api.serviceProviderProfiles.upsertProfile);
  const submitForApproval = useMutation(api.serviceProviderProfiles.submitForApproval);
  const existingProfile = useQuery(api.serviceProviderProfiles.getMyProfile);

  // Form setup
  const form = useForm<VendorOnboardingFormData>({
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      providerType: undefined,
      companyName: "",
      licenseNumber: "",
      yearsExperience: 0,
      specializations: [],
      serviceAreas: [],
      languages: [],
      bio: "",
      websiteUrl: "",
      externalRecommendations: "",
    },
  });

  // Load draft or existing profile on initial mount only
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (!user) return;
    if (hasInitialized.current) return;

    // Priority 1: Check localStorage for draft
    const draftStr = localStorage.getItem(DRAFT_KEY);
    if (draftStr) {
      try {
        const draft: DraftData = JSON.parse(draftStr);
        const now = Date.now();
        const daysOld =
          (now - draft.savedAt) / (1000 * 60 * 60 * 24);

        // Use draft if less than 7 days old
        if (daysOld < DRAFT_EXPIRY_DAYS) {
          form.reset(draft.formData as VendorOnboardingFormData);
          setCurrentStep(draft.currentStep);
          hasInitialized.current = true;
          return;
        } else {
          // Clear expired draft
          localStorage.removeItem(DRAFT_KEY);
        }
      } catch (error) {
        console.error("Failed to load draft:", error);
        localStorage.removeItem(DRAFT_KEY);
      }
    }

    // Priority 2: Load existing Convex profile (for resubmission)
    if (existingProfile) {
      const { profile, userName, userEmail } = existingProfile;
      form.reset({
        fullName: userName,
        email: userEmail,
        phoneNumber: profile.phoneNumber || "",
        providerType: profile.providerType,
        companyName: profile.companyName || "",
        licenseNumber: profile.licenseNumber || "",
        yearsExperience: profile.yearsExperience || 0,
        specializations: profile.specializations || [],
        serviceAreas: profile.serviceAreas || [],
        languages: profile.languages || [],
        bio: profile.bio || "",
        websiteUrl: (profile as any).websiteUrl || "",
        externalRecommendations: (profile as any).externalRecommendations || "",
      });
      hasInitialized.current = true;
    } else if (user.email) {
      // Default: Pre-fill email and name from Clerk
      form.setValue("email", user.email);
      if (user.name) {
        form.setValue("fullName", user.name);
      }
      if (user.role && (user.role === "broker" || user.role === "mortgage_advisor" || user.role === "lawyer")) {
        form.setValue("providerType", user.role);
      }
      hasInitialized.current = true;
    }
  }, [user, existingProfile, form]);

  // Save draft to localStorage on form change (debounced)
  useEffect(() => {
    const subscription = form.watch((data) => {
      // Debounce: save after 500ms of no changes
      const timeoutId = setTimeout(() => {
        const draft: DraftData = {
          formData: data as Partial<VendorOnboardingFormData>,
          currentStep,
          savedAt: Date.now(),
        };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      }, 500);

      return () => clearTimeout(timeoutId);
    });

    return () => subscription.unsubscribe();
  }, [form, currentStep]);

  // Validate current step and advance
  const handleNext = async () => {
    const stepSchema = STEPS[currentStep - 1].schema;

    // Get current step fields
    const values = form.getValues();
    const result = stepSchema.safeParse(values);

    if (!result.success) {
      // Trigger validation errors
      result.error.issues.forEach((issue) => {
        form.setError(String(issue.path[0]) as any, {
          message: issue.message,
        });
      });
      return;
    }

    // Save draft to Convex on step advance (except last step)
    if (currentStep < STEPS.length) {
      setIsSubmittingDraft(true);
      try {
        await upsertProfile({
          companyName: values.companyName,
          licenseNumber: values.licenseNumber || "",
          yearsExperience: values.yearsExperience || 0,
          specializations: values.specializations || [],
          serviceAreas: values.serviceAreas || [],
          languages: values.languages || [],
          bio: values.bio || "",
          phoneNumber: values.phoneNumber || "",
          preferredContact: "email", // Default
        });
      } catch (error) {
        console.error("Failed to save draft:", error);
        toast.error(t("errors.saveDraftFailed"));
      } finally {
        setIsSubmittingDraft(false);
      }
    }

    // Advance to next step
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    // Final validation
    const result = combinedVendorSchema.safeParse(form.getValues());
    if (!result.success) {
      toast.error(t("errors.validationFailed"));
      return;
    }

    const values = result.data;

    try {
      // Save final profile
      await upsertProfile({
        companyName: values.companyName,
        licenseNumber: values.licenseNumber,
        yearsExperience: values.yearsExperience,
        specializations: values.specializations,
        serviceAreas: values.serviceAreas,
        languages: values.languages,
        bio: values.bio,
        phoneNumber: values.phoneNumber,
        preferredContact: "email",
      });

      // Submit for approval
      await submitForApproval();

      // Clear draft
      localStorage.removeItem(DRAFT_KEY);

      // Show success
      toast.success(t("success.submitted"));

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to submit:", error);
      toast.error(t("errors.submitFailed"));
    }
  };

  // Step indicator
  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {STEPS.map((step, index) => (
        <div key={step.id} className="flex items-center flex-1">
          {/* Step circle */}
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all",
              step.id === currentStep &&
                "bg-primary text-primary-foreground ring-4 ring-primary/20",
              step.id < currentStep && "bg-green-500 text-white",
              step.id > currentStep && "bg-muted text-muted-foreground"
            )}
          >
            {step.id < currentStep ? <Check className="w-5 h-5" /> : step.id}
          </div>

          {/* Connecting line (except last step) */}
          {index < STEPS.length - 1 && (
            <div
              className={cn(
                "h-1 flex-1 mx-2 transition-all",
                step.id < currentStep ? "bg-green-500" : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep form={form} />;
      case 2:
        return <ProfessionalDetailsStep form={form} />;
      case 3:
        return <ServiceAreaStep form={form} />;
      case 4:
        return <ReviewSubmitStep form={form} onEdit={setCurrentStep} />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardContent className="p-6 sm:p-8">
        {renderStepIndicator()}

        <Form {...form}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {renderStep()}

              {/* Navigation buttons */}
              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1 || form.formState.isSubmitting}
                >
                  {t("actions.back")}
                </Button>

                {currentStep < STEPS.length ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={isSubmittingDraft}
                  >
                    {isSubmittingDraft ? (
                      <>
                        <Spinner className="me-2 h-4 w-4" />
                        {t("actions.saving")}
                      </>
                    ) : (
                      t("actions.next")
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? (
                      <>
                        <Spinner className="me-2 h-4 w-4" />
                        {t("actions.submitting")}
                      </>
                    ) : (
                      t("actions.submit")
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </Form>
      </CardContent>
    </Card>
  );
}
