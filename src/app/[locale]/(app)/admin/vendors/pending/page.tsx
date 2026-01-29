"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useQuery } from "convex/react";
import { useTranslations } from "next-intl";
import { api } from "../../../../../../../convex/_generated/api";
import { PendingVendorsTable } from "@/components/admin/PendingVendorsTable";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { FileX } from "lucide-react";

export default function AdminVendorsPendingPage() {
  const router = useRouter();
  const t = useTranslations("adminVendors");
  const currentUser = useQuery(api.users.getCurrentUser);
  const pendingVendors = useQuery(api.serviceProviderProfiles.listPendingVendors);

  // Gate: redirect non-admins
  useEffect(() => {
    if (currentUser && currentUser.role !== "admin") {
      router.push("/dashboard");
    }
  }, [currentUser, router]);

  // Loading state
  if (!currentUser || !pendingVendors) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  // Redirect if not admin
  if (currentUser.role !== "admin") {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("subtitle", { count: pendingVendors.length })}
          </p>
        </div>
        {pendingVendors.length > 0 && (
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {t("pendingCount", { count: pendingVendors.length })}
          </Badge>
        )}
      </div>

      {/* Empty State */}
      {pendingVendors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <FileX className="w-12 h-12 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">{t("empty")}</h2>
          <p className="text-muted-foreground max-w-md">
            {t("emptyDescription")}
          </p>
        </div>
      ) : (
        <PendingVendorsTable vendors={pendingVendors} />
      )}
    </div>
  );
}
