"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Accordion } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileCompletenessBar } from "./ProfileCompletenessBar";
import { ProfileSection, QUESTIONNAIRE_SECTIONS } from "./ProfileSection";
import { toast } from "sonner";
import { useState, useMemo } from "react";

interface ProfileSummaryPanelProps {
  className?: string;
}

export function ProfileSummaryPanel({ className }: ProfileSummaryPanelProps) {
  const questionnaire = useQuery(api.investorQuestionnaires.getByUser);
  const saveAnswers = useMutation(api.investorQuestionnaires.saveAnswers);

  // Determine first incomplete section for default expand
  const firstIncompleteSection = useMemo(() => {
    if (!questionnaire) return "basics";

    for (const section of QUESTIONNAIRE_SECTIONS) {
      const hasIncompleteField = section.fields.some((field) => {
        const value = questionnaire[field.key];
        return (
          value === undefined ||
          value === null ||
          (Array.isArray(value) && value.length === 0)
        );
      });

      if (hasIncompleteField) {
        return section.id;
      }
    }

    // All complete, default to first section
    return "basics";
  }, [questionnaire]);

  const [activeSection, setActiveSection] = useState(firstIncompleteSection);

  // Update field value
  const handleFieldSave = async (fieldName: string, value: any) => {
    try {
      await saveAnswers({ [fieldName]: value });
      toast.success("Saved successfully");
    } catch (error) {
      console.error("Failed to save field:", error);
      toast.error("Failed to save. Please try again.");
      throw error;
    }
  };

  // Handle jump to incomplete section from completeness bar
  const handleJumpToIncomplete = (sectionId: string) => {
    setActiveSection(sectionId);
    // Scroll to accordion if needed
    const element = document.querySelector(`[value="${sectionId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Loading state
  if (questionnaire === undefined) {
    return (
      <div className={className}>
        <div className="sticky top-0 bg-background z-10 p-4 border-b">
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="p-6 space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  // No questionnaire found
  if (!questionnaire) {
    return (
      <div className={className}>
        <div className="p-6 text-center text-muted-foreground">
          No questionnaire found. Please complete onboarding first.
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Completeness bar at top */}
      <ProfileCompletenessBar
        questionnaire={questionnaire}
        onJumpToIncomplete={handleJumpToIncomplete}
      />

      {/* Accordion sections */}
      <div className="px-4 pb-4">
        <Accordion
          type="single"
          collapsible
          value={activeSection}
          onValueChange={setActiveSection}
        >
          {QUESTIONNAIRE_SECTIONS.map((section) => (
            <ProfileSection
              key={section.id}
              section={section}
              questionnaire={questionnaire}
              onFieldSave={handleFieldSave}
            />
          ))}
        </Accordion>
      </div>
    </div>
  );
}
