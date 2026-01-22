"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { MessageQuestionIcon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface QuickReplyButtonsProps {
  onPromptSelect: (prompt: string) => void;
  profileComplete?: boolean;
  className?: string;
}

export function QuickReplyButtons({
  onPromptSelect,
  profileComplete = true,
  className,
}: QuickReplyButtonsProps) {
  const t = useTranslations("quickReplies");
  const [collapsed, setCollapsed] = useState(false);

  // Prompts are in English for AI processing, labels are translated
  const basePrompts = [
    { labelKey: "showProperties", prompt: "Show me properties that match my preferences" },
    { labelKey: "buildTeam", prompt: "Help me find service providers for my investment" },
    { labelKey: "explainOptions", prompt: "What are my investment options based on my profile?" },
  ];

  // Add context-aware prompt if profile incomplete
  const prompts = profileComplete
    ? basePrompts
    : [
        ...basePrompts,
        { labelKey: "completeProfile", prompt: "What information am I missing in my profile?" },
      ];

  if (collapsed) {
    return (
      <div className="px-3 py-2 border-t bg-muted/30">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(false)}
          className="text-xs text-muted-foreground"
        >
          <HugeiconsIcon icon={MessageQuestionIcon} size={14} className="me-1" />
          {t("showSuggestions")}
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("px-3 py-2 border-t bg-muted/30", className)}>
      <div className="flex flex-wrap gap-2">
        {prompts.map(({ labelKey, prompt }) => (
          <Button
            key={labelKey}
            variant="outline"
            size="sm"
            onClick={() => {
              onPromptSelect(prompt);
              setCollapsed(true);
            }}
            className="text-xs h-7"
          >
            {t(labelKey)}
          </Button>
        ))}
      </div>
    </div>
  );
}
