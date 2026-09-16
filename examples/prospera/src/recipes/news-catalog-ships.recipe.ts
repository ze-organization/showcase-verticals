import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

const seo = {
  OgType: "article",
  TwitterCard: "summary_large_image",
  IncludeInSitemap: "true",
  SitemapPriority: "0.6",
  ChangeFrequency: "monthly",
} as const;

export const newsCatalogShipsRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "news-catalog-ships@1",
  name: "catalog-ships-insertable-types",
  displayName: "Illustrative high-yield APY restated",
  description: "News — demonstration APY disclosure update.",
  template: "news@1",
  pageDesign: "news-page@1",
  itemPath: "/sitecore/content/{site}/Home/News/catalog-ships-insertable-types",
  fields: {
    Title: "Illustrative high-yield APY restated at 4.15%",
    Eyebrow: "Deposits",
    ShortDescription:
      "The high-yield savings product page now shows 4.15% APY as an illustration. This is not a live offer.",
    Content:
      "<p>Prospera restates the demonstration APY on high-yield savings as 4.15%, compounded monthly in this demo. Compare the product page and Rates &amp; fees before you apply. Offers may list a bonus window — still illustrative.</p><p>Member FDIC. Equal Housing Lender.</p>",
    Image: {
      shape: "image",
      mediaPath: "/theme-photos/promo-closer.jpg",
      alt: "Advisor walking with a customer through a branch lobby",
    },
    Source: "Prospera",
    DisplayDate: "2026-08-12",
    MetaTitle: "Illustrative high-yield APY restated — News — Prospera",
    MetaDescription:
      "Prospera restates the demonstration high-yield savings APY. Not a live offer. Member FDIC.",
    ...seo,
  },
  layout: { placeholders: {} },
} satisfies PageRecipe;

export default newsCatalogShipsRecipe;
