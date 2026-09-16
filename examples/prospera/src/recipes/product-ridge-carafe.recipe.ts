import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { picsum } from "./_theme-photos";

export const productRidgeCarafeRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "product-ridge-carafe@1",
  name: "thirty-year-mortgage",
  displayName: "30-year mortgage",
  description: "30-year fixed-rate mortgage — purchase or refinance.",
  template: "product@1",
  pageDesign: "product-page@1",
  itemPath: "/sitecore/content/{site}/Home/Products/Lending/thirty-year-mortgage",
  fields: {
    Title: "30-year mortgage",
    Eyebrow: "Lending",
    ShortDescription:
      "Fixed-rate purchase or refinance. Illustrative 6.375% APR. This page does not lock a rate.",
    Content:
      "<p>The 30-year mortgage is a first-lien purchase or refinance. The illustrative APR is 6.375%. Points, closing costs, and escrow are disclosed under Rates &amp; fees. This page does not lock a rate and is not a live commitment.</p><h2>Who it is for</h2><p>Buyers and refinancers who want a fixed payment they can plan around. Equal Housing Lender rules apply. We will ask occupancy, income, and credit facts before pre-approval.</p><h2>What is included</h2><ul><li>Purchase or rate-and-term refinance on a primary residence in this demonstration</li><li>A banker who walks estimates, not a self-serve lock widget</li><li>Disclosures for APR, points, and closing costs on Rates &amp; fees</li></ul><h2>How to apply</h2><p>Apply Now collects name, property intent, and a callback. Pre-approval is a separate step. Compare a HELOC if you already own and need a revolving line instead of a first mortgage.</p><p><small>Prospera Bank, N.A., Member FDIC. Equal Housing Lender. APR on this page is illustrative for a demonstration and is not a live offer or rate lock.</small></p>",
    Category: "Lending",
    Price: "6.375% APR",
    Sku: "MTG-30",
    Image1: {
      shape: "image",
      mediaPath: picsum("thirty-year-mortgage"),
      alt: "Advisor and customer reviewing a budget",
    },
    Image2: {
      shape: "image",
      mediaPath: picsum("promo-closer"),
      alt: "Advisor walking with a customer through a branch lobby",
    },
    MetaTitle: "30-year mortgage — Prospera",
    MetaDescription:
      "30-year mortgage from Prospera Bank, N.A. Illustrative 6.375% APR. Equal Housing Lender. Apply Now to start a conversation.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.6",
    ChangeFrequency: "monthly",
    JsonLd:
      '{"@context":"https://schema.org","@type":"LoanOrCredit","name":"30-year mortgage","brand":"Prospera"}',
  },
  layout: { placeholders: {} },
} satisfies PageRecipe;

export default productRidgeCarafeRecipe;
