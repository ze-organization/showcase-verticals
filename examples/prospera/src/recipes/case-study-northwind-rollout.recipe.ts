import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const caseStudyNorthwindRolloutRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "case-study-northwind-rollout@1",
  name: "northwind-rollout",
  displayName: "Northline moved payroll onto treasury",
  description:
    "Commercial case study — a Midwest manufacturer moved payroll and payables to Prospera treasury.",
  template: "case-study@1",
  pageDesign: "case-study-page@1",
  itemPath: "/sitecore/content/{site}/Home/Case-Studies/northwind-rollout",
  fields: {
    Title: "Northline moved payroll onto treasury",
    Eyebrow: "Manufacturing",
    ShortDescription:
      "A Midwest fabricator consolidated payroll ACH and vendor wires with a named commercial banker — without a weekend cutover story.",
    Client: "Northline Fabrication",
    Category: "Manufacturing",
    Problem:
      "<p>Payroll, vendors, and the operating account lived in three places. Month-end meant exporting files the controller did not trust. The previous bank quoted a platform project instead of a banker.</p>",
    Solution:
      "<p>Northline opened commercial deposits and treasury at Prospera. ACH credits for payroll, wires for suppliers, and reporting a controller can reconcile now sit on one file. Julian Park is the named banker in this demonstration.</p><p>Eligibility stayed a conversation: U.S. registration, operating history, beneficial owners. Approval is never guaranteed from a web form.</p>",
    Image: {
      shape: "image",
      mediaPath: "/theme-photos/hub-02.jpg",
      alt: "Business owner and commercial banker on a factory floor",
    },
    MetaTitle: "Northline treasury — Case study — Prospera",
    MetaDescription:
      "How a Midwest manufacturer moved payroll and payables to Prospera treasury. Commercial proof, not a replatform story.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.6",
    ChangeFrequency: "monthly",
  },
  layout: { placeholders: {} },
} satisfies PageRecipe;

export default caseStudyNorthwindRolloutRecipe;
