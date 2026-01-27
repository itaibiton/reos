"use client";

import { Navigation, Footer } from "@/components/newlanding";
import { useEffect } from "react";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Force light theme on landing page
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
    document.documentElement.style.colorScheme = "light";

    return () => {
      // Cleanup on unmount
      document.documentElement.style.colorScheme = "";
    };
  }, []);

  return (
    <>
      <Navigation />
      <main className="min-h-dvh">{children}</main>
      <Footer />
    </>
  );
}
