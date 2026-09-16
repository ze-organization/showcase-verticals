import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { picsum } from "./_theme-photos";

export const productHarborLoungeChairRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "product-harbor-lounge-chair@1",
  name: "rewards-visa",
  displayName: "Rewards Visa",
  description: "Rewards Visa — everyday cash back and virtual card numbers.",
  template: "product@1",
  pageDesign: "product-page@1",
  itemPath: "/sitecore/content/{site}/Home/Products/Cards/rewards-visa",
  fields: {
    Title: "Rewards Visa",
    Eyebrow: "Cards",
    ShortDescription:
      "Everyday purchase rewards. Illustrative 1.5% cash back and no annual fee. Virtual card numbers for subscriptions and vendors.",
    Content:
      "<p>The Rewards Visa is a purchase card for ordinary spend. Cash back is 1.5% in this demonstration and posts as a statement credit. There is no annual fee in the sample. Foreign transaction fees are listed under Rates &amp; fees.</p><h2>Who it is for</h2><p>Customers who already have or are opening everyday checking, and who want one card for groceries, travel, and bills — not a lifestyle object.</p><h2>Virtual cards</h2><p>Issue a virtual number for a subscription or a vendor without sharing the physical card. Limits and close dates are set in online banking after approval. This page does not reproduce in-app chrome.</p><h2>How to apply</h2><p>Apply Now starts the application. Approval is based on credit and is not guaranteed here.</p><p><small>Prospera Bank, N.A., Member FDIC. Equal Housing Lender. Rewards and fees on this page are illustrative for a demonstration and are not a live offer.</small></p>",
    Category: "Cards",
    Price: "0 annual fee",
    Sku: "CRD-01",
    Image1: {
      shape: "image",
      mediaPath: picsum("rewards-visa"),
      alt: "Person reviewing household finances at a desk",
    },
    Image2: {
      shape: "image",
      mediaPath: picsum("hub-personal"),
      alt: "Customer and banker reviewing a household budget",
    },
    MetaTitle: "Rewards Visa — Prospera",
    MetaDescription:
      "Prospera Rewards Visa. Illustrative 1.5% cash back, no annual fee, and virtual card numbers. Apply Now.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.6",
    ChangeFrequency: "monthly",
    JsonLd:
      '{"@context":"https://schema.org","@type":"CreditCard","name":"Rewards Visa","brand":"Prospera"}',
  },
  layout: { placeholders: {} },
} satisfies PageRecipe;

export default productHarborLoungeChairRecipe;
