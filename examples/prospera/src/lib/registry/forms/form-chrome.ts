"use client";

import {
  type TranslateFn,
  useDictionaryTranslate,
} from "@/lib/registry/i18n/use-dictionary-translate";

/**
 * Shared resolver for the generic *chrome* strings on the form family —
 * submit buttons, field labels, placeholders, and status messages that
 * are the same on every placement ("Subscribe", "Email address",
 * "Search…", "Something went wrong."). These are NOT page-specific
 * editorial copy; they're UI furniture that should localize.
 *
 * ## The three-layer resolution
 *
 * Each chrome string resolves through {@link resolveChromeText}, lowest
 * precedence first:
 *
 *   1. **English safety net** — the hardcoded default baked into the
 *      component. Guarantees a legible string even with no dictionary
 *      and no author value. Kept in sync with the matching
 *      `core-ui-labels@1` phrase's `defaultValue` so English renders
 *      identically whether or not the dictionary is installed.
 *   2. **Sitecore Dictionary phrase** — `t(dictionaryKey)` against the
 *      active locale's `core-ui-labels@1` entries. This is the
 *      *localized default*: the layer that makes a blank field render in
 *      the visitor's language.
 *   3. **Authored field value** — a non-empty datasource field the
 *      author typed. Always wins; a bespoke label overrides both the
 *      dictionary and the net.
 *
 * ## Why the dictionary is the default, not a last resort
 *
 * For the dictionary to be reached, the field must be *blank* — which is
 * why the matching recipe fields deliberately ship **no Standard Value**.
 * A Standard Value would pre-fill the field, making it non-empty, so
 * resolution would stop at layer 3 and never consult the dictionary. The
 * "leave the Standard Value unset so the dictionary wins" decision lives
 * in each component's `.recipe.ts`; this module is the runtime half.
 */

// The generic-chrome translate hook is the shared, host-agnostic
// next-intl bridge (`@/lib/registry/i18n/use-dictionary-translate`). Re-export
// it here so the form components keep importing `useDictionaryTranslate` /
// `TranslateFn` from `form-chrome` unchanged.
export { type TranslateFn, useDictionaryTranslate };

/**
 * Resolve one chrome string through the three-layer chain described in
 * the module doc: authored value → dictionary phrase → English net.
 *
 * @param authored   The author-typed field text (post-`getSourceText`),
 *                   or undefined/blank when the field is unset.
 * @param dictionaryKey The `core-ui-labels@1` phrase key.
 * @param englishNet The hardcoded English fallback (keep it equal to the
 *                   dictionary phrase's `defaultValue`).
 * @param t          The active-locale translate function, typically from
 *                   {@link useDictionaryTranslate}.
 */
export function resolveChromeText(
  authored: string | undefined,
  dictionaryKey: string,
  englishNet: string,
  t?: TranslateFn,
): string {
  // 1. Author-set field wins outright.
  if (authored && authored.trim().length > 0) return authored;

  // 2. Dictionary phrase for the active locale. Guard against `t`
  //    echoing the key back (some rosetta versions do) or returning an
  //    empty string for a missing phrase, so we never render a raw key.
  if (t) {
    const phrase = t(dictionaryKey);
    if (
      typeof phrase === "string" &&
      phrase.length > 0 &&
      phrase !== dictionaryKey
    ) {
      return phrase;
    }
  }

  // 3. English safety net.
  return englishNet;
}

/**
 * Variant of {@link resolveChromeText} that preserves an editable
 * `TextSource` when the author set the field. Some form parts (e.g. the
 * subscription banner) pass field values straight into a downstream
 * block as `TextSource` so Pages authors can inline-edit them. When the
 * author *has* typed a value we hand the original source back untouched
 * (inline-edit binding intact); when it's blank we substitute the
 * resolved dictionary/English string.
 *
 * Generic over the source type so this module stays a leaf — it never
 * imports the `TextSource` type from the components tier.
 *
 * @param source       The original editable source to preserve when authored.
 * @param authoredText `getSourceText(source)` computed by the caller.
 */
export function resolveChromeSource<S>(
  source: S | undefined,
  authoredText: string | undefined,
  dictionaryKey: string,
  englishNet: string,
  t?: TranslateFn,
): S | string {
  if (authoredText && authoredText.trim().length > 0) return source as S;
  return resolveChromeText(undefined, dictionaryKey, englishNet, t);
}

/**
 * The generic chrome phrases the form family shares, each pinned to its
 * `core-ui-labels@1` dictionary key and English net. `en` values MUST
 * match the corresponding phrase's `defaultValue` in
 * `core-ui-labels.recipe.ts` so English renders identically with or
 * without the dictionary installed.
 */
export const FORM_CHROME = {
  /** Generic form submit button ("Submit"). */
  submit: { key: "form-submit", en: "Submit" },
  /** Newsletter / subscribe submit button ("Subscribe"). */
  subscribe: { key: "cta-subscribe", en: "Subscribe" },
  /** Email input label ("Email address"). */
  emailLabel: { key: "form-email-label", en: "Email address" },
  /** Email input placeholder ("you@example.com"). */
  emailPlaceholder: { key: "form-email-placeholder", en: "you@example.com" },
  /** Generic submit-failure status ("Something went wrong. Please try again."). */
  error: { key: "form-error", en: "Something went wrong. Please try again." },
  /** Generic lead/contact success ("Thanks — we'll be in touch."). */
  formSuccess: { key: "form-thanks", en: "Thanks — we'll be in touch." },
  /** Subscribe success ("Thanks for subscribing."). */
  subscribeSuccess: {
    key: "form-subscribe-success",
    en: "Thanks for subscribing.",
  },
  /** Search input placeholder ("Search…"). */
  searchPlaceholder: { key: "search-placeholder", en: "Search…" },
  /** Search submit button ("Search"). */
  searchSubmit: { key: "search-submit", en: "Search" },
} as const;
