"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { ProfileSummaryPanel, QuickReplyButtons } from "@/components/profile";
import { AIChatPanel } from "@/components/ai";
import { Skeleton } from "@/components/ui/skeleton";

export default function InvestorSummaryPage() {
  // Fetch questionnaire for completeness check
  const questionnaire = useQuery(api.investorQuestionnaires.getByUser);

  // Calculate completeness (simplified - full calculation in ProfileCompletenessBar)
  const isComplete = questionnaire?.status === "complete";

  // Loading state
  if (questionnaire === undefined) {
    return (
      <div className="h-[calc(100vh-64px)] grid grid-cols-1 lg:grid-cols-2 gap-0">
        <div className="border-e p-6 space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="p-6">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] grid grid-cols-1 lg:grid-cols-2 gap-0">
      {/* Left panel: Profile Summary */}
      <div className="border-e overflow-y-auto bg-background">
        <ProfileSummaryPanel />
      </div>

      {/* Right panel: AI Assistant */}
      <div className="flex flex-col h-full overflow-hidden">
        <AIChatPanel
          className="flex-1"
          renderQuickReplies={(sendMessage) => (
            <QuickReplyButtons
              onPromptSelect={sendMessage}
              profileComplete={isComplete}
            />
          )}
        />
      </div>
    </div>
  );
}
