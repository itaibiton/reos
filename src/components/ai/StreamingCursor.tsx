"use client";

/**
 * Blinking cursor shown at end of streaming AI response
 * Indicates more text is coming
 */
export function StreamingCursor() {
  return (
    <span
      className="inline-block w-0.5 h-4 bg-current animate-pulse ml-0.5 align-middle"
      aria-hidden="true"
    />
  );
}
