import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** Utility-strip link for the `header-two-tier@1` stock header. */
export const utilityLinkContactRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "utility-link-contact@1",
  name: "utility-link-contact",
  displayName: "Contact",
  description: "Header utility-strip item: Contact link.",
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: "Contact" },
    Link: { shape: "link-external", href: "/Contact", text: "Contact" },
  },
} satisfies ContentItemRecipe;

export default utilityLinkContactRecipe;
