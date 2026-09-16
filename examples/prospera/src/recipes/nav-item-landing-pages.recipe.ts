import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const navItemLandingPagesRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "nav-item-landing-pages@1",
  name: "nav-item-landing-pages",
  displayName: "Landing Pages",
  description:
    "Top-level nav item: Landing Pages — flat link, no mega-menu panel. Patch the live primary-nav Treelist after push; do not re-push primary-nav-content@1.",
  templateType: "nav-item@1",
  fields: {
    Title: { shape: "text", value: "Landing Pages" },
    Link: {
      shape: "link-external",
      href: "/Landing-Pages",
      text: "Landing Pages",
    },
    HasPanel: { shape: "boolean", value: false },
  },
} satisfies ContentItemRecipe;

export default navItemLandingPagesRecipe;
