import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const eventAuthoringWorkshopRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "event-authoring-workshop@1",
  name: "authoring-workshop",
  displayName: "First-home workshop",
  description: "Branch workshop on buying with a 30-year mortgage.",
  template: "event@1",
  pageDesign: "event-page@1",
  itemPath: "/sitecore/content/{site}/Home/Events/authoring-workshop",
  fields: {
    Title: "First-home workshop",
    Eyebrow: "Workshop",
    ShortDescription:
      "A half-day in branch on down payment, illustrative APR, and what Apply Now will ask. Not a live rate lock.",
    Content:
      "<p>Bring questions about occupancy, income, and closing costs. We will walk the 30-year mortgage product page and the HELOC alternative if you already own. Equal Housing Lender. Rates shown that day remain illustrative for this demonstration.</p>",
    Image: {
      shape: "image",
      mediaPath: "/theme-photos/pdp-01.jpg",
      alt: "Person reviewing household finances at a desk",
    },
    StartDate: "12 May 2026",
    EndDate: "12 May 2026",
    Venue: "New York Midtown",
    RegistrationAction: { href: "/Get-Started", text: "Register" },
    MetaTitle: "First-home workshop — Events — Prospera",
    MetaDescription:
      "Half-day workshop on buying with a Prospera 30-year mortgage. New York Midtown.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.6",
    ChangeFrequency: "monthly",
  },
  layout: { placeholders: {} },
} satisfies PageRecipe;

export default eventAuthoringWorkshopRecipe;
