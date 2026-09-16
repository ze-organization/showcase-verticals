import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** Product column link for the `footer-link-columns@1` stock footer. */
export const footerLinkPricingRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "footer-link-pricing@1",
  name: "footer-link-pricing",
  displayName: "Pricing",
  description: "Footer link-columns item: Pricing (Product column).",
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: "Pricing" },
    Link: { shape: "link-external", href: "/Pricing", text: "Pricing" },
  },
} satisfies ContentItemRecipe;

export default footerLinkPricingRecipe;
