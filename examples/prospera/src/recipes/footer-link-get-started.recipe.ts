import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** Footer link-columns / legal item. */
export const footerLinkGetStartedRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "footer-link-get-started@1",
  name: "footer-link-get-started",
  displayName: "Apply Now",
  description: "Footer Company column link: Apply Now.",
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: "Apply Now" },
    Link: { shape: "link-external", href: "/Get-Started", text: "Apply Now" },
  },
} satisfies ContentItemRecipe;

export default footerLinkGetStartedRecipe;
