"use client";

import { ReactNode, memo, useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { TypeWriter } from "./TypeWriter";

interface QuestionBubbleProps {
  question: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
}

export const QuestionBubble = memo(function QuestionBubble({
  question,
  description,
  icon,
  className,
}: QuestionBubbleProps) {
  const [showDescription, setShowDescription] = useState(false);

  // Reset description visibility when question changes
  useEffect(() => {
    setShowDescription(false);
  }, [question]);

  return (
    <div
      className={cn("flex items-start gap-3", className)}
    >
      {/* Avatar/Icon */}
      <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary animate-in fade-in duration-300">
        {icon ?? <Sparkles className="h-5 w-5" />}
      </div>

      {/* Bubble content */}
      <div className="flex-1 rounded-2xl rounded-tl-sm bg-muted px-5 py-4 animate-in fade-in duration-200">
        <p className="text-lg font-medium text-foreground">
          <TypeWriter
            key={question}
            text={question}
            speed={15}
            onComplete={() => setShowDescription(true)}
          />
        </p>
        {description && showDescription && (
          <p className="mt-2 text-sm text-muted-foreground animate-in fade-in duration-300">
            {description}
          </p>
        )}
      </div>
    </div>
  );
});
