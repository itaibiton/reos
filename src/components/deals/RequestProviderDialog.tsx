"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  ResponsiveDialog,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserIcon, CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";

type ProviderType = "broker" | "mortgage_advisor" | "lawyer";

interface RequestProviderDialogProps {
  dealId: Id<"deals">;
  providerType: ProviderType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PROVIDER_TYPE_LABELS: Record<ProviderType, string> = {
  broker: "Broker",
  mortgage_advisor: "Mortgage Advisor",
  lawyer: "Lawyer",
};

function getInitials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function RequestProviderDialog({
  dealId,
  providerType,
  open,
  onOpenChange,
}: RequestProviderDialogProps) {
  const [selectedProviderId, setSelectedProviderId] = useState<Id<"users"> | null>(null);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch recommended providers
  const providers = useQuery(
    api.serviceRequests.getRecommendedProviders,
    open ? { dealId, providerType } : "skip"
  );

  // Create request mutation
  const createRequest = useMutation(api.serviceRequests.create);

  const typeLabel = PROVIDER_TYPE_LABELS[providerType];

  async function handleSubmit() {
    if (!selectedProviderId) {
      toast.error("Please select a provider");
      return;
    }

    setIsSubmitting(true);
    try {
      await createRequest({
        dealId,
        providerId: selectedProviderId,
        message: message.trim() || undefined,
      });
      toast.success(`Request sent to ${typeLabel.toLowerCase()}`);
      onOpenChange(false);
      // Reset state
      setSelectedProviderId(null);
      setMessage("");
    } catch (error) {
      console.error("Error creating request:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send request");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    if (!isSubmitting) {
      onOpenChange(false);
      setSelectedProviderId(null);
      setMessage("");
    }
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={handleClose}>
      <ResponsiveDialogHeader>
        <ResponsiveDialogTitle>Find a {typeLabel}</ResponsiveDialogTitle>
        <ResponsiveDialogDescription>
          Select a {typeLabel.toLowerCase()} to help with your deal. They&apos;ll receive your
          request and can choose to accept.
        </ResponsiveDialogDescription>
      </ResponsiveDialogHeader>

        <div className="space-y-4 py-4">
          {/* Provider list */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Available {typeLabel}s</label>

            {providers === undefined ? (
              // Loading state
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : providers.length === 0 ? (
              // Empty state
              <div className="text-center py-8 border rounded-lg">
                <HugeiconsIcon
                  icon={UserIcon}
                  size={40}
                  className="mx-auto text-muted-foreground mb-2"
                />
                <p className="text-muted-foreground text-sm">
                  No {typeLabel.toLowerCase()}s available for this property&apos;s location
                </p>
              </div>
            ) : (
              // Provider list
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {providers.map((provider) => {
                  const isSelected = selectedProviderId === provider.userId;
                  return (
                    <button
                      key={provider.userId}
                      type="button"
                      onClick={() => setSelectedProviderId(provider.userId)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg border text-start transition-colors",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      )}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={provider.imageUrl} />
                        <AvatarFallback>{getInitials(provider.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{provider.name || "Unknown"}</p>
                          {isSelected && (
                            <HugeiconsIcon
                              icon={CheckmarkCircle01Icon}
                              size={16}
                              className="text-primary flex-shrink-0"
                            />
                          )}
                        </div>
                        {provider.companyName && (
                          <p className="text-sm text-muted-foreground truncate">
                            {provider.companyName}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          {provider.yearsExperience && (
                            <Badge variant="secondary" className="text-xs">
                              {provider.yearsExperience} years exp.
                            </Badge>
                          )}
                          {provider.specializations && provider.specializations.length > 0 && (
                            <span className="text-xs text-muted-foreground truncate">
                              {provider.specializations.slice(0, 2).join(", ")}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Message input */}
          {providers && providers.length > 0 && (
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">
                Message (optional)
              </label>
              <Textarea
                id="message"
                placeholder={`Introduce yourself and explain what you're looking for...`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                disabled={isSubmitting}
              />
            </div>
          )}
        </div>

        <ResponsiveDialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedProviderId || isSubmitting || !providers?.length}
          >
            {isSubmitting ? "Sending..." : "Send Request"}
          </Button>
        </ResponsiveDialogFooter>
    </ResponsiveDialog>
  );
}
