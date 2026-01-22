"use client";

/**
 * Animated typing indicator (three bouncing dots)
 * Shown before first token arrives from AI
 */
export function TypingIndicator() {
  return (
    <div
      className="flex gap-1 px-4 py-3"
      role="status"
      aria-label="AI is typing"
    >
      <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]" />
      <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]" />
      <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
    </div>
  );
}
