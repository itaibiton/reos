"use client";

import { useTranslations } from "next-intl";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { InvestorProfileForm } from "@/components/profile/InvestorProfileForm";
import { ProviderProfileForm } from "@/components/profile/ProviderProfileForm";
import { AvailabilitySettings } from "@/components/settings/AvailabilitySettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const { user, isLoading, effectiveRole, isAdmin, isInvestor, isServiceProvider } = useCurrentUser();

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  // Admin viewing a role shows that role's settings
  const showInvestorProfile = isInvestor;
  const showProviderProfile = isServiceProvider;

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          {isAdmin && effectiveRole !== "admin" && (
            <Badge variant="outline" className="text-xs">
              {t("viewingAs", { role: effectiveRole })}
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          {effectiveRole === "admin"
            ? t("adminSettings")
            : t("manageProfile")}
        </p>
      </div>

      {/* Investors see profile form directly (no tabs) */}
      {showInvestorProfile && <InvestorProfileForm />}

      {/* Providers see tabbed interface */}
      {showProviderProfile && (
        <Tabs defaultValue="profile" className="w-full">
          <TabsList>
            <TabsTrigger value="profile">{t("tabs.profile")}</TabsTrigger>
            <TabsTrigger value="availability">{t("tabs.availability")}</TabsTrigger>
            <TabsTrigger value="notifications">{t("tabs.notifications")}</TabsTrigger>
          </TabsList>
          <TabsContent value="profile" className="mt-4">
            <ProviderProfileForm />
          </TabsContent>
          <TabsContent value="availability" className="mt-4">
            <AvailabilitySettings />
          </TabsContent>
          <TabsContent value="notifications" className="mt-4">
            <NotificationSettings />
          </TabsContent>
        </Tabs>
      )}

      {effectiveRole === "admin" && (
        <div className="rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-2">{t("admin.title")}</h2>
          <p className="text-muted-foreground text-sm">
            {t("admin.description")}
          </p>
        </div>
      )}
    </div>
  );
}
