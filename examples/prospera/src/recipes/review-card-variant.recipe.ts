import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing the grid-level `CardVariant` rendering parameter
 * on the reviews renderings (`reviews-list-grid@1` /
 * `reviews-carousel@1`). Values match the `ALLOWED_CARD_VARIANTS` set
 * the `reviews.sitecore.ts` adapter parses. Lands at
 * `<enumerationsRoot>/Card/ReviewCardVariant` per-site.
 *
 * Reference via `sitecore.enumHandle: "review-card-variant@1"`.
 */
export const reviewCardVariantEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "review-card-variant@1",
  name: "ReviewCardVariant",
  displayName: "Review Card Variant",
  description:
    "Card shape forwarded to every review card in a curated grid/carousel: card (default — bordered testimonial panel) or quote (large pull-quote treatment).",
  location: { scope: "site", folder: ["Card"] },
  default: "card",
  values: [
    { name: "card", displayName: "Card" },
    { name: "quote", displayName: "Quote" },
  ],
} satisfies EnumerationRecipe;

export default reviewCardVariantEnumRecipe;
