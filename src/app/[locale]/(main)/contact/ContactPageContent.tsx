"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
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

export function ContactPageContent() {
  const t = useTranslations("contact");
  const [submitted, setSubmitted] = useState(false);
  const [subject, setSubject] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: wire up to backend / email service
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
    <div className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-landing-text">
            {t("title")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Contact info sidebar */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-6 text-landing-text">
                {t("info.title")}
              </h2>
              <p className="text-muted-foreground mb-8">
                {t("info.description")}
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-landing-primary/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-landing-primary" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-medium text-landing-text">{t("info.email.label")}</h3>
                  <a
                    href="mailto:hello@reos.co"
                    className="text-muted-foreground hover:text-landing-primary transition-colors"
                  >
                    hello@reos.co
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-landing-primary/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-landing-primary" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-medium text-landing-text">{t("info.phone.label")}</h3>
                  <a
                    href="tel:+972-3-000-0000"
                    className="text-muted-foreground hover:text-landing-primary transition-colors"
                  >
                    +972-3-000-0000
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-landing-primary/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-landing-primary" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-medium text-landing-text">{t("info.office.label")}</h3>
                  <p className="text-muted-foreground">{t("info.office.address")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-landing-primary/10 bg-card p-6 md:p-8 shadow-sm">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-landing-primary/10 flex items-center justify-center mb-6">
                    <CheckCircle className="w-8 h-8 text-landing-primary" aria-hidden="true" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2 text-landing-text">
                    {t("form.success.title")}
                  </h3>
                  <p className="text-muted-foreground max-w-md">
                    {t("form.success.description")}
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6"
                    onClick={() => setSubmitted(false)}
                  >
                    {t("form.success.sendAnother")}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="contact-name">{t("form.name.label")}</Label>
                      <Input
                        id="contact-name"
                        name="name"
                        placeholder={t("form.name.placeholder")}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-email">{t("form.email.label")}</Label>
                      <Input
                        id="contact-email"
                        name="email"
                        type="email"
                        placeholder={t("form.email.placeholder")}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="contact-phone">{t("form.phone.label")}</Label>
                      <Input
                        id="contact-phone"
                        name="phone"
                        type="tel"
                        placeholder={t("form.phone.placeholder")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-subject">{t("form.subject.label")}</Label>
                      <Select value={subject} onValueChange={setSubject} required>
                        <SelectTrigger id="contact-subject" className="w-full">
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
                    <Label htmlFor="contact-message">{t("form.message.label")}</Label>
                    <Textarea
                      id="contact-message"
                      name="message"
                      placeholder={t("form.message.placeholder")}
                      className="min-h-[140px]"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-landing-primary hover:bg-landing-primary/90 text-white"
                  >
                    <Send className="w-4 h-4" aria-hidden="true" />
                    {t("form.submit")}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
