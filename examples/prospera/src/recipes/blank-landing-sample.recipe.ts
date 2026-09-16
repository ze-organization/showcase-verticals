import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Sample Blank Landing — chrome only. `container-1` is empty so authors
 * (or a later page recipe) can drop heroes, grids, and CTAs themselves.
 */
export const blankLandingSampleRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "blank-landing-sample@1",
  name: "blank",
  displayName: "Blank landing",
  description:
    "Sample Blank Landing page — header and footer with an empty main Container.",
  template: "blank-landing@1",
  pageDesign: "blank-landing-page@1",
  itemPath: "/sitecore/content/{site}/Home/Landing-Pages/blank",
  fields: {
    Title: "Budget planner",
    Eyebrow: "Checking",
    MetaTitle: "Budget planner — Prospera",
    MetaDescription:
      "A blank canvas for a checking campaign. Header and footer are in place.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.5",
    ChangeFrequency: "monthly",
  },
  layout: { placeholders: {} },
} satisfies PageRecipe;

export default blankLandingSampleRecipe;
