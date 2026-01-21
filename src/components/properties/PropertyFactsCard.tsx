"use client";

import { useTranslations, useFormatter } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  Home01Icon,
  Bathtub01Icon,
  Square01Icon,
  Calendar01Icon,
  Building02Icon,
  Car01Icon,
  Sun01Icon,
  AirplaneModeIcon,
  GridIcon,
  UserMultiple02Icon,
  Dollar02Icon,
  Layers01Icon,
  ViewIcon,
  Home02Icon,
  Sofa02Icon,
} from "@hugeicons/core-free-icons";

interface PropertyFactsCardProps {
  // Basic details
  bedrooms?: number;
  bathrooms?: number;
  squareMeters?: number;
  yearBuilt?: number;
  propertyType: string;
  city: string;
  // Zillow-style fields
  floors?: number;
  lotSize?: number;
  parkingSpaces?: number;
  parkingType?: string;
  heatingType?: string;
  coolingType?: string;
  flooringType?: string[];
  laundryType?: string;
  hoaFees?: number;
  propertyTax?: number;
  constructionMaterials?: string[];
  appliances?: string[];
  exteriorFeatures?: string[];
  view?: string[];
  className?: string;
}

interface FactItemProps {
  icon: IconSvgElement;
  label: string;
  value: string | number | undefined | null;
  suffix?: string;
}

function FactItem({ icon, label, value, suffix = "" }: FactItemProps) {
  if (value === undefined || value === null) return null;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
      <HugeiconsIcon
        icon={icon}
        size={22}
        strokeWidth={1.5}
        className="text-primary flex-shrink-0"
      />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className="font-semibold truncate">
          {value}
          {suffix}
        </p>
      </div>
    </div>
  );
}

function FeatureList({
  items,
  translationPrefix,
  t,
}: {
  items?: string[];
  translationPrefix: string;
  t: (key: string) => string;
}) {
  if (!items || items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Badge key={item} variant="secondary" className="text-xs">
          {t(`${translationPrefix}.${item}`)}
        </Badge>
      ))}
    </div>
  );
}

export function PropertyFactsCard({
  bedrooms,
  bathrooms,
  squareMeters,
  yearBuilt,
  propertyType,
  city,
  floors,
  lotSize,
  parkingSpaces,
  parkingType,
  heatingType,
  coolingType,
  flooringType,
  laundryType,
  hoaFees,
  propertyTax,
  constructionMaterials,
  appliances,
  exteriorFeatures,
  view,
  className,
}: PropertyFactsCardProps) {
  const t = useTranslations("properties.facts");
  const tCommon = useTranslations("common");
  const format = useFormatter();

  // Check if we have any enhanced details to show
  const hasInteriorDetails =
    floors ||
    flooringType?.length ||
    heatingType ||
    coolingType ||
    laundryType ||
    appliances?.length;
  const hasExteriorDetails =
    lotSize || parkingSpaces || parkingType || exteriorFeatures?.length || view?.length;
  const hasFinancialDetails = hoaFees || propertyTax;
  const hasConstructionDetails = constructionMaterials?.length || yearBuilt;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="border-b bg-muted/30">
        <CardTitle className="text-xl">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
            <TabsTrigger
              value="overview"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
            >
              {t("tabs.overview")}
            </TabsTrigger>
            {hasInteriorDetails && (
              <TabsTrigger
                value="interior"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                {t("tabs.interior")}
              </TabsTrigger>
            )}
            {hasExteriorDetails && (
              <TabsTrigger
                value="exterior"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                {t("tabs.exterior")}
              </TabsTrigger>
            )}
            {hasFinancialDetails && (
              <TabsTrigger
                value="financial"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                {t("tabs.financial")}
              </TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="p-6 mt-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <FactItem
                icon={Home01Icon}
                label={t("bedrooms")}
                value={bedrooms}
              />
              <FactItem
                icon={Bathtub01Icon}
                label={t("bathrooms")}
                value={bathrooms}
              />
              <FactItem
                icon={Square01Icon}
                label={t("size")}
                value={squareMeters}
                suffix=" m²"
              />
              <FactItem
                icon={Calendar01Icon}
                label={t("yearBuilt")}
                value={yearBuilt}
              />
              <FactItem
                icon={Building02Icon}
                label={t("type")}
                value={tCommon(
                  `propertyTypes.${propertyType === "mixed_use" ? "mixedUse" : propertyType}`
                )}
              />
              <FactItem
                icon={Layers01Icon}
                label={t("floors")}
                value={floors}
              />
            </div>
          </TabsContent>

          {/* Interior Tab */}
          {hasInteriorDetails && (
            <TabsContent value="interior" className="p-6 mt-0 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <FactItem
                  icon={Layers01Icon}
                  label={t("floors")}
                  value={floors}
                />
                <FactItem
                  icon={Sun01Icon}
                  label={t("heating")}
                  value={heatingType ? t(`heatingTypes.${heatingType}`) : undefined}
                />
                <FactItem
                  icon={AirplaneModeIcon}
                  label={t("cooling")}
                  value={coolingType ? t(`coolingTypes.${coolingType}`) : undefined}
                />
                <FactItem
                  icon={UserMultiple02Icon}
                  label={t("laundry")}
                  value={laundryType ? t(`laundryTypes.${laundryType}`) : undefined}
                />
              </div>

              {flooringType && flooringType.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <HugeiconsIcon icon={GridIcon} size={16} />
                    {t("flooring")}
                  </h4>
                  <FeatureList items={flooringType} translationPrefix="flooringTypes" t={t} />
                </div>
              )}

              {appliances && appliances.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <HugeiconsIcon icon={Home02Icon} size={16} />
                    {t("appliances")}
                  </h4>
                  <FeatureList items={appliances} translationPrefix="applianceTypes" t={t} />
                </div>
              )}
            </TabsContent>
          )}

          {/* Exterior Tab */}
          {hasExteriorDetails && (
            <TabsContent value="exterior" className="p-6 mt-0 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <FactItem
                  icon={Square01Icon}
                  label={t("lotSize")}
                  value={lotSize}
                  suffix=" m²"
                />
                <FactItem
                  icon={Car01Icon}
                  label={t("parkingSpaces")}
                  value={parkingSpaces}
                />
                <FactItem
                  icon={Car01Icon}
                  label={t("parkingType")}
                  value={parkingType ? t(`parkingTypes.${parkingType}`) : undefined}
                />
              </div>

              {exteriorFeatures && exteriorFeatures.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <HugeiconsIcon icon={Sofa02Icon} size={16} />
                    {t("exteriorFeatures")}
                  </h4>
                  <FeatureList
                    items={exteriorFeatures}
                    translationPrefix="exteriorFeatureTypes"
                    t={t}
                  />
                </div>
              )}

              {view && view.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <HugeiconsIcon icon={ViewIcon} size={16} />
                    {t("view")}
                  </h4>
                  <FeatureList items={view} translationPrefix="viewTypes" t={t} />
                </div>
              )}

              {constructionMaterials && constructionMaterials.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <HugeiconsIcon icon={Building02Icon} size={16} />
                    {t("construction")}
                  </h4>
                  <FeatureList
                    items={constructionMaterials}
                    translationPrefix="constructionTypes"
                    t={t}
                  />
                </div>
              )}
            </TabsContent>
          )}

          {/* Financial Tab */}
          {hasFinancialDetails && (
            <TabsContent value="financial" className="p-6 mt-0">
              <div className="grid grid-cols-2 gap-4">
                {hoaFees !== undefined && hoaFees > 0 && (
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <HugeiconsIcon icon={Dollar02Icon} size={18} />
                      <span className="text-sm">{t("hoaFees")}</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {format.number(hoaFees, {
                        style: "currency",
                        currency: "USD",
                        maximumFractionDigits: 0,
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">{t("perMonth")}</p>
                  </div>
                )}

                {propertyTax !== undefined && propertyTax > 0 && (
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <HugeiconsIcon icon={Dollar02Icon} size={18} />
                      <span className="text-sm">{t("propertyTax")}</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {format.number(propertyTax, {
                        style: "currency",
                        currency: "USD",
                        maximumFractionDigits: 0,
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">{t("perYear")}</p>
                  </div>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
