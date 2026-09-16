import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const newsListingInsertRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "news-listing-insert@1",
  name: "listing-insert-options",
  displayName: "HELOC credit policy reminder",
  description: "News — HELOC occupancy and combined LTV reminder.",
  template: "news@1",
  pageDesign: "news-page@1",
  itemPath: "/sitecore/content/{site}/Home/News/listing-insert-options",
  fields: {
    Title: "HELOC files still need occupancy and title",
    Eyebrow: "Lending",
    ShortDescription:
      "A home-equity line of credit remains subject to credit, occupancy, and combined loan-to-value. Apply Now starts a conversation, not a lock.",
    Content:
      "<p>Lending reminds applicants that a HELOC is a revolving draw against equity. The variable APR on the product page is illustrative. Equal Housing Lender.</p><p>Compare a 30-year mortgage if you need a first-lien purchase or refinance instead.</p>",
    Image: {
      shape: "image",
      mediaPath: "/theme-photos/pdp-01.jpg",
      alt: "Person reviewing household finances at a desk",
    },
    Source: "Prospera",
    DisplayDate: "2026-08-19",
    MetaTitle: "HELOC occupancy reminder — News — Prospera",
    MetaDescription:
      "Prospera HELOC files still require occupancy, title, and combined LTV. Illustrative APR.",
    OgType: "article",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.6",
    ChangeFrequency: "monthly",
  },
  layout: { placeholders: {} },
} satisfies PageRecipe;

export default newsListingInsertRecipe;
