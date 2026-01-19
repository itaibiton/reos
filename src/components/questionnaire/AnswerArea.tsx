"use client";

import { ReactNode, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface AnswerAreaProps {
  children: ReactNode;
  className?: string;
}

export function AnswerArea({ children, className }: AnswerAreaProps) {
  const [hasAnimated, setHasAnimated] = useState(false);

  // Only animate on first mount
  useEffect(() => {
    // Small delay to ensure animation triggers after mount
    const timer = setTimeout(() => {
      setHasAnimated(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={cn(
        "ms-auto max-w-[85%] mt-6",
        !hasAnimated && "animate-in fade-in slide-in-from-right-4 duration-300",
        className
      )}
    >
      <div className="rounded-2xl rounded-br-sm border border-border bg-background p-5 shadow-sm">
        {children}
      </div>
    </div>
  );
}
