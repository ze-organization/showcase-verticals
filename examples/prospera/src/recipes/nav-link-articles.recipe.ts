import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** Mega-menu column link for the shared primary nav. */
export const navLinkArticlesRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "nav-link-articles@1",
  name: "nav-link-articles",
  displayName: "Articles",
  description: 'Primary-nav Resources dropdown link: Articles. Patch live nav-group-resources@1; do not re-push that treelist.',
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: 'Articles' },
    Link: { shape: "link-external", href: '/Articles', text: 'Articles' },
  },
} satisfies ContentItemRecipe;

export default navLinkArticlesRecipe;
