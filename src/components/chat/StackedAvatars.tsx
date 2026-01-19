"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Participant {
  name?: string | null;
  imageUrl?: string | null;
}

interface StackedAvatarsProps {
  participants: Participant[];
  max?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

// Get initials from name
function getInitials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const sizeClasses = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-sm",
};

const overlapClasses = {
  sm: "-ms-2",
  md: "-ms-3",
  lg: "-ms-4",
};

export function StackedAvatars({
  participants,
  max = 3,
  size = "md",
  className,
}: StackedAvatarsProps) {
  const displayed = participants.slice(0, max);
  const remaining = participants.length - max;

  return (
    <div className={cn("flex items-center", className)}>
      {displayed.map((participant, index) => (
        <Avatar
          key={index}
          className={cn(
            sizeClasses[size],
            "ring-2 ring-background",
            index > 0 && overlapClasses[size]
          )}
        >
          <AvatarImage
            src={participant.imageUrl || undefined}
            alt={participant.name || ""}
          />
          <AvatarFallback className={sizeClasses[size]}>
            {getInitials(participant.name)}
          </AvatarFallback>
        </Avatar>
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            sizeClasses[size],
            overlapClasses[size],
            "rounded-full bg-muted ring-2 ring-background flex items-center justify-center font-medium text-muted-foreground"
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
