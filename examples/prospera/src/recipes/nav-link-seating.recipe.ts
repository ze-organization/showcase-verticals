import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** Mega-menu column link for the shared primary nav. */
export const navLinkSeatingRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "nav-link-seating@1",
  name: "nav-link-seating",
  displayName: "Cards",
  description: "Primary-nav Products dropdown link: Cards. Patch live treelist; do not re-push.",
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: "Cards" },
    Link: { shape: "link-external", href: "/Products/Cards", text: "Cards" },
  },
} satisfies ContentItemRecipe;

export default navLinkSeatingRecipe;
