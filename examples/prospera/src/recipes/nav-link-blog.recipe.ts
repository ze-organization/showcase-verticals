import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** Mega-menu column link for the shared primary nav (`nav-group-resources@1`). */
export const navLinkBlogRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "nav-link-blog@1",
  name: "nav-link-blog",
  displayName: "Blog",
  description: "Primary-nav dropdown link: Blog.",
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: "Blog" },
    Link: { shape: "link-external", href: "/blog", text: "Blog" },
  },
} satisfies ContentItemRecipe;

export default navLinkBlogRecipe;
