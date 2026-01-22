"use client";

import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { InlineFieldEditor } from "./InlineFieldEditor";
import { useTranslations } from "next-intl";

type QuestionnaireData = {
  citizenship?: string;
  residencyStatus?: string;
  experienceLevel?: string;
  ownsPropertyInIsrael?: boolean;
  investmentType?: string;
  budgetMin?: number;
  budgetMax?: number;
  investmentHorizon?: string;
  investmentGoals?: string[];
  yieldPreference?: string;
  financingApproach?: string;
  preferredPropertyTypes?: string[];
  preferredLocations?: string[];
  purchaseTimeline?: string;
  servicesNeeded?: string[];
};

type FieldConfig = {
  key: keyof QuestionnaireData;
  labelKey: string;
  type: "text" | "select" | "multiselect" | "number" | "boolean";
  options?: string[];
};

type SectionConfig = {
  id: string;
  titleKey: string;
  fields: FieldConfig[];
};

interface ProfileSectionProps {
  section: SectionConfig;
  questionnaire: QuestionnaireData;
  onFieldSave: (fieldName: string, value: any) => Promise<void>;
}

// Define questionnaire sections with field configurations
export const QUESTIONNAIRE_SECTIONS: SectionConfig[] = [
  {
    id: "basics",
    titleKey: "sections.basics",
    fields: [
      {
        key: "citizenship",
        labelKey: "fields.citizenship",
        type: "select",
        options: ["us", "israeli", "dual", "other"],
      },
      {
        key: "residencyStatus",
        labelKey: "fields.residencyStatus",
        type: "select",
        options: ["us_citizen", "us_resident", "israeli_citizen", "other"],
      },
      {
        key: "experienceLevel",
        labelKey: "fields.experienceLevel",
        type: "select",
        options: ["first_time", "some_experience", "experienced", "professional"],
      },
      {
        key: "ownsPropertyInIsrael",
        labelKey: "fields.propertyOwnership",
        type: "boolean",
      },
      {
        key: "investmentType",
        labelKey: "fields.investmentType",
        type: "select",
        options: ["personal_use", "investment", "both"],
      },
    ],
  },
  {
    id: "financial",
    titleKey: "sections.financial",
    fields: [
      {
        key: "budgetMin",
        labelKey: "fields.budgetMin",
        type: "number",
      },
      {
        key: "budgetMax",
        labelKey: "fields.budgetMax",
        type: "number",
      },
      {
        key: "investmentHorizon",
        labelKey: "fields.investmentHorizon",
        type: "select",
        options: ["short_term", "medium_term", "long_term"],
      },
      {
        key: "investmentGoals",
        labelKey: "fields.investmentGoals",
        type: "multiselect",
        options: ["capital_growth", "rental_income", "personal_use", "diversification"],
      },
      {
        key: "yieldPreference",
        labelKey: "fields.yieldPreference",
        type: "select",
        options: ["high_yield", "balanced", "low_yield_stable"],
      },
      {
        key: "financingApproach",
        labelKey: "fields.financingApproach",
        type: "select",
        options: ["cash", "mortgage", "mixed"],
      },
    ],
  },
  {
    id: "preferences",
    titleKey: "sections.preferences",
    fields: [
      {
        key: "preferredPropertyTypes",
        labelKey: "fields.propertyTypes",
        type: "multiselect",
        options: ["apartment", "house", "penthouse", "garden_apartment", "studio"],
      },
      {
        key: "preferredLocations",
        labelKey: "fields.preferredLocations",
        type: "multiselect",
        options: ["tel_aviv", "jerusalem", "haifa", "herzliya", "netanya"],
      },
    ],
  },
  {
    id: "timeline",
    titleKey: "sections.timeline",
    fields: [
      {
        key: "purchaseTimeline",
        labelKey: "fields.purchaseTimeline",
        type: "select",
        options: ["immediate", "3_months", "6_months", "year_plus"],
      },
      {
        key: "servicesNeeded",
        labelKey: "fields.servicesNeeded",
        type: "multiselect",
        options: ["broker", "mortgage_advisor", "lawyer", "tax_consultant", "all"],
      },
    ],
  },
];

export function ProfileSection({
  section,
  questionnaire,
  onFieldSave,
}: ProfileSectionProps) {
  const t = useTranslations("profileSummary");
  const tOptions = useTranslations("profileSummary.options");

  // Check if section is incomplete
  const incomplete = section.fields.some(
    (field) => {
      const value = questionnaire[field.key];
      return (
        value === undefined ||
        value === null ||
        (Array.isArray(value) && value.length === 0)
      );
    }
  );

  // Helper to safely get option translation, falling back to formatted value
  const translateOption = (val: string): string => {
    const translated = tOptions(val);
    // If translation returns a key-like string (contains dots or matches the key), use formatted fallback
    if (translated.includes(".") || translated === val) {
      // Convert snake_case to Title Case as fallback
      return val.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    }
    return translated;
  };

  const formatValue = (value: any, field: FieldConfig): string => {
    if (value === undefined || value === null) return t("fields.notSet");

    if (field.type === "boolean") {
      return value ? t("yes") : t("no");
    }

    if (Array.isArray(value)) {
      if (value.length === 0) return t("fields.notSet");
      return value.map((v) => translateOption(v)).join(", ");
    }

    if (field.type === "select" && field.options) {
      return translateOption(value);
    }

    if (field.type === "number") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
      }).format(value);
    }

    return String(value);
  };

  return (
    <AccordionItem value={section.id}>
      <AccordionTrigger>
        <div className="flex items-center gap-2">
          <span>{t(section.titleKey)}</span>
          {incomplete && (
            <Badge variant="destructive" className="text-xs">
              {t("incomplete")}
            </Badge>
          )}
        </div>
      </AccordionTrigger>

      <AccordionContent>
        <div className="space-y-3">
          {section.fields.map((field) => (
            <InlineFieldEditor
              key={field.key}
              label={t(field.labelKey)}
              value={questionnaire[field.key]}
              onSave={(value) => onFieldSave(field.key, value)}
              formatValue={(value) => formatValue(value, field)}
              renderInput={(value, onChange) => {
                if (field.type === "boolean") {
                  return (
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={value || false}
                        onCheckedChange={onChange}
                        id={field.key}
                      />
                      <Label htmlFor={field.key}>
                        {value ? t("yes") : t("no")}
                      </Label>
                    </div>
                  );
                }

                if (field.type === "number") {
                  return (
                    <Input
                      type="number"
                      value={value || ""}
                      onChange={(e) =>
                        onChange(
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      placeholder={t(field.labelKey)}
                    />
                  );
                }

                if (field.type === "select" && field.options) {
                  return (
                    <Select value={value || ""} onValueChange={onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t("selectOption")} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options.map((option) => (
                          <SelectItem key={option} value={option}>
                            {tOptions(option)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  );
                }

                if (field.type === "multiselect" && field.options) {
                  // For multiselect, use checkboxes for simplicity
                  const selectedValues = (value as string[]) || [];
                  return (
                    <div className="space-y-2">
                      {field.options.map((option) => (
                        <div key={option} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`${field.key}-${option}`}
                            checked={selectedValues.includes(option)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                onChange([...selectedValues, option]);
                              } else {
                                onChange(
                                  selectedValues.filter((v) => v !== option)
                                );
                              }
                            }}
                            className="rounded border-input"
                          />
                          <Label htmlFor={`${field.key}-${option}`}>
                            {tOptions(option)}
                          </Label>
                        </div>
                      ))}
                    </div>
                  );
                }

                // Default: text input
                return (
                  <Input
                    type="text"
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={t(field.labelKey)}
                  />
                );
              }}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
