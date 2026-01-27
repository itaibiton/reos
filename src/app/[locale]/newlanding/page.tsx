import {
  Navigation,
  Hero,
  SocialProof,
  Features,
  Automation,
  Stats,
  CTA,
  Footer,
} from "@/components/newlanding";

export const metadata = {
  title: "REOS | Real Estate Operating System",
  description:
    "The operating system for institutional real estate. Unify property data, automate asset management workflows, and gain real-time intelligence across your portfolio.",
};

export default function NewLandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <SocialProof />
      <Features />
      <Automation />
      <Stats />
      <CTA />
      <Footer />
    </main>
  );
}
