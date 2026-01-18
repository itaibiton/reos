"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserMultiple02Icon,
  Search01Icon,
  ArrowRight01Icon,
  Agreement01Icon,
  Calendar01Icon,
  Money01Icon,
} from "@hugeicons/core-free-icons";
import { useCurrentUser } from "@/hooks/useCurrentUser";

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

// Skeleton loader for client cards
function ClientCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
            <div className="flex gap-4 mt-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

// Client card component
interface Client {
  _id: string;
  name?: string;
  email?: string;
  imageUrl?: string;
  totalDeals: number;
  activeDeals: number;
  totalValue: number;
  lastActivityAt: number;
}

interface ClientCardProps {
  client: Client;
  onViewDetails: (clientId: string) => void;
}

function ClientCard({ client, onViewDetails }: ClientCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar className="h-12 w-12 flex-shrink-0">
            <AvatarImage src={client.imageUrl} />
            <AvatarFallback className="text-sm">
              {getInitials(client.name)}
            </AvatarFallback>
          </Avatar>

          {/* Client Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">
              {client.name || "Unknown Client"}
            </h3>
            {client.email && (
              <p className="text-sm text-muted-foreground truncate">
                {client.email}
              </p>
            )}

            {/* Stats Row */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <HugeiconsIcon icon={Agreement01Icon} size={12} />
                <span>
                  {client.totalDeals} deal{client.totalDeals !== 1 ? "s" : ""}
                </span>
                {client.activeDeals > 0 && (
                  <span className="text-green-600 font-medium">
                    ({client.activeDeals} active)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <HugeiconsIcon icon={Money01Icon} size={12} />
                <span>{formatUSD(client.totalValue)}</span>
              </div>
              <div className="flex items-center gap-1">
                <HugeiconsIcon icon={Calendar01Icon} size={12} />
                <span>{formatDate(client.lastActivityAt)}</span>
              </div>
            </div>
          </div>

          {/* View Details Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewDetails(client._id)}
            className="flex-shrink-0"
          >
            View
            <HugeiconsIcon icon={ArrowRight01Icon} size={14} className="ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ClientsPage() {
  const router = useRouter();
  const { effectiveRole } = useCurrentUser();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch clients using new getClients query
  const clients = useQuery(api.clients.getClients, {});

  // Filter clients by search query
  const filteredClients = useMemo(() => {
    if (!clients) return [];

    if (!searchQuery.trim()) {
      return clients;
    }

    const query = searchQuery.toLowerCase();
    return clients.filter(
      (client) =>
        client.name?.toLowerCase().includes(query) ||
        client.email?.toLowerCase().includes(query)
    );
  }, [clients, searchQuery]);

  // Handle view details
  function handleViewDetails(clientId: string) {
    router.push(`/clients/${clientId}`);
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
            This page is for service providers to manage their clients.
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (clients === undefined) {
    return (
      <div className="p-6">
        {/* Header skeleton */}
        <div className="mb-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-5 w-48 mt-1" />
        </div>

        {/* Search skeleton */}
        <div className="mb-6">
          <Skeleton className="h-10 w-full max-w-md" />
        </div>

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <ClientCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Empty state (no clients at all)
  if (clients.length === 0) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="rounded-full bg-muted p-4 mb-4 text-muted-foreground">
            <HugeiconsIcon icon={UserMultiple02Icon} size={48} strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-semibold mb-2">No clients yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            When you accept client requests, they&apos;ll appear here.
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
          {clients.length} client{clients.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <HugeiconsIcon
            icon={Search01Icon}
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* No results for search */}
      {filteredClients.length === 0 && searchQuery.trim() && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            No clients match &quot;{searchQuery}&quot;
          </p>
          <Button variant="outline" onClick={() => setSearchQuery("")}>
            Clear search
          </Button>
        </div>
      )}

      {/* Client grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => (
          <ClientCard
            key={client._id}
            client={client}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>
    </div>
  );
}
