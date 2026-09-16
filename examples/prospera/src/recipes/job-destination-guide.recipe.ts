import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { picsum } from "./_theme-photos";

export const jobDestinationGuideRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "job-destination-guide@1",
  name: "branch-banker",
  displayName: "Branch banker",
  description: "Branch banker — help customers open checking and walk lending files in person.",
  template: "job@1",
  pageDesign: "job-page@1",
  itemPath: "/sitecore/content/{site}/Home/Careers/branch-banker",
  fields: {
    Title: "Branch banker",
    Eyebrow: "Branches",
    ShortDescription:
      "Help customers open everyday checking, walk a HELOC conversation, and finish Apply Now files in person.",
    Content:
      "<p>You work a Prospera branch. You explain illustrative rates as facts, point people at Rates &amp; fees, and never treat Login as a second conversion button.</p><p>Equal Housing Lender. Member FDIC in this demonstration’s voice.</p>",
    Image: {
      shape: "image",
      mediaPath: picsum("promo-closer"),
      alt: "Advisor walking with a customer through a branch lobby",
    },
    Department: "Branch",
    EmploymentType: "Full-time",
    LocationName: "New York Midtown",
    LocationLink: {
      href: "/Locations/North-America/New-York/new-york-midtown",
      text: "New York Midtown",
    },
    MetaTitle: "Branch banker — Careers — Prospera",
    MetaDescription: "Full-time branch role in New York Midtown at Prospera Bank, N.A.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.6",
    ChangeFrequency: "monthly",
  },
  layout: { placeholders: {} },
} satisfies PageRecipe;

export default jobDestinationGuideRecipe;
