import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** Mega-menu column link for the shared primary nav. */
export const navLinkCareersRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "nav-link-careers@1",
  name: "nav-link-careers",
  displayName: "Careers",
  description: 'Primary-nav Company dropdown link: Careers.',
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: 'Careers' },
    Link: { shape: "link-external", href: '/Careers', text: 'Careers' },
  },
} satisfies ContentItemRecipe;

export default navLinkCareersRecipe;
