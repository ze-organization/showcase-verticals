import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** Mega-menu column link for the shared primary nav. */
export const navLinkOffersRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "nav-link-offers@1",
  name: "nav-link-offers",
  displayName: "Offers",
  description: 'Primary-nav Products dropdown link: Offers. Patch live nav-group-products@1; do not re-push that treelist.',
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: 'Offers' },
    Link: { shape: "link-external", href: '/Offers', text: 'Offers' },
  },
} satisfies ContentItemRecipe;

export default navLinkOffersRecipe;
