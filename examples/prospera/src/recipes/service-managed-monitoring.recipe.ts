import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { picsum } from "./_theme-photos";

export const serviceManagedMonitoringRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "service-managed-monitoring@1",
  name: "retirement",
  displayName: "Retirement",
  description: "Retirement — IRAs and workplace plans as account types.",
  template: "service@1",
  pageDesign: "service-page@1",
  itemPath: "/sitecore/content/{site}/Home/Services/retirement",
  fields: {
    Title: "Retirement",
    Eyebrow: "Advice",
    ShortDescription:
      "IRAs, rollovers, and workplace plans stated as account types with contribution limits and required disclosures.",
    Content:
      "<p>Retirement services cover IRAs, rollovers, and workplace plans. Contribution limits, required minimum distributions, and fees are facts — we do not sell a beach photograph as a product.</p><h2>Who it is for</h2><p>Households rolling a former employer plan, owners setting up a workplace plan, and people who want an IRA next to everyday checking.</p><h2>What we cover</h2><ul><li>Traditional and Roth IRAs as account types in this demonstration</li><li>Rollovers described as a process, not a promotion</li><li>Workplace plans coordinated with treasury when the company already banks here</li></ul><h2>How to start</h2><p>Apply Now if you want a banker to walk the options. Illustrative contribution limits and fees are on Rates &amp; fees.</p><p><small>Prospera Bank, N.A., Member FDIC. Bank deposits are insured to applicable limits; investment products are not. This demonstration does not open a live IRA.</small></p>",
    Image: {
      shape: "image",
      mediaPath: picsum("retirement"),
      alt: "Customer and banker reviewing a household budget",
    },
    MetaTitle: "Retirement — Prospera",
    MetaDescription:
      "Retirement accounts and planning from Prospera Bank, N.A. IRAs and workplace plans with disclosed limits.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.6",
    ChangeFrequency: "monthly",
  },
  layout: { placeholders: {} },
} satisfies PageRecipe;

export default serviceManagedMonitoringRecipe;
