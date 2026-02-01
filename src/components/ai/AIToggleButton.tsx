"use client";

import { useAIAssistant } from "@/providers/AIAssistantProvider";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { AiChat02Icon } from "@hugeicons/core-free-icons";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export function AIToggleButton() {
  const { isOpen, toggle } = useAIAssistant();
  const t = useTranslations("aiAssistant");

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className={cn("h-9 w-9", isOpen && "bg-accent")}
      aria-label={t("toggle")}
    >
      <HugeiconsIcon icon={AiChat02Icon} size={20} />
    </Button>
  );
}

export function AIToggleFAB() {
  const { isOpen, toggle } = useAIAssistant();
  const isMobile = useIsMobile();
  const t = useTranslations("aiAssistant");

  // Only show on mobile when panel is closed
  if (!isMobile || isOpen) return null;

  return (
    <button
      onClick={toggle}
      className="fixed bottom-24 end-4 z-40 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center active:scale-95 transition-transform"
      aria-label={t("fabLabel")}
    >
      <HugeiconsIcon icon={AiChat02Icon} size={24} />
    </button>
  );
}
