import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** Footer link-columns / legal item. */
export const linkItemAccessibilityRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "link-item-accessibility@1",
  name: "link-item-accessibility",
  displayName: "Accessibility",
  description: 'Footer legal-links item: Accessibility. Patch live footer-legal-content@1; do not re-push that treelist.',
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: 'Accessibility' },
    Link: { shape: "link-external", href: '/Accessibility', text: 'Accessibility' },
  },
} satisfies ContentItemRecipe;

export default linkItemAccessibilityRecipe;
