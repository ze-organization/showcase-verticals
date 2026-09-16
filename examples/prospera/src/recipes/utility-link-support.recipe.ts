import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** Utility-strip link for the `header-two-tier@1` stock header. */
export const utilityLinkSupportRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "utility-link-support@1",
  name: "utility-link-support",
  displayName: "Support",
  description: "Header utility-strip item: Support link.",
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: "Support" },
    Link: { shape: "link-external", href: "/Support", text: "Support" },
  },
} satisfies ContentItemRecipe;

export default utilityLinkSupportRecipe;
