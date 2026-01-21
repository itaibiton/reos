"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { Sun, Moon, Monitor } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Skeleton } from "@/components/ui/skeleton";

export function ThemeSwitcher() {
  const t = useTranslations("common.theme");
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Skeleton className="h-9 w-[108px] rounded-md" />;
  }

  return (
    <ToggleGroup
      type="single"
      value={theme}
      onValueChange={(value) => value && setTheme(value)}
      className="bg-muted p-1 rounded-lg"
    >
      <ToggleGroupItem value="light" aria-label={t("light")} className="px-3">
        <Sun className="size-4" />
        <span className="sr-only">{t("light")}</span>
      </ToggleGroupItem>
      <ToggleGroupItem value="dark" aria-label={t("dark")} className="px-3">
        <Moon className="size-4" />
        <span className="sr-only">{t("dark")}</span>
      </ToggleGroupItem>
      <ToggleGroupItem value="system" aria-label={t("system")} className="px-3">
        <Monitor className="size-4" />
        <span className="sr-only">{t("system")}</span>
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
