import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** Footer link-columns / legal item. */
export const footerLinkArticlesRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "footer-link-articles@1",
  name: "footer-link-articles",
  displayName: "Articles",
  description: 'Footer Resources column link: Articles.',
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: 'Articles' },
    Link: { shape: "link-external", href: '/Articles', text: 'Articles' },
  },
} satisfies ContentItemRecipe;

export default footerLinkArticlesRecipe;
