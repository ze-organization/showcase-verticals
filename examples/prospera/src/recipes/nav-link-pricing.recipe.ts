import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** Mega-menu column link for the shared primary nav (`nav-group-products@1`). */
export const navLinkPricingRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "nav-link-pricing@1",
  name: "nav-link-pricing",
  displayName: "Pricing",
  description: "Primary-nav dropdown link: Pricing.",
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: "Pricing" },
    Link: { shape: "link-external", href: "/Pricing", text: "Pricing" },
  },
} satisfies ContentItemRecipe;

export default navLinkPricingRecipe;
