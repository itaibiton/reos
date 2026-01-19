"use client";

import { DirectionProvider } from "@radix-ui/react-direction";
import { NextIntlClientProvider } from "next-intl";

type Props = {
  children: React.ReactNode;
  locale: string;
  direction: "ltr" | "rtl";
};

export function Providers({ children, locale, direction }: Props) {
  return (
    <DirectionProvider dir={direction}>
      <NextIntlClientProvider locale={locale}>
        {children}
      </NextIntlClientProvider>
    </DirectionProvider>
  );
}
