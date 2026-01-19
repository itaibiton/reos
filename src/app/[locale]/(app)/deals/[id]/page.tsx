"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Location01Icon,
  Calendar01Icon,
  UserIcon,
  File02Icon,
  Activity01Icon,
  CheckmarkCircle01Icon,
  Cancel01Icon,
  Download01Icon,
  Delete01Icon,
  Add01Icon,
  Agreement01Icon,
  Home01Icon,
} from "@hugeicons/core-free-icons";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { FileUpload } from "@/components/deals/FileUpload";
import { RequestProviderDialog } from "@/components/deals/RequestProviderDialog";
import { InvestorQuestionnaireCard } from "@/components/deals/InvestorQuestionnaireCard";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Deal stage info
const DEAL_STAGES = {
  interest: { label: "Interest", color: "bg-blue-100 text-blue-800", step: 1 },
  broker_assigned: { label: "With Broker", color: "bg-purple-100 text-purple-800", step: 2 },
  mortgage: { label: "Mortgage", color: "bg-orange-100 text-orange-800", step: 3 },
  legal: { label: "Legal", color: "bg-indigo-100 text-indigo-800", step: 4 },
  closing: { label: "Closing", color: "bg-yellow-100 text-yellow-800", step: 5 },
  completed: { label: "Completed", color: "bg-green-100 text-green-800", step: 6 },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800", step: 0 },
} as const;

type DealStage = keyof typeof DEAL_STAGES;

const STAGE_ORDER: DealStage[] = ["interest", "broker_assigned", "mortgage", "legal", "closing", "completed"];

// Activity type labels
const ACTIVITY_LABELS: Record<string, string> = {
  stage_change: "Stage changed",
  provider_assigned: "Provider assigned",
  provider_removed: "Provider removed",
  file_uploaded: "File uploaded",
  file_deleted: "File deleted",
  note_added: "Note added",
  handoff_initiated: "Handoff initiated",
  handoff_completed: "Handoff completed",
};

// File category labels
const FILE_CATEGORY_LABELS: Record<string, string> = {
  contract: "Contract",
  id_document: "ID Document",
  financial: "Financial",
  legal: "Legal",
  other: "Other",
};

// Format date
function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(timestamp: number) {
  return new Date(timestamp).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// Currency formatter
function formatUSD(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format file size
function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Get initials from name
function getInitials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Loading skeleton
function DealDetailSkeleton() {
  return (
    <div className="p-6">
      {/* Back button */}
      <Skeleton className="h-5 w-24 mb-4" />

      {/* Header */}
      <div className="mb-6">
        <div className="flex gap-4 items-start">
          <Skeleton className="h-20 w-20 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      </div>

      {/* Stage progress */}
      <Skeleton className="h-12 w-full mb-6" />

      {/* Tabs skeleton */}
      <Skeleton className="h-10 w-full mb-4" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

// Not found component
function DealNotFound() {
  return (
    <div className="p-6">
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="rounded-full bg-muted p-4 mb-4 text-muted-foreground">
          <HugeiconsIcon icon={Agreement01Icon} size={48} strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-semibold mb-2">Deal not found</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          This deal doesn&apos;t exist or you don&apos;t have access to view it.
        </p>
        <Link href="/deals">
          <Button>Back to Deals</Button>
        </Link>
      </div>
    </div>
  );
}

// Stage progress indicator
function StageProgress({ currentStage }: { currentStage: DealStage }) {
  if (currentStage === "cancelled") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <Badge className="bg-red-100 text-red-800">Deal Cancelled</Badge>
      </div>
    );
  }

  const currentStep = DEAL_STAGES[currentStage].step;

  return (
    <div className="flex items-center justify-between overflow-x-auto pb-2">
      {STAGE_ORDER.map((stage, index) => {
        const stageInfo = DEAL_STAGES[stage];
        const isCompleted = stageInfo.step < currentStep;
        const isCurrent = stage === currentStage;
        const isUpcoming = stageInfo.step > currentStep;

        return (
          <div key={stage} className="flex items-center">
            {/* Step */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium",
                  isCompleted && "bg-green-500 text-white",
                  isCurrent && "bg-primary text-primary-foreground",
                  isUpcoming && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} />
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={cn(
                  "text-xs mt-1 whitespace-nowrap",
                  isCurrent && "font-medium",
                  isUpcoming && "text-muted-foreground"
                )}
              >
                {stageInfo.label}
              </span>
            </div>

            {/* Connector line */}
            {index < STAGE_ORDER.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-8 mx-2",
                  isCompleted ? "bg-green-500" : "bg-muted"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Provider card component
function ProviderCard({
  type,
  provider,
  isAssigned,
}: {
  type: "broker" | "mortgage_advisor" | "lawyer";
  provider?: { name?: string; email?: string; imageUrl?: string } | null;
  isAssigned: boolean;
}) {
  const typeLabels = {
    broker: "Broker",
    mortgage_advisor: "Mortgage Advisor",
    lawyer: "Lawyer",
  };

  return (
    <Card className={cn(!isAssigned && "opacity-60")}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={provider?.imageUrl} />
            <AvatarFallback>{getInitials(provider?.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {isAssigned ? provider?.name || "Unknown" : "Not assigned"}
            </p>
            <p className="text-xs text-muted-foreground">{typeLabels[type]}</p>
            {isAssigned && provider?.email && (
              <p className="text-xs text-muted-foreground truncate">{provider.email}</p>
            )}
          </div>
          {isAssigned && (
            <Badge variant="secondary" className="flex-shrink-0">
              <HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} className="mr-1" />
              Assigned
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Activity timeline item
function ActivityItem({
  activity,
}: {
  activity: {
    activityType: string;
    actorName: string;
    actorImageUrl?: string;
    details: Record<string, unknown>;
    createdAt: number;
  };
}) {
  const label = ACTIVITY_LABELS[activity.activityType] || activity.activityType;

  // Build description based on type
  let description = "";
  if (activity.activityType === "stage_change") {
    description = `${activity.details.fromStage} → ${activity.details.toStage}`;
    if (activity.details.note) {
      description += ` (${activity.details.note})`;
    }
  } else if (activity.activityType === "file_uploaded" || activity.activityType === "file_deleted") {
    description = activity.details.fileName as string || "";
  } else if (activity.activityType === "provider_assigned") {
    description = `${activity.details.providerType}`;
  } else if (activity.details.note) {
    description = activity.details.note as string;
  }

  return (
    <div className="flex gap-3 py-3">
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={activity.actorImageUrl} />
        <AvatarFallback className="text-xs">{getInitials(activity.actorName)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{activity.actorName}</span>
          <span className="text-xs text-muted-foreground">
            {formatDateTime(activity.createdAt)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{label}</p>
        {description && (
          <p className="text-sm">{description}</p>
        )}
      </div>
    </div>
  );
}

// File list item
function FileItem({
  file,
  onDelete,
  canDelete,
}: {
  file: {
    _id: Id<"dealFiles">;
    fileName: string;
    fileType: string;
    fileSize: number;
    category: string;
    uploaderName: string;
    createdAt: number;
    url: string | null;
    visibility: string;
  };
  onDelete: (id: Id<"dealFiles">) => void;
  canDelete: boolean;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border">
      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
        <HugeiconsIcon icon={File02Icon} size={20} className="text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.fileName}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatFileSize(file.fileSize)}</span>
          <span>•</span>
          <span>{FILE_CATEGORY_LABELS[file.category] || file.category}</span>
          <span>•</span>
          <span>{file.uploaderName}</span>
          {file.visibility === "providers_only" && (
            <>
              <span>•</span>
              <Badge variant="outline" className="text-xs py-0">Providers only</Badge>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        {file.url && (
          <Button variant="ghost" size="icon" asChild>
            <a href={file.url} download={file.fileName} target="_blank" rel="noopener noreferrer">
              <HugeiconsIcon icon={Download01Icon} size={16} />
            </a>
          </Button>
        )}
        {canDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                <HugeiconsIcon icon={Delete01Icon} size={16} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete file?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete &quot;{file.fileName}&quot;. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(file._id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}

type ProviderType = "broker" | "mortgage_advisor" | "lawyer";

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dealId = params.id as string;
  const { user, effectiveRole } = useCurrentUser();

  // Provider request dialog state
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [requestDialogType, setRequestDialogType] = useState<ProviderType>("broker");

  // Fetch deal
  const deal = useQuery(api.deals.get, { dealId: dealId as Id<"deals"> });

  // Fetch property
  const property = useQuery(
    api.properties.getById,
    deal ? { id: deal.propertyId } : "skip"
  );

  // Fetch files
  const files = useQuery(
    api.dealFiles.listForDeal,
    deal ? { dealId: deal._id } : "skip"
  );

  // Fetch activity log
  const activities = useQuery(
    api.deals.getActivityLog,
    deal ? { dealId: deal._id, limit: 50 } : "skip"
  );

  // Fetch service requests for this deal
  const serviceRequests = useQuery(
    api.serviceRequests.listForDeal,
    deal ? { dealId: deal._id } : "skip"
  );

  // Mutations
  const deleteFile = useMutation(api.dealFiles.deleteFile);
  const cancelRequest = useMutation(api.serviceRequests.cancel);

  // Fetch provider details
  const brokerId = deal?.brokerId;
  const mortgageAdvisorId = deal?.mortgageAdvisorId;
  const lawyerId = deal?.lawyerId;

  // We'll show provider info from service requests if available
  const providersByType = useMemo(() => {
    const result: Record<string, { name?: string; email?: string; imageUrl?: string } | null> = {
      broker: null,
      mortgage_advisor: null,
      lawyer: null,
    };

    if (serviceRequests) {
      for (const req of serviceRequests) {
        if (req.status === "accepted" && req.provider) {
          result[req.providerType] = req.provider;
        }
      }
    }

    return result;
  }, [serviceRequests]);

  // Handle file delete
  async function handleDeleteFile(fileId: Id<"dealFiles">) {
    try {
      await deleteFile({ fileId });
      toast.success("File deleted");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete file");
    }
  }

  // Check if user can delete a file (they uploaded it or admin)
  function canDeleteFile(uploaderId: Id<"users">) {
    if (!user) return false;
    return user._id === uploaderId || user.role === "admin";
  }

  // Open provider request dialog
  function openRequestDialog(type: ProviderType) {
    setRequestDialogType(type);
    setRequestDialogOpen(true);
  }

  // Cancel a pending service request
  async function handleCancelRequest(requestId: Id<"serviceRequests">) {
    try {
      await cancelRequest({ requestId });
      toast.success("Request cancelled");
    } catch (error) {
      console.error("Error cancelling request:", error);
      toast.error(error instanceof Error ? error.message : "Failed to cancel request");
    }
  }

  // Loading state
  if (deal === undefined) {
    return <DealDetailSkeleton />;
  }

  // Not found or no access
  if (deal === null) {
    return <DealNotFound />;
  }

  const stageInfo = DEAL_STAGES[deal.stage as DealStage];
  const isTerminal = deal.stage === "completed" || deal.stage === "cancelled";
  const isInvestor = user?._id === deal.investorId;

  return (
    <div className="p-6">
      {/* Back button */}
      <Link
        href="/deals"
        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-4 text-sm"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={2} />
        Back to Deals
      </Link>

      {/* Header: Property info + Stage badge */}
      <div className="mb-6">
        <div className="flex gap-4 items-start">
          {/* Property image */}
          <div className="h-20 w-20 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
            {property?.featuredImage ? (
              <img
                src={property.featuredImage}
                alt={property.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <HugeiconsIcon icon={Home01Icon} size={32} className="text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Property info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold truncate">
              {property?.title || "Loading..."}
            </h1>
            {property && (
              <>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <HugeiconsIcon icon={Location01Icon} size={14} />
                  <span>{property.city}</span>
                  <span className="mx-1">•</span>
                  <span>{formatUSD(property.priceUsd)}</span>
                </div>
              </>
            )}
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <HugeiconsIcon icon={Calendar01Icon} size={14} />
              <span>Started {formatDate(deal.createdAt)}</span>
            </div>
          </div>

          {/* Stage badge */}
          <Badge className={cn("flex-shrink-0", stageInfo.color)}>
            {stageInfo.label}
          </Badge>
        </div>
      </div>

      {/* Stage progress indicator */}
      <div className="mb-6">
        <StageProgress currentStage={deal.stage as DealStage} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Property summary */}
          <Card>
            <CardHeader>
              <CardTitle>Property</CardTitle>
            </CardHeader>
            <CardContent>
              {property ? (
                <div className="space-y-2">
                  <p className="font-medium">{property.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {property.address}, {property.city}
                  </p>
                  <p className="text-lg font-semibold">{formatUSD(property.priceUsd)}</p>
                  <Link href={`/properties/${property._id}`}>
                    <Button variant="outline" size="sm" className="mt-2">
                      View Property
                    </Button>
                  </Link>
                </div>
              ) : (
                <Skeleton className="h-24 w-full" />
              )}
            </CardContent>
          </Card>

          {/* Deal info */}
          <Card>
            <CardHeader>
              <CardTitle>Deal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge className={stageInfo.color}>{stageInfo.label}</Badge>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Started</span>
                <span>{formatDate(deal.createdAt)}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated</span>
                <span>{formatDate(deal.updatedAt)}</span>
              </div>
              {deal.offerPrice && (
                <>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Offer Price</span>
                    <span className="font-medium">{formatUSD(deal.offerPrice)}</span>
                  </div>
                </>
              )}
              {deal.notes && (
                <>
                  <Separator />
                  <div>
                    <span className="text-muted-foreground">Notes</span>
                    <p className="mt-1 text-sm">{deal.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Assigned providers summary */}
          <Card>
            <CardHeader>
              <CardTitle>Team</CardTitle>
              <CardDescription>Service providers working on this deal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ProviderCard
                type="broker"
                provider={providersByType.broker}
                isAssigned={!!brokerId}
              />
              <ProviderCard
                type="mortgage_advisor"
                provider={providersByType.mortgage_advisor}
                isAssigned={!!mortgageAdvisorId}
              />
              <ProviderCard
                type="lawyer"
                provider={providersByType.lawyer}
                isAssigned={!!lawyerId}
              />
            </CardContent>
          </Card>

          {/* Investor Profile - show to providers only */}
          {!isInvestor && deal.investorId && (
            <InvestorQuestionnaireCard investorId={deal.investorId} />
          )}
        </TabsContent>

        {/* Providers Tab */}
        <TabsContent value="providers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Providers</CardTitle>
              <CardDescription>
                {isInvestor
                  ? "Request providers to help with your deal"
                  : "Providers assigned to this deal"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Broker */}
              <div className="space-y-2">
                <h4 className="font-medium">Broker</h4>
                {brokerId ? (
                  <ProviderCard
                    type="broker"
                    provider={providersByType.broker}
                    isAssigned={true}
                  />
                ) : (
                  <div className="p-4 rounded-lg border border-dashed text-center">
                    <p className="text-sm text-muted-foreground mb-2">No broker assigned</p>
                    {isInvestor && !isTerminal && (
                      <Button variant="outline" size="sm" onClick={() => openRequestDialog("broker")}>
                        <HugeiconsIcon icon={Add01Icon} size={14} className="mr-1" />
                        Find a Broker
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <Separator />

              {/* Mortgage Advisor */}
              <div className="space-y-2">
                <h4 className="font-medium">Mortgage Advisor</h4>
                {mortgageAdvisorId ? (
                  <ProviderCard
                    type="mortgage_advisor"
                    provider={providersByType.mortgage_advisor}
                    isAssigned={true}
                  />
                ) : (
                  <div className="p-4 rounded-lg border border-dashed text-center">
                    <p className="text-sm text-muted-foreground mb-2">No mortgage advisor assigned</p>
                    {isInvestor && !isTerminal && (
                      <Button variant="outline" size="sm" onClick={() => openRequestDialog("mortgage_advisor")}>
                        <HugeiconsIcon icon={Add01Icon} size={14} className="mr-1" />
                        Find a Mortgage Advisor
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <Separator />

              {/* Lawyer */}
              <div className="space-y-2">
                <h4 className="font-medium">Lawyer</h4>
                {lawyerId ? (
                  <ProviderCard
                    type="lawyer"
                    provider={providersByType.lawyer}
                    isAssigned={true}
                  />
                ) : (
                  <div className="p-4 rounded-lg border border-dashed text-center">
                    <p className="text-sm text-muted-foreground mb-2">No lawyer assigned</p>
                    {isInvestor && !isTerminal && (
                      <Button variant="outline" size="sm" onClick={() => openRequestDialog("lawyer")}>
                        <HugeiconsIcon icon={Add01Icon} size={14} className="mr-1" />
                        Find a Lawyer
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Pending requests */}
              {serviceRequests && serviceRequests.filter((r) => r.status === "pending").length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-medium">Pending Requests</h4>
                    {serviceRequests
                      .filter((r) => r.status === "pending")
                      .map((request) => (
                        <div key={request._id} className="flex items-center gap-3 p-3 rounded-lg border">
                          <Avatar>
                            <AvatarImage src={request.provider?.imageUrl} />
                            <AvatarFallback>{getInitials(request.provider?.name)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{request.provider?.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {request.providerType.replace("_", " ")} • Pending response
                            </p>
                          </div>
                          <Badge variant="secondary">Pending</Badge>
                          {isInvestor && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                  <HugeiconsIcon icon={Cancel01Icon} size={14} className="mr-1" />
                                  Cancel
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel this request?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will cancel your request to {request.provider?.name}. You can send a new request to a different provider.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Keep Request</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleCancelRequest(request._id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Cancel Request
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Files Tab */}
        <TabsContent value="files" className="space-y-6">
          {/* Upload section */}
          {!isTerminal && <FileUpload dealId={deal._id} />}

          {/* Files list */}
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                {files?.length || 0} file{files?.length !== 1 ? "s" : ""} uploaded
              </CardDescription>
            </CardHeader>
            <CardContent>
              {files === undefined ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : files.length === 0 ? (
                <div className="text-center py-8">
                  <HugeiconsIcon
                    icon={File02Icon}
                    size={40}
                    className="mx-auto text-muted-foreground mb-2"
                  />
                  <p className="text-muted-foreground">No documents uploaded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {files.map((file) => (
                    <FileItem
                      key={file._id}
                      file={file}
                      onDelete={handleDeleteFile}
                      canDelete={canDeleteFile(file.uploadedBy)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>Complete history of deal events</CardDescription>
            </CardHeader>
            <CardContent>
              {activities === undefined ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-8">
                  <HugeiconsIcon
                    icon={Activity01Icon}
                    size={40}
                    className="mx-auto text-muted-foreground mb-2"
                  />
                  <p className="text-muted-foreground">No activity recorded yet</p>
                </div>
              ) : (
                <div className="divide-y">
                  {activities.map((activity) => (
                    <ActivityItem key={activity._id} activity={activity} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Request Provider Dialog */}
      <RequestProviderDialog
        dealId={deal._id}
        providerType={requestDialogType}
        open={requestDialogOpen}
        onOpenChange={setRequestDialogOpen}
      />
    </div>
  );
}
