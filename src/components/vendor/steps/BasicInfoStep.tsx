"use client";

import { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { User, Mail, Phone, Briefcase } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProfilePhotoUpload } from "@/components/shared/ProfilePhotoUpload";
import { VendorOnboardingFormData } from "@/lib/validations/vendor-onboarding";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface BasicInfoStepProps {
  form: UseFormReturn<VendorOnboardingFormData>;
}

export function BasicInfoStep({ form }: BasicInfoStepProps) {
  const t = useTranslations("vendorOnboarding");
  const { user } = useCurrentUser();

  const providerTypeOptions = [
    { value: "broker", label: t("providerTypes.broker") },
    { value: "mortgage_advisor", label: t("providerTypes.mortgageAdvisor") },
    { value: "lawyer", label: t("providerTypes.lawyer") },
  ];

  // Check if provider type is already set from role
  const hasProviderType = user?.role && (
    user.role === "broker" ||
    user.role === "mortgage_advisor" ||
    user.role === "lawyer"
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">
          {t("steps.basicInfo.title")}
        </h2>
        <p className="text-muted-foreground">
          {t("steps.basicInfo.description")}
        </p>
      </div>

      {/* Profile Photo Upload */}
      <div className="flex justify-center py-4">
        <ProfilePhotoUpload currentPhotoUrl={user?.imageUrl} />
      </div>

      {/* Full Name */}
      <FormField
        control={form.control}
        name="fullName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              {t("fields.fullName.label")}
            </FormLabel>
            <FormControl>
              <Input
                placeholder={t("fields.fullName.placeholder")}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Email */}
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              {t("fields.email.label")}
            </FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder={t("fields.email.placeholder")}
                readOnly
                disabled
                {...field}
                className="bg-muted"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Phone Number */}
      <FormField
        control={form.control}
        name="phoneNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              {t("fields.phoneNumber.label")}
            </FormLabel>
            <FormControl>
              <Input
                type="tel"
                placeholder={t("fields.phoneNumber.placeholder")}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Provider Type */}
      <FormField
        control={form.control}
        name="providerType"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              {t("fields.providerType.label")}
            </FormLabel>
            {hasProviderType ? (
              <div className="px-3 py-2 bg-muted border rounded-md text-sm">
                {providerTypeOptions.find((opt) => opt.value === field.value)
                  ?.label || field.value}
              </div>
            ) : (
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("fields.providerType.placeholder")}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {providerTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
