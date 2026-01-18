"use client";

import { useState, useEffect, memo } from "react";

interface TypeWriterProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  showCursor?: boolean;
  className?: string;
}

export const TypeWriter = memo(function TypeWriter({
  text,
  speed = 20,
  onComplete,
  showCursor = true,
  className,
}: TypeWriterProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
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
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, speed, onComplete]);

  return (
    <span className={className}>
      {displayedText}
      {showCursor && !isComplete && (
        <span className="animate-pulse ml-0.5">|</span>
      )}
    </span>
  );
});
