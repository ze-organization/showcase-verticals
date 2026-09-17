import {
  partialDesignThumbnail,
  type PartialDesignRecipe,
} from "./_wireframe-thumbnail";

/**
 * Product body shell — the third partial on `product-page@1`.
 * Places `product-details@1` on `headless-main` with an empty
 * datasource so the rendering reads the current `product@1` page.
 */
export const productDetailsPartialRecipe = {
  kind: "partial-design",
  schemaVersion: "1",
  handle: "product-details-partial@1",
  name: "ProductDetails",
  displayName: "Product Details",
  thumbnail: partialDesignThumbnail("Product_Details_Partial.png", "Product Details"),
  description:
    "Product body partial — Product Details on headless-main, with media, in-column, related, and full-width placeholders. Include from product-page via partials.",
  layout: {
    placeholders: {
      "headless-main": [
        {
          componentHandle: "product-details@1",
          variant: "Default",
          params: { MaxWidth: "auto" },
          datasourceRef: { kind: "none" },
        },
      ],
    },
  },
} satisfies PartialDesignRecipe;

export default productDetailsPartialRecipe;
