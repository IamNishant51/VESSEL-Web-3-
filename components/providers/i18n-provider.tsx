"use client";

import { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { useLocale } from "next-intl";

export function I18nLayoutWrapper({ children }: { children: ReactNode }) {
  const locale = useLocale();

  return (
    <NextIntlClientProvider locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
}
