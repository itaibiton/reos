"use client";

import { useState, useRef, useCallback, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { SentIcon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

interface AIChatInputProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  disabled?: boolean;
  isStreaming?: boolean;
  placeholder?: string;
}

export function AIChatInput({
  onSend,
  onStop,
  disabled = false,
  isStreaming = false,
  placeholder = "Type a message... (Enter to send, Shift+Enter for new line)",
}: AIChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea (up to ~4 lines)
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const maxHeight = 120; // ~4 lines
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    adjustHeight();
  };

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (trimmed && !disabled && !isStreaming) {
      onSend(trimmed);
      setValue("");
      // Reset height after clearing
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  }, [value, disabled, isStreaming, onSend]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends (if not disabled/streaming), Shift+Enter adds newline
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isEmpty = value.trim().length === 0;
  const inputDisabled = disabled || isStreaming;

  return (
    <div className="flex items-end gap-2 px-3 py-2 border-t bg-background flex-shrink-0">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={inputDisabled}
        rows={1}
        className={cn(
          "flex-1 resize-none rounded-lg border bg-transparent px-3 py-2 text-sm",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "min-h-[40px]"
        )}
        aria-label="Message input"
      />

      {isStreaming ? (
        // Stop button during streaming
        <Button
          onClick={onStop}
          variant="destructive"
          size="icon"
          className="h-10 w-10 flex-shrink-0"
          aria-label="Stop generating"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={18} />
        </Button>
      ) : (
        // Send button
        <Button
          onClick={handleSend}
          disabled={inputDisabled || isEmpty}
          size="icon"
          className="h-10 w-10 flex-shrink-0"
          aria-label="Send message"
        >
          <HugeiconsIcon icon={SentIcon} size={18} />
        </Button>
      )}
    </div>
  );
}
