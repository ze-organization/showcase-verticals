import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** Mega-menu column link for the shared primary nav (`nav-group-resources@1`). */
export const navLinkSupportCenterRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "nav-link-support-center@1",
  name: "nav-link-support-center",
  displayName: "Support Center",
  description: "Primary-nav dropdown link: Support Center.",
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: "Support Center" },
    Link: { shape: "link-external", href: "/Support", text: "Support Center" },
  },
} satisfies ContentItemRecipe;

export default navLinkSupportCenterRecipe;
