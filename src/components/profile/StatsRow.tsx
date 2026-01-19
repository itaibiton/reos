"use client";

import { Card, CardContent } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle01Icon, Calendar01Icon } from "@hugeicons/core-free-icons";
import { Star, User } from "lucide-react";

interface StatsRowProps {
  stats: {
    averageRating: number;
    totalReviews: number;
    completedDeals: number;
    yearsExperience: number;
  };
}

export function StatsRow({ stats }: StatsRowProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
            <Star size={20} />
            <span className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</span>
          </div>
          <p className="text-sm text-muted-foreground">Avg Rating</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center gap-1 text-blue-500 mb-1">
            <User size={20} />
            <span className="text-2xl font-bold">{stats.totalReviews}</span>
          </div>
          <p className="text-sm text-muted-foreground">Reviews</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center gap-1 text-green-500 mb-1">
            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} />
            <span className="text-2xl font-bold">{stats.completedDeals}</span>
          </div>
          <p className="text-sm text-muted-foreground">Deals Completed</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center gap-1 text-purple-500 mb-1">
            <HugeiconsIcon icon={Calendar01Icon} size={20} />
            <span className="text-2xl font-bold">{stats.yearsExperience}</span>
          </div>
          <p className="text-sm text-muted-foreground">Years Experience</p>
        </CardContent>
      </Card>
    </div>
  );
}
