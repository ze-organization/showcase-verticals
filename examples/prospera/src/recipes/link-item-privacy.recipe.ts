import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const linkItemPrivacyRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "link-item-privacy@1",
  name: "link-item-privacy",
  displayName: "Privacy",
  description: "Footer legal-links item: Privacy Policy.",
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: "Privacy" },
    Link: { shape: "link-external", href: "/Privacy", text: "Privacy" },
  },
} satisfies ContentItemRecipe;

export default linkItemPrivacyRecipe;
