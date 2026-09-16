import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const partnerNorthwindRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "partner-northwind@1",
  name: "northwind-systems",
  displayName: "Clearpath Core",
  description: "Core-processing partner for deposit and lending records.",
  template: "partner@1",
  pageDesign: "partner-page@1",
  itemPath: "/sitecore/content/{site}/Home/Partners/northwind-systems",
  fields: {
    Title: "Clearpath Core",
    Eyebrow: "Technology",
    PartnerType: "Technology",
    ShortDescription:
      "Core processing for deposits, cards, and lending records — the systems layer behind everyday checking and the HELOC file.",
    Content:
      "<p>Clearpath Core is a demonstration technology partner. In a live franchise they would process deposit and loan records so checking, savings, and lending stay reconcilable. This page does not imply a live integration.</p>",
    Image: {
      shape: "image",
      mediaPath: "/theme-photos/hub-01.jpg",
      alt: "Advisor and customer at a branch table",
    },
    Logo: {
      shape: "image",
      mediaPath: "/theme-photos/hub-02.jpg",
      alt: "Clearpath Core mark",
    },
    Website: { href: "https://example.com", text: "Visit Clearpath" },
    MetaTitle: "Clearpath Core — Partner — Prospera",
    MetaDescription: "Technology partner for deposit and lending records at Prospera Bank, N.A.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.6",
    ChangeFrequency: "monthly",
  },
  layout: { placeholders: {} },
} satisfies PageRecipe;

export default partnerNorthwindRecipe;
