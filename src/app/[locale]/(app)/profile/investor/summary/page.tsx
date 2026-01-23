"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { ProfileSummaryPanel, QuickReplyButtons, MobileInvestorSummary } from "@/components/profile";
import { AIChatPanel } from "@/components/ai";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

export default function InvestorSummaryPage() {
  // Fetch questionnaire for completeness check
  const questionnaire = useQuery(api.investorQuestionnaires.getByUser);

  // Calculate completeness (simplified - full calculation in ProfileCompletenessBar)
  const isComplete = questionnaire?.status === "complete";

  // Mobile detection
  const isMobile = useIsMobile();

  // Loading state - simple skeleton for both mobile and desktop
  if (questionnaire === undefined) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    );
  }

  // Mobile: Tabbed interface
  if (isMobile) {
    return <MobileInvestorSummary profileComplete={isComplete} />;
  }

  // Desktop: Side-by-side layout (existing)
  return (
    <div className="h-[calc(100vh-64px)] grid grid-cols-1 lg:grid-cols-2 gap-0 p-0">
      {/* Left panel: Profile Summary */}
      <div className="border-e overflow-y-auto bg-background">
        <ProfileSummaryPanel />
      </div>

      {/* Right panel: AI Assistant */}
      <div className="flex flex-col h-full overflow-hidden">
        <AIChatPanel
          className="flex-1"
          autoGreet={true}
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
