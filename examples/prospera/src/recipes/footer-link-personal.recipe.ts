import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const footerLinkPersonalRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "footer-link-personal@1",
  name: "footer-link-personal",
  displayName: "Personal",
  description:
    "Footer Personal column link: Personal. Patch live footer-column-product@1; do not re-push that treelist.",
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: "Personal" },
    Link: { shape: "link-external", href: "/Products", text: "Personal" },
  },
} satisfies ContentItemRecipe;

export default footerLinkPersonalRecipe;
