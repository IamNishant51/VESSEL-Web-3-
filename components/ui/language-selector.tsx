"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { Globe } from "lucide-react";
import { useState } from "react";
import { useVesselStore } from "@/store/useVesselStore";

const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
];

export function LanguageSelector() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { updateUserPreferences } = useVesselStore();
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("settings");

  const handleLanguageChange = async (newLocale: string) => {
    // Update user preferences
    await updateUserPreferences({ language: newLocale });

    // Update pathname to new locale
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPathname);

    setIsOpen(false);
  };

  const currentLanguage = languages.find((l) => l.code === locale);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm transition-colors hover:bg-accent"
        title={t("language")}
      >
        <Globe className="h-4 w-4" />
        <span className="text-xs font-medium">{currentLanguage?.flag}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-border bg-card shadow-lg">
          <div className="p-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  locale === lang.code
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                }`}
              >
                <span className="mr-2">{lang.flag}</span>
                {lang.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
