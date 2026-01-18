"use client";

import { InvestorProfileForm } from "@/components/profile/InvestorProfileForm";
import { ProfileCompletenessCard } from "@/components/profile/ProfileCompletenessCard";

export default function InvestorProfilePage() {
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
