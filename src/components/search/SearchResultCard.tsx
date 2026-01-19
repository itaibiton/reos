"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  FavouriteIcon,
  Comment01Icon,
} from "@hugeicons/core-free-icons";
import { formatDistanceToNow } from "date-fns";
import { Id } from "../../../convex/_generated/dataModel";

// ============================================================================
// TYPES
// ============================================================================

export type UserResult = {
  resultType: "user";
  _id: Id<"users">;
  name: string;
  email?: string;
  imageUrl?: string;
  role?: string;
  isFollowing?: boolean;
  isCurrentUser?: boolean;
  specializations?: string[];
  serviceAreas?: string[];
};

export type PostResult = {
  resultType: "post";
  _id: Id<"posts">;
  content: string;
  postType: string;
  authorId: Id<"users">;
  authorName: string;
  authorImageUrl?: string;
  authorRole?: string;
  createdAt: number;
  likeCount: number;
  commentCount: number;
};

export type PropertyResult = {
  resultType: "property";
  _id: Id<"properties">;
  title: string;
  city: string;
  priceUsd: number;
  featuredImage?: string;
  status?: string;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  squareMeters?: number;
};

export type SearchResult = UserResult | PostResult | PropertyResult;

// ============================================================================
// HELPERS
// ============================================================================

// Role label mapping
const ROLE_LABELS: Record<string, string> = {
  investor: "Investor",
  broker: "Broker",
  mortgage_advisor: "Mortgage Advisor",
  lawyer: "Lawyer",
  accountant: "Accountant",
  notary: "Notary",
  tax_consultant: "Tax Consultant",
  appraiser: "Appraiser",
};

// Post type label mapping
const POST_TYPE_LABELS: Record<string, string> = {
  property_listing: "Property",
  service_request: "Service Request",
  discussion: "Discussion",
};

// Format price as compact USD ($1.5M, $500K)
function formatCompactPrice(price: number): string {
  if (price >= 1_000_000) {
    return `$${(price / 1_000_000).toFixed(1)}M`;
  }
  if (price >= 1_000) {
    return `$${(price / 1_000).toFixed(0)}K`;
  }
  return `$${price}`;
}

// Get initials from name
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ============================================================================
// CARD COMPONENTS
// ============================================================================

function UserCard({ result }: { result: UserResult }) {
  const roleLabel = result.role ? ROLE_LABELS[result.role] || result.role : undefined;

  return (
    <Link href={`/profile/${result._id}`}>
      <Card className="hover:bg-accent transition-colors cursor-pointer">
        <CardContent className="p-4 flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={result.imageUrl} alt={result.name} />
            <AvatarFallback>{getInitials(result.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold truncate">{result.name}</span>
              {roleLabel && (
                <Badge variant="secondary" className="text-xs">
                  {roleLabel}
                </Badge>
              )}
            </div>
            {result.specializations && result.specializations.length > 0 && (
              <p className="text-sm text-muted-foreground truncate">
                {result.specializations.slice(0, 3).join(", ")}
                {result.specializations.length > 3 && ` +${result.specializations.length - 3} more`}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function PostCard({ result }: { result: PostResult }) {
  const roleLabel = result.authorRole
    ? ROLE_LABELS[result.authorRole] || result.authorRole
    : undefined;
  const postTypeLabel = POST_TYPE_LABELS[result.postType] || result.postType;

  return (
    <Link href={`/feed/post/${result._id}`}>
      <Card className="hover:bg-accent transition-colors cursor-pointer">
        <CardContent className="p-4 space-y-2">
          {/* Author and post type */}
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={result.authorImageUrl} alt={result.authorName} />
              <AvatarFallback className="text-xs">
                {getInitials(result.authorName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm truncate">{result.authorName}</span>
                {roleLabel && (
                  <Badge variant="secondary" className="text-xs">
                    {roleLabel}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  {postTypeLabel}
                </Badge>
                <span>{formatDistanceToNow(result.createdAt, { addSuffix: true })}</span>
              </div>
            </div>
          </div>

          {/* Content preview (2 lines truncate) */}
          <p className="text-sm line-clamp-2">{result.content}</p>

          {/* Engagement stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <HugeiconsIcon icon={FavouriteIcon} size={14} strokeWidth={1.5} />
              {result.likeCount}
            </span>
            <span className="flex items-center gap-1">
              <HugeiconsIcon icon={Comment01Icon} size={14} strokeWidth={1.5} />
              {result.commentCount}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function PropertyCard({ result }: { result: PropertyResult }) {
  return (
    <Link href={`/properties/${result._id}`}>
      <Card className="hover:bg-accent transition-colors cursor-pointer overflow-hidden">
        <CardContent className="p-0 flex">
          {/* Image thumbnail (80x60) */}
          <div className="w-20 h-[60px] bg-muted flex-shrink-0">
            {result.featuredImage ? (
              <img
                src={result.featuredImage}
                alt={result.title}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <HugeiconsIcon icon={Home01Icon} size={24} strokeWidth={1.5} />
              </div>
            )}
          </div>

          {/* Property info */}
          <div className="p-3 flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold truncate">{result.title}</h3>
                <p className="text-sm text-muted-foreground">{result.city}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="font-bold text-primary">
                  {formatCompactPrice(result.priceUsd)}
                </span>
                {result.status && result.status !== "available" && (
                  <Badge variant="outline" className="text-xs">
                    {result.status}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface SearchResultCardProps {
  result: SearchResult;
}

export function SearchResultCard({ result }: SearchResultCardProps) {
  switch (result.resultType) {
    case "user":
      return <UserCard result={result} />;
    case "post":
      return <PostCard result={result} />;
    case "property":
      return <PropertyCard result={result} />;
    default:
      return null;
  }
}
