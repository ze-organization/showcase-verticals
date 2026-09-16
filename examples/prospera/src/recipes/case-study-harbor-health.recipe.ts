import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const caseStudyHarborHealthRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "case-study-harbor-health@1",
  name: "harbor-health",
  displayName: "Harbor Clinics ran payroll without a second bank",
  description:
    "Commercial case study — a regional clinic group kept deposits and payroll at Prospera.",
  template: "case-study@1",
  pageDesign: "case-study-page@1",
  itemPath: "/sitecore/content/{site}/Home/Case-Studies/harbor-health",
  fields: {
    Title: "Harbor Clinics ran payroll without a second bank",
    Eyebrow: "Healthcare",
    ShortDescription:
      "A regional clinic group needed ACH for clinicians and controlled disbursement for vendors — next to the operating account.",
    Client: "Harbor Clinics",
    Category: "Healthcare",
    Problem:
      "<p>Clinician payroll and vendor payments were splitting across two institutions. The controller could not see liquidity on Monday morning. Healthcare receivables made the cash calendar uneven.</p>",
    Solution:
      "<p>Harbor Clinics moved operating deposits and treasury to Prospera. Payroll ACH and vendor wires sit on one relationship. Reporting follows the month, not a screenshot of accounting software.</p><p>This is commercial proof on a Case Study page. Campaigns that need a fixed landing live under Business/accounting. Advice for owners sits under wealth planning.</p>",
    Image: {
      shape: "image",
      mediaPath: "/theme-photos/pdp-01.jpg",
      alt: "Person reviewing finances at a desk",
    },
    MetaTitle: "Harbor Clinics payroll — Case study — Prospera",
    MetaDescription:
      "How a regional clinic group ran payroll and vendor payments on Prospera treasury.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.6",
    ChangeFrequency: "monthly",
  },
  layout: { placeholders: {} },
} satisfies PageRecipe;

export default caseStudyHarborHealthRecipe;
