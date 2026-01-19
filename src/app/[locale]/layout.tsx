import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Heebo } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { Providers } from "./Providers";
import { Toaster } from "@/components/ui/sonner";
import "../globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const heebo = Heebo({
  subsets: ["latin", "hebrew"],
  variable: "--font-heebo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "REOS - Real Estate Investment Platform",
  description: "Connect US investors with Israeli properties",
};

// Generate static params for all supported locales
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Validate locale
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const direction = locale === "he" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={direction}
      className={`${inter.variable} ${jetbrainsMono.variable} ${heebo.variable}`}
    >
      <body className="font-sans antialiased">
        <ClerkProvider
          signInUrl={`/${locale}/sign-in`}
          signUpUrl={`/${locale}/sign-up`}
          signInFallbackRedirectUrl={`/${locale}/dashboard`}
          signUpFallbackRedirectUrl={`/${locale}/dashboard`}
        >
          <ConvexClientProvider>
            <Providers locale={locale} direction={direction}>
              {children}
            </Providers>
          </ConvexClientProvider>
          <Toaster position="bottom-right" />
        </ClerkProvider>
      </body>
    </html>
  );
}
