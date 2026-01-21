"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// Native language names - hardcoded so users can find their language
// regardless of current UI language
const localeNames: Record<string, string> = {
  en: "English",
  he: "\u05E2\u05D1\u05E8\u05D9\u05EA",
};

export function SettingsTab() {
  const t = useTranslations("header.settings");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: string) => {
    if (newLocale) {
      router.replace(pathname, { locale: newLocale });
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Theme section */}
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">{t("theme")}</label>
        <ThemeSwitcher />
      </div>

      {/* Language section */}
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">{t("language")}</label>
        <ToggleGroup
          type="single"
          value={locale}
          onValueChange={handleLocaleChange}
          className="bg-muted p-1 rounded-lg w-fit"
        >
          {routing.locales.map((loc) => (
            <ToggleGroupItem
              key={loc}
              value={loc}
              aria-label={localeNames[loc] || loc}
              className="px-3 data-[state=on]:bg-background"
            >
              {localeNames[loc] || loc}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  );
}
