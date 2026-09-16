import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const newsHubParentsRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "news-hub-parents@1",
  name: "hub-parents-read-as-a-site",
  displayName: "New Midtown branch hours",
  description: "News — New York Midtown lobby hours.",
  template: "news@1",
  pageDesign: "news-page@1",
  itemPath: "/sitecore/content/{site}/Home/News/hub-parents-read-as-a-site",
  fields: {
    Title: "New York Midtown extends lobby hours",
    Eyebrow: "Branches",
    ShortDescription:
      "Walk-in hours expand so Apply Now files and HELOC conversations can finish in person. Locations remains the finder.",
    Content:
      "<p>New York Midtown now lists extended lobby hours on its location page. Other metros stay on the North America territory. Prospera does not tell a branchless story.</p><p>Login remains a header link. Apply Now remains the conversion button.</p>",
    Image: {
      shape: "image",
      mediaPath: "/theme-photos/hub-01.jpg",
      alt: "Advisor walking with a customer through a branch lobby",
    },
    Source: "Prospera",
    DisplayDate: "2026-08-26",
    MetaTitle: "New York Midtown lobby hours — News — Prospera",
    MetaDescription:
      "Prospera New York Midtown extends lobby hours. Find a branch under Locations.",
    OgType: "article",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.6",
    ChangeFrequency: "monthly",
  },
  layout: { placeholders: {} },
} satisfies PageRecipe;

export default newsHubParentsRecipe;
