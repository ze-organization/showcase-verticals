import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing the grid-level `CardVariant` rendering parameter
 * on the products renderings (`products-list-grid@1` /
 * `products-carousel@1`). Values match the `ALLOWED_CARD_VARIANTS` set
 * the `products.sitecore.ts` adapter parses. Lands at
 * `<enumerationsRoot>/Card/ProductCardVariant` per-site.
 *
 * Reference via `sitecore.enumHandle: "product-card-variant@1"`.
 */
export const productCardVariantEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "product-card-variant@1",
  name: "ProductCardVariant",
  displayName: "Product Card Variant",
  description:
    "Card shape forwarded to every product card in a curated grid/carousel: default, compact, minimal, horizontal-essential, horizontal-detailed, or detail-panel.",
  location: { scope: "site", folder: ["Card"] },
  default: "default",
  values: [
    { name: "default", displayName: "Default" },
    { name: "compact", displayName: "Compact" },
    { name: "minimal", displayName: "Minimal" },
    { name: "horizontal-essential", displayName: "Horizontal (Essential)" },
    { name: "horizontal-detailed", displayName: "Horizontal (Detailed)" },
    { name: "detail-panel", displayName: "Detail Panel" },
  ],
} satisfies EnumerationRecipe;

export default productCardVariantEnumRecipe;
