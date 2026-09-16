import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** Footer link-columns / legal item. */
export const footerLinkLandingPagesRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "footer-link-landing-pages@1",
  name: "footer-link-landing-pages",
  displayName: "Landing Pages",
  description: 'Footer Resources column link: Landing Pages.',
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: 'Landing Pages' },
    Link: { shape: "link-external", href: '/Landing-Pages', text: 'Landing Pages' },
  },
} satisfies ContentItemRecipe;

export default footerLinkLandingPagesRecipe;
