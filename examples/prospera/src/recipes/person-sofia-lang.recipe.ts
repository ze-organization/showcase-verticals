import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { picsum } from "./_theme-photos";

export const personSofiaLangRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "person-sofia-lang@1",
  name: "sofia-lang",
  displayName: "Sofia Lang",
  description: "Sample Person page — wealth advisor.",
  template: "person@1",
  pageDesign: "person-page@1",
  itemPath: "/sitecore/content/{site}/Home/People/sofia-lang",
  fields: {
    Title: "Sofia Lang",
    FullName: "Sofia Lang",
    Role: "Wealth Advisor",
    Eyebrow: "Advice",
    Bio: "<p>Sofia plans next to checking and the operating account — cash, retirement, and concentrated equity for households and owners who already bank with Prospera.</p>",
    Image: {
      shape: "image",
      mediaPath: picsum("promo-closer"),
      alt: "Portrait of Sofia Lang",
    },
    Email: "sofia.lang@prospera.example",
    MetaTitle: "Sofia Lang — Prospera",
    MetaDescription: "Wealth advisor at Prospera Bank, N.A.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.6",
    ChangeFrequency: "monthly",
  },
  layout: { placeholders: {} },
} satisfies PageRecipe;

export default personSofiaLangRecipe;
