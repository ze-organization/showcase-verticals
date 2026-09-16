import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { picsum } from "./_theme-photos";

export const jobPlatformEngineerRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "job-platform-engineer@1",
  name: "credit-underwriter",
  displayName: "Credit underwriter",
  description: "Credit underwriter — mortgage and HELOC files.",
  template: "job@1",
  pageDesign: "job-page@1",
  itemPath: "/sitecore/content/{site}/Home/Careers/credit-underwriter",
  fields: {
    Title: "Credit underwriter",
    Eyebrow: "Lending",
    ShortDescription:
      "Underwrite 30-year mortgages and HELOC draws. Occupancy, title, and combined loan-to-value as facts.",
    Content:
      "<p>You underwrite purchase, refinance, and home-equity files. APRs on the site are illustrations. Equal Housing Lender. You do not lock a rate from a marketing page.</p>",
    Image: {
      shape: "image",
      mediaPath: picsum("hub-business"),
      alt: "Banker reviewing a printed plan",
    },
    Department: "Lending",
    EmploymentType: "Full-time",
    LocationName: "New York Midtown",
    LocationLink: {
      href: "/Locations/North-America/New-York/new-york-midtown",
      text: "New York Midtown",
    },
    MetaTitle: "Credit underwriter — Careers — Prospera",
    MetaDescription: "Full-time lending role in New York Midtown at Prospera Bank, N.A.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.6",
    ChangeFrequency: "monthly",
  },
  layout: { placeholders: {} },
} satisfies PageRecipe;

export default jobPlatformEngineerRecipe;
