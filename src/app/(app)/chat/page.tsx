"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
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
import { ChatParticipantList, Participant } from "@/components/chat/ChatParticipantList";
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
  const [selectedDealId, setSelectedDealId] = useState<Id<"deals"> | null>(null);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);

  // Fetch user's deals
  const deals = useQuery(api.deals.list, {});

  // Fetch properties for deal titles
  const propertyIds = useMemo(() => {
    if (!deals) return [];
    return [...new Set(deals.map((d) => d.propertyId))];
  }, [deals]);

  // Fetch properties (we'll do one-by-one since there's no batch query)
  const properties = useQuery(
    api.properties.getById,
    propertyIds.length > 0 ? { id: propertyIds[0] } : "skip"
  );

  // Build a map of deal ID to property title
  const dealTitles = useMemo(() => {
    const titles: Record<string, string> = {};
    if (deals) {
      for (const deal of deals) {
        // For now, use city from deal or fallback
        titles[deal._id.toString()] = `Deal #${deal._id.toString().slice(-6)}`;
      }
    }
    return titles;
  }, [deals]);

  // Handle deal selection
  const handleDealSelect = (dealId: string) => {
    setSelectedDealId(dealId as Id<"deals">);
    setSelectedParticipant(null); // Clear participant when switching deals
  };

  // Handle participant selection
  const handleParticipantSelect = (participant: Participant) => {
    setSelectedParticipant(participant);
  };

  // Handle back from chat (mobile)
  const handleBack = () => {
    setSelectedParticipant(null);
  };

  const isLoading = deals === undefined;
  const hasDeals = deals && deals.length > 0;

  // Filter to only active deals (not completed or cancelled)
  const activeDeals = useMemo(() => {
    if (!deals) return [];
    return deals.filter(d => d.stage !== "completed" && d.stage !== "cancelled");
  }, [deals]);

  return (
    <div className="h-full flex">
      {/* Left sidebar: Deal selector + participant list */}
      <div className="w-80 border-r flex flex-col flex-shrink-0 hidden lg:flex">
        {/* Deal selector */}
        <div className="p-4 border-b">
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Select Deal
          </label>
          {isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : activeDeals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active deals</p>
          ) : (
            <Select
              value={selectedDealId?.toString() || ""}
              onValueChange={handleDealSelect}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a deal..." />
              </SelectTrigger>
              <SelectContent>
                {activeDeals.map((deal) => (
                  <SelectItem key={deal._id} value={deal._id.toString()}>
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon icon={Agreement01Icon} size={14} />
                      <span>{dealTitles[deal._id.toString()] || `Deal ${deal._id}`}</span>
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
            <ChatParticipantList
              dealId={selectedDealId}
              selectedParticipantId={selectedParticipant?._id}
              onSelectParticipant={handleParticipantSelect}
            />
          ) : (
            <div className="p-4 text-center text-muted-foreground text-sm">
              Select a deal to see participants
            </div>
          )}
        </div>
      </div>

      {/* Main area: Chat thread or empty state */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedParticipant && selectedDealId ? (
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
              <EmptyTitle>
                {!hasDeals
                  ? "No deals yet"
                  : !selectedDealId
                    ? "Select a deal"
                    : "Select a conversation"}
              </EmptyTitle>
              <EmptyDescription>
                {!hasDeals
                  ? "Start a deal on a property to chat with service providers"
                  : !selectedDealId
                    ? "Choose a deal from the sidebar to see who you can chat with"
                    : "Choose a participant from the list to start messaging"}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </div>
  );
}
