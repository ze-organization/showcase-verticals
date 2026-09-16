import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** Footer link-columns / legal item. */
export const footerLinkPartnersRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "footer-link-partners@1",
  name: "footer-link-partners",
  displayName: "Partners",
  description: 'Footer Company column link: Partners.',
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: 'Partners' },
    Link: { shape: "link-external", href: '/Partners', text: 'Partners' },
  },
} satisfies ContentItemRecipe;

export default footerLinkPartnersRecipe;
