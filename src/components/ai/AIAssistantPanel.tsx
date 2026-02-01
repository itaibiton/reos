"use client";

import { useState } from "react";
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
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon } from "@hugeicons/core-free-icons";
import { useAIAssistantChat } from "./hooks/useAIAssistantChat";
import { usePageContext } from "./hooks/usePageContext";
import { useSuggestedPrompts } from "./hooks/useSuggestedPrompts";
import { StreamingChatMessageList } from "./ChatMessageList";
import { AIChatInput } from "./AIChatInput";
import { SuggestedPrompts } from "./SuggestedPrompts";

/**
 * AssistantChatContent - Inner content for the AI Assistant panel.
 *
 * Uses the new useAIAssistantChat hook with real-time streaming.
 * Renders StreamingChatMessageList for UIMessage support.
 */
function AssistantChatContent() {
  const t = useTranslations("aiAssistant");
  const [showClearDialog, setShowClearDialog] = useState(false);

  const pageContext = usePageContext();
  const suggestedPrompts = useSuggestedPrompts(pageContext.pageType);

  const {
    messages,
    isStreaming,
    isLoading,
    error,
    sendMessage,
    stopGeneration,
    clearMemory,
  } = useAIAssistantChat(pageContext);

  const handleClearMemory = async () => {
    await clearMemory();
    setShowClearDialog(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0">
        <h2 className="text-lg font-semibold">{t("header.title")}</h2>
        <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={t("header.clear")}>
              <HugeiconsIcon icon={Delete02Icon} size={18} />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("clearDialog.title")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("clearDialog.description")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("clearDialog.cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearMemory}>
                {t("clearDialog.confirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Error display */}
      {error && (
        <div className="px-4 py-2 bg-destructive/10 text-destructive text-sm border-b flex-shrink-0">
          {error}
        </div>
      )}

      {/* Message list */}
      <StreamingChatMessageList
        messages={messages}
        isStreaming={isStreaming}
        isLoading={isLoading}
      />

      {/* Suggested prompts - shown when conversation is empty */}
      {!isLoading && messages.length === 0 && suggestedPrompts.length > 0 && (
        <SuggestedPrompts
          prompts={suggestedPrompts}
          onSelect={sendMessage}
        />
      )}

      {/* Input */}
      <AIChatInput
        onSend={sendMessage}
        onStop={stopGeneration}
        isStreaming={isStreaming}
        placeholder={t("input.placeholder")}
      />
    </div>
  );
}

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
          <AssistantChatContent />
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
        <AssistantChatContent />
      </SheetContent>
    </Sheet>
  );
}
