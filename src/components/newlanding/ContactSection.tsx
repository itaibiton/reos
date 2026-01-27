"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ContactSectionProps {
  className?: string;
}

const institutionTypes = [
  { value: "crypto-protocol", label: "Crypto protocol" },
  { value: "wealth-manager", label: "Wealth manager" },
  { value: "vc-firm", label: "Venture capital firm" },
  { value: "government", label: "Government" },
  { value: "asset-manager", label: "Asset manager" },
  { value: "corporation", label: "Corporation" },
  { value: "other", label: "Other" },
];

const assetsAmounts = [
  { value: "under-10m", label: "Under $10 million" },
  { value: "10m-100m", label: "$10 million to $100 million" },
  { value: "100m-500m", label: "$100 million to $500 million" },
  { value: "500m-5b", label: "$500 million to $5 billion" },
  { value: "over-5b", label: "Over $5 billion" },
];

const areasOfInterest = [
  "Prime",
  "Trading",
  "Settlement",
  "Custody",
  "Staking",
  "DeFi",
  "Stablecoins",
  "Token generation events",
  "APIs",
];

export function ContactSection({ className }: ContactSectionProps) {
  const [submitted, setSubmitted] = useState(false);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  const handleAreaToggle = (area: string) => {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setTimeout(() => {
      setSubmitted(true);
    }, 500);
  };

  if (submitted) {
    return (
      <section
        id="contact"
        className={cn(
          "relative bg-[#0a0a0a] py-20 px-4 sm:px-6 lg:px-8",
          "border-t border-gray-800",
          className
        )}
      >
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-6"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">
              Successfully sent. Thank you.
            </h2>
            <p className="text-gray-400">
              We are currently reviewing the information you provided and will
              be in touch with you soon.
            </p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="contact"
      className={cn(
        "relative bg-[#0a0a0a] py-20 px-4 sm:px-6 lg:px-8",
        "border-t border-gray-800",
        className
      )}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Get in touch
          </h2>
          <p className="text-gray-400">
            Ready to get started? Fill out the form below and our team will reach out.
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onSubmit={handleSubmit}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-8"
        >
          <div className="grid md:grid-cols-2 gap-6">
            {/* First name */}
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-gray-300">
                First name <span className="text-emerald-500">*</span>
              </Label>
              <Input
                id="firstName"
                required
                className="bg-gray-800 border-gray-700 text-white focus:border-emerald-500"
              />
            </div>

            {/* Last name */}
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-gray-300">
                Last name <span className="text-emerald-500">*</span>
              </Label>
              <Input
                id="lastName"
                required
                className="bg-gray-800 border-gray-700 text-white focus:border-emerald-500"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Work email address <span className="text-emerald-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="Please enter your work email address"
                className="bg-gray-800 border-gray-700 text-white focus:border-emerald-500"
              />
            </div>

            {/* Company */}
            <div className="space-y-2">
              <Label htmlFor="company" className="text-gray-300">
                Company <span className="text-emerald-500">*</span>
              </Label>
              <Input
                id="company"
                required
                className="bg-gray-800 border-gray-700 text-white focus:border-emerald-500"
              />
            </div>

            {/* Institution type */}
            <div className="space-y-2">
              <Label className="text-gray-300">
                Institution type <span className="text-emerald-500">*</span>
              </Label>
              <Select required>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select institution type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {institutionTypes.map((type) => (
                    <SelectItem
                      key={type.value}
                      value={type.value}
                      className="text-white hover:bg-gray-700"
                    >
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Assets amount */}
            <div className="space-y-2">
              <Label className="text-gray-300">Assets amount</Label>
              <Select>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select assets amount" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {assetsAmounts.map((amount) => (
                    <SelectItem
                      key={amount.value}
                      value={amount.value}
                      className="text-white hover:bg-gray-700"
                    >
                      {amount.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Message */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="message" className="text-gray-300">
                Your message
              </Label>
              <Textarea
                id="message"
                rows={4}
                className="bg-gray-800 border-gray-700 text-white focus:border-emerald-500 resize-none"
              />
            </div>

            {/* Areas of interest */}
            <div className="space-y-3 md:col-span-2">
              <Label className="text-gray-300">Areas of interest</Label>
              <div className="flex flex-wrap gap-3">
                {areasOfInterest.map((area) => (
                  <label
                    key={area}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all",
                      selectedAreas.includes(area)
                        ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
                        : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
                    )}
                  >
                    <Checkbox
                      checked={selectedAreas.includes(area)}
                      onCheckedChange={() => handleAreaToggle(area)}
                      className="border-gray-600"
                    />
                    <span className="text-sm">{area}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Consent */}
            <div className="md:col-span-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox className="mt-1 border-gray-600" />
                <span className="text-sm text-gray-400">
                  By providing my information, I agree to allow the company to
                  contact me regarding their products and services. I also
                  consent to the use of email analytics to personalize my
                  experience.
                </span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="mt-8 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              <span className="text-emerald-500">*</span> Indicates a required field
            </p>
            <Button
              type="submit"
              className="bg-white text-black hover:bg-gray-100 px-8"
            >
              Submit
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.form>
      </div>
    </section>
  );
}

export default ContactSection;
