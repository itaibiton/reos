"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

const TOAST_ID = "incomplete-profile-reminder";

// Extract toast content to a separate component to use translations
function ToastContent({ onComplete }: { onComplete: () => void }) {
  const t = useTranslations("settings.profile");

  return (
    <div className="relative w-full rounded-xl p-[2px] overflow-hidden">
      {/* Animated gradient border */}
      <div className="absolute inset-0 rounded-xl animate-gradient-border" />
      {/* Glow effect */}
      <div className="absolute inset-[-4px] rounded-xl animate-gradient-border-glow" />
      {/* Content */}
      <div className="relative rounded-[10px] bg-background p-4 shadow-lg">
        <div className="flex flex-col gap-3">
          <div>
            <p className="font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-500" />
              {t("completeYourProfile")}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {t("unlockRecommendations")}
            </p>
          </div>
          <Button
            size="sm"
            className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700"
            onClick={onComplete}
          >
            {t("completeNow")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function IncompleteProfileReminder() {
  const router = useRouter();
  const pathname = usePathname();
  const { effectiveRole } = useCurrentUser();
  const questionnaire = useQuery(
    api.investorQuestionnaires.getByUser,
    effectiveRole === "investor" ? undefined : "skip"
  );
  const lastPathRef = useRef<string>("");

  useEffect(() => {
    // Only show for investors with incomplete questionnaire
    if (effectiveRole !== "investor") return;
    if (!questionnaire) return;
    if (questionnaire.status === "complete") {
      toast.dismiss(TOAST_ID);
      return;
    }

    // Don't show on onboarding/questionnaire pages (but track the path)
    if (pathname.startsWith("/onboarding") || pathname.startsWith("/profile/investor/questionnaire")) {
      toast.dismiss(TOAST_ID);
      lastPathRef.current = pathname;
      return;
    }

    // Show on every page navigation (new path)
    if (pathname === lastPathRef.current) return;
    lastPathRef.current = pathname;

    // Dismiss any existing toast first, then show new one
    toast.dismiss(TOAST_ID);

    // Small delay to ensure smooth transition
    setTimeout(() => {
      toast.custom(
        () => (
          <ToastContent
            onComplete={() => {
              toast.dismiss(TOAST_ID);
              router.push("/profile/investor/questionnaire");
            }}
          />
        ),
        {
          id: TOAST_ID,
          duration: Infinity,
        }
      );
    }, 500);
  }, [effectiveRole, questionnaire, pathname, router]);

  return null;
}
