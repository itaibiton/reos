"use client";

import { useDroppable } from "@dnd-kit/core";
import { useTranslations } from "next-intl";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, UserAdd01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { ChatThread } from "./ChatThread";
import { Participant } from "./ChatParticipantList";

interface ChatPaneProps {
  paneId: string;
  participant: Participant | null;
  dealId: Id<"deals">;
  onClear: () => void;
  onSelectParticipant: () => void;
  compact?: boolean;
}

export function ChatPane({
  paneId,
  participant,
  dealId,
  onClear,
  onSelectParticipant,
  compact = false,
}: ChatPaneProps) {
  const t = useTranslations("chat");
  const { setNodeRef, isOver } = useDroppable({
    id: paneId,
  });

  // Empty state: drop zone + select button
  if (!participant) {
    return (
      <div
        ref={setNodeRef}
        className={cn(
          "h-full flex flex-col items-center justify-center border-2 border-dashed rounded-lg transition-colors",
          isOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/40"
        )}
      >
        <div className="text-center space-y-3">
          <div
            className={cn(
              "mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center",
              isOver && "bg-primary/10"
            )}
          >
            <HugeiconsIcon
              icon={UserAdd01Icon}
              size={24}
              className={cn(
                "text-muted-foreground",
                isOver && "text-primary"
              )}
            />
          </div>
          <div className="space-y-1">
            <p
              className={cn(
                "text-sm font-medium",
                isOver ? "text-primary" : "text-muted-foreground"
              )}
            >
              {isOver ? t("pane.dropToAssign") : t("pane.dragHere")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("pane.clickBelow")}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectParticipant}
            className="mt-2"
          >
            {t("pane.selectParticipant")}
          </Button>
        </div>
      </div>
    );
  }

  // Filled state: chat thread with close button
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "h-full flex flex-col border rounded-lg overflow-hidden",
        isOver && "ring-2 ring-primary ring-offset-2"
      )}
    >
      {/* Compact header for multi-pane view */}
      {compact && (
        <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
          <span className="text-sm font-medium truncate">
            {participant.name}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 flex-shrink-0"
            onClick={onClear}
          >
            <HugeiconsIcon icon={Cancel01Icon} size={14} />
          </Button>
        </div>
      )}

      {/* Chat thread */}
      <div className="flex-1 min-h-0">
        <ChatThread
          dealId={dealId}
          participantId={participant._id}
          participantName={participant.name}
          participantImage={participant.imageUrl}
          participantRole={participant.role}
          onBack={compact ? undefined : onClear}
          hideHeader={compact}
        />
      </div>
    </div>
  );
}
