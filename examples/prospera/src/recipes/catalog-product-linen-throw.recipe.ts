import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Sample catalog product — slug `linen-throw`, distinct from the
 * insertable PDPs (north-desk-lamp, harbor-lounge-chair, ridge-carafe).
 * Lands under contentItemsRoot / Catalog Products.
 */
export const catalogProductLinenThrowRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "catalog-product-linen-throw@1",
  name: "linen-throw",
  displayName: "Linen Throw",
  description: "Sample catalog product resolved by Products/*.",
  templateType: "catalog-product@1",
  folder: ["Catalog Products"],
  fields: {
    Title: { shape: "text", value: "Linen Throw" },
    Tagline: {
      shape: "text",
      value: "Washed linen, a weight that stays on the sofa.",
    },
    Category: { shape: "text", value: "Textiles" },
    Description: {
      shape: "richText",
      value:
        "<p>The throw is garment-washed so it drapes on the first day. Hem is a narrow self-edge — no fringe to catch.</p><p>Keep it folded on the lounge chair, or over the arm of the sofa. The weave is tight enough for a lap, open enough to breathe.</p>",
    },
    Image: {
      shape: "image",
      mediaPath: "/theme-photos/hub-02.jpg",
      alt: "Folded linen throw on a lounge chair",
    },
  },
} satisfies ContentItemRecipe;

export default catalogProductLinenThrowRecipe;
