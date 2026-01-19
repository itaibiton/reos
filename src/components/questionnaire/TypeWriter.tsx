"use client";

import { useState, useEffect, useRef } from "react";

interface TypeWriterProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  showCursor?: boolean;
  className?: string;
}

/**
 * TypeWriter component that animates text character by character.
 * Uses a ref for onComplete to avoid stale closure issues.
 */
export function TypeWriter({
  text,
  speed = 20,
  onComplete,
  showCursor = true,
  className,
}: TypeWriterProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  // Store onComplete in a ref to avoid it being a dependency
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Track which text we've completed animation for
  const completedTextRef = useRef<string | null>(null);

  useEffect(() => {
    // Skip if we already completed animation for this exact text
    if (completedTextRef.current === text) {
      return;
    }

    // Reset state for new animation
    setDisplayedText("");
    setIsComplete(false);

    let currentIndex = 0;
    const intervalId = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(intervalId);
        setIsComplete(true);
        completedTextRef.current = text;
        onCompleteRef.current?.();
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, speed]);

  return (
    <span className={className}>
      {displayedText}
      {showCursor && !isComplete && (
        <span className="animate-pulse ms-0.5">|</span>
      )}
    </span>
  );
}
