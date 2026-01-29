"use client";

import { Suspense, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { motion, type Variants } from "framer-motion";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

// Subject enum matching Convex schema
const subjectEnum = ["general", "pricing", "support", "partnerships", "provider"] as const;
type Subject = (typeof subjectEnum)[number];

// Zod schema
const contactFormSchema = z.object({
  name: z.string().min(2, "nameMin"),
  email: z.string().email("emailInvalid"),
  phone: z.string().optional(),
  subject: z.enum(subjectEnum).refine((val) => val !== undefined, {
    message: "subjectRequired",
  }),
  message: z.string().min(1, "messageRequired"),
  honeypot: z.string().max(0), // Honeypot must be empty
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

// Skeleton for Suspense fallback
function ContactPageSkeleton() {
  return (
    <div className="animate-pulse">
      <section className="bg-[#050A12] py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="h-12 bg-white/10 rounded-lg mb-6 max-w-md mx-auto"></div>
          <div className="h-6 bg-white/10 rounded-lg max-w-2xl mx-auto"></div>
        </div>
      </section>
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            <div className="lg:col-span-2 space-y-8">
              <div className="h-8 bg-gray-200 rounded-lg w-48"></div>
              <div className="h-20 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="lg:col-span-3">
              <div className="h-96 bg-gray-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Inner component that uses useSearchParams
function ContactPageInner() {
  const t = useTranslations("contact");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const searchParams = useSearchParams();
  const subjectParam = searchParams.get("subject");

  const submitContact = useMutation(api.contactSubmissions.submit);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: undefined,
      message: "",
      honeypot: "",
    },
  });

  const { isSubmitting } = form.formState;

  // Pre-select subject from URL parameter
  useEffect(() => {
    if (subjectParam && subjectEnum.includes(subjectParam as Subject)) {
      form.setValue("subject", subjectParam as Subject);
    }
  }, [subjectParam, form]);

  async function onSubmit(values: ContactFormValues) {
    try {
      await submitContact({
        name: values.name,
        email: values.email,
        phone: values.phone || undefined,
        subject: values.subject,
        message: values.message,
      });

      // Redirect to thank-you page after successful submission
      router.push(`/${locale}/contact/thank-you`);
    } catch (error) {
      console.error("Failed to submit contact form:", error);
      form.setError("root", {
        message: t("form.errors.submitFailed"),
      });
    }
  }

  const subjectOptions: { value: Subject; label: string }[] = [
    { value: "general", label: t("form.subjects.general") },
    { value: "pricing", label: t("form.subjects.pricing") },
    { value: "support", label: t("form.subjects.support") },
    { value: "partnerships", label: t("form.subjects.partnerships") },
    { value: "provider", label: t("form.subjects.provider") },
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
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Name & Email Row */}
                    <div className="grid sm:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#050A12]">
                              {t("form.name.label")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t("form.name.placeholder")}
                                className="rounded-lg border-gray-200"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage>
                              {form.formState.errors.name?.message &&
                                t(`form.errors.${form.formState.errors.name.message}`)}
                            </FormMessage>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#050A12]">
                              {t("form.email.label")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder={t("form.email.placeholder")}
                                className="rounded-lg border-gray-200"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage>
                              {form.formState.errors.email?.message &&
                                t(`form.errors.${form.formState.errors.email.message}`)}
                            </FormMessage>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Phone & Subject Row */}
                    <div className="grid sm:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#050A12]">
                              {t("form.phone.label")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="tel"
                                placeholder={t("form.phone.placeholder")}
                                className="rounded-lg border-gray-200"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#050A12]">
                              {t("form.subject.label")}
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full rounded-lg border-gray-200">
                                  <SelectValue placeholder={t("form.subject.placeholder")} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {subjectOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage>
                              {form.formState.errors.subject?.message &&
                                t(`form.errors.${form.formState.errors.subject.message}`)}
                            </FormMessage>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Message */}
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#050A12]">
                            {t("form.message.label")}
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t("form.message.placeholder")}
                              className="min-h-[140px] rounded-lg border-gray-200"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage>
                            {form.formState.errors.message?.message &&
                              t(`form.errors.${form.formState.errors.message.message}`)}
                          </FormMessage>
                        </FormItem>
                      )}
                    />

                    {/* Honeypot field - hidden from real users */}
                    <FormField
                      control={form.control}
                      name="honeypot"
                      render={({ field }) => (
                        <FormItem
                          style={{
                            position: "absolute",
                            left: "-9999px",
                          }}
                        >
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              tabIndex={-1}
                              autoComplete="off"
                              aria-hidden="true"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Root Error */}
                    {form.formState.errors.root && (
                      <p className="text-sm text-destructive text-center">
                        {form.formState.errors.root.message}
                      </p>
                    )}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-2 px-8 py-3 text-sm font-medium bg-[#050A12] text-white rounded-full hover:bg-[#050A12]/90 transition-colors"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                          {t("form.submitting")}
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" aria-hidden="true" />
                          {t("form.submit")}
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Outer component with Suspense wrapper
export function ContactPageContent() {
  return (
    <Suspense fallback={<ContactPageSkeleton />}>
      <ContactPageInner />
    </Suspense>
  );
}
