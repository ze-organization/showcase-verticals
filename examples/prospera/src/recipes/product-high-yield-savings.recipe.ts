import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { picsum } from "./_theme-photos";

export const productHighYieldSavingsRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "product-high-yield-savings@1",
  name: "high-yield-savings",
  displayName: "High-yield savings",
  description: "High-yield savings — published illustrative APY and savings goals.",
  template: "product@1",
  pageDesign: "product-page@1",
  itemPath:
    "/sitecore/content/{site}/Home/Products/Checking-and-Savings/high-yield-savings",
  fields: {
    Title: "High-yield savings",
    Eyebrow: "Checking & Savings",
    ShortDescription:
      "A published APY on balances you do not need this week. Set savings goals inside the account. Illustrative rate — not a teaser.",
    Content:
      "<p>High-yield savings is for cash you intend to keep. Pair it with everyday checking so paychecks land in checking and surplus moves here. Savings goals let you label balances for rent, a repair, or a down payment without opening a second product type.</p><h2>Who it is for</h2><p>Households that want yield stated as a fact, including people who would look for a U.S. high-yield savings account or CD rather than a UK ISA. Certificates of deposit, when shown, are on Rates &amp; fees — not a separate tax wrapper.</p><h2>APY</h2><p>4.15% APY is an illustrative annual percentage yield as of this page. It can change. Compounding is monthly in this demonstration. Six convenient withdrawals per statement cycle is the pattern we disclose.</p><h2>How to apply</h2><p>Apply Now starts the file. Funding can come from everyday checking or an external transfer a banker will describe.</p><p><small>Prospera Bank, N.A., Member FDIC. Equal Housing Lender. APY on this page is illustrative for a demonstration and is not a live offer.</small></p>",
    Category: "Checking & Savings",
    Price: "4.15% APY",
    Sku: "SAV-01",
    Image1: {
      shape: "image",
      mediaPath: picsum("high-yield-savings"),
      alt: "Advisor and customer reviewing a budget",
    },
    Image2: {
      shape: "image",
      mediaPath: picsum("pdp"),
      alt: "Person reviewing a household checklist at a desk",
    },
    MetaTitle: "High-yield savings — Prospera",
    MetaDescription:
      "High-yield savings from Prospera Bank, N.A. Illustrative 4.15% APY. Member FDIC.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.6",
    ChangeFrequency: "monthly",
    JsonLd:
      '{"@context":"https://schema.org","@type":"BankAccount","name":"High-yield savings","brand":"Prospera"}',
  },
  layout: { placeholders: {} },
} satisfies PageRecipe;

export default productHighYieldSavingsRecipe;
