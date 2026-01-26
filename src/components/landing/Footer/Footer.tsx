"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Twitter, Linkedin, Github, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

interface FooterProps {
  className?: string;
}

interface FooterLinkGroup {
  titleKey: string;
  links: { labelKey: string; href: string }[];
}

// ============================================================================
// Data
// ============================================================================

const linkGroups: FooterLinkGroup[] = [
  {
    titleKey: "platform.title",
    links: [
      { labelKey: "platform.features", href: "#features" },
      { labelKey: "platform.howItWorks", href: "#how-it-works" },
      { labelKey: "platform.forInvestors", href: "/investors" },
      { labelKey: "platform.forProviders", href: "/providers" },
    ],
  },
  {
    titleKey: "company.title",
    links: [
      { labelKey: "company.about", href: "/about" },
      { labelKey: "company.contact", href: "#contact" },
      { labelKey: "company.careers", href: "/careers" },
    ],
  },
  {
    titleKey: "legal.title",
    links: [
      { labelKey: "legal.privacy", href: "/privacy" },
      { labelKey: "legal.terms", href: "/terms" },
    ],
  },
];

const socialLinks = [
  { platform: "twitter", icon: Twitter, href: "https://twitter.com/reosapp" },
  { platform: "linkedin", icon: Linkedin, href: "https://linkedin.com/company/reos" },
  { platform: "github", icon: Github, href: "https://github.com/reos" },
];

// ============================================================================
// Footer Logo
// ============================================================================

function FooterLogo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2">
      {/* Geometric logo mark */}
      <div className="relative w-8 h-8">
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          aria-hidden="true"
        >
          <path
            d="M20 2L36 11V29L20 38L4 29V11L20 2Z"
            className="fill-landing-primary"
          />
          <path
            d="M20 8L30 14V26L20 32L10 26V14L20 8Z"
            className="fill-landing-accent"
          />
          <circle cx="20" cy="20" r="4" className="fill-white" />
        </svg>
      </div>
      <span className="font-display text-2xl tracking-wider text-landing-text">
        REOS
      </span>
    </Link>
  );
}

// ============================================================================
// Footer Link Column
// ============================================================================

function FooterLinkColumn({
  titleKey,
  links,
  t,
}: FooterLinkGroup & { t: ReturnType<typeof useTranslations> }) {
  return (
    <div>
      <h3 className="font-semibold text-landing-text mb-4">
        {t(titleKey)}
      </h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.labelKey}>
            <Link
              href={link.href}
              className={cn(
                "text-sm text-muted-foreground",
                "hover:text-landing-primary",
                "transition-colors duration-200"
              )}
            >
              {t(link.labelKey)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================================
// Footer Component
// ============================================================================

export function Footer({ className }: FooterProps) {
  const t = useTranslations("landing.footer");
  const locale = useLocale();
  const shouldReduceMotion = useReducedMotion();

  return (
    <footer
      className={cn(
        "relative bg-card border-t border-border",
        "pt-16 pb-8",
        className
      )}
      role="contentinfo"
    >
      {/* Top diagonal accent */}
      <div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-landing-primary/0 via-landing-primary/30 to-landing-primary/0"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-12 lg:gap-8 mb-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <FooterLogo />
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              {t("description")}
            </p>

            {/* Contact info */}
            <div className="mt-6 space-y-2">
              <a
                href={`mailto:${t("contact.email")}`}
                className={cn(
                  "flex items-center gap-2 text-sm text-muted-foreground",
                  "hover:text-landing-primary transition-colors"
                )}
              >
                <Mail className="w-4 h-4" aria-hidden="true" />
                {t("contact.email")}
              </a>
              <a
                href={`tel:${t("contact.phone").replace(/[^+\d]/g, "")}`}
                className={cn(
                  "flex items-center gap-2 text-sm text-muted-foreground",
                  "hover:text-landing-primary transition-colors"
                )}
              >
                <Phone className="w-4 h-4" aria-hidden="true" />
                {t("contact.phone")}
              </a>
            </div>

            {/* Social links */}
            <div className="mt-6 flex items-center gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.platform}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t(`social.${social.platform}`)}
                    whileHover={shouldReduceMotion ? {} : { scale: 1.1, y: -2 }}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                    className={cn(
                      "w-10 h-10",
                      "flex items-center justify-center",
                      "rounded-full",
                      "bg-landing-primary/10 text-landing-primary",
                      "hover:bg-landing-primary hover:text-white",
                      "transition-colors duration-200"
                    )}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Link columns */}
          {linkGroups.map((group) => (
            <FooterLinkColumn key={group.titleKey} {...group} t={t} />
          ))}
        </div>

        {/* Divider with geometric accent */}
        <div className="relative mb-8">
          <div
            className="h-px bg-gradient-to-r from-transparent via-border to-transparent"
            aria-hidden="true"
          />
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-card"
            aria-hidden="true"
          >
            <div className="w-full h-full rotate-45 border border-landing-primary/30 bg-card" />
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {t("copyright")}
          </p>

          {/* Language switcher hint */}
          <div className="flex items-center gap-4">
            <Link
              href={`/en`}
              className={cn(
                "text-sm",
                locale === "en"
                  ? "text-landing-primary font-medium"
                  : "text-muted-foreground hover:text-landing-primary"
              )}
            >
              English
            </Link>
            <span className="text-muted-foreground/30">|</span>
            <Link
              href={`/he`}
              className={cn(
                "text-sm",
                locale === "he"
                  ? "text-landing-primary font-medium"
                  : "text-muted-foreground hover:text-landing-primary"
              )}
            >
              עברית
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom decorative corners */}
      <div
        className="absolute bottom-0 left-0 w-24 h-24 opacity-20 pointer-events-none"
        aria-hidden="true"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path
            d="M0 100 L0 60 L40 100 Z"
            className="fill-landing-primary"
          />
        </svg>
      </div>
      <div
        className="absolute bottom-0 right-0 w-24 h-24 opacity-20 pointer-events-none"
        aria-hidden="true"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path
            d="M100 100 L100 60 L60 100 Z"
            className="fill-landing-accent"
          />
        </svg>
      </div>
    </footer>
  );
}

export default Footer;
