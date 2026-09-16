import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const footerLinkStatusRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "footer-link-status@1",
  name: "footer-link-status",
  displayName: "Help",
  description: "Leftover footer Status item retargeted to Help/Support.",
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: "Help" },
    Link: { shape: "link-external", href: "/Support", text: "Help" },
  },
} satisfies ContentItemRecipe;

export default footerLinkStatusRecipe;
