"use client";

import {
  type LocaleOption,
  localeOptions,
} from "@/components/registry/components/navigation/language-switcher-config";
import { useSitecore } from "@/lib/registry/sitecore";

/**
 * Get locale options for a given locale (defaults to current locale)
 */
export function useLocale(locale?: string): LocaleOption {
  const { page } = useSitecore();
  const currentLocale = page.locale || "en";
  const targetLocale = locale || currentLocale;
  const localeItem = localeOptions.find((l) => l.code === targetLocale);
  return localeItem || localeOptions[0];
}
