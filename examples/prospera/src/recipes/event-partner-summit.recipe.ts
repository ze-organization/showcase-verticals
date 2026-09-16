import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const eventPartnerSummitRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "event-partner-summit@1",
  name: "partner-summit",
  displayName: "Treasury breakfast",
  description: "Morning briefing for controllers and commercial bankers.",
  template: "event@1",
  pageDesign: "event-page@1",
  itemPath: "/sitecore/content/{site}/Home/Events/partner-summit",
  fields: {
    Title: "Treasury breakfast",
    Eyebrow: "Commercial",
    ShortDescription:
      "A morning with controllers on ACH, wires, and liquidity reporting. Eligibility still lives on the Business hub.",
    Content:
      "<p>Julian Park hosts. Bring monthly payment volume and entity type if you intend to apply afterward. This is not a live account opening.</p>",
    Image: {
      shape: "image",
      mediaPath: "/theme-photos/hub-01.jpg",
      alt: "Advisor and customer at a branch table",
    },
    StartDate: "3 Jun 2026",
    EndDate: "3 Jun 2026",
    Venue: "Chicago Loop",
    RegistrationAction: { href: "/Get-Started", text: "Register" },
    MetaTitle: "Treasury breakfast — Events — Prospera",
    MetaDescription: "Commercial treasury briefing at Prospera. Chicago Loop.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.6",
    ChangeFrequency: "monthly",
  },
  layout: { placeholders: {} },
} satisfies PageRecipe;

export default eventPartnerSummitRecipe;
