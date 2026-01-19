"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Participant } from "./ChatParticipantList";

interface ParticipantSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealId: Id<"deals">;
  excludeIds: Id<"users">[];
  onSelect: (participant: Participant) => void;
}

// Format role for display
function formatRole(role?: string) {
  if (!role) return null;
  const labels: Record<string, string> = {
    investor: "Investor",
    broker: "Broker",
    mortgage_advisor: "Mortgage Advisor",
    lawyer: "Lawyer",
    admin: "Admin",
  };
  return labels[role] || role;
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

export function ParticipantSelectorDialog({
  open,
  onOpenChange,
  dealId,
  excludeIds,
  onSelect,
}: ParticipantSelectorDialogProps) {
  // Fetch participants for this deal
  const participants = useQuery(
    api.messages.getDealParticipants,
    open ? { dealId } : "skip"
  );

  // Filter out already assigned participants
  const availableParticipants = participants?.filter(
    (p) => p && !excludeIds.includes(p._id)
  );

  const isLoading = participants === undefined;

  const handleSelect = (participant: Participant) => {
    onSelect(participant);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Participant</DialogTitle>
          <DialogDescription>
            Choose a participant to chat with in this pane
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-80">
          <div className="space-y-1 pe-4">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))
            ) : !availableParticipants || availableParticipants.length === 0 ? (
              // Empty state
              <div className="py-8 text-center">
                <p className="text-muted-foreground text-sm">
                  {participants && participants.length > 0
                    ? "All participants are already assigned to panes"
                    : "No participants available for this deal"}
                </p>
              </div>
            ) : (
              // Participant list
              availableParticipants.map((participant) => {
                if (!participant) return null;

                return (
                  <Button
                    key={participant._id}
                    variant="ghost"
                    className="w-full justify-start h-auto py-3 px-3"
                    onClick={() => handleSelect(participant as Participant)}
                  >
                    <Avatar className="h-10 w-10 me-3 flex-shrink-0">
                      <AvatarImage
                        src={participant.imageUrl}
                        alt={participant.name}
                      />
                      <AvatarFallback>
                        {getInitials(participant.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-medium truncate">{participant.name}</p>
                      {participant.role && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          {formatRole(participant.role)}
                        </Badge>
                      )}
                    </div>
                  </Button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
