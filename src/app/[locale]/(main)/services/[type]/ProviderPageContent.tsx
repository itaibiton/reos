"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { motion, type Variants } from "framer-motion";
import {
  Briefcase,
  Landmark,
  Scale,
  ClipboardCheck,
  CheckCircle2,
  ArrowRight,
  Rocket,
  PieChart,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

const providerIcons: Record<string, LucideIcon> = {
  broker: Briefcase,
  "mortgage-advisor": Landmark,
  lawyer: Scale,
  appraiser: ClipboardCheck,
  entrepreneur: Rocket,
  "asset-manager": PieChart,
  "financial-advisor": TrendingUp,
};

const roleMap: Record<string, string> = {
  broker: "broker",
  lawyer: "lawyer",
  appraiser: "broker", // No specific appraiser role, default to broker
  "mortgage-advisor": "mortgage_advisor",
  entrepreneur: "investor", // Entrepreneurs sign up as investors
  "asset-manager": "broker", // Asset managers closest to broker role
  "financial-advisor": "broker", // Financial advisors closest to broker role
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

interface ProviderPageContentProps {
  type: string;
}

export function ProviderPageContent({ type }: ProviderPageContentProps) {
  const t = useTranslations(`services.providers.${type}`);
  const tCommon = useTranslations("services.common");
  const locale = useLocale();
  const Icon = providerIcons[type] ?? Briefcase;

  const benefits = [
    { title: t("benefits.0.title"), description: t("benefits.0.description") },
    { title: t("benefits.1.title"), description: t("benefits.1.description") },
    { title: t("benefits.2.title"), description: t("benefits.2.description") },
  ];

  const stats = [
    { value: t("stats.0.value"), label: t("stats.0.label") },
    { value: t("stats.1.value"), label: t("stats.1.label") },
    { value: t("stats.2.value"), label: t("stats.2.label") },
  ];

  const testimonial = {
    quote: t("testimonial.quote"),
    name: t("testimonial.name"),
    role: t("testimonial.role"),
  };

  const steps = [
    { title: t("steps.0.title"), description: t("steps.0.description") },
    { title: t("steps.1.title"), description: t("steps.1.description") },
    { title: t("steps.2.title"), description: t("steps.2.description") },
    { title: t("steps.3.title"), description: t("steps.3.description") },
  ];

  return (
    <div>
      {/* Dark hero */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="bg-[#050A12] py-24 md:py-32"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-8">
            <Icon className="w-7 h-7 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-4xl md:text-6xl font-light tracking-tighter text-white mb-6">
            {t("heroTitle")}
          </h1>
          <p className="text-lg md:text-xl text-white/50 font-light max-w-2xl mx-auto leading-relaxed mb-10">
            {t("heroDescription")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${locale}/sign-up?role=${roleMap[type] || "broker"}`}
              className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium bg-white text-[#050A12] rounded-full hover:bg-white/90 transition-colors"
            >
              {tCommon("ctaSignUp")}
              <ArrowRight className="w-4 h-4 ms-2" aria-hidden="true" />
            </Link>
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium text-white border border-white/20 rounded-full hover:bg-white/5 transition-colors"
            >
              {tCommon("ctaContact")}
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Benefits */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-3xl md:text-4xl font-light tracking-tight text-[#050A12] text-center mb-16"
          >
            {tCommon("benefitsTitle")}
          </motion.h2>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-6"
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group p-8 rounded-2xl bg-white border border-gray-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-5">
                  <CheckCircle2
                    className="w-5 h-5 text-[#050A12]"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-lg font-medium tracking-tight text-[#050A12] mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-gray-600 font-light leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stats */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-6 mb-16"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="p-8 rounded-2xl bg-white border border-gray-200 text-center"
              >
                <div className="text-4xl md:text-5xl font-light tracking-tight text-[#050A12] mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 font-light">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Testimonial */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="max-w-2xl mx-auto text-center"
          >
            <blockquote className="text-lg md:text-xl font-light italic text-gray-600 mb-6">
              &ldquo;{testimonial.quote}&rdquo;
            </blockquote>
            <div className="text-sm font-medium text-[#050A12]">
              {testimonial.name}
            </div>
            <div className="text-sm text-gray-500 font-light">
              {testimonial.role}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-3xl md:text-4xl font-light tracking-tight text-[#050A12] text-center mb-16"
          >
            {tCommon("howItWorksTitle")}
          </motion.h2>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-10"
          >
            {steps.map((step, index) => (
              <motion.div key={index} variants={fadeInUp} className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-[#050A12] flex items-center justify-center text-sm font-medium text-white">
                    {index + 1}
                  </div>
                </div>
                <div className="pt-1">
                  <h3 className="text-lg font-medium tracking-tight text-[#050A12] mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600 font-light leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#050A12] py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-light tracking-tighter text-white mb-4">
              {t("ctaTitle")}
            </h2>
            <p className="text-lg text-white/50 font-light max-w-2xl mx-auto mb-10">
              {t("ctaDescription")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/${locale}/sign-up?role=${roleMap[type] || "broker"}`}
                className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium bg-white text-[#050A12] rounded-full hover:bg-white/90 transition-colors"
              >
                {tCommon("ctaSignUp")}
                <ArrowRight className="w-4 h-4 ms-2" aria-hidden="true" />
              </Link>
              <Link
                href={`/${locale}/services`}
                className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium text-white border border-white/20 rounded-full hover:bg-white/5 transition-colors"
              >
                {tCommon("viewAllServices")}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
