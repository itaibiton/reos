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
import { DealSelectorPopover } from "@/components/chat/DealSelectorPopover";
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
import { ChatModeToggle, ChatMode } from "@/components/chat/ChatModeToggle";
import { ConversationSelector } from "@/components/chat/ConversationSelector";
import { DirectChatThread } from "@/components/chat/DirectChatThread";
import { NewConversationDialog } from "@/components/chat/NewConversationDialog";
import { DealSelector } from "@/components/chat/DealSelector";
import { HugeiconsIcon } from "@hugeicons/react";
import { Message02Icon } from "@hugeicons/core-free-icons";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";

export default function ChatPage() {
  // Chat mode: deals or direct
  const [chatMode, setChatMode] = useState<ChatMode>("deals");

  // Deal chat state
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

  // Direct messaging state
  const [selectedConversationId, setSelectedConversationId] =
    useState<Id<"conversations"> | null>(null);
  const [newChatDialogOpen, setNewChatDialogOpen] = useState(false);
  const [newChatMode, setNewChatMode] = useState<"direct" | "group">("direct");

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

  // Fetch deals with property info for mobile header
  const dealsWithProperties = useQuery(api.deals.listWithProperties, {});

  // Fetch unread count for direct messages
  const directUnreadCount = useQuery(api.directMessages.getTotalUnreadCount, {});

  // Get selected deal title for mobile header
  const selectedDealTitle = useMemo(() => {
    if (!selectedDealId || !dealsWithProperties) return undefined;
    const deal = dealsWithProperties.find((d) => d._id === selectedDealId);
    return deal?.property?.title || "Deal";
  }, [selectedDealId, dealsWithProperties]);

  // Mobile state: determine if we should show list view or chat view
  const showMobileList = useMemo(() => {
    if (chatMode === "direct") {
      return !selectedConversationId;
    } else {
      // In deal mode, show list until a participant is selected
      return !selectedParticipant;
    }
  }, [chatMode, selectedConversationId, selectedParticipant]);

  // Handle chat mode change
  const handleChatModeChange = (mode: ChatMode) => {
    setChatMode(mode);
    // Reset selection when switching modes
    if (mode === "deals") {
      setSelectedConversationId(null);
    } else {
      setSelectedParticipant(null);
      // Reset multi-layout when switching to direct mode
      setLayoutMode("single");
      setPanes([null, null, null, null]);
    }
  };

  // Handle deal selection
  const handleDealSelect = (dealId: string) => {
    setSelectedDealId(dealId as Id<"deals">);
    setSelectedParticipant(null);
    // Reset panes when switching deals
    setPanes([null, null, null, null]);
  };

  // Handle conversation selection
  const handleConversationSelect = (conversationId: Id<"conversations">) => {
    setSelectedConversationId(conversationId);
  };

  // Handle new conversation created
  const handleConversationCreated = (conversationId: Id<"conversations">) => {
    setSelectedConversationId(conversationId);
  };

  // Handle when user leaves or deletes a conversation
  const handleConversationLeft = () => {
    setSelectedConversationId(null);
  };

  // Handle new chat button click
  const handleNewChat = () => {
    setNewChatMode("direct");
    setNewChatDialogOpen(true);
  };

  // Handle new group button click
  const handleNewGroup = () => {
    setNewChatMode("group");
    setNewChatDialogOpen(true);
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

  // Handle back from chat thread (mobile) - goes to participant/conversation list
  const handleBackFromChat = () => {
    if (chatMode === "deals") {
      setSelectedParticipant(null);
    } else {
      setSelectedConversationId(null);
    }
  };

  // Handle back from participant list to deal list (mobile deal mode)
  const handleBackToDealList = () => {
    setSelectedDealId(null);
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
        {/* Left sidebar */}
        <div className="w-72 border-r flex flex-col flex-shrink-0 hidden lg:flex">
          {/* Chat mode toggle */}
          <div className="p-3 border-b flex-shrink-0">
            <ChatModeToggle
              mode={chatMode}
              onModeChange={handleChatModeChange}
              directUnreadCount={directUnreadCount ?? 0}
            />
          </div>

          {chatMode === "deals" ? (
            // Deal mode sidebar
            <>
              {/* Deal selector */}
              <div className="p-3 border-b flex-shrink-0">
                {isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <DealSelectorPopover
                    selectedDealId={selectedDealId}
                    onSelect={handleDealSelect}
                  />
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
            </>
          ) : (
            // Direct mode sidebar
            <div className="flex-1 overflow-y-auto">
              <ConversationSelector
                selectedConversationId={selectedConversationId}
                onSelect={handleConversationSelect}
                onNewChat={handleNewChat}
                onNewGroup={handleNewGroup}
              />
            </div>
          )}
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* ===== MOBILE VIEW - WhatsApp-style page-based navigation ===== */}
          <div className="lg:hidden h-full flex flex-col">
            {showMobileList ? (
              /* Mobile list state - show tabs + list */
              <>
                {/* Mode toggle tabs - always visible in list view */}
                <div className="border-b p-3 flex-shrink-0">
                  <ChatModeToggle
                    mode={chatMode}
                    onModeChange={handleChatModeChange}
                    directUnreadCount={directUnreadCount ?? 0}
                  />
                </div>

                {/* List content based on mode and selection */}
                <div className="flex-1 overflow-y-auto">
                  {chatMode === "direct" ? (
                    /* Direct mode: conversation list */
                    <ConversationSelector
                      selectedConversationId={selectedConversationId}
                      onSelect={handleConversationSelect}
                      onNewChat={handleNewChat}
                      onNewGroup={handleNewGroup}
                    />
                  ) : !selectedDealId ? (
                    /* Deal mode: no deal selected - show deal list */
                    <div className="p-3">
                      <DealSelector
                        selectedDealId={selectedDealId}
                        onSelect={handleDealSelect}
                      />
                    </div>
                  ) : (
                    /* Deal mode: deal selected - show participant list with back */
                    <ChatParticipantList
                      dealId={selectedDealId}
                      selectedParticipantId={selectedParticipant?._id}
                      onSelectParticipant={handleParticipantSelect}
                      onBack={handleBackToDealList}
                      dealTitle={selectedDealTitle}
                    />
                  )}
                </div>
              </>
            ) : (
              /* Mobile chat state - full-screen chat thread */
              chatMode === "direct" ? (
                <DirectChatThread
                  conversationId={selectedConversationId!}
                  onBack={handleBackFromChat}
                  onConversationLeft={handleConversationLeft}
                />
              ) : (
                <ChatThread
                  dealId={selectedDealId!}
                  participantId={selectedParticipant!._id}
                  participantName={selectedParticipant!.name}
                  participantImage={selectedParticipant?.imageUrl}
                  participantRole={selectedParticipant?.role}
                  onBack={handleBackFromChat}
                />
              )
            )}
          </div>

          {/* ===== DESKTOP VIEW - sidebar + main chat area ===== */}
          <div className="hidden lg:flex lg:flex-col h-full">
            {chatMode === "deals" ? (
              // Deal chat content
              <>
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
                      onBack={handleBackFromChat}
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
              </>
            ) : (
              // Direct chat content
              selectedConversationId ? (
                <DirectChatThread
                  conversationId={selectedConversationId}
                  onBack={handleBackFromChat}
                  onConversationLeft={handleConversationLeft}
                />
              ) : (
                <Empty className="h-full border-0">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <HugeiconsIcon icon={Message02Icon} size={24} />
                    </EmptyMedia>
                    <EmptyTitle>Select a conversation</EmptyTitle>
                    <EmptyDescription>
                      Choose a conversation from the list or start a new chat
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )
            )}
          </div>
        </div>

        {/* Drag overlay (only for deal mode) */}
        {chatMode === "deals" && (
          <DragOverlay>
            {activeDragParticipant && (
              <ParticipantDragPreview participant={activeDragParticipant} />
            )}
          </DragOverlay>
        )}
      </div>

      {/* Participant selector dialog (deal mode) */}
      {selectedDealId && chatMode === "deals" && (
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

      {/* New conversation dialog (direct mode) */}
      <NewConversationDialog
        open={newChatDialogOpen}
        onOpenChange={setNewChatDialogOpen}
        onConversationCreated={handleConversationCreated}
        mode={newChatMode}
      />
    </DndContext>
  );
}
