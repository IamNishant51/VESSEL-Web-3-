import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";

const locales = ["en", "es", "fr", "ja", "zh"] as const;

export function isValidLocale(locale: string): locale is (typeof locales)[number] {
  return locales.includes(locale as (typeof locales)[number]);
}

export default getRequestConfig(async ({ locale }) => {
  if (!isValidLocale(locale)) notFound();

  return {
    messages: (await import(`./messages/${locale}.json`)).default,
    timeZone: "UTC",
    now: new Date(),
  };
});
