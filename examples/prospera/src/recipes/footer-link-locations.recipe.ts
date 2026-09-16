import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** Footer link-columns / legal item. */
export const footerLinkLocationsRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "footer-link-locations@1",
  name: "footer-link-locations",
  displayName: "Locations",
  description: 'Footer Company column link: Locations.',
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: 'Locations' },
    Link: { shape: "link-external", href: '/Locations', text: 'Locations' },
  },
} satisfies ContentItemRecipe;

export default footerLinkLocationsRecipe;
