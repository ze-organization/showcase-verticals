import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** Mega-menu column link for the shared primary nav. */
export const navLinkPartnersRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "nav-link-partners@1",
  name: "nav-link-partners",
  displayName: "Partners",
  description: 'Primary-nav Company dropdown link: Partners.',
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: 'Partners' },
    Link: { shape: "link-external", href: '/Partners', text: 'Partners' },
  },
} satisfies ContentItemRecipe;

export default navLinkPartnersRecipe;
