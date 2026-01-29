"use client";

import { useQuery } from "convex/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { DEAL_STAGES, DealStage } from "@/lib/deal-constants";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft02Icon,
  File01Icon,
  Download04Icon,
  Calendar03Icon,
  Home01Icon,
  FolderOpenIcon,
} from "@hugeicons/core-free-icons";
import ProcessTimeline from "@/components/deal/ProcessTimeline";

const FILE_CATEGORY_COLORS: Record<string, string> = {
  contract: "bg-blue-100 text-blue-800",
  id_document: "bg-purple-100 text-purple-800",
  financial: "bg-green-100 text-green-800",
  legal: "bg-indigo-100 text-indigo-800",
  other: "bg-gray-100 text-gray-800",
};

function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ClientDetailContent({ clientId }: { clientId: string }) {
  const t = useTranslations("clientManagement");
  const router = useRouter();

  const clientDeals = useQuery(api.clientManagement.getClientDeals, {
    clientId: clientId as Id<"users">,
  });

  // Get documents for each deal
  const firstDealDocs = useQuery(
    api.clientManagement.getClientDocuments,
    clientDeals && clientDeals.length > 0
      ? { dealId: clientDeals[0]._id }
      : "skip"
  );

  if (clientDeals === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (clientDeals.length === 0) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <HugeiconsIcon icon={ArrowLeft02Icon} size={16} />
          {t("back")}
        </Button>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">{t("noDealFound")}</p>
        </div>
      </div>
    );
  }

  // Get investor info from first deal
  const firstDeal = clientDeals[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <HugeiconsIcon icon={ArrowLeft02Icon} size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{t("detail.title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("detail.dealCount", { count: clientDeals.length })}
          </p>
        </div>
      </div>

      {/* Deals List */}
      <div className="space-y-6">
        {clientDeals.map((deal: (typeof clientDeals)[number], index: number) => {
          const stage = DEAL_STAGES[deal.stage as DealStage];
          return (
            <div key={deal._id} className="rounded-lg border">
              {/* Deal Header */}
              <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <HugeiconsIcon icon={Home01Icon} size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {deal.property?.title || t("detail.unknownProperty")}
                    </p>
                    {deal.property?.address && (
                      <p className="text-xs text-muted-foreground">
                        {deal.property.address}, {deal.property.city}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {stage && (
                    <Badge variant="secondary" className={stage.color}>
                      {stage.label}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Deal Info */}
              <div className="grid gap-4 p-4 sm:grid-cols-3">
                <div className="flex items-center gap-2 text-sm">
                  <HugeiconsIcon icon={Calendar03Icon} size={14} className="text-muted-foreground" />
                  <span className="text-muted-foreground">{t("detail.started")}:</span>
                  <span>{formatDate(deal.createdAt)}</span>
                </div>
                {deal.property?.priceUsd && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">{t("detail.price")}:</span>{" "}
                    <span className="font-medium">
                      ${deal.property.priceUsd.toLocaleString()}
                    </span>
                  </div>
                )}
                {deal.stageHistory && deal.stageHistory.length > 0 && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">{t("detail.lastUpdate")}:</span>{" "}
                    <span>
                      {formatDate(deal.stageHistory[deal.stageHistory.length - 1].timestamp)}
                    </span>
                  </div>
                )}
              </div>

              {/* Process Timeline */}
              <div className="border-t px-4 py-4">
                <ProcessTimeline
                  currentStage={deal.stage}
                  stageHistory={deal.stageHistory || []}
                  createdAt={deal.createdAt}
                />
              </div>

              {/* Documents Section */}
              <DealDocuments dealId={deal._id} isFirst={index === 0} firstDealDocs={firstDealDocs} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DealDocuments({
  dealId,
  isFirst,
  firstDealDocs,
}: {
  dealId: Id<"deals">;
  isFirst: boolean;
  firstDealDocs: any;
}) {
  const t = useTranslations("clientManagement");
  // For first deal, use pre-fetched docs; for others, query separately
  const otherDocs = useQuery(
    api.clientManagement.getClientDocuments,
    !isFirst ? { dealId } : "skip"
  );

  const docs = isFirst ? firstDealDocs : otherDocs;

  if (docs === undefined) {
    return (
      <div className="border-t p-4">
        <Spinner className="h-4 w-4" />
      </div>
    );
  }

  if (docs.length === 0) {
    return (
      <div className="border-t p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <HugeiconsIcon icon={FolderOpenIcon} size={16} />
          {t("detail.noDocuments")}
        </div>
      </div>
    );
  }

  return (
    <div className="border-t">
      <div className="px-4 py-2">
        <p className="text-sm font-medium text-muted-foreground">
          {t("detail.documents")} ({docs.length})
        </p>
      </div>
      <div className="divide-y">
        {docs.map((doc: any) => (
          <div key={doc._id} className="flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
                <HugeiconsIcon icon={File01Icon} size={16} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">{doc.fileName}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge
                    variant="secondary"
                    className={`text-[10px] ${FILE_CATEGORY_COLORS[doc.category] || FILE_CATEGORY_COLORS.other}`}
                  >
                    {doc.category}
                  </Badge>
                  <span>{formatFileSize(doc.fileSize)}</span>
                  <span>•</span>
                  <span>{formatDate(doc.createdAt)}</span>
                </div>
              </div>
            </div>
            {doc.downloadUrl && (
              <a
                href={doc.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <HugeiconsIcon icon={Download04Icon} size={16} />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
