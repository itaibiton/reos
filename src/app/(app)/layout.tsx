"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import { AppShell } from "@/components/layout/AppShell";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "../../../convex/_generated/api";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const { user, isLoading: isUserLoading } = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname();

  // Query questionnaire for investors to check if they've started it
  const questionnaire = useQuery(
    api.investorQuestionnaires.getByUser,
    user?.role === "investor" ? undefined : "skip"
  );

  const isLoading = isAuthLoading || isUserLoading;
  const isQuestionnaireLoading = user?.role === "investor" && questionnaire === undefined;

  // Check if current path is an onboarding path (role selection or questionnaire)
  const isOnboardingPath = pathname.startsWith("/onboarding");

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/sign-in");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  // Role-aware onboarding gate logic
  useEffect(() => {
    if (isLoading || isQuestionnaireLoading || !isAuthenticated || !user || isOnboardingPath) {
      return;
    }

    // No role selected - redirect to role selection
    if (!user.role) {
      router.push("/onboarding");
      return;
    }

    // Investor who hasn't started questionnaire yet - redirect to questionnaire
    // Once they've started (questionnaire exists), they can skip and access the app
    if (user.role === "investor" && !questionnaire) {
      router.push("/onboarding/questionnaire");
      return;
    }

    // Service providers and admins complete onboarding after role selection
    // (handled in setUserRole mutation)
  }, [isLoading, isQuestionnaireLoading, isAuthenticated, user, questionnaire, pathname, router, isOnboardingPath]);

  // Show minimal loading screen until auth and user data are confirmed
  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  // Still loading user data
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
