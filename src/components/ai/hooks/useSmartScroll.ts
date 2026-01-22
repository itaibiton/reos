"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Hook for smart auto-scroll behavior.
 * Only scrolls to bottom if user is near bottom (not interrupting history reading).
 */
export function useSmartScroll<T>(dependency: T) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);

  // Track if user is near bottom using Intersection Observer
  useEffect(() => {
    if (!bottomRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsNearBottom(entry.isIntersecting),
      { threshold: 0.1, rootMargin: "50px" }
    );

    observer.observe(bottomRef.current);
    return () => observer.disconnect();
  }, []);

  // Auto-scroll when dependency changes and user is near bottom
  useEffect(() => {
    if (isNearBottom && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [dependency, isNearBottom]);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  return { scrollRef, bottomRef, isNearBottom, scrollToBottom };
}
