import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Sample catalog product — slug `oak-tray`. Not an insertable PDP.
 */
export const catalogProductOakTrayRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "catalog-product-oak-tray@1",
  name: "oak-tray",
  displayName: "Oak Tray",
  description: "Sample catalog product resolved by Products/*.",
  templateType: "catalog-product@1",
  folder: ["Catalog Products"],
  fields: {
    Title: { shape: "text", value: "Oak Tray" },
    Tagline: {
      shape: "text",
      value: "A low tray for the carafe, the lamp switch, the remote.",
    },
    Category: { shape: "text", value: "Tabletop" },
    Description: {
      shape: "richText",
      value:
        "<p>White oak, a shallow well, handles cut from the same board. Oil finish — wipe, do not soak.</p><p>Sized for a coffee table, not a serving procession. Pair with the Ridge Carafe if you want the still life complete.</p>",
    },
    Image: {
      shape: "image",
      mediaPath: "/theme-photos/pdp-01.jpg",
      alt: "White oak tray on a low table",
    },
  },
} satisfies ContentItemRecipe;

export default catalogProductOakTrayRecipe;
