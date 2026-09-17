import {
  pageTemplateThumbnail,
  type PageTemplateRecipe,
} from "./_wireframe-thumbnail";
import { HUB_PAGE_FIELDS } from "./_hub-fields";

/**
 * Product Category hub — insert Subcategory or Product. Bound to
 * `hub-page@1`. Listing grids use `products-list-grid@1`.
 */
export const productCategoryRecipe = {
  kind: "page-template",
  schemaVersion: "1",
  handle: "product-category@1",
  name: "ProductCategory",
  displayName: "Product Category",
  thumbnail: pageTemplateThumbnail("Hub_Page_Template.png", "Product Category"),
  description:
    "Product category hub — Title / Eyebrow / ShortDescription / Image / Content plus SEO. Insert Subcategory or Product under this type. hub-page supplies header, footer, and a Container.",
  fields: HUB_PAGE_FIELDS,
  insertOptions: ["product-subcategory@1", "product@1"],
} satisfies PageTemplateRecipe;

export default productCategoryRecipe;
