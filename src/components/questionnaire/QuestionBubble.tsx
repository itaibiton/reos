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
  const [questionComplete, setQuestionComplete] = useState(false);
  const [descriptionComplete, setDescriptionComplete] = useState(false);

  // Reset states when question changes
  useEffect(() => {
    setQuestionComplete(false);
    setDescriptionComplete(false);
  }, [question]);

  return (
    <div className={cn("flex items-start gap-3", className)}>
      {/* Avatar/Icon */}
      <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary animate-in fade-in duration-300">
        {icon ?? <Sparkles className="h-5 w-5" />}
      </div>

      {/* Bubble content */}
      <div className="flex-1 rounded-2xl rounded-tl-sm bg-muted px-5 py-4 animate-in fade-in duration-200">
        <p className="text-lg font-medium text-foreground">
          <TypeWriter
            key={`q-${question}`}
            text={question}
            speed={15}
            onComplete={() => setQuestionComplete(true)}
          />
        </p>
        {description && questionComplete && (
          <p className="mt-2 text-sm text-muted-foreground">
            <TypeWriter
              key={`d-${description}`}
              text={description}
              speed={10}
              onComplete={() => setDescriptionComplete(true)}
              showCursor={!descriptionComplete}
            />
          </p>
        )}
      </div>
    </div>
  );
});
