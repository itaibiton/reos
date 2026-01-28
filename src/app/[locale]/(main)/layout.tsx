"use client";

import { Navigation, Footer } from "@/components/newlanding";
import { useEffect } from "react";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Force light theme on landing page - prevent any theme changes
    const forceLightTheme = () => {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      document.documentElement.style.colorScheme = "light";
    };

    // Set immediately
    forceLightTheme();

    // Watch for any theme changes and force light theme
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "class") {
          const html = document.documentElement;
          if (html.classList.contains("dark")) {
            forceLightTheme();
          }
        }
      });
    });

    // Observe the html element for class changes
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Also check periodically to ensure light theme is maintained
    const interval = setInterval(forceLightTheme, 100);

    return () => {
      observer.disconnect();
      clearInterval(interval);
      // Don't restore theme on unmount - let authenticated pages handle their own theme
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
