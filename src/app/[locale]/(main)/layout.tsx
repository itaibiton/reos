import { Navigation, Footer } from "@/components/newlanding";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navigation />
      <main className="min-h-dvh">{children}</main>
      <Footer />
    </>
  );
}
