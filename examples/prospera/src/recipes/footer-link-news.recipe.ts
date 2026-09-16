import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** Footer link-columns / legal item. */
export const footerLinkNewsRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "footer-link-news@1",
  name: "footer-link-news",
  displayName: "News",
  description: 'Footer Resources column link: News.',
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: 'News' },
    Link: { shape: "link-external", href: '/News', text: 'News' },
  },
} satisfies ContentItemRecipe;

export default footerLinkNewsRecipe;
