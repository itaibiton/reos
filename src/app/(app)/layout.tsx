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

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/sign-in");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  // Redirect to onboarding if not complete (but not if already on /onboarding)
  useEffect(() => {
    if (
      !isLoading &&
      isAuthenticated &&
      user &&
      !user.onboardingComplete &&
      pathname !== "/onboarding"
    ) {
      router.push("/onboarding");
    }
  }, [isLoading, isAuthenticated, user, pathname, router]);

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
