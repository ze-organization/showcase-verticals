import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { picsum } from "./_theme-photos";

export const offerPartnerOnboardingRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "offer-partner-onboarding@1",
  name: "heloc-intro-rate",
  displayName: "HELOC introductory rate",
  description: "Sample Offer page — introductory HELOC draw rate.",
  template: "offer@1",
  pageDesign: "offer-page@1",
  itemPath: "/sitecore/content/{site}/Home/Offers/heloc-intro-rate",
  fields: {
    Title: "HELOC introductory rate",
    Eyebrow: "Lending",
    OfferText: "Introductory variable draw rate",
    PromoCode: "HELOCINTRO",
    StartDate: "1 Jan 2026",
    EndDate: "31 Dec 2026",
    ShortDescription:
      "A disclosed introductory draw rate on a home equity line of credit. Subject to credit and title.",
    Content:
      "<p>Applications in this window receive an illustrative introductory variable APR on the draw period. After the intro window, the variable rate on the HELOC product page applies. Combined loan-to-value still applies.</p>",
    Terms:
      "<p>Illustrative offer. Subject to credit and title. Not a live rate lock. Equal Housing Lender.</p>",
    CtaLink: {
      href: "/Products/Lending/home-equity-line-of-credit",
      text: "See HELOC",
    },
    Image: {
      shape: "image",
      mediaPath: picsum("home-equity-line-of-credit"),
      alt: "Business owner and banker reviewing a printed plan",
    },
    MetaTitle: "HELOC introductory rate — Offers",
    MetaDescription:
      "Illustrative introductory HELOC draw rate from Prospera. Equal Housing Lender.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.6",
    ChangeFrequency: "monthly",
  },
  layout: { placeholders: {} },
} satisfies PageRecipe;

export default offerPartnerOnboardingRecipe;
