import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing the grid-level `CardVariant` rendering parameter
 * on the offers renderings (`offers-list-grid@1` / `offers-carousel@1`).
 * Values match the `ALLOWED_CARD_VARIANTS` set the `offers.sitecore.ts`
 * adapter parses. Lands at `<enumerationsRoot>/Card/OfferCardVariant`
 * per-site.
 *
 * Reference via `sitecore.enumHandle: "offer-card-variant@1"`.
 */
export const offerCardVariantEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "offer-card-variant@1",
  name: "OfferCardVariant",
  displayName: "Offer Card Variant",
  description:
    "Card shape forwarded to every offer card in a curated grid/carousel: simple (offer text + code), complex (richer layout), or deal (deal-forward treatment).",
  location: { scope: "site", folder: ["Card"] },
  default: "simple",
  values: [
    { name: "simple", displayName: "Simple" },
    { name: "complex", displayName: "Complex" },
    { name: "deal", displayName: "Deal" },
  ],
} satisfies EnumerationRecipe;

export default offerCardVariantEnumRecipe;
