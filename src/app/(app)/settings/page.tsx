"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { InvestorProfileForm } from "@/components/profile/InvestorProfileForm";
import { ProviderProfileForm } from "@/components/profile/ProviderProfileForm";
import { Spinner } from "@/components/ui/spinner";

export default function SettingsPage() {
  const { user, isLoading } = useCurrentUser();

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const isInvestor = user.role === "investor";

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile settings
        </p>
      </div>

      {isInvestor ? <InvestorProfileForm /> : <ProviderProfileForm />}
    </div>
  );
}
