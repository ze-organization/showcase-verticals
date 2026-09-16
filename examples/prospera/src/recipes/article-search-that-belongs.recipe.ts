import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const articleSearchThatBelongsRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "article-search-that-belongs@1",
  name: "search-that-belongs",
  displayName: "When a HELOC is the better file",
  description: "HELOC versus a 30-year refinance — who each product is for.",
  template: "article@1",
  pageDesign: "article-page@1",
  itemPath: "/sitecore/content/{site}/Home/Articles/search-that-belongs",
  fields: {
    Title: "When a HELOC is the better file",
    Eyebrow: "Lending",
    ShortDescription:
      "A home-equity line of credit is a revolving draw against equity. A 30-year mortgage is a first-lien purchase or refinance. Both are subject to credit and equal-housing rules.",
    Content:
      "<p>Use a HELOC when you already own, have usable equity, and want a line for a renovation, education, or a consolidated rate. Use the 30-year mortgage when you are buying or refinancing the first lien.</p><h2>What is illustrative</h2><p>The mortgage APR and the HELOC variable APR on product pages are demonstration figures. Neither page locks a rate.</p><h2>How to start</h2><p>Apply Now. A banker confirms occupancy, title, and combined loan-to-value. Equal Housing Lender.</p>",
    Image: {
      shape: "image",
      mediaPath: "/theme-photos/hub-02.jpg",
      alt: "Business owner and banker reviewing a printed plan",
    },
    MetaTitle: "When a HELOC is the better file — Articles",
    MetaDescription:
      "Compare a Prospera HELOC and a 30-year mortgage. Illustrative APRs. Equal Housing Lender.",
    OgType: "article",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.6",
    ChangeFrequency: "monthly",
    JsonLd:
      '{"@context":"https://schema.org","@type":"Article","headline":"When a HELOC is the better file","author":{"@type":"Person","name":"Amira Hassan"}}',
  },
  layout: { placeholders: {} },
} satisfies PageRecipe;

export default articleSearchThatBelongsRecipe;
