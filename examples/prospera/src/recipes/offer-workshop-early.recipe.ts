import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { picsum } from "./_theme-photos";

export const offerWorkshopEarlyRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "offer-workshop-early@1",
  name: "checking-fee-waiver",
  displayName: "Checking fee waiver",
  description: "Sample Offer page — monthly fee waiver.",
  template: "offer@1",
  pageDesign: "offer-page@1",
  itemPath: "/sitecore/content/{site}/Home/Offers/checking-fee-waiver",
  fields: {
    Title: "Checking fee waiver",
    Eyebrow: "Checking",
    OfferText: "Monthly maintenance waived for 12 months",
    PromoCode: "CHK0",
    StartDate: "1 Apr 2026",
    EndDate: "11 May 2026",
    ShortDescription:
      "Sample monthly fee waived for twelve months on everyday checking.",
    Content:
      "<p>Everyday checking applications in this window receive a twelve-month waiver of the sample monthly maintenance fee. After twelve months, qualifying-activity terms on the product page apply.</p>",
    Terms:
      "<p>Sample offer. One waiver per household. Not a live account opening.</p>",
    CtaLink: {
      href: "/Products/Checking-and-Savings/everyday-checking",
      text: "See everyday checking",
    },
    Image: {
      shape: "image",
      mediaPath: picsum("everyday-checking"),
      alt: "Person reviewing household finances at a desk",
    },
    MetaTitle: "Checking fee waiver — Offers",
    MetaDescription: "Sample 12-month monthly fee waiver on Prospera everyday checking.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.6",
    ChangeFrequency: "monthly",
  },
  layout: { placeholders: {} },
} satisfies PageRecipe;

export default offerWorkshopEarlyRecipe;
