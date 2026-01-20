"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { api } from "../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Location01Icon,
  Calendar01Icon,
} from "@hugeicons/core-free-icons";
import { Search, Users, Briefcase, Calculator, Scale, ArrowRight } from "lucide-react";

// Provider type options
type ProviderType = "broker" | "mortgage_advisor" | "lawyer";

// Tab key mapping for translations
const PROVIDER_TAB_KEYS: Record<ProviderType, string> = {
  broker: "brokers",
  mortgage_advisor: "mortgageAdvisors",
  lawyer: "lawyers",
};

const PROVIDER_TYPE_ICONS: Record<ProviderType, typeof Briefcase> = {
  broker: Briefcase,
  mortgage_advisor: Calculator,
  lawyer: Scale,
};

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

// Skeleton loader for provider cards
function ProviderCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Skeleton className="h-14 w-14 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-28" />
            <div className="flex gap-2 mt-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

// Provider card component
interface Provider {
  _id: string;
  userId: string;
  name?: string;
  email?: string;
  imageUrl?: string;
  companyName?: string;
  yearsExperience?: number;
  specializations: string[];
  serviceAreas: string[];
  languages: string[];
  bio?: string;
}

interface ProviderCardProps {
  provider: Provider;
  onViewProfile: (userId: string) => void;
  t: ReturnType<typeof useTranslations<"providers">>;
}

function ProviderCard({ provider, onViewProfile, t }: ProviderCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar className="h-14 w-14 flex-shrink-0">
            <AvatarImage src={provider.imageUrl} />
            <AvatarFallback className="text-lg">
              {getInitials(provider.name)}
            </AvatarFallback>
          </Avatar>

          {/* Provider Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">
              {provider.name || "Unknown Provider"}
            </h3>
            {provider.companyName && (
              <p className="text-sm text-muted-foreground truncate">
                {provider.companyName}
              </p>
            )}

            {/* Experience */}
            {provider.yearsExperience !== undefined && provider.yearsExperience > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <HugeiconsIcon icon={Calendar01Icon} size={12} />
                <span>{t("card.yearsExperience", { count: provider.yearsExperience })}</span>
              </div>
            )}

            {/* Service Areas */}
            {provider.serviceAreas.length > 0 && (
              <div className="flex items-center gap-1 mt-2">
                <HugeiconsIcon icon={Location01Icon} size={12} className="text-muted-foreground flex-shrink-0" />
                <div className="flex flex-wrap gap-1">
                  {provider.serviceAreas.slice(0, 3).map((area) => (
                    <Badge key={area} variant="outline" className="text-xs px-1.5 py-0">
                      {area}
                    </Badge>
                  ))}
                  {provider.serviceAreas.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      {t("card.more", { count: provider.serviceAreas.length - 3 })}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Specializations */}
            {provider.specializations.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {provider.specializations.slice(0, 2).map((spec) => (
                  <Badge key={spec} variant="secondary" className="text-xs">
                    {spec}
                  </Badge>
                ))}
                {provider.specializations.length > 2 && (
                  <span className="text-xs text-muted-foreground">
                    {t("card.more", { count: provider.specializations.length - 2 })}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* View Profile Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewProfile(provider.userId)}
            className="flex-shrink-0"
          >
            {t("card.view")}
            <ArrowRight size={14} className="ms-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProvidersPage() {
  const router = useRouter();
  const t = useTranslations("providers");
  const [providerType, setProviderType] = useState<ProviderType>("broker");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch providers by type
  const providers = useQuery(api.serviceProviderProfiles.listByType, {
    providerType,
  });

  // Filter providers by search query
  const filteredProviders = useMemo(() => {
    if (!providers) return [];

    if (!searchQuery.trim()) {
      return providers;
    }

    const query = searchQuery.toLowerCase();
    return providers.filter(
      (provider) =>
        provider.name?.toLowerCase().includes(query) ||
        provider.companyName?.toLowerCase().includes(query) ||
        provider.serviceAreas.some((area) =>
          area.toLowerCase().includes(query)
        ) ||
        provider.specializations.some((spec) =>
          spec.toLowerCase().includes(query)
        )
    );
  }, [providers, searchQuery]);

  // Handle view profile
  function handleViewProfile(userId: string) {
    router.push(`/providers/${userId}`);
  }

  const TypeIcon = PROVIDER_TYPE_ICONS[providerType];
  const typeLabel = t(`tabs.${PROVIDER_TAB_KEYS[providerType]}`);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t("findProviders")}</h1>
        <p className="text-muted-foreground">
          {t("description")}
        </p>
      </div>

      {/* Provider Type Tabs */}
      <Tabs
        value={providerType}
        onValueChange={(v) => setProviderType(v as ProviderType)}
        className="mb-6"
      >
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="broker" className="flex items-center gap-1.5">
            <Briefcase size={14} />
            <span className="hidden sm:inline">{t("tabs.brokers")}</span>
          </TabsTrigger>
          <TabsTrigger value="mortgage_advisor" className="flex items-center gap-1.5">
            <Calculator size={14} />
            <span className="hidden sm:inline">{t("tabs.mortgageAdvisors")}</span>
          </TabsTrigger>
          <TabsTrigger value="lawyer" className="flex items-center gap-1.5">
            <Scale size={14} />
            <span className="hidden sm:inline">{t("tabs.lawyers")}</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search
            size={16}
            className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder={t("filters.serviceArea") + "..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-9"
          />
        </div>
      </div>

      {/* Loading state */}
      {providers === undefined && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProviderCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty state (no providers of this type) */}
      {providers !== undefined && providers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="rounded-full bg-muted p-4 mb-4 text-muted-foreground">
            <TypeIcon size={48} strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-semibold mb-2">
            {t("empty.noProviders", { type: typeLabel.toLowerCase() })}
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            {t("empty.willAppear", { type: typeLabel })}
          </p>
        </div>
      )}

      {/* No results for search */}
      {providers !== undefined &&
        providers.length > 0 &&
        filteredProviders.length === 0 &&
        searchQuery.trim() && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {t("empty.noMatch", { query: searchQuery })}
            </p>
            <Button variant="outline" onClick={() => setSearchQuery("")}>
              {t("empty.clearSearch")}
            </Button>
          </div>
        )}

      {/* Provider grid */}
      {filteredProviders.length > 0 && (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            {filteredProviders.length} {typeLabel.toLowerCase()}
            {searchQuery.trim() && ` matching "${searchQuery}"`}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProviders.map((provider) => (
              <ProviderCard
                key={provider._id}
                provider={provider}
                onViewProfile={handleViewProfile}
                t={t}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
