"use client";

import { motion, type Variants } from "framer-motion";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

interface TestimonialData {
  id: string;
  logo: string;
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function Testimonials({ className }: { className?: string }) {
  const t = useTranslations("landing.testimonials");

  const testimonialsData: TestimonialData[] = [
    { id: "client1", logo: "/logos/testimonials/client1.svg" },
    { id: "client2", logo: "/logos/testimonials/client2.svg" },
    { id: "client3", logo: "/logos/testimonials/client3.svg" },
    { id: "client4", logo: "/logos/testimonials/client4.svg" },
    { id: "client5", logo: "/logos/testimonials/client5.svg" },
  ];

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInUp}
      className={cn("py-20 md:py-24 border-t border-border/50 relative", className)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div variants={fadeInUp} className="max-w-3xl mb-12">
          <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-foreground mb-4">
            {t("heading")} <br />
            <span className="text-foreground/40">{t("headingAccent")}</span>
          </h2>
          <p className="text-lg text-foreground/50 font-light leading-relaxed">
            {t("subheading")}
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative pb-20 sm:pb-24 lg:pb-0">
          {/* Edge gradients */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none hidden md:block" />

          <Carousel
            opts={{
              loop: true,
              align: "start",
            }}
            className="w-full"
          >
            <CarouselContent className="-ms-0">
              {testimonialsData.map((item) => (
                <CarouselItem
                  key={item.id}
                  className="ps-0 basis-full md:basis-1/2 lg:basis-1/3"
                >
                  <motion.div
                    whileHover={{
                      scale: 1.02,
                      y: -4,
                      transition: { duration: 0.2, ease: "easeOut" }
                    }}
                    className="h-full min-h-[280px] p-6 border border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg hover:border-border/70 transition-all flex flex-col"
                  >
                    {/* Company Logo */}
                    <div className="h-12 mb-6 flex items-center">
                      <Image
                        src={item.logo}
                        alt={`${t(`items.${item.id}.author`)} company logo`}
                        width={120}
                        height={48}
                        className="max-h-full w-auto object-contain grayscale opacity-60"
                      />
                    </div>

                    {/* Quote */}
                    <blockquote className="flex-1 mb-6">
                      <p className="text-base leading-relaxed text-foreground/80">
                        "{t(`items.${item.id}.quote`)}"
                      </p>
                    </blockquote>

                    {/* Attribution */}
                    <cite className="not-italic">
                      <div className="text-sm font-semibold text-foreground">
                        {t(`items.${item.id}.author`)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {t(`items.${item.id}.position`)}
                      </div>
                    </cite>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselNext className="flex absolute bottom-auto top-[calc(100%+1.5rem)] right-0 translate-y-0 bg-foreground text-background hover:bg-foreground/90 hover:text-background border-0 rounded-none" />
          </Carousel>
        </div>
      </div>
    </motion.section>
  );
}
