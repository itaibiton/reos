import { Navigation, Footer } from "@/components/newlanding";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="light">
      <Navigation />
      <main className="min-h-dvh">{children}</main>
      <Footer />
    </div>
  );
}
