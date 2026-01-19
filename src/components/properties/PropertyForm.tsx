"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
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
  const createProperty = useMutation(api.properties.create);
  const updateProperty = useMutation(api.properties.update);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Core fields - initialize from initialData if provided
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

  // Pricing - initialize from initialData if provided
  const [priceUsd, setPriceUsd] = useState(
    initialData?.priceUsd?.toString() ?? ""
  );
  const [priceIls, setPriceIls] = useState(
    initialData?.priceIls?.toString() ?? ""
  );

  // Investment metrics - initialize from initialData if provided
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

  // Property details - initialize from initialData if provided
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

  // Media - initialize from initialData if provided
  const [imagesInput, setImagesInput] = useState(
    initialData?.images?.join(", ") ?? ""
  );
  const [featuredImage, setFeaturedImage] = useState(
    initialData?.featuredImage ?? ""
  );

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
      newErrors.title = "Title is required";
    }

    if (!address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!city) {
      newErrors.city = "City is required";
    }

    const usdValue = parseFloat(priceUsd);
    if (!priceUsd || isNaN(usdValue) || usdValue <= 0) {
      newErrors.priceUsd = "Enter a valid price (must be positive)";
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

      if (mode === "edit" && propertyId) {
        // Update existing property
        await updateProperty({
          id: propertyId,
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
          images,
          featuredImage: featuredImage.trim() || undefined,
        });

        toast.success("Property updated successfully!");
      } else {
        // Create new property
        await createProperty({
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
          images,
          featuredImage: featuredImage.trim() || undefined,
        });

        toast.success("Property created successfully!");
      }

      router.push("/properties");
    } catch (error) {
      console.error(`Failed to ${mode} property:`, error);
      toast.error(
        `Failed to ${mode === "edit" ? "update" : "create"} property. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const buttonText = mode === "edit" ? "Save Changes" : "Create Property";
  const buttonLoadingText = mode === "edit" ? "Saving..." : "Creating Property...";

  return (
    <form onSubmit={handleSubmit}>
      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
        {/* Left Column - Basic Info */}
        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base font-medium">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Modern Apartment in Tel Aviv"
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

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the property..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-base font-medium">
              Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="address"
              placeholder="e.g., 123 Rothschild Blvd"
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

          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="city" className="text-base font-medium">
              City <span className="text-destructive">*</span>
            </Label>
            <Select
              value={city}
              onValueChange={(value) => {
                setCity(value);
                setErrors((prev) => ({ ...prev, city: "" }));
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a city" />
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

          {/* Property Type */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Property Type</Label>
            <RadioGroup
              value={propertyType}
              onValueChange={(value) => setPropertyType(value as PropertyType)}
            >
              <div className="grid grid-cols-2 gap-3">
                {PROPERTY_TYPES.map((type) => (
                  <div
                    key={type.value}
                    className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 cursor-pointer"
                    onClick={() => setPropertyType(type.value as PropertyType)}
                  >
                    <RadioGroupItem value={type.value} id={`type-${type.value}`} />
                    <Label htmlFor={`type-${type.value}`} className="cursor-pointer font-medium">
                      {type.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Right Column - Pricing & Metrics */}
        <div className="space-y-6">
          {/* Price */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              Price <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priceUsd">USD</Label>
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
                <Label htmlFor="priceIls">ILS (auto-calculated)</Label>
                <Input
                  id="priceIls"
                  type="number"
                  placeholder="1,850,000"
                  value={priceIls}
                  onChange={(e) => setPriceIls(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Investment Metrics */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Investment Metrics</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expectedRoi">Expected ROI %</Label>
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
                <Label htmlFor="capRate">Cap Rate %</Label>
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
                <Label htmlFor="cashOnCash">Cash-on-Cash %</Label>
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
                <Label htmlFor="monthlyRent">Monthly Rent (USD)</Label>
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

          {/* Status */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Status</Label>
            <RadioGroup
              value={status}
              onValueChange={(value) => setStatus(value as PropertyStatus)}
            >
              <div className="flex gap-4">
                {PROPERTY_STATUS.map((s) => (
                  <div
                    key={s.value}
                    className="flex items-center gap-2 rounded-lg border p-3 hover:bg-muted/50 cursor-pointer"
                    onClick={() => setStatus(s.value as PropertyStatus)}
                  >
                    <RadioGroupItem value={s.value} id={`status-${s.value}`} />
                    <Label htmlFor={`status-${s.value}`} className="cursor-pointer font-medium">
                      {s.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>

      {/* Property Details - Full Width Row */}
      <div className="mt-8 space-y-3">
        <Label className="text-base font-medium">Property Details</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bedrooms">Bedrooms</Label>
            <Input
              id="bedrooms"
              type="number"
              placeholder="3"
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bathrooms">Bathrooms</Label>
            <Input
              id="bathrooms"
              type="number"
              placeholder="2"
              value={bathrooms}
              onChange={(e) => setBathrooms(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="squareMeters">Square Meters</Label>
            <Input
              id="squareMeters"
              type="number"
              placeholder="120"
              value={squareMeters}
              onChange={(e) => setSquareMeters(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="yearBuilt">Year Built</Label>
            <Input
              id="yearBuilt"
              type="number"
              placeholder="2020"
              value={yearBuilt}
              onChange={(e) => setYearBuilt(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Images - Full Width Row */}
      <div className="mt-8 space-y-3">
        <Label className="text-base font-medium">Images</Label>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="imagesInput">Image URLs (comma-separated)</Label>
            <Textarea
              id="imagesInput"
              placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
              value={imagesInput}
              onChange={(e) => setImagesInput(e.target.value)}
              className="min-h-[80px] resize-none"
            />
            <p className="text-sm text-muted-foreground">
              Enter image URLs separated by commas. File upload coming soon.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="featuredImage">Featured Image URL</Label>
            <Input
              id="featuredImage"
              placeholder="https://example.com/featured.jpg"
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              The main image displayed in property listings.
            </p>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="mt-8">
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
