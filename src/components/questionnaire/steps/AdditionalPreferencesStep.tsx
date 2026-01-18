"use client";

import { useState, useCallback } from "react";
import { QuestionBubble } from "../QuestionBubble";
import { AnswerArea } from "../AnswerArea";
import { Textarea } from "@/components/ui/textarea";

interface AdditionalPreferencesStepProps {
  value: string | undefined;
  onChange: (value: string) => void;
}

const MAX_LENGTH = 2000;

export function AdditionalPreferencesStep({ value = "", onChange }: AdditionalPreferencesStepProps) {
  const [showAnswer, setShowAnswer] = useState(false);

  // Stable callback to prevent QuestionBubble re-renders
  const handleTypingComplete = useCallback(() => {
    setShowAnswer(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= MAX_LENGTH) {
      onChange(newValue);
    }
  };

  const charCount = value?.length ?? 0;

  return (
    <div className="space-y-6">
      <QuestionBubble
        question="Anything else we should know?"
        description="Share any preferences not covered above. Our AI uses this to find better matches."
        onTypingComplete={handleTypingComplete}
      />
      {showAnswer && (
      <AnswerArea>
        <div className="space-y-2">
          <Textarea
            value={value}
            onChange={handleChange}
            placeholder="e.g., I prefer properties near good schools, looking for a quiet neighborhood, interested in new construction..."
            className="min-h-[150px] resize-none"
          />
          <div className="flex justify-end">
            <span className="text-xs text-muted-foreground">
              {charCount}/{MAX_LENGTH} characters
            </span>
          </div>
        </div>
      </AnswerArea>
      )}
    </div>
  );
}
