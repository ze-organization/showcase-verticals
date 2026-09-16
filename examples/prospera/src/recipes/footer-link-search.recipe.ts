import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** Footer link-columns / legal item. */
export const footerLinkSearchRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "footer-link-search@1",
  name: "footer-link-search",
  displayName: "Search",
  description: 'Footer Resources column link: Search.',
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: 'Search' },
    Link: { shape: "link-external", href: '/Search', text: 'Search' },
  },
} satisfies ContentItemRecipe;

export default footerLinkSearchRecipe;
