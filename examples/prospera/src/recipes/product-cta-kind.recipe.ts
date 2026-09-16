import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing the `CtaKind` rendering parameter on
 * `product-card@1` — decides what the card's footer call-to-action
 * DOES, decoupled from its visual fill (which is the orthogonal
 * `button-variant@1` axis) and from the price row (the `ShowPrice`
 * param). Lands at `<enumerationsRoot>/Card/ProductCtaKind` per-site.
 *
 * Why this exists: the product card used to hard-wire an e-commerce
 * "shop flavor" — every footer painted a price + an add-to-cart
 * button. That made it unusable as a plain content card. `CtaKind`
 * lets the same card be a shop tile (`cart`), a content tile with an
 * editorial CTA (`link`), or a bare tile (`none`). The shop flavor
 * keeps its own visual options via `button-variant@1` + `ShowArrow`.
 *
 * Reference via `sitecore.enumHandle: "product-cta-kind@1"`.
 */
export const productCtaKindEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "product-cta-kind@1",
  name: "ProductCtaKind",
  displayName: "Product CTA Kind",
  description:
    "What the product card's footer CTA does: cart (add-to-cart shop affordance), link (an editorial content CTA — reuses the button fill + arrow axes), or none (no CTA).",
  location: { scope: "site", folder: ["Card"] },
  default: "cart",
  values: [
    { name: "cart", displayName: "Add to Cart" },
    { name: "link", displayName: "Link" },
    { name: "none", displayName: "None" },
  ],
} satisfies EnumerationRecipe;

export default productCtaKindEnumRecipe;
