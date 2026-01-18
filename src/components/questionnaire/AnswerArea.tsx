"use client";

import { ReactNode, memo } from "react";
import { cn } from "@/lib/utils";

interface AnswerAreaProps {
  children: ReactNode;
  className?: string;
}

export const AnswerArea = memo(function AnswerArea({ children, className }: AnswerAreaProps) {
  return (
    <div
      className={cn(
        "ml-auto max-w-[85%] mt-6 animate-in fade-in slide-in-from-right-4 duration-300 delay-150",
        className
      )}
    >
      <div className="rounded-2xl rounded-br-sm border border-border bg-background p-5 shadow-sm">
        {children}
      </div>
    </div>
  );
});
