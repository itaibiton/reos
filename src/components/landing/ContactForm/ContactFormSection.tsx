"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "framer-motion";
import { Send, CheckCircle2, Loader2, Mail, User, Phone, MessageSquare, Building2 } from "lucide-react";
import { SectionWrapper, SectionHeader } from "../shared";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

const investorTypes = ["first_time", "experienced", "institutional", "other"] as const;
type InvestorType = (typeof investorTypes)[number];

// ============================================================================
// Schema
// ============================================================================

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Please enter a valid email address"),
  phone: z.string().optional(),
  investorType: z.enum(investorTypes),
  message: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// ============================================================================
// ContactFormSection Component
// ============================================================================

export function ContactFormSection() {
  const t = useTranslations("landing.contactForm");
  const prefersReducedMotion = useReducedMotion();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const submitLead = useMutation(api.leads.submitLead);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      investorType: undefined,
      message: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: FormValues) {
    try {
      await submitLead({
        name: values.name,
        email: values.email,
        phone: values.phone || undefined,
        investorType: values.investorType,
        message: values.message || undefined,
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error("Failed to submit lead:", error);
      form.setError("root", {
        message: t("errors.submitFailed"),
      });
    }
  }

  const containerAnimation = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 },
      };

  const investorTypeOptions: { value: InvestorType; label: string }[] = [
    { value: "first_time", label: t("investorTypes.firstTime") },
    { value: "experienced", label: t("investorTypes.experienced") },
    { value: "institutional", label: t("investorTypes.institutional") },
    { value: "other", label: t("investorTypes.other") },
  ];

  return (
    <SectionWrapper
      id="contact"
      background="muted"
      animate={true}
      ariaLabel={t("heading")}
    >
      <div className="max-w-2xl mx-auto">
        <SectionHeader
          title={t("heading")}
          subtitle={t("subheading")}
          centered={true}
        />

        <AnimatePresence mode="wait">
          {isSubmitted ? (
            <motion.div
              key="success"
              initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
              exit={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
              className="text-center py-12"
            >
              <motion.div
                initial={prefersReducedMotion ? {} : { scale: 0 }}
                animate={prefersReducedMotion ? {} : { scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
              >
                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
              </motion.div>
              <h3 className="text-2xl font-semibold mb-2">{t("success.title")}</h3>
              <p className="text-muted-foreground">{t("success.message")}</p>
            </motion.div>
          ) : (
            <motion.div key="form" {...containerAnimation}>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6 bg-card rounded-xl p-6 sm:p-8 shadow-lg border"
                >
                  {/* Name & Email Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            {t("fields.name.label")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t("fields.name.placeholder")}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            {t("fields.email.label")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder={t("fields.email.placeholder")}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Phone & Investor Type Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            {t("fields.phone.label")}
                            <span className="text-muted-foreground text-xs">
                              ({t("optional")})
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder={t("fields.phone.placeholder")}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="investorType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                            {t("fields.investorType.label")}
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue
                                  placeholder={t("fields.investorType.placeholder")}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {investorTypeOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
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
                        <FormLabel className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-muted-foreground" />
                          {t("fields.message.label")}
                          <span className="text-muted-foreground text-xs">
                            ({t("optional")})
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t("fields.message.placeholder")}
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
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
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t("submitting")}
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        {t("submit")}
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SectionWrapper>
  );
}

export default ContactFormSection;
