import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** Mega-menu column link for the shared primary nav (`nav-group-resources@1`). */
export const navLinkCaseStudiesRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "nav-link-case-studies@1",
  name: "nav-link-case-studies",
  displayName: "Case Studies",
  description:
    "Primary-nav dropdown link: Case Studies. Patch the live Resources Groups treelist after push; do not re-push nav-group-resources@1.",
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: "Case Studies" },
    Link: {
      shape: "link-external",
      href: "/Case-Studies",
      text: "Case Studies",
    },
  },
} satisfies ContentItemRecipe;

export default navLinkCaseStudiesRecipe;
