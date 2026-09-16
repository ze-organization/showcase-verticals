import { defineRouting } from 'next-intl/routing';
import sitecoreConfig from 'sitecore.config';

/**
 * Sitecore language *item names* (IETF cultures). English stays `en`
 * because that is the environment default. Added languages use the
 * predefined regional cultures Sitecore's Add Language wizard creates —
 * not the neutral recipe keys (`fr`, `de`, `es`, `ar`). scai fans those
 * keys onto the registered variants at compile time.
 */
const locales = ['en', 'fr-FR', 'de-DE', 'es-ES', 'ar-SA'] as const;
type AppLocale = (typeof locales)[number];

function resolveDefaultLocale(value: string | undefined): AppLocale {
  return locales.includes(value as AppLocale) ? (value as AppLocale) : 'en';
}

/**
 * Keep in lockstep with `sitecore.config` `redirects.locales` and
 * `language-switcher-config.ts`. Re-push with
 * `--languages en,fr-FR,de-DE,es-ES,ar-SA --provision-languages`.
 * `ar-SA` is RTL (`getDirectionFromLocale` strips the region).
 */
export const routing = defineRouting({
  locales: [...locales],

  // Used when no locale matches. Keep aligned with NEXT_PUBLIC_DEFAULT_LANGUAGE.
  defaultLocale: resolveDefaultLocale(sitecoreConfig.defaultLanguage),

  // No prefix is added for the default locale ("as-needed").
  // For other configuration options, refer to the next-intl documentation:
  // https://next-intl.dev/docs/routing/configuration
  localePrefix: 'as-needed',
});
