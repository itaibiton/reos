"use client";

import { DirectionProvider } from "@radix-ui/react-direction";
import { NextIntlClientProvider, type Messages } from "next-intl";

type Props = {
  children: React.ReactNode;
  locale: string;
  direction: "ltr" | "rtl";
  messages: Messages;
};

export function Providers({ children, locale, direction, messages }: Props) {
  return (
    <DirectionProvider dir={direction}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </DirectionProvider>
  );
}
