"use client";

import { useEffect, useState } from "react";

/**
 * Detects keyboard visibility on mobile devices using the VisualViewport API.
 *
 * @returns The keyboard height in pixels (0 when closed, actual height when open)
 *
 * Works by comparing the current viewport height to the initial height.
 * A difference of >100px is assumed to be the keyboard (filters out toolbar changes).
 */
export function useKeyboardVisible(): number {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    // SSR guard - window.visualViewport not available server-side
    if (typeof window === "undefined" || !window.visualViewport) return;

    const viewport = window.visualViewport;
    const initialHeight = viewport.height;

    const handleResize = () => {
      const heightDiff = initialHeight - viewport.height;
      // Use 100px threshold to distinguish keyboard from browser chrome changes
      setKeyboardHeight(heightDiff > 100 ? heightDiff : 0);
    };

    viewport.addEventListener("resize", handleResize);

    return () => {
      viewport.removeEventListener("resize", handleResize);
    };
  }, []);

  return keyboardHeight;
}
