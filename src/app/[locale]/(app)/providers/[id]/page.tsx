"use client";

import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useTranslations, useFormatter } from "next-intl";
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
import { Star, User, Briefcase, Globe, Phone, Mail, ExternalLink, Quote } from "lucide-react";

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

// Role key mapping for translations
const ROLE_KEY_MAP: Record<string, string> = {
  broker: "broker",
  mortgage_advisor: "mortgageAdvisor",
  lawyer: "lawyer",
};

// Language key mapping for translations
const LANGUAGE_KEY_MAP: Record<string, string> = {
  english: "english",
  hebrew: "hebrew",
  russian: "russian",
  french: "french",
  spanish: "spanish",
};

// Contact preference key mapping
const CONTACT_KEY_MAP: Record<string, string> = {
  email: "email",
  phone: "phone",
  whatsapp: "whatsapp",
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
  const t = useTranslations("providers");
  const tCommon = useTranslations("common");
  const tProfile = useTranslations("profile");
  const format = useFormatter();

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
          <h2 className="text-xl font-semibold mb-2">{t("notFound.title")}</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            {t("notFound.description")}
          </p>
          <Button onClick={() => router.back()}>{tCommon("actions.back")}</Button>
        </div>
      </div>
    );
  }

  const { stats, reviews, portfolio } = profile;
  const roleKey = ROLE_KEY_MAP[profile.role || ""] || profile.role;

  return (
    <div className="p-6 space-y-6">
      {/* Back button */}
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} className="me-1 rtl:-scale-x-100" />
        {tCommon("actions.back")}
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
              {roleKey ? tCommon(`roles.${roleKey}`) : profile.role}
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
              ({t("card.reviews", { count: stats.totalReviews })})
            </span>
          </div>

          {/* License number */}
          {profile.licenseNumber && (
            <p className="text-sm text-muted-foreground mt-1">
              {t("profile.license")}: {profile.licenseNumber}
            </p>
          )}
        </div>

        {/* Contact button */}
        <Button>
          <HugeiconsIcon icon={Message01Icon} size={16} className="me-2" />
          {t("card.contact")}
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
            <p className="text-sm text-muted-foreground">{tProfile("stats.avgRating")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-blue-500 mb-1">
              <User size={20} />
              <span className="text-2xl font-bold">{stats.totalReviews}</span>
            </div>
            <p className="text-sm text-muted-foreground">{tProfile("stats.reviews")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-green-500 mb-1">
              <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} />
              <span className="text-2xl font-bold">{stats.completedDeals}</span>
            </div>
            <p className="text-sm text-muted-foreground">{tProfile("stats.dealsCompleted")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-purple-500 mb-1">
              <HugeiconsIcon icon={Calendar01Icon} size={20} />
              <span className="text-2xl font-bold">{stats.yearsExperience}</span>
            </div>
            <p className="text-sm text-muted-foreground">{tProfile("stats.yearsExperience")}</p>
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
              <CardTitle className="text-lg">{t("profile.about")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Bio */}
              <div>
                <p className="text-muted-foreground">
                  {profile.bio || t("profile.noBio")}
                </p>
              </div>

              {/* Specializations */}
              {profile.specializations && profile.specializations.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">{tProfile("sections.specializations")}</h4>
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
                  <h4 className="text-sm font-medium mb-2">{tProfile("sections.serviceAreas")}</h4>
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
                  <h4 className="text-sm font-medium mb-2">{tProfile("sections.languages")}</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.languages.map((lang) => {
                      const langKey = LANGUAGE_KEY_MAP[lang] || lang;
                      return (
                        <Badge key={lang} variant="outline" className="flex items-center gap-1">
                          <Globe size={12} />
                          {tCommon(`languages.${langKey}`)}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* External Recommendations */}
              {profile.externalRecommendations && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                    <Quote size={14} />
                    {t("profile.recommendations")}
                  </h4>
                  <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground whitespace-pre-line">
                    {profile.externalRecommendations}
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
                {t("profile.reviews")}
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
                  <p>{t("profile.noReviews")}</p>
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
                            {format.dateTime(new Date(review.createdAt), 'short')}
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
                {t("profile.portfolio")}
                {portfolio.length > 0 && (
                  <span className="text-sm font-normal text-muted-foreground">
                    ({t("card.dealsCompleted", { count: stats.completedDeals })})
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {portfolio.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <HugeiconsIcon icon={Building05Icon} size={32} className="mx-auto mb-2 opacity-50" />
                  <p>{t("profile.noDeals")}</p>
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
                          {format.number(deal.soldPrice, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
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
              <CardTitle className="text-lg">{t("profile.contactInfo")}</CardTitle>
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
              {profile.websiteUrl && (
                <div className="flex items-center gap-2 text-sm">
                  <ExternalLink size={16} className="text-muted-foreground" />
                  <a
                    href={profile.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline truncate"
                  >
                    {profile.websiteUrl.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}
              {profile.preferredContact && (
                <p className="text-xs text-muted-foreground mt-2">
                  {t("profile.preferredContact")}: {tCommon(`contactPreferences.${CONTACT_KEY_MAP[profile.preferredContact]}`)}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
