"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useMutation } from "convex/react";
import { useTranslations } from "next-intl";
import { api } from "../../../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type Role = "investor" | "broker" | "mortgage_advisor" | "lawyer";

// Role keys for translation lookup
const ROLE_KEYS: Record<Role, string> = {
  investor: "investor",
  broker: "broker",
  mortgage_advisor: "mortgageAdvisor",
  lawyer: "lawyer",
};

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoading } = useCurrentUser();
  const setUserRole = useMutation(api.users.setUserRole);
  const t = useTranslations("onboarding");

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Role options for the UI
  const roles: Role[] = ["investor", "broker", "mortgage_advisor", "lawyer"];

  // Redirect to dashboard if already onboarded
  useEffect(() => {
    if (!isLoading && user?.onboardingComplete) {
      router.push("/dashboard");
    }
  }, [isLoading, user, router]);

  // Show loading while user data loads or if already onboarded (redirecting)
  if (isLoading || !user || user.onboardingComplete) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!selectedRole) return;

    setIsSubmitting(true);
    try {
      await setUserRole({ role: selectedRole });
      // Investors go to questionnaire, service providers go to dashboard
      if (selectedRole === "investor") {
        router.push("/onboarding/questionnaire");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Failed to set role:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t("title")}</CardTitle>
          <CardDescription>
            {t("subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={selectedRole ?? undefined}
            onValueChange={(value) => setSelectedRole(value as Role)}
          >
            {roles.map((roleValue) => {
              const roleKey = ROLE_KEYS[roleValue];
              return (
                <div
                  key={roleValue}
                  className="flex items-start space-x-3 rtl:space-x-reverse rounded-lg border p-4 hover:bg-muted/50 cursor-pointer"
                  onClick={() => setSelectedRole(roleValue)}
                >
                  <RadioGroupItem value={roleValue} id={roleValue} className="mt-1" />
                  <div className="flex-1">
                    <Label
                      htmlFor={roleValue}
                      className="text-base font-medium cursor-pointer"
                    >
                      {t(`roles.${roleKey}.label`)}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t(`roles.${roleKey}.description`)}
                    </p>
                  </div>
                </div>
              );
            })}
          </RadioGroup>

          <Button
            onClick={handleSubmit}
            disabled={!selectedRole || isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Spinner className="me-2 h-4 w-4" />
                {t("settingUp")}
              </>
            ) : (
              t("continue")
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
