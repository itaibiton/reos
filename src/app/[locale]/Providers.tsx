"use client";

import { DirectionProvider } from "@radix-ui/react-direction";
import { NextIntlClientProvider, type Messages } from "next-intl";
import { ThemeProvider } from "next-themes";

type Props = {
  children: React.ReactNode;
  locale: string;
  direction: "ltr" | "rtl";
  messages: Messages;
};

export function Providers({ children, locale, direction, messages }: Props) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
    >
      <DirectionProvider dir={direction}>
        <NextIntlClientProvider locale={locale} messages={messages} timeZone="Asia/Jerusalem">
          {children}
        </NextIntlClientProvider>
      </DirectionProvider>
    </ThemeProvider>
  );
}
