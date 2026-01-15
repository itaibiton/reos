"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserMultiple02Icon,
  Calendar01Icon,
  Location01Icon,
  CheckmarkCircle01Icon,
  Cancel01Icon,
  Agreement01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { useCurrentUser } from "@/hooks/useCurrentUser";

// Request status styles
const STATUS_STYLES = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  accepted: { label: "Active", color: "bg-green-100 text-green-800" },
  declined: { label: "Declined", color: "bg-red-100 text-red-800" },
  cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-800" },
} as const;

type RequestStatus = keyof typeof STATUS_STYLES;

// Format date
function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Currency formatter for USD
function formatUSD(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
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

// Skeleton loader for request cards
function RequestCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <Skeleton className="h-20 w-20 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-36" />
            <div className="flex gap-2 mt-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Request card component
interface ServiceRequest {
  _id: Id<"serviceRequests">;
  dealId: Id<"deals">;
  investorId: Id<"users">;
  providerId: Id<"users">;
  providerType: string;
  status: RequestStatus;
  investorMessage?: string;
  createdAt: number;
  respondedAt?: number;
  deal: {
    _id: Id<"deals">;
    stage: string;
    createdAt: number;
  } | null;
  investor: {
    _id: Id<"users">;
    name?: string;
    email?: string;
    imageUrl?: string;
  } | null;
  property: {
    _id: Id<"properties">;
    title: string;
    city: string;
    priceUsd: number;
  } | null;
}

interface RequestCardProps {
  request: ServiceRequest;
  onAccept: (requestId: Id<"serviceRequests">) => void;
  onDecline: (requestId: Id<"serviceRequests">) => void;
  onViewDeal: (dealId: Id<"deals">) => void;
  isResponding: boolean;
}

function RequestCard({
  request,
  onAccept,
  onDecline,
  onViewDeal,
  isResponding,
}: RequestCardProps) {
  const statusInfo = STATUS_STYLES[request.status];
  const isPending = request.status === "pending";
  const isAccepted = request.status === "accepted";

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Property image placeholder */}
          <div className="h-20 w-20 rounded-lg bg-muted flex-shrink-0 flex items-center justify-center">
            <HugeiconsIcon
              icon={Agreement01Icon}
              size={32}
              className="text-muted-foreground"
            />
          </div>

          {/* Request info */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold truncate">
                {request.property?.title || "Property"}
              </h3>
              <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
            </div>

            {request.property && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <HugeiconsIcon icon={Location01Icon} size={14} />
                <span>{request.property.city}</span>
                <span className="mx-1">•</span>
                <span>{formatUSD(request.property.priceUsd)}</span>
              </div>
            )}

            {/* Investor info */}
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={request.investor?.imageUrl} />
                <AvatarFallback className="text-xs">
                  {getInitials(request.investor?.name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{request.investor?.name || "Investor"}</span>
              <span className="text-xs text-muted-foreground">
                • {formatDate(request.createdAt)}
              </span>
            </div>

            {/* Investor message */}
            {request.investorMessage && (
              <p className="text-sm text-muted-foreground italic line-clamp-2">
                &quot;{request.investorMessage}&quot;
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              {isPending && (
                <>
                  <Button
                    size="sm"
                    onClick={() => onAccept(request._id)}
                    disabled={isResponding}
                  >
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} className="mr-1" />
                    Accept
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" disabled={isResponding}>
                        <HugeiconsIcon icon={Cancel01Icon} size={14} className="mr-1" />
                        Decline
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Decline this request?</AlertDialogTitle>
                        <AlertDialogDescription>
                          The investor will be notified and can request another provider.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDecline(request._id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Decline
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
              {isAccepted && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewDeal(request.dealId)}
                >
                  View Deal
                  <HugeiconsIcon icon={ArrowRight01Icon} size={14} className="ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ClientsPage() {
  const router = useRouter();
  const { effectiveRole } = useCurrentUser();
  const [statusFilter, setStatusFilter] = useState<string>("__all__");
  const [respondingId, setRespondingId] = useState<Id<"serviceRequests"> | null>(null);

  // Fetch requests for this provider
  const requests = useQuery(api.serviceRequests.listForProvider, {});

  // Respond mutation
  const respondToRequest = useMutation(api.serviceRequests.respond);

  // Filter requests
  const filteredRequests = useMemo(() => {
    if (!requests) return [];

    if (statusFilter === "__all__") {
      return requests;
    }

    return requests.filter((r) => r.status === statusFilter);
  }, [requests, statusFilter]);

  // Count by status
  const counts = useMemo(() => {
    if (!requests) return { pending: 0, accepted: 0, total: 0 };
    return {
      pending: requests.filter((r) => r.status === "pending").length,
      accepted: requests.filter((r) => r.status === "accepted").length,
      total: requests.length,
    };
  }, [requests]);

  // Handle accept
  async function handleAccept(requestId: Id<"serviceRequests">) {
    setRespondingId(requestId);
    try {
      await respondToRequest({ requestId, accept: true });
      toast.success("Request accepted! You're now assigned to this deal.");
    } catch (error) {
      console.error("Error accepting request:", error);
      toast.error(error instanceof Error ? error.message : "Failed to accept request");
    } finally {
      setRespondingId(null);
    }
  }

  // Handle decline
  async function handleDecline(requestId: Id<"serviceRequests">) {
    setRespondingId(requestId);
    try {
      await respondToRequest({ requestId, accept: false });
      toast.success("Request declined");
    } catch (error) {
      console.error("Error declining request:", error);
      toast.error(error instanceof Error ? error.message : "Failed to decline request");
    } finally {
      setRespondingId(null);
    }
  }

  // Handle view deal
  function handleViewDeal(dealId: Id<"deals">) {
    router.push(`/deals/${dealId}`);
  }

  // Check if user is a service provider
  const isProvider = ["broker", "mortgage_advisor", "lawyer", "admin"].includes(
    effectiveRole || ""
  );

  // Not a provider
  if (!isProvider) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="rounded-full bg-muted p-4 mb-4 text-muted-foreground">
            <HugeiconsIcon icon={UserMultiple02Icon} size={48} strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-semibold mb-2">Provider Access Only</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            This page is for service providers to manage client requests.
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (requests === undefined) {
    return (
      <div className="p-6">
        {/* Header skeleton */}
        <div className="mb-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-5 w-24 mt-1" />
        </div>

        {/* Filter skeleton */}
        <div className="flex gap-4 mb-6">
          <Skeleton className="h-10 w-36" />
        </div>

        {/* Cards skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <RequestCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Empty state (no requests at all)
  if (requests.length === 0) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="rounded-full bg-muted p-4 mb-4 text-muted-foreground">
            <HugeiconsIcon icon={UserMultiple02Icon} size={48} strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-semibold mb-2">No client requests yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            When investors request your services, they&apos;ll appear here for you to accept
            or decline.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Clients</h1>
        <p className="text-muted-foreground">
          {counts.pending > 0 && (
            <span className="text-yellow-600 font-medium">
              {counts.pending} pending request{counts.pending !== 1 ? "s" : ""}
            </span>
          )}
          {counts.pending > 0 && counts.accepted > 0 && " • "}
          {counts.accepted > 0 && (
            <span>{counts.accepted} active client{counts.accepted !== 1 ? "s" : ""}</span>
          )}
          {counts.pending === 0 && counts.accepted === 0 && (
            <span>{counts.total} total request{counts.total !== 1 ? "s" : ""}</span>
          )}
        </p>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All requests" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All requests</SelectItem>
            <SelectItem value="pending">
              Pending {counts.pending > 0 && `(${counts.pending})`}
            </SelectItem>
            <SelectItem value="accepted">
              Active {counts.accepted > 0 && `(${counts.accepted})`}
            </SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* No results for filter */}
      {filteredRequests.length === 0 && requests.length > 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            No requests match the selected filter
          </p>
          <Button variant="outline" onClick={() => setStatusFilter("__all__")}>
            Clear filter
          </Button>
        </div>
      )}

      {/* Request list */}
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <RequestCard
            key={request._id}
            request={request as ServiceRequest}
            onAccept={handleAccept}
            onDecline={handleDecline}
            onViewDeal={handleViewDeal}
            isResponding={respondingId === request._id}
          />
        ))}
      </div>
    </div>
  );
}
