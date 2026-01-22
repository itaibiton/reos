"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { MessageQuestionIcon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

interface QuickReplyButtonsProps {
  onPromptSelect: (prompt: string) => void;
  profileComplete?: boolean;
  className?: string;
}

const BASE_PROMPTS = [
  { label: "Show properties", prompt: "Show me properties that match my preferences" },
  { label: "Build my team", prompt: "Help me find service providers for my investment" },
  { label: "Explain options", prompt: "What are my investment options based on my profile?" },
];

export function QuickReplyButtons({
  onPromptSelect,
  profileComplete = true,
  className,
}: QuickReplyButtonsProps) {
  const [collapsed, setCollapsed] = useState(false);

  // Add context-aware prompt if profile incomplete
  const prompts = profileComplete
    ? BASE_PROMPTS
    : [
        ...BASE_PROMPTS,
        { label: "Complete profile", prompt: "What information am I missing in my profile?" },
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
          Show suggestions
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("px-3 py-2 border-t bg-muted/30", className)}>
      <div className="flex flex-wrap gap-2">
        {prompts.map(({ label, prompt }) => (
          <Button
            key={label}
            variant="outline"
            size="sm"
            onClick={() => {
              onPromptSelect(prompt);
              setCollapsed(true);
            }}
            className="text-xs h-7"
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}
