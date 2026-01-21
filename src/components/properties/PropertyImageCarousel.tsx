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
  variant?: "default" | "hero";
}

export function PropertyImageCarousel({
  images,
  title,
  className,
  variant = "default",
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

  const isHero = variant === "hero";

  // Container styles based on variant
  const containerStyles = isHero
    ? "h-full"
    : "aspect-video";

  const imageContainerStyles = isHero
    ? "h-full"
    : "aspect-video";

  // Fallback placeholder when no images provided
  if (!hasImages) {
    return (
      <div
        className={cn(
          "bg-muted flex items-center justify-center text-muted-foreground",
          containerStyles,
          !isHero && "rounded-lg",
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
      <div
        className={cn(
          "bg-muted overflow-hidden",
          containerStyles,
          !isHero && "rounded-lg",
          className
        )}
      >
        <img
          src={images[0]}
          alt={title}
          className="object-cover w-full h-full"
        />
      </div>
    );
  }

  return (
    <div className={cn("relative flex flex-col", isHero && "h-full", className)}>
      <Carousel
        setApi={setApi}
        opts={{
          loop: true,
        }}
        className={cn("w-full", isHero && "flex-1")}
      >
        <CarouselContent className={cn("-ms-0", isHero && "h-full")}>
          {images.map((image, index) => (
            <CarouselItem key={index} className={cn("ps-0", isHero && "h-full")}>
              <div
                className={cn(
                  "bg-muted overflow-hidden",
                  imageContainerStyles,
                  !isHero && "rounded-lg"
                )}
              >
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
          className="absolute start-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90 border-0 transition-opacity"
        />
        <CarouselNext
          className="absolute end-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90 border-0 transition-opacity"
        />
      </Carousel>

      {/* Thumbnail row - positioned differently for hero variant */}
      <div
        className={cn(
          "flex gap-2 overflow-x-auto pb-1",
          isHero
            ? "absolute bottom-4 left-1/2 -translate-x-1/2 w-fit max-w-[calc(100%-2rem)] bg-background/60 backdrop-blur-sm rounded-lg p-2"
            : "justify-center mt-4 pt-2"
        )}
      >
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={cn(
              "flex-shrink-0 rounded overflow-hidden transition-all duration-200",
              isHero ? "w-12 h-9" : "w-16 h-12",
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
