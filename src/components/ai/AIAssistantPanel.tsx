"use client";

import { useAIAssistant } from "@/providers/AIAssistantProvider";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslations } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { AIChatPanel } from "./AIChatPanel";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export function AIAssistantPanel() {
  const { isOpen, close } = useAIAssistant();
  const isMobile = useIsMobile();
  const t = useTranslations("aiAssistant");

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => { if (!open) close(); }}>
        <DrawerContent className="h-[100dvh] max-h-[100dvh] p-0 rounded-none">
          <VisuallyHidden>
            <DrawerHeader>
              <DrawerTitle>{t("panelTitle")}</DrawerTitle>
              <DrawerDescription>{t("panelDescription")}</DrawerDescription>
            </DrawerHeader>
          </VisuallyHidden>
          <AIChatPanel className="h-full" />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) close(); }}>
      <SheetContent
        side="right"
        className="w-[440px] sm:max-w-[440px] p-0 flex flex-col [&>button]:hidden"
      >
        <VisuallyHidden>
          <SheetHeader>
            <SheetTitle>{t("panelTitle")}</SheetTitle>
            <SheetDescription>{t("panelDescription")}</SheetDescription>
          </SheetHeader>
        </VisuallyHidden>
        <AIChatPanel className="h-full" />
      </SheetContent>
    </Sheet>
  );
}
