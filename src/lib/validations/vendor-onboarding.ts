import { z } from "zod";

// ============================================================================
// Vendor Onboarding Validation Schemas
// ============================================================================

// Step 1: Basic Info
export const step1Schema = z.object({
  fullName: z.string().min(2, "nameMin"),
  email: z.string().email("emailInvalid"),
  phoneNumber: z.string().min(7, "phoneMin"),
  providerType: z.enum(["broker", "mortgage_advisor", "lawyer"], {
    errorMap: () => ({ message: "providerTypeRequired" }),
  }),
});

// Step 2: Professional Details
export const step2Schema = z.object({
  companyName: z.string().optional(),
  licenseNumber: z.string().min(1, "licenseRequired"),
  yearsExperience: z
    .number()
    .min(0, "experienceRange")
    .max(50, "experienceRange"),
  specializations: z.array(z.string()).min(1, "specializationRequired"),
});

// Step 3: Service Area & Bio
export const step3Schema = z.object({
  serviceAreas: z.array(z.string()).min(1, "serviceAreaRequired"),
  languages: z
    .array(
      z.enum(["english", "hebrew", "russian", "french", "spanish"], {
        errorMap: () => ({ message: "languageRequired" }),
      })
    )
    .min(1, "languageRequired"),
  bio: z.string().min(20, "bioMin").max(500, "bioMax"),
  websiteUrl: z
    .string()
    .url("websiteInvalid")
    .optional()
    .or(z.literal("")),
  externalRecommendations: z.string().max(2000, "recommendationsMax").optional(),
});

// Combined schema for final validation
export const combinedVendorSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema);

// TypeScript types
export type Step1FormData = z.infer<typeof step1Schema>;
export type Step2FormData = z.infer<typeof step2Schema>;
export type Step3FormData = z.infer<typeof step3Schema>;
export type VendorOnboardingFormData = z.infer<typeof combinedVendorSchema>;
