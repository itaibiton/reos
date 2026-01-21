import type { Metadata } from "next";
import { LandingNav } from "@/components/landing/Navigation";
import { Hero } from "@/components/landing/Hero";
import { ServicesGrid } from "@/components/landing/ServicesGrid";
import { FeatureDeepDive } from "@/components/landing/Features";
import { ProcessSteps } from "@/components/landing/ProcessSteps";
import { PricingPlans } from "@/components/landing/Pricing";
import { TeamSection } from "@/components/landing/TeamSection";
import { FAQAccordion } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";
import { GeometricDivider } from "@/components/landing/shared";

export const metadata: Metadata = {
  title: "REOS - Property Management Made Simple",
  description:
    "Comprehensive tools for real estate operations. Manage your entire property portfolio with automated workflows, tenant portals, and financial insights all in one place.",
};

export default function LandingPage() {
  return (
    <>
      {/* Sticky Navigation */}
      <LandingNav />

      <main className="min-h-dvh landing-section-bg">
        {/* Hero Section */}
        <Hero />

        {/* Services Grid Section */}
        <ServicesGrid />

        {/* Geometric Divider */}
        <GeometricDivider
          variant="diagonal-down"
          height={60}
          fillClassName="fill-muted/30"
        />

        {/* Feature Deep Dive Section */}
        <FeatureDeepDive />

        {/* Process Steps Section */}
        <ProcessSteps />

        {/* Geometric Divider */}
        <GeometricDivider
          variant="chevron-down"
          height={50}
          fillClassName="fill-background"
        />

        {/* Pricing Plans Section */}
        <PricingPlans />

        {/* Team Section */}
        <TeamSection />

        {/* Geometric Divider */}
        <GeometricDivider
          variant="diagonal-up"
          height={60}
          fillClassName="fill-muted/30"
        />

        {/* FAQ Section */}
        <FAQAccordion />
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}
