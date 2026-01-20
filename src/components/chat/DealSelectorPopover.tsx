"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { useTranslations } from "next-intl";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DealSelector } from "./DealSelector";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, Agreement01Icon } from "@hugeicons/core-free-icons";

interface DealSelectorPopoverProps {
  selectedDealId: Id<"deals"> | null;
  onSelect: (dealId: string) => void;
}

export function DealSelectorPopover({
  selectedDealId,
  onSelect,
}: DealSelectorPopoverProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const t = useTranslations("chat.dealSelectorPopover");

  // Fetch selected deal info for trigger button display
  const dealsWithProperties = useQuery(api.deals.listWithProperties, {});
  const selectedDeal = dealsWithProperties?.find((d) => d._id === selectedDealId);

  const handleSelect = (dealId: string) => {
    onSelect(dealId);
    setDialogOpen(false);
    setSheetOpen(false);
  };

  const triggerContent = (
    <>
      <HugeiconsIcon icon={Agreement01Icon} size={16} />
      <span className="flex-1 text-start truncate">
        {selectedDeal?.property?.title || t("selectDeal")}
      </span>
      <HugeiconsIcon
        icon={ArrowDown01Icon}
        size={16}
        className="text-muted-foreground"
      />
    </>
  );

  return (
    <>
      {/* Desktop: Dialog */}
      <div className="hidden md:block">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 h-10"
            >
              {triggerContent}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("title")}</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[400px] -mx-6 px-6">
              <DealSelector selectedDealId={selectedDealId} onSelect={handleSelect} />
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      {/* Mobile: Sheet */}
      <div className="md:hidden">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 h-10"
            >
              {triggerContent}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[70vh] rounded-t-xl">
            <SheetHeader>
              <SheetTitle>{t("title")}</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <ScrollArea className="h-[calc(70vh-100px)]">
                <DealSelector
                  selectedDealId={selectedDealId}
                  onSelect={handleSelect}
                />
              </ScrollArea>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
