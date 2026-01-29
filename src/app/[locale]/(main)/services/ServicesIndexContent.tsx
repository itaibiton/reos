"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { motion, type Variants } from "framer-motion";
import {
  Briefcase,
  Landmark,
  Scale,
  Calculator,
  Stamp,
  FileSpreadsheet,
  ClipboardCheck,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

const PROVIDER_TYPES = [
  "broker",
  "mortgage-advisor",
  "lawyer",
  "accountant",
  "notary",
  "tax-consultant",
  "appraiser",
] as const;

const providerIcons: Record<string, LucideIcon> = {
  broker: Briefcase,
  "mortgage-advisor": Landmark,
  lawyer: Scale,
  accountant: Calculator,
  notary: Stamp,
  "tax-consultant": FileSpreadsheet,
  appraiser: ClipboardCheck,
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export function ServicesIndexContent() {
  const t = useTranslations("services");
  const locale = useLocale();

  return (
    <div>
      {/* Dark hero section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="bg-[#050A12] py-24 md:py-32"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-light tracking-tighter text-white mb-6">
            {t("index.title")}
          </h1>
          <p className="text-lg md:text-xl text-white/50 font-light max-w-2xl mx-auto leading-relaxed">
            {t("index.subtitle")}
          </p>
        </div>
      </motion.section>

      {/* Provider cards */}
      <section className="py-20 md:py-28">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROVIDER_TYPES.map((type) => {
              const Icon = providerIcons[type];

              return (
                <motion.div key={type} variants={fadeInUp}>
                  <Link
                    href={`/${locale}/services/${type}`}
                    className="group relative flex flex-col p-8 rounded-2xl bg-white border border-gray-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#050A12] focus-visible:ring-offset-2 h-full"
                  >
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-5">
                      <Icon
                        className="w-5 h-5 text-[#050A12]"
                        aria-hidden="true"
                      />
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-medium tracking-tight text-[#050A12] mb-2">
                      {t(`providers.${type}.name`)}
                    </h2>

                    {/* Short description */}
                    <p className="text-sm text-gray-600 font-light leading-relaxed mb-6 flex-grow">
                      {t(`providers.${type}.shortDescription`)}
                    </p>

                    {/* CTA arrow */}
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#050A12]">
                      {t("index.learnMore")}
                      <ArrowRight
                        className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
