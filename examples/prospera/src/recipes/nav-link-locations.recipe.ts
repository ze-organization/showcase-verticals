import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** Mega-menu column link for the shared primary nav. */
export const navLinkLocationsRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "nav-link-locations@1",
  name: "nav-link-locations",
  displayName: "Locations",
  description: 'Primary-nav Company dropdown link: Locations.',
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: 'Locations' },
    Link: { shape: "link-external", href: '/Locations', text: 'Locations' },
  },
} satisfies ContentItemRecipe;

export default navLinkLocationsRecipe;
