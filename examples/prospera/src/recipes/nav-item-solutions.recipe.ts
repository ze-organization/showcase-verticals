import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const navItemSolutionsRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "nav-item-solutions@1",
  name: "nav-item-solutions",
  displayName: "Advice",
  description: "Leftover nav item retargeted to /Services (Advice). Not in locked header.",
  templateType: "nav-item@1",
  fields: {
    Title: { shape: "text", value: "Advice" },
    Link: { shape: "link-external", href: "/Services", text: "Advice" },
    // Field-driven Groups (below) carry the dropdown content. HasPanel
    // stays OFF: it points the item at a `nav-item-panel-{index}`
    // placeholder no stock experience composes anything into, and it
    // WINS over Groups when both are set — the old `true` seed is why
    // every stock nav chevron opened an empty panel.
    HasPanel: { shape: "boolean", value: false },
    Groups: { shape: "reference", refs: ["nav-group-solutions@1"] },
  },
} satisfies ContentItemRecipe;

export default navItemSolutionsRecipe;
