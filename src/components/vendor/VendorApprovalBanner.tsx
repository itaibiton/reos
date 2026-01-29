"use client";

import { useQuery } from "convex/react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { Link } from "@/i18n/navigation";
import { api } from "../../../convex/_generated/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  AlertCircle,
  Clock,
  XCircle,
  CheckCircle2,
} from "lucide-react";

export function VendorApprovalBanner() {
  const { user } = useCurrentUser();
  const t = useTranslations("vendorStatus");
  const approvalStatus = useQuery(api.serviceProviderProfiles.getMyApprovalStatus);

  // Only show for service provider roles
  if (
    !user ||
    !user.role ||
    (user.role !== "broker" &&
      user.role !== "mortgage_advisor" &&
      user.role !== "lawyer")
  ) {
    return null;
  }

  // Don't render if approved or grandfathered (undefined)
  if (
    !approvalStatus ||
    approvalStatus.status === "approved" ||
    approvalStatus.status === null
  ) {
    return null;
  }

  // Draft status
  if (approvalStatus.status === "draft" || !approvalStatus.status) {
    return (
      <Alert variant="default" className="mb-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30">
        <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        <AlertTitle className="text-yellow-900 dark:text-yellow-100">
          {t("draft.title")}
        </AlertTitle>
        <AlertDescription className="text-yellow-800 dark:text-yellow-200">
          {t("draft.description")}
        </AlertDescription>
        <Link href="/onboarding/vendor-profile">
          <Button variant="outline" className="mt-3 border-yellow-600 text-yellow-900 hover:bg-yellow-100 dark:text-yellow-100 dark:hover:bg-yellow-900/50">
            {t("draft.action")}
          </Button>
        </Link>
      </Alert>
    );
  }

  // Pending status
  if (approvalStatus.status === "pending") {
    return (
      <Alert variant="default" className="mb-6 border-blue-500 bg-blue-50 dark:bg-blue-950/30">
        <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-900 dark:text-blue-100">
          {t("pending.title")}
        </AlertTitle>
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          <p className="mb-2">{t("pending.description")}</p>
          {approvalStatus.submittedAt && (
            <p className="text-sm">
              {t("pending.submittedAt", {
                date: format(approvalStatus.submittedAt, "PPP"),
              })}
            </p>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // Rejected status
  if (approvalStatus.status === "rejected") {
    return (
      <Alert variant="destructive" className="mb-6">
        <XCircle className="h-4 w-4" />
        <AlertTitle>{t("rejected.title")}</AlertTitle>
        <AlertDescription>
          <p className="mb-2">{t("rejected.description")}</p>
          {approvalStatus.rejectionReason && (
            <p className="mb-2 font-medium">
              {t("rejected.reason", { reason: approvalStatus.rejectionReason })}
            </p>
          )}
          {approvalStatus.reviewedAt && (
            <p className="text-sm mb-3">
              {t("rejected.reviewedAt", {
                date: format(approvalStatus.reviewedAt, "PPP"),
              })}
            </p>
          )}
          <Link href="/onboarding/vendor-profile">
            <Button variant="outline" className="mt-2">
              {t("rejected.action")}
            </Button>
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
