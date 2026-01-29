"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useTranslations } from "next-intl";
import { api } from "../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { MultiSelectPopover } from "@/components/ui/multi-select-popover";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  Building02Icon,
  Diamond01Icon,
  CraneIcon,
  ChartLineData01Icon,
  UserAdd01Icon,
  RefreshIcon,
  Globe02Icon,
  Agreement01Icon,
  File01Icon,
  Search01Icon,
  Calculator01Icon,
} from "@hugeicons/core-free-icons";
import {
  SERVICE_AREAS,
  LANGUAGE_OPTIONS,
  CONTACT_PREFERENCE_OPTIONS,
  getSpecializationsForType,
} from "@/lib/constants";

type Language = "english" | "hebrew" | "russian" | "french" | "spanish";
type ContactPreference = "email" | "phone" | "whatsapp";

// Role key map for translations
const roleKeyMap: Record<string, string> = {
  broker: "broker",
  mortgage_advisor: "mortgageAdvisor",
  lawyer: "lawyer",
};

// Icon mapping for specializations
const SPEC_ICONS: Record<string, typeof Home01Icon> = {
  Home01Icon,
  Building02Icon,
  Diamond01Icon,
  CraneIcon,
  ChartLineData01Icon,
  UserAdd01Icon,
  RefreshIcon,
  Globe02Icon,
  Agreement01Icon,
  File01Icon,
  Search01Icon,
  Calculator01Icon,
};

// Convert service areas to options format
const serviceAreaOptions = SERVICE_AREAS.map((area) => ({
  value: area,
  label: area,
}));

export function ProviderProfileForm() {
  const t = useTranslations("common");
  const tForm = useTranslations("profile.providerForm");
  const tRoles = useTranslations("common.roles");

  // Convert languages to options format with flags using translations
  const languageOptions = LANGUAGE_OPTIONS.map((lang) => ({
    value: lang.value,
    label: t(`languages.${lang.value}`),
    flag: lang.flag,
  }));
  const { user } = useCurrentUser();
  const profileData = useQuery(api.serviceProviderProfiles.getMyProfile);
  const profile = profileData?.profile;
  const upsertProfile = useMutation(api.serviceProviderProfiles.upsertProfile);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [companyName, setCompanyName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [serviceAreas, setServiceAreas] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [preferredContact, setPreferredContact] = useState<ContactPreference | "">("");

  // Get role-specific specializations with icons
  const availableSpecializations = user?.role
    ? getSpecializationsForType(user.role)
    : [];

  // Get specialization label from translation key
  const getSpecializationLabel = (labelKey: string) => {
    // labelKey format: "common.specializations.broker.residential"
    // Extract the last two parts for the translation key
    const parts = labelKey.split(".");
    if (parts.length >= 4) {
      const providerType = parts[2];
      const specValue = parts[3];
      return t(`specializations.${providerType}.${specValue}`);
    }
    return labelKey;
  };

  const specializationOptions = availableSpecializations.map((spec) => ({
    value: spec.value,
    label: getSpecializationLabel(spec.labelKey),
    icon: SPEC_ICONS[spec.icon] ? (
      <HugeiconsIcon icon={SPEC_ICONS[spec.icon]} size={16} strokeWidth={1.5} />
    ) : undefined,
  }));

  // Pre-fill form when profile loads
  useEffect(() => {
    if (profile) {
      setCompanyName(profile.companyName ?? "");
      setLicenseNumber(profile.licenseNumber ?? "");
      setYearsExperience(profile.yearsExperience?.toString() ?? "");
      setSpecializations(profile.specializations);
      setServiceAreas(profile.serviceAreas);
      setLanguages(profile.languages);
      setBio(profile.bio ?? "");
      setPhoneNumber(profile.phoneNumber ?? "");
      setPreferredContact((profile.preferredContact as ContactPreference) ?? "");
    }
  }, [profile]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (serviceAreas.length === 0) {
      newErrors.serviceAreas = tForm("errors.selectServiceArea");
    }

    if (languages.length === 0) {
      newErrors.languages = tForm("errors.selectLanguage");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await upsertProfile({
        companyName: companyName || undefined,
        licenseNumber: licenseNumber || undefined,
        yearsExperience: yearsExperience ? parseInt(yearsExperience) : undefined,
        specializations,
        serviceAreas,
        languages: languages as Language[],
        bio: bio || undefined,
        phoneNumber: phoneNumber || undefined,
        preferredContact: preferredContact || undefined,
      });
      toast.success(tForm("toast.saved"));
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast.error(tForm("toast.saveFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (profileData === undefined || !user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const roleLabel = user.role && roleKeyMap[user.role]
    ? tRoles(roleKeyMap[user.role])
    : tForm("labels.serviceProvider");

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-base font-medium">
                {tForm("labels.companyName")}
              </Label>
              <Input
                id="companyName"
                placeholder={tForm("placeholders.companyName")}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            {/* License Number */}
            <div className="space-y-2">
              <Label htmlFor="licenseNumber" className="text-base font-medium">
                {tForm("labels.licenseNumber")}
              </Label>
              <Input
                id="licenseNumber"
                placeholder={tForm("placeholders.licenseNumber")}
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
              />
            </div>

            {/* Years of Experience */}
            <div className="space-y-2">
              <Label htmlFor="yearsExperience" className="text-base font-medium">
                {tForm("labels.yearsExperience")}
              </Label>
              <Input
                id="yearsExperience"
                type="number"
                placeholder="10"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
              />
            </div>

            {/* Specializations */}
            {specializationOptions.length > 0 && (
              <div className="space-y-2">
                <Label className="text-base font-medium">{tForm("labels.specializations")}</Label>
                <MultiSelectPopover
                  options={specializationOptions}
                  selected={specializations}
                  onChange={setSpecializations}
                  placeholder={tForm("placeholders.selectSpecializations")}
                />
              </div>
            )}

            {/* Service Areas */}
            <div className="space-y-2">
              <Label className="text-base font-medium">{tForm("labels.serviceAreas")}</Label>
              <MultiSelectPopover
                options={serviceAreaOptions}
                selected={serviceAreas}
                onChange={(selected) => {
                  setServiceAreas(selected);
                  setErrors((prev) => ({ ...prev, serviceAreas: "" }));
                }}
                placeholder={tForm("placeholders.selectServiceAreas")}
              />
              {errors.serviceAreas && (
                <p className="text-sm text-destructive">{errors.serviceAreas}</p>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6">
            {/* Languages */}
            <div className="space-y-2">
              <Label className="text-base font-medium">{tForm("labels.languagesSpoken")}</Label>
              <MultiSelectPopover
                options={languageOptions}
                selected={languages}
                onChange={(selected) => {
                  setLanguages(selected);
                  setErrors((prev) => ({ ...prev, languages: "" }));
                }}
                placeholder={tForm("placeholders.selectLanguages")}
              />
              {errors.languages && (
                <p className="text-sm text-destructive">{errors.languages}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-base font-medium">
                {tForm("labels.phoneNumber")}
              </Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+972..."
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            {/* Preferred Contact Method */}
            <div className="space-y-3">
              <Label className="text-base font-medium">
                {tForm("labels.preferredContact")}
              </Label>
              <RadioGroup
                value={preferredContact}
                onValueChange={(value) => setPreferredContact(value as ContactPreference)}
              >
                <div className="flex flex-wrap gap-4">
                  {CONTACT_PREFERENCE_OPTIONS.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-center space-x-2 rtl:space-x-reverse"
                    >
                      <RadioGroupItem value={option.value} id={`contact-${option.value}`} />
                      <Label htmlFor={`contact-${option.value}`} className="cursor-pointer">
                        {t(`contactPreferences.${option.value}`)}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Bio */}
            <div className="flex-1 flex flex-col gap-2">
              <Label htmlFor="bio" className="text-base font-medium">
                {tForm("labels.bio")}
              </Label>
              <Textarea
                id="bio"
                placeholder={tForm("placeholders.bio")}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="flex-1 min-h-[100px] resize-none"
              />
            </div>
          </div>
        </div>

        {/* Submit - Full Width */}
        <div className="mt-8">
          <Button type="submit" disabled={isSubmitting} size="lg">
            {isSubmitting ? (
              <>
                <Spinner className="me-2 h-4 w-4" />
                {tForm("buttons.saving")}
              </>
            ) : (
              tForm("buttons.saveProfile")
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
