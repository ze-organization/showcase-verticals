import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing the `Variant` rendering parameter on
 * `cta-button@1` AND the `PrimaryActionStyle` / `SecondaryActionStyle`
 * params on `card-block@1` — single source of truth for the
 * default / outline / ghost / link axis any rendering with a
 * CTA-shaped affordance picks from. Lands at
 * `<enumerationsRoot>/Components/CtaButton/ButtonVariant` per-site.
 *
 * The editorial "Read more →" treatment is NOT a variant — authors
 * compose it as `link` + the ShowArrow checkbox, and ShowArrow composes
 * with any of the four values. `link-arrow` and `pill` were removed from
 * both the vocabulary and the runtime; a stored value of either now
 * falls back to the default rather than resolving. Never re-add them:
 * the arrow is the ShowArrow axis, and corner shape is owned by ONE
 * token per brand (`--button-radius`) with no per-placement override.
 */
export const buttonVariantEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "button-variant@1",
  name: "ButtonVariant",
  displayName: "Button Variant",
  description: "Visual treatment of a button.",
  location: { scope: "site", folder: ["Components", "CtaButton"] },
  default: "default",
  values: [
    { name: "default", displayName: "Default" },
    { name: "outline", displayName: "Outline" },
    { name: "ghost", displayName: "Ghost" },
    { name: "link", displayName: "Link" },
  ],
} satisfies EnumerationRecipe;

export default buttonVariantEnumRecipe;
