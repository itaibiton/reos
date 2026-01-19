import type { Metadata } from "next";
import { ServicesGrid } from "@/components/landing/ServicesGrid";
import { ProcessSteps } from "@/components/landing/ProcessSteps";
import { TeamSection } from "@/components/landing/TeamSection";

export const metadata: Metadata = {
  title: "REOS - Property Management Made Simple",
  description:
    "Comprehensive tools for real estate operations. Manage your entire property portfolio with automated workflows, tenant portals, and financial insights all in one place.",
};

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Services Grid Section */}
      <ServicesGrid className="bg-background" />

      {/* Process Steps Section */}
      <ProcessSteps className="bg-muted/30" />

      {/* Team Section */}
      <TeamSection className="bg-background" />
    </main>
  );
}
