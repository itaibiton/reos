"use client";

import { Doc, Id } from "../../../convex/_generated/dataModel";
import { PropertyPostCard } from "./PropertyPostCard";
import { ServiceRequestPostCard } from "./ServiceRequestPostCard";
import { DiscussionPostCard } from "./DiscussionPostCard";

// Type for enriched post from globalFeed query
export type EnrichedPost = Doc<"posts"> & {
  authorName: string;
  authorImageUrl?: string;
  authorRole?: string;
  property?: {
    _id: Id<"properties">;
    title: string;
    city: string;
    priceUsd: number;
    featuredImage?: string;
  } | null;
};

interface PostCardProps {
  post: EnrichedPost;
}

export function PostCard({ post }: PostCardProps) {
  switch (post.postType) {
    case "property_listing":
      return <PropertyPostCard post={post} />;
    case "service_request":
      return <ServiceRequestPostCard post={post} />;
    case "discussion":
      return <DiscussionPostCard post={post} />;
    default:
      return null;
  }
}
