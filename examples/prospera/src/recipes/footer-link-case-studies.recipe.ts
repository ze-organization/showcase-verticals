import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** Footer link-columns / legal item. */
export const footerLinkCaseStudiesRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "footer-link-case-studies@1",
  name: "footer-link-case-studies",
  displayName: "Case Studies",
  description: 'Footer Resources column link: Case Studies.',
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: "Commercial case studies" },
    Link: {
      shape: "link-external",
      href: "/Case-Studies",
      text: "Commercial case studies",
    },
  },
} satisfies ContentItemRecipe;

export default footerLinkCaseStudiesRecipe;
