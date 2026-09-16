import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { picsum } from "./_theme-photos";

export const offerSpringDeskRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "offer-spring-desk@1",
  name: "high-yield-bonus",
  displayName: "High-yield bonus APY",
  description: "Sample Offer page — bonus APY, not a retail sale.",
  template: "offer@1",
  pageDesign: "offer-page@1",
  itemPath: "/sitecore/content/{site}/Home/Offers/high-yield-bonus",
  fields: {
    Title: "High-yield bonus APY",
    Eyebrow: "Savings",
    OfferText: "4.40% APY for a limited window",
    PromoCode: "APY4.40",
    StartDate: "1 Mar 2026",
    EndDate: "30 Apr 2026",
    ShortDescription:
      "A disclosed bonus APY on high-yield savings. Sample rate, not a teaser without terms.",
    Content:
      "<p>New high-yield savings applications in this window receive an illustrative 4.40% APY. After the window, the standard illustrative APY on the product page applies.</p>",
    Terms:
      "<p>Illustrative offer. One bonus APY per household. FDIC insurance up to applicable limits in this demonstration’s voice. Not a live account opening.</p>",
    CtaLink: {
      href: "/Products/Checking-and-Savings/high-yield-savings",
      text: "See high-yield savings",
    },
    Image: {
      shape: "image",
      mediaPath: picsum("high-yield-savings"),
      alt: "Advisor and customer reviewing a budget",
    },
    MetaTitle: "High-yield bonus APY — Offers",
    MetaDescription: "Sample 4.40% APY promotion on Prospera high-yield savings.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.6",
    ChangeFrequency: "monthly",
  },
  layout: { placeholders: {} },
} satisfies PageRecipe;

export default offerSpringDeskRecipe;
