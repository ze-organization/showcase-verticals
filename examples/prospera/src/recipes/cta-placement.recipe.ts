import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration backing the cards' `CtaPlacement` rendering
 * parameter — where a card's call-to-action sits. Lands at
 * `<enumerationsRoot>/Card/CtaPlacement` per-site.
 *
 * Reference from a component recipe via `sitecore.enumHandle:
 * "cta-placement@1"`. Per-variant defaults differ by family (article
 * cards default `inline`, feature cards default `footer`), so the
 * recipes leave the param default unset — see
 * `cards-and-lists/_cta-placement.ts`.
 */
export const ctaPlacementEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "cta-placement@1",
  name: "CtaPlacement",
  displayName: "CTA Placement",
  description:
    "Where a card's CTA sits: `inline` flows it at the end of the copy block (editorial read-more pattern); `footer` pins it in the card's actions row so CTAs align across a row of unequal-height cards.",
  location: { scope: "site", folder: ["Card"] },
  default: "inline",
  values: [
    { name: "inline", displayName: "Inline (end of copy)" },
    { name: "footer", displayName: "Footer (aligned actions row)" },
  ],
} satisfies EnumerationRecipe;

export default ctaPlacementEnumRecipe;
