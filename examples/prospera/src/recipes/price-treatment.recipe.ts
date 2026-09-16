import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing the `PriceTreatment` rendering parameter on the
 * destinations renderings (`destinations-list-grid@1` /
 * `destinations-carousel@1`). Values match the
 * `ALLOWED_PRICE_TREATMENTS` set the `destinations.sitecore.ts` adapter
 * parses. Lands at `<enumerationsRoot>/Card/PriceTreatment` per-site.
 *
 * Reference via `sitecore.enumHandle: "price-treatment@1"`.
 */
export const priceTreatmentEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "price-treatment@1",
  name: "PriceTreatment",
  displayName: "Price Treatment",
  description:
    "Whether destination cards show a starting-price callout: standard (no price) or with-price (StartingPrice badge).",
  location: { scope: "site", folder: ["Card"] },
  default: "standard",
  values: [
    { name: "standard", displayName: "Standard" },
    { name: "with-price", displayName: "With Price" },
  ],
} satisfies EnumerationRecipe;

export default priceTreatmentEnumRecipe;
