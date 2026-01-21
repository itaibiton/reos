"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useTranslations } from "next-intl";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PROPERTY_TYPES,
  ISRAELI_LOCATIONS,
  PROPERTY_STATUS,
  USD_TO_ILS_RATE,
} from "@/lib/constants";

type PropertyType = "residential" | "commercial" | "mixed_use" | "land";
type PropertyStatus = "available" | "pending" | "sold";
type ParkingType = "garage" | "covered" | "street" | "none";
type HeatingType = "central" | "electric" | "gas" | "none";
type CoolingType = "central_ac" | "split" | "none";
type LaundryType = "in_unit" | "shared" | "none";

// Zillow-style options
const PARKING_TYPES: { value: ParkingType; label: string }[] = [
  { value: "garage", label: "Garage" },
  { value: "covered", label: "Covered" },
  { value: "street", label: "Street" },
  { value: "none", label: "None" },
];

const HEATING_TYPES: { value: HeatingType; label: string }[] = [
  { value: "central", label: "Central" },
  { value: "electric", label: "Electric" },
  { value: "gas", label: "Gas" },
  { value: "none", label: "None" },
];

const COOLING_TYPES: { value: CoolingType; label: string }[] = [
  { value: "central_ac", label: "Central AC" },
  { value: "split", label: "Split AC" },
  { value: "none", label: "None" },
];

const LAUNDRY_TYPES: { value: LaundryType; label: string }[] = [
  { value: "in_unit", label: "In-Unit" },
  { value: "shared", label: "Shared" },
  { value: "none", label: "None" },
];

const FLOORING_OPTIONS = ["tile", "hardwood", "marble", "carpet", "concrete"];
const CONSTRUCTION_MATERIALS = ["concrete", "brick", "stone", "wood"];
const APPLIANCES = ["dishwasher", "oven", "refrigerator", "washer", "dryer", "microwave"];
const EXTERIOR_FEATURES = ["balcony", "garden", "pool", "rooftop", "storage"];
const VIEW_OPTIONS = ["city", "sea", "mountain", "garden", "park"];
const AMENITY_OPTIONS = [
  "airConditioning",
  "elevator",
  "parking",
  "storage",
  "balcony",
  "security",
  "gym",
  "pool",
  "garden",
  "renovated",
  "furnished",
  "petFriendly",
  "accessible",
  "safeRoom",
  "solar",
];

interface PropertyFormData {
  title: string;
  description: string;
  address: string;
  city: string;
  propertyType: PropertyType;
  status: PropertyStatus;
  priceUsd: number;
  priceIls: number;
  expectedRoi?: number;
  cashOnCash?: number;
  capRate?: number;
  monthlyRent?: number;
  bedrooms?: number;
  bathrooms?: number;
  squareMeters?: number;
  yearBuilt?: number;
  // Zillow-style fields
  floors?: number;
  lotSize?: number;
  parkingSpaces?: number;
  parkingType?: ParkingType;
  heatingType?: HeatingType;
  coolingType?: CoolingType;
  flooringType?: string[];
  laundryType?: LaundryType;
  hoaFees?: number;
  propertyTax?: number;
  constructionMaterials?: string[];
  appliances?: string[];
  exteriorFeatures?: string[];
  view?: string[];
  amenities?: string[];
  latitude?: number;
  longitude?: number;
  images: string[];
  featuredImage?: string;
}

interface PropertyFormProps {
  mode?: "create" | "edit";
  propertyId?: Id<"properties">;
  initialData?: PropertyFormData;
}

export function PropertyForm({
  mode = "create",
  propertyId,
  initialData,
}: PropertyFormProps) {
  const router = useRouter();
  const t = useTranslations("properties.form");
  const tPropertyTypes = useTranslations("common.propertyTypes");
  const tPropertyStatus = useTranslations("common.propertyStatus");
  const tAmenities = useTranslations("common.amenities");
  const createProperty = useMutation(api.properties.create);
  const updateProperty = useMutation(api.properties.update);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Core fields
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [address, setAddress] = useState(initialData?.address ?? "");
  const [city, setCity] = useState(initialData?.city ?? "");
  const [propertyType, setPropertyType] = useState<PropertyType>(
    initialData?.propertyType ?? "residential"
  );
  const [status, setStatus] = useState<PropertyStatus>(
    initialData?.status ?? "available"
  );

  // Pricing
  const [priceUsd, setPriceUsd] = useState(
    initialData?.priceUsd?.toString() ?? ""
  );
  const [priceIls, setPriceIls] = useState(
    initialData?.priceIls?.toString() ?? ""
  );

  // Investment metrics
  const [expectedRoi, setExpectedRoi] = useState(
    initialData?.expectedRoi?.toString() ?? ""
  );
  const [cashOnCash, setCashOnCash] = useState(
    initialData?.cashOnCash?.toString() ?? ""
  );
  const [capRate, setCapRate] = useState(initialData?.capRate?.toString() ?? "");
  const [monthlyRent, setMonthlyRent] = useState(
    initialData?.monthlyRent?.toString() ?? ""
  );

  // Basic property details
  const [bedrooms, setBedrooms] = useState(
    initialData?.bedrooms?.toString() ?? ""
  );
  const [bathrooms, setBathrooms] = useState(
    initialData?.bathrooms?.toString() ?? ""
  );
  const [squareMeters, setSquareMeters] = useState(
    initialData?.squareMeters?.toString() ?? ""
  );
  const [yearBuilt, setYearBuilt] = useState(
    initialData?.yearBuilt?.toString() ?? ""
  );

  // Zillow-style fields
  const [floors, setFloors] = useState(initialData?.floors?.toString() ?? "");
  const [lotSize, setLotSize] = useState(initialData?.lotSize?.toString() ?? "");
  const [parkingSpaces, setParkingSpaces] = useState(
    initialData?.parkingSpaces?.toString() ?? ""
  );
  const [parkingType, setParkingType] = useState<ParkingType | "">(
    initialData?.parkingType ?? ""
  );
  const [heatingType, setHeatingType] = useState<HeatingType | "">(
    initialData?.heatingType ?? ""
  );
  const [coolingType, setCoolingType] = useState<CoolingType | "">(
    initialData?.coolingType ?? ""
  );
  const [flooringType, setFlooringType] = useState<string[]>(
    initialData?.flooringType ?? []
  );
  const [laundryType, setLaundryType] = useState<LaundryType | "">(
    initialData?.laundryType ?? ""
  );
  const [hoaFees, setHoaFees] = useState(initialData?.hoaFees?.toString() ?? "");
  const [propertyTax, setPropertyTax] = useState(
    initialData?.propertyTax?.toString() ?? ""
  );
  const [constructionMaterials, setConstructionMaterials] = useState<string[]>(
    initialData?.constructionMaterials ?? []
  );
  const [appliances, setAppliances] = useState<string[]>(
    initialData?.appliances ?? []
  );
  const [exteriorFeatures, setExteriorFeatures] = useState<string[]>(
    initialData?.exteriorFeatures ?? []
  );
  const [viewOptions, setViewOptions] = useState<string[]>(
    initialData?.view ?? []
  );
  const [amenities, setAmenities] = useState<string[]>(
    initialData?.amenities ?? []
  );

  // Location
  const [latitude, setLatitude] = useState(
    initialData?.latitude?.toString() ?? ""
  );
  const [longitude, setLongitude] = useState(
    initialData?.longitude?.toString() ?? ""
  );

  // Media
  const [imagesInput, setImagesInput] = useState(
    initialData?.images?.join(", ") ?? ""
  );
  const [featuredImage, setFeaturedImage] = useState(
    initialData?.featuredImage ?? ""
  );

  // Toggle array item
  const toggleArrayItem = (
    array: string[],
    setArray: (arr: string[]) => void,
    item: string
  ) => {
    if (array.includes(item)) {
      setArray(array.filter((i) => i !== item));
    } else {
      setArray([...array, item]);
    }
  };

  // Auto-calculate ILS when USD changes
  const handlePriceUsdChange = (value: string) => {
    setPriceUsd(value);
    const usdValue = parseFloat(value);
    if (!isNaN(usdValue) && usdValue > 0) {
      setPriceIls(Math.round(usdValue * USD_TO_ILS_RATE).toString());
    } else {
      setPriceIls("");
    }
    setErrors((prev) => ({ ...prev, priceUsd: "" }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = t("titleRequired");
    }

    if (!address.trim()) {
      newErrors.address = t("addressRequired");
    }

    if (!city) {
      newErrors.city = t("cityRequired");
    }

    const usdValue = parseFloat(priceUsd);
    if (!priceUsd || isNaN(usdValue) || usdValue <= 0) {
      newErrors.priceUsd = t("priceRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // Parse images from comma-separated input
      const images = imagesInput
        .split(",")
        .map((url) => url.trim())
        .filter((url) => url.length > 0);

      const propertyData = {
        title: title.trim(),
        description: description.trim(),
        address: address.trim(),
        city,
        propertyType,
        status,
        priceUsd: parseFloat(priceUsd),
        priceIls: parseFloat(priceIls) || parseFloat(priceUsd) * USD_TO_ILS_RATE,
        expectedRoi: expectedRoi ? parseFloat(expectedRoi) : undefined,
        cashOnCash: cashOnCash ? parseFloat(cashOnCash) : undefined,
        capRate: capRate ? parseFloat(capRate) : undefined,
        monthlyRent: monthlyRent ? parseFloat(monthlyRent) : undefined,
        bedrooms: bedrooms ? parseInt(bedrooms, 10) : undefined,
        bathrooms: bathrooms ? parseInt(bathrooms, 10) : undefined,
        squareMeters: squareMeters ? parseFloat(squareMeters) : undefined,
        yearBuilt: yearBuilt ? parseInt(yearBuilt, 10) : undefined,
        // Zillow-style fields
        floors: floors ? parseInt(floors, 10) : undefined,
        lotSize: lotSize ? parseFloat(lotSize) : undefined,
        parkingSpaces: parkingSpaces ? parseInt(parkingSpaces, 10) : undefined,
        parkingType: parkingType || undefined,
        heatingType: heatingType || undefined,
        coolingType: coolingType || undefined,
        flooringType: flooringType.length > 0 ? flooringType : undefined,
        laundryType: laundryType || undefined,
        hoaFees: hoaFees ? parseFloat(hoaFees) : undefined,
        propertyTax: propertyTax ? parseFloat(propertyTax) : undefined,
        constructionMaterials:
          constructionMaterials.length > 0 ? constructionMaterials : undefined,
        appliances: appliances.length > 0 ? appliances : undefined,
        exteriorFeatures:
          exteriorFeatures.length > 0 ? exteriorFeatures : undefined,
        view: viewOptions.length > 0 ? viewOptions : undefined,
        amenities: amenities.length > 0 ? amenities : undefined,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        images,
        featuredImage: featuredImage.trim() || undefined,
      };

      if (mode === "edit" && propertyId) {
        await updateProperty({ id: propertyId, ...propertyData });
        toast.success(t("updateSuccess"));
      } else {
        await createProperty(propertyData);
        toast.success(t("createSuccess"));
      }

      router.push("/properties");
    } catch (error) {
      console.error(`Failed to ${mode} property:`, error);
      toast.error(mode === "edit" ? t("updateError") : t("createError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const buttonText = mode === "edit" ? t("saveChanges") : t("createProperty");
  const buttonLoadingText =
    mode === "edit" ? t("savingChanges") : t("creatingProperty");

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>{t("sections.basicInfo")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base font-medium">
                {t("title")} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder={t("titlePlaceholder")}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setErrors((prev) => ({ ...prev, title: "" }));
                }}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city" className="text-base font-medium">
                {t("city")} <span className="text-destructive">*</span>
              </Label>
              <Select
                value={city}
                onValueChange={(value) => {
                  setCity(value);
                  setErrors((prev) => ({ ...prev, city: "" }));
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("cityPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {ISRAELI_LOCATIONS.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.city && (
                <p className="text-sm text-destructive">{errors.city}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-medium">
              {t("description")}
            </Label>
            <Textarea
              id="description"
              placeholder={t("descriptionPlaceholder")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-base font-medium">
              {t("address")} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="address"
              placeholder={t("addressPlaceholder")}
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setErrors((prev) => ({ ...prev, address: "" }));
              }}
            />
            {errors.address && (
              <p className="text-sm text-destructive">{errors.address}</p>
            )}
          </div>

          {/* Property Type */}
          <div className="space-y-3">
            <Label className="text-base font-medium">{t("propertyType")}</Label>
            <RadioGroup
              value={propertyType}
              onValueChange={(value) => setPropertyType(value as PropertyType)}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {PROPERTY_TYPES.map((type) => (
                  <div
                    key={type.value}
                    className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 cursor-pointer"
                    onClick={() => setPropertyType(type.value as PropertyType)}
                  >
                    <RadioGroupItem value={type.value} id={`type-${type.value}`} />
                    <Label
                      htmlFor={`type-${type.value}`}
                      className="cursor-pointer font-medium"
                    >
                      {type.value === "residential"
                        ? tPropertyTypes("residential")
                        : type.value === "commercial"
                          ? tPropertyTypes("commercial")
                          : type.value === "mixed_use"
                            ? tPropertyTypes("mixedUse")
                            : tPropertyTypes("land")}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Status */}
          <div className="space-y-3">
            <Label className="text-base font-medium">{t("status")}</Label>
            <RadioGroup
              value={status}
              onValueChange={(value) => setStatus(value as PropertyStatus)}
            >
              <div className="flex flex-wrap gap-3">
                {PROPERTY_STATUS.map((s) => (
                  <div
                    key={s.value}
                    className="flex items-center gap-2 rounded-lg border p-3 hover:bg-muted/50 cursor-pointer"
                    onClick={() => setStatus(s.value as PropertyStatus)}
                  >
                    <RadioGroupItem value={s.value} id={`status-${s.value}`} />
                    <Label
                      htmlFor={`status-${s.value}`}
                      className="cursor-pointer font-medium"
                    >
                      {tPropertyStatus(s.value)}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Pricing & Investment */}
      <Card>
        <CardHeader>
          <CardTitle>{t("sections.pricing")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priceUsd">
                {t("priceUsd")} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="priceUsd"
                type="number"
                placeholder="500,000"
                value={priceUsd}
                onChange={(e) => handlePriceUsdChange(e.target.value)}
              />
              {errors.priceUsd && (
                <p className="text-sm text-destructive">{errors.priceUsd}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="priceIls">{t("priceIls")}</Label>
              <Input
                id="priceIls"
                type="number"
                placeholder="1,850,000"
                value={priceIls}
                onChange={(e) => setPriceIls(e.target.value)}
              />
            </div>
          </div>

          <Separator />

          {/* Investment Metrics */}
          <div className="space-y-3">
            <Label className="text-base font-medium">{t("investmentMetrics")}</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expectedRoi">{t("expectedRoi")}</Label>
                <Input
                  id="expectedRoi"
                  type="number"
                  step="0.1"
                  placeholder="8"
                  value={expectedRoi}
                  onChange={(e) => setExpectedRoi(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capRate">{t("capRate")}</Label>
                <Input
                  id="capRate"
                  type="number"
                  step="0.1"
                  placeholder="5"
                  value={capRate}
                  onChange={(e) => setCapRate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cashOnCash">{t("cashOnCash")}</Label>
                <Input
                  id="cashOnCash"
                  type="number"
                  step="0.1"
                  placeholder="6"
                  value={cashOnCash}
                  onChange={(e) => setCashOnCash(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthlyRent">{t("monthlyRent")}</Label>
                <Input
                  id="monthlyRent"
                  type="number"
                  placeholder="2,000"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Financial Costs */}
          <div className="space-y-3">
            <Label className="text-base font-medium">{t("sections.costs")}</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hoaFees">{t("hoaFees")}</Label>
                <Input
                  id="hoaFees"
                  type="number"
                  placeholder="500"
                  value={hoaFees}
                  onChange={(e) => setHoaFees(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="propertyTax">{t("propertyTax")}</Label>
                <Input
                  id="propertyTax"
                  type="number"
                  placeholder="3,000"
                  value={propertyTax}
                  onChange={(e) => setPropertyTax(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Details */}
      <Card>
        <CardHeader>
          <CardTitle>{t("sections.details")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bedrooms">{t("bedrooms")}</Label>
              <Input
                id="bedrooms"
                type="number"
                placeholder="3"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bathrooms">{t("bathrooms")}</Label>
              <Input
                id="bathrooms"
                type="number"
                placeholder="2"
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="squareMeters">{t("squareMeters")}</Label>
              <Input
                id="squareMeters"
                type="number"
                placeholder="120"
                value={squareMeters}
                onChange={(e) => setSquareMeters(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearBuilt">{t("yearBuilt")}</Label>
              <Input
                id="yearBuilt"
                type="number"
                placeholder="2020"
                value={yearBuilt}
                onChange={(e) => setYearBuilt(e.target.value)}
              />
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="floors">{t("floors")}</Label>
              <Input
                id="floors"
                type="number"
                placeholder="2"
                value={floors}
                onChange={(e) => setFloors(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lotSize">{t("lotSize")}</Label>
              <Input
                id="lotSize"
                type="number"
                placeholder="500"
                value={lotSize}
                onChange={(e) => setLotSize(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parkingSpaces">{t("parkingSpaces")}</Label>
              <Input
                id="parkingSpaces"
                type="number"
                placeholder="2"
                value={parkingSpaces}
                onChange={(e) => setParkingSpaces(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parkingType">{t("parkingType")}</Label>
              <Select
                value={parkingType}
                onValueChange={(v) => setParkingType(v as ParkingType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("select")} />
                </SelectTrigger>
                <SelectContent>
                  {PARKING_TYPES.map((pt) => (
                    <SelectItem key={pt.value} value={pt.value}>
                      {t(`parkingTypes.${pt.value}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interior Features */}
      <Card>
        <CardHeader>
          <CardTitle>{t("sections.interior")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Climate Control */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="heatingType">{t("heatingType")}</Label>
              <Select
                value={heatingType}
                onValueChange={(v) => setHeatingType(v as HeatingType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("select")} />
                </SelectTrigger>
                <SelectContent>
                  {HEATING_TYPES.map((ht) => (
                    <SelectItem key={ht.value} value={ht.value}>
                      {t(`heatingTypes.${ht.value}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="coolingType">{t("coolingType")}</Label>
              <Select
                value={coolingType}
                onValueChange={(v) => setCoolingType(v as CoolingType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("select")} />
                </SelectTrigger>
                <SelectContent>
                  {COOLING_TYPES.map((ct) => (
                    <SelectItem key={ct.value} value={ct.value}>
                      {t(`coolingTypes.${ct.value}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="laundryType">{t("laundryType")}</Label>
              <Select
                value={laundryType}
                onValueChange={(v) => setLaundryType(v as LaundryType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("select")} />
                </SelectTrigger>
                <SelectContent>
                  {LAUNDRY_TYPES.map((lt) => (
                    <SelectItem key={lt.value} value={lt.value}>
                      {t(`laundryTypes.${lt.value}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Flooring */}
          <div className="space-y-3">
            <Label className="text-base font-medium">{t("flooring")}</Label>
            <div className="flex flex-wrap gap-2">
              {FLOORING_OPTIONS.map((floor) => (
                <div
                  key={floor}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`floor-${floor}`}
                    checked={flooringType.includes(floor)}
                    onCheckedChange={() =>
                      toggleArrayItem(flooringType, setFlooringType, floor)
                    }
                  />
                  <Label htmlFor={`floor-${floor}`} className="text-sm cursor-pointer">
                    {t(`flooringTypes.${floor}`)}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Appliances */}
          <div className="space-y-3">
            <Label className="text-base font-medium">{t("appliances")}</Label>
            <div className="flex flex-wrap gap-2">
              {APPLIANCES.map((app) => (
                <div key={app} className="flex items-center space-x-2">
                  <Checkbox
                    id={`app-${app}`}
                    checked={appliances.includes(app)}
                    onCheckedChange={() =>
                      toggleArrayItem(appliances, setAppliances, app)
                    }
                  />
                  <Label htmlFor={`app-${app}`} className="text-sm cursor-pointer">
                    {t(`applianceTypes.${app}`)}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exterior Features */}
      <Card>
        <CardHeader>
          <CardTitle>{t("sections.exterior")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Exterior Features */}
          <div className="space-y-3">
            <Label className="text-base font-medium">{t("exteriorFeatures")}</Label>
            <div className="flex flex-wrap gap-2">
              {EXTERIOR_FEATURES.map((feat) => (
                <div key={feat} className="flex items-center space-x-2">
                  <Checkbox
                    id={`ext-${feat}`}
                    checked={exteriorFeatures.includes(feat)}
                    onCheckedChange={() =>
                      toggleArrayItem(exteriorFeatures, setExteriorFeatures, feat)
                    }
                  />
                  <Label htmlFor={`ext-${feat}`} className="text-sm cursor-pointer">
                    {t(`exteriorFeatureTypes.${feat}`)}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* View */}
          <div className="space-y-3">
            <Label className="text-base font-medium">{t("view")}</Label>
            <div className="flex flex-wrap gap-2">
              {VIEW_OPTIONS.map((v) => (
                <div key={v} className="flex items-center space-x-2">
                  <Checkbox
                    id={`view-${v}`}
                    checked={viewOptions.includes(v)}
                    onCheckedChange={() =>
                      toggleArrayItem(viewOptions, setViewOptions, v)
                    }
                  />
                  <Label htmlFor={`view-${v}`} className="text-sm cursor-pointer">
                    {t(`viewTypes.${v}`)}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Construction Materials */}
          <div className="space-y-3">
            <Label className="text-base font-medium">{t("construction")}</Label>
            <div className="flex flex-wrap gap-2">
              {CONSTRUCTION_MATERIALS.map((mat) => (
                <div key={mat} className="flex items-center space-x-2">
                  <Checkbox
                    id={`mat-${mat}`}
                    checked={constructionMaterials.includes(mat)}
                    onCheckedChange={() =>
                      toggleArrayItem(
                        constructionMaterials,
                        setConstructionMaterials,
                        mat
                      )
                    }
                  />
                  <Label htmlFor={`mat-${mat}`} className="text-sm cursor-pointer">
                    {t(`constructionTypes.${mat}`)}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Amenities */}
      <Card>
        <CardHeader>
          <CardTitle>{t("sections.amenities")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {AMENITY_OPTIONS.map((amenity) => (
              <div key={amenity} className="flex items-center space-x-2">
                <Checkbox
                  id={`amenity-${amenity}`}
                  checked={amenities.includes(amenity)}
                  onCheckedChange={() =>
                    toggleArrayItem(amenities, setAmenities, amenity)
                  }
                />
                <Label
                  htmlFor={`amenity-${amenity}`}
                  className="text-sm cursor-pointer"
                >
                  {tAmenities(amenity)}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle>{t("sections.location")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">{t("latitude")}</Label>
              <Input
                id="latitude"
                type="number"
                step="0.000001"
                placeholder="32.0853"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">{t("longitude")}</Label>
              <Input
                id="longitude"
                type="number"
                step="0.000001"
                placeholder="34.7818"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>{t("sections.images")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="imagesInput">{t("imageUrls")}</Label>
            <Textarea
              id="imagesInput"
              placeholder={t("imageUrlsPlaceholder")}
              value={imagesInput}
              onChange={(e) => setImagesInput(e.target.value)}
              className="min-h-[80px] resize-none"
            />
            <p className="text-sm text-muted-foreground">{t("imageUrlsHelp")}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="featuredImage">{t("featuredImage")}</Label>
            <Input
              id="featuredImage"
              placeholder={t("featuredImagePlaceholder")}
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              {t("featuredImageHelp")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting} size="lg">
          {isSubmitting ? (
            <>
              <Spinner className="me-2 h-4 w-4" />
              {buttonLoadingText}
            </>
          ) : (
            buttonText
          )}
        </Button>
      </div>
    </form>
  );
}
