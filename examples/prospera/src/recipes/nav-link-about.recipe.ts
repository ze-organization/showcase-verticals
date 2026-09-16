import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** Mega-menu column link for the shared primary nav. */
export const navLinkAboutRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "nav-link-about@1",
  name: "nav-link-about",
  displayName: "About",
  description: 'Primary-nav Company dropdown link: About. Patch live nav-group-company@1 after first apply.',
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: 'About' },
    Link: { shape: "link-external", href: '/About', text: 'About' },
  },
} satisfies ContentItemRecipe;

export default navLinkAboutRecipe;
