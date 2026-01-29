"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useQuery } from "convex/react";
import { useTranslations } from "next-intl";
import { api } from "../../../../../../convex/_generated/api";
import { VendorOnboardingWizard } from "@/components/vendor/VendorOnboardingWizard";
import { Spinner } from "@/components/ui/spinner";

export default function VendorProfilePage() {
  const router = useRouter();
  const t = useTranslations("vendorOnboarding");
  const onboardingStatus = useQuery(api.users.getOnboardingStatus);

  // Gate: redirect if already onboarded or no role set
  useEffect(() => {
    if (!onboardingStatus) return;

    if (onboardingStatus.onboardingComplete) {
      router.push("/dashboard");
    } else if (!onboardingStatus.role) {
      router.push("/onboarding");
    }
  }, [onboardingStatus, router]);

  // Show loading while checking status
  if (!onboardingStatus || onboardingStatus.onboardingComplete || !onboardingStatus.role) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {t("title")}
          </h1>
          <p className="text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
        <VendorOnboardingWizard />
      </div>
    </div>
  );
}
