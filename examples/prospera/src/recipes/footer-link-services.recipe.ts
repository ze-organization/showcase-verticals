import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** Footer link-columns / legal item. */
export const footerLinkServicesRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "footer-link-services@1",
  name: "footer-link-services",
  displayName: "Services",
  description: 'Footer Products column link: Services.',
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: 'Services' },
    Link: { shape: "link-external", href: '/Services', text: 'Services' },
  },
} satisfies ContentItemRecipe;

export default footerLinkServicesRecipe;
