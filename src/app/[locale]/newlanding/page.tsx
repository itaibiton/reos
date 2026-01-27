import {
  NewHero,
  FeatureCards,
  TradingSection,
  Testimonials,
  FeaturedNews,
  ContactSection,
  NewFooter,
} from "@/components/newlanding";

export const metadata = {
  title: "Anchorage Digital | Secure Digital Asset Platform for Institutions",
  description:
    "The most secure digital asset platform for institutions. Access deep liquidity, trading, custody, staking, and more—all on infrastructure trusted by the world's leading organizations.",
};

export default function NewLandingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <NewHero />

      {/* Feature Cards - Prime, Banking, Staking, Protocols */}
      <FeatureCards />

      {/* Trading Section */}
      <TradingSection />

      {/* Client Testimonials */}
      <Testimonials />

      {/* Featured News/Headlines */}
      <FeaturedNews />

      {/* Contact Form */}
      <ContactSection />

      {/* Footer */}
      <NewFooter />
    </main>
  );
}
