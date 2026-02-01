"use client";

import { cn } from "@/lib/utils";

interface SuggestedPromptsProps {
  prompts: string[];
  onSelect: (prompt: string) => void;
  className?: string;
}

/**
 * Renders a row of clickable prompt chips above the chat input.
 *
 * Shown when the conversation is empty to help users get started
 * with contextual questions relevant to the current page.
 */
export function SuggestedPrompts({ prompts, onSelect, className }: SuggestedPromptsProps) {
  if (prompts.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-2 px-4 py-3", className)}>
      {prompts.map((prompt) => (
        <button
          key={prompt}
          type="button"
          onClick={() => onSelect(prompt)}
          className={cn(
            "text-xs px-3 py-1.5 rounded-full border",
            "bg-muted/50 hover:bg-muted",
            "text-muted-foreground hover:text-foreground",
            "transition-colors cursor-pointer",
            "text-start"
          )}
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
