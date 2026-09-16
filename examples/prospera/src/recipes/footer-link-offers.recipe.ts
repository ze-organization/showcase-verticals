import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** Footer link-columns / legal item. */
export const footerLinkOffersRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "footer-link-offers@1",
  name: "footer-link-offers",
  displayName: "Offers",
  description: 'Footer Products column link: Offers.',
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: 'Offers' },
    Link: { shape: "link-external", href: '/Offers', text: 'Offers' },
  },
} satisfies ContentItemRecipe;

export default footerLinkOffersRecipe;
