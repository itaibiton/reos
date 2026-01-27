"use client";

import { motion, type Variants } from "framer-motion";
import { Camera, Twitter, Github } from "lucide-react";
import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const productLinks = [
  { label: "Platform", href: "#" },
  { label: "Data API", href: "#" },
  { label: "Workflows", href: "#" },
  { label: "Security", href: "#" },
];

const solutionsLinks = [
  { label: "Residential", href: "#" },
  { label: "Commercial", href: "#" },
  { label: "Industrial", href: "#" },
];

const companyLinks = [
  { label: "About", href: "#" },
  { label: "Careers", href: "#" },
  { label: "Blog", href: "#" },
  { label: "Contact", href: "#" },
];

const legalLinks = [
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
  { label: "SLA", href: "#" },
];

export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInUp}
      className={cn("bg-card border-t border-border/50 py-16", className)}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10 mb-16">
          <div className="col-span-2">
            <a href="#" className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 rounded bg-foreground/10 flex items-center justify-center text-foreground text-xs">
                R
              </div>
              <span className="font-normal text-sm tracking-widest text-foreground/90">REOS</span>
            </a>
            <p className="text-sm text-muted-foreground font-light max-w-xs">
              The financial infrastructure for the world's real estate assets.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-foreground mb-4 uppercase tracking-wider">Product</h4>
            <ul className="space-y-3 text-sm text-foreground/50 font-light">
              {productLinks.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-foreground mb-4 uppercase tracking-wider">Solutions</h4>
            <ul className="space-y-3 text-sm text-foreground/50 font-light">
              {solutionsLinks.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-foreground mb-4 uppercase tracking-wider">Company</h4>
            <ul className="space-y-3 text-sm text-foreground/50 font-light">
              {companyLinks.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-foreground mb-4 uppercase tracking-wider">Legal</h4>
            <ul className="space-y-3 text-sm text-foreground/50 font-light">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border/50">
          <p className="text-xs text-muted-foreground/75 mb-4 md:mb-0">
            © {currentYear} REOS Technologies Inc. All rights reserved.
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
