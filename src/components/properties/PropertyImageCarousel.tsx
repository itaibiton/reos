"use client";

import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { Home01Icon } from "@hugeicons/core-free-icons";

interface PropertyImageCarouselProps {
  images: string[];
  title: string;
  className?: string;
}

export function PropertyImageCarousel({
  images,
  title,
  className,
}: PropertyImageCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Handle empty or undefined images array
  const hasImages = images && images.length > 0;

  // Fallback placeholder when no images provided
  if (!hasImages) {
    return (
      <div
        className={cn(
          "aspect-video bg-muted rounded-lg flex items-center justify-center text-muted-foreground",
          className
        )}
      >
        <HugeiconsIcon icon={Home01Icon} size={64} strokeWidth={1.5} />
      </div>
    );
  }

  // Single image - no carousel needed
  if (images.length === 1) {
    return (
      <div className={cn("aspect-video bg-muted rounded-lg overflow-hidden", className)}>
        <img
          src={images[0]}
          alt={title}
          className="object-cover w-full h-full"
        />
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <Carousel
        setApi={setApi}
        opts={{
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-0">
          {images.map((image, index) => (
            <CarouselItem key={index} className="pl-0">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <img
                  src={image}
                  alt={`${title} - Image ${index + 1}`}
                  className="object-cover w-full h-full transition-opacity duration-300"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation buttons inside the image */}
        <CarouselPrevious
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90 border-0"
        />
        <CarouselNext
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90 border-0"
        />
      </Carousel>

      {/* Thumbnail row below the carousel */}
      <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={cn(
              "flex-shrink-0 w-16 h-12 rounded overflow-hidden transition-all duration-200",
              index === current
                ? "ring-2 ring-primary ring-offset-2"
                : "opacity-60 hover:opacity-100"
            )}
            aria-label={`Go to image ${index + 1}`}
          >
            <img
              src={image}
              alt={`${title} - Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
