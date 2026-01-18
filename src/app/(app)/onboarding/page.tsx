"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
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

const roles: { value: Role; label: string; description: string }[] = [
  {
    value: "investor",
    label: "Investor",
    description: "Looking to invest in Israeli real estate properties",
  },
  {
    value: "broker",
    label: "Real Estate Broker",
    description: "Licensed broker helping investors find properties",
  },
  {
    value: "mortgage_advisor",
    label: "Mortgage Advisor",
    description: "Helping investors secure financing for their purchases",
  },
  {
    value: "lawyer",
    label: "Real Estate Lawyer",
    description: "Providing legal services for property transactions",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoading } = useCurrentUser();
  const setUserRole = useMutation(api.users.setUserRole);

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            Select your role to get started with REOS. This helps us personalize
            your experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={selectedRole ?? undefined}
            onValueChange={(value) => setSelectedRole(value as Role)}
          >
            {roles.map((role) => (
              <div
                key={role.value}
                className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-muted/50 cursor-pointer"
                onClick={() => setSelectedRole(role.value)}
              >
                <RadioGroupItem value={role.value} id={role.value} className="mt-1" />
                <div className="flex-1">
                  <Label
                    htmlFor={role.value}
                    className="text-base font-medium cursor-pointer"
                  >
                    {role.label}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {role.description}
                  </p>
                </div>
              </div>
            ))}
          </RadioGroup>

          <Button
            onClick={handleSubmit}
            disabled={!selectedRole || isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Setting up...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
