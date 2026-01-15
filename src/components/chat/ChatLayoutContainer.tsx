"use client";

import { Id } from "../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { ChatPane } from "./ChatPane";
import { Participant } from "./ChatParticipantList";
import { LayoutMode } from "./LayoutModeSelector";

interface ChatLayoutContainerProps {
  mode: LayoutMode;
  dealId: Id<"deals">;
  panes: (Participant | null)[];
  onPaneChange: (paneIndex: number, participant: Participant | null) => void;
  onOpenSelector: (paneIndex: number) => void;
}

export function ChatLayoutContainer({
  mode,
  dealId,
  panes,
  onPaneChange,
  onOpenSelector,
}: ChatLayoutContainerProps) {
  // Determine visible panes based on mode
  const visiblePanes = mode === "single" ? 1 : mode === "split" ? 2 : 4;

  // Grid layout based on mode
  const gridClass = {
    single: "grid-cols-1",
    split: "grid-cols-2",
    quad: "grid-cols-2 grid-rows-2",
  }[mode];

  return (
    <div
      className={cn(
        "grid h-full gap-2 p-2",
        gridClass,
        // For quad mode, ensure both rows take equal space
        mode === "quad" && "auto-rows-fr"
      )}
    >
      {Array.from({ length: visiblePanes }).map((_, index) => (
        <ChatPane
          key={`pane-${index}`}
          paneId={`pane-${index}`}
          participant={panes[index] || null}
          dealId={dealId}
          onClear={() => onPaneChange(index, null)}
          onSelectParticipant={() => onOpenSelector(index)}
          compact={mode !== "single"}
        />
      ))}
    </div>
  );
}
