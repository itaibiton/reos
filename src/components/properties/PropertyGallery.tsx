"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  GridViewIcon,
  Cancel01Icon,
  Image01Icon,
} from "@hugeicons/core-free-icons";

interface PropertyGalleryProps {
  images: string[];
  title: string;
  className?: string;
}

export function PropertyGallery({
  images,
  title,
  className,
}: PropertyGalleryProps) {
  const t = useTranslations("properties");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // If no images, show placeholder
  if (!images || images.length === 0) {
    return (
      <div
        className={cn(
          "relative bg-muted rounded-xl overflow-hidden flex items-center justify-center",
          className
        )}
      >
        <div className="text-center text-muted-foreground p-8">
          <HugeiconsIcon icon={Image01Icon} size={48} className="mx-auto mb-4 opacity-50" />
          <p>{t("gallery.noImages")}</p>
        </div>
      </div>
    );
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") handlePrevious();
    if (e.key === "ArrowRight") handleNext();
    if (e.key === "Escape") setLightboxOpen(false);
  };

  // Hollywood layout: Main image on left (60%), 2x2 grid on right (40%)
  const mainImage = images[0];
  const gridImages = images.slice(1, 5);
  const remainingCount = images.length - 5;

  return (
    <>
      <div className={cn("relative rounded-xl overflow-hidden", className)}>
        {/* Hollywood Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-1 h-full">
          {/* Main Image - 60% */}
          <div
            className="lg:col-span-3 relative h-[280px] sm:h-[320px] lg:h-[420px] cursor-pointer group"
            onClick={() => {
              setCurrentIndex(0);
              setLightboxOpen(true);
            }}
          >
            <Image
              src={mainImage}
              alt={`${title} - Main`}
              fill
              className="object-cover transition-transform group-hover:scale-[1.02]"
              sizes="(max-width: 1024px) 100vw, 60vw"
              priority
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>

          {/* Grid Images - 40% */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-1 h-[140px] sm:h-[160px] lg:h-[420px]">
            {gridImages.map((image, index) => (
              <div
                key={index}
                className="relative cursor-pointer group overflow-hidden"
                onClick={() => {
                  setCurrentIndex(index + 1);
                  setLightboxOpen(true);
                }}
              >
                <Image
                  src={image}
                  alt={`${title} - ${index + 2}`}
                  fill
                  className="object-cover transition-transform group-hover:scale-[1.05]"
                  sizes="(max-width: 1024px) 25vw, 20vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

                {/* Show remaining count on last grid image */}
                {index === 3 && remainingCount > 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-lg font-semibold">
                      +{remainingCount} {t("gallery.more")}
                    </span>
                  </div>
                )}
              </div>
            ))}

            {/* Fill empty grid spots if fewer than 4 additional images */}
            {gridImages.length < 4 &&
              Array.from({ length: 4 - gridImages.length }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="relative bg-muted flex items-center justify-center"
                >
                  <HugeiconsIcon
                    icon={Image01Icon}
                    size={24}
                    className="text-muted-foreground/30"
                  />
                </div>
              ))}
          </div>
        </div>

        {/* View All Photos Button */}
        {images.length > 1 && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute bottom-4 right-4 shadow-lg"
            onClick={() => {
              setCurrentIndex(0);
              setLightboxOpen(true);
            }}
          >
            <HugeiconsIcon icon={GridViewIcon} size={16} className="me-2" />
            {t("gallery.viewAll")} ({images.length})
          </Button>
        )}
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none"
          onKeyDown={handleKeyDown}
        >
          <DialogTitle className="sr-only">{title} - {t("gallery.title")}</DialogTitle>

          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/10"
            onClick={() => setLightboxOpen(false)}
          >
            <HugeiconsIcon icon={Cancel01Icon} size={24} />
          </Button>

          {/* Main Image */}
          <div className="relative w-full h-[80vh] flex items-center justify-center">
            <Image
              src={images[currentIndex]}
              alt={`${title} - ${currentIndex + 1}`}
              fill
              className="object-contain"
              sizes="95vw"
              priority
            />
          </div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 h-12 w-12"
                onClick={handlePrevious}
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={28} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 h-12 w-12"
                onClick={handleNext}
              >
                <HugeiconsIcon icon={ArrowRight01Icon} size={28} />
              </Button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto px-4 py-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  className={cn(
                    "relative w-16 h-12 rounded overflow-hidden flex-shrink-0 transition-all",
                    index === currentIndex
                      ? "ring-2 ring-white opacity-100"
                      : "opacity-50 hover:opacity-75"
                  )}
                  onClick={() => setCurrentIndex(index)}
                >
                  <Image
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
