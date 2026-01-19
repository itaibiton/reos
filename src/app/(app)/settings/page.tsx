"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { InvestorProfileForm } from "@/components/profile/InvestorProfileForm";
import { ProviderProfileForm } from "@/components/profile/ProviderProfileForm";
import { AvailabilitySettings } from "@/components/settings/AvailabilitySettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
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
          <h1 className="text-2xl font-bold">Settings</h1>
          {isAdmin && effectiveRole !== "admin" && (
            <Badge variant="outline" className="text-xs">
              Viewing as {effectiveRole}
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          {effectiveRole === "admin"
            ? "Admin settings and system configuration"
            : "Manage your profile settings"}
        </p>
      </div>

      {/* Investors see profile form directly (no tabs) */}
      {showInvestorProfile && <InvestorProfileForm />}

      {/* Providers see tabbed interface */}
      {showProviderProfile && (
        <Tabs defaultValue="profile" className="w-full">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
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
          <h2 className="text-lg font-semibold mb-2">Admin Panel</h2>
          <p className="text-muted-foreground text-sm">
            Use the &quot;View as&quot; dropdown in the header to preview the app as different user types.
            The sidebar and available features will change based on the selected role.
          </p>
        </div>
      )}
    </div>
  );
}
