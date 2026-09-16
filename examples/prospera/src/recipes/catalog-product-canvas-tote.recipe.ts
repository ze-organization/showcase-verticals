import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Sample catalog product — slug `canvas-tote`. Not an insertable PDP.
 */
export const catalogProductCanvasToteRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "catalog-product-canvas-tote@1",
  name: "canvas-tote",
  displayName: "Canvas Tote",
  description: "Sample catalog product resolved by Products/*.",
  templateType: "catalog-product@1",
  folder: ["Catalog Products"],
  fields: {
    Title: { shape: "text", value: "Canvas Tote" },
    Tagline: {
      shape: "text",
      value: "Heavy canvas, a short strap, room for the day.",
    },
    Category: { shape: "text", value: "Bags" },
    Description: {
      shape: "richText",
      value:
        "<p>One pocket, two straps, no hardware that rattles. The canvas holds its shape empty and still opens wide.</p><p>Use it for a market run or the stack of samples that never quite fit in a briefcase.</p>",
    },
    Image: {
      shape: "image",
      mediaPath: "/theme-photos/promo-closer.jpg",
      alt: "Canvas tote standing on a studio floor",
    },
  },
} satisfies ContentItemRecipe;

export default catalogProductCanvasToteRecipe;
