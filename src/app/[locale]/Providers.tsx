"use client";

import { DirectionProvider } from "@radix-ui/react-direction";
import { NextIntlClientProvider } from "next-intl";

type Props = {
  children: React.ReactNode;
  direction: "ltr" | "rtl";
};

export function Providers({ children, direction }: Props) {
  return (
    <DirectionProvider dir={direction}>
      <NextIntlClientProvider>{children}</NextIntlClientProvider>
    </DirectionProvider>
  );
}
