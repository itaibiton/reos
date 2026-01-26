import { LandingNav } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LandingNav />
      <main className="min-h-dvh">{children}</main>
      <Footer />
    </>
  );
}
