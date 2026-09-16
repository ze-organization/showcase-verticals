import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const linkItemTermsRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "link-item-terms@1",
  name: "link-item-terms",
  displayName: "Terms",
  description: "Footer legal-links item: Terms of Service.",
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: "Terms" },
    Link: { shape: "link-external", href: "/Terms", text: "Terms" },
  },
} satisfies ContentItemRecipe;

export default linkItemTermsRecipe;
