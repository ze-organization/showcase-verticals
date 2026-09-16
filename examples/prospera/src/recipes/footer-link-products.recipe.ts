import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** Footer link-columns / legal item. */
export const footerLinkProductsRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "footer-link-products@1",
  name: "footer-link-products",
  displayName: "Products",
  description: 'Footer Products column link: Products. Patch live footer-column-product@1; do not re-push that treelist.',
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: 'Products' },
    Link: { shape: "link-external", href: '/Products', text: 'Products' },
  },
} satisfies ContentItemRecipe;

export default footerLinkProductsRecipe;
