import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const navItemResourcesRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "nav-item-resources@1",
  name: "nav-item-resources",
  displayName: "Resources",
  description: "Top-level nav item: Resources.",
  templateType: "nav-item@1",
  fields: {
    Title: { shape: "text", value: "Resources" },
    Link: { shape: "link-external", href: "/Resources", text: "Resources" },
    // Field-driven Groups (below) carry the dropdown content. HasPanel
    // stays OFF: it points the item at a `nav-item-panel-{index}`
    // placeholder no stock experience composes anything into, and it
    // WINS over Groups when both are set — the old `true` seed is why
    // every stock nav chevron opened an empty panel.
    HasPanel: { shape: "boolean", value: false },
    Groups: { shape: "reference", refs: ["nav-group-resources@1"] },
  },
} satisfies ContentItemRecipe;

export default navItemResourcesRecipe;
