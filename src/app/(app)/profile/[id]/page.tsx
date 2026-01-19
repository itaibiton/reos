"use client";

import { useQuery } from "convex/react";
import { useRouter, useParams } from "next/navigation";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { ProfileHeader, UserPostsFeed, StatsRow, PortfolioSection } from "@/components/profile";

// Skeleton for profile page loading state
function ProfilePageSkeleton() {
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <Skeleton className="h-9 w-24" />

      {/* Header */}
      <div className="flex items-start gap-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-36" />
          <div className="flex gap-2 mt-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
        <Skeleton className="h-9 w-24" />
      </div>

      {/* Tabs skeleton */}
      <Skeleton className="h-10 w-32" />

      {/* Content skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  // Fetch user profile
  const profile = useQuery(
    api.users.getUserProfile,
    userId ? { userId: userId as Id<"users"> } : "skip"
  );

  // Loading state
  if (profile === undefined) {
    return <ProfilePageSkeleton />;
  }

  // Not found state
  if (profile === null) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <h2 className="text-xl font-semibold mb-2">User Not Found</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            This user profile doesn&apos;t exist or is not available.
          </p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} className="mr-1" />
        Back
      </Button>

      {/* Profile header */}
      <ProfileHeader profile={profile} />

      {/* Stats row for service providers */}
      {profile.stats && (
        <StatsRow stats={profile.stats} />
      )}

      {/* Tabs */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          {profile.stats && (
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="posts" className="mt-4">
          <UserPostsFeed userId={profile._id} />
        </TabsContent>

        {profile.stats && (
          <TabsContent value="portfolio" className="mt-4">
            <PortfolioSection portfolio={profile.portfolio || []} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
