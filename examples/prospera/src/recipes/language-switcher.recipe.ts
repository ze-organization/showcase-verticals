import type { ComponentTemplateRecipe } from "../lib/registry/sitecore-recipes";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `LanguageSwitcher` component (./language-switcher.tsx).
 *
 * **Datasourceless rendering.** LanguageSwitcher reads its supported
 * locales from a registry-side config (`language-switcher-config.ts`)
 * and the active locale from the SDK's locale context — neither
 * crosses Sitecore as a datasource. No `datasource` block, no
 * compatible templates, no auto-create.
 *
 * **Followup (not in this recipe):** the hardcoded `localeOptions`
 * list should be reconciled with Sitecore's site-config language
 * settings so tenants don't have to fork the registry to ship
 * different locale support. When that happens, this recipe stays
 * datasourceless — the locale list is a site-level concern, not a
 * per-placement datasource.
 *
 * **Followup (variants):** Northwind-style 2-locale sites want a
 * `Toggle` variant (single button rendering the *other* locale
 * label, click switches). Compact utility strips want an `IconOnly`
 * variant (globe icon + popover). Both are React-side variant adds —
 * the recipe just needs additional `variants[]` entries when shipped.
 * The current `Default` variant is SUSE-style dropdown.
 *
 * Placed in `header-utility-end-{*}` (or similar utility slot) on
 * partial designs that need locale selection.
 */
export const languageSwitcherRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "language-switcher@1",
  icon: componentIcons["language-switcher@1"],
  name: "language-switcher",
  displayName: "Language Switcher",
  description:
    "Locale picker for multi-language sites. Datasourceless — reads supported locales from registry config and active locale from SDK context.",

  section: { handle: "navigation-section@1" },

  params: [
    {
      name: "InstanceKey",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Stable author-friendly handle for analytics (e.g. 'header-language-switcher'). Defaults to the rendering id when blank.",
        sortOrder: 900,
      },
    },
    {
      name: "InstanceScope",
      shape: "enum",
      sitecore: {
        enumHandle: "instance-scope@1",
        hint: "Whether this instance is reused site-wide or unique per page. Drives personalization partition keys.",
        sortOrder: 910,
      },
    },
    {
      name: "TrackEvents",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Emit CDP events when the active locale changes. Off by default.",
        sortOrder: 920,
      },
    },
  ],

  variants: [{ name: "Default" }],

  placedIn: [
    "header-end-{*}",
    "header-utility-start-{*}",
    "header-utility-end-{*}",
  ],

  // changed survives the taxonomy migration — OOTB Sitecore CDP can
  // capture clicks generically but not the semantic locale-preference
  // change (which is content-personalization-relevant).
  events: [
    {
      name: "changed",
      type: "language-switcher.changed",
      description:
        "Fires when the user picks a different locale. Meta carries fromLocale and toLocale.",
      action: "engage",
      commitment: "engage",
      emitsIdentity: false,
      emitsAffinity: false,
      cdpEventType: "CUSTOM",
    },
  ],
} satisfies ComponentTemplateRecipe;

export default languageSwitcherRecipe;
