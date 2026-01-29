"use client";

import { useRef } from "react";
import { motion, type Variants, useInView, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import Script from "next/script";
import { Link } from "@/i18n/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface FAQProps {
  className?: string;
}

interface FAQQuestion {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function FAQ({ className }: FAQProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const shouldReduceMotion = useReducedMotion();
  const t = useTranslations("landing.faq");

  // Build question arrays from translations
  // Use t.raw() to get the raw object for iteration
  const investorQuestions = t.raw("investors.questions") as FAQQuestion[];
  const providerQuestions = t.raw("providers.questions") as FAQQuestion[];

  // Build JSON-LD structured data from all questions
  const allQuestions = [...investorQuestions, ...providerQuestions];
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allQuestions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };

  // Group questions by category for display
  const groupByCategory = (questions: FAQQuestion[]) => {
    const groups: Record<string, FAQQuestion[]> = {};
    for (const q of questions) {
      if (!groups[q.category]) groups[q.category] = [];
      groups[q.category].push(q);
    }
    return groups;
  };

  const investorGroups = groupByCategory(investorQuestions);
  const providerGroups = groupByCategory(providerQuestions);

  // Render a category group of questions
  const renderCategoryGroup = (
    categoryKey: string,
    questions: FAQQuestion[],
    audienceKey: "investors" | "providers"
  ) => (
    <div key={categoryKey} className="mb-6 last:mb-0">
      <h3 className="text-sm font-medium text-foreground/40 uppercase tracking-wider mb-3">
        {t(`${audienceKey}.categories.${categoryKey}`)}
      </h3>
      <Accordion type="multiple" className="w-full">
        {questions.map((q) => (
          <AccordionItem key={q.id} value={q.id}>
            <AccordionTrigger className="text-base font-medium text-start">
              {q.question}
            </AccordionTrigger>
            <AccordionContent className="text-foreground/60 leading-relaxed">
              {q.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );

  return (
    <>
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <motion.section
        ref={ref}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={shouldReduceMotion ? undefined : fadeInUp}
        className={cn("py-20 md:py-24 border-t border-border/50", className)}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Heading */}
          <h2 className="text-4xl md:text-6xl font-light tracking-tighter text-foreground mb-10 text-center">
            {t("heading")}
          </h2>

          {/* Audience Tabs */}
          <Tabs defaultValue="investors" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList>
                <TabsTrigger value="investors">{t("tabs.investors")}</TabsTrigger>
                <TabsTrigger value="providers">{t("tabs.providers")}</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="investors">
              {Object.entries(investorGroups).map(([category, questions]) =>
                renderCategoryGroup(category, questions, "investors")
              )}
            </TabsContent>

            <TabsContent value="providers">
              {Object.entries(providerGroups).map(([category, questions]) =>
                renderCategoryGroup(category, questions, "providers")
              )}
            </TabsContent>
          </Tabs>
        </div>
      </motion.section>
    </>
  );
}
