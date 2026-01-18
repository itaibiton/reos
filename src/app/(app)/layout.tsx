"use client";

import { useConvexAuth } from "convex/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import { AppShell } from "@/components/layout/AppShell";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const { user, isLoading: isUserLoading } = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname();

  const isLoading = isAuthLoading || isUserLoading;

  // Check if current path is an onboarding path (role selection or questionnaire)
  const isOnboardingPath = pathname.startsWith("/onboarding");

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/sign-in");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  // Role-aware onboarding gate logic
  useEffect(() => {
    if (isLoading || !isAuthenticated || !user || isOnboardingPath) {
      return;
    }

    // No role selected - redirect to role selection
    if (!user.role) {
      router.push("/onboarding");
      return;
    }

    // Investor with incomplete onboarding - redirect to questionnaire
    if (user.role === "investor" && !user.onboardingComplete) {
      router.push("/onboarding/questionnaire");
      return;
    }

    // Service providers and admins complete onboarding after role selection
    // (handled in setUserRole mutation)
  }, [isLoading, isAuthenticated, user, pathname, router, isOnboardingPath]);

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
