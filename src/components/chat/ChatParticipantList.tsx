"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";

export interface Participant {
  _id: Id<"users">;
  name: string;
  email?: string;
  imageUrl?: string;
  role?: string;
}

interface ChatParticipantListProps {
  dealId: Id<"deals">;
  selectedParticipantId?: Id<"users">;
  onSelectParticipant: (participant: Participant) => void;
  enableDrag?: boolean;
  /** Optional back handler for mobile navigation (shows header with back button) */
  onBack?: () => void;
  /** Optional deal title to show in mobile header */
  dealTitle?: string;
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

// Draggable participant item
interface DraggableParticipantProps {
  participant: Participant;
  isSelected: boolean;
  unreadCount: number;
  onClick: () => void;
  enableDrag: boolean;
}

function DraggableParticipant({
  participant,
  isSelected,
  unreadCount,
  onClick,
  enableDrag,
}: DraggableParticipantProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: participant._id,
      data: { participant },
      disabled: !enableDrag,
    });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 50 : undefined,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(enableDrag ? listeners : {})}
      {...(enableDrag ? attributes : {})}
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors",
        "hover:bg-accent",
        isSelected && "bg-accent",
        enableDrag && "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50 shadow-lg bg-background"
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Avatar */}
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={participant.imageUrl} alt={participant.name} />
        <AvatarFallback className="text-xs">
          {getInitials(participant.name)}
        </AvatarFallback>
      </Avatar>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{participant.name}</p>
        {participant.role && (
          <Badge variant="secondary" className="text-xs">
            {formatRole(participant.role)}
          </Badge>
        )}
      </div>

      {/* Unread badge */}
      {unreadCount > 0 && (
        <Badge className="ml-auto flex-shrink-0 h-5 min-w-[20px] px-1.5">
          {unreadCount > 99 ? "99+" : unreadCount}
        </Badge>
      )}
    </div>
  );
}

// Drag overlay content (rendered in DragOverlay at page level)
export function ParticipantDragPreview({
  participant,
}: {
  participant: Participant;
}) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-background border shadow-lg w-64">
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={participant.imageUrl} alt={participant.name} />
        <AvatarFallback className="text-xs">
          {getInitials(participant.name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{participant.name}</p>
        {participant.role && (
          <Badge variant="secondary" className="text-xs">
            {formatRole(participant.role)}
          </Badge>
        )}
      </div>
    </div>
  );
}

export function ChatParticipantList({
  dealId,
  selectedParticipantId,
  onSelectParticipant,
  enableDrag = false,
  onBack,
  dealTitle,
}: ChatParticipantListProps) {
  const { user } = useCurrentUser();

  // Fetch participants for this deal
  const participants = useQuery(api.messages.getDealParticipants, { dealId });

  // Fetch all messages for this deal to calculate unread counts per participant
  const allMessages = useQuery(api.messages.listForDeal, { dealId });

  // Calculate unread count per participant
  const unreadCounts = useMemo(() => {
    if (!allMessages || !user) return {};

    const counts: Record<string, number> = {};

    for (const msg of allMessages) {
      // Count unread messages sent TO current user (from each participant)
      if (msg.recipientId === user._id && msg.status !== "read") {
        const senderId = msg.senderId.toString();
        counts[senderId] = (counts[senderId] || 0) + 1;
      }
    }

    return counts;
  }, [allMessages, user]);

  const isLoading = participants === undefined;

  // Optional header for mobile navigation
  const header = onBack ? (
    <div className="flex items-center gap-3 px-4 h-14 border-b flex-shrink-0">
      <Button variant="ghost" size="icon" onClick={onBack}>
        <HugeiconsIcon icon={ArrowLeft01Icon} size={20} />
      </Button>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{dealTitle || "Select participant"}</p>
        <p className="text-xs text-muted-foreground">Choose who to chat with</p>
      </div>
    </div>
  ) : null;

  if (isLoading) {
    return (
      <div className={onBack ? "flex flex-col h-full" : ""}>
        {header}
        <div className="space-y-2 p-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!participants || participants.length === 0) {
    return (
      <div className={onBack ? "flex flex-col h-full" : ""}>
        {header}
        <div className="p-4 text-center text-muted-foreground text-sm">
          No participants to chat with in this deal
        </div>
      </div>
    );
  }

  return (
    <div className={onBack ? "flex flex-col h-full" : ""}>
      {header}
      <div className="space-y-1 p-2 flex-1 overflow-y-auto">
        {participants.map((participant) => {
          if (!participant) return null;

          const isSelected = selectedParticipantId === participant._id;
          const unreadCount = unreadCounts[participant._id.toString()] || 0;

          return (
            <DraggableParticipant
              key={participant._id}
              participant={participant as Participant}
              isSelected={isSelected}
              unreadCount={unreadCount}
              onClick={() => onSelectParticipant(participant as Participant)}
              enableDrag={enableDrag}
            />
          );
        })}
      </div>
    </div>
  );
}
