"use client";

import { useState, useCallback } from "react";
import { QuestionBubble } from "../QuestionBubble";
import { AnswerArea } from "../AnswerArea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ServicesStepProps {
  value: string[] | undefined;
  onChange: (value: string[]) => void;
}

const SERVICES = [
  {
    id: "broker",
    label: "Broker",
    description: "Help finding and negotiating properties",
  },
  {
    id: "mortgage_advisor",
    label: "Mortgage advisor",
    description: "Help with financing options",
  },
  {
    id: "lawyer",
    label: "Lawyer",
    description: "Legal assistance for purchase",
  },
];

export function ServicesStep({ value = [], onChange }: ServicesStepProps) {
  const [showAnswer, setShowAnswer] = useState(false);

  // Stable callback to prevent QuestionBubble re-renders
  const handleTypingComplete = useCallback(() => {
    setShowAnswer(true);
  }, []);

  const handleToggle = (serviceId: string, checked: boolean) => {
    if (checked) {
      onChange([...value, serviceId]);
    } else {
      onChange(value.filter((id) => id !== serviceId));
    }
  };

  return (
    <div className="space-y-6">
      <QuestionBubble
        question="Which services would you like?"
        description="Select all that apply. We'll connect you with our partners."
        onTypingComplete={handleTypingComplete}
      />
      {showAnswer && (
      <AnswerArea>
        <div className="space-y-3">
          {SERVICES.map((service) => (
            <label
              key={service.id}
              htmlFor={service.id}
              className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <Checkbox
                id={service.id}
                checked={value.includes(service.id)}
                onCheckedChange={(checked) => handleToggle(service.id, checked === true)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <Label htmlFor={service.id} className="cursor-pointer font-medium">
                  {service.label}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {service.description}
                </p>
              </div>
            </label>
          ))}
        </div>
      </AnswerArea>
      )}
    </div>
  );
}
