"use client";

import { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestionBubbleProps {
  question: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
}

export function QuestionBubble({
  question,
  description,
  icon,
  className,
}: QuestionBubbleProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
        className
      )}
    >
      {/* Avatar/Icon */}
      <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon ?? <Sparkles className="h-5 w-5" />}
      </div>

      {/* Bubble content */}
      <div className="flex-1 rounded-2xl rounded-tl-sm bg-muted px-5 py-4">
        <p className="text-lg font-medium text-foreground">{question}</p>
        {description && (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}
