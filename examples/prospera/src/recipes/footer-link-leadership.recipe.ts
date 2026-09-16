import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** Footer link-columns / legal item. */
export const footerLinkLeadershipRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "footer-link-leadership@1",
  name: "footer-link-leadership",
  displayName: "Leadership",
  description: 'Footer Company column link: Leadership.',
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: 'Leadership' },
    Link: { shape: "link-external", href: '/Leadership', text: 'Leadership' },
  },
} satisfies ContentItemRecipe;

export default footerLinkLeadershipRecipe;
