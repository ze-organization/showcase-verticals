import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const eventOpenStudioRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "event-open-studio@1",
  name: "open-studio",
  displayName: "Branch open house",
  description: "Walk-in hours at New York Midtown.",
  template: "event@1",
  pageDesign: "event-page@1",
  itemPath: "/sitecore/content/{site}/Home/Events/open-studio",
  fields: {
    Title: "Branch open house",
    Eyebrow: "Branches",
    ShortDescription:
      "Walk in. Ask about checking, a HELOC, or a commercial file. No ticket.",
    Content:
      "<p>New York Midtown hosts. Bring identification if you intend to start Apply Now in person. Locations lists other branches. We do not tell a branchless story.</p>",
    Image: {
      shape: "image",
      mediaPath: "/theme-photos/promo-closer.jpg",
      alt: "Advisor walking with a customer through a branch lobby",
    },
    StartDate: "18 Sep 2026",
    EndDate: "18 Sep 2026",
    Venue: "New York Midtown",
    RegistrationAction: { href: "/Contact", text: "Ask a question" },
    MetaTitle: "Branch open house — Events — Prospera",
    MetaDescription: "Walk-in hours at Prospera New York Midtown.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.6",
    ChangeFrequency: "monthly",
  },
  layout: { placeholders: {} },
} satisfies PageRecipe;

export default eventOpenStudioRecipe;
