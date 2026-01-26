"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ============================================================================
// Types
// ============================================================================

interface NavLink {
  href: string;
  labelKey: string;
}

interface LandingNavProps {
  className?: string;
}

// ============================================================================
// Data
// ============================================================================

const navLinks: NavLink[] = [
  { href: "#features", labelKey: "features" },
  { href: "#testimonials", labelKey: "testimonials" },
  { href: "#contact", labelKey: "contact" },
];

// ============================================================================
// Animation Variants
// ============================================================================

const navVariants = {
  hidden: {
    y: -100,
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

const mobileMenuVariants = {
  closed: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.3,
      ease: "easeInOut" as const,
    },
  },
  open: {
    opacity: 1,
    height: "auto",
    transition: {
      duration: 0.3,
      ease: "easeInOut" as const,
    },
  },
};

// ============================================================================
// Logo Component
// ============================================================================

function Logo({ scrolled }: { scrolled: boolean }) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2 transition-colors duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-landing-primary focus-visible:ring-offset-2"
      )}
      aria-label="REOS - Return to home"
    >
      {/* Geometric logo mark */}
      <div
        className={cn(
          "relative w-8 h-8 sm:w-10 sm:h-10",
          "transition-all duration-300"
        )}
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          aria-hidden="true"
        >
          {/* Hexagonal shape */}
          <path
            d="M20 2L36 11V29L20 38L4 29V11L20 2Z"
            className={cn(
              "transition-colors duration-300",
              scrolled ? "fill-landing-primary" : "fill-landing-primary"
            )}
          />
          {/* Inner geometric accent */}
          <path
            d="M20 8L30 14V26L20 32L10 26V14L20 8Z"
            className={cn(
              "transition-colors duration-300",
              scrolled ? "fill-landing-accent" : "fill-landing-accent"
            )}
          />
          {/* Center dot */}
          <circle
            cx="20"
            cy="20"
            r="4"
            className={cn(
              "transition-colors duration-300",
              scrolled ? "fill-white" : "fill-white"
            )}
          />
        </svg>
      </div>
      {/* Logo text */}
      <span
        className={cn(
          "font-display text-2xl sm:text-3xl tracking-wider",
          "transition-colors duration-300",
          scrolled ? "text-landing-text" : "text-landing-text"
        )}
      >
        REOS
      </span>
    </Link>
  );
}

// ============================================================================
// Desktop Navigation Links
// ============================================================================

function DesktopNavLinks({ scrolled }: { scrolled: boolean }) {
  const t = useTranslations("landing.nav");

  return (
    <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
      {navLinks.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className={cn(
            "relative px-4 py-2 text-sm font-medium",
            "transition-colors duration-200",
            "hover:text-landing-primary",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-landing-primary focus-visible:ring-offset-2",
            scrolled ? "text-landing-text/80" : "text-landing-text/80"
          )}
        >
          {t(link.labelKey)}
          {/* Hover underline accent */}
          <span
            className={cn(
              "absolute bottom-0 left-4 right-4 h-0.5",
              "bg-landing-accent",
              "origin-left scale-x-0 transition-transform duration-200",
              "group-hover:scale-x-100"
            )}
            aria-hidden="true"
          />
        </a>
      ))}
    </nav>
  );
}

// ============================================================================
// Mobile Navigation
// ============================================================================

function MobileNav({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("landing.nav");
  const locale = useLocale();
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={shouldReduceMotion ? {} : mobileMenuVariants}
      initial="closed"
      animate={isOpen ? "open" : "closed"}
      className="lg:hidden overflow-hidden"
    >
      <nav
        className="flex flex-col py-4 border-t border-landing-primary/10"
        aria-label="Mobile navigation"
      >
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={onClose}
            className={cn(
              "px-4 py-3 text-base font-medium",
              "text-landing-text/80 hover:text-landing-primary",
              "hover:bg-landing-primary/5",
              "transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-landing-primary"
            )}
          >
            {t(link.labelKey)}
          </a>
        ))}
        <div className="flex flex-col gap-2 px-4 pt-4 mt-2 border-t border-landing-primary/10">
          <Button
            variant="outline"
            className="w-full justify-center border-landing-primary text-landing-primary hover:bg-landing-primary/10"
            asChild
          >
            <Link href={`/${locale}/sign-in`}>{t("signIn")}</Link>
          </Button>
          <Button
            className="w-full justify-center bg-landing-primary text-white hover:bg-landing-primary/90"
            asChild
          >
            <a href="#contact">{t("getStarted")}</a>
          </Button>
        </div>
      </nav>
    </motion.div>
  );
}

// ============================================================================
// CTA Buttons
// ============================================================================

function CTAButtons({ scrolled }: { scrolled: boolean }) {
  const t = useTranslations("landing.nav");
  const locale = useLocale();

  return (
    <div className="hidden lg:flex items-center gap-3">
      <Button
        variant="ghost"
        className={cn(
          "text-landing-text/80 hover:text-landing-primary hover:bg-landing-primary/10",
          "transition-colors duration-200"
        )}
        asChild
      >
        <Link href={`/${locale}/sign-in`}>{t("signIn")}</Link>
      </Button>
      <Button
        className={cn(
          "bg-landing-primary text-white hover:bg-landing-primary/90",
          "clip-corner-cut-tr",
          "transition-all duration-200"
        )}
        asChild
      >
        <a href="#contact">{t("getStarted")}</a>
      </Button>
    </div>
  );
}

// ============================================================================
// LandingNav Component
// ============================================================================

export function LandingNav({ className }: LandingNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const shouldReduceMotion = useReducedMotion();

  // Track scroll position for styling changes
  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 50);
  });

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <motion.header
      variants={shouldReduceMotion ? {} : navVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "transition-all duration-300",
        scrolled
          ? "bg-background/95 backdrop-blur-md shadow-sm border-b border-border/50"
          : "bg-transparent",
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-18 lg:h-20 items-center justify-between">
          {/* Logo */}
          <Logo scrolled={scrolled} />

          {/* Desktop Navigation */}
          <DesktopNavLinks scrolled={scrolled} />

          {/* CTA Buttons (Desktop) */}
          <CTAButtons scrolled={scrolled} />

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={cn(
              "lg:hidden p-2 -me-2",
              "text-landing-text hover:text-landing-primary",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-landing-primary focus-visible:ring-offset-2",
              "transition-colors duration-200"
            )}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" aria-hidden="true" />
            ) : (
              <Menu className="w-6 h-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div id="mobile-nav">
          <MobileNav
            isOpen={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
          />
        </div>
      </div>
    </motion.header>
  );
}

export default LandingNav;
