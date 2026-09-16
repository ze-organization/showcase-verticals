import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const articleFromRecipeToLiveRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "article-from-recipe-to-live@1",
  name: "from-recipe-to-live",
  displayName: "What FDIC insurance covers here",
  description: "How this demonstration talks about FDIC insurance without inventing a certificate number.",
  template: "article@1",
  pageDesign: "article-page@1",
  itemPath: "/sitecore/content/{site}/Home/Articles/from-recipe-to-live",
  fields: {
    Title: "What FDIC insurance covers here",
    Eyebrow: "Disclosures",
    ShortDescription:
      "Prospera Bank, N.A. is fictional. Copy treats deposits as FDIC-insured to applicable limits, the way a live U.S. bank would disclose — without inventing a certificate or routing number.",
    Content:
      "<p>On a live national bank, deposit accounts are insured by the Federal Deposit Insurance Corporation to applicable limits. This site is a demonstration. We still use that voice so the franchise reads as a Category I bank, not a neobank.</p><h2>What we will not invent</h2><p>Certificate numbers, routing numbers, and live insurance IDs. If a page needs a footnote, it is Member FDIC and Equal Housing Lender.</p><h2>Investments</h2><p>Wealth planning and retirement may mention securities. Bank deposits would be insured; investment products would not. This demonstration does not sell securities.</p>",
    Image: {
      shape: "image",
      mediaPath: "/theme-photos/hub-02.jpg",
      alt: "Advisor walking with a customer through a branch lobby",
    },
    MetaTitle: "What FDIC insurance covers here — Articles",
    MetaDescription:
      "How Prospera discloses FDIC insurance on a demonstration site. No invented certificate or routing numbers.",
    OgType: "article",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.6",
    ChangeFrequency: "monthly",
    JsonLd:
      '{"@context":"https://schema.org","@type":"Article","headline":"What FDIC insurance covers here","author":{"@type":"Person","name":"Amira Hassan"}}',
  },
  layout: { placeholders: {} },
} satisfies PageRecipe;

export default articleFromRecipeToLiveRecipe;
