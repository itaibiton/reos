"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AnswerAreaProps {
  children: ReactNode;
  className?: string;
}

export function AnswerArea({ children, className }: AnswerAreaProps) {
  return (
    <div
      className={cn(
        "ml-auto max-w-[85%] mt-6 animate-in fade-in slide-in-from-bottom-1 duration-200 delay-100",
        className
      )}
    >
      <div className="rounded-2xl rounded-br-sm border border-border bg-background p-5 shadow-sm">
        {children}
      </div>
    </div>
  );
}
