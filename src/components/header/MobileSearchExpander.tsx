"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";

interface MobileSearchExpanderProps {
  onOpenSearch: () => void;
}

export function MobileSearchExpander({
  onOpenSearch,
}: MobileSearchExpanderProps) {
  const t = useTranslations("search");
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    setIsAnimating(true);
  };

  return (
    <div className="md:hidden">
      <AnimatePresence mode="wait">
        {!isAnimating ? (
          <motion.div
            key="icon"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleClick}
              aria-label={t("placeholder")}
            >
              <HugeiconsIcon icon={Search01Icon} size={20} strokeWidth={1.5} />
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="expanding"
            initial={{ width: 32, opacity: 0.5 }}
            animate={{ width: 160, opacity: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onAnimationComplete={() => {
              setIsAnimating(false);
              onOpenSearch();
            }}
            className="h-8 bg-muted rounded-md flex items-center justify-center"
          >
            <HugeiconsIcon
              icon={Search01Icon}
              size={16}
              strokeWidth={1.5}
              className="text-muted-foreground"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
