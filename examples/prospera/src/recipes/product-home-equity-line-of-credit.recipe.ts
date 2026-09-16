import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { picsum } from "./_theme-photos";

export const productHomeEquityLineRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "product-home-equity-line-of-credit@1",
  name: "home-equity-line-of-credit",
  displayName: "Home equity line of credit",
  description: "HELOC — draw against home equity with a disclosed variable APR.",
  template: "product@1",
  pageDesign: "product-page@1",
  itemPath:
    "/sitecore/content/{site}/Home/Products/Lending/home-equity-line-of-credit",
  fields: {
    Title: "Home equity line of credit",
    Eyebrow: "Lending",
    ShortDescription:
      "Draw against home equity for a renovation, education, or a consolidated rate. Illustrative variable APR. Subject to credit and title.",
    Content:
      "<p>A home-equity line of credit lets you draw against equity you already have. Use it for a renovation, education, or to consolidate a higher-rate balance — not as a second unsecured card. The illustrative APR is variable. Combined loan-to-value and the draw period are disclosed here as facts.</p><h2>Who it is for</h2><p>Homeowners with usable equity who want a revolving line rather than a new first mortgage. Occupancy and title still have to check out. Equal Housing Lender rules apply.</p><h2>What is included</h2><ul><li>A draw period followed by repayment, described on Rates &amp; fees</li><li>Variable illustrative APR — this is not a live lock</li><li>A banker who confirms combined loan-to-value before closing</li></ul><h2>How to apply</h2><p>Apply Now starts the conversation. We will ask property address, occupancy, and income. Compare the 30-year mortgage if you need a first-lien purchase or refinance instead of a line.</p><p><small>Prospera Bank, N.A., Member FDIC. Equal Housing Lender. APR on this page is illustrative for a demonstration and is not a live offer or rate lock.</small></p>",
    Category: "Lending",
    Price: "Variable APR",
    Sku: "HELOC-01",
    Image1: {
      shape: "image",
      mediaPath: picsum("home-equity-line-of-credit"),
      alt: "Business owner and banker reviewing a printed plan",
    },
    Image2: {
      shape: "image",
      mediaPath: picsum("hub-personal"),
      alt: "Customer and banker reviewing a household budget",
    },
    MetaTitle: "Home equity line of credit — Prospera",
    MetaDescription:
      "HELOC from Prospera Bank, N.A. Illustrative variable APR. Equal Housing Lender. Apply Now to start.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.6",
    ChangeFrequency: "monthly",
    JsonLd:
      '{"@context":"https://schema.org","@type":"LoanOrCredit","name":"Home equity line of credit","brand":"Prospera"}',
  },
  layout: { placeholders: {} },
} satisfies PageRecipe;

export default productHomeEquityLineRecipe;
