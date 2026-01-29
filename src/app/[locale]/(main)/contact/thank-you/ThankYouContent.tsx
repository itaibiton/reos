"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, Home, Mail } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const scaleIn = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      delay: 0.2,
      type: "spring" as const,
      stiffness: 200
    }
  },
};

export function ThankYouContent() {
  const t = useTranslations("contact.thankYou");
  const params = useParams();
  const locale = params.locale as string;

  return (
    <div>
      {/* Dark hero section with thank-you message */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="bg-[#050A12] py-32 md:py-40"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Checkmark icon */}
          <motion.div
            variants={scaleIn}
            className="w-20 h-20 mx-auto mb-8 rounded-full bg-white/10 flex items-center justify-center"
          >
            <CheckCircle className="w-12 h-12 text-white" aria-hidden="true" />
          </motion.div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-light tracking-tighter text-white mb-6">
            {t("title")}
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-white/60 font-light max-w-2xl mx-auto leading-relaxed mb-12">
            {t("description")}
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`/${locale}`}
              className="inline-flex items-center gap-2 px-8 py-3 text-sm font-medium bg-white text-[#050A12] rounded-full hover:bg-white/90 transition-colors"
            >
              <Home className="w-4 h-4" aria-hidden="true" />
              {t("backToHome")}
            </Link>
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center gap-2 px-8 py-3 text-sm font-medium border border-white/20 text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <Mail className="w-4 h-4" aria-hidden="true" />
              {t("sendAnother")}
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
