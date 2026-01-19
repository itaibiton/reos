"use client";

import { useQuery } from "convex/react";
import { useRouter, useParams } from "next/navigation";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Location01Icon,
  Calendar01Icon,
  CheckmarkCircle01Icon,
  Building05Icon,
  Message01Icon,
} from "@hugeicons/core-free-icons";
import { Star, User, Briefcase, Globe, Phone, Mail } from "lucide-react";

// Format date
function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Currency formatter for USD
function formatUSD(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
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

// Role display mapping
const ROLE_LABELS: Record<string, string> = {
  broker: "Real Estate Broker",
  mortgage_advisor: "Mortgage Advisor",
  lawyer: "Real Estate Lawyer",
};

// Language display mapping
const LANGUAGE_LABELS: Record<string, string> = {
  english: "English",
  hebrew: "Hebrew",
  russian: "Russian",
  french: "French",
  spanish: "Spanish",
};

// Contact preference labels
const CONTACT_LABELS: Record<string, string> = {
  email: "Email",
  phone: "Phone",
  whatsapp: "WhatsApp",
};

// Star rating display
function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={
            star <= rating
              ? "text-yellow-500 fill-yellow-500"
              : "text-gray-300"
          }
        />
      ))}
    </div>
  );
}

// Skeleton for provider profile page
function ProviderProfileSkeleton() {
  return (
    <div className="p-6 space-y-6">
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
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function ProviderProfilePage() {
  const router = useRouter();
  const params = useParams();
  const providerId = params.id as string;

  // Fetch public profile
  const profile = useQuery(
    api.serviceProviderProfiles.getPublicProfile,
    providerId ? { providerId: providerId as Id<"users"> } : "skip"
  );

  // Loading state
  if (profile === undefined) {
    return <ProviderProfileSkeleton />;
  }

  // Not found
  if (profile === null) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <h2 className="text-xl font-semibold mb-2">Provider Not Found</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            This provider profile doesn&apos;t exist or is not available.
          </p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const { stats, reviews, portfolio } = profile;

  return (
    <div className="p-6 space-y-6">
      {/* Back button */}
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} className="me-1 rtl:-scale-x-100" />
        Back
      </Button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <Avatar className="h-20 w-20 flex-shrink-0">
          <AvatarImage src={profile.imageUrl} />
          <AvatarFallback className="text-2xl">
            {getInitials(profile.name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold">{profile.name || "Unknown Provider"}</h1>
            <Badge variant="secondary">
              {ROLE_LABELS[profile.role || ""] || profile.role}
            </Badge>
          </div>

          {profile.companyName && (
            <p className="text-muted-foreground flex items-center gap-1 mt-1">
              <Briefcase size={14} />
              {profile.companyName}
            </p>
          )}

          {/* Rating display */}
          <div className="flex items-center gap-2 mt-2">
            <StarRating rating={Math.round(stats.averageRating)} />
            <span className="font-medium">{stats.averageRating.toFixed(1)}</span>
            <span className="text-muted-foreground text-sm">
              ({stats.totalReviews} review{stats.totalReviews !== 1 ? "s" : ""})
            </span>
          </div>

          {/* License number */}
          {profile.licenseNumber && (
            <p className="text-sm text-muted-foreground mt-1">
              License: {profile.licenseNumber}
            </p>
          )}
        </div>

        {/* Contact button */}
        <Button>
          <HugeiconsIcon icon={Message01Icon} size={16} className="me-2" />
          Contact
        </Button>
      </div>

      {/* Stats Row */}
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

      {/* Main content - Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - About + Reviews (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* About Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Bio */}
              <div>
                <p className="text-muted-foreground">
                  {profile.bio || "No bio provided."}
                </p>
              </div>

              {/* Specializations */}
              {profile.specializations && profile.specializations.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Specializations</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.specializations.map((spec) => (
                      <Badge key={spec} variant="secondary">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Service Areas */}
              {profile.serviceAreas && profile.serviceAreas.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Service Areas</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.serviceAreas.map((area) => (
                      <Badge key={area} variant="outline" className="flex items-center gap-1">
                        <HugeiconsIcon icon={Location01Icon} size={12} />
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {profile.languages && profile.languages.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Languages</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.languages.map((lang) => (
                      <Badge key={lang} variant="outline" className="flex items-center gap-1">
                        <Globe size={12} />
                        {LANGUAGE_LABELS[lang] || lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reviews Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Star size={20} />
                Reviews
                {stats.totalReviews > 0 && (
                  <span className="text-sm font-normal text-muted-foreground">
                    ({stats.totalReviews})
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {reviews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Star size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No reviews yet.</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review._id} className="border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={review.reviewerImageUrl} />
                        <AvatarFallback>
                          {getInitials(review.reviewerName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{review.reviewerName || "Anonymous"}</p>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                        <StarRating rating={review.rating} size={14} />
                        {review.propertyTitle && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Re: {review.propertyTitle}
                          </p>
                        )}
                        {review.reviewText && (
                          <p className="text-sm mt-2">{review.reviewText}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column - Portfolio (1/3) */}
        <div className="space-y-6">
          {/* Portfolio Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <HugeiconsIcon icon={Building05Icon} size={20} />
                Portfolio
                {portfolio.length > 0 && (
                  <span className="text-sm font-normal text-muted-foreground">
                    ({stats.completedDeals} deals)
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {portfolio.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <HugeiconsIcon icon={Building05Icon} size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No completed deals yet.</p>
                </div>
              ) : (
                portfolio.map((deal) => (
                  <div
                    key={deal.dealId}
                    className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    {/* Property Image */}
                    <div className="h-14 w-14 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      {deal.propertyImage ? (
                        <img
                          src={deal.propertyImage}
                          alt={deal.propertyTitle || "Property"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <HugeiconsIcon
                            icon={Building05Icon}
                            size={20}
                            className="text-muted-foreground"
                          />
                        </div>
                      )}
                    </div>

                    {/* Deal Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {deal.propertyTitle || "Property"}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <HugeiconsIcon icon={Location01Icon} size={10} />
                        <span>{deal.propertyCity || "Unknown"}</span>
                      </div>
                      {deal.soldPrice && (
                        <p className="text-xs font-medium text-green-600 mt-0.5">
                          {formatUSD(deal.soldPrice)}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Contact Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail size={16} className="text-muted-foreground" />
                  <span>{profile.email}</span>
                </div>
              )}
              {profile.phoneNumber && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone size={16} className="text-muted-foreground" />
                  <span>{profile.phoneNumber}</span>
                </div>
              )}
              {profile.preferredContact && (
                <p className="text-xs text-muted-foreground mt-2">
                  Preferred contact method: {CONTACT_LABELS[profile.preferredContact] || profile.preferredContact}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
