"use client";

import { ReactNode, useState, useCallback, useRef, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { TypeWriter } from "./TypeWriter";

interface QuestionBubbleProps {
  question: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
  onTypingComplete?: () => void;
}

/**
 * QuestionBubble displays a question with typewriter animation.
 * Uses refs for callbacks to ensure animations don't re-trigger on parent state changes.
 */
export function QuestionBubble({
  question,
  description,
  icon,
  className,
  onTypingComplete,
}: QuestionBubbleProps) {
  const [questionComplete, setQuestionComplete] = useState(false);
  const [descriptionComplete, setDescriptionComplete] = useState(false);

  // Store onTypingComplete in a ref to avoid stale closures
  const onTypingCompleteRef = useRef(onTypingComplete);
  useEffect(() => {
    onTypingCompleteRef.current = onTypingComplete;
  }, [onTypingComplete]);

  // Call onTypingComplete when all typing is done
  useEffect(() => {
    const isComplete = description
      ? questionComplete && descriptionComplete
      : questionComplete;

    if (isComplete) {
      onTypingCompleteRef.current?.();
    }
  }, [questionComplete, descriptionComplete, description]);

  const handleQuestionComplete = useCallback(() => {
    setQuestionComplete(true);
  }, []);

  const handleDescriptionComplete = useCallback(() => {
    setDescriptionComplete(true);
  }, []);

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
            text={question}
            speed={15}
            onComplete={handleQuestionComplete}
          />
        </p>
        {description && questionComplete && (
          <p className="mt-2 text-sm text-muted-foreground">
            <TypeWriter
              text={description}
              speed={10}
              onComplete={handleDescriptionComplete}
              showCursor={!descriptionComplete}
            />
          </p>
        )}
      </div>
    </div>
  );
}
