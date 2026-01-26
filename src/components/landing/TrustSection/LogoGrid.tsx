"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "../shared/animations";

// ============================================================================
// Types
// ============================================================================

interface Logo {
  name: string;
  svg: string;
}

// ============================================================================
// Placeholder Logos
// ============================================================================

// TODO: Replace with real partner/media logos
const placeholderLogos: Logo[] = [
  {
    name: "Partner 1",
    svg: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 60'%3E%3Crect fill='%23e5e7eb' width='120' height='60' rx='4'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='sans-serif' font-size='12' font-weight='600'%3EPartner 1%3C/text%3E%3C/svg%3E`,
  },
  {
    name: "Partner 2",
    svg: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 60'%3E%3Crect fill='%23e5e7eb' width='120' height='60' rx='4'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='sans-serif' font-size='12' font-weight='600'%3EPartner 2%3C/text%3E%3C/svg%3E`,
  },
  {
    name: "Partner 3",
    svg: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 60'%3E%3Crect fill='%23e5e7eb' width='120' height='60' rx='4'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='sans-serif' font-size='12' font-weight='600'%3EPartner 3%3C/text%3E%3C/svg%3E`,
  },
  {
    name: "Partner 4",
    svg: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 60'%3E%3Crect fill='%23e5e7eb' width='120' height='60' rx='4'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='sans-serif' font-size='12' font-weight='600'%3EPartner 4%3C/text%3E%3C/svg%3E`,
  },
  {
    name: "Partner 5",
    svg: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 60'%3E%3Crect fill='%23e5e7eb' width='120' height='60' rx='4'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='sans-serif' font-size='12' font-weight='600'%3EPartner 5%3C/text%3E%3C/svg%3E`,
  },
  {
    name: "Partner 6",
    svg: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 60'%3E%3Crect fill='%23e5e7eb' width='120' height='60' rx='4'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='sans-serif' font-size='12' font-weight='600'%3EPartner 6%3C/text%3E%3C/svg%3E`,
  },
];

// ============================================================================
// LogoGrid Component
// ============================================================================

export function LogoGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 items-center">
      {placeholderLogos.map((logo, index) => (
        <motion.div
          key={logo.name}
          variants={fadeInUp}
          custom={index}
          className="flex items-center justify-center"
        >
          <img
            src={logo.svg}
            alt={logo.name}
            className="w-full h-auto max-w-[120px] grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
          />
        </motion.div>
      ))}
    </div>
  );
}

export default LogoGrid;
