"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function QuestionnairePage() {
  const router = useRouter();
  const { user, isLoading } = useCurrentUser();
  const completeOnboarding = useMutation(api.users.completeOnboarding);

  const [isSkipping, setIsSkipping] = useState(false);

  // Redirect to dashboard if already onboarded
  useEffect(() => {
    if (!isLoading && user?.onboardingComplete) {
      router.push("/dashboard");
    }
  }, [isLoading, user, router]);

  // Redirect to role selection if no role
  useEffect(() => {
    if (!isLoading && user && !user.role) {
      router.push("/onboarding");
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

  const handleSkip = async () => {
    setIsSkipping(true);
    try {
      await completeOnboarding();
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to skip onboarding:", error);
      setIsSkipping(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Investor Questionnaire</CardTitle>
          <CardDescription>
            This questionnaire will help us match you with the perfect
            properties and service providers. Coming soon in the next release.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border border-dashed border-muted-foreground/50 bg-muted/30 p-8 text-center">
            <p className="text-muted-foreground">
              The full questionnaire experience will be available soon. For now,
              you can skip ahead to explore the platform.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleSkip}
              disabled={isSkipping}
              variant="outline"
              className="w-full"
              size="lg"
            >
              {isSkipping ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Skipping...
                </>
              ) : (
                "Skip for now"
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              You can complete this questionnaire later from your profile
              settings.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
