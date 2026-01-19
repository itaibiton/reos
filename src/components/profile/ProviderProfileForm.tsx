"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
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

const ROLE_LABELS: Record<string, string> = {
  broker: "Real Estate Broker",
  mortgage_advisor: "Mortgage Advisor",
  lawyer: "Real Estate Lawyer",
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

// Convert languages to options format with flags
const languageOptions = LANGUAGE_OPTIONS.map((lang) => ({
  value: lang.value,
  label: lang.label,
  flag: lang.flag,
}));

export function ProviderProfileForm() {
  const { user } = useCurrentUser();
  const profile = useQuery(api.serviceProviderProfiles.getMyProfile);
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

  const specializationOptions = availableSpecializations.map((spec) => ({
    value: spec.value,
    label: spec.label,
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
      newErrors.serviceAreas = "Select at least one service area";
    }

    if (languages.length === 0) {
      newErrors.languages = "Select at least one language";
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
      toast.success("Profile saved successfully!");
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (profile === undefined || !user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const roleLabel = user.role ? ROLE_LABELS[user.role] : "Service Provider";

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-base font-medium">
                Company Name (Optional)
              </Label>
              <Input
                id="companyName"
                placeholder="Your company or firm name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            {/* License Number */}
            <div className="space-y-2">
              <Label htmlFor="licenseNumber" className="text-base font-medium">
                License Number (Optional)
              </Label>
              <Input
                id="licenseNumber"
                placeholder="Professional license number"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
              />
            </div>

            {/* Years of Experience */}
            <div className="space-y-2">
              <Label htmlFor="yearsExperience" className="text-base font-medium">
                Years of Experience (Optional)
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
                <Label className="text-base font-medium">Specializations</Label>
                <MultiSelectPopover
                  options={specializationOptions}
                  selected={specializations}
                  onChange={setSpecializations}
                  placeholder="Select specializations..."
                />
              </div>
            )}

            {/* Service Areas */}
            <div className="space-y-2">
              <Label className="text-base font-medium">Service Areas</Label>
              <MultiSelectPopover
                options={serviceAreaOptions}
                selected={serviceAreas}
                onChange={(selected) => {
                  setServiceAreas(selected);
                  setErrors((prev) => ({ ...prev, serviceAreas: "" }));
                }}
                placeholder="Select service areas..."
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
              <Label className="text-base font-medium">Languages Spoken</Label>
              <MultiSelectPopover
                options={languageOptions}
                selected={languages}
                onChange={(selected) => {
                  setLanguages(selected);
                  setErrors((prev) => ({ ...prev, languages: "" }));
                }}
                placeholder="Select languages..."
              />
              {errors.languages && (
                <p className="text-sm text-destructive">{errors.languages}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-base font-medium">
                Phone Number (Optional)
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
                Preferred Contact Method (Optional)
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
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Bio */}
            <div className="flex-1 flex flex-col gap-2">
              <Label htmlFor="bio" className="text-base font-medium">
                Professional Bio (Optional)
              </Label>
              <Textarea
                id="bio"
                placeholder="Tell investors about your experience and expertise..."
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
                Saving...
              </>
            ) : (
              "Save Profile"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
