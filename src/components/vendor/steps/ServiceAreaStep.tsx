"use client";

import { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { MapPin, Languages, FileText, Globe, MessageSquare } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { VendorOnboardingFormData } from "@/lib/validations/vendor-onboarding";

interface ServiceAreaStepProps {
  form: UseFormReturn<VendorOnboardingFormData>;
}

const ISRAELI_CITIES = [
  "Tel Aviv",
  "Jerusalem",
  "Haifa",
  "Beer Sheva",
  "Netanya",
  "Herzliya",
  "Ra'anana",
  "Ashdod",
  "Rishon LeZion",
  "Petah Tikva",
  "Bat Yam",
  "Holon",
  "Ramat Gan",
  "Rehovot",
  "Nationwide Israel",
];

const LANGUAGE_OPTIONS = [
  { value: "english", label: "English" },
  { value: "hebrew", label: "Hebrew (עברית)" },
  { value: "russian", label: "Russian (Русский)" },
  { value: "french", label: "French (Français)" },
  { value: "spanish", label: "Spanish (Español)" },
];

export function ServiceAreaStep({ form }: ServiceAreaStepProps) {
  const t = useTranslations("vendorOnboarding");
  const bioLength = form.watch("bio")?.length || 0;

  const handleCityToggle = (city: string, checked: boolean | "indeterminate") => {
    const current = form.getValues("serviceAreas") || [];
    if (checked === true) {
      form.setValue("serviceAreas", [...current, city]);
    } else {
      form.setValue(
        "serviceAreas",
        current.filter((c) => c !== city)
      );
    }
  };

  const handleLanguageToggle = (
    language: string,
    checked: boolean | "indeterminate"
  ) => {
    const current = form.getValues("languages") || [];
    if (checked === true) {
      form.setValue("languages", [...current, language] as any);
    } else {
      form.setValue(
        "languages",
        current.filter((l) => l !== language) as any
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">
          {t("steps.serviceArea.title")}
        </h2>
        <p className="text-muted-foreground">
          {t("steps.serviceArea.description")}
        </p>
      </div>

      {/* Service Areas */}
      <FormField
        control={form.control}
        name="serviceAreas"
        render={() => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              {t("fields.serviceAreas.label")}
            </FormLabel>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
              {ISRAELI_CITIES.map((city) => (
                <div key={city} className="flex items-start space-x-2 rtl:space-x-reverse">
                  <Checkbox
                    id={`city-${city}`}
                    checked={form.watch("serviceAreas")?.includes(city)}
                    onCheckedChange={(checked) => handleCityToggle(city, checked)}
                  />
                  <label
                    htmlFor={`city-${city}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {city}
                  </label>
                </div>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Languages */}
      <FormField
        control={form.control}
        name="languages"
        render={() => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-muted-foreground" />
              {t("fields.languages.label")}
            </FormLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              {LANGUAGE_OPTIONS.map((lang) => (
                <div key={lang.value} className="flex items-start space-x-2 rtl:space-x-reverse">
                  <Checkbox
                    id={`lang-${lang.value}`}
                    checked={form.watch("languages")?.includes(lang.value as any)}
                    onCheckedChange={(checked) =>
                      handleLanguageToggle(lang.value, checked)
                    }
                  />
                  <label
                    htmlFor={`lang-${lang.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {lang.label}
                  </label>
                </div>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Bio */}
      <FormField
        control={form.control}
        name="bio"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              {t("fields.bio.label")}
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder={t("fields.bio.placeholder")}
                rows={6}
                {...field}
              />
            </FormControl>
            <FormDescription>
              {bioLength}/500 {t("fields.bio.charCount")}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Website URL */}
      <FormField
        control={form.control}
        name="websiteUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              {t("fields.websiteUrl.label")}
              <span className="text-muted-foreground text-xs">
                ({t("optional")})
              </span>
            </FormLabel>
            <FormControl>
              <Input
                type="url"
                placeholder={t("fields.websiteUrl.placeholder")}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* External Recommendations */}
      <FormField
        control={form.control}
        name="externalRecommendations"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              {t("fields.externalRecommendations.label")}
              <span className="text-muted-foreground text-xs">
                ({t("optional")})
              </span>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder={t("fields.externalRecommendations.placeholder")}
                rows={4}
                {...field}
              />
            </FormControl>
            <FormDescription>
              {t("fields.externalRecommendations.description")}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
