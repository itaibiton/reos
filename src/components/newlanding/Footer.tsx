"use client";

import { motion, type Variants } from "framer-motion";
import { Camera, Twitter, Github } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function Footer({ className }: FooterProps) {
  const t = useTranslations("landing.footer");
  const currentYear = new Date().getFullYear();

  const productLinks = [
    { label: t("product.pricing"), href: "/pricing" },
    { label: t("product.services"), href: "/services" },
  ];

  const solutionsLinks = [
    { label: t("solutions.brokers"), href: "/services/broker" },
    { label: t("solutions.lawyers"), href: "/services/lawyer" },
    { label: t("solutions.mortgageAdvisors"), href: "/services/mortgage-advisor" },
    { label: t("solutions.allServices"), href: "/services" },
  ];

  const companyLinks = [
    { label: t("company.contact"), href: "/contact" },
  ];

  const legalLinks = [
    { label: t("legal.privacy"), href: "/privacy" },
    { label: t("legal.terms"), href: "/terms" },
  ];

  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInUp}
      className={cn("bg-card border-t border-border/50 py-16", className)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10 mb-16">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 rounded bg-foreground/10 flex items-center justify-center text-foreground text-xs">
                R
              </div>
              <span className="font-normal text-sm tracking-widest text-foreground/90">{t("logo")}</span>
            </Link>
            <p className="text-sm text-muted-foreground font-light max-w-xs">
              {t("tagline")}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-foreground mb-4 uppercase tracking-wider">{t("sections.product")}</h4>
            <ul className="space-y-3 text-sm text-foreground/50 font-light">
              {productLinks.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-foreground mb-4 uppercase tracking-wider">{t("sections.solutions")}</h4>
            <ul className="space-y-3 text-sm text-foreground/50 font-light">
              {solutionsLinks.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-foreground mb-4 uppercase tracking-wider">{t("sections.company")}</h4>
            <ul className="space-y-3 text-sm text-foreground/50 font-light">
              {companyLinks.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-foreground mb-4 uppercase tracking-wider">{t("sections.legal")}</h4>
            <ul className="space-y-3 text-sm text-foreground/50 font-light">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border/50">
          <p className="text-xs text-muted-foreground/75 mb-4 md:mb-0">
            {t("copyright", { year: currentYear })}
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-muted-foreground/75 hover:text-foreground transition-colors">
              <Camera className="w-5 h-5" />
            </a>
            <a href="#" className="text-muted-foreground/75 hover:text-foreground transition-colors">
              <Twitter className="w-[18px] h-[18px]" />
            </a>
            <a href="#" className="text-muted-foreground/75 hover:text-foreground transition-colors">
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
