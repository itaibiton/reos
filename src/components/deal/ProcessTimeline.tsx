"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { DEAL_STAGES, DealStage } from "@/lib/deal-constants";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  Cancel01Icon,
  CircleIcon,
} from "@hugeicons/core-free-icons";

type StageHistoryEntry = {
  stage: string;
  timestamp: number;
  notes?: string;
};

interface ProcessTimelineProps {
  currentStage: string;
  stageHistory: StageHistoryEntry[];
  createdAt: number;
}

const STAGE_ORDER: DealStage[] = [
  "interest",
  "broker_assigned",
  "mortgage",
  "legal",
  "closing",
  "completed",
];

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getRelativeTime(timestamp: number) {
  const now = Date.now();
  const diff = now - timestamp;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return formatDate(timestamp);
}

export default function ProcessTimeline({
  currentStage,
  stageHistory,
  createdAt,
}: ProcessTimelineProps) {
  const t = useTranslations("processTimeline");
  const isCancelled = currentStage === "cancelled";
  const currentIndex = STAGE_ORDER.indexOf(currentStage as DealStage);

  // Build a map of stage → timestamp from history
  const stageTimestamps = new Map<string, number>();
  stageTimestamps.set("interest", createdAt); // Interest is always the start
  for (const entry of stageHistory) {
    stageTimestamps.set(entry.stage, entry.timestamp);
  }

  const getStageStatus = (stage: DealStage, index: number) => {
    if (isCancelled) return "cancelled";
    if (stage === currentStage) return "current";
    if (index < currentIndex) return "completed";
    return "upcoming";
  };

  return (
    <div className="w-full">
      {isCancelled && (
        <div className="mb-3 flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
          <HugeiconsIcon icon={Cancel01Icon} size={16} />
          {t("cancelled")}
        </div>
      )}

      {/* Desktop: Horizontal Timeline */}
      <div className="hidden md:block">
        <div className="flex items-start">
          {STAGE_ORDER.map((stage, index) => {
            const status = getStageStatus(stage, index);
            const stageInfo = DEAL_STAGES[stage];
            const timestamp = stageTimestamps.get(stage);

            return (
              <div key={stage} className="flex flex-1 flex-col items-center">
                {/* Step line + circle */}
                <div className="flex w-full items-center">
                  {/* Left line */}
                  {index > 0 && (
                    <div
                      className={cn(
                        "h-0.5 flex-1",
                        status === "completed" || status === "current"
                          ? "bg-primary"
                          : "bg-border",
                        isCancelled && "bg-red-200 dark:bg-red-800"
                      )}
                    />
                  )}
                  {index === 0 && <div className="flex-1" />}

                  {/* Circle */}
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                      status === "completed" &&
                        "border-primary bg-primary text-primary-foreground",
                      status === "current" &&
                        "border-primary bg-primary/10 text-primary ring-4 ring-primary/20",
                      status === "upcoming" &&
                        "border-muted-foreground/30 bg-background text-muted-foreground/50",
                      isCancelled &&
                        "border-red-300 bg-red-50 text-red-400 dark:border-red-700 dark:bg-red-950"
                    )}
                  >
                    {status === "completed" ? (
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} />
                    ) : status === "current" ? (
                      <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                    ) : (
                      <HugeiconsIcon icon={CircleIcon} size={12} />
                    )}
                  </div>

                  {/* Right line */}
                  {index < STAGE_ORDER.length - 1 && (
                    <div
                      className={cn(
                        "h-0.5 flex-1",
                        index < currentIndex
                          ? "bg-primary"
                          : "border-t-2 border-dashed border-border bg-transparent",
                        isCancelled && index < currentIndex && "bg-red-200 dark:bg-red-800"
                      )}
                    />
                  )}
                  {index === STAGE_ORDER.length - 1 && <div className="flex-1" />}
                </div>

                {/* Label */}
                <p
                  className={cn(
                    "mt-2 text-center text-xs font-medium",
                    status === "completed" && "text-primary",
                    status === "current" && "text-primary font-semibold",
                    status === "upcoming" && "text-muted-foreground/50",
                    isCancelled && "text-red-400"
                  )}
                >
                  {stageInfo.label}
                </p>

                {/* Date */}
                <p className="mt-0.5 text-center text-[10px] text-muted-foreground">
                  {timestamp ? getRelativeTime(timestamp) : "—"}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile: Vertical Timeline */}
      <div className="block md:hidden">
        <div className="space-y-0">
          {STAGE_ORDER.map((stage, index) => {
            const status = getStageStatus(stage, index);
            const stageInfo = DEAL_STAGES[stage];
            const timestamp = stageTimestamps.get(stage);

            return (
              <div key={stage} className="flex gap-3">
                {/* Vertical line + circle */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                      status === "completed" &&
                        "border-primary bg-primary text-primary-foreground",
                      status === "current" &&
                        "border-primary bg-primary/10 text-primary",
                      status === "upcoming" &&
                        "border-muted-foreground/30 bg-background text-muted-foreground/50",
                      isCancelled &&
                        "border-red-300 bg-red-50 text-red-400"
                    )}
                  >
                    {status === "completed" ? (
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} />
                    ) : status === "current" ? (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    ) : (
                      <span className="text-[8px]">{index + 1}</span>
                    )}
                  </div>
                  {index < STAGE_ORDER.length - 1 && (
                    <div
                      className={cn(
                        "w-0.5 flex-1 min-h-[24px]",
                        index < currentIndex
                          ? "bg-primary"
                          : "border-l-2 border-dashed border-border bg-transparent",
                        isCancelled && index < currentIndex && "bg-red-200"
                      )}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="pb-4">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      status === "completed" && "text-primary",
                      status === "current" && "text-primary font-semibold",
                      status === "upcoming" && "text-muted-foreground/50",
                      isCancelled && "text-red-400"
                    )}
                  >
                    {stageInfo.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {timestamp ? formatDate(timestamp) : "—"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
