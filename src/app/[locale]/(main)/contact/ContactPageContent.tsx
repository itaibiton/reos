"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, type Variants } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export function ContactPageContent() {
  const t = useTranslations("contact");
  const [submitted, setSubmitted] = useState(false);
  const [subject, setSubject] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  const subjectOptions = [
    { value: "general", label: t("form.subjects.general") },
    { value: "sales", label: t("form.subjects.sales") },
    { value: "support", label: t("form.subjects.support") },
    { value: "partnerships", label: t("form.subjects.partnerships") },
    { value: "media", label: t("form.subjects.media") },
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
          <h1 className="text-4xl md:text-6xl font-light tracking-tighter text-white mb-6">
            {t("title")}
          </h1>
          <p className="text-lg md:text-xl text-white/50 font-light max-w-2xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
        </div>
      </motion.section>

      {/* Content */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Contact info sidebar */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="lg:col-span-2 space-y-8"
            >
              <motion.div variants={fadeInUp}>
                <h2 className="text-2xl font-light tracking-tight text-[#050A12] mb-4">
                  {t("info.title")}
                </h2>
                <p className="text-gray-600 font-light leading-relaxed">
                  {t("info.description")}
                </p>
              </motion.div>

              <div className="space-y-6">
                <motion.div variants={fadeInUp} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-[#050A12]" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-medium text-[#050A12]">{t("info.email.label")}</h3>
                    <a
                      href="mailto:hello@reos.co"
                      className="text-gray-600 hover:text-[#050A12] transition-colors"
                    >
                      hello@reos.co
                    </a>
                  </div>
                </motion.div>

                <motion.div variants={fadeInUp} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-[#050A12]" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-medium text-[#050A12]">{t("info.phone.label")}</h3>
                    <a
                      href="tel:+972-3-000-0000"
                      className="text-gray-600 hover:text-[#050A12] transition-colors"
                    >
                      +972-3-000-0000
                    </a>
                  </div>
                </motion.div>

                <motion.div variants={fadeInUp} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-[#050A12]" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-medium text-[#050A12]">{t("info.office.label")}</h3>
                    <p className="text-gray-600 font-light">{t("info.office.address")}</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Contact form */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="lg:col-span-3"
            >
              <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                      <CheckCircle className="w-8 h-8 text-[#050A12]" aria-hidden="true" />
                    </div>
                    <h3 className="text-2xl font-light tracking-tight text-[#050A12] mb-2">
                      {t("form.success.title")}
                    </h3>
                    <p className="text-gray-600 font-light max-w-md">
                      {t("form.success.description")}
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="mt-6 px-6 py-2.5 text-sm font-medium text-[#050A12] border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                    >
                      {t("form.success.sendAnother")}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="contact-name" className="text-[#050A12]">
                          {t("form.name.label")}
                        </Label>
                        <Input
                          id="contact-name"
                          name="name"
                          placeholder={t("form.name.placeholder")}
                          required
                          className="rounded-lg border-gray-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-email" className="text-[#050A12]">
                          {t("form.email.label")}
                        </Label>
                        <Input
                          id="contact-email"
                          name="email"
                          type="email"
                          placeholder={t("form.email.placeholder")}
                          required
                          className="rounded-lg border-gray-200"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="contact-phone" className="text-[#050A12]">
                          {t("form.phone.label")}
                        </Label>
                        <Input
                          id="contact-phone"
                          name="phone"
                          type="tel"
                          placeholder={t("form.phone.placeholder")}
                          className="rounded-lg border-gray-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-subject" className="text-[#050A12]">
                          {t("form.subject.label")}
                        </Label>
                        <Select value={subject} onValueChange={setSubject} required>
                          <SelectTrigger id="contact-subject" className="w-full rounded-lg border-gray-200">
                            <SelectValue placeholder={t("form.subject.placeholder")} />
                          </SelectTrigger>
                          <SelectContent>
                            {subjectOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact-message" className="text-[#050A12]">
                        {t("form.message.label")}
                      </Label>
                      <Textarea
                        id="contact-message"
                        name="message"
                        placeholder={t("form.message.placeholder")}
                        className="min-h-[140px] rounded-lg border-gray-200"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-2 px-8 py-3 text-sm font-medium bg-[#050A12] text-white rounded-full hover:bg-[#050A12]/90 transition-colors"
                    >
                      <Send className="w-4 h-4" aria-hidden="true" />
                      {t("form.submit")}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
