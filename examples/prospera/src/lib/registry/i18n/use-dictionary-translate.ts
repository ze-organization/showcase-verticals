"use client";

import { useTranslations } from "next-intl";
import { useSitecore } from "@/lib/registry/sitecore";

/**
 * A translate function shaped like the registry's dictionary consumers
 * expect: `(key) => phrase | undefined`. `undefined` means "no phrase for
 * this key in the active locale" and the caller falls back to its English
 * net.
 */
export type TranslateFn = (key: string) => string | undefined;

/**
 * Bridge the host's **next-intl** dictionary into the registry's
 * `(key) => string | undefined` translate shape used by AI Chat and the
 * form-family chrome.
 *
 * ## Why next-intl (not next-localization)
 *
 * The Sitecore Content SDK **App Router** head — the target these
 * components install into — ships internationalization via **next-intl**
 * (`src/i18n/request.ts` + `NextIntlClientProvider`), and exposes the
 * site's Sitecore Dictionary as its message table. Components read a phrase
 * with `useTranslations()`. Our earlier `next-localization` (`useI18n`)
 * wiring read a *different* React context that the head never populates,
 * so `t()` was always empty and the chrome never localized. This hook
 * reads the same context the head fills, so a phrase installed under the
 * active locale (e.g. `ai-chat-send` → `إرسال` on `ar-SA`) resolves.
 *
 * ## Contract
 *
 * `useTranslations()` requires a `NextIntlClientProvider` ancestor — the
 * standard next-intl contract, always present in a Content SDK head. The
 * showcase's own render surfaces (preview iframe, product/page render) and
 * the component unit tests mount one too, so the components stay renderable
 * everywhere. `t.has(key)` gates the lookup so a missing phrase returns
 * `undefined` (English net) instead of next-intl's missing-message marker.
 *
 * The lookup is namespace-free: the head exposes the Sitecore dictionary as
 * a flat top-level message table keyed by the Dictionary Entry `Key` field
 * (e.g. `ai-chat-send`), which mirrors `LABEL_DICTIONARY_KEYS` /
 * `FORM_CHROME` one-for-one.
 */
export function useDictionaryTranslate(): TranslateFn {
  // The Content SDK next-intl integration namespaces each site's Sitecore
  // Dictionary under `messages[siteName]` (per-site isolation), so a phrase
  // is read with `useTranslations(siteName)`. Reading the bare top level
  // (`useTranslations()`) never resolves a phrase — that was the "chat stays
  // English regardless of locale" bug: the dictionary is fetched and present
  // under the site namespace, but the lookup was one level too high, so
  // `t.has(key)` was always false and every label fell back to its English
  // default. `siteName` comes from the Sitecore layout context the head (and
  // the showcase preview's mock SitecoreProvider) provides.
  const { page } = useSitecore();
  const t = useTranslations(page?.siteName);
  return (key: string) => (t.has(key) ? t(key) : undefined);
}
