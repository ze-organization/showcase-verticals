import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** Footer link-columns / legal item. */
export const footerLinkFaqsRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "footer-link-faqs@1",
  name: "footer-link-faqs",
  displayName: "FAQs",
  description: 'Footer Resources column link: FAQs.',
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: 'FAQs' },
    Link: { shape: "link-external", href: '/FAQs', text: 'FAQs' },
  },
} satisfies ContentItemRecipe;

export default footerLinkFaqsRecipe;
