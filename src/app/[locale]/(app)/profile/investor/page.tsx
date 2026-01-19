"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { InvestorProfileForm } from "@/components/profile/InvestorProfileForm";
import { ProfileCompletenessCard } from "@/components/profile/ProfileCompletenessCard";
import { Spinner } from "@/components/ui/spinner";

export default function InvestorProfilePage() {
  const { isLoading, effectiveRole } = useCurrentUser();
  const router = useRouter();

  // Redirect non-investors away from this page
  useEffect(() => {
    if (!isLoading && effectiveRole && effectiveRole !== "investor") {
      router.push("/dashboard");
    }
  }, [isLoading, effectiveRole, router]);

  // Show loading while checking role
  if (isLoading || (effectiveRole && effectiveRole !== "investor")) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Investor Profile</h1>

      {/* Profile Completeness Card */}
      <ProfileCompletenessCard className="max-w-md" />

      {/* Investment Preferences Form (existing) */}
      <div className="max-w-2xl">
        <h2 className="text-lg font-semibold mb-4">Investment Preferences</h2>
        <InvestorProfileForm />
      </div>
    </div>
  );
}
