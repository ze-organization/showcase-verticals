import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** Mega-menu column link for the shared primary nav. */
export const navLinkNewsRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "nav-link-news@1",
  name: "nav-link-news",
  displayName: "News",
  description: 'Primary-nav Resources dropdown link: News. Patch live nav-group-resources@1; do not re-push that treelist.',
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: 'News' },
    Link: { shape: "link-external", href: '/News', text: 'News' },
  },
} satisfies ContentItemRecipe;

export default navLinkNewsRecipe;
