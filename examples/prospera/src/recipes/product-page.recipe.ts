import type { PageDesignRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { pageDesignThumbnail } from "./_wireframe-thumbnail";

/**
 * Page design for `product@1`. Three partials, same pattern as
 * `article-page@1`:
 *
 *   headless-header  ← header-utility-bar@1
 *   headless-main    ← product-details-partial@1
 *   headless-footer  ← footer-link-columns@1
 *
 * Body is a **partial**, not page-design layout. Insert → Product
 * therefore always gets the product shell.
 */
export const productPageRecipe = {
  kind: "page-design",
  schemaVersion: "1",
  handle: "product-page@1",
  name: "ProductPage",
  displayName: "Product Page",
  thumbnail: pageDesignThumbnail("Product_Page_Template.png", "Product Page"),
  description:
    "Product page design — header + Product Details partial + footer. The details partial places product-details@1 on headless-main.",
  appliesTo: ["product@1"],
  partials: [
    "header-utility-bar@1",
    "product-details-partial@1",
    "footer-link-columns@1",
  ],
  layout: { placeholders: {} },
} satisfies PageDesignRecipe;

export default productPageRecipe;
