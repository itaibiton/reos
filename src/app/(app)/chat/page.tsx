"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery } from "convex/react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatThread } from "@/components/chat/ChatThread";
import {
  ChatParticipantList,
  Participant,
  ParticipantDragPreview,
} from "@/components/chat/ChatParticipantList";
import { ChatLayoutContainer } from "@/components/chat/ChatLayoutContainer";
import {
  LayoutModeSelector,
  LayoutMode,
} from "@/components/chat/LayoutModeSelector";
import { ParticipantSelectorDialog } from "@/components/chat/ParticipantSelectorDialog";
import { HugeiconsIcon } from "@hugeicons/react";
import { Message02Icon, Agreement01Icon } from "@hugeicons/core-free-icons";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";

export default function ChatPage() {
  const [selectedDealId, setSelectedDealId] = useState<Id<"deals"> | null>(
    null
  );
  const [selectedParticipant, setSelectedParticipant] =
    useState<Participant | null>(null);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("single");
  const [panes, setPanes] = useState<(Participant | null)[]>([
    null,
    null,
    null,
    null,
  ]);
  const [activeDragParticipant, setActiveDragParticipant] =
    useState<Participant | null>(null);
  const [selectorPaneIndex, setSelectorPaneIndex] = useState<number | null>(
    null
  );

  // Configure drag sensors with activation constraints
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before starting drag
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  // Fetch user's deals
  const deals = useQuery(api.deals.list, {});

  // Build a map of deal ID to property title
  const dealTitles = useMemo(() => {
    const titles: Record<string, string> = {};
    if (deals) {
      for (const deal of deals) {
        titles[deal._id.toString()] = `Deal #${deal._id.toString().slice(-6)}`;
      }
    }
    return titles;
  }, [deals]);

  // Handle deal selection
  const handleDealSelect = (dealId: string) => {
    setSelectedDealId(dealId as Id<"deals">);
    setSelectedParticipant(null);
    // Reset panes when switching deals
    setPanes([null, null, null, null]);
  };

  // Handle participant selection (for single mode)
  const handleParticipantSelect = useCallback(
    (participant: Participant) => {
      if (layoutMode === "single") {
        setSelectedParticipant(participant);
      } else {
        // In multi-pane mode, clicking assigns to first empty pane
        const emptyIndex = panes.findIndex((p) => p === null);
        if (emptyIndex !== -1) {
          setPanes((prev) => {
            const next = [...prev];
            next[emptyIndex] = participant;
            return next;
          });
        }
      }
    },
    [layoutMode, panes]
  );

  // Handle back from chat (mobile)
  const handleBack = () => {
    setSelectedParticipant(null);
  };

  // Handle pane change
  const handlePaneChange = useCallback(
    (paneIndex: number, participant: Participant | null) => {
      setPanes((prev) => {
        const next = [...prev];
        next[paneIndex] = participant;
        return next;
      });
    },
    []
  );

  // Handle opening participant selector for a pane
  const handleOpenSelector = useCallback((paneIndex: number) => {
    setSelectorPaneIndex(paneIndex);
  }, []);

  // Handle selecting participant from dialog
  const handleDialogSelect = useCallback(
    (participant: Participant) => {
      if (selectorPaneIndex !== null) {
        handlePaneChange(selectorPaneIndex, participant);
        setSelectorPaneIndex(null);
      }
    },
    [selectorPaneIndex, handlePaneChange]
  );

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const participant = event.active.data.current?.participant as
      | Participant
      | undefined;
    if (participant) {
      setActiveDragParticipant(participant);
    }
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragParticipant(null);

    if (!over) return;

    // Extract pane index from droppable id
    const paneId = over.id.toString();
    if (!paneId.startsWith("pane-")) return;

    const paneIndex = parseInt(paneId.replace("pane-", ""));
    if (isNaN(paneIndex)) return;

    // Get participant from drag data
    const participant = active.data.current?.participant as
      | Participant
      | undefined;
    if (!participant) return;

    // Check if participant is already in another pane, if so swap
    const existingPaneIndex = panes.findIndex(
      (p) => p?._id === participant._id
    );

    setPanes((prev) => {
      const next = [...prev];

      // If dropping on a pane that has a participant, swap
      if (existingPaneIndex !== -1 && existingPaneIndex !== paneIndex) {
        // Swap the participants
        const targetParticipant = next[paneIndex];
        next[existingPaneIndex] = targetParticipant;
      }

      next[paneIndex] = participant;
      return next;
    });
  };

  // Handle layout mode change
  const handleLayoutModeChange = (mode: LayoutMode) => {
    setLayoutMode(mode);
    // When switching to single mode, preserve first pane as selected participant
    if (mode === "single" && panes[0]) {
      setSelectedParticipant(panes[0]);
    }
    // When switching from single to multi, put selected participant in first pane
    if (mode !== "single" && selectedParticipant) {
      setPanes((prev) => {
        const next = [...prev];
        // Only set if not already in a pane
        if (!next.some((p) => p?._id === selectedParticipant._id)) {
          next[0] = selectedParticipant;
        }
        return next;
      });
    }
  };

  const isLoading = deals === undefined;
  const hasDeals = deals && deals.length > 0;

  // Filter to only active deals (not completed or cancelled)
  const activeDeals = useMemo(() => {
    if (!deals) return [];
    return deals.filter(
      (d) => d.stage !== "completed" && d.stage !== "cancelled"
    );
  }, [deals]);

  // Get IDs of participants currently assigned to panes (for excluding from selector)
  const assignedParticipantIds = useMemo(() => {
    return panes.filter((p): p is Participant => p !== null).map((p) => p._id);
  }, [panes]);

  // Check if we're in multi-layout mode
  const isMultiLayout = layoutMode !== "single";

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full flex">
        {/* Left sidebar: Participant list */}
        <div className="w-72 border-r flex flex-col flex-shrink-0 hidden lg:flex">
          {/* Deal selector header */}
          <div className="p-3 border-b flex-shrink-0">
            {isLoading ? (
              <Skeleton className="h-9 w-full" />
            ) : activeDeals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active deals</p>
            ) : (
              <Select
                value={selectedDealId?.toString() || ""}
                onValueChange={handleDealSelect}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a deal..." />
                </SelectTrigger>
                <SelectContent>
                  {activeDeals.map((deal) => (
                    <SelectItem key={deal._id} value={deal._id.toString()}>
                      <div className="flex items-center gap-2">
                        <HugeiconsIcon icon={Agreement01Icon} size={14} />
                        <span>
                          {dealTitles[deal._id.toString()] || `Deal ${deal._id}`}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Participant list */}
          <div className="flex-1 overflow-y-auto">
            {selectedDealId ? (
              <>
                {isMultiLayout && (
                  <div className="p-2 border-b bg-muted/30">
                    <p className="text-xs text-muted-foreground text-center">
                      Drag participants to chat panes
                    </p>
                  </div>
                )}
                <ChatParticipantList
                  dealId={selectedDealId}
                  selectedParticipantId={
                    layoutMode === "single"
                      ? selectedParticipant?._id
                      : undefined
                  }
                  onSelectParticipant={handleParticipantSelect}
                  enableDrag={isMultiLayout}
                />
              </>
            ) : (
              <div className="p-4 text-center text-muted-foreground text-sm">
                Select a deal to see participants
              </div>
            )}
          </div>

          {/* Layout mode selector at bottom */}
          {selectedDealId && (
            <div className="p-3 border-t flex-shrink-0">
              <LayoutModeSelector
                mode={layoutMode}
                onModeChange={handleLayoutModeChange}
              />
            </div>
          )}
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col min-w-0">
            {!selectedDealId ? (
              // No deal selected
              <Empty className="h-full border-0">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <HugeiconsIcon icon={Message02Icon} size={24} />
                  </EmptyMedia>
                  <EmptyTitle>
                    {!hasDeals ? "No deals yet" : "Select a deal"}
                  </EmptyTitle>
                  <EmptyDescription>
                    {!hasDeals
                      ? "Start a deal on a property to chat with service providers"
                      : "Choose a deal from the dropdown to see who you can chat with"}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : layoutMode === "single" ? (
              // Single layout mode
              selectedParticipant ? (
                <ChatThread
                  dealId={selectedDealId}
                  participantId={selectedParticipant._id}
                  participantName={selectedParticipant.name}
                  participantImage={selectedParticipant.imageUrl}
                  participantRole={selectedParticipant.role}
                  onBack={handleBack}
                />
              ) : (
                <Empty className="h-full border-0">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <HugeiconsIcon icon={Message02Icon} size={24} />
                    </EmptyMedia>
                    <EmptyTitle>Select a conversation</EmptyTitle>
                    <EmptyDescription>
                      Choose a participant from the list to start messaging
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )
            ) : (
              // Multi-layout mode (split or quad)
              <ChatLayoutContainer
                mode={layoutMode}
                dealId={selectedDealId}
                panes={panes}
                onPaneChange={handlePaneChange}
                onOpenSelector={handleOpenSelector}
              />
            )}
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeDragParticipant && (
            <ParticipantDragPreview participant={activeDragParticipant} />
          )}
        </DragOverlay>
      </div>

      {/* Participant selector dialog */}
      {selectedDealId && (
        <ParticipantSelectorDialog
          open={selectorPaneIndex !== null}
          onOpenChange={(open) => {
            if (!open) setSelectorPaneIndex(null);
          }}
          dealId={selectedDealId}
          excludeIds={assignedParticipantIds}
          onSelect={handleDialogSelect}
        />
      )}
    </DndContext>
  );
}
