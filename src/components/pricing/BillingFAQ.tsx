"use client";

import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function BillingFAQ() {
  const t = useTranslations("pricing.faq");

  const questions = t.raw("questions") as Array<{
    id: string;
    question: string;
    answer: string;
  }>;

  return (
    <div>
      <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-center mb-8">{t("title")}</h2>
      <Accordion type="multiple">
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
}
