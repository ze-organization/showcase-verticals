import {
  pageTemplateThumbnail,
  type PageTemplateRecipe,
} from "./_wireframe-thumbnail";
import { HUB_PAGE_FIELDS } from "./_hub-fields";

/**
 * Product Subcategory hub — insert Product only. Bound to `hub-page@1`.
 */
export const productSubcategoryRecipe = {
  kind: "page-template",
  schemaVersion: "1",
  handle: "product-subcategory@1",
  name: "ProductSubcategory",
  displayName: "Product Subcategory",
  thumbnail: pageTemplateThumbnail("Hub_Page_Template.png", "Product Subcategory"),
  description:
    "Product subcategory hub — Title / Eyebrow / ShortDescription / Image / Content plus SEO. Insert Product under this type. hub-page supplies header, footer, and a Container.",
  fields: HUB_PAGE_FIELDS,
  insertOptions: ["product@1"],
} satisfies PageTemplateRecipe;

export default productSubcategoryRecipe;
